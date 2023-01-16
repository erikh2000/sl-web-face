import { onLoad, onBoundingDimensions } from "./loading";
import { onRender, onComponentStateUpdated } from "./rendering";
import {ExtraInitData} from "./sharedTypes";
import CanvasComponent from "../../canvasComponent/CanvasComponent";

export const EXTRA_PART_TYPE = 'extra';

export async function loadExtraComponent(initData:ExtraInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(onLoad, onRender, onBoundingDimensions, onComponentStateUpdated);
  await component.load(initData);
  return component;
}