import CanvasComponent from "../canvasComponent/CanvasComponent";
import {parse} from "yaml";
import {loadComponentFromPartUrl} from "../parts/partLoaderUtil";
import {nameToSkinTone, SkinTone} from "./SkinTone";
import FaceDocument from "./FaceDocument";

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
  const baseComponent = await loadComponentFromPartUrl(base.url, skinTone);
  for(let partI = 0; partI < parts.length; ++partI) {
    const part = parts[partI];
    const childComponent = await loadComponentFromPartUrl(part.url, skinTone);
    childComponent.setParent(baseComponent);
    childComponent.offsetX = part.offsetX;
    childComponent.offsetY = part.offsetY;
    if (part.width && part.height) {
      childComponent.width = part.width;
      childComponent.height = part.height;
    } 
  }
  return baseComponent;
}

export function createFaceDocument(headComponent:CanvasComponent):FaceDocument {
  const faceDocument:FaceDocument = {
    base: _componentToPartValue(headComponent),
    skinTone: headComponent.skinTone,
    parts: []
  };
  const headParts = headComponent.findNonUiChildren();
  faceDocument.parts = headParts.map(part => _componentToPartValue(part));
  return faceDocument;
}

function _findComponentByPartUrl(headComponent:CanvasComponent, partUrl:string):CanvasComponent|null {
  const children = headComponent.findNonUiChildren();
  const childCount = children.length;
  for(let childI = 0; childI < childCount; ++childI) {
    const child = children[childI];
    if (child.partUrl === partUrl) return child;
  }
  return null;
}

export function updateFaceFromDocument(headComponent:CanvasComponent, document:FaceDocument) {
  // TODO skin recoloring
  const headPart:Part = _parsePartValue(document.base);
  if (headPart.width && headPart.height) {
    headComponent.width = headPart.width;
    headComponent.height = headPart.height;
  }
  document.parts.forEach(partValue => {
    const part:Part = _parsePartValue(partValue);
    const component = _findComponentByPartUrl(headComponent, part.url);
    if (!component) return;
    component.offsetX = part.offsetX;
    component.offsetY = part.offsetY;
    if (part.width && part.height) {
      component.width = part.width;
      component.height = part.height;
    }
  });
}