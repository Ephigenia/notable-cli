'use strict';

const assert = require('assert');

const config = {
  HOME_PATH: process.env.NOTABLE_CLI_HOME ||
    process.env.NOTABLE_HOME ||
    process.env.NOTES_CLI_HOME,
};

assert(
  config.HOME_PATH && config.HOME_PATH.length,
  `Expected the home path of notable-cli to be configured and stored either in
  NOTABLE_CLI_HOME, NOTABLE_HOME or NOTES_CLI_HOME environment variable
  `
);

module.exports = config;
