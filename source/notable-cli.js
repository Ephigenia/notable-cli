#!/usr/bin/env node
import { Command } from 'commander';
import { readFile } from 'node:fs/promises';

let package_ = JSON.parse(
  await readFile(
    new URL('./../package.json', import.meta.url)
  )
);

const program = new Command();
program
  .version(package_.version)
  .description(`${package_.description}`)
  .command('new', 'create new note')
  .command('list', 'list notes', { isDefault: true }).alias('ls')
  .command('tags', 'list tags')
  .parse();
