import {loadImage} from "../../rendering/imageUtil";
import {recolorBitmapByProfile} from "../../rendering/recolorUtil";
import CanvasComponent from "../../canvasComponent/CanvasComponent";
import {createOffScreenContext} from "../../rendering/canvasUtil";
import {RecolorProfile} from "../../rendering/RecolorProfile";
import {RECOLOR_HAIR, RECOLOR_NONE, RECOLOR_SKIN} from "./RecolorMethod";

export type ExtraInitData = {
  spriteSheetUrl:string,
  skinRecolorProfile:RecolorProfile|null,
  hairRecolorProfile:RecolorProfile|null,
  recolor:string,
  placeAfter:string
}

type ExtraComponentState = {
  extraBitmap:ImageBitmap
}

async function _loadExtraBitmap(spriteSheetUrl:string):Promise<ImageBitmap> {
  const image = await loadImage(spriteSheetUrl);
  return createImageBitmap(image, 0, 0, image.width, image.height);
}

function _getApplicableRecolorProfile(recolor:string, skinRecolorProfile:RecolorProfile|null, hairRecolorProfile:RecolorProfile|null):RecolorProfile|null {
  switch(recolor) {
    case RECOLOR_SKIN: return skinRecolorProfile;
    case RECOLOR_HAIR: return hairRecolorProfile;
    default: return null;
  }
}

async function _onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl, skinRecolorProfile, hairRecolorProfile, recolor, placeAfter } = initData as ExtraInitData;
  let extraBitmap = await _loadExtraBitmap(spriteSheetUrl);
  const recolorProfile = _getApplicableRecolorProfile(recolor, skinRecolorProfile, hairRecolorProfile);
  if (!recolorProfile) return { extraBitmap } as ExtraComponentState;

  const preRenderContext = createOffScreenContext(extraBitmap.width, extraBitmap.height);
  const recoloredBitmap = await recolorBitmapByProfile(extraBitmap, recolorProfile, preRenderContext);
  return { extraBitmap:recoloredBitmap } as ExtraComponentState;
}

function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  const { extraBitmap } = componentState as ExtraComponentState;
  context.drawImage(extraBitmap, x, y, width, height);
}

function _onBoundingDimensions(componentState:any):[width:number, height:number] {
  const { extraBitmap } = componentState as ExtraComponentState;
  return [extraBitmap.width, extraBitmap.height];
}

export const EXTRA_PART_TYPE = 'extra';

export async function loadExtraComponent(initData:ExtraInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender, _onBoundingDimensions);
  await component.load(initData);
  return component;
}