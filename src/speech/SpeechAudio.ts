import LipzEvent from "./LipzEvent";
import { playAudioBuffer } from "../audio/playAudioUtil";
import EventIterator from "../events/EventIterator";
import {FRAMES_PER_SECOND} from "./lipzFileUtil";
import {publishEvent} from "../events/thePubSub";
import Topic from "../events/topics";

const CHECK_VISEME_INTERVAL = 1000 / (FRAMES_PER_SECOND * 2);

class SpeechAudio {
  private _audioBuffer:AudioBuffer;
  private _audioBufferSourceNode:AudioBufferSourceNode|null;
  private _lipzIterator:EventIterator<LipzEvent>;
  private _startPlayTime:number;
  private _checkForVisemesTimeout:NodeJS.Timeout|null;

  constructor(audioBuffer:AudioBuffer, lipzEvents:LipzEvent[]) {
    this._audioBuffer = audioBuffer;
    this._audioBufferSourceNode = null;
    this._lipzIterator = new EventIterator<LipzEvent>(lipzEvents);
    this._startPlayTime = 0;
    this._checkForVisemesTimeout = null;
  }
  
  get isPlaying() {
    return this._audioBufferSourceNode !== null;
  }
  
  stop():void {
    this._audioBufferSourceNode?.stop();
    this._audioBufferSourceNode = null;
    this._startPlayTime = 0;
    if (this._checkForVisemesTimeout) clearInterval(this._checkForVisemesTimeout);
    this._checkForVisemesTimeout = null;
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
        publishEvent(Topic.VISEME, lipzEvent.viseme);
        lipzEvent = this._lipzIterator.next(elapsed);
      }
    }, CHECK_VISEME_INTERVAL);
  }
}

export default SpeechAudio;