import { publishEvent } from "../../events/thePubSub";
import Topics from "../../events/topics";

const BLINK_INTERVAL_RANGE = 5000;
const BLINK_INTERVAL_MINIMUM = 500;
  
function _blink():NodeJS.Timeout {
  publishEvent(Topics.BLINK, {});
  return setTimeout(_blink, Math.random() * BLINK_INTERVAL_RANGE + BLINK_INTERVAL_MINIMUM);
}

class BlinkController {
  lastTimeout:NodeJS.Timeout|null = null;
  
  start() {
    this.lastTimeout = _blink();
  }
  
  stop() {
    if(this.lastTimeout) {
      clearTimeout(this.lastTimeout);
      this.lastTimeout = null;
    }  
  }
}

export default BlinkController;