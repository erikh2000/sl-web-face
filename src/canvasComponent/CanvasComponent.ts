import HairColor, {nameToHairColor} from "../faces/HairColor";
import {nameToSkinTone, SkinTone} from "../faces/SkinTone";
import {findDrawOrderForComponentFromHead, UNSPECIFIED_DRAW_ORDER} from "../faces/drawOrderUtil";

export const UNLOADED = 'UNLOADED';

// IDs will be unique per DOM/session.
let nextId = 1;
function _getNextId():number { return nextId++; }

function _findAbsoluteCoords(component:CanvasComponent):number[] {
  let x = 0, y = 0;
  let seekComponent:CanvasComponent|null = component;
  while(seekComponent !== null) {
    x += seekComponent.offsetX;
    y += seekComponent.offsetY;
    seekComponent = seekComponent.parent;
  }
  return [x,y];
}

function _findAbsoluteX(component:CanvasComponent):number {
  let x = 0;
  let seekComponent:CanvasComponent|null = component;
  while(seekComponent !== null) {
    x += seekComponent.offsetX;
    seekComponent = seekComponent.parent;
  }
  return x;
}

function _findAbsoluteY(component:CanvasComponent):number {
  let y = 0;
  let seekComponent:CanvasComponent|null = component;
  while(seekComponent !== null) {
    y += seekComponent.offsetY;
    seekComponent = seekComponent.parent;
  }
  return y;
}

function _renderComponentWithChildrenAt(context:CanvasRenderingContext2D, component:CanvasComponent, x:number, y:number, renderUi:boolean) {
  if (!component.isLoaded || !component.isVisible) return;
  if (component.isUi === renderUi) component.renderSelfAt(context, x, y);
  const children = component.children;
  children.forEach(child => {
    _renderComponentWithChildrenAt(context, child, x+child.offsetX, y+child.offsetY, renderUi);
  });
}

interface IRenderCallback {
  (componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number):void
}

interface ILoadCallback {
  (initData:any):Promise<any>
}

interface IBoundingDimensionsCallback {
  (componentState:any):[width:number, height:number];
}

interface IComponentStateUpdatedCallback {
  (componentState:any, componentStateChanges:any):void
}

export const UI_PREFIX = 'ui:';

function _getHairColor(hairColorName?:string):HairColor {
  try {
    if (!hairColorName) return HairColor.ORIGINAL;
    return nameToHairColor(hairColorName);
  } catch(_ignored) {
    return HairColor.ORIGINAL;
  }
}

function _getSkinTone(skinToneName?:string):SkinTone {
  try {
    if (!skinToneName) return SkinTone.ORIGINAL;
    return nameToSkinTone(skinToneName);
  } catch(_ignored) {
    return SkinTone.ORIGINAL;
  }
}

class CanvasComponent {
  // Remember to update .duplicate() to copy across values as needed.
  private _id:number;
  private _children:CanvasComponent[];
  private _componentState:any;
  private _drawOrder:number;
  private _hairColor:HairColor;
  private _height:number;
  private _initData:any;
  private _isLoaded:boolean;
  private _isUi:boolean;
  private _isVisible:boolean;
  private _offsetX:number;
  private _offsetY:number;
  private readonly _onBoundingDimensions:IBoundingDimensionsCallback;
  private readonly _onComponentStateUpdated:IComponentStateUpdatedCallback;
  private readonly _onLoad:ILoadCallback;
  private readonly _onRender:IRenderCallback;
  private _parent:CanvasComponent|null;
  private _skinTone:SkinTone;
  private _width:number;
  
  constructor(onLoad:ILoadCallback, onRender:IRenderCallback, onBoundingDimensions:IBoundingDimensionsCallback, onComponentStateUpdated:IComponentStateUpdatedCallback) {
    this._onLoad = onLoad;
    this._onRender = onRender;
    this._onBoundingDimensions = onBoundingDimensions;
    this._onComponentStateUpdated = onComponentStateUpdated;
    this._id = _getNextId();
    this._drawOrder = UNSPECIFIED_DRAW_ORDER;
    this._offsetX = this._offsetY = 0;
    this._width = this._height = 0;
    this._isUi = false;
    this._isVisible = true;
    this._initData = null;
    this._hairColor = HairColor.ORIGINAL;
    this._skinTone = SkinTone.ORIGINAL;
    this._componentState = null;
    this._parent = null;
    this._children = [];
    this._isLoaded = false;
  }

  /* Note this is just a shallow copy. If .initData or .componentState will contain mutable object instances,
     then you'll want something different, e.g. canvas components implement their own duplicate methods. */
  duplicate(includeUi:boolean = false):CanvasComponent {
    const copy = new CanvasComponent(this._onLoad, this._onRender, this._onBoundingDimensions, this._onComponentStateUpdated);
    copy.copyId(this);
    copy._drawOrder = this._drawOrder;
    copy._offsetX = this._offsetX;
    copy._offsetY = this._offsetY;
    copy._width = this._width;
    copy._height = this._height;
    copy._isUi = this._isUi;
    copy._initData = {...this._initData};
    copy._hairColor = this._hairColor;
    copy._skinTone = this._skinTone;
    copy._componentState = {...this._componentState};
    copy._isVisible = this._isVisible;
    const children = includeUi ? this._children : this.findNonUiChildren();
    copy._children = children.map(child => {
      const childDuplicate = child.duplicate();
      childDuplicate.setParent(copy);
      return childDuplicate;
    });
    copy._isLoaded = true;
    
    return copy;
  }
  
  async load(initData:any):Promise<void> {
    const loadPromise = this._onLoad(initData);
    loadPromise.then((componentState:any) => {
      this._initData = initData;
      this._isLoaded = true;
      this._componentState = componentState;
      const [width, height] = this._onBoundingDimensions(componentState);
      this._width = width;
      this._height = height;
      this._isUi = initData.partType.startsWith(UI_PREFIX);
      this._hairColor = _getHairColor(initData.hairColor);
      this._skinTone = _getSkinTone(initData.skinTone);
    });
    return loadPromise;
  }
  
  get id():number { return this._id; }
  
  get x():number { return _findAbsoluteX(this); }
  
  set x(value:number) {
    const oldX = _findAbsoluteX(this);
    this._offsetX += (value - oldX);
  }
  
  get y():number { return _findAbsoluteY(this); }

  set y(value:number) {
    const oldY = _findAbsoluteY(this);
    this._offsetY += (value - oldY);
  }
  
  get isVisible():boolean { return this._isVisible; }
  
  set isVisible(value:boolean) { this._isVisible = value; }

  get offsetX():number { return this._offsetX; }
  
  set offsetX(value:number) { this._offsetX = value; }

  get offsetY():number { return this._offsetY; }
  
  set offsetY(value:number) { this._offsetY = value; }

  get width():number { return this._width; }
  
  set width(width:number) { this._width = width; }

  get height():number { return this._height; }

  set height(height:number) { this._height = height; }

  get boundingRect():[x:number, y:number, width:number, height:number] {
    const [x,y] = _findAbsoluteCoords(this);
    return [x, y, this._width, this._height];
  }

  get children():CanvasComponent[] { return this._children; }

  get parent():CanvasComponent|null { return this._parent; }
  
  get partType():string { return this._initData ? this._initData.partType : UNLOADED; }
  
  get partUrl():string { return this._initData ? this._initData.partUrl : UNLOADED; }
  
  get skinTone():SkinTone { return this._skinTone }

  get hairColor():HairColor { return this._hairColor; }
  
  get initData():any { return this._initData; }
  
  get isUi():boolean { return this._isUi; }
  
  set isUi(value:boolean) { this._isUi = value; }
  
  get drawOrder():number { return this._drawOrder; }
  
  set drawOrder(value:number) { this._drawOrder = value; } 

  copyId(fromComponent:CanvasComponent) { this._id = fromComponent._id; }

  findNonUiChildren():CanvasComponent[] { return this._children.filter(child => !child._isUi); }
  
  setParent(parentComponent:CanvasComponent|null) {
    if (this._parent) this._parent._children = this._parent._children.filter(child => child !== this);
    this._parent = parentComponent;
    if (this._parent) {
      if (this.drawOrder === UNSPECIFIED_DRAW_ORDER) { this.drawOrder = findDrawOrderForComponentFromHead(this._parent, this); }
      this._parent._children.push(this);
    }
  }
  
  addChild(childComponent:CanvasComponent) {
    childComponent._parent = this;
    this._children.push(childComponent);
  }
  
  addChildAt(childComponent:CanvasComponent, offsetX:number, offsetY:number) {
    childComponent.offsetX = offsetX;
    childComponent.offsetY = offsetY;
    this.addChild(childComponent);
  }
  
  removeChild(childComponent:CanvasComponent) {
    childComponent.setParent(null);
  }
  
  get isLoaded():boolean {
    return this._isLoaded;
  }
  
  renderSelfAt(context:CanvasRenderingContext2D, x:number, y:number) {
    this._onRender(this._componentState, context, x, y, this._width, this._height);
  }
  
  renderAt(context:CanvasRenderingContext2D, x:number, y:number) {
    if (!this._isLoaded || !this._isVisible) return;
    _renderComponentWithChildrenAt(context, this, x, y, false);
    _renderComponentWithChildrenAt(context, this, x, y, true);
  }
  
  render(context:CanvasRenderingContext2D) {
    const [x,y] = _findAbsoluteCoords(this);
    this.renderAt(context, x, y);
  }
  
  toString():string { return `#${this._id} ${this._initData.partType}@${this._offsetX},${this._offsetY}`; }
  
  toVerboseString():string {
    let concat = `${this.toString()}\n`;
    this.children.forEach(child => {
      concat += `  ${child.toVerboseString()}\n`;
    });
    return concat;
  }
  
  updateComponentState(changes:any) {
    this._componentState = { ...this._componentState, ...changes };
    this._onComponentStateUpdated(this._componentState, changes);
  }
}

export default CanvasComponent;