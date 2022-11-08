import Canvas from "./common/Canvas";
import Mouth from "./mouth/Mouth";
import './App.css';
import React, {useEffect} from 'react';
import VisemeSelector from "./ui/VisemeSelector";

let mouth:Mouth|null = null;
let isInitialized:boolean = false;

async function _init():Promise<void> {
  mouth = new Mouth('/images/theMaw.png');
}

function _onDrawCanvas(context:CanvasRenderingContext2D, frameCount:number) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!isInitialized) return;
  mouth?.onRender(context, frameCount);
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
