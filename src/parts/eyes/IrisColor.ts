export enum IrisColor {
  ORIGINAL,
  
  LIGHT_BLUE,
  BLUE,
  BLUE_GREY,
  LIGHT_GREY,
  GREY,
  GREEN,
  HAZEL,
  AMBER,
  LIGHT_BROWN,
  BROWN,
  DARK_BROWN,
  BLACK,
  ALBINO_RED,
  
  COUNT
}

const _irisColorToName = [
  'original',
  'lightBlue',
  'blue',
  'blueGrey',
  'lightGrey',
  'grey',
  'green',
  'hazel',
  'amber',
  'lightBrown',
  'brown',
  'darkBrown',
  'black',
  'albinoRed'
];

export function irisColorToName(irisColor:IrisColor):string {
  if (irisColor < IrisColor.ORIGINAL || irisColor >= IrisColor.COUNT) throw Error(`Invalid iris color value - ${irisColor}`);
  return _irisColorToName[irisColor];
}

type NameToIrisColorMap = {
  [name: string]: IrisColor;
}

function _createNameToIrisColorMap(sourceArray:string[]):NameToIrisColorMap {
  const map:NameToIrisColorMap = {};
  for(let irisColor = IrisColor.ORIGINAL; irisColor < IrisColor.COUNT; ++irisColor) {
    map[sourceArray[irisColor]] = irisColor;
  }
  return map;
}
const _nameToIrisColor = _createNameToIrisColorMap(_irisColorToName);

export function nameToIrisColor(name:string):IrisColor {
  const match = _nameToIrisColor[name];
  if (match === undefined) throw Error(`Invalid iris color name - "${name}"`);
  return match;
}

export default IrisColor;