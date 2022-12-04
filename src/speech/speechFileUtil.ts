import {replaceUrlResourceExtension} from "../common/urlUtil";
import SpeechAudio from "./SpeechAudio";

import {loadWavFromUrl} from 'sl-web-audio';
import {loadLipzFromText, LipzEvent } from 'sl-web-speech';

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