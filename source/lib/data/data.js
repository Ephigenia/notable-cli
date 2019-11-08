'use strict';

const fs = require('fs');
const util = require('util');
const path = require('path');
const parseMD = require('parse-md').default;
const recursiveReadDir = require('recursive-readdir');

const readFileP = util.promisify(fs.readFile);
const recursiveReadDirP = util.promisify(recursiveReadDir);

function fileFilter(file, stats) {
  const basename = path.basename(file);
  return !stats.isDirectory() && !basename.match(/\.md$/);
}

/**
 * @typedef NoteMetadata
 * @type Object
 * @property {Date} created
 * @property {Date} updated
 * @property {Array<String>} tags
 * @property {String} title
 * @property {String} [author]
 */

/**
 * @typedef ParsedNote
 * @type Object
 * @property {Object} NoteMetadata
 *   object containing the parsed metadata
 * @property {String} filename - full path to the note’s file
 * @property {content} Buffer - already readable buffer of the file’s content
 *   without the metadata
 * @property {Boolean} hidden - set to true when the file/note is hidden
 */

/**
 * @param {string} filename
 * @returns {Promise<ParsedNote>}
 */
async function readNote(filename) {
  return readFileP(filename, 'utf8')
    .then(content => parseMD(content))
    .then(note => {
      const basename = path.basename(filename);
      note.hidden = /^\./.test(basename);
      note.filename = filename;
      note.metadata.title = String(note.metadata.title || path.basename(note.filename));
      note.metadata.tags = (note.metadata.tags || []).filter(tag => typeof(tag) === 'string');
      // sort the tags alphabetically
      if (note.metadata.tags) note.metadata.tags.sort((a, b) => {
        return a.localeCompare(b);
      });
      // fallback to file creation data when metadata is empty
      const { ctime, mtime } = fs.statSync(note.filename);
      if (note.metadata.created) {
        note.metadata.created = new Date(note.metadata.created);
      } else {
        note.metadata.created = ctime;
      }
      note.metadata.modified = new Date(note.metadata.modified);
        if (String(note.metadata.modified) === 'Invalid Date') {
        note.metadata.modified = mtime;
      }
      return note;
    })
    .catch(err => {
      console.error(`Error while reading "${filename}": ${err.message}`);
      throw err;
    });
}

/**
 * @param {string} filename
 * @returns {Promise<ParsedNote[]>}
 */
async function read(path) {
  return recursiveReadDirP(path, [fileFilter])
    .then(files => Promise.all(files.map(readNote)));
}


module.exports = {
  read
};
