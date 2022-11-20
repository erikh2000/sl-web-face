import {loadImage} from "../rendering/imageUtil";
import {recolorBitmapByProfile} from "../rendering/recolorUtil";
import CanvasComponent from "../canvasComponent/CanvasComponent";
import {createOffScreenContext} from "../rendering/canvasUtil";
import {RecolorProfile} from "../rendering/RecolorProfile";

export type HeadInitData = {
  spriteSheetUrl:string
}

type HeadComponentState = {
  headBitmap:ImageBitmap
}

async function _loadHeadBitmap(spriteSheetUrl:string):Promise<ImageBitmap> {
  const image = await loadImage(spriteSheetUrl);
  const width = image.width, height = image.height;
  return createImageBitmap(image, 0, 0, width, height);
}

async function _onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl } = initData as HeadInitData;
  const originalHeadBitmap = await _loadHeadBitmap(spriteSheetUrl);
  const preRenderContext = createOffScreenContext(originalHeadBitmap.width, originalHeadBitmap.height);
  
  const recolorProfile:RecolorProfile = {
    instructions: [
      //{rgbMatch:[226, 197, 197], rgbReplace:[149,123,96], matchTolerance:10, useSmoothing:false},
      //{rgbMatch:[224, 175, 177], rgbReplace:[140,108,90], matchTolerance:10, useSmoothing:false},
      {rgbMatch:[220, 157, 159], rgbReplace:[120,113,86], matchTolerance:10, useSmoothing:false},
      {rgbMatch:[179, 103, 103], rgbReplace:[100,90,80], matchTolerance:10, useSmoothing:false}
    ]
  };
  const headBitmap = await recolorBitmapByProfile(originalHeadBitmap, recolorProfile, preRenderContext);
  return { headBitmap };
}

function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number) {
  const { headBitmap } = componentState as HeadComponentState;
  context.drawImage(headBitmap, x, y);
}

export async function loadHeadComponent(initData:HeadInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender);
  await component.load(initData);
  return component;
} 