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

let head:CanvasComponent|null = null;
let isInitialized:boolean = false;

async function _init():Promise<void> {
  head = await loadHeadComponent({spriteSheetUrl:'/images/billy-face.png'});
  const mouth = await loadMouthComponent({spriteSheetUrl:'/images/billy-mouth.png'});
  const eyes = await loadEyesComponent({
    spriteSheetUrl:'/images/billy-eyes.png',
    backOffsetX: -4,
    irisesOffsetX: -2,
    lidsOffsetY: 4,
    lidsOffsetX: 4,
  });
  head.addChildAt(mouth, 20, 290);
  head.addChildAt(eyes, 25, 150);
  head.offsetX = 200;
  head.offsetY = 20;
}

function _onDrawCanvas(context:CanvasRenderingContext2D, frameCount:number) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!isInitialized || !head) return;
  head.renderWithChildren(context);
}

function App() {
  useEffect(() => {
    if (isInitialized) return;
    _init();
    isInitialized = true;
  }, []);

  return (
    <div className="App">
      <EmotionSelector />
      <VisemeSelector />
      <Canvas width={500} height={500} isAnimated={true} onDraw={_onDrawCanvas}/>
      <PreRenderCanvas width={1024} height={1024} />
    </div>
  );
}

export default App;
