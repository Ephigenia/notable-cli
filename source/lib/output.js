'use strict';

const colors = require('ansi-colors');

const escapeFilename = require('./escapeFilename');
const render = require('./data/render');

function full(notes) {
  const data = notes.map(note => [
    colors.green(note.filename),
    Object.entries(note.metadata).map(([key, value]) => {
      let valueStr = Array.isArray(value) ? value.join(', ') : value;
      return colors.yellow(key) + ': ' + valueStr;
    }).join('\n'),
    "\n" + render(note.content),
  ]);
  return data.join("\n");
}

function oneline(notes) {
  const data = notes.map(note => {
    return [
      !isNaN(note.metadata.created) ? colors.green(note.metadata.created.toJSON()) : '',
      colors.yellow(note.metadata.title),
      note.metadata.tags.join(','),
    ];
  });
  return data.map(row => row.join('\t')).join('\n');
}

module.exports = function(format, notes) {
  switch(format) {
    case 'oneline': {
      return oneline(notes);
    }
    case 'full': {
      return full(notes);
    }
    case 'json': {
      return JSON.stringify(notes);
    }
    default: {
      return notes.map(note => escapeFilename(note.filename)).join("\n");
    }
  }
};
