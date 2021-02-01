'use strict';

const options = [
  '-created',
  'created',
  'title',
  '-title',
  '-modified',
  'modified',
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
