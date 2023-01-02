export enum HairColor {
  ORIGINAL,
  INK_BLACK_LIGHT,
  INK_BLACK,
  INK_BLACK_DARK,
  PLATINUM_BLONDE_LIGHT,
  PLATINUM_BLONDE,
  PLATINUM_BLONDE_DARK,
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
  CLOWN_RED_LIGHT,
  CLOWN_RED,
  CLOWN_RED_DARK,
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
  SILVER_LIGHT,
  SILVER,
  SILVER_DARK,
  MUSTARD_LIGHT,
  MUSTARD,
  MUSTARD_DARK,
  
  COUNT
}

const _hairColorToName = [
  'original',
  'inkBlackLight',
  'inkBlack',
  'inkBlackDark',
  'platinumBlondeLight',
  'platinumBlonde',
  'platinumBlondeDark',
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
  'clownRedLight',
  'clownRed',
  'clownRedDark',
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
  'silverLight',
  'silver',
  'silverDark',
  'mustardLight',
  'mustard',
  'mustardDark'
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