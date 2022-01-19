#!/usr/bin/env node
import { Command } from 'commander';

import config from './config.js';
import * as data from './lib/data/data.js';

const program = new Command();
program
  .description('List all values')
  // TODO add description with examples for: grep, sort, unique, lowercase
  .option('-f, --full', 'full output', false)
  .action(main)
  .parseAsync();

async function main() {
  const options = program.opts();
  const notes = await data.read(config.HOME_PATH);
  let values = new Set();
  if (options.full) {
    notes
      .map(note => note.category)
      .filter(v => v)
      .forEach(values.add, values);
  } else {
    notes.map(note => note.metadata.tags)
      .flat()
      .filter(v => v)
      .forEach(values.add, values);
  }

  // sorted output
  values = Array.from(values);
  values.sort((a, b) => String(a).localeCompare(String(b)));
  values.forEach(tag => console.log(tag));
}
