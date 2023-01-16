import {RecolorProfile} from "../../rendering/RecolorProfile";

export type ExtraInitData = {
  spriteSheetUrl:string,
  skinRecolorProfile:RecolorProfile|null,
  hairRecolorProfile:RecolorProfile|null,
  recolor:string,
  placeAfter:string
}

export type ExtraComponentState = {
  extraBitmap:ImageBitmap
}