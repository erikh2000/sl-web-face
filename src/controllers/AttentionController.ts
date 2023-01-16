import LidLevel from "../events/lidLevels";
import Emotion from "../events/emotions";
import FaceEventManager from "../events/FaceEventManager";

const ATTENTION_INTERVAL_RANGE = 10000;
const ATTENTION_INTERVAL_MINIMUM = 1000;

type Target = { dx:number, dy:number };

function _getRandomAttentionTarget():Target {
  return { dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 };
}

function _getRandomAttentionChangeInterval(energy:number) {
  return energy * (Math.random() * ATTENTION_INTERVAL_MINIMUM + ATTENTION_INTERVAL_RANGE);
}

function _delayChangeToRandomAttentionTarget(faceEventManager:FaceEventManager, faceId:number, energy:number):NodeJS.Timeout {
  return setTimeout(() => _changeToRandomAttentionTarget(faceEventManager, faceId, energy), _getRandomAttentionChangeInterval(energy));
}

function _changeToRandomAttentionTarget(faceEventManager:FaceEventManager, faceId:number, energy:number):NodeJS.Timeout {
  const { dx, dy } = _getRandomAttentionTarget();
  faceEventManager.setAttention(faceId, dx, dy);
  return _delayChangeToRandomAttentionTarget(faceEventManager, faceId, energy);
}

class AttentionController {
  private _faceEventManager:FaceEventManager;
  private _faceId:number;
  private _lastTimeout:NodeJS.Timeout|null;
  private _lidLevel:number;
  private _emotion:Emotion;
  private _energy:number;
  
  constructor(faceEventManager:FaceEventManager, faceId:number) {
    this._faceEventManager = faceEventManager;
    this._faceId = faceId;
    this._lastTimeout = null;
    this._lidLevel = LidLevel.NORMAL;
    this._emotion = Emotion.NEUTRAL;
    this._energy = 1;
  }

  start() {
    this._lastTimeout = _changeToRandomAttentionTarget(this._faceEventManager, this._faceId, this._energy);
  }
  
  lookAt(dx:number, dy:number) {
    if (this._lastTimeout) clearTimeout(this._lastTimeout);
    this._faceEventManager.setAttention(this._faceId, dx, dy);
    this._lastTimeout = _delayChangeToRandomAttentionTarget(this._faceEventManager, this._faceId, this._energy);
  }
  
  get energy():number { return this._energy; }
  
  set energy(energy:number) { 
    this._energy = energy;
    if (this._lastTimeout) clearTimeout(this._lastTimeout);
    this._lastTimeout = _delayChangeToRandomAttentionTarget(this._faceEventManager, this._faceId, this._energy);
  }

  stop() {
    if(this._lastTimeout) {
      clearTimeout(this._lastTimeout);
      this._lastTimeout = null;
    }
  }
}

export default AttentionController;