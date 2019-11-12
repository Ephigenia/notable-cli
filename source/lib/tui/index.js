'use strict';

const blessed = require('neo-blessed');

const style = require('./style');
const data = require('./../data');

const tui = function(notesHomePath, query, sort, queryTag, includeHidden) {
  // view elements
  // -------------
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

  let notes = [];
  let shownNotes = [];
  const reloadData = function(query, sort) {
    return data.readFromPath(notesHomePath)
      .then(list => notes = list)
      .then(() => updateViews(query, sort));
  };

  const updateViews = async function(query, sort) {
    shownNotes = notes.filter(note => data.filter.filter(note, query, queryTag, includeHidden));
    shownNotes.sort((a, b) => data.sort.sort(a, b, sort));
    updateListBox(shownNotes, sort);
  };

  const listBoxTableheader = function(sort) {
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
    return tableHeader;
  };

  const listBoxNoteRow = function(note) {
    const lastChange = note.metadata.modified || note.metadata.created;
    const ageInDays = Math.round((Date.now() - lastChange.getTime()) / 1000 / 3600 / 24);
    const date = note.metadata.created.toJSON().replace(/T|:[0-9.]+Z$/g, ' ').trim();
    return ([
      String(note.metadata.title) || '',
      note.metadata.tags.join(', '),
      `${date} / ${ageInDays}`,
    ]);
  };

  const updateListBox = function(notes, sort) {
    listBox.setLabel(`Notes (${notes.length})`);

    let table = [].concat(
      listBoxTableheader(sort),
      notes.map(note => listBoxNoteRow(note)),
    );

    const COLS = process.stdout.columns;
    const lastColumnWidth = 24;
    const colWidths = [
      Math.round((COLS - lastColumnWidth) * 0.35),
      Math.round((COLS - lastColumnWidth) * 0.55),
      lastColumnWidth,
    ];

    const ELLIPSIS = '…';
    // TableList doesn’t add line breaks for auto-breaking too long values
    // in a table column
    // automatically limit the lines to the column widths if they are longer
    table = table.map((row) => row.map((columnValue, columnIndex) => {
      const columnWidth = colWidths[columnIndex];
      if (columnValue.length > columnWidth) {
        return columnValue.substr(0, columnWidth - 1) + ELLIPSIS;
      }
      return columnValue;
    }));

    listBox.setData(table);
    screen.render();
  };

  function setSortOrder(index) {
    const sortOptions = data.sort.options;
    if (index >= sortOptions.length) {
      index = 0;
    } else if (index < 0) {
      index = sortOptions.length - 1;
    }
    sort = sortOptions[index];
    updateViews(query, sort);
  }

  // show preview of note when element in the listbox gets selected
  const onListBoxEvent = function() {
    previewNote(listBox.selected - 1);
  };
  listBox.on('element click', onListBoxEvent);
  listBox.key(['up', 'down'], onListBoxEvent);

  async function previewNote(index) {
    const selectedNote = shownNotes[index];
    if (!selectedNote) {
      contentBox.setLabel('no-file');
      contentBox.setContent('');
      screen.render();
      return Promise.resolve();
    } else {
      contentBox.setLabel(selectedNote.filename);
      return data.readNote(selectedNote.filename)
        .then(note => {
          contentBox.setContent(data.render(note.content));
          screen.render();
        });
    }
  }

  function openNote(index) {
    const note = shownNotes[index];
    if (note) data.open([note.filename])
  }

  // keyboard control
  // ----------------
  screen.key('o', () => {
    // open the currently selected file
    openNote(listBox.selected - 1);
  });
  screen.key(['s'], () => {
    // previous sort order
    setSortOrder(data.sort.options.indexOf(sort) + 1);
  });
  screen.key(['S'], () => {
    // next sort order
    setSortOrder(data.sort.options.indexOf(sort) - 1);
  });
  screen.key(['r'], () => {
    // reload data
    reloadData(query, sort);
  });
  screen.key(['f', '/'], () => {
    // jump to search when f or / is pressed
    searchBox.focus();
    searchBox.readInput();
  });
  searchBox.key(['down'], () => {
    // focus on list
    listBox.focus();
  });
  screen.key(['tab'], () => {
    // focus previous pane
    screen.focusNext();
  });
  screen.key(['shift-tab'], () => {
    // focus next pane
    screen.focusPrevious();
  });
  screen.key(['escape', 'C-c', 'q'], function() {
    // quit application
    return process.exit(0);
  });

  // update interval
  // ----------------
  // refresh interval which updates the list of notes every n seconds
  let lastValue;
  setInterval(() => {
    const query = searchBox.value;
    // only update when query changed
    if (lastValue !== query) {
      updateViews(query, sort);
      lastValue = query;
    }
  }, 1000);

  // initial load
  // ------------
  searchBox.focus();
  reloadData(query, sort);
  screen.render();
};

module.exports = tui;
