#!/usr/bin/env node
'use strict';

const program = require('commander');

const data = require('./lib/data');
const pkg = require('./../package.json');
const config = require('./config');

program
  .version(pkg.version)
  .description('List all tags')
  ;

function main() {
  return data.readFromPath(config.HOME_PATH)
    .then(notes => {
      let tags = new Set();
      notes.forEach(note => note.metadata.tags.forEach(tags.add.bind(tags)));
      tags = Array.from(tags);
      tags.sort((a, b) => String(a).localeCompare(String(b)));
      tags.forEach(tag => console.log(tag));
    });
}

program.action(main).parse(process.argv);
