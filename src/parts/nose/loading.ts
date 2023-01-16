import {NoseComponentState, NoseInitData} from "./sharedTypes";
import {createOffScreenContext} from "../../rendering/canvasUtil";
import {loadImage} from "../../rendering/imageUtil";
import {recolorBitmapByProfile} from "../../rendering/recolorUtil";

async function _loadNoseBitmap(spriteSheetUrl:string):Promise<ImageBitmap> {
  const image = await loadImage(spriteSheetUrl);
  return createImageBitmap(image, 0, 0, image.width, image.height);
}

export function onBoundingDimensions(componentState:any):[width:number, height:number] {
  const { noseBitmap } = componentState as NoseComponentState;
  return [noseBitmap.width, noseBitmap.height];
}

export async function onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl, skinRecolorProfile } = initData as NoseInitData;
  let noseBitmap = await _loadNoseBitmap(spriteSheetUrl);
  if (!skinRecolorProfile) return { noseBitmap };

  const preRenderContext = createOffScreenContext(noseBitmap.width, noseBitmap.height);
  const recoloredBitmap = await recolorBitmapByProfile(noseBitmap, skinRecolorProfile, preRenderContext);
  return { noseBitmap:recoloredBitmap } as NoseComponentState;
}