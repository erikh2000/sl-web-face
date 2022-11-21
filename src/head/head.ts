import {loadImage} from "../rendering/imageUtil";
import {recolorBitmapByProfile} from "../rendering/recolorUtil";
import CanvasComponent from "../canvasComponent/CanvasComponent";
import {createOffScreenContext} from "../rendering/canvasUtil";
import {RecolorProfile, NO_REPLACE, BLACK_SKIN_PROFILE} from "../rendering/RecolorProfile";

export type HeadInitData = {
  spriteSheetUrl:string
}

type HeadComponentState = {
  headBitmap:ImageBitmap
}

async function _loadHeadBitmap(spriteSheetUrl:string):Promise<ImageBitmap> {
  const image = await loadImage(spriteSheetUrl);
  const width = image.width, height = image.height;
  return createImageBitmap(image, 0, 0, width, height);
}

async function _onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl } = initData as HeadInitData;
  const originalHeadBitmap = await _loadHeadBitmap(spriteSheetUrl);
  const preRenderContext = createOffScreenContext(originalHeadBitmap.width, originalHeadBitmap.height);
  const headBitmap = await recolorBitmapByProfile(originalHeadBitmap, BLACK_SKIN_PROFILE, preRenderContext);
  return { headBitmap };
}

function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number) {
  const { headBitmap } = componentState as HeadComponentState;
  context.drawImage(headBitmap, x, y);
}

export async function loadHeadComponent(initData:HeadInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender);
  await component.load(initData);
  return component;
} 