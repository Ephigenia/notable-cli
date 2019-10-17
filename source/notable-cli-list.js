#!/usr/bin/env node
'use strict';

const program = require('commander');
const chalk = require('chalk');
const path = require('path');
const columnify = require('columnify');

const data = require('./lib/data');
const pkg = require('./../package.json');
const config = require('./config');

const { spawn } = require('child_process');

program
  .version(pkg.version)
  .arguments('[query]')
  .description('list/show/filter notes', {
    query: 'Optional search query to use'
  })
  .option('-f, --full', 'full output', false)
  .option('-e, --editor', 'open editor with resulting filtered notes')
  .option('-o, --oneline', 'one-line output', false)
  .option('-i, --interactive', 'interactive selection of file', false)
  .option('-s, --sort <criteria>', 'sorting', 'title')
  .option('-t, --tag <tag>', 'show notes having the given tag, case-sensitive', (val) => {
    return val.split(/\s*,\s*/).map(v => v.trim()).filter(v => v);
  })
  ;

function escape(str) {
  return str.replace(/(["\s'$`\\])/g,'\\$1');
}

function notesFilter(note, query = '', tags = null) {
  if (!tags && !query) return true;
  if (Array.isArray(tags) && tags.length > 0) {
    // if one tag matches the searched tags (intersection)
    if (note.metadata.tags.some(tag => tags.indexOf(tag) > -1)) return true;
  }
  if (query) {
    // match using regexp on title and content
    const regexp = new RegExp(query, 'i');
    if (regexp.test(note.metadata.title) || regexp.test(note.content)) return true;
  }
  return false;
}

function compareNotes(a, b, sort) {
  switch(sort) {
    case 'created':
      return a.metadata.created - b.metadata.created;
    case 'filename':
      return a.metadata.title.localeCompare(b.metadata.title);
    case 'modified':
      return a.metadata.modified - b.metadata.modified;
    case 'title':
    default:
      return a.metadata.title.localeCompare(b.metadata.title);
  }
}

function main(query = '') {
  return data.read(config.HOME_PATH)
    .then(notes => {
      // filters the notes according to --search and --tag filter
      const shownNotes = notes.filter(note => notesFilter(note, query, program.tag));

      if (program.interactive) {
        console.log('interactive mode not finished yet');

        process.exit();
      }

      if (program.editor) {
        if (shownNotes.length === 0) {
          console.error('no files found that could be opened.');
          process.exit(1);
        }
        const filenames = shownNotes.map(note => note.filename);
        spawn(config.EDITOR, filenames);
        process.exit(0);
      }

      shownNotes.sort((a, b) => compareNotes(a, b, program.sort));

      if (program.oneline) {
        const data = shownNotes.map(note => {
          return [
            path.join(chalk.green(path.dirname(escape(note.filename))), chalk.yellow(path.basename(escape(note.filename)))),
            note.metadata.tags.join(','),
            note.metadata.title,
          ];
        });
        const columns = columnify(data, {
          showHeaders: false,
        });
        console.log(columns);
      } else if (program.full) {
        const data = shownNotes.map(note => [
          chalk.green(note.filename),
          Object.entries(note.metadata).map(([key, value]) => {
            let valueStr = Array.isArray(value) ? value.join(', ') : value;
            return chalk.yellow(key) + ': ' + valueStr;
          }).join('\n'),
          "\n" + note.content,
        ]);
        console.log(data.join("\n"));
      } else {
        const data = shownNotes.map(note => escape(note.filename));
        console.log(data.join("\n"));
      }
    });
}

program.action(main).parse(process.argv);
