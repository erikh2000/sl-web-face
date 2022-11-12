import {loadImage} from "../common/imageUtil";
import CanvasComponent from "../canvasComponent/CanvasComponent";
import {Emotion} from "../events/emotions";
import Topics from '../events/topics';
import {subscribeEvent} from "../events/thePubSub";

type EyesBitmaps = {
  emotionBitmaps:ImageBitmap[],
  backBitmap:ImageBitmap,
  irisesBitmap:ImageBitmap,
  lidsBitmap:ImageBitmap
}

type EyesComponentState = EyesBitmaps & {
  currentEmotion:Emotion
}

const X_EYES = 0, CX_EYES = 256, CY_EYES = 128;
const Y_EMOTION_EYES = 0;
const Y_BACK = 11*CY_EYES;
const Y_IRISES = 12*CY_EYES;
const Y_LIDS = 13*CY_EYES;

async function _imageToEmotionBitmaps(image:HTMLImageElement):Promise<ImageBitmap[]> {
  const bitmaps:ImageBitmap[] = [];
  for(let emotionI = 0; emotionI < Emotion.COUNT; ++emotionI) {
    bitmaps.push(await createImageBitmap(image, X_EYES, Y_EMOTION_EYES+(emotionI*CY_EYES), CX_EYES, CY_EYES));
  }
  return bitmaps;
}

async function _imageToBackBitmap(image:HTMLImageElement):Promise<ImageBitmap> {
  return createImageBitmap(image, X_EYES, Y_BACK, CX_EYES, CY_EYES);
}

async function _imageToIrisesBitmap(image:HTMLImageElement):Promise<ImageBitmap> {
  return createImageBitmap(image, X_EYES, Y_IRISES, CX_EYES, CY_EYES);
}

async function _imageToLidsBitmap(image:HTMLImageElement):Promise<ImageBitmap> {
  return createImageBitmap(image, X_EYES, Y_LIDS, CX_EYES, CY_EYES);
}

async function _loadBitmaps(spriteSheetUrl:string):Promise<EyesBitmaps> {
  const image = await loadImage(spriteSheetUrl);
  return {
    emotionBitmaps: await _imageToEmotionBitmaps(image),
    backBitmap: await _imageToBackBitmap(image),
    irisesBitmap: await _imageToIrisesBitmap(image),
    lidsBitmap: await _imageToLidsBitmap(image)
  };
}

export type EyesInitData = {
  spriteSheetUrl:string
}

async function _onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl } = initData as EyesInitData;
  const { emotionBitmaps, backBitmap, irisesBitmap, lidsBitmap } = await _loadBitmaps(spriteSheetUrl);
  const eyesComponentState:EyesComponentState = { 
    emotionBitmaps, backBitmap, irisesBitmap, lidsBitmap,
    currentEmotion:Emotion.NEUTRAL
  };
  subscribeEvent(Topics.EMOTION, (event:any) => eyesComponentState.currentEmotion = event as Emotion);
  return eyesComponentState;
}

function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number) {
  const { currentEmotion, emotionBitmaps, backBitmap, irisesBitmap, lidsBitmap } = componentState;
  context.drawImage(backBitmap, x, y);
  context.drawImage(irisesBitmap, x, y);
  context.drawImage(lidsBitmap, x, y);
  context.drawImage(emotionBitmaps[currentEmotion], x, y);
}

export async function loadEyesComponent(initData:EyesInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender);
  await component.load(initData);
  return component;
} 