'use strict';

const expect = require('chai').expect;

describe('lib filter', () => {
  const { splitSearchQuery } = require('./filter');

  describe('splitSearchQuery', () => {
    [
      ['', []],
      ['a', ['a']],
      ['a b', ['a', 'b']],
      // path
      ['project/name', ['project/name']],
      // quoted & trimmed
      ['"multi word " other things ', ['multi word', 'other', 'things']],
      // unique
      ['a a a b c c b', ['a', 'b', 'c']],
    ].forEach(([input, output]) => {
      it(`converts ${JSON.stringify(input)} to ${JSON.stringify(output)}`, () => {
        expect(splitSearchQuery(input)).to.deep.equal(output);
      });
    });
  }); // splitSearchQuery
}); // suite
