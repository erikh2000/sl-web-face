import React, { useRef, useEffect } from 'react'
import {setPreRenderContext} from "./thePreRenderContext";

interface IProps {
  width:number,
  height:number
}

let isInitialized = false;

function PreRenderCanvas(props:IProps) {
  const { width, height } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isInitialized) return;
    const context = canvasRef.current?.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    setPreRenderContext(context);
    isInitialized = true;
  });

  return <canvas className='Canvas' width={width} height={height} ref={canvasRef} hidden />;
}

export default PreRenderCanvas;