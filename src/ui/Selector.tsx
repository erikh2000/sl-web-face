import { useState } from 'react';
import styles from './Selector.module.css';

interface IProps {
  label:string,
  defaultOptionNo:number,
  optionNames:string[],
  onChange?:(optionNo:number) => void,
  onClick?:(optionNo:number) => void
}

function Selector(props:IProps) {
  const { label, optionNames, onClick, onChange, defaultOptionNo } = props;
  const [selectedOptionNo, setSelectedOptionNo] = useState<number>(defaultOptionNo);
  
  function _onOptionClick(optionNo:number) {
    if (onClick) onClick(optionNo);
    if (optionNo === selectedOptionNo) return;
    if (onChange) onChange(optionNo);
    setSelectedOptionNo(optionNo);
  }
  
  const options = optionNames.map((optionName, optionNo) => {
    const selected = optionNo === selectedOptionNo;
    const disabled:boolean = !(onClick || (onChange && !selected));
    const className = `${selected ? styles.selected : ''} ${disabled ? styles.disabled : styles.enabled}`;
    return (<button key={optionName} className={className} onClick={() => _onOptionClick(optionNo)} disabled={disabled}>{optionName}</button>)
  });
  
  return (
    <div className={styles.bar}>
      <span className={styles.label}>{label}:</span>
      {options}
    </div>  
  );
}

export default Selector;