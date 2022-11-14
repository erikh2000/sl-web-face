import {thePreRenderContext} from "./thePreRenderContext";
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
export function imageBitmapToImageData(sourceBitmap:ImageBitmap):ImageData {
  const context = thePreRenderContext();
  if (!context) throw Error('PreRenderCanvas must be rendered into DOM first.');
  context.clearRect(0, 0, sourceBitmap.width, sourceBitmap.height);
  context.drawImage(sourceBitmap, 0, 0);
  return context.getImageData(0, 0, sourceBitmap.width, sourceBitmap.height);
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

function _findOpaqueAreaCentroid(imagePixels:Uint8ClampedArray, width:number, height:number, x:number, y:number, 
  minPixelCount:number, processedPixels:boolean[][]):number[]|null {
  
  let xSum = 0, ySum = 0, foundCount = 0;
  
  function _onEval(evalX:number, evalY:number):boolean {
    if (!_isPixelFullyOpaque(width, evalX, evalY, imagePixels)) return false;
    ++foundCount;
    xSum += evalX;
    ySum += evalY;
    return true;
  }
  
  floodFillAt(_onEval, width, height, x, y, processedPixels);
  
  if (foundCount < minPixelCount) return null;
  return [Math.round(xSum / foundCount), Math.round(ySum / foundCount)];
}

export function findOpaqueAreaCentroids(imageData:ImageData, minAreaCoverageFactor:number):(number[])[] {
  const { width, height, data:imagePixels } = imageData;
  const minPixelCount = width * height * minAreaCoverageFactor;
  const processedPixels = createCoordToProcessed(width);
  const centroids:(number[])[] = [];
  
  for(let y = 0; y < height; ++y) {
    for(let x = 0; x < width; ++x) {
      if (processedPixels[x][y]) continue;
      if (_isPixelFullyOpaque(width, x, y, imagePixels)) {
        const centroid = _findOpaqueAreaCentroid(imagePixels, width, height, x, y, minPixelCount, processedPixels);
        if (centroid) centroids.push(centroid);
      }
    }
  }
  return centroids;
}