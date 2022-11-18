import LidLevel from "../events/lidLevels";
import Topics from '../events/topics';
import {publishEvent} from "../events/thePubSub";
import styles from './LidLevelSelector.module.css';

interface IProps {

}

function _onLidLevelClick(lidLevel:LidLevel) {
  publishEvent(Topics.LID_LEVEL, lidLevel);
}

function LidLevelSelector(props:IProps) {
  return (
    <div className={styles.bar}>
      <button onClick={() => _onLidLevelClick(LidLevel.WIDE)}>Wide</button>
      <button onClick={() => _onLidLevelClick(LidLevel.NORMAL)}>Normal</button>
      <button onClick={() => _onLidLevelClick(LidLevel.SQUINT)}>Squint</button>
      <button onClick={() => _onLidLevelClick(LidLevel.CLOSED)}>Closed</button>
    </div>  
  );
}

export default LidLevelSelector;