import {replaceUrlResourceExtension} from "../common/urlUtil";
import SpeechAudio from "./SpeechAudio";

import {loadWavFromUrl} from 'sl-web-audio';

async function _loadLipzTextFromUrl(url:string):Promise<string> {
  const response = await fetch(url, { mode: 'cors' });
  if (response.status !== 200 && response.status !== 304) return '';
  return response.text();
}

export async function loadSpeechFromUrl(wavUrl:string):Promise<SpeechAudio> {
  const wavFileData = await loadWavFromUrl(wavUrl);
  const lipzUrl = replaceUrlResourceExtension(wavUrl, '.lipz.txt');
  const lipzText = await _loadLipzTextFromUrl(lipzUrl); // TODO - use wavFileData.cues.
  return new SpeechAudio(wavFileData.audioBuffer, lipzText);
}