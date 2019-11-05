#!/usr/bin/env node
'use strict';

const program = require('commander');
const fs = require('fs');
const Handlebars = require('handlebars');
const path = require('path');
const moment = require('moment');

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

const DEFAULT_TITLE = 'YYYYMMDD-HHMM Note';

const DEFAULT_TEMPLATE = `---
tags: [{{ join tags }}]
title: {{ title }}
author: {{ username }}
created: '{{ format created }}'
modified: '{{ format modified }}'
---

# {{ title }}
`;

/**
 * Renders the vars into the source template using handlebars
 *
 * @param {string} source
 * @param {object<string, any>} data
 */
function renderTemplate(source = DEFAULT_TEMPLATE, data = {}) {
  Handlebars.registerHelper('join', (input, separator = ',') => {
    const str = input.join(separator);
    return new Handlebars.SafeString(str);
  });
  Handlebars.registerHelper('toISOString', (input) => {
    return new Handlebars.SafeString(input.toISOString());
  });
  Handlebars.registerHelper('format', (input, format) => {
    if (typeof format === 'string') {
      return new Handlebars.SafeString(moment(input).format(format));
    } else {
      return new Handlebars.SafeString(input.toISOString());
    }
  });
  const template = Handlebars.compile(source);
  // add default variable values
  const vars = Object.assign(data, {});
  return template(vars);
}


function main(title = DEFAULT_TITLE, tags = '') {
  const now = new Date();

  // argument defaults and validation
  const renderedTitle = (title || DEFAULT_TITLE)
    .replace(/YYYY-MM-DD/i, now.toISOString().substr(0, 10))
    .replace(/YYYYMMDD/i, now.toISOString().substr(0, 10).replace(/-/g, ''))
    .replace(/HH-MM/i, now.toISOString().substr(11, 5).replace(/:/g, '-'))
    .replace(/HHMM/i, now.toISOString().substr(11, 5).replace(/:/g, ''));

  // sanitize tags (trim), remove empty ones
  tags = tags.split(/\s*[,;]+\s*/gi).map(tag => tag.trim()).filter(v => v);

  // filename
  const basename = renderedTitle;
  const directory = path.join(config.HOME_PATH, path.dirname(basename));
  const filename = path.join(directory, path.basename(basename)) + '.md';

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

  // template
  const content = renderTemplate(DEFAULT_TEMPLATE, {
    created: now,
    modified: now,
    tags,
    title: renderedTitle,
    username: config.USERNAME,
  });

  fs.writeFileSync(filename, content);
  data.open([filename]);
}

program.action(main).parse(process.argv);
