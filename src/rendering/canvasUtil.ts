export function clearContext(context:CanvasRenderingContext2D) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

export function createOffScreenContext(width:number, height:number):CanvasRenderingContext2D {
  const offScreenCanvas:any = document.createElement('canvas');
  offScreenCanvas.width = width;
  offScreenCanvas.height = height;
  const context = offScreenCanvas.getContext('2d', {willReadFrequently:true});
  clearContext(context);
  return context;
}
