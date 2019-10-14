#!/usr/bin/env node
'use strict';

const program = require('commander');
const chalk = require('chalk');

const data = require('./lib/data');
const pkg = require('./../package.json');
const config = require('./config');

const { spawn } = require('child_process');

program
  .version(pkg.version)
  .description('list/show/filter notes')
  .option('-f, --full', 'full output', false)
  .option('-e, --editor', 'open editor with resulting filtered notes')
  .option('-o, --oneline', 'one-line output', false)
  .option('-i, --interactive', 'interactive selection of file', false)
  .option('-s, --sort <criteria>', 'sorting', 'title')
  .option('--search <regexp>', 'searching')
  .option('-t, --tag <tag>', 'show notes having the given tag, case-sensitive', (val) => {
    return val.split(/\s*,\s*/).map(v => v.trim()).filter(v => v);
  })
  ;

function escape(str) {
  return str.replace(/(["\s'$`\\])/g,'\\$1');
}

function main() {
  return data.read(config.HOME_PATH)
    .then(notes => {
      const shownNotes = notes.filter((note) => {
        let show = true;
        if (program.tag) {
          show = show && note.metadata.tags.some(tag => {
            return program.tag.indexOf(tag) > -1;
          });
        }
        if (program.search) {
          const regexp = new RegExp(program.search, 'i');
          show = show && (
            note.metadata.title.match(regexp)
            || note.Buffer.match(regexp)
          );
        }
        return show;
      });

      if (program.editor) {
        if (shownNotes.length === 0) {
          console.error('no files found that could be opened.');
          process.exit(1);
        }
        const filenames = shownNotes.map(note => note.filename);
        const editor = 'sublime';
        spawn(editor, filenames);
        process.exit(0);
      }

      shownNotes.sort((a, b) => {
        switch(program.sort) {
          case 'created':
            return a.metadata.created - b.metadata.created;
          case 'filename':
            return a.metadata.title.localeCompare(b.metadata.title);
          case 'modified':
            return a.metadata.modified - b.metadata.modified;
          case 'title':
          default:
            return a.metadata.title.localeCompare(b.metadata.title);
        }
      });

      shownNotes.map((note) => {
        if (program.oneline) {
          console.log(
            escape(chalk.red(note.filename)),
            chalk.yellow(note.metadata.tags.join(',')),
            note.metadata.title
          );
        } else if (program.full) {
          console.log(note.content);
        } else {
          console.log(escape(note.filename));
        }
      });
    });
}

program.action(main).parse(process.argv);
