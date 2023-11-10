import CanvasComponent from "../canvasComponent/CanvasComponent";
import {EYES_PART_TYPE, loadEyesComponent} from "./eyes/eyes";
import HairColor, {hairColorToName} from "../faces/HairColor";
import {SkinTone, skinToneToName} from "../faces/SkinTone";
import {createRecolorProfileForHairColor, createRecolorProfileForSkinTone} from "../rendering/recolorUtil";
import {EXTRA_PART_TYPE, loadExtraComponent} from "./extra/extra";
import {HEAD_PART_TYPE, loadHeadComponent} from "./head/head";
import {loadMouthComponent, MOUTH_PART_TYPE} from "./mouth/mouth";
import {loadNoseComponent, NOSE_PART_TYPE} from "./nose/nose";

import {parse} from 'yaml';
import {
  findDrawOrderForComponentFromHead,
  sortHeadChildrenInDrawingOrder
} from "../faces/drawOrderUtil";

export { EYES_PART_TYPE, EXTRA_PART_TYPE, HEAD_PART_TYPE, MOUTH_PART_TYPE, NOSE_PART_TYPE };

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
  [NOSE_PART_TYPE]:loadNoseComponent,
  [EXTRA_PART_TYPE]:loadExtraComponent
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

function _copyComponentProperties(fromComponent:CanvasComponent, toComponent:CanvasComponent) {
  toComponent.drawOrder = fromComponent.drawOrder;
  toComponent.offsetX = fromComponent.offsetX;
  toComponent.offsetY = fromComponent.offsetY;
  toComponent.width = fromComponent.width;
  toComponent.height = fromComponent.height;
  toComponent.setParent(fromComponent.parent);
  toComponent.copyId(fromComponent);
}

export async function loadComponentFromPartUrl(partUrl:string, skinTone:SkinTone = SkinTone.ORIGINAL, hairColor:HairColor = HairColor.ORIGINAL, initDataOverrides?:any):Promise<CanvasComponent> {
  let initData = await _loadComponentInitDataFromUrl(partUrl);
  if (initDataOverrides) initData = {...initData, ...initDataOverrides};
  initData.skinTone = skinToneToName(skinTone);
  initData.skinRecolorProfile = createRecolorProfileForSkinTone(skinTone);
  initData.hairColor = hairColorToName(hairColor);
  initData.hairRecolorProfile = createRecolorProfileForHairColor(hairColor);
  initData.partUrl = partUrl;
  const { partType, spriteSheetUrl } = initData;
  if (!spriteSheetUrl) initData.spriteSheetUrl = _concatDefaultSpriteSheetUrl(partUrl);
  return _loadCanvasComponentForPartType(partType, initData);
}

export async function replaceComponentFromPartUrl(originalComponent:CanvasComponent, partUrl:string, initDataOverrides?:any):Promise<CanvasComponent> {
  const _needsNewDrawOrder = (_nextComponent:CanvasComponent) => 
    (originalComponent.partType === EXTRA_PART_TYPE && _nextComponent.initData.placeAfter !== originalComponent.initData.placeAfter);
  
  const { skinTone, hairColor } = originalComponent;
  const nextComponent = await loadComponentFromPartUrl(partUrl, skinTone, hairColor, initDataOverrides);
  if (nextComponent.partType !== originalComponent.partType) throw Error('Unexpected');
  _copyComponentProperties(originalComponent, nextComponent);
  if (nextComponent.parent?.partType === HEAD_PART_TYPE) {
    if (_needsNewDrawOrder(nextComponent)) nextComponent.drawOrder = findDrawOrderForComponentFromHead(nextComponent.parent, nextComponent);
    sortHeadChildrenInDrawingOrder(nextComponent.parent);
  }
  originalComponent.setParent(null);
  return nextComponent;
}

export async function recolorComponent(originalComponent:CanvasComponent, skinTone:SkinTone, hairColor:HairColor, initDataOverrides?:any):Promise<CanvasComponent> {
  if (originalComponent.skinTone === skinTone && originalComponent.hairColor === hairColor && !initDataOverrides) return originalComponent;
  const nextComponent = await loadComponentFromPartUrl(originalComponent.partUrl, skinTone, hairColor, initDataOverrides);
  _copyComponentProperties(originalComponent, nextComponent);
  if (nextComponent.parent?.partType === HEAD_PART_TYPE) sortHeadChildrenInDrawingOrder(nextComponent.parent);
  originalComponent.setParent(null);
  return nextComponent;
}