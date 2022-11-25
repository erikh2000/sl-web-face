// Based on Fitzpatrick scale: https://www.arpansa.gov.au/sites/default/files/legacy/pubs/RadiationProtection/FitzpatrickSkinType.pdf?acsf_files_redirect

export type SkinTonePalette = {
  highlight:string,
  midtone:string,
  shadow:string
}

export enum SkinTone {
  // Can be used to specify that the original colors of an asset should be used without
  // translation. This allows use of skin colors outside of the standard set described
  // above.
  ORIGINAL,
  
  // Fitzpatrick Scale values.
  PALE_WHITE,
  WHITE,
  LIGHT_BROWN,
  MODERATE_BROWN,
  DARK_BROWN,
  BLACK,
  
  COUNT
}

const _skinToneToName = [
  'original',
  'paleWhite',
  'white',
  'lightBrown',
  'moderateBrown',
  'darkBrown',
  'black'
];
export function skinToneToName(skinTone:SkinTone) {
  if (skinTone < SkinTone.ORIGINAL || skinTone >= SkinTone.COUNT) throw Error('Invalid skinTone value');
  return _skinToneToName[skinTone];
}

type NameToSkinToneMap = {
  [name: string]: SkinTone;
}

function _createNameToSkinToneMap(sourceArray:string[]):NameToSkinToneMap {
  const map:NameToSkinToneMap = {};
  for(let skinTone = SkinTone.ORIGINAL; skinTone < SkinTone.COUNT; ++skinTone) {
    map[sourceArray[skinTone]] = skinTone;
  }
  return map;
}
const _nameToSkinTone = _createNameToSkinToneMap(_skinToneToName);

export function nameToSkinTone(name:string):SkinTone {
  const match = _nameToSkinTone[name];
  if (match === undefined) throw Error('Invalid skintone name');
  return match;
}

export const skinTonePalettes:SkinTonePalette[] = [];

skinTonePalettes[SkinTone.ORIGINAL] = { 
  highlight:'#d2daf5',
  midtone: '#c5cae2',
  shadow: '#6773b3'
};

skinTonePalettes[SkinTone.PALE_WHITE] = {
  highlight:'#eeeeee',
  midtone: '#f1d4b6',
  shadow: '#333333'
};

skinTonePalettes[SkinTone.WHITE] = {
  highlight:'#eeeeee',
  midtone: '#cdad86',
  shadow: '#333333'
};

skinTonePalettes[SkinTone.LIGHT_BROWN] = {
  highlight:'#eeeeee',
  midtone: '#c39675',
  shadow: '#333333'
};

skinTonePalettes[SkinTone.MODERATE_BROWN] = {
  highlight:'#eeeeee',
  midtone: '#ad7661',
  shadow: '#333333'
};

skinTonePalettes[SkinTone.DARK_BROWN] = {
  highlight:'#eeeeee',
  midtone: '#8f5645',
  shadow: '#333333'
};

skinTonePalettes[SkinTone.BLACK] = {
  highlight:'#eeeeee',
  midtone: '#693f2f',
  shadow: '#333333'
};