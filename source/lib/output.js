'use strict';

const chalk = require('chalk');
const columnify = require('columnify');

const escapeFilename = require('./escapeFilename');
const render = require('./data/render');

function full(notes) {
  const data = notes.map(note => [
    chalk.green(note.filename),
    Object.entries(note.metadata).map(([key, value]) => {
      let valueStr = Array.isArray(value) ? value.join(', ') : value;
      return chalk.yellow(key) + ': ' + valueStr;
    }).join('\n'),
    "\n" + render(note.content),
  ]);
  return data.join("\n");
}

function oneline(notes) {
  const data = notes.map(note => {
    return [
      !isNaN(note.metadata.created) ? chalk.green(note.metadata.created.toJSON()) : '',
      chalk.yellow(note.metadata.title),
      note.metadata.tags.join(','),
    ];
  });
  const columns = columnify(data, {
    showHeaders: false,
  });
  return columns;
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
