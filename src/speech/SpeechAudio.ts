import EventIterator from "../events/EventIterator";
import FaceEventManager from "../events/FaceEventManager";
import Viseme from "../events/visemes";

import {playAudioBuffer,} from 'sl-web-audio';
import { LipzEvent, loadLipzFromText} from 'sl-web-speech';
import ISpeechAudio, { CHECK_VISEME_INTERVAL } from "./ISpeechAudio";

class SpeechAudio implements ISpeechAudio {
  private _audioBuffer:AudioBuffer;
  private _audioBufferSourceNode:AudioBufferSourceNode|null;
  private _lipzIterator:EventIterator<LipzEvent>;
  private _startPlayTime:number;
  private _checkForVisemesTimeout:NodeJS.Timeout|null;
  private _faceEventManager:FaceEventManager|null;
  private _faceId:number;

  constructor(audioBuffer:AudioBuffer, lipz:string|LipzEvent[]) {
    this._audioBuffer = audioBuffer;
    this._audioBufferSourceNode = null;
    const lipzEvents:LipzEvent[] = typeof lipz === 'string' ? loadLipzFromText(lipz) : lipz;
    this._lipzIterator = new EventIterator<LipzEvent>(lipzEvents);
    this._startPlayTime = 0;
    this._checkForVisemesTimeout = null;
    this._faceEventManager = null;
    this._faceId = -1;
  }
  
  get isPlaying() {
    return this._audioBufferSourceNode !== null;
  }
  
  setSpeakingFace(faceEventManager:FaceEventManager, faceId:number) {
    this._faceEventManager = faceEventManager;
    this._faceId = faceId;
  }
  
  stop():void {
    this._audioBufferSourceNode?.stop();
    this._audioBufferSourceNode = null;
    this._startPlayTime = 0;
    if (this._checkForVisemesTimeout) clearInterval(this._checkForVisemesTimeout);
    this._checkForVisemesTimeout = null;
    if (this._faceEventManager) this._faceEventManager.setViseme(this._faceId, Viseme.REST);
  }
  
  play(onEnded?:()=>void):void {
    if (this.isPlaying) this.stop();
    this._audioBufferSourceNode = playAudioBuffer(this._audioBuffer, () => {
      this.stop()
      if (onEnded) onEnded();
    });
    this._startPlayTime = Date.now();
    
    this._checkForVisemesTimeout = setInterval(() => {
      const elapsed = (Date.now() - this._startPlayTime) / 1000;
      let lipzEvent = this._lipzIterator.next(elapsed);
      while(lipzEvent) {
        if (this._faceEventManager) this._faceEventManager.setViseme(this._faceId, lipzEvent.viseme);
        lipzEvent = this._lipzIterator.next(elapsed);
      }
    }, CHECK_VISEME_INTERVAL);
  }
}

export default SpeechAudio;