#!/usr/bin/env node
'use strict';

const program = require('commander');

const data = require('./lib/data');
const pkg = require('./../package.json');
const config = require('./config');
const output = require('./lib/output');

const tui = require('./lib/tui');

program
  .version(pkg.version)
  .arguments('[query]')
  .description('list/show/filter notes', {
    query: 'Optional search query to use'
  })
  .option('-e, --editor', 'open editor with resulting filtered notes')
  .option('-f, --full', 'full output', false)
  .option('-i, --interactive', 'interactive selection/preview while searching for note', false)
  .option('-j, --json', 'json output', false)
  .option('-o, --oneline', 'one-line output', false)
  .option('-s, --sort <criteria>', 'sorting', '-created')
  .option('-t, --tag <tag>', 'show notes having the given tag, case-sensitive', (val) => {
    return val.split(/\s*,\s*/).map(v => v.trim()).filter(v => v);
  })
  ;

function main(query = '') {
  return data.readFromPath(config.HOME_PATH)
    .then(notes => {
      if (program.interactive) {
        return tui(notes, query, program.sort, program.tag);
      }

      // filters the notes according to --search and --tag filter
      const shownNotes = notes.filter(note => data.filter.filter(note, query, program.tag));
      shownNotes.sort((a, b) => data.sort.sort(a, b, program.sort));
      if (program.editor) {
        if (shownNotes.length === 0) {
          console.error('no files found that could be opened.');
          process.exit(1);
        }
        const filenames = shownNotes.map(note => note.filename);
        data.open(filenames);
        process.exit(0);
      }

      let format = null;
      if (program.oneline) {
        format = 'oneline';
      } else if (program.full) {
        format = 'full';
      } else if (program.json) {
        format = 'json';
      }
      console.log(output(format, shownNotes));
    });
}

program.action(main).parse(process.argv);
