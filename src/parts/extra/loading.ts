import {RECOLOR_HAIR, RECOLOR_SKIN} from "./RecolorMethod";
import {ExtraComponentState, ExtraInitData} from "./sharedTypes";
import {createOffScreenContext} from "../../rendering/canvasUtil";
import {loadImage} from "../../rendering/imageUtil";
import {recolorBitmapByProfile} from "../../rendering/recolorUtil";
import {RecolorProfile} from "../../rendering/RecolorProfile";

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

export function onBoundingDimensions(componentState:any):[width:number, height:number] {
  const { extraBitmap } = componentState as ExtraComponentState;
  return [extraBitmap.width, extraBitmap.height];
}

export async function onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl, skinRecolorProfile, hairRecolorProfile, recolor, placeAfter } = initData as ExtraInitData;
  let extraBitmap = await _loadExtraBitmap(spriteSheetUrl);
  const recolorProfile = _getApplicableRecolorProfile(recolor, skinRecolorProfile, hairRecolorProfile);
  if (!recolorProfile) return { extraBitmap } as ExtraComponentState;

  const preRenderContext = createOffScreenContext(extraBitmap.width, extraBitmap.height);
  const recoloredBitmap = await recolorBitmapByProfile(extraBitmap, recolorProfile, preRenderContext);
  return { extraBitmap:recoloredBitmap } as ExtraComponentState;
}