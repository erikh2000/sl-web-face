import EventIterator from '../EventIterator';
import IIterableEvent from "../IIterableEvent";

class FruitEvent implements IIterableEvent {
  _time:number;
  _fruitType:string;
  
  constructor(time:number, fruitType:string) {
    this._time = time;
    this._fruitType = fruitType;
  }
  getTime() { return this._time; }
} 

describe('EventIterator', () => {
  it('Constructs with an empty array of events', () => {
    const events:IIterableEvent[] = [];
    const iterator = new EventIterator(events);
    expect(iterator.isAtEnd);
  });

  it('Constructs with an array of events', () => {
    const events:IIterableEvent[] = [{ getTime:() => 100 }];
    const iterator = new EventIterator(events);
    expect(!iterator.isAtEnd);
  });

  it('Constructs with a generic type', () => {
    const apple = new FruitEvent(100, 'apple');
    const banana = new FruitEvent(200, 'banana');
    const events:FruitEvent[] = [apple, banana];
    const iterator = new EventIterator<FruitEvent>(events);
    expect(!iterator.isAtEnd);
  });

  it('Retrieves events', () => {
    const apple = new FruitEvent(100, 'apple');
    const banana = new FruitEvent(200, 'banana');
    const events:FruitEvent[] = [apple, banana];
    const iterator = new EventIterator<FruitEvent>(events);
    let event = iterator.next(105);
    expect(event?._fruitType).toEqual('apple');
    event = iterator.next(205);
    expect(event?._fruitType).toEqual('banana');
  });

  it('Sorts out-of-order events by time', () => {
    const apple = new FruitEvent(200, 'apple');
    const banana = new FruitEvent(100, 'banana');
    const events:FruitEvent[] = [apple, banana];
    const iterator = new EventIterator<FruitEvent>(events);
    let event = iterator.next(105);
    expect(event?._fruitType).toEqual('banana');
    event = iterator.next(205);
    expect(event?._fruitType).toEqual('apple');
  });

  it('Retrieves multiple events with same time', () => {
    const apple = new FruitEvent(100, 'apple');
    const banana = new FruitEvent(100, 'banana');
    const events:FruitEvent[] = [apple, banana];
    const iterator = new EventIterator<FruitEvent>(events);
    // Order of two events at same time is not part of contract, so need
    // to test for either.
    let foundBanana = false, foundApple = false;
    let event = iterator.next(105);
    if (event?._fruitType === 'apple') foundApple = true;
    if (event?._fruitType === 'banana') foundBanana = true;
    event = iterator.next(105);
    if (event?._fruitType === 'apple') foundApple = true;
    if (event?._fruitType === 'banana') foundBanana = true;
    expect(foundApple).toBeTruthy();
    expect(foundBanana).toBeTruthy();
  });

  it('Retrieves event at time offset 0', () => {
    const apple = new FruitEvent(0, 'apple');
    const banana = new FruitEvent(100, 'banana');
    const events:FruitEvent[] = [apple, banana];
    const iterator = new EventIterator<FruitEvent>(events);
    let event = iterator.next(0);
    expect(event?._fruitType).toEqual('apple');
  });

  it('Retrieves event at time offset past last event', () => {
    const apple = new FruitEvent(0, 'apple');
    const banana = new FruitEvent(100, 'banana');
    const events:FruitEvent[] = [apple, banana];
    const iterator = new EventIterator<FruitEvent>(events);
    let event = iterator.next(105);
    expect(event?._fruitType).toEqual('banana');
  });

  it('Retrieves event at time offset matching last event', () => {
    const apple = new FruitEvent(0, 'apple');
    const banana = new FruitEvent(100, 'banana');
    const events:FruitEvent[] = [apple, banana];
    const iterator = new EventIterator<FruitEvent>(events);
    let event = iterator.next(100);
    expect(event?._fruitType).toEqual('banana');
  });

  it('Retrieves event added after construction', () => {
    const apple = new FruitEvent(0, 'apple');
    const banana = new FruitEvent(100, 'banana');
    const events:FruitEvent[] = [apple];
    const iterator = new EventIterator<FruitEvent>(events);
    iterator.addEvent(banana);
    let event = iterator.next(100);
    expect(event?._fruitType).toEqual('banana');
  });

  it('Retrieves events in reverse time order', () => {
    const apple = new FruitEvent(0, 'apple');
    const banana = new FruitEvent(100, 'banana');
    const events:FruitEvent[] = [apple, banana];
    const iterator = new EventIterator<FruitEvent>(events);
    let event = iterator.next(105);
    expect(event?._fruitType).toEqual('banana');
    event = iterator.next(0);
    expect(event?._fruitType).toEqual('apple');
  });

  it('Returns null after retrieving all events at one time offset', () => {
    const apple = new FruitEvent(100, 'apple');
    const banana = new FruitEvent(100, 'banana');
    const events:FruitEvent[] = [apple, banana];
    const iterator = new EventIterator<FruitEvent>(events);
    let event = iterator.next(105);
    expect(event).not.toBeNull();
    event = iterator.next(105);
    expect(event).not.toBeNull();
    event = iterator.next(105);
    expect(event).toBeNull();
  });
  
  it('Returns no events after clearing', () => {
    const apple = new FruitEvent(0, 'apple');
    const banana = new FruitEvent(100, 'banana');
    const events:FruitEvent[] = [apple, banana];
    const iterator = new EventIterator<FruitEvent>(events);
    iterator.clear();
    let event = iterator.next(105);
    expect(event).toBeNull();
    expect(iterator.isAtEnd);
  });
});