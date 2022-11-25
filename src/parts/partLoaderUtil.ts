import {parse} from 'yaml';
import CanvasComponent from "../canvasComponent/CanvasComponent";
import {loadEyesComponent} from "./eyes/eyes";
import {loadHeadComponent} from "./head/head";
import {loadMouthComponent} from "./mouth/mouth";
import {SkinTone} from "../faces/SkinTone";
import {createRecolorProfileForSkinTone} from "../rendering/recolorUtil";

async function _loadComponentInitDataFromUrl(url:string):Promise<any> {
  const response = await fetch(url);
  const text = await response.text();
  const object:any = parse(text);
  if (!object.partType || !object.partType.length) throw Error('Required "partType" field missing from parts file.');
  return object;
}

type PartTypeToLoaderFuncMap = {
  [partType: string]: (initData:any) => Promise<CanvasComponent>;
}

const partTypeToLoaderFunc:PartTypeToLoaderFuncMap = {
  'eyes':loadEyesComponent,
  'head':loadHeadComponent,
  'mouth':loadMouthComponent
};

async function _loadCanvasComponentForPartType(partType:string, initData:any):Promise<CanvasComponent> {
  const loaderFunc = partTypeToLoaderFunc[partType];
  if (!loaderFunc) throw Error(`"${partType} part type is not recognized.`);
  return loaderFunc(initData);
}

function _concatDefaultSpriteSheetUrl(partUrl:string) {
  const extensionPos = partUrl.lastIndexOf('.');
  const baseUrl = extensionPos === -1 ? partUrl : partUrl.substring(0, extensionPos);
  return `${baseUrl}.png`;
}

export async function loadComponentFromPartUrl(partUrl:string, skinTone:SkinTone):Promise<CanvasComponent> {
  const initData = await _loadComponentInitDataFromUrl(partUrl);
  initData.recolorProfile = createRecolorProfileForSkinTone(skinTone, initData.skinToneOverrides);
  const { partType, spriteSheetUrl } = initData;
  if (!spriteSheetUrl) initData.spriteSheetUrl = _concatDefaultSpriteSheetUrl(partUrl);
  return _loadCanvasComponentForPartType(partType, initData);
}