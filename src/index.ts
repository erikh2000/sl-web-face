export { default as CanvasComponent } from './canvasComponent/CanvasComponent';
export { default as AttentionController } from './controllers/AttentionController';
export { default as BlinkController } from './controllers/BlinkController';
export { default as Emotion } from './events/emotions';
export { default as Topic } from './events/topics';
export { default as LidLevel } from './events/lidLevels';
export { default as Viseme } from './events/visemes';
export { default as SpeechAudio } from './speech/SpeechAudio';

export * from './events/thePubSub';
export * from './speech/speechFileUtil';
export * from './faces/faceLoaderUtil';

/* This file only imports and re-exports top-level APIs and has been excluded from Jest 
   coverage reporting in package.json. All the exports are tested via unit tests associated
   with the import module. */