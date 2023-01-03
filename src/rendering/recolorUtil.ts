import {adjustContrast, hsvToRgb, rgbToHsv} from  "./colorUtil";
import {hairColorToRecolorProfile} from           "./hairRecolorProfiles";
import {imageBitmapToImageData} from              "./imageUtil";
import {RecolorProfile} from                      "./RecolorProfile";
import {skinToneToRecolorProfile} from            "./skinRecolorProfiles";
import HairColor from                             "../faces/HairColor";
import {SkinTone} from                            "../faces/SkinTone";

const PIXEL_SIZE = 4;

function _recolorPixels(pixels:Uint8ClampedArray, recolorProfile:RecolorProfile):Uint8ClampedArray {
  const { adjustHueDegrees, adjustSaturationPercent, adjustValuePercent, adjustContrastPercent } = recolorProfile;
  const adjustContrastBrightnessThreshold = recolorProfile.adjustContrastBrightnessThreshold === null ? 0 : recolorProfile.adjustContrastBrightnessThreshold;
  const destPixels = new Uint8ClampedArray(pixels.length);
  const stopOffset = pixels.length;
  let readOffset = 0;
  
  while(readOffset < stopOffset) {
    destPixels[readOffset] = pixels[readOffset];
    let r = pixels[readOffset], g = pixels[readOffset + 1], b = pixels[readOffset + 2];
    let [h, s, v] = rgbToHsv(r,g,b);
    if (adjustHueDegrees !== null) h = (h + adjustHueDegrees) % 360;
    if (adjustSaturationPercent !== null) s = (s * adjustSaturationPercent) % 256;
    if (adjustValuePercent !== null) v = (v * adjustValuePercent) % 256;
    [r, g, b] = hsvToRgb(h, s, v);
    if (adjustContrastPercent !== null) [r, g, b] = adjustContrast(r, g, b, adjustContrastPercent, adjustContrastBrightnessThreshold);
    destPixels[readOffset] = r;
    destPixels[readOffset+1] = g;
    destPixels[readOffset+2] = b;
    destPixels[readOffset+3] = pixels[readOffset+3];
    readOffset += PIXEL_SIZE;
  }
  return destPixels;
}

export async function recolorBitmapByProfile(imageBitmap:ImageBitmap, recolorProfile:RecolorProfile, preRenderContext:CanvasRenderingContext2D):Promise<ImageBitmap> {
  const imageData = await imageBitmapToImageData(imageBitmap, preRenderContext);
  const originalPixels = imageData.data;
  const recoloredPixels = _recolorPixels(originalPixels, recolorProfile);
  const recoloredImageData = new ImageData(recoloredPixels, imageBitmap.width, imageBitmap.height);
  return createImageBitmap(recoloredImageData);
}

export function createRecolorProfileForSkinTone(skinTone:SkinTone):RecolorProfile|null {
  const recolorProfile = skinToneToRecolorProfile(skinTone);
  return skinTone === SkinTone.ORIGINAL ? null : recolorProfile;
}

export function createRecolorProfileForHairColor(hairColor:HairColor):RecolorProfile|null {
  const recolorProfile = hairColorToRecolorProfile(hairColor);
  return hairColor === HairColor.ORIGINAL ? null : recolorProfile;
}