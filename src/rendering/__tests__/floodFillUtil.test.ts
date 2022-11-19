import { createCoordToProcessed, createCoordQueue, floodFill, floodFillAt } from "../floodFillUtil";

describe('floodFillUtil', () => {
  const WIDTH = 5, HEIGHT = 4;
  let pixels:number[][] = [];
  
  beforeEach(() => {
    pixels = [
      [0,0,0,2,0],
      [0,1,0,0,0],
      [0,0,0,2,2],
      [0,0,0,2,2]
    ];
  });
  
  function _pixelAt(x:number, y:number) { return pixels[y][x]; }
  
  describe('createCoordQueue()', () => {
    it('creates a queue that can store coords.', () => {
      const queue = createCoordQueue();
      queue.push([54,2]);
      const c = queue.pop();
      expect(c).toEqual([54,2]);
    });
  });
  
  describe('createCoordToBeProcessed()', () => {
    it('creates a 2D array that can store flags over expected area', () => {
      const array = createCoordToProcessed(WIDTH);
      array[0][0] = true;
      array[WIDTH-1][HEIGHT-1] = true;
    });

    it('creates a 2D array with unset values defaulting to falsy', () => {
      const array = createCoordToProcessed(WIDTH);
      expect(array[2][3]).toBeFalsy();
    });
  });
  
  describe('floodFillAt()', () => {
    it('evaluates all contiguously-matched pixels when starting at a matching pixel', () => {
      let foundCount = 0;
      
      function _onEval(x:number, y:number) {
        if (_pixelAt(x,y) !== 0) return false;
        ++foundCount;
        return true;
      }
      
      floodFillAt(_onEval, WIDTH, HEIGHT, 0, 0);
      
      expect(foundCount).toEqual(14);
    });

    it('finds no matching pixels when starting at a non-matching pixel', () => {
      let foundCount = 0;

      function _onEval(x:number, y:number) {
        if (_pixelAt(x,y) !== 0) return false;
        ++foundCount;
        return true;
      }

      floodFillAt(_onEval, WIDTH, HEIGHT, 3, 0);

      expect(foundCount).toEqual(0);
    });

    it('does not match non-contiguous but otherwise matching pixels', () => {
      let foundCount = 0;

      function _onEval(x:number, y:number) {
        if (_pixelAt(x,y) !== 2) return false;
        ++foundCount;
        return true;
      }

      floodFillAt(_onEval, WIDTH, HEIGHT, 4, 3);

      expect(foundCount).toEqual(4);
    });

    it('does not evaluate previously processed pixels', () => {
      let foundCount = 0;
      
      const coordToProcessed = createCoordToProcessed(WIDTH);
      coordToProcessed[3][3] = true;

      function _onEval(x:number, y:number) {
        if (_pixelAt(x,y) !== 2) return false;
        ++foundCount;
        return true;
      }

      floodFillAt(_onEval, WIDTH, HEIGHT, 4, 3, coordToProcessed);

      expect(foundCount).toEqual(3);
    });
  });
  
  describe('floodFill()', () => {
    it('finds matching pixels with multiple starting coordinates', () => {
      let foundCount = 0;
      const coordQueue = createCoordQueue();
      coordQueue.push([3,0]);
      coordQueue.push([3,3]);

      function _onEval(x:number, y:number) {
        if (_pixelAt(x,y) !== 2) return false;
        ++foundCount;
        return true;
      }
      
      floodFill(_onEval, WIDTH, HEIGHT, coordQueue);
      
      expect(foundCount).toEqual(5);
    });
  });
});