import {RecolorProfile} from "./RecolorProfile";
import HairColor from "../faces/HairColor";

const ORIGINAL_PROFILE:RecolorProfile = {
  adjustHueDegrees:null,
  adjustSaturationPercent:null,
  adjustValuePercent:null,
  adjustContrastPercent:null,
  adjustContrastBrightnessThreshold:null
};

const INK_BLACK_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:40,
  adjustSaturationPercent:2,
  adjustValuePercent:.35,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const INK_BLACK_PROFILE:RecolorProfile = {
  adjustHueDegrees:40,
  adjustSaturationPercent:3,
  adjustValuePercent:.25,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const INK_BLACK_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:40,
  adjustSaturationPercent:2,
  adjustValuePercent:.1,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const PLATINUM_BLONDE_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:180,
  adjustSaturationPercent:1.5,
  adjustValuePercent:1,
  adjustContrastPercent:1.3,
  adjustContrastBrightnessThreshold:20
};

const PLATINUM_BLONDE_PROFILE:RecolorProfile = {
  adjustHueDegrees:175,
  adjustSaturationPercent:2,
  adjustValuePercent:1,
  adjustContrastPercent:1.1,
  adjustContrastBrightnessThreshold:20
};

const PLATINUM_BLONDE_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:175,
  adjustSaturationPercent:2.8,
  adjustValuePercent:.9,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const OCEAN_BLUE_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:0,
  adjustSaturationPercent:2.9,
  adjustValuePercent:1,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const OCEAN_BLUE_PROFILE:RecolorProfile = {
  adjustHueDegrees:0,
  adjustSaturationPercent:4.3,
  adjustValuePercent:.8,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const OCEAN_BLUE_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:-3,
  adjustSaturationPercent:6,
  adjustValuePercent:.28,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const HAZELNUT_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:153,
  adjustSaturationPercent:4,
  adjustValuePercent:.7,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const HAZELNUT_PROFILE:RecolorProfile = {
  adjustHueDegrees:149,
  adjustSaturationPercent:4.2,
  adjustValuePercent:.62,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const HAZELNUT_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:152,
  adjustSaturationPercent:4.6,
  adjustValuePercent:.45,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const GRAYISH_BROWN_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:169,
  adjustSaturationPercent:2.2,
  adjustValuePercent:.7,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const GRAYISH_BROWN_PROFILE:RecolorProfile = {
  adjustHueDegrees:167,
  adjustSaturationPercent:3,
  adjustValuePercent:.5,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const GRAYISH_BROWN_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:168,
  adjustSaturationPercent:2.6,
  adjustValuePercent:.34,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const SEA_GREEN_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:-113,
  adjustSaturationPercent:3, //3.5
  adjustValuePercent:.92, //.9 - .95
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const SEA_GREEN_PROFILE:RecolorProfile = {
  adjustHueDegrees:-98,
  adjustSaturationPercent:3.5,
  adjustValuePercent:.7,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const SEA_GREEN_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:-107,
  adjustSaturationPercent:4,
  adjustValuePercent:.4,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const CLOWN_RED_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:151,
  adjustSaturationPercent:5.2, 
  adjustValuePercent:1,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const CLOWN_RED_PROFILE:RecolorProfile = {
  adjustHueDegrees:145,
  adjustSaturationPercent:7.5, 
  adjustValuePercent:.99,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const CLOWN_RED_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:142,
  adjustSaturationPercent:8,
  adjustValuePercent:.72, //.7 - .75
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const BLOOD_ORANGE_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const BLOOD_ORANGE_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const BLOOD_ORANGE_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:150,
  adjustSaturationPercent:1,
  adjustValuePercent:.9,
  adjustContrastPercent:1.5,
  adjustContrastBrightnessThreshold:20
};

const PINK_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const PINK_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const PINK_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:150,
  adjustSaturationPercent:1,
  adjustValuePercent:.9,
  adjustContrastPercent:1.5,
  adjustContrastBrightnessThreshold:20
};

const ROYAL_PURPLE_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const ROYAL_PURPLE_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const ROYAL_PURPLE_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:150,
  adjustSaturationPercent:1,
  adjustValuePercent:.9,
  adjustContrastPercent:1.5,
  adjustContrastBrightnessThreshold:20
};

const PURPLISH_RED_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const PURPLISH_RED_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const PURPLISH_RED_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:150,
  adjustSaturationPercent:1,
  adjustValuePercent:.9,
  adjustContrastPercent:1.5,
  adjustContrastBrightnessThreshold:20
};

const SILVER_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const SILVER_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const SILVER_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:150,
  adjustSaturationPercent:1,
  adjustValuePercent:.9,
  adjustContrastPercent:1.5,
  adjustContrastBrightnessThreshold:20
};

const MUSTARD_LIGHT_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const MUSTARD_PROFILE:RecolorProfile = {
  adjustHueDegrees:140,
  adjustSaturationPercent:.7,
  adjustValuePercent:null,
  adjustContrastPercent:1,
  adjustContrastBrightnessThreshold:20
};

const MUSTARD_DARK_PROFILE:RecolorProfile = {
  adjustHueDegrees:150,
  adjustSaturationPercent:1,
  adjustValuePercent:.9,
  adjustContrastPercent:1.5,
  adjustContrastBrightnessThreshold:20
};

const _hairColorToRecolorProfile:RecolorProfile[] = [
  ORIGINAL_PROFILE,
  INK_BLACK_LIGHT_PROFILE,
  INK_BLACK_PROFILE,
  INK_BLACK_DARK_PROFILE,
  PLATINUM_BLONDE_LIGHT_PROFILE,
  PLATINUM_BLONDE_PROFILE,
  PLATINUM_BLONDE_DARK_PROFILE,
  OCEAN_BLUE_LIGHT_PROFILE,
  OCEAN_BLUE_PROFILE,
  OCEAN_BLUE_DARK_PROFILE,
  HAZELNUT_LIGHT_PROFILE,
  HAZELNUT_PROFILE,
  HAZELNUT_DARK_PROFILE,
  GRAYISH_BROWN_LIGHT_PROFILE,
  GRAYISH_BROWN_PROFILE,
  GRAYISH_BROWN_DARK_PROFILE,
  SEA_GREEN_LIGHT_PROFILE,
  SEA_GREEN_PROFILE,
  SEA_GREEN_DARK_PROFILE,
  CLOWN_RED_LIGHT_PROFILE,
  CLOWN_RED_PROFILE,
  CLOWN_RED_DARK_PROFILE,
  BLOOD_ORANGE_LIGHT_PROFILE,
  BLOOD_ORANGE_PROFILE,
  BLOOD_ORANGE_DARK_PROFILE,
  PINK_LIGHT_PROFILE,
  PINK_PROFILE,
  PINK_DARK_PROFILE,
  ROYAL_PURPLE_LIGHT_PROFILE,
  ROYAL_PURPLE_PROFILE,
  ROYAL_PURPLE_DARK_PROFILE,
  PURPLISH_RED_LIGHT_PROFILE,
  PURPLISH_RED_PROFILE,
  PURPLISH_RED_DARK_PROFILE,
  SILVER_LIGHT_PROFILE,
  SILVER_PROFILE,
  SILVER_DARK_PROFILE,
  MUSTARD_LIGHT_PROFILE,
  MUSTARD_PROFILE,
  MUSTARD_DARK_PROFILE
];

export function hairColorToRecolorProfile(hairColor:HairColor):RecolorProfile {
  if (hairColor < HairColor.ORIGINAL || hairColor >= HairColor.COUNT) throw Error('Invalid hair color.');
  return _hairColorToRecolorProfile[hairColor];
}