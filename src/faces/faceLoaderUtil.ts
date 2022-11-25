import CanvasComponent from "../canvasComponent/CanvasComponent";
import {parse} from "yaml";
import {loadComponentFromPartUrl} from "../parts/partLoaderUtil";
import {nameToSkinTone, SkinTone} from "./SkinTone";

type Part = {
  url:string,
  offsetX:number,
  offsetY:number
}

function _parsePartValue(partValue:string):Part {
  const fields:string[] = partValue.split('@').map(field => field.trim());
  const url = fields[0];
  if (fields.length === 1) return { url, offsetX:0, offsetY:0 };
  if (fields.length !== 2) throw Error(`Unexpected "${partValue}" part value in face file.`);
  const coords = fields[1].split(',').map(field => field.trim());
  if (coords.length !== 2) throw Error(`Unexpected offset coords format "${partValue}" in face file.`);
  const offsetX = parseInt(coords[0]);
  const offsetY = parseInt(coords[1]);
  return { url, offsetX, offsetY };
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
  };
  return baseComponent;
}