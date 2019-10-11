'use strict';

const blessed = require('neo-blessed');

const data = require('./data');
const notablePath = '/Users/ephigenia/Google Drive File Stream/Meine Ablage/Notable';

const screen = blessed.screen({
  smartCSR: true,
  useBCE: true,
});
screen.title = 'Notable Notes CLI';

const tagListBox = blessed.list({
  width: '20%',
  items: [],
  border: { type: 'line' },
  inputOnFocus: true,
  mouse: true,
  keys: true,
  style: {
    bg: '#1F1F1F',
    focus: {
      bg: '#1F1F1F'
    },
    selected: {
      bg: 'yellow',
      fg: 'black',
    },
    hover: {
      fg: 'red'
    }
  }
});
screen.append(tagListBox);

const contentBox = blessed.Box({
  top: '0',
  right: '0',
  width: '80%',
  height: '100%',
  content: 'HELLO WORLD',
  border: { type: 'line' }
});
screen.append(contentBox);

data.read(notablePath).then(notes => {
  let tags = new Set();
  notes.forEach(note => note.metadata.tags.forEach(tags.add.bind(tags)));
  tagListBox.setItems(Array.from(tags));
  screen.render();
});

tagListBox.on('select', function(data) {
  contentBox.setContent(String(data));
  screen.render();
});

screen.key(['g'], function(ch, keys) {
  contentBox.setText('HELLO YOU');
});
screen.key(['escape', 't'], function(ch, key) {
  tagListBox.focus();
  screen.render();
});
screen.key(['q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.render();