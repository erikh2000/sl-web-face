import React, { useRef, useEffect, useState } from 'react'

interface IDrawCallback {
  (context:CanvasRenderingContext2D, frameCount:number):void;
}

interface IProps {
  className:string,
  isAnimated:boolean,
  onDraw:IDrawCallback,
  onMouseMove?:any
}

function _updateCanvasDimensions(container:HTMLDivElement, setContainerDimensions:any) {
  const nextDimensions:[number,number] = [container.clientWidth, container.clientHeight];
  setContainerDimensions(nextDimensions);
}

let isInitialized = false;

function Canvas(props:IProps) {
  const [containerDimensions, setContainerDimensions] = useState<[number,number]|null>(null);
  const { className, onDraw, onMouseMove, isAnimated } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, canvasHeight] = containerDimensions ?? [0,0];

  useEffect(() => {
    const container:HTMLDivElement|null = containerRef?.current;
    if (!container || isInitialized) return;
    isInitialized = true;
    _updateCanvasDimensions(container, setContainerDimensions);
    window.addEventListener('resize', () => _updateCanvasDimensions(container, setContainerDimensions), false);
  }, []);
  
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
  
  return (<div className={className} ref={containerRef}> 
      <canvas onMouseMove={onMouseMove} width={canvasWidth} height={canvasHeight} ref={canvasRef} />
    </div>);
}

export default Canvas;