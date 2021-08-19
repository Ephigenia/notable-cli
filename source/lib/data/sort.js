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
  let fieldname = field.replace(/^-/, '');
  if (fieldname !== field) {
    modifier = v => -v;
  }
  switch(fieldname) {
    case 'category':
      return modifier(String(a.category).localeCompare(String(b.category)));
    case 'score':
      return modifier(a.score - b.score);
    case 'created':
    case 'modified':
      if (!(a.metadata[String(fieldname)] instanceof Date)) return modifier(1);
      if (!(b.metadata[String(fieldname)] instanceof Date)) return modifier(1);
      return modifier(a.metadata[String(fieldname)] - b.metadata[String(fieldname)]);
    case 'title':
    default:
      return modifier(String(a.metadata.title).localeCompare(String(b.metadata.title)));
  }
}

module.exports = {
  sort,
  options,
};
