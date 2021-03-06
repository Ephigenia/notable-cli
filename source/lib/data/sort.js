'use strict';

const options = [
  '-score',
  'score',
  '-created',
  'created',
  'title',
  '-title',
  '-modified',
  'modified',
  '-category',
  'category',
];

/**
 * @param {import('./data').ParsedNote} a
 * @param {import('./data').ParsedNote} a
 * @param {string} field
 * @return {Number}
 */
function sort(a, b, field) {
  let modifier = v => v;
  let sort = field.replace(/^-/, '');
  if (sort !== field) {
    modifier = v => -v;
  }
  switch(sort) {
    case 'score':
      return modifier(a.score - b.score);
    case 'category':
      return modifier(String(a.category).localeCompare(String(b.category)));
    case 'created':
      return modifier(a.metadata.created - b.metadata.created);
    case 'modified':
      return modifier(a.metadata.modified - b.metadata.modified);
    case 'title':
    default:
      return modifier(String(a.metadata.title).localeCompare(String(b.metadata.title)));
  }
}

module.exports = {
  sort,
  options,
};
