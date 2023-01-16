import IrisArea from "./IrisArea";
import TweenedValue from "../../animation/TweenedValue";
import Emotion from "../../events/emotions";
import LidLevel from "../../events/lidLevels";
import {RecolorProfile} from "../../rendering/RecolorProfile";

export type Emotional = {
  overlayBitmap:ImageBitmap,
  innerMaskBitmap:ImageBitmap,
  leftIrisArea:IrisArea,
  rightIrisArea:IrisArea,
  lidTravelHeight:number
}

export type IrisInfo = {
  irisBitmap:ImageBitmap,
  centerOffsetX:number,
  centerOffsetY:number,
  x:TweenedValue,
  y:TweenedValue
}

export type EyesBitmaps = {
  emotionals:Emotional[],
  backBitmap:ImageBitmap,
  leftIris:IrisInfo,
  rightIris:IrisInfo,
  lidsBitmap:ImageBitmap
}

export type BaseOffsets = {
  backOffsetX:number,
  backOffsetY:number,
  lidsOffsetX:number,
  lidsOffsetY:number
}

export type EyesInitData = {
  backOffsetX?:number,
  backOffsetY?:number,
  hairRecolorProfile:RecolorProfile|null,
  irisColor:string,
  lidsOffsetX?:number,
  lidsOffsetY?:number
  skinRecolorProfile:RecolorProfile|null,
  spriteSheetUrl:string
}

export type EyesComponentState = EyesBitmaps & {
  emotion:Emotion,
  attentionTarget:[dx:number, dy:number],
  restingLidLevel:LidLevel,
  lastBlinkTime:number,
  lidLevel:TweenedValue,
  baseOffsets:BaseOffsets,
  preRenderContext:CanvasRenderingContext2D
}
