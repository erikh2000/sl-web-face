import {hexColorToRgb, RGB} from "../colorUtil";

describe('colorUtil', () => {
  describe('hexColorToRgb()', () => {
    it('returns 0,0,0 for empty text', () => {
      const text = '', expected:RGB = [0,0,0];
      expect(hexColorToRgb(text)).toEqual(expected);
    });
    
    it('returns 0,0,0 for 2 digits', () => {
      const text = 'aa', expected:RGB = [0,0,0];
      expect(hexColorToRgb(text)).toEqual(expected);
    });

    it('returns 0,0,0 for invalid chars', () => {
      const text = 'xxx', expected:RGB = [0,0,0];
      expect(hexColorToRgb(text)).toEqual(expected);
    });

    it('parses 000', () => {
      const text = '000', expected:RGB = [0,0,0];
      expect(hexColorToRgb(text)).toEqual(expected);
    });

    it('parses 0000000', () => {
      const text = '000000', expected:RGB = [0,0,0];
      expect(hexColorToRgb(text)).toEqual(expected);
    });

    it('parses fff', () => {
      const text = 'fff', expected:RGB = [255,255,255];
      expect(hexColorToRgb(text)).toEqual(expected);
    });

    it('parses ffffff', () => {
      const text = 'fffffff', expected:RGB = [255,255,255];
      expect(hexColorToRgb(text)).toEqual(expected);
    });
    
    it('parses upper-case', () => {
      const text = 'FFFFFF', expected:RGB = [255,255,255];
      expect(hexColorToRgb(text)).toEqual(expected);
    });

    it('parses with # prefix', () => {
      const text = '#070809', expected:RGB = [7,8,9];
      expect(hexColorToRgb(text)).toEqual(expected);
    });

    it('ignores unneeded characters', () => {
      const text = '#070809xxxxx', expected:RGB = [7,8,9];
      expect(hexColorToRgb(text)).toEqual(expected);
    });
  });
});