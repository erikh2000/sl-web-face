import {RecolorProfile} from "../../rendering/RecolorProfile";

export type HeadInitData = {
  spriteSheetUrl:string,
  skinRecolorProfile:RecolorProfile|null,
  hairRecolorProfile:RecolorProfile|null
}

export type HeadComponentState = {
  headBitmap:ImageBitmap
}