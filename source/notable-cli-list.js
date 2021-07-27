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
  .addHelpText('after', `

Examples:
  Search notes containing "query" in tag, category or content:
    notable-cli query

  Search for specific tags:
    notable-cli --tag mytag

  Serach for notes in specific category (folder):
    notable-cli project/name/todos

  Start interactive text-interface
    notable-cli --interactive

  Start interactive text-interface with query:
    notable-cli --interactive project/example

  Get Everything as JSON for additional processing with jq:
    notable-cli query --json | jq

  Open the list of matching filename(s) in editor:
    notable-cli query | $EDITOR

  Open all matching files in editor
    notable-cli searchquery | xargs $EDITOR -0
`)
  .option('-f, --full', 'full output', false)
  .option('-i, --interactive', 'interactive text-based interface (tui)', false)
  .option('-j, --json', 'json output', false)
  .option('-o, --oneline', 'one-line output', false)
  .option('-s, --sort <criteria>', 'sorting')
  .option('-a, --all', 'show all notes, also hidden notes', false)
  .option('-t, --tag <tag>', 'show notes having the given tag, case-sensitive', (val) => {
    return val.split(/\s*,\s*/).map(v => v.trim()).filter(v => v);
  })
  ;

function main(query = '', options = {}) {
  if (!options.sort) {
    options.sort = '-created';
    if (query) {
      options.sort = '-score';
    }
  }
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
      const shownNotes = data.filter.filterByQuery(
        notes.filter(note => data.filter.filter(note, options.tag, options.all)),
        query,
        0
      );
      shownNotes.sort((a, b) => data.sort.sort(a, b, options.sort));

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
