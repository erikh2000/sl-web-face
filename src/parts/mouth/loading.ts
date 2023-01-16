import {MouthComponentState, MouthInitData} from "./sharedTypes";
import Emotion from "../../events/emotions";
import Viseme from "../../events/visemes";
import {clearContext, createOffScreenContext} from "../../rendering/canvasUtil";
import {contextToImageBitmap, loadImage} from "../../rendering/imageUtil";
import {recolorBitmapByProfile} from "../../rendering/recolorUtil";
import {RecolorProfile} from "../../rendering/RecolorProfile";

const X_MOUTHS = 0;
const Y_VISEME_MOUTHS = 0;
const Y_EMOTION_MOUTHS = 1152;
const CX_MOUTH = 256;
const CY_MOUTH = 128;
const X_SKIN_MASK = CX_MOUTH;
const X_HAIR_MASK = CX_MOUTH * 2;

type VisemeAndEmotionBitmaps = {
  visemeBitmaps:ImageBitmap[],
  emotionBitmaps:ImageBitmap[]
}

async function _imageToMouthBitmap(image:HTMLImageElement, yMouth:number, maskContext:CanvasRenderingContext2D,
                                   preRenderContext:CanvasRenderingContext2D, skinRecolorProfile:RecolorProfile|null, hairRecolorProfile:RecolorProfile|null):Promise<ImageBitmap> {
  const originalBitmap = await createImageBitmap(image, X_MOUTHS, yMouth, CX_MOUTH, CY_MOUTH);
  const isRecoloring = skinRecolorProfile !== null || hairRecolorProfile != null;
  if (!isRecoloring) return originalBitmap;

  // Perform recoloring here instead of below, so that preRenderContext can be used to
  // combine skin and hair without being affected by the recoloring use of preRenderContext.
  let skinRecoloredBitmap:ImageBitmap|null = null;
  let hairRecoloredBitmap:ImageBitmap|null = null;
  if (skinRecolorProfile) skinRecoloredBitmap = await recolorBitmapByProfile(originalBitmap, skinRecolorProfile, preRenderContext);
  if (hairRecolorProfile) hairRecoloredBitmap = await recolorBitmapByProfile(originalBitmap, hairRecolorProfile, preRenderContext);

  clearContext(preRenderContext);
  clearContext(maskContext);

  preRenderContext.globalCompositeOperation = 'destination-over';
  if (skinRecoloredBitmap) {
    const skinMaskBitmap = await createImageBitmap(image, X_SKIN_MASK, yMouth, CX_MOUTH, CY_MOUTH);
    maskContext.globalCompositeOperation = 'source-over';
    maskContext.drawImage(skinMaskBitmap, 0, 0);
    maskContext.globalCompositeOperation = 'source-in';
    maskContext.drawImage(skinRecoloredBitmap, 0, 0);
    preRenderContext.drawImage(maskContext.canvas, 0, 0);
  }
  if (hairRecoloredBitmap) {
    const hairMaskBitmap = await createImageBitmap(image, X_HAIR_MASK, yMouth, CX_MOUTH, CY_MOUTH);
    maskContext.globalCompositeOperation = 'source-over';
    maskContext.drawImage(hairMaskBitmap, 0, 0);
    maskContext.globalCompositeOperation = 'source-in';
    maskContext.drawImage(hairRecoloredBitmap, 0, 0);
    preRenderContext.drawImage(maskContext.canvas, 0, 0);
  }

  preRenderContext.globalCompositeOperation = 'destination-over';
  preRenderContext.drawImage(originalBitmap, 0, 0);
  return contextToImageBitmap(preRenderContext);
}

async function _imageToVisemeBitmaps(image:HTMLImageElement, maskContext:CanvasRenderingContext2D,
                                     preRenderContext:CanvasRenderingContext2D, skinRecolorProfile:RecolorProfile|null,
                                     hairRecolorProfile:RecolorProfile|null):Promise<ImageBitmap[]> {
  const visemeBitmaps:ImageBitmap[] = [];
  for(let visemeI = 0; visemeI < Viseme.COUNT; ++visemeI) {
    if (visemeI === Viseme.REST) continue;
    const yMouth = Y_VISEME_MOUTHS + ((visemeI - 1) * CY_MOUTH);
    visemeBitmaps.push(
      await _imageToMouthBitmap(image, yMouth, maskContext, preRenderContext, skinRecolorProfile, hairRecolorProfile));
  }
  return visemeBitmaps;
}

async function _imageToEmotionBitmaps(image:HTMLImageElement, maskContext:CanvasRenderingContext2D,
                                      preRenderContext:CanvasRenderingContext2D,
                                      skinRecolorProfile:RecolorProfile|null,
                                      hairRecolorProfile:RecolorProfile|null):Promise<ImageBitmap[]> {
  const emotionBitmaps:ImageBitmap[] = [];
  for(let emotionI = 0; emotionI < Emotion.COUNT; ++emotionI) {
    const yMouth = Y_EMOTION_MOUTHS + (emotionI * CY_MOUTH);
    emotionBitmaps.push(
      await _imageToMouthBitmap(image, yMouth, maskContext, preRenderContext, skinRecolorProfile, hairRecolorProfile));
  }
  return emotionBitmaps;
}

async function _loadVisemeAndEmotionBitmaps(faceSheetUrl:string, skinRecolorProfile:RecolorProfile|null, hairRecolorProfile:RecolorProfile|null):Promise<VisemeAndEmotionBitmaps> {
  const image = await loadImage(faceSheetUrl);
  const preRenderContext = createOffScreenContext(CX_MOUTH, CY_MOUTH);
  const maskContext = createOffScreenContext(CX_MOUTH, CY_MOUTH);
  return {
    visemeBitmaps: await _imageToVisemeBitmaps(image, maskContext, preRenderContext, skinRecolorProfile, hairRecolorProfile),
    emotionBitmaps: await _imageToEmotionBitmaps(image, maskContext, preRenderContext, skinRecolorProfile, hairRecolorProfile)
  };
}

export function onBoundingDimensions(_componentState:any):[width:number, height:number] {
  return [CX_MOUTH, CY_MOUTH];
}

export async function onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl, skinRecolorProfile, hairRecolorProfile } = initData as MouthInitData;
  const { visemeBitmaps, emotionBitmaps } = await _loadVisemeAndEmotionBitmaps(spriteSheetUrl, skinRecolorProfile, hairRecolorProfile);
  return {
    emotionBitmaps,
    visemeBitmaps,
    emotion: Emotion.NEUTRAL,
    viseme: Viseme.REST
  } as MouthComponentState;
}