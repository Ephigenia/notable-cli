#!/usr/bin/env node
'use strict';

const program = require('commander');
const fs = require('fs');
const path = require('path');

const data = require('./lib/data');
const pkg = require('./../package.json');
const config = require('./config');

program
  .version(pkg.version)
  .description('Creates a new note', {
    title: 'title of the note to be created, YYYY-MM-DD and HH-MM would be replaced',
    tags: 'csv list of tags to add',
  })
  .arguments('[title] [tags]')
  ;

const TITLE_DEFAULT = 'YYYYMMDD-HHMM Note';

function renderTemplate(vars = {}) {
  vars.title = vars.title || 'no-title';
  const content = `---
tags: [${vars.tags.join(', ')}]
title: ${vars.title}
author: ${vars.username}
created: '${vars.created.toISOString()}'
modified: '${vars.modified.toISOString()}'
---

# ${vars.title}
`;
  return content;
}

function main(title = TITLE_DEFAULT, tags = '') {
  const now = new Date();

  // argument defaults and validation
  const renderedTitle = (title || TITLE_DEFAULT)
    .replace(/YYYY-MM-DD/i, now.toISOString().substr(0, 10))
    .replace(/YYYYMMDD/i, now.toISOString().substr(0, 10).replace(/-/g, ''))
    .replace(/HH-MM/i, now.toISOString().substr(11, 5).replace(/:/g, '-'))
    .replace(/HHMM/i, now.toISOString().substr(11, 5).replace(/:/g, ''));

  // sanitize tags (trim), remove empty ones
  tags = tags.split(/\s+[,;]+\s*/).map(tag => tag.trim()).filter(v => v);

  // filename
  const basename = renderedTitle;
  const filename = path.join(config.HOME_PATH, basename) + '.md';
  try {
    // check if title doesn’t contain a dot as first character or slashes
    if (basename.match(/^\./)) {
      throw new Error(
        'The given title would result in a hidden file starting with a dot.'
      );
    } else if (basename.match(/\/|\\/)) {
      throw new Error(
        'The given title would result in a filename that contains backslash ' +
        'or slashes which is not allowed right now.'
      );
    } else if (fs.existsSync(filename)) {
      // check if file already exists
      throw new Error(
        `The file "${filename}" already exists and cannot be overwritten. ` +
        'Considering modifying this note instead'
      );
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  // template
  const template = renderTemplate({
    tags,
    title: renderedTitle,
    username: config.USERNAME,
    created: now,
    modified: now
  });

  fs.writeFileSync(filename, template);
  data.open([filename]);
}

program.action(main).parse(process.argv);
