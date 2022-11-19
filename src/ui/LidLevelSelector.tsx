import LidLevel from "../events/lidLevels";
import Topics from '../events/topics';
import {publishEvent} from "../events/thePubSub";
import Selector from './Selector';

const optionNames = ['Wide', 'Normal', 'Squint', 'Closed'];
const optionLidLevels = [LidLevel.WIDE, LidLevel.NORMAL, LidLevel.SQUINT, LidLevel.CLOSED];

interface IProps {

}

function _onChange(optionNo:number) {
  publishEvent(Topics.LID_LEVEL, optionLidLevels[optionNo]);
}

function LidLevelSelector(props:IProps) {
  return <Selector defaultOptionNo={1} label='Lids' optionNames={optionNames} onChange={_onChange} />
}

export default LidLevelSelector;