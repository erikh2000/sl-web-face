import {HeadComponentState} from "./sharedTypes";

export function onComponentStateUpdated(_componentState:any, _changed:any) {}

export function onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  const { headBitmap } = componentState as HeadComponentState;
  context.drawImage(headBitmap, x, y, width, height);
}