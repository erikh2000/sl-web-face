import {loadImage} from "../rendering/imageUtil";
import CanvasComponent from "../canvasComponent/CanvasComponent";

export type HeadInitData = {
  spriteSheetUrl:string
}

type HeadComponentState = {
  headBitmap:ImageBitmap
}

async function _loadHeadBitmap(spriteSheetUrl:string):Promise<ImageBitmap> {
  const image = await loadImage(spriteSheetUrl);
  const width = image.width, height = image.height;
  return await createImageBitmap(image, 0, 0, width, height);
}

async function _onLoad(initData:any):Promise<any> {
  const { spriteSheetUrl } = initData as HeadInitData;
  return {
    headBitmap: await _loadHeadBitmap(spriteSheetUrl)
  };
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