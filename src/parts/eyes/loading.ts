import IrisArea from "./IrisArea";
import {nameToIrisColor} from "./IrisColor";
import {calcIrisTargetAndUpdateState} from "./rendering";
import {BaseOffsets, Emotional, EyesBitmaps, EyesComponentState, EyesInitData, IrisInfo} from "./sharedTypes";
import TweenedValue from "../../animation/TweenedValue";
import Emotion from "../../events/emotions";
import LidLevel from "../../events/lidLevels";
import {clearContext, createOffScreenContext} from "../../rendering/canvasUtil";
import {
  AreaMeasurementFlags, AreaMeasurements,
  contextToImageBitmap,
  createInnerAlphaMask,
  findAndMeasureOpaqueAreas,
  imageBitmapToImageData, loadImage
} from "../../rendering/imageUtil";
import {irisColorToRecolorProfile} from "../../rendering/irisRecolorProfiles";
import {RecolorProfile} from "../../rendering/RecolorProfile";
import {recolorBitmapByProfile} from "../../rendering/recolorUtil";

export const X_EYES = 0, CX_EYES = 256, CY_EYES = 128, X_SKIN_MASK = CX_EYES, X_HAIR_MASK = CX_EYES * 2;
export const Y_EMOTION_EYES = 0;
export const Y_BACK = 11*CY_EYES;
export const Y_IRISES = 12*CY_EYES;
export const Y_LIDS = 13*CY_EYES;
export const MIN_MASK_COVERAGE_FACTOR = .01;
export const MIN_IRIS_COVERAGE_FACTOR = 0;

function _initDataToBaseOffsets(eyesInitData:EyesInitData):BaseOffsets {
  const defZero = (value:any) => value === undefined ? 0 : value;
  const backOffsetX = defZero(eyesInitData.backOffsetX);
  const backOffsetY = defZero(eyesInitData.backOffsetY);
  const lidsOffsetX = defZero(eyesInitData.lidsOffsetX);
  const lidsOffsetY = defZero(eyesInitData.lidsOffsetY);
  return { backOffsetX, backOffsetY, lidsOffsetX, lidsOffsetY };
}

async function _imageToOverlayBitmap(image:HTMLImageElement, emotion:Emotion):Promise<[ImageBitmap, ImageBitmap, ImageBitmap]> {
  const y = Y_EMOTION_EYES+(emotion*CY_EYES);
  return [
    await createImageBitmap(image, X_EYES, y, CX_EYES, CY_EYES),
    await createImageBitmap(image, X_SKIN_MASK, y, CX_EYES, CY_EYES),
    await createImageBitmap(image, X_HAIR_MASK, y, CX_EYES, CY_EYES)
  ];
}

async function _generateEmotionalData(image:HTMLImageElement, emotion:Emotion, maskContext:CanvasRenderingContext2D,
                                      preRenderContext:CanvasRenderingContext2D, skinRecolorProfile:RecolorProfile|null,
                                      hairRecolorProfile:RecolorProfile|null):Promise<Emotional> {
  const [originalBitmap, skinMaskBitmap, hairMaskBitmap] = await _imageToOverlayBitmap(image, emotion);

  let overlayBitmap:ImageBitmap|null;

  const isRecoloring = skinRecolorProfile !== null || hairRecolorProfile !== null;
  let skinRecoloredBitmap:ImageBitmap|null = null, hairRecoloredBitmap:ImageBitmap|null = null;

  // Perform recoloring here instead of below, so that preRenderContext can be used to
  // combine skin and hair without being affected by the recoloring use of preRenderContext.
  if (skinRecolorProfile) skinRecoloredBitmap = await recolorBitmapByProfile(originalBitmap, skinRecolorProfile, preRenderContext);
  if (hairRecolorProfile) hairRecoloredBitmap = await recolorBitmapByProfile(originalBitmap, hairRecolorProfile, preRenderContext);

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

  if (isRecoloring) {
    preRenderContext.drawImage(originalBitmap, 0, 0);
    overlayBitmap = await contextToImageBitmap(preRenderContext);
  } else {
    overlayBitmap = originalBitmap;
  }

  const overlayImageData = await imageBitmapToImageData(overlayBitmap, preRenderContext);

  const innerMaskImageData = createInnerAlphaMask(overlayImageData);
  const innerMaskAreas = findAndMeasureOpaqueAreas(innerMaskImageData, MIN_MASK_COVERAGE_FACTOR, AreaMeasurementFlags.FULLY_OPAQUE | AreaMeasurementFlags.DIMENSIONS);
  if (innerMaskAreas.length < 2) throw Error(`Could not find 2 iris areas for emotion #${emotion}.`);
  const irisArea1 = new IrisArea(innerMaskAreas[0].centroidX, innerMaskAreas[0].centroidY, innerMaskImageData);
  const irisArea2 = new IrisArea(innerMaskAreas[1].centroidX, innerMaskAreas[1].centroidY, innerMaskImageData);
  const isFirstLeft = (irisArea1.centerX < irisArea2.centerX);
  const leftIrisArea = isFirstLeft ? irisArea1 : irisArea2;
  const rightIrisArea = isFirstLeft ? irisArea2 : irisArea1;
  leftIrisArea.constrainToLowestCommonAngleDistances(rightIrisArea);
  const innerMaskBitmap = await createImageBitmap(innerMaskImageData);

  return {
    overlayBitmap,
    innerMaskBitmap,
    leftIrisArea,
    rightIrisArea,
    lidTravelHeight: Math.max(innerMaskAreas[0].height, innerMaskAreas[1].height),
  } as Emotional;
}

async function _generateEmotionals(image:HTMLImageElement, maskContext:CanvasRenderingContext2D,
                                   preRenderContext:CanvasRenderingContext2D, skinRecolorProfile:RecolorProfile|null,
                                   hairRecolorProfile:RecolorProfile|null):Promise<Emotional[]> {
  const promises:Promise<Emotional>[] = [];
  for(let emotionI = 0; emotionI < Emotion.COUNT; ++emotionI) {
    promises.push(_generateEmotionalData(image, emotionI, maskContext, preRenderContext, skinRecolorProfile, hairRecolorProfile));
  }
  return await Promise.all(promises);
}

async function _imageToBackBitmap(image:HTMLImageElement):Promise<ImageBitmap> {
  return createImageBitmap(image, X_EYES, Y_BACK, CX_EYES, CY_EYES);
}

async function _imageToIrisesImageData(image:HTMLImageElement, preRenderContext:CanvasRenderingContext2D, recolorProfile:RecolorProfile|null):Promise<ImageData> {
  let irisesImageBitmap = await createImageBitmap(image, X_EYES, Y_IRISES, CX_EYES, CY_EYES);
  if (recolorProfile) irisesImageBitmap = await recolorBitmapByProfile(irisesImageBitmap, recolorProfile, preRenderContext);
  return imageBitmapToImageData(irisesImageBitmap, preRenderContext);
}

async function _createIrisInfo(irisesImageData:ImageData, irisArea:AreaMeasurements):Promise<IrisInfo> {
  return {
    irisBitmap: await createImageBitmap(irisesImageData, irisArea.left, irisArea.top, irisArea.width, irisArea.height),
    centerOffsetX: irisArea.width / -2,
    centerOffsetY: irisArea.height / -2,
    x: new TweenedValue(0),
    y: new TweenedValue(0)
  }
}

async function _imageToLeftAndRightIrises(image:HTMLImageElement, preRenderContext:CanvasRenderingContext2D, irisRecolorProfile:RecolorProfile|null):Promise<IrisInfo[]> {
  const irisesImageData = await _imageToIrisesImageData(image, preRenderContext, irisRecolorProfile);
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

async function _imageToLidsBitmap(image:HTMLImageElement, recolorProfile:RecolorProfile|null, preRenderContext:CanvasRenderingContext2D):Promise<ImageBitmap> {
  const originalBitmap = await createImageBitmap(image, X_EYES, Y_LIDS, CX_EYES, CY_EYES);
  if (!recolorProfile) return originalBitmap;

  const recoloredBitmap = await recolorBitmapByProfile(originalBitmap, recolorProfile, preRenderContext);
  const skinMaskBitmap = await createImageBitmap(image, X_SKIN_MASK, Y_LIDS, CX_EYES, CY_EYES);

  clearContext(preRenderContext);
  preRenderContext.globalCompositeOperation = 'source-over';
  preRenderContext.drawImage(skinMaskBitmap, 0, 0);
  preRenderContext.globalCompositeOperation = 'source-in';
  preRenderContext.drawImage(recoloredBitmap, 0, 0);
  preRenderContext.globalCompositeOperation = 'destination-over';
  preRenderContext.drawImage(originalBitmap, 0, 0);
  return contextToImageBitmap(preRenderContext);
}

async function _loadBitmaps(spriteSheetUrl:string, maskContext:CanvasRenderingContext2D,
                            preRenderContext:CanvasRenderingContext2D, skinRecolorProfile:RecolorProfile|null,
                            hairRecolorProfile:RecolorProfile|null, irisRecolorProfile:RecolorProfile|null):Promise<EyesBitmaps> {
  const image = await loadImage(spriteSheetUrl);
  const [leftIris, rightIris] = await _imageToLeftAndRightIrises(image, preRenderContext, irisRecolorProfile);
  const lidsBitmap = await _imageToLidsBitmap(image, skinRecolorProfile, preRenderContext);
  return {
    emotionals: await _generateEmotionals(image, maskContext, preRenderContext, skinRecolorProfile, hairRecolorProfile),
    backBitmap: await _imageToBackBitmap(image),
    leftIris, rightIris,
    lidsBitmap
  } as EyesBitmaps;
}

function _initIrisPositions(leftIris:IrisInfo, rightIris:IrisInfo) {
  leftIris.x.value = leftIris.x.target;
  leftIris.y.value = leftIris.y.target;
  rightIris.x.value = rightIris.x.target;
  rightIris.y.value = rightIris.y.target;
}

export function onBoundingDimensions(_componentState:any):[width:number, height:number] { return [CX_EYES, CY_EYES]; }

export async function onLoad(initData:any):Promise<any> {
  const preRenderContext = createOffScreenContext(CX_EYES, CY_EYES);
  const maskContext = createOffScreenContext(CX_EYES, CY_EYES);
  const { spriteSheetUrl, skinRecolorProfile, hairRecolorProfile, irisColor } = initData as EyesInitData;
  const irisRecolorProfile = irisColor !== undefined ? irisColorToRecolorProfile(nameToIrisColor(irisColor)) : null;
  const { emotionals, backBitmap, leftIris, rightIris, lidsBitmap } =
    await _loadBitmaps(spriteSheetUrl, maskContext, preRenderContext, skinRecolorProfile, hairRecolorProfile, irisRecolorProfile);

  const eyesComponentState:EyesComponentState = {
    emotionals, backBitmap, leftIris, rightIris, lidsBitmap,
    baseOffsets: _initDataToBaseOffsets(initData),
    emotion:Emotion.NEUTRAL,
    attentionTarget:[0,0],
    restingLidLevel:LidLevel.NORMAL,
    lastBlinkTime:0,
    lidLevel:new TweenedValue(LidLevel.NORMAL),
    preRenderContext
  };
  calcIrisTargetAndUpdateState(eyesComponentState);
  _initIrisPositions(eyesComponentState.leftIris, eyesComponentState.rightIris);

  return eyesComponentState;
}