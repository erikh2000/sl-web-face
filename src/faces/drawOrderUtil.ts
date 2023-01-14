import CanvasComponent from "../canvasComponent/CanvasComponent";
import {EXTRA_PART_TYPE} from "../parts/extra/extra";
import {HEAD_PART_TYPE} from "../parts/head/head";
import {EYES_PART_TYPE} from "../parts/eyes/eyes";
import {MOUTH_PART_TYPE} from "../parts/mouth/mouth";
import {NOSE_PART_TYPE} from "../parts/nose/nose";

export type NextDrawOrders = {
  beforeHead:number,
  afterHead:number,
  afterEyes:number,
  afterMouth:number,
  afterNose:number
}

export const UNSPECIFIED_DRAW_ORDER = -1;
const HEAD_DRAW_ORDER = 100, EYES_DRAW_ORDER = 200, MOUTH_DRAW_ORDER = 300, NOSE_DRAW_ORDER = 400;

export function createNextDrawOrders(headComponent:CanvasComponent):NextDrawOrders {
  const nextDrawOrders:NextDrawOrders = {
    beforeHead: 0,
    afterHead: HEAD_DRAW_ORDER+1,
    afterEyes: EYES_DRAW_ORDER+1,
    afterMouth: MOUTH_DRAW_ORDER+1,
    afterNose: NOSE_DRAW_ORDER+1
  };

  const children = headComponent.children;
  children.forEach(child => {
    if (child.partType !== EXTRA_PART_TYPE) return;
    const placeAfter = child.initData.placeAfter;
    if (!placeAfter) return;
    const afterChildDrawOrder = child.drawOrder+1;
    switch (placeAfter) {
      case HEAD_PART_TYPE: nextDrawOrders.afterHead = Math.max(nextDrawOrders.afterHead, afterChildDrawOrder); break;
      case EYES_PART_TYPE: nextDrawOrders.afterEyes = Math.max(nextDrawOrders.afterEyes, afterChildDrawOrder); break;
      case MOUTH_PART_TYPE: nextDrawOrders.afterMouth = Math.max(nextDrawOrders.afterMouth, afterChildDrawOrder); break;
      case NOSE_PART_TYPE: nextDrawOrders.afterNose = Math.max(nextDrawOrders.afterNose, afterChildDrawOrder); break;
      default: //placeAfter="none" 
        nextDrawOrders.beforeHead = Math.max(nextDrawOrders.beforeHead, afterChildDrawOrder); break;
    }
  });

  return nextDrawOrders;
}

export function findDrawOrderForComponent(childComponent:CanvasComponent, nextDrawOrders:NextDrawOrders):number {
  switch(childComponent.partType) {
    case HEAD_PART_TYPE: return HEAD_DRAW_ORDER;
    case EYES_PART_TYPE: return EYES_DRAW_ORDER;
    case MOUTH_PART_TYPE: return MOUTH_DRAW_ORDER;
    case NOSE_PART_TYPE: return NOSE_DRAW_ORDER;
    case EXTRA_PART_TYPE:
      const placeAfter = childComponent.initData.placeAfter;
      if (!placeAfter) return UNSPECIFIED_DRAW_ORDER;
      switch (placeAfter) {
        case HEAD_PART_TYPE: return (nextDrawOrders.afterHead)++;
        case EYES_PART_TYPE: return (nextDrawOrders.afterEyes)++;
        case MOUTH_PART_TYPE: return (nextDrawOrders.afterMouth)++;
        case NOSE_PART_TYPE: return (nextDrawOrders.afterNose)++;
        default: //placeAfter="none" 
          return (nextDrawOrders.beforeHead)++;
      }
    default:
      return UNSPECIFIED_DRAW_ORDER;
  }
}

// Use findDrawOrderForComponent() when batching for better performance.
export function findDrawOrderForComponentFromHead(headComponent:CanvasComponent, childComponent:CanvasComponent):number {
  const nextDrawOrders = createNextDrawOrders(headComponent);
  return findDrawOrderForComponent(childComponent, nextDrawOrders);
}

export function sortHeadChildrenInDrawingOrder(headComponent:CanvasComponent) {
  function compareParts(a:CanvasComponent, b:CanvasComponent):number {
    if (a.isUi) return b.isUi ? 0 : 1; // Sort UI components after non-UI.
    if (b.isUi) return -1;
    return a.drawOrder - b.drawOrder;
  }
  headComponent.children.sort(compareParts);
}