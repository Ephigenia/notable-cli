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
    case 'filename':
      return modifier(a.metadata.title.localeCompare(b.metadata.title));
    case 'modified':
      return modifier(a.metadata.modified - b.metadata.modified);
    case 'title':
    default:
      return modifier(a.metadata.title.localeCompare(b.metadata.title));
  }
}

module.exports = {
  sort,
  options,
};
