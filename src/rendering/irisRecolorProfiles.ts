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
  adjustHueDegrees:-23,
  adjustSaturationPercent:2,
  adjustValuePercent:1,
  adjustContrastPercent:2,
  adjustContrastBrightnessThreshold:20
};

const BLUE_PROFILE:RecolorProfile = {
  adjustHueDegrees:-18,
  adjustSaturationPercent:4.8,
  adjustValuePercent:1,
  adjustContrastPercent:1.4,
  adjustContrastBrightnessThreshold:20
};

const BLUE_GREY_PROFILE:RecolorProfile = {
  adjustHueDegrees:-24,
  adjustSaturationPercent:1.6,
  adjustValuePercent:.8,
  adjustContrastPercent:1.55,
  adjustContrastBrightnessThreshold:20
};

const LIGHT_GREY_PROFILE:RecolorProfile = {
  adjustHueDegrees:-55,
  adjustSaturationPercent:.3,
  adjustValuePercent:1,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const GREY_PROFILE:RecolorProfile = {
  adjustHueDegrees:-55,
  adjustSaturationPercent:.3,
  adjustValuePercent:.77,
  adjustContrastPercent:1.7,
  adjustContrastBrightnessThreshold:20
};

const GREEN_PROFILE:RecolorProfile = {
  adjustHueDegrees:-137,
  adjustSaturationPercent:3.5,
  adjustValuePercent:.82,
  adjustContrastPercent:1.5,
  adjustContrastBrightnessThreshold:20
};

const HAZEL_PROFILE:RecolorProfile = {
  adjustHueDegrees:-162,
  adjustSaturationPercent:3.6,
  adjustValuePercent:.74,
  adjustContrastPercent:1.5,
  adjustContrastBrightnessThreshold:20
};

const AMBER_PROFILE:RecolorProfile = {
  adjustHueDegrees:-196,
  adjustSaturationPercent:5.5,
  adjustValuePercent:.85,
  adjustContrastPercent:1.5,
  adjustContrastBrightnessThreshold:20
};

const LIGHT_BROWN_PROFILE:RecolorProfile = {
  adjustHueDegrees:-202,
  adjustSaturationPercent:7.3,
  adjustValuePercent:.69,
  adjustContrastPercent:1.5,
  adjustContrastBrightnessThreshold:20
};

const BROWN_PROFILE:RecolorProfile = {
  adjustHueDegrees:-205,
  adjustSaturationPercent:6.7,
  adjustValuePercent:.65,
  adjustContrastPercent:10,
  adjustContrastBrightnessThreshold:100
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
  BROWN_PROFILE
];

export function irisColorToRecolorProfile(irisColor:IrisColor):RecolorProfile {
  if (irisColor < IrisColor.ORIGINAL || irisColor >= IrisColor.COUNT) throw Error('Invalid iris color.');
  return _irisColorToRecolorProfile[irisColor];
}