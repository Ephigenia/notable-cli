#!/usr/bin/env node
'use strict';

const program = require('commander');
const fs = require('fs');
const path = require('path');

const { renderTemplate } = require('./lib/renderTemplate');

const data = require('./lib/data');
const pkg = require('./../package.json');
const config = require('./config');

const DEFAULT_TEMPLATE = `---
tags: [{{ tags }}]
title: {{ title }}
author: {{ username }}
created: '{{ format created }}'
modified: '{{ format modified }}'
---

# {{ title }}
`;

program
  .version(pkg.version)
  .description('Creates a new note', {
    title: 'title of the note to be created, YYYY-MM-DD and HH-MM would be replaced',
    tags: 'csv list of tags to add',
  })
  .arguments('[title] [tags]')
  ;

const DEFAULT_TITLE = 'YYYYMMDD-HHMM Note';

function main(title = DEFAULT_TITLE, tags = '') {
  const now = new Date();

  // argument defaults and validation
  const renderedTitle = (title || DEFAULT_TITLE)
    .replace(/YYYY-MM-DD/i, now.toISOString().substr(0, 10))
    .replace(/YYYYMMDD/i, now.toISOString().substr(0, 10).replace(/-/g, ''))
    .replace(/HH-MM/i, now.toISOString().substr(11, 5).replace(/:/g, '-'))
    .replace(/HHMM/i, now.toISOString().substr(11, 5).replace(/:/g, ''));

  // filename
  const basename = renderedTitle;
  const directory = path.join(config.HOME_PATH, path.dirname(basename));
  const filename = path.join(directory, path.basename(basename)) + '.md';

  // sanitize tags (trim), remove empty ones
  tags = tags.split(/\s*[,;]+\s*/gi);
  // remove the notable-cli home directory and split the other parts of the
  // directory and add them as tags
  if (path.dirname(basename) !== '.') {
    path.dirname(basename).split('/').map(tag => tags.push(tag));
  }
  tags = tags.map(tag => tag.trim()).filter(v => v);
  // make tags unique
  tags = Array.from(new Set(tags));

  try {
    // check if title doesn’t contain a dot as first character or slashes
    if (basename.match(/^\./)) {
      throw new Error(
        'The given title would result in a hidden file starting with a dot.'
      );
    }
    if (fs.existsSync(filename)) {
      // check if file already exists
      throw new Error(
        `The file "${filename}" already exists and cannot be overwritten. ` +
        'Considering modifying this note instead'
      );
    }
    if (title.match(/\//)) {
      // create sub-directory when the title contains slashes
      fs.mkdirSync(directory, { recursive: true });
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  let templateSource = DEFAULT_TEMPLATE;
  if (process.stdin.isTTY === undefined) {
    templateSource = fs.readFileSync("/dev/stdin", "utf-8");
  }

  // template
  const content = renderTemplate(templateSource || DEFAULT_TEMPLATE, {
    created: now,
    modified: now,
    tags,
    title: renderedTitle.split('/').pop(),
    username: config.USERNAME,
  });

  fs.writeFileSync(filename, content);
  data.open([filename]);
}

program.action(main).parse(process.argv);
