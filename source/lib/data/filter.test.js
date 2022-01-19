import { expect } from 'chai';
import { splitSearchQuery, searchScore, filterByQuery } from './filter.js';

describe('lib filter', () => {
  const notes = [
    {
      metadata: {
        tags: ['project', 'customer', 'meeting'],
      },
      content: 'participants note meeting note customer elasticsearch mysql',
      filename: '/Users/Ephigenia/notes/project/customer/20210504 meeting.md',
      category: 'project/customer',
    },
    {
      metadata: {
        tags: ['project', 'customer', 'story', 'problem', 'bug'],
      },
      content: 'There is a bug which seemes to be a problem for the client, we need to fix it.',
      filename: '/Users/Ephigenia/notes/project/customer/problem-xyz.md',
      category: 'project/customer',
    },
    {
      metadata: {
        tags: ['dc', 'comic', 'batman'],
      },
      content: 'batman is a comic hero from the dc comics',
      filename: '/Users/Ephigenia/notes/publishers/dc.md',
      category: 'publishers',
    },
  ];

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

  describe('search', () => {
    it('returns the notes ordered by score', () => {
      // TODO optimize assertion here
      const result = filterByQuery(notes, 'customer problem');
      expect(result).to.have.length(3);
      expect(result[0]).to.equal(notes[0]);
      expect(result[1]).to.equal(notes[1]);
      expect(result[2]).to.equal(notes[2]);
    });
    it('returns only those notes with a minimum score', () => {
      const result = filterByQuery(notes, 'customer problem', 1);
      expect(result).to.have.length(2);
    });
  }); // search

  describe('searchScore', () => {
    it('is higher with multiple matches', () => {
      expect(searchScore(notes[1], 'customer problem')).to.equal(29);
      expect(searchScore(notes[1], 'customer')).to.equal(20);
    });
  }); // searchScore
}); // suite
