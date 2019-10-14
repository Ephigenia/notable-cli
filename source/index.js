'use strict';

// https://github.com/embark-framework/neo-blessed
const blessed = require('neo-blessed');
const opn = require('opn');
const path = require('path');

const data = require('./data');
const style = require('./style');
const screen = require('./screen');

const notablePath = '/Users/ephigenia/Google Drive File Stream/Meine Ablage/Notable';

const tagListBox = blessed.list({
  label: 'Tags',
  parent: screen,
  width: '20%',
  top: '0',
  height: '100%',
  items: [],
  border: { type: 'line' },
  mouse: true,
  sendFocus: false,
  keys: true,
  style: style(),
});

const fileListBox = blessed.list({
  label: 'Files',
  parent: screen,
  width: '20%',
  top: '0',
  left: '20%',
  height: '100%',
  items: [],
  border: { type: 'line' },
  mouse: true,
  sendFocus: false,
  keys: true,
  style: style(),
});

const contentBox = blessed.Box({
  label: 'Content',
  parent: screen,
  top: '0',
  right: '0',
  width: '60%',
  height: '100%',
  border: { type: 'line' },
  style: Object.assign(style(), { fg: 'white' }),
});

let selectedNote;
let selectedTag = 'all';
let allTags = [];

function sortTags(tags) {
  return tags.sort((a, b) => String(a).localeCompare(String(b)));
}

function sortNotes(notes, sort = true) {
  return notes.sort((a, b) => {
    if (sort) {
      return String(a.metadata.title).localeCompare(String(b.metadata.title))
    }
    return 1;
  });
}

function filterNotes(notes, { tag }) {
  return notes.filter(note => {
    if (tag && tag === 'all') return true;
    return note.metadata.tags.indexOf(tag) > -1
  });
}

function filterAndSortNotes(notes, filter, sort = true) {
  const filteredNotes = filterNotes(notes, filter);
  return sortNotes(filteredNotes, sort);
}

data.read(notablePath)
  .then(notes => {
    const tags = new Set(['all']);
    notes.forEach(note => note.metadata.tags.forEach(tags.add.bind(tags)));
    allTags = sortTags(Array.from(tags));
    tagListBox.setItems(allTags);

    tagListBox.on('select', function(item, index) {
      selectedTag = item.content;
      const titles = filterAndSortNotes(notes, { tag: selectedTag }).map(note => note.metadata.title);
      fileListBox.setItems(titles);
      screen.render();
    });
    
    fileListBox.on('select', function(item, index) {
      const noteTitle = item.content;
      selectedNote = notes.find(note => note.metadata.title === noteTitle);
      if (selectedNote) {
        contentBox.setContent(selectedNote.content);
        contentBox.setLabel(path.basename(selectedNote.filename));
      } else {
        contentBox.setContent('');
        contentBox.setLabel('No file selected');
      }
      screen.render();
    });

    // patching the selected style of not-focused elements to be bit more
    // dimmed
    screen.on('element focus', function(elm) {
      elm.style.selected = {
        bg: 'yellow',
        fg: 'black',
      };
      screen.render();
      return true;
    });
    screen.on('element blur', function(elm) {
      elm.style.selected = {
        bg: 'grey',
        fg: 'black',
      };
      screen.render();
      return true;
    });
    tagListBox.focus();

    screen.render();
  });

screen.key(['tab', 'right'], () => screen.focusNext());
screen.key(['shift-tab', 'left'], () => screen.focusPrevious());
screen.key(['1'], function(ch, key) {
  screen.focusPush(tagListBox);
});
screen.key(['2'], function(ch, key) {
  screen.focusPush(fileListBox);
});
screen.key(['o'], function(ch, key) {
  if (selectedNote) opn(selectedNote.filename);
});

const tagList = blessed.list({
  label: 'Tags For File',
  width: '50%',
  height: '90%',
  top: 'center',
  left: 'center',
  border: { type: 'line', },
  mouse: true,
  keys: true,
  style: style(),
})

tagList.key(['esc', 'q', 'del'], function(ch, key) {
  screen.remove(tagList);
  // save tags to file
});
tagList.key(['a'], function(ch, key) {
  // add a tag
  // show add tag input
});
tagList.key(['space'], function(ch, key) {
  if (!selectedNote) {
    return null;
  }
  // toggle tag by adding or removing the tag form the file’s tagas
});

// edit tags of a file
screen.key(['t'], function(ch, key) {
  if (!selectedNote) {
    return null;
  }
  const fileTags = selectedNote.metadata.tags;
  tagList.setItems(allTags.map(tag => {
    if (fileTags.indexOf(tag) > -1) {
      return `[x] ${tag}`;
    } else {
      return `[ ] ${tag}`;
    }
  }));
  screen.append(tagList);
  tagList.focus();
  screen.render();
});


screen.key(['n'], function(ch, key) {
  // let newFilename = '';
  // if (!selectedNote) {
  //   return null;
  // }
  // let newFilename = selectedNote.filename;
  // let basename = path.basename(newFilename);
  // if (basename.match(/\.template/));

  screen.append(newNoteTitleInput);
  newNoteTitleInput.focus();
  screen.render();
});