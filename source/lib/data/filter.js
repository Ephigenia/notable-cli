'use strict';

/**
 *
 * @param {import('./data').ParsedNote} note
 * @param {string} query
 * @param {string[]} tags
 * @return {Boolean}
 */
function filter(note, query = '', tags = null) {
  // TODO Query is YYYYMMDD then filter by date
  if (!tags && !query) return true;

  if (Array.isArray(tags) && tags.length > 0) {
    // if one tag matches the searched tags (intersection)
    if (note.metadata.tags.some(tag => tags.indexOf(tag) > -1)) return true;
  }

  if (query) {
    // match using regexp on title and content
    const regexp = new RegExp(query, 'i');
    if (
      note.metadata.tags.some(tag => regexp.test(tag)) ||
      regexp.test(note.metadata.title) ||
      regexp.test(note.content ||
      regexp.test(note.filename)
    )) return true;
  }

  return false;
}

module.exports = {
  filter
};