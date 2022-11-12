import {Viseme} from "../events/visemes";
import Topics from '../events/topics';
import {publishEvent} from "../events/thePubSub";
import styles from './VisemeSelector.module.css';

interface IProps {
  
}

function _onVisemeClick(viseme:Viseme) {
  publishEvent(Topics.VISEME, viseme);
}

function VisemeSelector(props:IProps) {
  return (
    <div className={styles.bar}>
      <button onClick={() => _onVisemeClick(Viseme.REST)}>-</button>
      <button onClick={() => _onVisemeClick(Viseme.AI)}>AI</button>
      <button onClick={() => _onVisemeClick(Viseme.CONS)}>Cons</button>
      <button onClick={() => _onVisemeClick(Viseme.E)}>E</button>
      <button onClick={() => _onVisemeClick(Viseme.FV)}>FV</button>
      <button onClick={() => _onVisemeClick(Viseme.L)}>L</button>
      <button onClick={() => _onVisemeClick(Viseme.O)}>O</button>
      <button onClick={() => _onVisemeClick(Viseme.MBP)}>MBP</button>
      <button onClick={() => _onVisemeClick(Viseme.U)}>U</button>
      <button onClick={() => _onVisemeClick(Viseme.WQ)}>WQ</button>
    </div>
  );
}

export default VisemeSelector;