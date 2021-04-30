#!/usr/bin/env node
'use strict';

const program = require('commander');

const data = require('./lib/data');
const pkg = require('./../package.json');
const config = require('./config');

program
  .version(pkg.version)
  .description('List all values')
  // TODO add description with examples for: grep, sort, unique, lowercase
  .option('-f, --full', 'full output', false)
  ;

function main() {
  return data.readFromPath(config.HOME_PATH)
    .then(notes => {
      let values = new Set();
      if (program.full) {
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
      values = Array.from(values);
      values.sort((a, b) => String(a).localeCompare(String(b)));
      values.forEach(tag => console.log(tag));
    });
}

program.action(main).parse(process.argv);
