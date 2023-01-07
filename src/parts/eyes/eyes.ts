import {
  AreaMeasurementFlags,
  AreaMeasurements, contextToImageBitmap,
  createInnerAlphaMask,
  findAndMeasureOpaqueAreas,
  imageBitmapToImageData,
  loadImage
} from "../../rendering/imageUtil";
import CanvasComponent from "../../canvasComponent/CanvasComponent";
import IrisArea from "./IrisArea";
import Emotion from "../../events/emotions";
import Topic from '../../events/topics';
import {subscribeEvent} from "../../events/thePubSub";
import {clearContext, createOffScreenContext} from "../../rendering/canvasUtil";
import LidLevel from "../../events/lidLevels";
import TweenedValue from "../../animation/TweenedValue";
import {recolorBitmapByProfile} from "../../rendering/recolorUtil";
import {RecolorProfile} from "../../rendering/RecolorProfile";
import {irisColorToRecolorProfile} from "../../rendering/irisRecolorProfiles";
import {nameToIrisColor} from "./IrisColor";

type Emotional = {
  overlayBitmap:ImageBitmap,
  innerMaskBitmap:ImageBitmap,
  leftIrisArea:IrisArea,
  rightIrisArea:IrisArea,
  lidTravelHeight:number
}

type IrisInfo = {
  irisBitmap:ImageBitmap,
  centerOffsetX:number,
  centerOffsetY:number,
  x:TweenedValue,
  y:TweenedValue
}

type EyesBitmaps = {
  emotionals:Emotional[],
  backBitmap:ImageBitmap,
  leftIris:IrisInfo,
  rightIris:IrisInfo,
  lidsBitmap:ImageBitmap
}

type BaseOffsets = {
  backOffsetX:number,
  backOffsetY:number,
  lidsOffsetX:number,
  lidsOffsetY:number
}

type EyesComponentState = EyesBitmaps & {
  currentEmotion:Emotion,
  attentionDx:number, attentionDy:number,
  restingLidLevel:LidLevel,
  lidLevel:TweenedValue,
  baseOffsets:BaseOffsets,
  preRenderContext:CanvasRenderingContext2D
}

const X_EYES = 0, CX_EYES = 256, CY_EYES = 128, X_SKIN_MASK = CX_EYES, X_HAIR_MASK = CX_EYES * 2;
const Y_EMOTION_EYES = 0;
const Y_BACK = 11*CY_EYES;
const Y_IRISES = 12*CY_EYES;
const Y_LIDS = 13*CY_EYES;
const MIN_MASK_COVERAGE_FACTOR = .01;
const MIN_IRIS_COVERAGE_FACTOR = 0;
const BLINK_DURATION = 200;
const LID_LEVEL_CHANGE_DURATION = 200;
const IRIS_MOVE_DURATION = 200;

async function _imageToOverlayBitmap(image:HTMLImageElement, emotion:Emotion):Promise<[ImageBitmap, ImageBitmap, ImageBitmap]> {
  const y = Y_EMOTION_EYES+(emotion*CY_EYES);
  return [
    await createImageBitmap(image, X_EYES, y, CX_EYES, CY_EYES),
    await createImageBitmap(image, X_SKIN_MASK, y, CX_EYES, CY_EYES),
    await createImageBitmap(image, X_HAIR_MASK, y, CX_EYES, CY_EYES)
  ];
}

async function _generateEmotionalData(image:HTMLImageElement, emotion:Emotion, maskContext:CanvasRenderingContext2D, 
    preRenderContext:CanvasRenderingContext2D, skinRecolorProfile:RecolorProfile|null, 
    hairRecolorProfile:RecolorProfile|null):Promise<Emotional> {
  const [originalBitmap, skinMaskBitmap, hairMaskBitmap] = await _imageToOverlayBitmap(image, emotion);

  let overlayBitmap:ImageBitmap|null;
  
  const isRecoloring = skinRecolorProfile !== null || hairRecolorProfile !== null;
  let skinRecoloredBitmap:ImageBitmap|null = null, hairRecoloredBitmap:ImageBitmap|null = null;

  // Perform recoloring here instead of below, so that preRenderContext can be used to
  // combine skin and hair without being affected by the recoloring use of preRenderContext.
  if (skinRecolorProfile) skinRecoloredBitmap = await recolorBitmapByProfile(originalBitmap, skinRecolorProfile, preRenderContext);
  if (hairRecolorProfile) hairRecoloredBitmap = await recolorBitmapByProfile(originalBitmap, hairRecolorProfile, preRenderContext);

  clearContext(preRenderContext);
  clearContext(maskContext);
  preRenderContext.globalCompositeOperation = 'destination-over';
  if (skinRecoloredBitmap) {
    maskContext.globalCompositeOperation = 'source-over';
    maskContext.drawImage(skinMaskBitmap, 0, 0);
    maskContext.globalCompositeOperation = 'source-in';
    maskContext.drawImage(skinRecoloredBitmap, 0, 0);
    preRenderContext.drawImage(maskContext.canvas, 0, 0);
  }
  if (hairRecoloredBitmap) {
    maskContext.globalCompositeOperation = 'source-over';
    maskContext.drawImage(hairMaskBitmap, 0, 0);
    maskContext.globalCompositeOperation = 'source-in';
    maskContext.drawImage(hairRecoloredBitmap, 0, 0);
    preRenderContext.drawImage(maskContext.canvas, 0, 0);
  }
  
  if (isRecoloring) {
    preRenderContext.drawImage(originalBitmap, 0, 0);
    overlayBitmap = await contextToImageBitmap(preRenderContext);
  } else {
    overlayBitmap = originalBitmap;
  }
  
  const overlayImageData = await imageBitmapToImageData(overlayBitmap, preRenderContext);
  
  const innerMaskImageData = createInnerAlphaMask(overlayImageData);
  const innerMaskAreas = findAndMeasureOpaqueAreas(innerMaskImageData, MIN_MASK_COVERAGE_FACTOR, AreaMeasurementFlags.FULLY_OPAQUE | AreaMeasurementFlags.DIMENSIONS);
  if (innerMaskAreas.length < 2) throw Error(`Could not find 2 iris areas for emotion #${emotion}.`);
  const irisArea1 = new IrisArea(innerMaskAreas[0].centroidX, innerMaskAreas[0].centroidY, innerMaskImageData);
  const irisArea2 = new IrisArea(innerMaskAreas[1].centroidX, innerMaskAreas[1].centroidY, innerMaskImageData);
  const isFirstLeft = (irisArea1.centerX < irisArea2.centerX);
  const leftIrisArea = isFirstLeft ? irisArea1 : irisArea2;
  const rightIrisArea = isFirstLeft ? irisArea2 : irisArea1;
  leftIrisArea.constrainToLowestCommonAngleDistances(rightIrisArea);
  const innerMaskBitmap = await createImageBitmap(innerMaskImageData);
  
  return { 
    overlayBitmap, 
    innerMaskBitmap, 
    leftIrisArea, 
    rightIrisArea,
    lidTravelHeight: Math.max(innerMaskAreas[0].height, innerMaskAreas[1].height),
  } as Emotional;
}

async function _generateEmotionals(image:HTMLImageElement, maskContext:CanvasRenderingContext2D, 
    preRenderContext:CanvasRenderingContext2D, skinRecolorProfile:RecolorProfile|null, 
    hairRecolorProfile:RecolorProfile|null):Promise<Emotional[]> {
  const promises:Promise<Emotional>[] = [];
  for(let emotionI = 0; emotionI < Emotion.COUNT; ++emotionI) {
    promises.push(_generateEmotionalData(image, emotionI, maskContext, preRenderContext, skinRecolorProfile, hairRecolorProfile));
  }
  return await Promise.all(promises);
}

async function _imageToBackBitmap(image:HTMLImageElement):Promise<ImageBitmap> {
  return createImageBitmap(image, X_EYES, Y_BACK, CX_EYES, CY_EYES);
}

async function _imageToIrisesImageData(image:HTMLImageElement, preRenderContext:CanvasRenderingContext2D, recolorProfile:RecolorProfile|null):Promise<ImageData> {
  let irisesImageBitmap = await createImageBitmap(image, X_EYES, Y_IRISES, CX_EYES, CY_EYES);
  if (recolorProfile) irisesImageBitmap = await recolorBitmapByProfile(irisesImageBitmap, recolorProfile, preRenderContext);
  return imageBitmapToImageData(irisesImageBitmap, preRenderContext);
}

async function _createIrisInfo(irisesImageData:ImageData, irisArea:AreaMeasurements):Promise<IrisInfo> {
  return {
    irisBitmap: await createImageBitmap(irisesImageData, irisArea.left, irisArea.top, irisArea.width, irisArea.height),
    centerOffsetX: irisArea.width / -2,
    centerOffsetY: irisArea.height / -2,
    x: new TweenedValue(0),
    y: new TweenedValue(0)
  }
}

async function _imageToLeftAndRightIrises(image:HTMLImageElement, preRenderContext:CanvasRenderingContext2D, irisRecolorProfile:RecolorProfile|null):Promise<IrisInfo[]> {
  const irisesImageData = await _imageToIrisesImageData(image, preRenderContext, irisRecolorProfile);
  let irisAreas = findAndMeasureOpaqueAreas(irisesImageData, MIN_IRIS_COVERAGE_FACTOR, AreaMeasurementFlags.DIMENSIONS)
  if (irisAreas.length < 2) throw Error('Could not find 2 irises in spritesheet.');
  if (irisAreas.length > 2) {
    console.warn('Irises rectangle contains more than 2 opaque areas. Will use 2 biggest.'); // Clean up the sprite sheet if you see this. Probably low-transparency pixels somewhere.
    irisAreas = irisAreas.sort((a:AreaMeasurements, b:AreaMeasurements) => a.pixelCount - b.pixelCount);
  }
  const leftIrisInfo = await _createIrisInfo(irisesImageData, irisAreas[0]);
  const rightIrisInfo = await _createIrisInfo(irisesImageData, irisAreas[1]);
  return [leftIrisInfo, rightIrisInfo];
}

async function _imageToLidsBitmap(image:HTMLImageElement, recolorProfile:RecolorProfile|null, preRenderContext:CanvasRenderingContext2D):Promise<ImageBitmap> {
  const originalBitmap = await createImageBitmap(image, X_EYES, Y_LIDS, CX_EYES, CY_EYES);
  if (!recolorProfile) return originalBitmap;

  const recoloredBitmap = await recolorBitmapByProfile(originalBitmap, recolorProfile, preRenderContext);
  const skinMaskBitmap = await createImageBitmap(image, X_SKIN_MASK, Y_LIDS, CX_EYES, CY_EYES);

  clearContext(preRenderContext);
  preRenderContext.globalCompositeOperation = 'source-over';
  preRenderContext.drawImage(skinMaskBitmap, 0, 0);
  preRenderContext.globalCompositeOperation = 'source-in';
  preRenderContext.drawImage(recoloredBitmap, 0, 0);
  preRenderContext.globalCompositeOperation = 'destination-over';
  preRenderContext.drawImage(originalBitmap, 0, 0);
  return contextToImageBitmap(preRenderContext);
}

async function _loadBitmaps(spriteSheetUrl:string, maskContext:CanvasRenderingContext2D, 
    preRenderContext:CanvasRenderingContext2D, skinRecolorProfile:RecolorProfile|null,
    hairRecolorProfile:RecolorProfile|null, irisRecolorProfile:RecolorProfile|null):Promise<EyesBitmaps> {
  const image = await loadImage(spriteSheetUrl);
  const [leftIris, rightIris] = await _imageToLeftAndRightIrises(image, preRenderContext, irisRecolorProfile);
  const lidsBitmap = await _imageToLidsBitmap(image, skinRecolorProfile, preRenderContext);
  return {
    emotionals: await _generateEmotionals(image, maskContext, preRenderContext, skinRecolorProfile, hairRecolorProfile),
    backBitmap: await _imageToBackBitmap(image),
    leftIris, rightIris,
    lidsBitmap
  } as EyesBitmaps;
}

export type EyesInitData = {
  backOffsetX?:number,
  backOffsetY?:number,
  hairRecolorProfile:RecolorProfile|null,
  irisColor:string,
  lidsOffsetX?:number,
  lidsOffsetY?:number
  skinRecolorProfile:RecolorProfile|null,
  spriteSheetUrl:string
}

function _initDataToBaseOffsets(eyesInitData:EyesInitData):BaseOffsets {
  const defZero = (value:any) => value === undefined ? 0 : value;
  const backOffsetX = defZero(eyesInitData.backOffsetX);
  const backOffsetY = defZero(eyesInitData.backOffsetY);
  const lidsOffsetX = defZero(eyesInitData.lidsOffsetX);
  const lidsOffsetY = defZero(eyesInitData.lidsOffsetY);
  return { backOffsetX, backOffsetY, lidsOffsetX, lidsOffsetY };
}

function _calcLidOpenOffsetAndUpdateState(eyesComponentState:EyesComponentState):number {
  const { currentEmotion, emotionals, lidLevel } = eyesComponentState;
  const { lidTravelHeight } = emotionals[currentEmotion];
  return -(lidTravelHeight * lidLevel.update());
}

function _calcIrisTargetAndUpdateState(eyesComponentState:EyesComponentState) {
  const {attentionDx, attentionDy, restingLidLevel, leftIris, rightIris, currentEmotion, emotionals} = eyesComponentState;
  const currentEmotional = emotionals[currentEmotion];
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

function _initIrisPositions(leftIris:IrisInfo, rightIris:IrisInfo) {
  leftIris.x.value = leftIris.x.target;
  leftIris.y.value = leftIris.y.target;
  rightIris.x.value = rightIris.x.target;
  rightIris.y.value = rightIris.y.target;
}

async function _onLoad(initData:any):Promise<any> {
  const preRenderContext = createOffScreenContext(CX_EYES, CY_EYES);
  const maskContext = createOffScreenContext(CX_EYES, CY_EYES);
  const { spriteSheetUrl, skinRecolorProfile, hairRecolorProfile, irisColor } = initData as EyesInitData;
  const irisRecolorProfile = irisColor !== undefined ? irisColorToRecolorProfile(nameToIrisColor(irisColor)) : null;
  const { emotionals, backBitmap, leftIris, rightIris, lidsBitmap } = 
    await _loadBitmaps(spriteSheetUrl, maskContext, preRenderContext, skinRecolorProfile, hairRecolorProfile, irisRecolorProfile);
  const currentEmotion = Emotion.NEUTRAL;
  const restingLidLevel = LidLevel.NORMAL;
  const attentionDx = 0, attentionDy = 0;
  
  const eyesComponentState:EyesComponentState = { 
    emotionals, backBitmap, leftIris, rightIris, lidsBitmap,
    baseOffsets: _initDataToBaseOffsets(initData),
    currentEmotion,
    attentionDx, attentionDy,
    restingLidLevel,
    lidLevel:new TweenedValue(LidLevel.NORMAL),
    preRenderContext
  };
  _calcIrisTargetAndUpdateState(eyesComponentState);
  _initIrisPositions(eyesComponentState.leftIris, eyesComponentState.rightIris);
  
  subscribeEvent(Topic.EMOTION, (event:any) => eyesComponentState.currentEmotion = event as Emotion);
  subscribeEvent(Topic.ATTENTION, (event:any) => {
    eyesComponentState.attentionDx = event.dx;
    eyesComponentState.attentionDy = event.dy;
    _calcIrisTargetAndUpdateState(eyesComponentState);
  });
  subscribeEvent(Topic.BLINK, () => {
    if ( eyesComponentState.lidLevel.isComplete) {
      eyesComponentState.lidLevel.setTarget(LidLevel.CLOSED, BLINK_DURATION/2, () => {
        eyesComponentState.lidLevel.setTarget(eyesComponentState.restingLidLevel, BLINK_DURATION/2);
      });
    }
  });
  subscribeEvent(Topic.LID_LEVEL, (event:any) => {
    const nextLidLevel = event as LidLevel;
    if (nextLidLevel === eyesComponentState.restingLidLevel) return;
    eyesComponentState.restingLidLevel = nextLidLevel;
    eyesComponentState.lidLevel.setTarget(nextLidLevel, LID_LEVEL_CHANGE_DURATION);
    _calcIrisTargetAndUpdateState(eyesComponentState);
  });
  return eyesComponentState;
}

function _drawIrisesAndUpdate(context:CanvasRenderingContext2D, leftIris:IrisInfo, rightIris:IrisInfo) {
  context.drawImage(leftIris.irisBitmap, leftIris.x.update(), leftIris.y.update());
  context.drawImage(rightIris.irisBitmap, rightIris.x.update(), rightIris.y.update());
}
  
function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  const { preRenderContext, currentEmotion, emotionals, backBitmap, lidsBitmap, baseOffsets, leftIris, rightIris  } = componentState as EyesComponentState;
  const { backOffsetX, backOffsetY, lidsOffsetX, lidsOffsetY } = baseOffsets;
  const { innerMaskBitmap, overlayBitmap } = emotionals[currentEmotion];
  
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

function _onBoundingDimensions(_componentState:any):[width:number, height:number] { return [CX_EYES, CY_EYES]; }

export const EYES_PART_TYPE = 'eyes';

export async function loadEyesComponent(initData:EyesInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender, _onBoundingDimensions);
  await component.load(initData);
  return component;
} 