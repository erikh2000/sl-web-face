
export function setPreRenderContext(canvasContext:CanvasRenderingContext2D) {
  (window as any).__thePreRenderContext = canvasContext;
}

export function thePreRenderContext():CanvasRenderingContext2D|null {
  return (window as any).__thePreRenderContext;
}