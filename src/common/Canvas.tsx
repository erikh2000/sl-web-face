import React, { useRef, useEffect } from 'react'

interface IDrawCallback {
  (context:CanvasRenderingContext2D, frameCount:number):void;
}

interface IProps {
  onDraw:IDrawCallback,
  isAnimated:boolean,
  width:number,
  height:number,
}

function Canvas(props:IProps) {

  const { onDraw, isAnimated, width, height } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    
    let frameCount = 0;
    let animationFrameId = -1;

    const render = () => {
      frameCount++;
      onDraw(context, frameCount);
      if (isAnimated) animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      if (isAnimated) window.cancelAnimationFrame(animationFrameId);
    }
  }, [onDraw, isAnimated]);

  return <canvas className='Canvas' width={width} height={height} ref={canvasRef} />;
}

export default Canvas;