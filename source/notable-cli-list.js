#!/usr/bin/env node

import { Command } from 'commander';

import config from './config.js';
import tui from './lib/tui/index.js';
import * as data from './lib/data/data.js';
import * as filter from './lib/data/filter.js';
import * as sort from './lib/data/sort.js';
import { FORMAT, output } from './lib/output.js';

const program = new Command();
program
  .arguments('[query]', {
    query: 'Optional search query to use'
  })
  .description('list/show/filter notes')
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
  .action(main)
  .parseAsync();

function main(query = '') {
  const options = program.opts();

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
  return data.read(config.HOME_PATH)
    .then(notes => {
      // filters the notes according to --search and --tag filter
      let shownNotes = filter.filterByQuery(
        notes.filter(note => filter.filter(note, options.tag, options.all)),
        query,
        1
      );
      shownNotes.sort((a, b) => sort.sort(a, b, options.sort));

      let format = null;
      if (options.oneline) {
        format = FORMAT.ONELINE;
      } else if (options.full) {
        format = FORMAT.FULL;
      } else if (options.json) {
        format = FORMAT.JSON;
      }
      console.log(output(format, shownNotes));
    });
}
