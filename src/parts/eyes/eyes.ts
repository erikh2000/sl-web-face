import {onLoad, onBoundingDimensions} from "./loading";
import {onComponentStateUpdated, onRender} from "./rendering";
import {EyesInitData} from "./sharedTypes";
import CanvasComponent from "../../canvasComponent/CanvasComponent";

export const EYES_PART_TYPE = 'eyes';

export async function loadEyesComponent(initData:EyesInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(onLoad, onRender, onBoundingDimensions, onComponentStateUpdated);
  await component.load(initData);
  return component;
}