#!/usr/bin/env node
'use strict';

const program = require('commander');

const pkg = require('./../package.json');

program
  .version(pkg.version)
  .description('Create a new note')
  ;

function main() {
  console.error('Command is not completed yet');
  process.exit(1);
}

program.action(main).parse(process.argv);
