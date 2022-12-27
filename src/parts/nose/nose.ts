import {loadImage} from "../../rendering/imageUtil";
import {recolorBitmapByProfile} from "../../rendering/recolorUtil";
import CanvasComponent from "../../canvasComponent/CanvasComponent";
import {createOffScreenContext} from "../../rendering/canvasUtil";
import {RecolorProfile} from "../../rendering/RecolorProfile";

export type NoseInitData = {
  spriteSheetUrl:string,
  recolorProfile:RecolorProfile|null
}

type NoseComponentState = {
  noseBitmap:ImageBitmap
}

async function _loadNoseBitmap(spriteSheetUrl:string):Promise<ImageBitmap> {
  const image = await loadImage(spriteSheetUrl);
  return createImageBitmap(image, 0, 0, image.width, image.height);
}

async function _onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl, recolorProfile } = initData as NoseInitData;
  let noseBitmap = await _loadNoseBitmap(spriteSheetUrl);
  if (!recolorProfile) return { noseBitmap };

  const preRenderContext = createOffScreenContext(noseBitmap.width, noseBitmap.height);
  const recoloredBitmap = await recolorBitmapByProfile(noseBitmap, recolorProfile, preRenderContext);
  return { noseBitmap:recoloredBitmap } as NoseComponentState;
}

function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  const { noseBitmap } = componentState as NoseComponentState;
  context.drawImage(noseBitmap, x, y, width, height);
}

function _onBoundingDimensions(componentState:any):[width:number, height:number] {
  const { noseBitmap } = componentState as NoseComponentState;
  return [noseBitmap.width, noseBitmap.height];
}

export const NOSE_PART_TYPE = 'nose';

export async function loadNoseComponent(initData:NoseInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender, _onBoundingDimensions);
  await component.load(initData);
  return component;
}