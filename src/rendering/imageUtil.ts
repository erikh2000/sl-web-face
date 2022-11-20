import {createCoordQueue, createCoordToProcessed, floodFill, floodFillAt} from "./floodFillUtil";

export async function loadImage(url:string):Promise<HTMLImageElement> {
  const image:HTMLImageElement = new Image();
  image.src = url;
  return new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject();
    }
  });
}

// I hate this convoluted way of performing the conversion. But at time of writing, I don't
// see a better option. I don't want to draw to a canvas, but that seems to be the main 
// way people are getting it done. I'd prefer to use an OfflineCanvas, at least, but browser
// support isn't there yet.
export function imageBitmapToImageData(sourceBitmap:ImageBitmap, preRenderContext:CanvasRenderingContext2D):ImageData {
  preRenderContext.clearRect(0, 0, sourceBitmap.width, sourceBitmap.height);
  preRenderContext.drawImage(sourceBitmap, 0, 0);
  return preRenderContext.getImageData(0, 0, sourceBitmap.width, sourceBitmap.height);
}

const OPACITY_THRESHOLD = 127;
const PIXEL_SIZE = 4;
const TRANSPARENT_ALPHA = 0;
const OPAQUE_ALPHA = 255;
const ALPHA_OFFSET = 3; 

function _getPixelOffset(width:number, x:number, y:number):number {
  return ((y*width)+x)*PIXEL_SIZE;
}

function _isPixelTransparent(width:number, x:number, y:number, sourcePixels:Uint8ClampedArray):boolean {
  const offset = _getPixelOffset(width, x, y) + ALPHA_OFFSET;
  return sourcePixels[offset] < OPACITY_THRESHOLD;
}

function _isPixelOpaque(width:number, x:number, y:number, sourcePixels:Uint8ClampedArray):boolean {
  const offset = _getPixelOffset(width, x, y) + ALPHA_OFFSET;
  return sourcePixels[offset] >= OPACITY_THRESHOLD;
}

function _isPixelFullyOpaque(width:number, x:number, y:number, sourcePixels:Uint8ClampedArray):boolean {
  const offset = _getPixelOffset(width, x, y) + ALPHA_OFFSET;
  return sourcePixels[offset] === OPAQUE_ALPHA;
}

function _createOuterPixelArray(width:number, height:number, sourcePixels:Uint8ClampedArray):boolean[][] {
  const _isPerimeterPixel = (sx:number, sy:number) => sx === 0 || sx === width-1 || sy === 0 || sy === height-1;
  
  const floodFillQueue = createCoordQueue();
  const array:boolean[][] = [];
  for(let x = 0; x < width; ++x) {
    array[x] = [];
    for(let y = 0; y < height; ++y) {
      if (_isPerimeterPixel(x,y) && _isPixelTransparent(width,  x, y, sourcePixels)) {
        floodFillQueue.push([x,y]);
      }
    }
  }
  
  function _onEval(x:number, y:number):boolean {
    if (!_isPixelTransparent(width, x, y, sourcePixels)) return false;
    array[x][y] = true;
    return true;
  }
  
  floodFill(_onEval, width, height, floodFillQueue);
  
  return array;
}

function _createPixels(width:number, height:number):Uint8ClampedArray {
  return new Uint8ClampedArray(width*height*PIXEL_SIZE);
}

export function createInnerAlphaMask(sourceImageData:ImageData):ImageData {
  const { width, height } = sourceImageData;
  if (width < 2 || height < 2) throw Error('Source bitmap too small.');
  
  const maskImagePixels:Uint8ClampedArray = _createPixels(width, height);
  const sourcePixels = sourceImageData.data;
  const isOuterPixel = _createOuterPixelArray(width, height, sourcePixels);
  
  for(let y = 0; y < height; ++y) {
    for(let x = 0; x < width; ++x) {
      const pixelAlphaOffset = _getPixelOffset(width, x, y) + ALPHA_OFFSET;
      const alpha = sourcePixels[pixelAlphaOffset];
      if (isOuterPixel[x][y]) {
        maskImagePixels[pixelAlphaOffset-2] = 255;
        maskImagePixels[pixelAlphaOffset] = OPAQUE_ALPHA;
      }
      if (alpha >= OPACITY_THRESHOLD) {
        maskImagePixels[pixelAlphaOffset] = TRANSPARENT_ALPHA;
      } else {
        if (isOuterPixel[x][y]) {
          maskImagePixels[pixelAlphaOffset] = TRANSPARENT_ALPHA;
        } else {
          maskImagePixels[pixelAlphaOffset] = OPAQUE_ALPHA;
        }
      }
    }
  }
  
  return new ImageData(maskImagePixels, width, height);
}

export enum AreaMeasurementFlags {
  DEFAULT = 0, // Centroid and pixel count will always be returned.
  DIMENSIONS = 1,
  FULLY_OPAQUE = 2 // versus "mostly opaque".
}

export type AreaMeasurements = {
  flags:number,
  centroidX:number,
  centroidY:number,
  left:number,
  top:number,
  right:number,
  bottom:number,
  width:number,
  height:number,
  pixelCount:number
}

function _findAndMeasureOpaqueArea(imagePixels:Uint8ClampedArray, width:number, height:number, x:number, y:number, 
  minPixelCount:number, processedPixels:boolean[][], measureFlags:number = AreaMeasurementFlags.DEFAULT):AreaMeasurements|null {
  
  let xSum = 0, ySum = 0, pixelCount = 0;
  let leftMost = 999999, topMost = 999999, rightMost = -1, bottomMost = -1;
  const isMeasuringDimensions = measureFlags & AreaMeasurementFlags.DIMENSIONS;
  const checkPixelFunc = measureFlags & AreaMeasurementFlags.FULLY_OPAQUE ?
    _isPixelFullyOpaque : _isPixelOpaque;
  
  function _onEval(evalX:number, evalY:number):boolean {
    if (!checkPixelFunc(width, evalX, evalY, imagePixels)) return false;
    ++pixelCount;
    xSum += evalX;
    ySum += evalY;
    if (isMeasuringDimensions) {
      if (evalX < leftMost) leftMost = evalX;
      if (evalX > rightMost) rightMost = evalX;
      if (evalY < topMost) topMost = evalY;
      if (evalY > bottomMost) bottomMost = evalY;
    }
    return true;
  }
  
  floodFillAt(_onEval, width, height, x, y, processedPixels);
  
  if (pixelCount < minPixelCount) return null;
  
  return {
    flags: measureFlags,
    centroidX:Math.round(xSum / pixelCount),
    centroidY:Math.round(ySum / pixelCount),
    left: isMeasuringDimensions ? leftMost : 0,
    top: isMeasuringDimensions ? topMost : 0,
    right: isMeasuringDimensions ? rightMost : 0,
    bottom: isMeasuringDimensions ? bottomMost : 0,
    width: isMeasuringDimensions  ? rightMost - leftMost + 1 : 0,
    height: isMeasuringDimensions  ? bottomMost - topMost + 1 : 0,
    pixelCount
  }
}

export function findAndMeasureOpaqueAreas(imageData:ImageData, minAreaCoverageFactor:number, measureFlags:number = AreaMeasurementFlags.DEFAULT):AreaMeasurements[] {
  const { width, height, data:imagePixels } = imageData;
  const minPixelCount = width * height * minAreaCoverageFactor;
  const processedPixels = createCoordToProcessed(width);
  const checkPixelFunc = measureFlags & AreaMeasurementFlags.FULLY_OPAQUE ?
    _isPixelFullyOpaque : _isPixelOpaque;
  const areas:(AreaMeasurements)[] = [];
  
  for(let y = 0; y < height; ++y) {
    for(let x = 0; x < width; ++x) {
      if (processedPixels[x][y]) continue;
      if (checkPixelFunc(width, x, y, imagePixels)) {
        const areaMeasurement = _findAndMeasureOpaqueArea(imagePixels, width, height, x, y, minPixelCount, processedPixels, measureFlags);
        if (areaMeasurement) areas.push(areaMeasurement);
      }
    }
  }
  return areas;
}
