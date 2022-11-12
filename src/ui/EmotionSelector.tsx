import {Emotion} from "../events/emotions";
import Topics from '../events/topics';
import {publishEvent} from "../events/thePubSub";
import styles from './EmotionSelector.module.css';

interface IProps {

}

function _onEmotionClick(emotion:Emotion) {
  publishEvent(Topics.EMOTION, emotion);
}

function EmotionSelector(props:IProps) {
  return (
    <div className={styles.bar}>
      <button onClick={() => _onEmotionClick(Emotion.NEUTRAL)}>Neutral</button>
      <button onClick={() => _onEmotionClick(Emotion.CONFUSED)}>Confused</button>
      <button onClick={() => _onEmotionClick(Emotion.SAD)}>Sad</button>
      <button onClick={() => _onEmotionClick(Emotion.AFRAID)}>Afraid</button>
      <button onClick={() => _onEmotionClick(Emotion.EVIL)}>Evil</button>
      <button onClick={() => _onEmotionClick(Emotion.SUSPICIOUS)}>Suspicious</button>
      <button onClick={() => _onEmotionClick(Emotion.AMUSED)}>Amused</button>
      <button onClick={() => _onEmotionClick(Emotion.HAPPY)}>Happy</button>
      <button onClick={() => _onEmotionClick(Emotion.THINKING)}>Thinking</button>
      <button onClick={() => _onEmotionClick(Emotion.ANGRY)}>Angry</button>
      <button onClick={() => _onEmotionClick(Emotion.IRRITATED)}>Irritated</button>
    </div>
  );
}

export default EmotionSelector;