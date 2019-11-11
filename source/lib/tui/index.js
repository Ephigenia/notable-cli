'use strict';

const blessed = require('neo-blessed');

const style = require('./style');
const data = require('./../data');

const tui = function(notes, query, sort, queryTag, includeHidden) {
  let shownNotes = [];

  const screen = blessed.screen({
    smartCSR: true,
    sendFocus: true,
  });
  const searchBox = blessed.Textbox({
    label: 'Search',
    padding: { left: 1, right: 1 },
    parent: screen,
    top: '0',
    left: '0',
    width: '100%',
    height: 3,
    border: { type: 'line' },
    style: style(),
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
    style: Object.assign(style(), { header: { bold: true, fg: 'white' }}),
    keys: true,
    mouse: true,
    scrollable: true,
    scrollbar: true,
  });

  const contentBox = blessed.Text({
    padding: { left: 1, right: 1, top: 1, bottom: 1 },
    parent: screen,
    top: '50%',
    left: '0',
    width: '100%',
    height: '50%',
    border: { type: 'line' },
    align: 'left',
    style: style(),
    keys: true,
    scrollable: true,
    scrollbar: true,
    mouse: true,
  });

  const updateListBox = function(query, sort) {
    shownNotes = notes.filter(note => data.filter.filter(note, query, queryTag, includeHidden));
    shownNotes.sort((a, b) => data.sort.sort(a, b, sort));
    listBox.setLabel(`Notes (${shownNotes.length})`);
    const DESC = ' ⬆';
    const ASC = ' ⬇';

    const tableHeader = [[
      'Title' + ((sort === '-title') ? DESC : ((sort === 'title') ? ASC : '')),
      'Tags',
      [
        'Created' + ((sort === '-created' ? DESC : (sort === 'created' ? ASC : ''))),
        'Age' + ((sort === '-modified' ? DESC : (sort === 'modified' ? ASC : ''))),
      ].join(' / '),
    ]];


    const notesColumns = shownNotes.map((note) => {
      const lastChange = note.metadata.modified || note.metadata.created;
      const ageInDays = Math.round((Date.now() - lastChange.getTime()) / 1000 / 3600 / 24);
      const date = note.metadata.created.toJSON().replace(/T|:[0-9.]+Z$/g, ' ').trim();
      return ([
        String(note.metadata.title) || '',
        note.metadata.tags.join(', '),
        `${date} / ${ageInDays}`,
      ]);
    });
    let tableData = [].concat(tableHeader, notesColumns);

    const COLS = process.stdout.columns;
    const lastColumnWidth = 24;
    const colWidths = [
      Math.round((COLS - lastColumnWidth) * 0.35),
      Math.round((COLS - lastColumnWidth) * 0.55),
      lastColumnWidth,
    ];

    // TableList doesn’t add line breaks for auto-breaking too long values
    // in a table column
    // automatically limit the lines to the column widths if they are longer
    tableData = tableData.map((row) => row.map((columnValue, columnIndex) => {
      const columnWidth = colWidths[columnIndex];
      if (columnValue.length > columnWidth) {
        return columnValue.substr(0, columnWidth - 1) + '…';
      }
      return columnValue;
    }));

    listBox.setData(tableData);
    screen.render();
  };

  // show preview of note when element in the listbox gets selected
  const onListBoxEvent = function() {
    const selectedIndex = listBox.selected - 1;
    const note = shownNotes[selectedIndex] || {};
    contentBox.setLabel(note.filename || 'no-file');
    contentBox.setContent(data.render(note.content || ''));
    screen.render();
  };
  listBox.on('element click', onListBoxEvent);
  listBox.key(['up', 'down'], onListBoxEvent);

  // open the currently selected file when "o" is pressed
  screen.key('o', () => {
    const selectedIndex = listBox.selected - 1;
    const note = shownNotes[selectedIndex];
    if (note) {
      data.open([note.filename]);
    }
  });

  // watch for changes in the search box and filter the results
  let lastValue;
  setInterval(() => {
    const query = searchBox.value;
    if (lastValue !== query) {
      updateListBox(query, sort);
      lastValue = query;
    }
  }, 1000);

  // switch between screen elements using TAB and Shift-TAB
  searchBox.key(['down'], () => {
    listBox.focus();
  });

  // change sort order
  screen.key(['s'], () => {
    const currentIndex = data.sort.options.indexOf(sort);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= data.sort.options.length) {
      nextIndex = 0;
    }
    sort = data.sort.options[nextIndex];
    updateListBox(query, sort);
  });
  screen.key(['S'], () => {
    const currentIndex = data.sort.options.indexOf(sort);
    let nextIndex = currentIndex - 1;
    if (nextIndex < 0) {
      nextIndex = data.sort.options.length - 1;
    }
    sort = data.sort.options[nextIndex];
    updateListBox(query, sort);
  });

  // jump to search when f or / is pressed
  screen.key(['f', '/'], () => {
    searchBox.focus();
    searchBox.readInput();
  });
  screen.key(['tab'], () => screen.focusNext());
  screen.key(['shift-tab'], () => screen.focusPrevious());
  // make it possible to exit
  screen.key(['escape', 'C-c', 'q'], function() {
    return process.exit(0);
  });

  searchBox.focus();
  updateListBox(query, sort);
  screen.render();

};

module.exports = tui;
