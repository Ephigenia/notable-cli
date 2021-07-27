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
    case 'category':
      return modifier(String(a.category).localeCompare(String(b.category)));
    case 'score':
    case 'created':
    case 'modified':
      if (!(a.metadata[String(sort)] instanceof Date)) return modifier(1);
      if (!(b.metadata[String(sort)] instanceof Date)) return modifier(1);
      return modifier(a.metadata[String(sort)] - b.metadata[String(sort)]);
    case 'title':
    default:
      return modifier(String(a.metadata.title).localeCompare(String(b.metadata.title)));
  }
}

module.exports = {
  sort,
  options,
};
