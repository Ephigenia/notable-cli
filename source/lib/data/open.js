'use strict';

const { spawnSync } = require('child_process');

const config = require('./../../config');

function open(notes) {
  spawnSync(config.EDITOR, notes);
}

module.exports = open;
