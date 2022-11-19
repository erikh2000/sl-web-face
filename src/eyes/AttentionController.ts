import { publishEvent, subscribeEvent } from "../events/thePubSub";
import Topics from "../events/topics";
import LidLevel from "../events/lidLevels";
import {Emotion} from "../events/emotions";

const ATTENTION_INTERVAL_RANGE = 10000;
const ATTENTION_INTERVAL_MINIMUM = 1000;

type Target = { dx:number, dy:number };

function _getRandomAttentionTarget():Target {
  return { dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 };
}

function _changeToRandomAttentionTarget(energy:number):NodeJS.Timeout {
  const target = _getRandomAttentionTarget();
  publishEvent(Topics.ATTENTION, target);
  return setTimeout(() => _changeToRandomAttentionTarget(energy), _getRandomAttentionChangeInterval(energy));
}

function _getRandomAttentionChangeInterval(energy:number) {
  return energy * (Math.random() * ATTENTION_INTERVAL_MINIMUM + ATTENTION_INTERVAL_RANGE);
}

//  NEUTRAL, CONFUSED, SAD, AFRAID, EVIL, SUSPICIOUS, AMUSED, HAPPY, THINKING, ANGRY, IRRITATED
const emotionEnergyAmounts = 
    [1,      2,        1,   2,      4,    3,          2,      3,     1,        4,     3];
const MAX_AMOUNT = 6;
function _calcEnergy(lidLevel:LidLevel, emotion:Emotion) {
  const lidAmount:number = lidLevel * 2;
  const emotionAmount = emotionEnergyAmounts[emotion];
  const amount = Math.min(lidAmount + emotionAmount, MAX_AMOUNT);
  return 1 / amount;
}

class AttentionController {
  lastTimeout:NodeJS.Timeout|null = null;
  lidLevel:number = LidLevel.NORMAL;
  emotion:Emotion = Emotion.NEUTRAL;
  energy:number = 1;
  
  private _onLidLevelChange = (lidLevel:LidLevel) => {
    this.lidLevel = lidLevel;
    this.energy = _calcEnergy(this.lidLevel, this.emotion);
  }

  private _onEmotionChange = (emotion:Emotion) => {
    this.emotion = emotion;
    this.energy = _calcEnergy(this.lidLevel, this.emotion);
  }

  start() {
    this.energy = _calcEnergy(this.lidLevel, this.emotion);
    this.lastTimeout = _changeToRandomAttentionTarget(this.energy);
    subscribeEvent(Topics.LID_LEVEL, this._onLidLevelChange);
    subscribeEvent(Topics.EMOTION, this._onEmotionChange);
  }
  
  lookAt(dx:number, dy:number) {
    if (this.lastTimeout) clearTimeout(this.lastTimeout);
    publishEvent(Topics.ATTENTION, {dx, dy});
    return setTimeout(() => _changeToRandomAttentionTarget(this.energy), _getRandomAttentionChangeInterval(this.energy));
  }

  stop() {
    if(this.lastTimeout) {
      clearTimeout(this.lastTimeout);
      this.lastTimeout = null;
    }
  }
}

export default AttentionController;