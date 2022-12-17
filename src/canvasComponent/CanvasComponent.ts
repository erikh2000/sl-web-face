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

function _renderComponentWithChildrenAt(context:CanvasRenderingContext2D, component:CanvasComponent, x:number, y:number) {
  if (component.isLoaded) component.renderAt(context, x, y);
  const children = component.children;
  children.forEach(child => {
    _renderComponentWithChildrenAt(context, child, x+child.offsetX, y+child.offsetY);
  });
}

interface IRenderCallback {
  (componentState:any, context:CanvasRenderingContext2D, x:number, y:number):void
}

interface ILoadCallback {
  (initData:any):Promise<any>
}

interface IBoundingDimensionsCallback {
  (componentState:any):[width:number, height:number];
} 

class CanvasComponent {
  private _offsetX:number;
  private _offsetY:number;
  private _children:CanvasComponent[];
  private _parent:CanvasComponent|null;
  private _onLoad:ILoadCallback;
  private _onRender:IRenderCallback;
  private _onBoundingDimensions:IBoundingDimensionsCallback;
  private _componentState:any;
  private _loadPromise:Promise<void>|null;
  private _isLoaded:boolean;
  
  constructor(onLoad:ILoadCallback, onRender:IRenderCallback, onBoundingDimensions:IBoundingDimensionsCallback) {
    this._offsetX = this._offsetY = 0;
    this._children = [];
    this._parent = null;
    this._onLoad = onLoad;
    this._onRender = onRender;
    this._onBoundingDimensions = onBoundingDimensions;
    this._loadPromise = null;
    this._isLoaded = false;
    this._componentState = null;
  }
  
  async load(initData:any):Promise<void> {
    this._loadPromise = this._onLoad(initData);
    this._loadPromise.then((componentState:any) => {
      this._isLoaded = true;
      this._componentState = componentState;
    });
    return this._loadPromise;
  }

  get offsetX():number {
    return this._offsetX;
  }
  set offsetX(value:number) {
    this._offsetX = value;
  }

  get offsetY():number {
    return this._offsetY;
  }
  set offsetY(value:number) {
    this._offsetY = value;
  }

  get children():CanvasComponent[] {
    return this._children;
  }

  get parent():CanvasComponent|null {
    return this._parent;
  }
  
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
  
  render(context:CanvasRenderingContext2D) {
    if (!this._isLoaded) return;
    const [x,y] = _findAbsoluteCoords(this);
    this._onRender(this._componentState, context, x, y);
  }
  
  renderAt(context:CanvasRenderingContext2D, x:number, y:number) {
    if (!this._isLoaded) return;
    this._onRender(this._componentState, context, x, y);
  }
  
  renderWithChildren(context:CanvasRenderingContext2D) {
    const [x,y] = _findAbsoluteCoords(this);
    _renderComponentWithChildrenAt(context, this, x, y);
  }
  
  get width():number {
    const [width] = this._onBoundingDimensions(this._componentState);
    return width;
  }

  get height():number {
    const [, height] = this._onBoundingDimensions(this._componentState);
    return height;
  }
  
  get boundingRect():[x:number, y:number, width:number, height:number] {
    const [width, height] = this._onBoundingDimensions(this._componentState);
    const [x,y] = _findAbsoluteCoords(this);
    return [x, y, width, height];
  }
}

export default CanvasComponent;