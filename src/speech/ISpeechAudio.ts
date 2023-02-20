import FaceEventManager from "../events/FaceEventManager";

import {FRAMES_PER_SECOND} from 'sl-web-speech';
export const CHECK_VISEME_INTERVAL = 1000 / (FRAMES_PER_SECOND * 2);

export interface ISpeechAudio {
  get isPlaying():boolean;

  setSpeakingFace(faceEventManager:FaceEventManager, faceId:number):void;

  stop():void;

  play(onEnded?:()=>void):void;
}

export default ISpeechAudio;