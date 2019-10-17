'use strict';

const marked = require('marked');
const TerminalRenderer = require('marked-terminal');

function render(content) {
  marked.setOptions({
    renderer: new TerminalRenderer(),
  });
  return marked(content);
}

module.exports = render;
