const CLOSE_ENOUGH_TO_EQUAL = .000001;

export interface ITweenCompleteCallback { ():void }

class TweenedValue {
  private _value:number;
  private _fromValue:number;
  private _toValue:number;
  private _targetValueRange:number;
  private _tweenStartTime:number;
  private _tweenDuration:number;
  private _isComplete:boolean;
  private _onTweenComplete:ITweenCompleteCallback|null;
  
  constructor(value:number) {
    this._value = value;
    this._fromValue = this._toValue = this._tweenStartTime = this._tweenDuration = this._targetValueRange = 0;
    this._isComplete = true;
    this._onTweenComplete = null;
  }
  
  update():number {
    if (this._isComplete) return this._value;
    const elapsed = Date.now() - this._tweenStartTime;
    if (elapsed >= this._tweenDuration) {
      this._value = this._toValue;
      this._isComplete = true;
      if (this._onTweenComplete) this._onTweenComplete();
      return this._value;
    }
    this._value = this._fromValue + (elapsed / this._tweenDuration * this._targetValueRange);
    return this._value;
  }
  
  setTarget(toValue:number, duration:number, onTweenComplete:ITweenCompleteCallback|null = null) {
    this._tweenStartTime = Date.now();
    this._tweenDuration = duration;
    this._fromValue = this._value;
    this._toValue = toValue;
    this._targetValueRange = this._toValue - this._fromValue;
    this._onTweenComplete = onTweenComplete;
    this._isComplete = Math.abs(this._targetValueRange) < CLOSE_ENOUGH_TO_EQUAL;
  }
  
  get isComplete():boolean { return this._isComplete; }
  
  get value():number { return this._value; }
  
  set value(value:number) {
    this._isComplete = true;
    this._value = value;
  }
}

export default TweenedValue;