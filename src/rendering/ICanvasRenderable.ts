export interface ICanvasRenderable {
  onRender(context:CanvasRenderingContext2D, frameCount:number):void;
}