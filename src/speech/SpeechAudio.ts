import EventIterator from "../events/EventIterator";
import FaceEventManager from "../events/FaceEventManager";
import Viseme from "../events/visemes";

import {playAudioBuffer,} from 'sl-web-audio';
import {FRAMES_PER_SECOND, LipzEvent, loadLipzFromText} from 'sl-web-speech';

const CHECK_VISEME_INTERVAL = 1000 / (FRAMES_PER_SECOND * 2);

class SpeechAudio {
  private _audioBuffer:AudioBuffer;
  private _audioBufferSourceNode:AudioBufferSourceNode|null;
  private _lipzIterator:EventIterator<LipzEvent>;
  private _startPlayTime:number;
  private _checkForVizemesTimeout:NodeJS.Timeout|null;
  private _faceEventManager:FaceEventManager|null;
  private _faceId:number;

  constructor(audioBuffer:AudioBuffer, lipzText:string) {
    this._audioBuffer = audioBuffer;
    this._audioBufferSourceNode = null;
    const lipzEvents:LipzEvent[] = loadLipzFromText(lipzText);
    this._lipzIterator = new EventIterator<LipzEvent>(lipzEvents);
    this._startPlayTime = 0;
    this._checkForVizemesTimeout = null;
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
    if (this._checkForVizemesTimeout) clearInterval(this._checkForVizemesTimeout);
    this._checkForVizemesTimeout = null;
    if (this._faceEventManager) this._faceEventManager.setViseme(this._faceId, Viseme.REST);
  }
  
  play(onEnded?:()=>void):void {
    if (this.isPlaying) this.stop();
    this._audioBufferSourceNode = playAudioBuffer(this._audioBuffer, () => {
      this.stop()
      if (onEnded) onEnded();
    });
    this._startPlayTime = Date.now();
    
    this._checkForVizemesTimeout = setInterval(() => {
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