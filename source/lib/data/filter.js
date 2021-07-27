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
  // split query by words, but keep quoted parts and paths intact
  let queryParts = String(query).match(/[\w/]+|"[^"]*"/g) || [];
  queryParts = queryParts
    // remove leading and trailing quotes if there are any
    .map(query => query.replace(/^"|"$/g, ''))
    // trim trailing/leading spaces
    .map(query => query.trim());
  // remove dublicates
  return Array.from(new Set(queryParts));
}

/**
 * Calculates a score for the given note which indicates how good the query
 * matches the note’s content
 *
 * @param {import('./data').ParsedNote} note the note
 * @param {string} query
 */
function searchScore(note, query) {
  let score = 0;

  let terms = splitSearchQuery(query);
  terms.forEach(term => {
    let regexp = new RegExp(term, 'gi');
    if (note.category) score += Number(note.category.indexOf(term) > 0) * 12;
    // the more parts of the query match to highter the score should be
    // matches in the tags of a note should have highest impact on score
    score += note.metadata.tags.filter(tag => String(tag).match(term)).length * 6;
    // matches in the path of the file should have lower impact
    score += Number(note.filename.includes(term)) * 2;
    // exacth match in the content of the note has lowest impact
    score += [...note.content.matchAll(regexp)].length * 1;
  });
  return score;
}

function scoredSearch(notes, query) {
  notes.forEach(note => note.score = searchScore(note, query));
  return notes;
}

function filterByQuery(notes, query, minimumPercentile = 0) {
  if (!query) return notes;
  if (!notes.length) return notes;

  const scoredNotes = scoredSearch(notes, query);
  const scores = scoredNotes.map(({score}) => score);
  const scoreMax = Math.max(...scores);

  // remove the notes which don’t meet to be in the percentile of score
  return scoredNotes
    .filter(({ score }) => score >= scoreMax * minimumPercentile / 100);
}

/**
 * Filtering function for searching notes
 *
 * // TODO increase position of result when search has a better match
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
function filter(note, tags = null, showHidden = false) {
  if (note.hidden && showHidden === false) return false;

  // search in tags of note
  if (Array.isArray(tags) && tags.length > 0) {
    // if one tag matches the searched tags (intersection)
    if (note.metadata.tags.some(tag => tags.indexOf(tag) > -1)) return true;
  }

  return true;
}

module.exports = {
  filter,
  filterByQuery,
  splitSearchQuery,
  searchScore,
};
