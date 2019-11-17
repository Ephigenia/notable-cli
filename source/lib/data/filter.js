'use strict';

/**
 * split query into "words" and only return true when all words are found
 * in the query, this way each part of the query adds another AND condition
 * to the search string
 *
 * @see https://stackoverflow.com/questions/4031900
 *
 * @param {String} query - required search string
 * @returns {Array<string>}
 */
function splitSearchQuery(query) {
  // split query by words, but keep quoted parts intact
  let queryParts = String(query).match(/\w+|"[^"]*"/g) || [];
  queryParts = queryParts
    // remove leading and trailing quotes if there are any
    .map(query => query.replace(/^"|"$/g, ''))
    // trim trailing/leading spaces
    .map(query => query.trim());
  // remove dublicates
  return Array.from(new Set(queryParts));
}

/**
 * Filtering function for searching notes
 *
 * @param {import('./data').ParsedNote} note - required note that should be
 *   filtered
 * @param {String} [query] - optional query string split into words and searching
 *   case-insensitive in tags, title, content and filename
 * @param {Array<String>} [tags] - optional array of tags that must match
 *   case-sensitive
 * @param {Boolean} [showHidden] - optional flag which also returns notes which
 *   are considerd to be "hidden"
 * @returns {boolean}
 */
function filter(note, query = '', tags = null, showHidden = false) {
  if (!tags && !query) return true;

  if (note.hidden && showHidden === false) return false;

  if (Array.isArray(tags) && tags.length > 0) {
    // if one tag matches the searched tags (intersection)
    if (note.metadata.tags.some(tag => tags.indexOf(tag) > -1)) return true;
  }


  let queryParts = splitSearchQuery(query);
  if (!queryParts || queryParts.length === 0) return false;

  const matchingParts = queryParts.filter(query => {
    // match using regexp on title and content
    const regexp = new RegExp(query, 'i');
    return (
      note.metadata.tags.some(tag => regexp.test(tag)) ||
      regexp.test(note.metadata.title) ||
      regexp.test(note.content) ||
      regexp.test(note.filename)
    );
  });

  return matchingParts.length === queryParts.length;
}

module.exports = {
  filter
};
