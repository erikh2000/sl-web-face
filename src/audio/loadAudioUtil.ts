import {theAudioContext} from "./theAudioContext";

export async function loadWavFromUrl(url:string):Promise<AudioBuffer> {
  const response = await fetch(url);
  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer();
  const ac = theAudioContext() as AudioContext;
  return await ac.decodeAudioData(arrayBuffer);
}