const MAX_NORMALIZED_HYPOTENUSE = Math.sqrt(2);
const ANGLE_INDEX_COUNT = 20;
const DOUBLE_PI = Math.PI*2;

function _deltaToAngle(dx:number, dy:number):number {
  return Math.atan2(dy, dx); // -PI to PI
}

function _angleToIndex(angle:number):number {
  const positiveAngle = angle + Math.PI;
  return Math.round((positiveAngle / DOUBLE_PI) * ANGLE_INDEX_COUNT) % ANGLE_INDEX_COUNT;
}

function _maxDistanceForAngle(angleDistances:number[], angle:number):number {
  const index = _angleToIndex(angle);
  return angleDistances[index];
}

function _calcHypotenuse(a:number, b:number) {
  return Math.sqrt((a*a)+(b*b));
}

function _isPixelOpaque(pixels:Uint8ClampedArray, width:number, x:number, y:number) {
  const intY = Math.floor(y), intX = Math.floor(x);
  const offset = (((intY*width)+intX)*4)+3;
  return pixels[offset] === 255;
}

function _calcAngleDistances(centerX:number, centerY:number, innerMaskWidth:number, innerMaskHeight:number, innerMaskPixels:Uint8ClampedArray):number[] {
  const ANGLE_STEP = DOUBLE_PI/ANGLE_INDEX_COUNT;
  const distances:number[] = [];
  for(let angle = -Math.PI; angle < Math.PI; angle += ANGLE_STEP) {
    let x = centerX, y = centerY;
    let dx = Math.cos(angle), dy = Math.sin(angle);
    while(x < innerMaskWidth && y < innerMaskHeight) {
      if (!_isPixelOpaque(innerMaskPixels, innerMaskWidth, x, y)) break;
      x += dx; y += dy;
    }
    distances.push(_calcHypotenuse(x - centerX, y - centerY));
  }
  return distances;
}

class IrisArea {
  private _centerX:number;
  private _centerY:number;
  private _angleDistances:number[];
  
  constructor(centerX:number, centerY:number,  innerMaskImageData:ImageData) {
    this._centerX = centerX;
    this._centerY = centerY;
    this._angleDistances = _calcAngleDistances(centerX, centerY, 
      innerMaskImageData.width, innerMaskImageData.height, innerMaskImageData.data);
  }
  
  get centerX() { return this._centerX; }
  get centerY() { return this._centerY; }
  
  positionToCoords(dx:number, dy:number):number[] {
    const angle = _deltaToAngle(dx, dy);
    const normalDistance =  Math.min(_calcHypotenuse(dx, dy), MAX_NORMALIZED_HYPOTENUSE);
    const maxDistance = _maxDistanceForAngle(this._angleDistances, angle);
    const useDistance = maxDistance * normalDistance;
    const x = this._centerX + Math.cos(angle) * useDistance;
    const y = this._centerY + Math.sin(angle) * useDistance;
    return [x,y];
  }
}

export default IrisArea;