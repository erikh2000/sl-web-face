import {ExtraComponentState} from "./sharedTypes";

export function onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  const { extraBitmap } = componentState as ExtraComponentState;
  context.drawImage(extraBitmap, x, y, width, height);
}

export function onComponentStateUpdated(_componentState:any, _changed:any) {}