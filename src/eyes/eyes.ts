import {
  AreaMeasurementFlags, AreaMeasurements,
  createInnerAlphaMask,
  findAndMeasureOpaqueAreas,
  imageBitmapToImageData,
  loadImage,
  sliceImageData
} from "../common/imageUtil";
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

type IrisInfo = {
  irisBitmap:ImageBitmap,
  centerOffsetX:number,
  centerOffsetY:number
}

type EyesBitmaps = {
  emotionals:Emotional[],
  backBitmap:ImageBitmap,
  leftIris:IrisInfo,
  rightIris:IrisInfo,
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
  targetDx:number, targetDy:number,
  isBlinking:boolean,
  blinkStartTime:number,
  baseOffsets:BaseOffsets
}

const X_EYES = 0, CX_EYES = 256, CY_EYES = 128;
const Y_EMOTION_EYES = 0;
const Y_BACK = 11*CY_EYES;
const Y_IRISES = 12*CY_EYES;
const Y_LIDS = 13*CY_EYES;
const MIN_MASK_COVERAGE_FACTOR = .01;
const MIN_IRIS_COVERAGE_FACTOR = 0;
const BLINK_DURATION = 100;

async function _imageToOverlayBitmap(image:HTMLImageElement, emotion:Emotion):Promise<ImageBitmap> {
  return createImageBitmap(image, X_EYES, Y_EMOTION_EYES+(emotion*CY_EYES), CX_EYES, CY_EYES);
}

async function _generateEmotionalData(image:HTMLImageElement, emotion:Emotion):Promise<Emotional> {
  const overlayBitmap = await _imageToOverlayBitmap(image, emotion);
  const overlayImageData = await imageBitmapToImageData(overlayBitmap);
  const innerMaskImageData = createInnerAlphaMask(overlayImageData);
  const innerMaskAreas = findAndMeasureOpaqueAreas(innerMaskImageData, MIN_MASK_COVERAGE_FACTOR, AreaMeasurementFlags.FULLY_OPAQUE);
  if (innerMaskAreas.length < 2) throw Error(`Could not find 2 iris areas for emotion #${emotion}.`);
  const irisArea1 = new IrisArea(innerMaskAreas[0].centroidX, innerMaskAreas[0].centroidY, innerMaskImageData);
  const irisArea2 = new IrisArea(innerMaskAreas[1].centroidX, innerMaskAreas[1].centroidY, innerMaskImageData);
  const isFirstLeft = (irisArea1.centerX < irisArea2.centerX);
  const leftIrisArea = isFirstLeft ? irisArea1 : irisArea2;
  const rightIrisArea = isFirstLeft ? irisArea2 : irisArea1;
  leftIrisArea.constrainToLowestCommonAngleDistances(rightIrisArea);
  const innerMaskBitmap = await createImageBitmap(innerMaskImageData);
  return { overlayBitmap, innerMaskBitmap, leftIrisArea, rightIrisArea } as Emotional;
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

async function _imageToIrisesImageData(image:HTMLImageElement):Promise<ImageData> {
  const irisesImageBitmap = await createImageBitmap(image, X_EYES, Y_IRISES, CX_EYES, CY_EYES);
  return imageBitmapToImageData(irisesImageBitmap);
}

async function _createIrisInfo(irisesImageData:ImageData, irisArea:AreaMeasurements):Promise<IrisInfo> {
  return {
    irisBitmap: await createImageBitmap(irisesImageData, irisArea.left, irisArea.top, irisArea.width, irisArea.height),
    centerOffsetX: irisArea.width / -2,
    centerOffsetY: irisArea.height / -2
  }
}

async function _imageToLeftAndRightIrises(image:HTMLImageElement):Promise<IrisInfo[]> {
  const irisesImageData = await _imageToIrisesImageData(image);
  let irisAreas = findAndMeasureOpaqueAreas(irisesImageData, MIN_IRIS_COVERAGE_FACTOR, AreaMeasurementFlags.DIMENSIONS)
  if (irisAreas.length < 2) throw Error('Could not find 2 irises in spritesheet.');
  if (irisAreas.length > 2) {
    console.warn('Irises rectangle contains more than 2 opaque areas. Will use 2 biggest.'); // Clean up the sprite sheet if you see this. Probably low-transparency pixels somewhere.
    irisAreas = irisAreas.sort((a:AreaMeasurements, b:AreaMeasurements) => a.pixelCount - b.pixelCount);
  }
  const leftIrisInfo = await _createIrisInfo(irisesImageData, irisAreas[0]);
  const rightIrisInfo = await _createIrisInfo(irisesImageData, irisAreas[1]);
  return [leftIrisInfo, rightIrisInfo];
}

async function _imageToLidsBitmap(image:HTMLImageElement):Promise<ImageBitmap> {
  return createImageBitmap(image, X_EYES, Y_LIDS, CX_EYES, CY_EYES);
}

async function _loadBitmaps(spriteSheetUrl:string):Promise<EyesBitmaps> {
  const image = await loadImage(spriteSheetUrl);
  const [leftIris, rightIris] = await _imageToLeftAndRightIrises(image);
  return {
    emotionals: await _generateEmotionals(image),
    backBitmap: await _imageToBackBitmap(image),
    leftIris, rightIris,
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

function _initDataToBaseOffsets(eyesInitData:EyesInitData):BaseOffsets {
  const defZero = (value:any) => value === undefined ? 0 : value;
  const backOffsetX = defZero(eyesInitData.backOffsetX);
  const backOffsetY = defZero(eyesInitData.backOffsetY);
  const irisesOffsetX = defZero(eyesInitData.irisesOffsetX);
  const irisesOffsetY = defZero(eyesInitData.irisesOffsetY);
  const lidsOffsetX = defZero(eyesInitData.lidsOffsetX);
  const lidsOffsetY = defZero(eyesInitData.lidsOffsetY);
  return { backOffsetX, backOffsetY, irisesOffsetX, irisesOffsetY, lidsOffsetX, lidsOffsetY };
}

enum LidState {
  CLOSED = 0,
  SQUINT = .25,
  NORMAL = .75,
  WIDE = 1
}

function _updateLidsOpenAmount(eyesComponentState:EyesComponentState):number {
  const restingLidState = LidState.NORMAL;
  if (!eyesComponentState.isBlinking) return restingLidState;
  const elapsed = Date.now() - eyesComponentState.blinkStartTime;
  if (elapsed > BLINK_DURATION) {
    eyesComponentState.isBlinking = false;
    return restingLidState;
  }
  return (1 - Math.sin((elapsed / BLINK_DURATION) * Math.PI)) * restingLidState;
}

async function _onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl } = initData as EyesInitData;
  const { emotionals, backBitmap, leftIris, rightIris, lidsBitmap } = await _loadBitmaps(spriteSheetUrl);
  const eyesComponentState:EyesComponentState = { 
    emotionals, backBitmap, leftIris, rightIris, lidsBitmap,
    baseOffsets: _initDataToBaseOffsets(initData),
    currentEmotion:Emotion.NEUTRAL,
    targetDx:0, targetDy:0,
    isBlinking:false,
    blinkStartTime:-1
  };
  subscribeEvent(Topics.EMOTION, (event:any) => eyesComponentState.currentEmotion = event as Emotion);
  subscribeEvent(Topics.ATTENTION, (event:any) => {
    eyesComponentState.targetDx = event.dx;
    eyesComponentState.targetDy = event.dy;
  });
  subscribeEvent(Topics.BLINK, (event:any) => {
    if (!eyesComponentState.isBlinking) {
      eyesComponentState.isBlinking = true;
      eyesComponentState.blinkStartTime = Date.now();
    }
  });
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

  const EXTEND_FACTOR = 1;
  _drawPerimeter(-EXTEND_FACTOR,-EXTEND_FACTOR);
  _drawPerimeter(0,-EXTEND_FACTOR);
  _drawPerimeter(EXTEND_FACTOR,-EXTEND_FACTOR);
  _drawPerimeter(-EXTEND_FACTOR,0);
  _drawPerimeter(0,0);
  _drawPerimeter(EXTEND_FACTOR,0)
  _drawPerimeter(-EXTEND_FACTOR,EXTEND_FACTOR);
  _drawPerimeter(0,EXTEND_FACTOR);
  _drawPerimeter(EXTEND_FACTOR,EXTEND_FACTOR);
} 

async function _drawSliceDebug(context:CanvasRenderingContext2D, sourceBitmap:ImageBitmap) {
  const sourceImageData = await imageBitmapToImageData(sourceBitmap);
  const testImageData = sliceImageData(sourceImageData, 0, 0, CX_EYES / 2, CY_EYES);
  const testImageBitmap = await createImageBitmap(testImageData);
  context.drawImage(testImageBitmap, 0, 0);
}

function _drawIris(context:CanvasRenderingContext2D, irisInfo:IrisInfo, irisArea:IrisArea, targetDx:number, targetDy:number) {
  const [x, y] = irisArea.positionToCoords(targetDx, targetDy);
  context.drawImage(irisInfo.irisBitmap, x + irisInfo.centerOffsetX, y + irisInfo.centerOffsetY);
} 

// TODO discover lid height programmatically.
const CY_LIDS = 35;
  
function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number) {
  const preRenderContext = thePreRenderContext();
  if (!preRenderContext) return;
  const { currentEmotion, emotionals, backBitmap, leftIris, rightIris, lidsBitmap, baseOffsets, targetDx, targetDy } = componentState as EyesComponentState;
  const { backOffsetX, backOffsetY, irisesOffsetX, irisesOffsetY, lidsOffsetX, lidsOffsetY } = baseOffsets;
  const { innerMaskBitmap, overlayBitmap, leftIrisArea, rightIrisArea } = emotionals[currentEmotion];

  // TODO create a separate callback for updating value that affect rendering and move
  // this there.
  const lidsOpenAmount = _updateLidsOpenAmount(componentState);
  const lidsOpenOffset = -(lidsOpenAmount * CY_LIDS);
  
  preRenderContext.save();
  preRenderContext.clearRect(0,0, CX_EYES, CY_EYES)
  preRenderContext.globalCompositeOperation = 'source-over';
  preRenderContext.drawImage(innerMaskBitmap, 0, 0);
  preRenderContext.globalCompositeOperation = 'source-atop';
  preRenderContext.drawImage(backBitmap, backOffsetX, backOffsetY);
  _drawIris(preRenderContext, leftIris, leftIrisArea, targetDx, targetDy);
  _drawIris(preRenderContext, rightIris, rightIrisArea, targetDx, targetDy);
  preRenderContext.drawImage(lidsBitmap, lidsOffsetX, lidsOffsetY + lidsOpenOffset);
  preRenderContext.restore();
  context.drawImage(preRenderContext.canvas, x, y);
  context.drawImage(overlayBitmap, x, y);
}

export async function loadEyesComponent(initData:EyesInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender);
  await component.load(initData);
  return component;
} 