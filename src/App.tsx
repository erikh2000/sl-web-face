import Canvas from "./common/Canvas";
import { loadMouthComponent } from "./mouth/Mouth";
import './App.css';
import React, {useEffect} from 'react';
import VisemeSelector from "./ui/VisemeSelector";
import CanvasComponent from "./canvasComponent/CanvasComponent";

let mouth:CanvasComponent|null = null;
let isInitialized:boolean = false;

async function _init():Promise<void> {
  mouth = await loadMouthComponent({faceSheetUrl:'/images/theMaw.png'});
}

function _onDrawCanvas(context:CanvasRenderingContext2D, frameCount:number) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!isInitialized) return;
  mouth?.render(context);
}

function App() {
  useEffect(() => {
    if (isInitialized) return;
    _init();
    isInitialized = true;
  }, []);

  return (
    <div className="App">
      <VisemeSelector />
      <Canvas width={500} height={500} isAnimated={true} onDraw={_onDrawCanvas}/>
    </div>
  );
}

export default App;
