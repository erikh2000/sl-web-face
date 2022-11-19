import {Emotion} from "../events/emotions";
import Topics from '../events/topics';
import {publishEvent} from "../events/thePubSub";
import Selector from "./Selector";
import styles from './EmotionSelector.module.css';

const optionNames = ['Neutral', 'Confused', 'Sad', 'Afraid', 'Evil', 'Suspicious', 
  'Amused', 'Happy', 'Thinking', 'Angry', 'Irritated'];
const optionEmotions = [Emotion.NEUTRAL, Emotion.CONFUSED, Emotion.SAD, Emotion.AFRAID, Emotion.EVIL, Emotion.SUSPICIOUS, 
  Emotion.AMUSED, Emotion.HAPPY, Emotion.THINKING, Emotion.ANGRY, Emotion.IRRITATED];

interface IProps {

}

function _onChange(optionNo:number) {
  publishEvent(Topics.EMOTION, optionEmotions[optionNo]);
}

function EmotionSelector(props:IProps) {
  return <Selector defaultOptionNo={0} label='Emotion' optionNames={optionNames} onChange={_onChange} />
}

export default EmotionSelector;