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

const sortOptions = [
  '-created',
  'created',
  'title',
  '-title',
  '-modified',
  'modified',
];

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
  .option('-s, --sort <criteria>', 'sorting', '-created')
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

function compareNotes(a, b, field) {
  let modifier = v => v;
  let sort = field.replace(/^-/, '');
  if (sort !== field) {
    modifier = v => -v;
  }
  switch(sort) {
    case 'created':
      return modifier(a.metadata.created - b.metadata.created);
    case 'filename':
      return modifier(a.metadata.title.localeCompare(b.metadata.title));
    case 'modified':
      return modifier(a.metadata.modified - b.metadata.modified);
    case 'title':
    default:
      return modifier(a.metadata.title.localeCompare(b.metadata.title));
  }
}

function main(query = '') {
  return data.read(config.HOME_PATH)
    .then(notes => {
      // filters the notes according to --search and --tag filter
      let shownNotes = notes.filter(note => notesFilter(note, query, program.tag));

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
          padding: { left: 1, right: 1 },
          parent: screen,
          top: '0',
          left: '0',
          width: '100%',
          height: 3,
          border: { type: 'line' },
          style: blessedStyle(),
          value: query,
          keys: true,
          mouse: true,
        });
        const listBox = blessed.ListTable({
          padding: { left: 1, right: 1 },
          parent: screen,
          top: 3,
          left: '0',
          width: '100%',
          height: '50%-3',
          border: { type: 'line' },
          align: 'left',
          style: Object.assign(blessedStyle(), { header: { bold: true, fg: 'white' }}),
          keys: true,
          mouse: true,
        });

        const contentBox = blessed.Text({
          padding: { left: 1, right: 1 },
          parent: screen,
          top: '50%',
          left: '0',
          width: '100%',
          height: '50%',
          border: { type: 'line' },
          align: 'left',
          style: Object.assign(blessedStyle(), { header: { bold: true, fg: 'white' }}),
        });

        const updateListBox = function(query, sort) {
          shownNotes = notes.filter(note => notesFilter(note, query, program.tag));
          shownNotes.sort((a, b) => compareNotes(a, b, sort));
          listBox.setLabel(`[ ${shownNotes.length} notes sort by ${sort} ]`);
          listBox.setData(
            [['Title','Tags', 'Created']]
            .concat(
              shownNotes.map(note => ([
                note.metadata.title,
                note.metadata.tags.join(', '),
                note.metadata.created.toJSON().replace(/T|:[0-9.]+Z$/g, ' '),
              ]))
            ));
          screen.render();
        };

        // show preview of note when element in the listbox gets selected
        const onListBoxEvent = function() {
          const selectedIndex = listBox.selected - 1;
          const note = shownNotes[selectedIndex];
          if (note) {
            contentBox.setLabel(note.filename);
            contentBox.setContent(note.content);
          } else {
            contentBox.setLabel('no file selected');
            contentBox.setContent('');
          }
          screen.render();
        };
        listBox.on('element click', onListBoxEvent);
        listBox.key(['up', 'down'], onListBoxEvent);

        contentBox.key('o', () => {
          const selectedIndex = listBox.selected - 1;
          const note = shownNotes[selectedIndex];
          if (note) {
            spawnSync(config.EDITOR, [note.filename]);
          }
        });

        // watch for changes in the search box and filter the results
        let lastValue;
        setInterval(() => {
          const query = searchBox.value;
          if (lastValue !== query) {
            updateListBox(query, program.sort);
            lastValue = query;
          }
        }, 1000);

        // switch between screen elements using TAB and Shift-TAB
        searchBox.key(['down'], () => {
          listBox.focus();
        });

        // change sort order
        screen.key(['s'], () => {
          const currentIndex = sortOptions.indexOf(program.sort);
          let nextIndex = currentIndex + 1;
          if (nextIndex >= sortOptions.length) {
            nextIndex = 0;
          }
          program.sort = sortOptions[nextIndex];
          updateListBox(query, program.sort);
        });

        screen.key(['tab'], () => screen.focusNext());
        screen.key(['shift-tab'], () => screen.focusPrevious());
        // make it possible to exit
        screen.key(['escape', 'C-c', 'q'], function() {
          return process.exit(0);
        });

        searchBox.focus();
        updateListBox(query, program.sort);
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
            // path.join(chalk.green(path.dirname(escape(note.filename))), chalk.yellow(path.basename(escape(note.filename)))),
            chalk.green(note.metadata.created.toJSON()),
            chalk.yellow(note.metadata.title),
            note.metadata.tags.join(','),
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
