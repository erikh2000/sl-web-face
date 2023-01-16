import {onLoad, onBoundingDimensions} from "./loading";
import {onRender, onComponentStateUpdated} from "./rendering";
import {MouthInitData} from "./sharedTypes";
import CanvasComponent from "../../canvasComponent/CanvasComponent";

export const MOUTH_PART_TYPE = 'mouth';

export async function loadMouthComponent(initData:MouthInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(onLoad, onRender, onBoundingDimensions, onComponentStateUpdated);
  await component.load(initData);
  return component;
}