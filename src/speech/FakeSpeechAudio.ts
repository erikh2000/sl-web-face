import EventIterator from "../events/EventIterator";
import FaceEventManager from "../events/FaceEventManager";
import Viseme from "../events/visemes";

import {LipzEvent, loadLipzFromText, generateLipzTextFromSpeechText} from 'sl-web-speech';
import ISpeechAudio, { CHECK_VISEME_INTERVAL } from "./ISpeechAudio";

// Class for creating lip animation simulated from speech text when there is no audio.
class FakeSpeechAudio implements ISpeechAudio {
  private _checkForVisemesTimeout:NodeJS.Timeout|null;
  private _lipzIterator:EventIterator<LipzEvent>;
  private _startPlayTime:number;
  private _faceEventManager:FaceEventManager|null;
  private _faceId:number;

  constructor(dialogue:string, speedMultiplier:number) {
    this._checkForVisemesTimeout = null;
    const lipzText = generateLipzTextFromSpeechText(dialogue, speedMultiplier);
    const lipzEvents:LipzEvent[] = loadLipzFromText(lipzText);
    this._lipzIterator = new EventIterator<LipzEvent>(lipzEvents);
    this._startPlayTime = 0;
    this._faceEventManager = null;
    this._faceId = -1;
  }

  get isPlaying() { return this._checkForVisemesTimeout !== null; }

  setSpeakingFace(faceEventManager:FaceEventManager, faceId:number) {
    this._faceEventManager = faceEventManager;
    this._faceId = faceId;
  }

  stop():void {
    this._startPlayTime = 0;
    if (this._checkForVisemesTimeout) clearInterval(this._checkForVisemesTimeout);
    this._checkForVisemesTimeout = null;
    if (this._faceEventManager) this._faceEventManager.setViseme(this._faceId, Viseme.REST);
  }

  play(onEnded?:()=>void):void {
    if (this.isPlaying) this.stop();
    this._startPlayTime = Date.now();
    this._checkForVisemesTimeout = setInterval(() => {
      const elapsed = (Date.now() - this._startPlayTime) / 1000;
      let lipzEvent = this._lipzIterator.next(elapsed);
      while(lipzEvent) {
        if (this._faceEventManager) this._faceEventManager.setViseme(this._faceId, lipzEvent.viseme);
        lipzEvent = this._lipzIterator.next(elapsed);
      }
      if (this._lipzIterator.isAtEnd) {
        this.stop();
        if (onEnded) onEnded();
      }
    }, CHECK_VISEME_INTERVAL);
  }
}

export default FakeSpeechAudio;