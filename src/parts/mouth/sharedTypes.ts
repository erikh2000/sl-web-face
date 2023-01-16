import Emotion from "../../events/emotions";
import Viseme from "../../events/visemes";
import {RecolorProfile} from "../../rendering/RecolorProfile";

export type MouthInitData = {
  spriteSheetUrl:string,
  skinRecolorProfile:RecolorProfile|null,
  hairRecolorProfile:RecolorProfile|null
}

export type MouthComponentState = {
  visemeBitmaps:ImageBitmap[];
  emotionBitmaps:ImageBitmap[];
  viseme:Viseme;
  emotion:Emotion;
}