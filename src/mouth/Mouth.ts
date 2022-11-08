import {ICanvasRenderable} from "../rendering/ICanvasRenderable";
import {loadImage} from "../common/imageUtil";
import {Viseme} from "./visemes";
import Topics from '../events/topics';
import { subscribeEvent } from "../events/thePubSub";

const Y_MOUTHS = 0;
const X_MOUTHS = 1536;
const CX_MOUTH = 512;
const CY_MOUTH = 192;

async function _loadVisemeBitmaps(faceSheetUrl:string):Promise<ImageBitmap[]> {
  const image = await loadImage(faceSheetUrl);
  const bitmaps:ImageBitmap[] = [];
  for(let visemeI = 0; visemeI < Viseme.COUNT; ++visemeI) {
    bitmaps.push(await createImageBitmap(image, X_MOUTHS, Y_MOUTHS + (visemeI * CY_MOUTH), CX_MOUTH, CY_MOUTH));
  }
  return bitmaps;
}

class Mouth implements ICanvasRenderable{
  isInitialized:boolean;
  visemeBitmaps:ImageBitmap[];
  currentViseme:Viseme;
  
  private async _init(faceSheetUrl:string) {
    this.visemeBitmaps = await _loadVisemeBitmaps(faceSheetUrl);
    this.isInitialized = true;
    subscribeEvent(Topics.VISEME, (event) => this.currentViseme = event as Viseme);
  }
  
  constructor(faceSheetUrl:string) {
    this.isInitialized = false;
    this.visemeBitmaps = [];
    this.currentViseme = Viseme.L;
   this._init(faceSheetUrl);
  }
  
  onRender(context:CanvasRenderingContext2D, frameCount:number):void {
    if (!this.isInitialized) return;
    context.drawImage(this.visemeBitmaps[this.currentViseme], 0, 0);
  }
}

export default Mouth;