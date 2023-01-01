import CanvasComponent from "../canvasComponent/CanvasComponent";
import {loadEyesComponent, EYES_PART_TYPE} from "./eyes/eyes";
import {SkinTone, skinToneToName, nameToSkinTone} from "../faces/SkinTone";
import {loadHeadComponent, HEAD_PART_TYPE} from "./head/head";
import {loadMouthComponent, MOUTH_PART_TYPE} from "./mouth/mouth";
import {loadNoseComponent, NOSE_PART_TYPE} from "./nose/nose";
import {createRecolorProfileForSkinTone} from "../rendering/recolorUtil";

import {parse} from 'yaml';

export { EYES_PART_TYPE, HEAD_PART_TYPE, MOUTH_PART_TYPE, NOSE_PART_TYPE };

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
  [EYES_PART_TYPE]:loadEyesComponent,
  [HEAD_PART_TYPE]:loadHeadComponent,
  [MOUTH_PART_TYPE]:loadMouthComponent,
  [NOSE_PART_TYPE]:loadNoseComponent
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

export async function loadComponentFromPartUrl(partUrl:string, skinTone:SkinTone = SkinTone.ORIGINAL):Promise<CanvasComponent> {
  const initData = await _loadComponentInitDataFromUrl(partUrl);
  initData.skinTone = skinToneToName(skinTone);
  initData.recolorProfile = createRecolorProfileForSkinTone(skinTone, initData.skinToneOverrides);
  initData.partUrl = partUrl;
  const { partType, spriteSheetUrl } = initData;
  if (!spriteSheetUrl) initData.spriteSheetUrl = _concatDefaultSpriteSheetUrl(partUrl);
  return _loadCanvasComponentForPartType(partType, initData);
}

function _copyComponentProperties(fromComponent:CanvasComponent, toComponent:CanvasComponent) {
  toComponent.offsetX = fromComponent.offsetX;
  toComponent.offsetY = fromComponent.offsetY;
  toComponent.width = fromComponent.width;
  toComponent.height = fromComponent.height;
  toComponent.setParent(fromComponent.parent);
}

export type PartTypeToDrawOrderMap = {
  [partTypeName: string]: number;
}
const partTypeToDrawOrderMap:PartTypeToDrawOrderMap = {
  [HEAD_PART_TYPE]: 0,
  [EYES_PART_TYPE]: 100,
  [MOUTH_PART_TYPE]: 200,
  [NOSE_PART_TYPE]: 300
};

export function sortHeadChildrenInDrawingOrder(headComponent:CanvasComponent) {
  headComponent.children.sort((a:CanvasComponent, b:CanvasComponent) => partTypeToDrawOrderMap[a.partType] - partTypeToDrawOrderMap[b.partType]);
}

export async function replaceComponentFromPartUrl(originalComponent:CanvasComponent, partUrl:string):Promise<CanvasComponent> {
  const skinTone = nameToSkinTone(originalComponent.skinTone);
  const nextComponent = await loadComponentFromPartUrl(partUrl, skinTone);
  _copyComponentProperties(originalComponent, nextComponent);
  if (nextComponent.parent?.partType === HEAD_PART_TYPE) sortHeadChildrenInDrawingOrder(nextComponent.parent);
  originalComponent.setParent(null);
  return nextComponent;
}

export async function recolorComponent(originalComponent:CanvasComponent, skinTone:SkinTone):Promise<CanvasComponent> {
  const originalSkinTone = nameToSkinTone(originalComponent.skinTone);
  if (originalSkinTone === skinTone) return originalComponent;
  const nextComponent = await loadComponentFromPartUrl(originalComponent.partUrl, skinTone);
  _copyComponentProperties(originalComponent, nextComponent);
  if (nextComponent.parent?.partType === HEAD_PART_TYPE) sortHeadChildrenInDrawingOrder(nextComponent.parent);
  originalComponent.setParent(null);
  return nextComponent;
}