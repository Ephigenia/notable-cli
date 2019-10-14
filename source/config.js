'use strict';

const assert = require('assert');
const os = require('os');

const config = {
  HOME_PATH: process.env.NOTABLE_CLI_HOME ||
    process.env.NOTABLE_HOME ||
    process.env.NOTES_CLI_HOME,
  EDITOR: (
    process.env.NOTABLE_CLI_EDITOR ||
    process.env.EDITOR
  ),
  USERNAME: process.env.NOTABLE_CLI_USERNAME || os.userInfo().username ,
};

assert(
  config.HOME_PATH && config.HOME_PATH.length,
  `Expected the home path of notable-cli to be configured and stored either in
  NOTABLE_CLI_HOME, NOTABLE_HOME or NOTES_CLI_HOME environment variable
  `,
);
assert(
  config.EDITOR && config.EDITOR.length,
  `Expected the home path of notable-cli to be configured and stored either in
  NOTABLE_CLI_EDITOR, EDITOR environment variable
  `,
);

module.exports = config;
