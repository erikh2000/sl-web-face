
interface IEvalCallback {
  (x:number, y:number):boolean
}

export function createCoordQueue():(number[])[] { return []; }

export function createCoordToProcessed(width:number):boolean[][] {
  const array = [];
  for(let x = 0; x < width; ++x) {
    array[x] = [];
  }
  return array;
}

export function floodFill(onEval:IEvalCallback, width:number, height:number, coordQueue:(number[])[], coordToProcessed?:boolean[][]) {
  if (!coordToProcessed) coordToProcessed = createCoordToProcessed(width);
  
  while(coordQueue.length) {
    const coords = coordQueue.pop();
    const [x,y] = coords as number[]; // TSC wants me to handle undefined value, but that will never be generated.
    if (coordToProcessed[x][y]) continue;
    coordToProcessed[x][y] = true;
    if (onEval(x,y)) {
      if (x > 0 && !coordToProcessed[x-1][y]) coordQueue.push([x-1,y]);
      if (x < width-1 && !coordToProcessed[x+1][y]) coordQueue.push([x+1,y]);
      if (y > 0 && !coordToProcessed[x][y-1]) coordQueue.push([x,y-1]);
      if (y < height-1 && !coordToProcessed[x][y+1]) coordQueue.push([x,y+1]);
    }
  }
}

export function floodFillAt(onEval:IEvalCallback, width:number, height:number, x:number, y:number, coordsToProcessed?:boolean[][]) {
  const coordQueue = createCoordQueue();
  coordQueue.push([x,y]);
  return floodFill(onEval, width, height, coordQueue, coordsToProcessed);
}