import {imageBitmapToImageData} from "./imageUtil";
import {NO_REPLACE, RecolorInstruction, RecolorProfile} from "./RecolorProfile";

const RGB_COUNT = 3;
const ALPHA_POS = 3;
const BYTE_MATCH_SHARE = 1 / RGB_COUNT;
const PIXEL_SIZE = 4;

//TODO delete
export function recolorPixelsOld(rgbMatch:number[], matchTolerance:number, rgbReplace:number[], useSmoothing:boolean, pixels:Uint8ClampedArray):Uint8ClampedArray {
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

function _findInstructionMatch(instructions:RecolorInstruction[], pixels:Uint8ClampedArray, readOffset:number):[RecolorInstruction|null,number] {
  let bestInstruction:RecolorInstruction|null = null, bestMatchPercent = -1;
  instructions.forEach(instruction => {
    const { rgbMatch, matchTolerance } = instruction;
    let matchPercent = 0, i;
    for (i = 0; i < RGB_COUNT; ++i) {
      const diff = Math.abs(pixels[readOffset + i] - rgbMatch[i]);
      if (diff > matchTolerance) break;
      matchPercent += (matchTolerance === 0)
        ? BYTE_MATCH_SHARE
        : (1 - (diff / matchTolerance)) * BYTE_MATCH_SHARE;
    }
    if (i == RGB_COUNT) {
      if (matchPercent > bestMatchPercent) {
        bestInstruction = instruction;
        bestMatchPercent = matchPercent;
      }
    }
  });
  return [bestInstruction, bestMatchPercent]
}

function _recolorPixels(instructions:RecolorInstruction[], pixels:Uint8ClampedArray):Uint8ClampedArray {
  const destPixels = new Uint8ClampedArray(pixels.length);
  const stopOffset = pixels.length;
  let readOffset = 0;
  while(readOffset < stopOffset) {
    const [instruction, matchPercent] = _findInstructionMatch(instructions, pixels, readOffset);
    if (instruction && instruction.rgbReplace !== NO_REPLACE) {
      const { useSmoothing, rgbReplace } = instruction;
      for(let i = 0; i < RGB_COUNT; ++i) {
        const oldColorByte = useSmoothing ? pixels[readOffset + i] * (1 - matchPercent) : 0;
        const newColorByte = useSmoothing ? rgbReplace[i] * matchPercent : rgbReplace[i];
        destPixels[readOffset + i] = oldColorByte + newColorByte;
      }
      destPixels[readOffset + ALPHA_POS] = pixels[readOffset + ALPHA_POS];
    } else {
      for(let i = 0; i < PIXEL_SIZE; ++i) {
        destPixels[readOffset + i] = pixels[readOffset + i];
      }
    }
    readOffset += PIXEL_SIZE;
  }
  return destPixels;
}

export async function recolorBitmapByProfile(imageBitmap:ImageBitmap, recolorProfile:RecolorProfile, preRenderContext:CanvasRenderingContext2D):Promise<ImageBitmap> {
  const imageData = await imageBitmapToImageData(imageBitmap, preRenderContext);
  const originalPixels = imageData.data;
  const recoloredPixels = _recolorPixels(recolorProfile.instructions, originalPixels);
  const recoloredImageData = new ImageData(recoloredPixels, imageBitmap.width, imageBitmap.height);
  return createImageBitmap(recoloredImageData);
}