'use strict';

const blessed = require('neo-blessed');

const screen = blessed.screen({
  smartCSR: true,
  useBCE: true,
  sendFocus: true,
});

screen.key(['q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

module.exports = screen;