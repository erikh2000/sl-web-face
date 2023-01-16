import Emotion from "./emotions";
import LidLevel from "./lidLevels";
import {publishEvent, subscribeEvent} from "./thePubSub";
import Topic from "./topics";
import Viseme from "./visemes";
import CanvasComponent from "../canvasComponent/CanvasComponent";
import {EYES_PART_TYPE} from "../parts/eyes/eyes";
import {MOUTH_PART_TYPE} from "../parts/mouth/mouth";

type FaceState = {
  attentionTarget:[dx:number, dy:number],
  emotion:Emotion,
  lastBlinkTime:number
  restingLidLevel:LidLevel,
  viseme:Viseme
}

type FaceBinding = {
  faceState:FaceState,
  headComponent:CanvasComponent,
  eyesComponent:CanvasComponent|null,
  mouthComponent:CanvasComponent|null
}

type FaceNameToIdMap = {
  [faceName:string]:number
}

function _createDefaultFaceState():FaceState {
  return {
    attentionTarget:[0,0],
    emotion:Emotion.NEUTRAL,
    lastBlinkTime:0,
    restingLidLevel:LidLevel.NORMAL,
    viseme:Viseme.REST
  };
}

function _initializeFaceBindingComponents(faceBinding:FaceBinding) {
  const { faceState, eyesComponent, mouthComponent } = faceBinding;
  const { attentionTarget, emotion, lastBlinkTime, restingLidLevel, viseme } = faceState; 
  if (eyesComponent) eyesComponent.updateComponentState({ attentionTarget, emotion, lastBlinkTime, restingLidLevel });
  if (mouthComponent) mouthComponent.updateComponentState({ emotion, viseme });
}

function _findComponentByPartType(headComponent:CanvasComponent, partTypeName:string):CanvasComponent|null {
  return headComponent.children.find(child => child.partType === partTypeName) ?? null;
}

function _onBlinkEvent(faceBinding?:FaceBinding) {
  if (!faceBinding) return;
  const { faceState, eyesComponent } = faceBinding;
  faceState.lastBlinkTime = Date.now();
  if (eyesComponent) eyesComponent.updateComponentState({ lastBlinkTime:faceState.lastBlinkTime });
}

function _onAttentionEvent(attentionTarget:[dx:number, dy:number], faceBinding?:FaceBinding) {
  if (!faceBinding) return;
  const { faceState, eyesComponent } = faceBinding;
  faceState.attentionTarget = attentionTarget;
  if (eyesComponent) eyesComponent.updateComponentState({ attentionTarget });
}

function _onEmotionEvent(emotion:Emotion, faceBinding?:FaceBinding) {
  if (!faceBinding) return;
  const { faceState, eyesComponent, mouthComponent } = faceBinding;
  faceState.emotion = emotion;
  if (eyesComponent) eyesComponent.updateComponentState({ emotion });
  if (mouthComponent) mouthComponent.updateComponentState({ emotion });
}

function _onLidLevelEvent(restingLidLevel:LidLevel, faceBinding?:FaceBinding) {
  if (!faceBinding) return;
  const { faceState, eyesComponent } = faceBinding;
  faceState.restingLidLevel = restingLidLevel;
  if (eyesComponent) eyesComponent.updateComponentState({ restingLidLevel });
}

function _onVisemeEvent(viseme:Viseme, faceBinding?:FaceBinding) {
  if (!faceBinding) return;
  const { faceState, mouthComponent } = faceBinding;
  faceState.viseme = viseme;
  if (mouthComponent) mouthComponent.updateComponentState({ viseme });
}

class FaceEventManager {
  private _faceBindings:FaceBinding[];
  private _faceNameToIdMap:FaceNameToIdMap;
  
  constructor() {
    this._faceBindings = [];
    this._faceNameToIdMap = {};
    subscribeEvent(Topic.BLINK, (event:any) => _onBlinkEvent(this._faceBindings[event.faceId]));
    subscribeEvent(Topic.ATTENTION, (event:any) => _onAttentionEvent([event.dx, event.dy], this._faceBindings[event.faceId]));
    subscribeEvent(Topic.EMOTION, (event:any) => _onEmotionEvent(event.emotion, this._faceBindings[event.faceId]));
    subscribeEvent(Topic.LID_LEVEL, (event:any) => _onLidLevelEvent(event.restingLidLevel, this._faceBindings[event.faceId]));
    subscribeEvent(Topic.VISEME, (event:any) => _onVisemeEvent(event.viseme, this._faceBindings[event.faceId]));
  }

  blink(faceId:number) { 
    publishEvent(Topic.BLINK, { faceId }); 
  }
  
  setAttention(faceId:number, dx:number, dy:number) { 
    publishEvent(Topic.ATTENTION, { faceId, dx, dy }); 
  }
  
  setEmotion(faceId:number, emotion:Emotion) { 
    publishEvent(Topic.EMOTION, { faceId, emotion });
  }
  
  setLidLevel(faceId:number, restingLidLevel:LidLevel) {
    publishEvent(Topic.LID_LEVEL, { faceId, restingLidLevel });
  }
  
  setViseme(faceId:number, viseme:Viseme) {
    publishEvent(Topic.VISEME, { faceId, viseme });
  }
  
  findFaceIdForName(faceName:string):number|null {
    const faceId = this._faceNameToIdMap[faceName];
    return faceId === undefined ? null : faceId;
  }

  bindFace(faceName:string, headComponent:CanvasComponent):number {
    let faceId = this._faceNameToIdMap[faceName];
    if (faceId === undefined) {
      faceId = this._faceBindings.length;
      this._faceNameToIdMap[faceName] = faceId;
    }
    
    const currentFaceBinding = this._faceBindings[faceId];
    const faceState = currentFaceBinding ? currentFaceBinding.faceState : _createDefaultFaceState();
    const eyesComponent = _findComponentByPartType(headComponent, EYES_PART_TYPE);
    const mouthComponent = _findComponentByPartType(headComponent, MOUTH_PART_TYPE);
    const faceBinding = { faceState, headComponent, eyesComponent, mouthComponent };
    this._faceBindings[faceId] = faceBinding;
    _initializeFaceBindingComponents(faceBinding); // A newly-bound face may not have missed state-updating events, so send all state.
    
    return faceId;
  }
}

export default FaceEventManager;