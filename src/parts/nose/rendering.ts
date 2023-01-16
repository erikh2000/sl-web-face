import {NoseComponentState} from "./sharedTypes";

export function onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  const { noseBitmap } = componentState as NoseComponentState;
  context.drawImage(noseBitmap, x, y, width, height);
}

export function onComponentStateUpdated(_componentState:any, _changed:any) {}