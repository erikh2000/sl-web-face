import {contextToImageBitmap, loadImage} from "../../rendering/imageUtil";
import Emotion from "../../events/emotions";
import Viseme from "../../events/visemes";
import Topic from '../../events/topics';
import {subscribeEvent} from "../../events/thePubSub";
import CanvasComponent from "../../canvasComponent/CanvasComponent";
import {clearContext, createOffScreenContext} from "../../rendering/canvasUtil";
import {recolorBitmapByProfile} from "../../rendering/recolorUtil";
import {RecolorProfile} from "../../rendering/RecolorProfile";

const X_MOUTHS = 0;
const Y_VISEME_MOUTHS = 0;
const Y_EMOTION_MOUTHS = 1152;
const CX_MOUTH = 256;
const CY_MOUTH = 128;
const X_SKIN_MASK = CX_MOUTH;

type VisemeAndEmotionBitmaps = {
  visemeBitmaps:ImageBitmap[],
  emotionBitmaps:ImageBitmap[]
}

async function _imageToMouthBitmap(image:HTMLImageElement, yMouth:number, preRenderContext:CanvasRenderingContext2D, recolorProfile:RecolorProfile|null):Promise<ImageBitmap> {
  const originalBitmap = await createImageBitmap(image, X_MOUTHS, yMouth, CX_MOUTH, CY_MOUTH);
  if (!recolorProfile) return originalBitmap;
  const recoloredBitmap = await recolorBitmapByProfile(originalBitmap, recolorProfile, preRenderContext);
  const skinMaskBitmap = await createImageBitmap(image, X_SKIN_MASK, yMouth, CX_MOUTH, CY_MOUTH);
  clearContext(preRenderContext);
  preRenderContext.globalCompositeOperation = 'source-over';
  preRenderContext.drawImage(skinMaskBitmap, 0, 0);
  preRenderContext.globalCompositeOperation = 'source-in';
  preRenderContext.drawImage(recoloredBitmap, 0, 0);
  preRenderContext.globalCompositeOperation = 'destination-over';
  preRenderContext.drawImage(originalBitmap, 0, 0);
  return contextToImageBitmap(preRenderContext);
}

async function _imageToVisemeBitmaps(image:HTMLImageElement, preRenderContext:CanvasRenderingContext2D, recolorProfile:RecolorProfile|null):Promise<ImageBitmap[]> {
  const visemeBitmaps:ImageBitmap[] = [];
  for(let visemeI = 0; visemeI < Viseme.COUNT; ++visemeI) {
    if (visemeI === Viseme.REST) continue;
    const yMouth = Y_VISEME_MOUTHS + ((visemeI - 1) * CY_MOUTH);
    visemeBitmaps.push(await _imageToMouthBitmap(image, yMouth, preRenderContext, recolorProfile));
  }
  return visemeBitmaps;
}

async function _imageToEmotionBitmaps(image:HTMLImageElement, preRenderContext:CanvasRenderingContext2D, recolorProfile:RecolorProfile|null):Promise<ImageBitmap[]> {
  const emotionBitmaps:ImageBitmap[] = [];
  for(let emotionI = 0; emotionI < Emotion.COUNT; ++emotionI) {
    const yMouth = Y_EMOTION_MOUTHS + (emotionI * CY_MOUTH);
    emotionBitmaps.push(await _imageToMouthBitmap(image, yMouth, preRenderContext, recolorProfile));
  }
  return emotionBitmaps;
}

async function _loadVisemeAndEmotionBitmaps(faceSheetUrl:string, recolorProfile:RecolorProfile|null):Promise<VisemeAndEmotionBitmaps> {
  const image = await loadImage(faceSheetUrl);
  const preRenderContext = createOffScreenContext(CX_MOUTH, CY_MOUTH);
  return {
    visemeBitmaps: await _imageToVisemeBitmaps(image, preRenderContext, recolorProfile),
    emotionBitmaps: await _imageToEmotionBitmaps(image, preRenderContext, recolorProfile)
  };
}

export type MouthInitData = {
  spriteSheetUrl:string,
  recolorProfile:RecolorProfile|null
}

type MouthComponentState = {
  visemeBitmaps:ImageBitmap[];
  emotionBitmaps:ImageBitmap[];
  currentViseme:Viseme;
  currentEmotion:Emotion;
}

async function _onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl, recolorProfile } = initData as MouthInitData;
  const { visemeBitmaps, emotionBitmaps } = await _loadVisemeAndEmotionBitmaps(spriteSheetUrl, recolorProfile);
  const mouthComponentState:MouthComponentState = {
    emotionBitmaps,
    visemeBitmaps, 
    currentEmotion: Emotion.NEUTRAL,
    currentViseme: Viseme.REST
  };
  subscribeEvent(Topic.VISEME, (event) => mouthComponentState.currentViseme = event as Viseme);
  subscribeEvent(Topic.EMOTION, (event) => mouthComponentState.currentEmotion = event as Emotion);
  return mouthComponentState;
}

function _mouthComponentStateToBitmap(mouthComponentState:MouthComponentState) {
  const { emotionBitmaps, visemeBitmaps, currentEmotion, currentViseme } = mouthComponentState;
  return currentViseme === Viseme.REST ? emotionBitmaps[currentEmotion] : visemeBitmaps[currentViseme-1];
} 

function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number) {
  const bitmap = _mouthComponentStateToBitmap(componentState);
  context.drawImage(bitmap, x, y);
}

export async function loadMouthComponent(initData:MouthInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender);
  await component.load(initData);
  return component;
} 