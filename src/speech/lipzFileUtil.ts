import { phonemeToViseme } from "./phonemeUtil";
import LipzEvent from "./LipzEvent";

export const FRAMES_PER_SECOND = 24;
const END_PHONEME_CHAR = '.';

export function loadLipzFromText(phonemesText:string) {
  if (phonemesText.endsWith('.')) phonemesText += ' '; // Changing the ending char allow loop logic below to not have "end of file" special-casing.
  const events:LipzEvent[] = [];
  let frameNo = 0;
  let phoneme = "";

  for (let i = 0; i < phonemesText.length; ++i) {
    const c = phonemesText[i];
    if (c === ' ') {
      ++frameNo;
    } else if (c === END_PHONEME_CHAR) {
      const viseme = phonemeToViseme(phoneme);
      const time = frameNo / FRAMES_PER_SECOND;
      events.push(new LipzEvent(time, viseme));
      ++frameNo;
      phoneme = '';
    } else {
      phoneme += c;
    }
  }
  return events;
}