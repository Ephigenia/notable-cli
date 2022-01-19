import * as colors from 'ansi-colors';

import { escapeFilename } from './escapeFilename.js';
import { render } from './data/render.js';

export const FORMAT = {
  ONELINE: 'oneline',
  FULL: 'full',
  JSON: 'JSON',
};

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

export function output(format, notes) {
  switch(format) {
    case FORMAT.ONELINE: {
      return oneline(notes);
    }
    case FORMAT.FULL: {
      return full(notes);
    }
    case FORMAT.JSON: {
      return JSON.stringify(notes);
    }
    default: {
      return notes.map(note => escapeFilename(note.filename)).join("\n");
    }
  }
}
