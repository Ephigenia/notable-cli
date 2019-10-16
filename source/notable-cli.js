#!/usr/bin/env node
'use strict';

const program = require('commander');

const pkg = require('./../package.json');

program
  .version(pkg.version)
  .command('new', 'create new note')
  .command('list', 'list notes', { isDefault: true }).alias('ls')
  .command('tags', 'list tags')
  .description(`${pkg.description}`);

program.parse(process.argv);
