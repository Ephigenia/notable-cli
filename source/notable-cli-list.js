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
  // TODO not sure if this is required, as this can be archived using xargs
  //      like notable-cli --editor | xargs "${EDITOR}"" -e
  .option('-e, --editor', 'open editor with resulting filtered notes')
  .option('-f, --full', 'full output', false)
  .option('-i, --interactive', 'interactive text-based interface (tui)', false)
  .option('-j, --json', 'json output', false)
  .option('-o, --oneline', 'one-line output', false)
  .option('-s, --sort <criteria>', 'sorting', '-created')
  .option('-a, --all', 'show all notes, also hidden notes', false)
  .option('-t, --tag <tag>', 'show notes having the given tag, case-sensitive', (val) => {
    return val.split(/\s*,\s*/).map(v => v.trim()).filter(v => v);
  })
  ;

function main(query = '', options = {}) {
  // start interactive mode
  if (options.interactive) {
    return tui(config.HOME_PATH, query, options.sort, options.tag, options.all);
  }

  // normal one-time execution mode
  return data.readFromPath(config.HOME_PATH)
    .then(notes => {
      if (options.interactive) {
        return tui(notes, query, options.sort, options.tag, options.all);
      }
      // filters the notes according to --search and --tag filter
      const shownNotes = notes.filter(note => data.filter.filter(note, query, options.tag, options.all));
      shownNotes.sort((a, b) => data.sort.sort(a, b, options.sort));
      if (options.editor) {
        if (shownNotes.length === 0) {
          console.error('no files found that could be opened.');
          process.exit(1);
        }
        const filenames = shownNotes.map(note => note.filename);
        data.open(filenames);
        process.exit(0);
      }

      let format = null;
      if (options.oneline) {
        format = 'oneline';
      } else if (options.full) {
        format = 'full';
      } else if (options.json) {
        format = 'json';
      }
      console.log(output(format, shownNotes));
    });
}

program
  .action((query) => main(query, program.opts()))
  .parse(process.argv);
