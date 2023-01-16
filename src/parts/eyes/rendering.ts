import {EyesComponentState, IrisInfo} from "./sharedTypes";
import LidLevel from "../../events/lidLevels";
import {clearContext} from "../../rendering/canvasUtil";

export const BLINK_DURATION = 200;
export const LID_LEVEL_CHANGE_DURATION = 200;
export const IRIS_MOVE_DURATION = 200;

function _calcLidOpenOffsetAndUpdateState(eyesComponentState:EyesComponentState):number {
  const { emotion, emotionals, lidLevel } = eyesComponentState;
  const { lidTravelHeight } = emotionals[emotion];
  return -(lidTravelHeight * lidLevel.update());
}

export function calcIrisTargetAndUpdateState(eyesComponentState:EyesComponentState) {
  const {attentionTarget, restingLidLevel, leftIris, rightIris, emotion, emotionals} = eyesComponentState;
  const [attentionDx, attentionDy] = attentionTarget;
  const currentEmotional = emotionals[emotion];
  const { leftIrisArea, rightIrisArea, lidTravelHeight } = currentEmotional;
  const lidAdjustedAttentionDy = attentionDy * restingLidLevel;
  let [leftIrisX, leftIrisY] = leftIrisArea.positionToCoords(attentionDx, lidAdjustedAttentionDy);
  let [rightIrisX, rightIrisY] = rightIrisArea.positionToCoords(attentionDx, lidAdjustedAttentionDy);
  const irisOffsetY = (lidTravelHeight * (1 - restingLidLevel) / 2);
  leftIrisX += leftIris.centerOffsetX;
  leftIrisY += (irisOffsetY + leftIris.centerOffsetY);
  rightIrisX += rightIris.centerOffsetX;
  rightIrisY += (irisOffsetY + rightIris.centerOffsetY);
  leftIris.x.setTarget(leftIrisX, IRIS_MOVE_DURATION);
  leftIris.y.setTarget(leftIrisY, IRIS_MOVE_DURATION);
  rightIris.x.setTarget(rightIrisX, IRIS_MOVE_DURATION);
  rightIris.y.setTarget(rightIrisY, IRIS_MOVE_DURATION);
}

export function onComponentStateUpdated(componentState:any, changes:any) {
  const { attentionTarget, lastBlinkTime, restingLidLevel } = changes;
  const eyesComponentState = componentState as EyesComponentState;
  if (attentionTarget) { calcIrisTargetAndUpdateState(eyesComponentState) }
  if (lastBlinkTime) {
    if (eyesComponentState.lidLevel.isComplete) {
      eyesComponentState.lidLevel.setTarget(LidLevel.CLOSED, BLINK_DURATION/2, () => {
        eyesComponentState.lidLevel.setTarget(eyesComponentState.restingLidLevel, BLINK_DURATION/2);
      });
    }
  }
  if (restingLidLevel) {
    eyesComponentState.restingLidLevel = restingLidLevel;
    eyesComponentState.lidLevel.setTarget(restingLidLevel, LID_LEVEL_CHANGE_DURATION);
    calcIrisTargetAndUpdateState(eyesComponentState);
  }
}

function _drawIrisesAndUpdate(context:CanvasRenderingContext2D, leftIris:IrisInfo, rightIris:IrisInfo) {
  context.drawImage(leftIris.irisBitmap, leftIris.x.update(), leftIris.y.update());
  context.drawImage(rightIris.irisBitmap, rightIris.x.update(), rightIris.y.update());
}

export function onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  const { preRenderContext, emotion, emotionals, backBitmap, lidsBitmap, baseOffsets, leftIris, rightIris  } = componentState as EyesComponentState;
  const { backOffsetX, backOffsetY, lidsOffsetX, lidsOffsetY } = baseOffsets;
  const { innerMaskBitmap, overlayBitmap } = emotionals[emotion];

  const lidsOpenOffset = _calcLidOpenOffsetAndUpdateState(componentState);

  clearContext(preRenderContext);
  preRenderContext.save();
  preRenderContext.globalCompositeOperation = 'source-over';
  preRenderContext.drawImage(innerMaskBitmap, 0, 0);
  preRenderContext.globalCompositeOperation = 'source-atop';
  preRenderContext.drawImage(backBitmap, backOffsetX, backOffsetY);
  _drawIrisesAndUpdate(preRenderContext, leftIris, rightIris);
  preRenderContext.drawImage(lidsBitmap, lidsOffsetX, lidsOffsetY + lidsOpenOffset);
  preRenderContext.restore();
  context.drawImage(preRenderContext.canvas, x, y, width, height);
  context.drawImage(overlayBitmap, x, y, width, height);
}