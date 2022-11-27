import {loadLipzFromText} from "./lipzFileUtil";
import LipzEvent from "./LipzEvent";
import {replaceUrlResourceExtension} from "../common/urlUtil";
import {loadWavFromUrl} from "../audio/loadAudioUtil";
import SpeechAudio from "./SpeechAudio";

async function _loadLipzFromUrl(url:string):Promise<LipzEvent[]> {
  const response = await fetch(url);
  if (response.status !== 200 && response.status !== 304) return [];
  const text = await response.text();
  return loadLipzFromText(text);
}

export async function loadSpeechFromUrl(wavUrl:string):Promise<SpeechAudio> {
  const audioBuffer = await loadWavFromUrl(wavUrl);
  const lipzUrl = replaceUrlResourceExtension(wavUrl, '.lipz.txt');
  const lipzEvents = await  _loadLipzFromUrl(lipzUrl);
  return new SpeechAudio(audioBuffer, lipzEvents);
}