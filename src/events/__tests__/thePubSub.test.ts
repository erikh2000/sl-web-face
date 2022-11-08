import { subscribeEvent, publishEvent } from "../thePubSub";

describe('thePubSub', () => {
  describe('subscribeEvent()', () => {
    it('returns a handle when subscribing to a topic', () => {
      let handle = subscribeEvent('dogs', (event:any) => {});
      expect(handle).toBeDefined();
    });
    
    it('subscriber receives a published event', () => {
      let lastEvent:any = null;
      subscribeEvent('dogs', (event:any) => {
        lastEvent = event;
      });
      publishEvent('dogs', 'beagle');
      expect(lastEvent).toEqual('beagle');
    });

    it('subscriber does not receives event for unsubscribed topic', () => {
      let lastEvent:any = null;
      subscribeEvent('cats', (event:any) => {
        lastEvent = event;
      });
      publishEvent('dogs', 'beagle');
      expect(lastEvent).toEqual(null);
    });

    it('subscriber does not receive event to unsubscribed topic', () => {
      let lastEvent:any = null;
      let handle = subscribeEvent('dogs', (event:any) => {
        lastEvent = event;
      });
      handle.remove();
      publishEvent('dogs', 'beagle');
      expect(lastEvent).toEqual(null);
    });

    it('multiple subscribers receive a published event', () => {
      let lastEventA:any = null, lastEventB:any = null;
      subscribeEvent('dogs', (event:any) => {
        lastEventA = event;
      });
      subscribeEvent('dogs', (event:any) => {
        lastEventB = event;
      });
      publishEvent('dogs', 'beagle');
      expect(lastEventA).toEqual('beagle');
      expect(lastEventB).toEqual('beagle');
    });
  });

  describe('publishEvent()', () => {
    it('can publish when there are no subscriptions', () => {
      publishEvent('dog', null);
    });
  });
});