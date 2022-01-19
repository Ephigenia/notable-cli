'use strict';

import { readFile, stat } from 'node:fs/promises';
import { basename, dirname } from 'node:path';

import parseMD from 'parse-md';
import recursiveReadDir from 'recursive-readdir';

function fileFilter(file, stats) {
  return !stats.isDirectory() && !basename(file).match(/\.md$/);
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
 * @property {String} category - relative path to the file
 * @property {content} Buffer - already readable buffer of the file’s content
 *   without the metadata
 * @property {Boolean} hidden - set to true when the file/note is hidden
 */

/**
 * @param {string} filename
 * @param {string} basePath
 * @returns {Promise<ParsedNote>}
 */
export async function readNote(filename, basePath) {
  const { mtime, birthtime } = await stat(filename);
  const base = {
    hidden: /^\./.test(basename(filename)),
    filename,
    content: '',
    category: dirname(filename).substring(basePath.length + 1) || null,
    metadata: {
      created: birthtime,
      modified: mtime,
      title: basename,
      tags: [],
    }
  };

  return readFile(filename, 'utf8')
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
 * @param {string} path root path of notes to be read
 * @returns {Promise<ParsedNote[]>}
 */
export async function read(path) {
  const files = await recursiveReadDir(path, [fileFilter]);
  return Promise.all(files.map(file => readNote(file, path)));
}
