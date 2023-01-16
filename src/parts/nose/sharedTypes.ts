import {RecolorProfile} from "../../rendering/RecolorProfile";

export type NoseInitData = {
  spriteSheetUrl:string,
  skinRecolorProfile:RecolorProfile|null
}

export type NoseComponentState = {
  noseBitmap:ImageBitmap
}