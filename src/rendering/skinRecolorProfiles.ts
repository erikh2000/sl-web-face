import {RecolorProfile} from "./RecolorProfile";
import {SkinTone} from "../faces/SkinTone";

const ORIGINAL_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const PALE_WHITE_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const WHITE_PROFILE:RecolorProfile = {
  adjustHueDegrees:150,
  adjustSaturationPercent:1,
  adjustValuePercent:.9,
  adjustContrastPercent:1.5,
  adjustContrastBrightnessThreshold:20
};

const LIGHT_BROWN_PROFILE:RecolorProfile = {
  adjustHueDegrees:160,
  adjustSaturationPercent:1,
  adjustValuePercent:.8,
  adjustContrastPercent:1.8,
  adjustContrastBrightnessThreshold:20
};

const MODERATE_BROWN_PROFILE:RecolorProfile = {
  adjustHueDegrees:165,
  adjustSaturationPercent:1.2,
  adjustValuePercent:.7,
  adjustContrastPercent:3,
  adjustContrastBrightnessThreshold:20
};

const DARK_BROWN_PROFILE:RecolorProfile = {
  adjustHueDegrees:160,
  adjustSaturationPercent:1.5,
  adjustValuePercent:.6,
  adjustContrastPercent:3,
  adjustContrastBrightnessThreshold:20
};

const BLACK_PROFILE:RecolorProfile = {
  adjustHueDegrees:160,
  adjustSaturationPercent:2,
  adjustValuePercent:.55,
  adjustContrastPercent:5,
  adjustContrastBrightnessThreshold:20
};

const _skinToneToRecolorProfile:RecolorProfile[] = [
  ORIGINAL_PROFILE,
  PALE_WHITE_PROFILE,
  WHITE_PROFILE,
  LIGHT_BROWN_PROFILE,
  MODERATE_BROWN_PROFILE,
  DARK_BROWN_PROFILE,
  BLACK_PROFILE
];

export function skinToneToRecolorProfile(skinTone:SkinTone):RecolorProfile {
  if (skinTone < SkinTone.ORIGINAL || skinTone >= SkinTone.COUNT) throw Error('Invalid skin tone.');
  return _skinToneToRecolorProfile[skinTone];
}