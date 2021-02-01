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
  const basename = path.basename(filename);
  const { mtime, birthtime } = fs.statSync(filename);
  const base = {
    hidden: /^\./.test(basename),
    filename,
    content: '',
    metadata: {
      created: birthtime,
      modified: mtime,
      title: basename,
      tags: [],
    }
  };
  return readFileP(filename, 'utf8')
    .then(content => {
      base.content = content;
      return parseMD(content);
    })
    .catch(err => {
      // catch and ignore parsing errors by using defaults
      console.error(`Error while reading "${filename}": ${err.message}`);
      return Object.assign({}, base);
    })
    .then(note => {
      // merge the parsed metadata with the base metadata
      note.metadata = Object.assign({}, base.metadata, note.metadata);
      note = Object.assign({}, base, note);
      return note;
    })
    .then(note => {
      // sort the tags alphabetically while removing empty values
      note.metadata.tags = Array.from(new Set(note.metadata.tags || []))
        .filter(tag => tag)
        .filter(tag => typeof(tag) === 'string');
      note.metadata.tags.sort((a, b) => {
        return a.localeCompare(b);
      });
      return note;
    })
    .then((note) => {
      // try to convert date values to instance of date
      ['modified', 'created'].forEach((attr) => {
        const val = note.metadata[attr];
        if (val instanceof Date) return;
        const parsedDate = Date.parse(val);
        if (!isNaN(parsedDate)) {
          note.metadata[attr] = new Date(parsedDate);
        }
      });
      return note;
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
  read,
  readNote,
};
