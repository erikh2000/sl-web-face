import {Viseme} from "../events/visemes";
import Topics from '../events/topics';
import {publishEvent} from "../events/thePubSub";
import Selector from "./Selector";


const optionNames = ['-', 'AI', 'Cons', 'E', 'FV', 'L', 'O', 'MBP', 'U', 'WQ'];
const optionVisemes = [Viseme.REST, Viseme.AI, Viseme.CONS, Viseme.E, Viseme.FV, Viseme.L, Viseme.O, Viseme.MBP, Viseme.U, Viseme.WQ];

interface IProps {
  
}

function _onChange(optionNo:number) {
  publishEvent(Topics.VISEME, optionVisemes[optionNo]);
}

function VisemeSelector(props:IProps) {
  return <Selector defaultOptionNo={0} label='Viseme' optionNames={optionNames} onChange={_onChange} />
}

export default VisemeSelector;