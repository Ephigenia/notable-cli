#!/usr/bin/env node
'use strict';

const program = require('commander');
const path = require('path');
const chalk = require('chalk');

const data = require('./data');
const pkg = require('./../package.json');

program
  .version(pkg.version)
  .option('-f, --full', 'full output', false)
  .option('-o, --oneline', 'one-line output', false)
  ;

function main() {
  const notablePath = '/Users/ephigenia/Google Drive File Stream/Meine Ablage/Notable';

  return data.read(notablePath)
    .then(notes => {
      notes.filter(note => !note.metadata.title).forEach(note => {
        note.metadata.title = path.basename(note.filename);
      });
      notes.sort((a, b) => {
        return a.metadata.title.localeCompare(b.metadata.title);
      });
      notes.map((note) => {
        if (program.oneline) {
          console.log(chalk.red(note.filename), chalk.yellow(note.metadata.tags.join(',')), note.metadata.title);
        } else if (program.full) {
          console.log(note.content);
        } else {
          console.log(note.filename);
        }
      });
    });
}

program.action(main).parse(process.argv);