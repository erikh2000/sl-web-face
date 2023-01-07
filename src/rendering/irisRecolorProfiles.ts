import {RecolorProfile} from "./RecolorProfile";
import IrisColor from "../parts/eyes/IrisColor";

const ORIGINAL_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const LIGHT_BLUE_PROFILE:RecolorProfile = {
  adjustHueDegrees:40,
  adjustSaturationPercent:10,
  adjustValuePercent:1,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const BLUE_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const BLUE_GREY_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const LIGHT_GREY_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const GREY_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const GREEN_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const HAZEL_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const AMBER_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const LIGHT_BROWN_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const BROWN_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const DARK_BROWN_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const BLACK_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const ALBINO_RED_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const _irisColorToRecolorProfile:RecolorProfile[] = [
  ORIGINAL_PROFILE,
  LIGHT_BLUE_PROFILE,
  BLUE_PROFILE,
  BLUE_GREY_PROFILE,
  LIGHT_GREY_PROFILE,
  GREY_PROFILE,
  GREEN_PROFILE,
  HAZEL_PROFILE,
  AMBER_PROFILE,
  LIGHT_BROWN_PROFILE,
  BROWN_PROFILE,
  DARK_BROWN_PROFILE,
  BLACK_PROFILE,
  ALBINO_RED_PROFILE
];

export function irisColorToRecolorProfile(irisColor:IrisColor):RecolorProfile {
  if (irisColor < IrisColor.ORIGINAL || irisColor >= IrisColor.COUNT) throw Error('Invalid iris color.');
  return _irisColorToRecolorProfile[irisColor];
}