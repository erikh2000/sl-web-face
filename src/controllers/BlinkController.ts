import FaceEventManager from "../events/FaceEventManager";

const BLINK_INTERVAL_RANGE = 5000;
const BLINK_INTERVAL_MINIMUM = 500;
  
function _blink(faceEventManager:FaceEventManager, faceId:number):NodeJS.Timeout {
  faceEventManager.blink(faceId);
  return setTimeout(() => _blink(faceEventManager, faceId), Math.random() * BLINK_INTERVAL_RANGE + BLINK_INTERVAL_MINIMUM);
}

class BlinkController {
  private _lastTimeout:NodeJS.Timeout|null;
  private _faceEventManager:FaceEventManager;
  private _faceId:number;
  
  constructor(faceEventManager:FaceEventManager, faceId:number) {
    this._lastTimeout = null;
    this._faceEventManager = faceEventManager;
    this._faceId = faceId;
  }
  
  start() {
    this._lastTimeout = _blink(this._faceEventManager, this._faceId);
  }
  
  stop() {
    if(this._lastTimeout) {
      clearTimeout(this._lastTimeout);
      this._lastTimeout = null;
    }  
  }
}

export default BlinkController;