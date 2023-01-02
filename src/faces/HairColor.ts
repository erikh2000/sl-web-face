export enum HairColor {
  ORIGINAL,
  INK_BLACK_LIGHT,
  INK_BLACK,
  INK_BLACK_DARK,
  ORANGE_BLONDE_LIGHT,
  ORANGE_BLONDE,
  ORANGE_BLOND_DARK,
  OCEAN_BLUE_LIGHT,
  OCEAN_BLUE,
  OCEAN_BLUE_DARK,
  HAZELNUT_LIGHT,
  HAZELNUT,
  HAZELNUT_DARK,
  GRAYISH_BROWN_LIGHT,
  GRAYISH_BROWN,
  GRAYISH_BROWN_DARK,
  SEA_GREEN_LIGHT,
  SEA_GREEN,
  SEA_GREEN_DARK,
  PURPLISH_BLUE_LIGHT,
  PURPLISH_BLUE,
  PURPLISH_BLUE_DARK,
  BLOOD_ORANGE_LIGHT,
  BLOOD_ORANGE,
  BLOOD_ORANGE_DARK,
  PINK_LIGHT,
  PINK,
  PINK_DARK,
  ROYAL_PURPLE_LIGHT,
  ROYAL_PURPLE,
  ROYAL_PURPLE_DARK,
  PURPLISH_RED_LIGHT,
  PURPLISH_RED,
  PURPLISH_RED_DARK,
  PASTEL_BLUE_LIGHT,
  PASTEL_BLUE,
  PASTEL_BLUE_DARK,
  
  COUNT
}

const _hairColorToName = [
  'original',
  'inkBlackLight',
  'inkBlack',
  'inkBlackDark',
  'orangeBlondeLight',
  'orangeBlonde',
  'orangeBlondeDark',
  'oceanBlueLight',
  'oceanBlue',
  'oceanBlueDark',
  'hazelnutLight',
  'hazelnut',
  'hazelnutDark',
  'grayishBrownLight',
  'grayishBrown',
  'grayishBrownDark',
  'seaGreenLight',
  'seaGreen',
  'seaGreenDark',
  'purplishBlueLight',
  'purplishBlue',
  'purplishBlueDark',
  'bloodOrangeLight',
  'bloodOrange',
  'bloodOrangeDark',
  'pinkLight',
  'pink',
  'pinkDark',
  'royalPurpleLight',
  'royalPurple',
  'royalPurpleDark',
  'purplishRedLight',
  'purplishRed',
  'purplishRedDark',
  'pastelBlueLight',
  'pastelBlue',
  'pastelBlueDark'
];

if (_hairColorToName.length !== HairColor.COUNT) throw Error('Unexpected');

export function hairColorToName(hairColor:HairColor) {
  if (hairColor < HairColor.ORIGINAL || hairColor >= HairColor.COUNT) throw Error('Invalid hairColor value');
  return _hairColorToName[hairColor];
}

type NameToHairColorMap = {
  [name: string]: HairColor;
}

function _createNameToHairColorMap(sourceArray:string[]):NameToHairColorMap {
  const map:NameToHairColorMap = {};
  for(let hairColor = HairColor.ORIGINAL; hairColor < HairColor.COUNT; ++hairColor) {
    map[sourceArray[hairColor]] = hairColor;
  }
  return map;
}
const _nameToHairColor = _createNameToHairColorMap(_hairColorToName);

export function nameToHairColor(name:string):HairColor {
  const match = _nameToHairColor[name];
  if (match === undefined) throw Error('Invalid hair color name');
  return match;
}

export default HairColor;