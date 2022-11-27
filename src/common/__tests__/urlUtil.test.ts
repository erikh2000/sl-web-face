import { replaceUrlResourceExtension } from "../urlUtil";

// https://domain.com/noExtension -> https://domain.com/noExtension

describe('urlUtil', () => {
  describe('replaceUrlResourceExtension()', () => {
    it('replaces a resource extension', () => {
      const url = 'https://domain.com/somefile.png';
      const extension = '.new';
      const expected = 'https://domain.com/somefile.new';
      expect(replaceUrlResourceExtension(url, extension)).toEqual(expected);
    });

    it('replaces a resource extension in a URL with no domain', () => {
      const url = '/somefile.png';
      const extension = '.new';
      const expected = '/somefile.new';
      expect(replaceUrlResourceExtension(url, extension)).toEqual(expected);
    });

    it('replaces a resource extension without a preceding period', () => {
      const url = 'https://domain.com/somefile.png';
      const extension = 'new';
      const expected = 'https://domain.com/somefile.new';
      expect(replaceUrlResourceExtension(url, extension)).toEqual(expected);
    });

    it('replaces a resource extension under a subpath', () => {
      const url = 'https://domain.com/subpath/somefile.png';
      const extension = '.new';
      const expected = 'https://domain.com/subpath/somefile.new';
      expect(replaceUrlResourceExtension(url, extension)).toEqual(expected);
    });

    it('replaces a resource extension under a subpath that contains a period', () => {
      const url = 'https://domain.com/subpath.png/somefile.png';
      const extension = '.new';
      const expected = 'https://domain.com/subpath.png/somefile.new';
      expect(replaceUrlResourceExtension(url, extension)).toEqual(expected);
    });

    it('replaces a resource extension followed by a querystring', () => {
      const url = 'https://domain.com/somefile.png?x=2';
      const extension = '.new';
      const expected = 'https://domain.com/somefile.new?x=2';
      expect(replaceUrlResourceExtension(url, extension)).toEqual(expected);
    });

    it('replaces a resource extension followed by a querystring containing a period', () => {
      const url = 'https://domain.com/somefile.png?x=somefile.png';
      const extension = '.new';
      const expected = 'https://domain.com/somefile.new?x=somefile.png';
      expect(replaceUrlResourceExtension(url, extension)).toEqual(expected);
    });

    it('makes no replacement to resource without extension', () => {
      const url = 'https://domain.com/trap.png/somefile?x=trap2.png';
      const extension = '.new';
      const expected = 'https://domain.com/trap.png/somefile?x=trap2.png';
      expect(replaceUrlResourceExtension(url, extension)).toEqual(expected);
    });

    it('makes no replacement for a malformed URL', () => {
      const url = 'donkeys';
      const extension = '.new';
      const expected = 'donkeys';
      const wasWarn = console.warn;
      console.warn = () => {};
      expect(replaceUrlResourceExtension(url, extension)).toEqual(expected);
      console.warn = wasWarn;
    });
  });
});