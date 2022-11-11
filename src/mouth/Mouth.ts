import {loadImage} from "../common/imageUtil";
import {Viseme} from "./visemes";
import Topics from '../events/topics';
import { subscribeEvent } from "../events/thePubSub";
import CanvasComponent from "../canvasComponent/CanvasComponent";

const Y_MOUTHS = 0;
const X_MOUTHS = 1536;
const CX_MOUTH = 512;
const CY_MOUTH = 192;

async function _loadVisemeBitmaps(faceSheetUrl:string):Promise<ImageBitmap[]> {
  const image = await loadImage(faceSheetUrl);
  const bitmaps:ImageBitmap[] = [];
  for(let visemeI = 0; visemeI < Viseme.COUNT; ++visemeI) {
    bitmaps.push(await createImageBitmap(image, X_MOUTHS, Y_MOUTHS + (visemeI * CY_MOUTH), CX_MOUTH, CY_MOUTH));
  }
  return bitmaps;
}

export type MouthInitData = {
  faceSheetUrl:string
}

type MouthComponentState = {
  visemeBitmaps:ImageBitmap[];
  currentViseme:Viseme;
}

async function _onLoad(initData:any):Promise<any> {
  const mouthInitData = initData as MouthInitData;
  const mouthComponentState:MouthComponentState = {
    visemeBitmaps: await _loadVisemeBitmaps(mouthInitData.faceSheetUrl),
    currentViseme: Viseme.MBP
  };
  subscribeEvent(Topics.VISEME, (event) => mouthComponentState.currentViseme = event as Viseme);
  return mouthComponentState;
}

function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number) {
  const { visemeBitmaps, currentViseme } = componentState;
  context.drawImage(visemeBitmaps[currentViseme], x, y);
}

export async function loadMouthComponent(initData:MouthInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender);
  await component.load(initData);
  return component;
} 