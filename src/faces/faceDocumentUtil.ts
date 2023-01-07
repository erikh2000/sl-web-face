import CanvasComponent from "../canvasComponent/CanvasComponent";
import {
  EYES_PART_TYPE,
  HEAD_PART_TYPE,
  loadComponentFromPartUrl,
  sortHeadChildrenInDrawingOrder
} from "../parts/partLoaderUtil";
import {nameToSkinTone, SkinTone, skinToneToName} from "./SkinTone";
import FaceDocument from "./FaceDocument";
import {hairColorToName, nameToHairColor} from "./HairColor";

import {parse} from "yaml";
import IrisColor, {irisColorToName, nameToIrisColor} from "../parts/eyes/IrisColor";

type Part = {
  url:string,
  offsetX:number,
  offsetY:number,
  width?:number,
  height?:number
}

function _parsePartValue(partValue:string):Part {
  const fields:string[] = partValue.split('@').map(field => field.trim());
  const url = fields[0];
  if (fields.length === 1) return { url, offsetX:0, offsetY:0 };
  if (fields.length !== 2) throw Error(`Unexpected "${partValue}" part value in face file.`);
  const coords = fields[1].split(',').map(field => field.trim());
  if (coords.length !== 2 && coords.length !== 4) throw Error(`Unexpected offset coords format "${partValue}" in face file.`);
  const offsetX = parseInt(coords[0]);
  const offsetY = parseInt(coords[1]);
  const width = coords[2] ? parseInt(coords[2]) : undefined;
  const height = coords[3] ? parseInt(coords[3]) : undefined;
  return { url, offsetX, offsetY, width, height };
}

function _componentToPartValue(partComponent:CanvasComponent):string {
  const { partUrl, offsetX, offsetY, width, height } = partComponent;
  return `${partUrl} @${offsetX},${offsetY},${width},${height}`;
}

async function _loadFaceDefinitionFromUrl(url:string):Promise<any> {
  const response = await fetch(url);
  const text = await response.text();
  const object:any = parse(text);
  if (!object.base) throw Error('Required "base" field missing from face file.');
  object.base = _parsePartValue(object.base);
  if (!object.parts) object.parts = [];
  object.parts = object.parts.map((partValue:string) => _parsePartValue(partValue));
  if (!object.skinTone) object.skinTone = SkinTone.ORIGINAL;
  return object;
}

export async function loadFaceFromUrl(faceUrl:string):Promise<CanvasComponent> {
  const faceDefinition = await _loadFaceDefinitionFromUrl(faceUrl);
  const { base, parts } = faceDefinition;
  const skinTone = nameToSkinTone(faceDefinition.skinTone);
  const hairColor = nameToHairColor(faceDefinition.hairColor);
  const irisColor = faceDefinition.irisColor;
  const baseComponent = await loadComponentFromPartUrl(base.url, skinTone, hairColor);
  for(let partI = 0; partI < parts.length; ++partI) {
    const part = parts[partI];
    const initDataOverrides = { irisColor };
    const childComponent = await loadComponentFromPartUrl(part.url, skinTone, hairColor, initDataOverrides);
    childComponent.setParent(baseComponent);
    childComponent.offsetX = part.offsetX;
    childComponent.offsetY = part.offsetY;
    if (part.width && part.height) {
      childComponent.width = part.width;
      childComponent.height = part.height;
    } 
  }
  sortHeadChildrenInDrawingOrder(baseComponent);
  return baseComponent;
}

function _findIrisColorName(headComponent:CanvasComponent):string {
  const eyes = _findComponentByPartType(headComponent, EYES_PART_TYPE);
  const defaultIrisColor = irisColorToName(IrisColor.ORIGINAL)
  if (!eyes) return defaultIrisColor;
  const irisColor:string|undefined = eyes.initData.irisColor;
  return irisColor ?? defaultIrisColor;
}

export function createFaceDocument(headComponent:CanvasComponent):FaceDocument {
  const faceDocument:FaceDocument = {
    base: _componentToPartValue(headComponent),
    irisColor: _findIrisColorName(headComponent),
    skinTone: skinToneToName(headComponent.skinTone),
    hairColor: hairColorToName(headComponent.hairColor),
    parts: []
  };
  const headParts = headComponent.findNonUiChildren();
  faceDocument.parts = headParts.map(part => _componentToPartValue(part));
  return faceDocument;
}

function _findComponentByPartUrl(headComponent:CanvasComponent, partUrl:string):CanvasComponent|null {
  return headComponent.children.find(child => child.partUrl === partUrl) ?? null;
}

function _findComponentByPartType(headComponent:CanvasComponent, partType:string):CanvasComponent|null {
  return headComponent.children.find(child => child.partType === partType) ?? null;
}

export async function updateFaceFromDocument(headComponent:CanvasComponent, document:FaceDocument):Promise<CanvasComponent> {
  const headPart:Part = _parsePartValue(document.base);
  const documentSkinTone = nameToSkinTone(document.skinTone);
  const documentHairColor = nameToHairColor(document.hairColor);
  const documentIrisColor = document.irisColor;
  const isHairOrSkinRecoloring = documentSkinTone !== headComponent.skinTone || documentHairColor !== headComponent.hairColor;
  
  if (headComponent.partUrl !== headPart.url || isHairOrSkinRecoloring) headComponent = await loadComponentFromPartUrl(headPart.url, documentSkinTone, documentHairColor);
  if (headPart.width && headPart.height) {
    headComponent.width = headPart.width;
    headComponent.height = headPart.height;
  }
  
  const partUrls:string[] = [];
  for(let partNo = 0; partNo < document.parts.length; ++partNo) {
    const partValue = document.parts[partNo]; 
    const part:Part = _parsePartValue(partValue);
    partUrls.push(part.url);
    let component = _findComponentByPartUrl(headComponent, part.url);
    const isIrisRecoloring = component?.partType === EYES_PART_TYPE && component.initData.irisColor !== documentIrisColor;
    if (isHairOrSkinRecoloring || isIrisRecoloring || !component) {
      const initDataOverrides = isIrisRecoloring ? { irisColor:documentIrisColor } : undefined;
      const nextComponent = await loadComponentFromPartUrl(part.url, documentSkinTone, documentHairColor, initDataOverrides);
      const replaceComponent = _findComponentByPartType(headComponent, nextComponent.partType);
      if (replaceComponent) replaceComponent.setParent(null);
      if (nextComponent.partType !== HEAD_PART_TYPE) nextComponent.setParent(headComponent);
      component = nextComponent;
    }
    component.offsetX = part.offsetX;
    component.offsetY = part.offsetY;
    if (part.width && part.height) {
      component.width = part.width;
      component.height = part.height;
    }
  }

  for(let childNo = 0; childNo < headComponent.children.length; ++childNo) {
    const child = headComponent.children[childNo];
    if (child.isUi) continue;
    if (!partUrls.includes(child.partUrl)) child.setParent(null);
  }

  sortHeadChildrenInDrawingOrder(headComponent);
  
  return headComponent;
}