import Selector from './Selector';
import {loadSpeechFromUrl} from "../speech/speechFileUtil";
import SpeechAudio from "../speech/SpeechAudio";

const speechAudios:SpeechAudio[] = [];
const optionNames = ['Male 1', 'Male 2', 'Male 3', 'Female 1', 'Female 2', 'Female 3'];
const optionWavUrls = ['/speech/male1.wav', '/speech/male2.wav', '/speech/male3.wav', '/speech/female1.wav', '/speech/female2.wav', '/speech/female3.wav'];

interface IProps {

}

function _onChange(optionNo:number) {
  speechAudios.forEach((speechAudio, audioNo) => {
    speechAudio.stop();
  });
  if (speechAudios[optionNo]) { 
    speechAudios[optionNo].play(); 
    return; 
  }
  loadSpeechFromUrl(optionWavUrls[optionNo]).then(speechAudio => {
    speechAudios[optionNo] = speechAudio;
    speechAudio.play();
  });
}

function SaySelector(props:IProps) {
  return <Selector defaultOptionNo={0} label='Say' optionNames={optionNames} onChange={_onChange} />
}

export default SaySelector;