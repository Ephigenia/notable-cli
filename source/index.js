'use strict';

const path = require('path');
const recursiveReadDir = require('recursive-readdir');
const Dumper = require('@notable/dumper');

const notablePath = '/Users/ephigenia/Google Drive File Stream/Meine Ablage/Notable';

function fileFilter(file, stats) {;
  return !stats.isDirectory() && !path.basename(file).match(/\.md$/);
}
async function readNote(filename) {
  return new Promise((resolve, reject) => {
    Dumper.dump({
      source: filename,
      dump(note) {
        resolve(note);
      }
    })
  });
}

recursiveReadDir(notablePath, [fileFilter], (err, files) => {
  const promises = files.map(readNote);
  Promise.all(promises).then(results => {
    const tags = results.map(note => note.metadata.tags);
    const titles = results.map(note => note.metadata.title);
    console.log('tags', tags);
    console.log('titles', titles);
  });
});