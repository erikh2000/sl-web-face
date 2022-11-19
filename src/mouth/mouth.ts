import {loadImage} from "../rendering/imageUtil";
import {Emotion} from "../events/emotions";
import {Viseme} from "../events/visemes";
import Topics from '../events/topics';
import {subscribeEvent} from "../events/thePubSub";
import CanvasComponent from "../canvasComponent/CanvasComponent";

const Y_VISEME_MOUTHS = 0;
const X_VISEME_MOUTHS = 0;
const Y_EMOTION_MOUTHS = 1152;
const X_EMOTION_MOUTHS = 0;
const CX_MOUTH = 256;
const CY_MOUTH = 128;

type VisemeAndEmotionBitmaps = {
  visemeBitmaps:ImageBitmap[],
  emotionBitmaps:ImageBitmap[]
}

async function _imageToVisemeBitmaps(image:HTMLImageElement):Promise<ImageBitmap[]> {
  const visemeBitmaps:ImageBitmap[] = [];
  for(let visemeI = 0; visemeI < Viseme.COUNT; ++visemeI) {
    if (visemeI === Viseme.REST) continue;
    visemeBitmaps.push(await createImageBitmap(image, X_VISEME_MOUTHS, 
      Y_VISEME_MOUTHS + ((visemeI - 1) * CY_MOUTH), CX_MOUTH, CY_MOUTH));
  }
  return visemeBitmaps;
}

async function _imageToEmotionBitmaps(image:HTMLImageElement):Promise<ImageBitmap[]> {
  const emotionBitmaps:ImageBitmap[] = [];
  for(let emotionI = 0; emotionI < Emotion.COUNT; ++emotionI) {
    emotionBitmaps.push(await createImageBitmap(image, X_EMOTION_MOUTHS, 
      Y_EMOTION_MOUTHS + (emotionI * CY_MOUTH), CX_MOUTH, CY_MOUTH));
  }
  return emotionBitmaps;
}

async function _loadVisemeAndEmotionBitmaps(faceSheetUrl:string):Promise<VisemeAndEmotionBitmaps> {
  const image = await loadImage(faceSheetUrl);
  return {
    visemeBitmaps: await _imageToVisemeBitmaps(image),
    emotionBitmaps: await _imageToEmotionBitmaps(image)
  };
}

export type MouthInitData = {
  spriteSheetUrl:string
}

type MouthComponentState = {
  visemeBitmaps:ImageBitmap[];
  emotionBitmaps:ImageBitmap[];
  currentViseme:Viseme;
  currentEmotion:Emotion;
}

async function _onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl } = initData as MouthInitData;
  const { visemeBitmaps, emotionBitmaps } = await _loadVisemeAndEmotionBitmaps(spriteSheetUrl);
  const mouthComponentState:MouthComponentState = {
    emotionBitmaps,
    visemeBitmaps, 
    currentEmotion: Emotion.NEUTRAL,
    currentViseme: Viseme.REST
  };
  subscribeEvent(Topics.VISEME, (event) => mouthComponentState.currentViseme = event as Viseme);
  subscribeEvent(Topics.EMOTION, (event) => mouthComponentState.currentEmotion = event as Emotion);
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