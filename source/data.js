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
async function readNote(filename) {
  return readFileP(filename, 'utf8').then(content => {
    return parseMD(content);
  }).then(note => {
    note.metadata.tags = (note.metadata.tags || []);
    note.metadata.created = new Date(note.metadata.created);
    note.metadata.modified = new Date(note.metadata.modified);
    return note;
  });
}

async function read(path) {
  return recursiveReadDir(path, [fileFilter])
    .then(files => {
      return Promise.all(files.map(readNote));
    });
};

module.exports = {
  read,
};