import { theAudioContext, attachSource, clearSources, releaseSource, getSources } from "./theAudioContext";

export interface IPlayAudioEndedCallback {
  (source:AudioBufferSourceNode):void;
}

export function playAudioBufferRange(audioBuffer:AudioBuffer, time:number, duration:number, onEnded:IPlayAudioEndedCallback|null = null):AudioBufferSourceNode {
  const ac = theAudioContext();
  if (!ac) throw Error('Missing audio context');
  const source = ac.createBufferSource();
  attachSource(source);
  source.buffer = audioBuffer;
  source.connect(ac.destination);
  const listener = (event:any) => {
    source.removeEventListener('ended', listener);
    releaseSource(source);
    if (onEnded) onEnded((source as any).wasStopped);
  };
  source.addEventListener('ended', listener);
  source.start(0, time, duration);
  return source;
}

export function playAudioBuffer(audioBuffer:AudioBuffer, onEnded:IPlayAudioEndedCallback|null = null):AudioBufferSourceNode {
  const ac = theAudioContext();
  if (!ac) throw Error('Missing audio context');
  const source = ac.createBufferSource();
  attachSource(source);
  source.buffer = audioBuffer;
  source.connect(ac.destination);
  const listener = () => {
    source.removeEventListener('ended', listener);
    releaseSource(source);
    if (onEnded) onEnded((source as any).wasStopped);
  }
  source.addEventListener('ended', listener);
  source.start(0);
  return source;
}

export function stopAll() {
  const sources = getSources();
  sources.forEach((source:AudioBufferSourceNode) => {
    (source as any).wasStopped = true;
    source.stop(0);
  });
  clearSources();
}