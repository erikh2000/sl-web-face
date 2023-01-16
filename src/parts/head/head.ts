import { onLoad, onBoundingDimensions } from "./loading";
import { onRender, onComponentStateUpdated } from "./rendering";
import {HeadInitData} from "./sharedTypes";
import CanvasComponent from "../../canvasComponent/CanvasComponent";

export const HEAD_PART_TYPE = 'head';

export async function loadHeadComponent(initData:HeadInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(onLoad, onRender, onBoundingDimensions, onComponentStateUpdated);
  await component.load(initData);
  return component;
}