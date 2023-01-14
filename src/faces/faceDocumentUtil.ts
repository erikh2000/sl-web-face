import CanvasComponent from "../canvasComponent/CanvasComponent";
import {EYES_PART_TYPE, loadComponentFromPartUrl} from "../parts/partLoaderUtil";
import {nameToSkinTone, SkinTone, skinToneToName} from "./SkinTone";
import FaceDocument from "./FaceDocument";
import {hairColorToName, nameToHairColor} from "./HairColor";
import {createNextDrawOrders, findDrawOrderForComponent, sortHeadChildrenInDrawingOrder} from './drawOrderUtil';

import {parse} from "yaml";
import IrisColor, {irisColorToName} from "../parts/eyes/IrisColor";

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
  const headComponent = await loadComponentFromPartUrl(base.url, skinTone, hairColor);
  const nextDrawOrders = createNextDrawOrders(headComponent);
  for(let partI = 0; partI < parts.length; ++partI) {
    const part = parts[partI];
    const initDataOverrides = { irisColor };
    const childComponent = await loadComponentFromPartUrl(part.url, skinTone, hairColor, initDataOverrides);
    childComponent.setParent(headComponent);
    childComponent.offsetX = part.offsetX;
    childComponent.offsetY = part.offsetY;
    if (part.width && part.height) {
      childComponent.width = part.width;
      childComponent.height = part.height;
    } 
    childComponent.drawOrder = findDrawOrderForComponent(childComponent, nextDrawOrders);
  }
  sortHeadChildrenInDrawingOrder(headComponent);
  return headComponent;
}

function _findComponentByPartType(headComponent:CanvasComponent, partType:string):CanvasComponent|null {
  return headComponent.children.find(child => child.partType === partType) ?? null;
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
