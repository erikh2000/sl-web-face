import Canvas from "./common/Canvas";
import { loadMouthComponent } from "./mouth/mouth";
import './App.css';
import React, {useEffect} from 'react';
import VisemeSelector from "./ui/VisemeSelector";
import CanvasComponent from "./canvasComponent/CanvasComponent";
import {loadHeadComponent} from "./head/head";
import EmotionSelector from "./ui/EmotionSelector";
import {loadEyesComponent} from "./eyes/eyes";
import PreRenderCanvas from "./common/PreRenderCanvas";
import {publishEvent} from "./events/thePubSub";
import Topics from "./events/topics";
import BlinkController from "./eyes/BlinkController";
import LidLevelSelector from "./ui/LidLevelSelector";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const MAX_PRERENDER_WIDTH = 1024, MAX_PRERENDER_HEIGHT = 1024;

let head:CanvasComponent|null = null;
let isInitialized:boolean = false;
const blinkController = new BlinkController();

async function _init():Promise<void> {
  head = await loadHeadComponent({spriteSheetUrl:'/images/billy-face.png'});
  const mouth = await loadMouthComponent({spriteSheetUrl:'/images/billy-mouth.png'});
  const eyes = await loadEyesComponent({
    spriteSheetUrl:'/images/billy-eyes.png',
    backOffsetX: -4,
    irisesOffsetX: -2,
    lidsOffsetY: -2,
    lidsOffsetX: 4,
  });
  head.addChildAt(mouth, 20, 290);
  head.addChildAt(eyes, 25, 150);
  head.offsetX = 200;
  head.offsetY = 20;
  blinkController.start();
}

function _onDrawCanvas(context:CanvasRenderingContext2D, frameCount:number) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!isInitialized || !head) return;
  head.renderWithChildren(context);
}

function _onCanvasMouseMove(event:any) {
  const dx = (event.screenX - window.screen.width/2) / window.screen.width;
  const dy = (event.screenY - window.screen.height/2) / window.screen.height;
  publishEvent(Topics.ATTENTION, {dx, dy});
}

function App() {
  useEffect(() => {
    if (isInitialized) return;
    _init();
    isInitialized = true;
  }, []);

  return (
    <div className="App" onMouseMove={_onCanvasMouseMove}>
      <EmotionSelector />
      <LidLevelSelector />
      <VisemeSelector />
      <Canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} isAnimated={true} onDraw={_onDrawCanvas} />
      <PreRenderCanvas width={MAX_PRERENDER_WIDTH} height={MAX_PRERENDER_HEIGHT} />
    </div>
  );
}

export default App;
