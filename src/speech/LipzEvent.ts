import IIterableEvent from "../events/IIterableEvent";
import Viseme from "../events/visemes";

class LipzEvent implements IIterableEvent {
  private _time:number;
  private _viseme:Viseme;

  constructor(time:number, viseme:Viseme) {
    this._time = time;
    this._viseme = viseme;
  }

  getTime() { return this._time; }
  
  get viseme() { return this._viseme; }
}

export default LipzEvent;