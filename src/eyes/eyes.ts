import {createInnerAlphaMask, findOpaqueAreaCentroids, imageBitmapToImageData, loadImage} from "../common/imageUtil";
import CanvasComponent from "../canvasComponent/CanvasComponent";
import IrisArea from "./IrisArea";
import {Emotion} from "../events/emotions";
import Topics from '../events/topics';
import {subscribeEvent} from "../events/thePubSub";
import {thePreRenderContext} from "../common/thePreRenderContext";

type Emotional = {
  overlayBitmap:ImageBitmap,
  innerMaskBitmap:ImageBitmap,
  leftIrisArea:IrisArea,
  rightIrisArea:IrisArea
}

type EyesBitmaps = {
  emotionals:Emotional[],
  backBitmap:ImageBitmap,
  irisesBitmap:ImageBitmap,
  lidsBitmap:ImageBitmap
}

type BaseOffsets = {
  backOffsetX:number,
  backOffsetY:number,
  irisesOffsetX:number,
  irisesOffsetY:number,
  lidsOffsetX:number,
  lidsOffsetY:number
}

type EyesComponentState = EyesBitmaps & {
  currentEmotion:Emotion,
  baseOffsets:BaseOffsets
}

const X_EYES = 0, CX_EYES = 256, CY_EYES = 128;
const Y_EMOTION_EYES = 0;
const Y_BACK = 11*CY_EYES;
const Y_IRISES = 12*CY_EYES;
const Y_LIDS = 13*CY_EYES;
const MIN_IRIS_AREA_COVERAGE_FACTOR = .01;

async function _imageToOverlayBitmap(image:HTMLImageElement, emotion:Emotion):Promise<ImageBitmap> {
  return createImageBitmap(image, X_EYES, Y_EMOTION_EYES+(emotion*CY_EYES), CX_EYES, CY_EYES);
}

async function _generateEmotionalData(image:HTMLImageElement, emotion:Emotion):Promise<Emotional> {
  const overlayBitmap = await _imageToOverlayBitmap(image, emotion);
  const overlayImageData = await imageBitmapToImageData(overlayBitmap);
  const innerMaskImageData = createInnerAlphaMask(overlayImageData);
  const innerMaskCentroids = findOpaqueAreaCentroids(innerMaskImageData, MIN_IRIS_AREA_COVERAGE_FACTOR);
  if (innerMaskCentroids.length < 2) throw Error(`Could not find 2 iris areas for emotion #${emotion}.`);
  const leftCentroid = innerMaskCentroids[0], rightCentroid = innerMaskCentroids[1];
  const irisArea1 = new IrisArea(leftCentroid[0], leftCentroid[1], innerMaskImageData);
  const irisArea2 = new IrisArea(rightCentroid[0], rightCentroid[1], innerMaskImageData);
  const isFirstLeft = (irisArea1.centerX < irisArea2.centerX);
  const leftIrisArea = isFirstLeft ? irisArea1 : irisArea2;
  const rightIrisArea = isFirstLeft ? irisArea2 : irisArea1;
  const innerMaskBitmap = await createImageBitmap(innerMaskImageData);
  return {
    overlayBitmap,
    innerMaskBitmap,
    leftIrisArea,
    rightIrisArea
  } as Emotional;
}

async function _generateEmotionals(image:HTMLImageElement):Promise<Emotional[]> {
  const promises:Promise<Emotional>[] = [];
  for(let emotionI = 0; emotionI < Emotion.COUNT; ++emotionI) {
    promises.push(_generateEmotionalData(image, emotionI));
  }
  return await Promise.all(promises);
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
    emotionals: await _generateEmotionals(image),
    backBitmap: await _imageToBackBitmap(image),
    irisesBitmap: await _imageToIrisesBitmap(image),
    lidsBitmap: await _imageToLidsBitmap(image)
  } as EyesBitmaps;
}

export type EyesInitData = {
  spriteSheetUrl:string,
  backOffsetX?:number,
  backOffsetY?:number,
  irisesOffsetX?:number,
  irisesOffsetY?:number,
  lidsOffsetX?:number,
  lidsOffsetY?:number
}

async function _onLoad(initData:any):Promise<any> {
  const defZero = (value:any) => value === undefined ? 0 : value;
  const { spriteSheetUrl } = initData as EyesInitData;
  const { emotionals, backBitmap, irisesBitmap, lidsBitmap } = await _loadBitmaps(spriteSheetUrl);
  const backOffsetX = defZero(initData.backOffsetX);
  const backOffsetY = defZero(initData.backOffsetY);
  const irisesOffsetX = defZero(initData.irisesOffsetX);
  const irisesOffsetY = defZero(initData.irisesOffsetY);
  const lidsOffsetX = defZero(initData.lidsOffsetX);
  const lidsOffsetY = defZero(initData.lidsOffsetY);
  const eyesComponentState:EyesComponentState = { 
    emotionals, backBitmap, irisesBitmap, lidsBitmap,
    baseOffsets: { backOffsetX, backOffsetY, irisesOffsetX, irisesOffsetY, lidsOffsetX, lidsOffsetY },
    currentEmotion:Emotion.NEUTRAL
  };
  subscribeEvent(Topics.EMOTION, (event:any) => eyesComponentState.currentEmotion = event as Emotion);
  return eyesComponentState;
}

function _drawIrisAreaDebug(context:CanvasRenderingContext2D,irisArea:IrisArea) {
  context.fillStyle = '#000000';
  context.strokeStyle = '#ff0000';
  context.lineWidth = 1;
  
  context.fillRect(irisArea.centerX - 1, irisArea.centerY - 1, 3, 3);

  function _drawPerimeter(dx:number, dy:number) {
    let [x,y] = irisArea.positionToCoords(dx, dy);
    context.beginPath();
    context.moveTo(irisArea.centerX, irisArea.centerY);
    context.lineTo(x, y);
    context.stroke();
  }

  _drawPerimeter(-.5,-.5);
  _drawPerimeter(0,-.5);
  _drawPerimeter(.5,-.5);
  _drawPerimeter(-.5,0);
  _drawPerimeter(0,0);
  _drawPerimeter(.5,0)
  _drawPerimeter(-.5,.5);
  _drawPerimeter(0,.5);
  _drawPerimeter(.5,.5);
} 

function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number) {
  const preRenderContext = thePreRenderContext();
  if (!preRenderContext) return;
  const { currentEmotion, emotionals, backBitmap, irisesBitmap, lidsBitmap, baseOffsets } = componentState as EyesComponentState;
  const { backOffsetX, backOffsetY, irisesOffsetX, irisesOffsetY, lidsOffsetX, lidsOffsetY } = baseOffsets;
  const { innerMaskBitmap, overlayBitmap, leftIrisArea, rightIrisArea } = emotionals[currentEmotion];
  preRenderContext.save();
  preRenderContext.clearRect(0,0, CX_EYES, CY_EYES)
  preRenderContext.globalCompositeOperation = 'source-over';
  preRenderContext.drawImage(innerMaskBitmap, 0, 0);
  preRenderContext.globalCompositeOperation = 'source-atop';
  preRenderContext.drawImage(backBitmap, backOffsetX, backOffsetY);
  preRenderContext.drawImage(irisesBitmap, irisesOffsetX, irisesOffsetY);
  preRenderContext.drawImage(lidsBitmap, lidsOffsetX, lidsOffsetY);
  preRenderContext.restore();
  // TODO delete below
  _drawIrisAreaDebug(preRenderContext, leftIrisArea);
  _drawIrisAreaDebug(preRenderContext, rightIrisArea);
  
  context.drawImage(preRenderContext.canvas, x, y);
  
  context.drawImage(overlayBitmap, x, y);
  
}

export async function loadEyesComponent(initData:EyesInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender);
  await component.load(initData);
  return component;
} 