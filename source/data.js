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
 */

/**
 * @param {string} filename
 * @returns {Promise<ParsedNote>} 
 */
async function readNote(filename) {
  return readFileP(filename, 'utf8')
    .then(content => {
      return parseMD(content)
    })
    .then(note => {
      note.filename = filename;
      note.metadata.tags = (note.metadata.tags || []);
      note.metadata.created = new Date(note.metadata.created);
      note.metadata.modified = new Date(note.metadata.modified);
      return note;
    });
}

/**
 * @param {string} filename
 * @returns {Promise<ParsedNote[]>} 
 */
async function read(path) {
  return recursiveReadDir(path, [fileFilter])
    .then(files => {
      return Promise.all(files.map(readNote));
    });
};

module.exports = {
  read,
};