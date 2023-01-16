import {MouthComponentState} from "./sharedTypes";
import Viseme from "../../events/visemes";

function _mouthComponentStateToBitmap(mouthComponentState:MouthComponentState) {
  const { emotionBitmaps, visemeBitmaps, emotion, viseme } = mouthComponentState;
  return viseme === Viseme.REST ? emotionBitmaps[emotion] : visemeBitmaps[viseme-1];
}

export function onComponentStateUpdated(_componentState:any, _changes:any) {}

export function onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  const bitmap = _mouthComponentStateToBitmap(componentState);
  context.drawImage(bitmap, x, y, width, height);
}