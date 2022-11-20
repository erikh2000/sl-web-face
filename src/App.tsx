import CanvasComponent from "./canvasComponent/CanvasComponent";
import {publishEvent} from "./events/thePubSub";
import Topics from "./events/topics";
import AttentionController from "./eyes/AttentionController";
import BlinkController from "./eyes/BlinkController";
import {loadEyesComponent} from "./eyes/eyes";
import {loadHeadComponent} from "./head/head";
import {loadMouthComponent} from "./mouth/mouth";
import Canvas from "./rendering/Canvas";
import EmotionSelector from "./ui/EmotionSelector";
import LidLevelSelector from "./ui/LidLevelSelector";
import VisemeSelector from "./ui/VisemeSelector";

import styles from './App.module.css';

import React, {useEffect} from 'react';
import {createThePreRenderContext} from "./rendering/thePreRenderContext";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const MAX_PRERENDER_WIDTH = 1024, MAX_PRERENDER_HEIGHT = 1024;

let head:CanvasComponent|null = null;
let isInitialized:boolean = false;
const blinkController = new BlinkController();
const attentionController = new AttentionController();

async function _init():Promise<void> {
  createThePreRenderContext(MAX_PRERENDER_WIDTH, MAX_PRERENDER_HEIGHT);
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
  attentionController.start();
}

function _onDrawCanvas(context:CanvasRenderingContext2D, _frameCount:number) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!isInitialized || !head) return;
  head.renderWithChildren(context);
}

function _onClick(event:any) {
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
    <div className={styles.app} onClick={_onClick}>
      <EmotionSelector />
      <LidLevelSelector />
      <VisemeSelector />
      <Canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} isAnimated={true} onDraw={_onDrawCanvas} />
    </div>
  );
}

export default App;
