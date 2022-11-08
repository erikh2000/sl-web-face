type ReceiveEventCallback = {
  (event:any):void
}

type TopicSubscriptions = {
  [topic:string]:(ReceiveEventCallback|undefined)[]
}

type SubscriptionHandle = {
  remove:() => void;
}

class PubSub {
  topicSubscriptions: TopicSubscriptions;
  
  constructor() {
    this.topicSubscriptions = {};
  }
  
  publish(topic:string, event:any) {
    let subscriptions = this.topicSubscriptions[topic];
    if (!subscriptions) return;
    for(let subscriptionI = 0; subscriptionI < subscriptions.length; ++subscriptionI) {
      const callback = subscriptions[subscriptionI];
      if (callback) callback(event);
    }
  }
  
  subscribe(topic:string, onReceiveEvent:ReceiveEventCallback):SubscriptionHandle {
    let subscriptions = this.topicSubscriptions[topic];
    if (!subscriptions) {
      subscriptions = [];
      this.topicSubscriptions[topic] = subscriptions;
    }
    let removeI = subscriptions.length;
    subscriptions.push(onReceiveEvent);
    return {
      remove: () => {
        delete subscriptions[removeI];
      }
    }
  }
}

// Singleton instance accessed through methods below.
function _thePubSub():PubSub {
  let thePubSub = (window as any).__thePubSub;
  if (!thePubSub) {
    thePubSub = new PubSub();
    (window as any).__thePubSub = thePubSub;
  }
  return thePubSub;
}

export function publishEvent(topic:string, event:any) {
  _thePubSub().publish(topic, event);
}

export function subscribeEvent(topic:string, onReceiveEvent:ReceiveEventCallback):SubscriptionHandle {
  return _thePubSub().subscribe(topic, onReceiveEvent);
}