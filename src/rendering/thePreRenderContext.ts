
export function setPreRenderContext(canvasContext:CanvasRenderingContext2D) {
  (window as any).__thePreRenderContext = canvasContext;
}

function _createOffScreenCanvas(width:number, height:number):CanvasRenderingContext2D {
  const offScreenCanvas:any = document.createElement('canvas');
  offScreenCanvas.width = width;
  offScreenCanvas.height = height;
  const context = offScreenCanvas.getContext('2d', {willReadFrequently:true});
  context.clearRect(0, 0, width, height);
  return context;
}

export function createThePreRenderContext(width:number, height:number) {
  (window as any).__thePreRenderContext = _createOffScreenCanvas(width, height);
}

export function thePreRenderContext():CanvasRenderingContext2D|null {
  const context = (window as any).__thePreRenderContext;
  if (context) context.clearRect(0, 0, context.width, context.height);
  return context;
}