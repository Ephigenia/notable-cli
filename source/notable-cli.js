#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'node:fs';

const pkg = require('./../package.json');
const package_ = JSON.parse(fs.readFileSync('package.json'));

const program = new Command();
program
  .version(package_.version)
  .command('new', 'create new note')
  .command('list', 'list notes', { isDefault: true }).alias('ls')
  .command('tags', 'list tags')
  .description(`${pkg.description}`);

program.parse(process.argv);
