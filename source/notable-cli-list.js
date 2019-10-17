#!/usr/bin/env node
'use strict';

const program = require('commander');
const chalk = require('chalk');
const path = require('path');
const columnify = require('columnify');

const data = require('./lib/data');
const pkg = require('./../package.json');
const config = require('./config');

const { spawnSync } = require('child_process');

program
  .version(pkg.version)
  .arguments('[query]')
  .description('list/show/filter notes', {
    query: 'Optional search query to use'
  })
  .option('-f, --full', 'full output', false)
  .option('-e, --editor', 'open editor with resulting filtered notes')
  .option('-o, --oneline', 'one-line output', false)
  .option('-i, --interactive', 'interactive selection of file', false)
  .option('-s, --sort <criteria>', 'sorting', 'title')
  .option('-t, --tag <tag>', 'show notes having the given tag, case-sensitive', (val) => {
    return val.split(/\s*,\s*/).map(v => v.trim()).filter(v => v);
  })
  ;

function escape(str) {
  return str.replace(/(["\s'$`\\])/g,'\\$1');
}

// TODO Query is YYYYMMDD then filter by date
function notesFilter(note, query = '', tags = null) {
  if (!tags && !query) return true;
  if (Array.isArray(tags) && tags.length > 0) {
    // if one tag matches the searched tags (intersection)
    if (note.metadata.tags.some(tag => tags.indexOf(tag) > -1)) return true;
  }
  if (query) {
    // match using regexp on title and content
    const regexp = new RegExp(query, 'i');
    if (
      note.metadata.tags.some(tag => regexp.test(tag)) ||
      regexp.test(note.metadata.title) ||
      regexp.test(note.content
    )) return true;
  }
  return false;
}

function compareNotes(a, b, sort) {
  switch(sort) {
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
}

function main(query = '') {
  return data.read(config.HOME_PATH)
    .then(notes => {
      // filters the notes according to --search and --tag filter
      const shownNotes = notes.filter(note => notesFilter(note, query, program.tag));

      if (program.interactive) {
        const blessed = require('neo-blessed');
        const blessedStyle = require('./lib/blessed-style');
        const screen = blessed.screen({
          smartCSR: true,
          sendFocus: true,
        });
        screen.title = pkg.name;
        const searchBox = blessed.Textbox({
          label: 'Search',
          parent: screen,
          top: '0',
          left: '0',
          width: '100%',
          height: 3,
          border: { type: 'line' },
          style: blessedStyle(),
          mouse: true,
          inputOnFocus: true,
          keys: true,
          value: query,
        });
        const listBox = blessed.List({
          label: 'Notes',
          parent: screen,
          top: 3,
          left: '0',
          width: '100%',
          height: '100%-3',
          border: { type: 'line' },
          style: blessedStyle(),
          inputOnFocus: true,
          mouse: true,
          keys: true,
        });

        const updateListBox = function(query) {
          const filteredNotes = notes.filter(note => notesFilter(note, query, program.tag))
          // TODO output with tags
          listBox.setItems(filteredNotes.map(note => {
            return note.metadata.title + ' ' + note.metadata.tags.join(', ');
          }));
          screen.render();
        };

        // open selected note when selected
        listBox.on('select', (item, index) => {
          const note = shownNotes[index];
          spawnSync(config.EDITOR, [note.filename]);
        });

        // watch for changes in the search box and filter the results
        let lastValue;
        setInterval(() => {
          const query = searchBox.value;
          if (lastValue !== query) {
            updateListBox(query);
            lastValue = query;
          }
        }, 500);

        // switch between screen elements using TAB and Shift-TAB
        searchBox.key(['down', 'tab'], () => {
          searchBox.submit();
          screen.focusPush(listBox);
          return false;
        });

        screen.key(['tab'], () => screen.focusNext());
        // make it possible to exit
        screen.key(['escape', 'C-c', 'q'], function() {
          return process.exit(0);
        });

        searchBox.focus();
        updateListBox(query);
        screen.render();
        return;
      }

      if (program.editor) {
        if (shownNotes.length === 0) {
          console.error('no files found that could be opened.');
          process.exit(1);
        }
        const filenames = shownNotes.map(note => note.filename);
        spawnSync(config.EDITOR, filenames);
        process.exit(0);
      }

      shownNotes.sort((a, b) => compareNotes(a, b, program.sort));

      if (program.oneline) {
        const data = shownNotes.map(note => {
          return [
            path.join(chalk.green(path.dirname(escape(note.filename))), chalk.yellow(path.basename(escape(note.filename)))),
            note.metadata.tags.join(','),
            note.metadata.title,
          ];
        });
        const columns = columnify(data, {
          showHeaders: false,
        });
        console.log(columns);
      } else if (program.full) {
        const data = shownNotes.map(note => [
          chalk.green(note.filename),
          Object.entries(note.metadata).map(([key, value]) => {
            let valueStr = Array.isArray(value) ? value.join(', ') : value;
            return chalk.yellow(key) + ': ' + valueStr;
          }).join('\n'),
          "\n" + note.content,
        ]);
        console.log(data.join("\n"));
      } else {
        const data = shownNotes.map(note => escape(note.filename));
        console.log(data.join("\n"));
      }
    });
}

program.action(main).parse(process.argv);
