import {imageBitmapToImageData} from "./imageUtil";
import {RecolorProfile} from "./RecolorProfile";

const RGB_COUNT = 3;
const ALPHA_POS = 3;
const BYTE_MATCH_SHARE = 1 / RGB_COUNT;
const PIXEL_SIZE = 4;

export function recolorPixels(rgbMatch:number[], matchTolerance:number, rgbReplace:number[], useSmoothing:boolean, pixels:Uint8ClampedArray):Uint8ClampedArray {
  const destPixels = new Uint8ClampedArray(pixels.length);
  const stopOffset = pixels.length;
  let readOffset = 0;
  while(readOffset < stopOffset) {
    let matchPercent = 0, i;
    for(i = 0; i < RGB_COUNT; ++i) {
      const diff = Math.abs(rgbMatch[i] - pixels[readOffset+i]);
      if (diff > matchTolerance) break;
      matchPercent += (matchTolerance === 0)
        ? BYTE_MATCH_SHARE
        : (1 - (diff / matchTolerance)) * BYTE_MATCH_SHARE;
    }
    if (i === RGB_COUNT) {
      for(i = 0; i < RGB_COUNT; ++i) {
        const oldColorByte = useSmoothing ? pixels[readOffset + i] * (1 - matchPercent) : 0;
        const newColorByte = useSmoothing ? rgbReplace[i] * matchPercent : rgbReplace[i];
        destPixels[readOffset + i] = oldColorByte + newColorByte;
      }
      destPixels[readOffset + ALPHA_POS] = pixels[readOffset + ALPHA_POS];
    } else {
      for(i = 0; i < PIXEL_SIZE; ++i) {
        destPixels[readOffset + i] = pixels[readOffset + i];
      }
    }
    readOffset += PIXEL_SIZE;
  }
  return destPixels;
}

export async function recolorBitmap(imageBitmap:ImageBitmap, rgbMatch:number[], matchTolerance:number, rgbReplace:number[], useSmoothing:boolean, preRenderContext:CanvasRenderingContext2D):Promise<ImageBitmap> {
  const imageData = await imageBitmapToImageData(imageBitmap, preRenderContext);
  const pixels = imageData.data;
  const destPixels = recolorPixels(rgbMatch, matchTolerance, rgbReplace, useSmoothing, pixels);
  const recoloredImageData = new ImageData(destPixels, imageBitmap.width, imageBitmap.height);
  return createImageBitmap(recoloredImageData);
}

export async function recolorBitmapByProfile(imageBitmap:ImageBitmap, recolorProfile:RecolorProfile, preRenderContext:CanvasRenderingContext2D):Promise<ImageBitmap> {
  const imageData = await imageBitmapToImageData(imageBitmap, preRenderContext);
  let pixels = imageData.data;
  recolorProfile.instructions.forEach(instruction => {
    const { rgbMatch, matchTolerance, rgbReplace, useSmoothing } = instruction;
    pixels = recolorPixels(rgbMatch, matchTolerance, rgbReplace, useSmoothing, pixels);
  });
  const recoloredImageData = new ImageData(pixels, imageBitmap.width, imageBitmap.height);
  return createImageBitmap(recoloredImageData);
}