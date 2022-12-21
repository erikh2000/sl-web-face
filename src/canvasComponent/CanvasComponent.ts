export const UNLOADED = 'UNLOADED';

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

export const UI_PREFIX = 'ui:';

class CanvasComponent {
  private _offsetX:number;
  private _offsetY:number;
  private _isVisible:boolean;
  private _width:number;
  private _height:number;
  private _children:CanvasComponent[];
  private _parent:CanvasComponent|null;
  private _onLoad:ILoadCallback;
  private _onRender:IRenderCallback;
  private _onBoundingDimensions:IBoundingDimensionsCallback;
  private _componentState:any;
  private _loadPromise:Promise<void>|null;
  private _isLoaded:boolean;
  private _initData:any;
  private _isUi:boolean;
  
  constructor(onLoad:ILoadCallback, onRender:IRenderCallback, onBoundingDimensions:IBoundingDimensionsCallback) {
    this._offsetX = this._offsetY = 0;
    this._children = [];
    this._parent = null;
    this._onLoad = onLoad;
    this._onRender = onRender;
    this._onBoundingDimensions = onBoundingDimensions;
    this._isVisible = true;
    this._loadPromise = null;
    this._isLoaded = false;
    this._componentState = null;
    this._initData = null;
    this._isUi = false;
    this._width = this._height = 0;
  }
  
  async load(initData:any):Promise<void> {
    this._loadPromise = this._onLoad(initData);
    this._loadPromise.then((componentState:any) => {
      this._initData = initData;
      this._isLoaded = true;
      this._componentState = componentState;
      const [width, height] = this._onBoundingDimensions(componentState);
      this._width = width;
      this._height = height;
      this._isUi = initData.partType.startsWith(UI_PREFIX);
    });
    return this._loadPromise;
  }
  
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
  
  get skinTone():string { return this._initData ? this._initData.skinTone : UNLOADED; }
  
  get initData():any { return this._initData; }
  
  get isUi():boolean { return this._isUi; }
  
  set isUi(value:boolean) { this._isUi = value; }

  findNonUiChildren():CanvasComponent[] { return this._children.filter(child => !child._isUi); }
  
  setParent(parentComponent:CanvasComponent|null) {
    if (this._parent) this._parent._children = this._parent._children.filter(child => child !== this);
    this._parent = parentComponent;
    if (this._parent) this._parent._children.push(this);
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
}

export default CanvasComponent;