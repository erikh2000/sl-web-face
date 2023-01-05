import {contextToImageBitmap, loadImage} from "../../rendering/imageUtil";
import {recolorBitmapByProfile} from "../../rendering/recolorUtil";
import CanvasComponent from "../../canvasComponent/CanvasComponent";
import {clearContext, createOffScreenContext} from "../../rendering/canvasUtil";
import {RecolorProfile} from "../../rendering/RecolorProfile";

export type HeadInitData = {
  spriteSheetUrl:string,
  skinRecolorProfile:RecolorProfile|null,
  hairRecolorProfile:RecolorProfile|null
}

type HeadComponentState = {
  headBitmap:ImageBitmap
}

async function _loadHeadBitmap(spriteSheetUrl:string):Promise<ImageBitmap[]> {
  const image = await loadImage(spriteSheetUrl);
  const width = image.width / 3, height = image.height;
  return [
    await createImageBitmap(image, 0, 0, width, height),
    await createImageBitmap(image, width, 0, width, height),
    await createImageBitmap(image, width*2, 0, width, height),
  ];
}

async function _onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl, skinRecolorProfile, hairRecolorProfile } = initData as HeadInitData;
  let [originalHeadBitmap, skinMaskBitmap, hairMaskBitmap] = await _loadHeadBitmap(spriteSheetUrl);
  if (!hairRecolorProfile && !skinRecolorProfile) return { headBitmap:originalHeadBitmap };
  
  const maskContext = createOffScreenContext(originalHeadBitmap.width, originalHeadBitmap.height);
  const preRenderContext = createOffScreenContext(originalHeadBitmap.width, originalHeadBitmap.height);
  let skinRecoloredBitmap:ImageBitmap|null = null, hairRecoloredBitmap:ImageBitmap|null = null;
  
  // Perform recoloring here instead of below, so that preRenderContext can be used to
  // combine skin and hair without being affected by the recoloring use of preRenderContext.
  if (skinRecolorProfile) skinRecoloredBitmap = await recolorBitmapByProfile(originalHeadBitmap, skinRecolorProfile, preRenderContext);
  if (hairRecolorProfile) hairRecoloredBitmap = await recolorBitmapByProfile(originalHeadBitmap, hairRecolorProfile, preRenderContext);
  
  clearContext(preRenderContext);
  clearContext(maskContext);
  preRenderContext.globalCompositeOperation = 'destination-over';
  if (skinRecoloredBitmap) {
    maskContext.globalCompositeOperation = 'source-over';
    maskContext.drawImage(skinMaskBitmap, 0, 0);
    maskContext.globalCompositeOperation = 'source-in';
    maskContext.drawImage(skinRecoloredBitmap, 0, 0);
    preRenderContext.drawImage(maskContext.canvas, 0, 0);
  }
  if (hairRecoloredBitmap) {
    maskContext.globalCompositeOperation = 'source-over';
    maskContext.drawImage(hairMaskBitmap, 0, 0);
    maskContext.globalCompositeOperation = 'source-in';
    maskContext.drawImage(hairRecoloredBitmap, 0, 0);
    maskContext.globalCompositeOperation = 'destination-over'; // TODO---keep?
    preRenderContext.drawImage(maskContext.canvas, 0, 0);
  }
  preRenderContext.drawImage(originalHeadBitmap, 0, 0);
  
  const headBitmap = await contextToImageBitmap(preRenderContext);
  return { headBitmap };
}

function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  const { headBitmap } = componentState as HeadComponentState;
  context.drawImage(headBitmap, x, y, width, height);
}

function _onBoundingDimensions(componentState:any):[width:number, height:number] {
  const { headBitmap } = componentState as HeadComponentState;
  return [headBitmap.width, headBitmap.height];
}

export const HEAD_PART_TYPE = 'head';

export async function loadHeadComponent(initData:HeadInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender, _onBoundingDimensions);
  await component.load(initData);
  return component;
}