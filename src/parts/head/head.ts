import {contextToImageBitmap, loadImage} from "../../rendering/imageUtil";
import {recolorBitmapByProfile} from "../../rendering/recolorUtil";
import CanvasComponent from "../../canvasComponent/CanvasComponent";
import {clearContext, createOffScreenContext} from "../../rendering/canvasUtil";
import {RecolorProfile} from "../../rendering/RecolorProfile";

export type HeadInitData = {
  spriteSheetUrl:string,
  recolorProfile:RecolorProfile|null
}

type HeadComponentState = {
  headBitmap:ImageBitmap
}

async function _loadHeadBitmap(spriteSheetUrl:string):Promise<ImageBitmap[]> {
  const image = await loadImage(spriteSheetUrl);
  const width = image.width / 2, height = image.height;
  return [
    await createImageBitmap(image, 0, 0, width, height),
    await createImageBitmap(image, width, 0, width, height)
  ];
}

async function _onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl, recolorProfile } = initData as HeadInitData;
  let [originalHeadBitmap, skinMaskBitmap] = await _loadHeadBitmap(spriteSheetUrl);
  if (!recolorProfile) return { headBitmap:originalHeadBitmap };
  
  const preRenderContext = createOffScreenContext(originalHeadBitmap.width, originalHeadBitmap.height);
  const recoloredBitmap = await recolorBitmapByProfile(originalHeadBitmap, recolorProfile, preRenderContext);
  clearContext(preRenderContext);
  preRenderContext.globalCompositeOperation = 'source-over';
  preRenderContext.drawImage(skinMaskBitmap, 0, 0);
  preRenderContext.globalCompositeOperation = 'source-in';
  preRenderContext.drawImage(recoloredBitmap, 0, 0);
  preRenderContext.globalCompositeOperation = 'destination-over';
  preRenderContext.drawImage(originalHeadBitmap, 0, 0);
  const headBitmap = await contextToImageBitmap(preRenderContext);
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