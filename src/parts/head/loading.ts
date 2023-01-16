import {HeadComponentState, HeadInitData} from "./sharedTypes";
import {clearContext, createOffScreenContext} from "../../rendering/canvasUtil";
import {contextToImageBitmap, loadImage} from "../../rendering/imageUtil";
import {recolorBitmapByProfile} from "../../rendering/recolorUtil";

async function _loadHeadBitmap(spriteSheetUrl:string):Promise<ImageBitmap[]> {
  const image = await loadImage(spriteSheetUrl);
  const width = image.width / 3, height = image.height;
  return [
    await createImageBitmap(image, 0, 0, width, height),
    await createImageBitmap(image, width, 0, width, height),
    await createImageBitmap(image, width*2, 0, width, height),
  ];
}

export function onBoundingDimensions(componentState:any):[width:number, height:number] {
  const { headBitmap } = componentState as HeadComponentState;
  return [headBitmap.width, headBitmap.height];
}

export async function onLoad(initData:any):Promise<any> {
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
    preRenderContext.drawImage(maskContext.canvas, 0, 0);
  }
  preRenderContext.drawImage(originalHeadBitmap, 0, 0);

  const headBitmap = await contextToImageBitmap(preRenderContext);
  return { headBitmap };
}