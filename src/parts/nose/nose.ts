import { onLoad, onBoundingDimensions } from "./loading";
import { onRender, onComponentStateUpdated } from "./rendering";
import {NoseInitData} from "./sharedTypes";
import CanvasComponent from "../../canvasComponent/CanvasComponent";

export const NOSE_PART_TYPE = 'nose';

export async function loadNoseComponent(initData:NoseInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(onLoad, onRender, onBoundingDimensions, onComponentStateUpdated);
  await component.load(initData);
  return component;
}