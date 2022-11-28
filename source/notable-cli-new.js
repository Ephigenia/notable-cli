#!/usr/bin/env node
'use strict';

import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import sanitizeFilename from 'sanitize-filename';

import { renderTemplate } from './lib/renderTemplate.js';
import { open } from './lib/data/open.js';
import config from './config.js';

const DEFAULT_TEMPLATE = `---
tags: [{{ tags }}]
title: {{ title }}
author: {{ username }}
created: '{{ format created }}'
modified: '{{ format modified }}'
---

# {{ title }}
`;
const DEFAULT_TITLE = 'YYYYMMDD-HHMM Note';

const program = new Command();
program
  .arguments('[title] [tags]', {
    title: 'title of the note to be created, YYYY-MM-DD and HH-MM would be replaced',
    tags: 'csv list of tags to add',
  })
  .description('Creates a new note')
  .action(main)
  .parseAsync();

async function main(title = DEFAULT_TITLE, tags = '') {
  const now = new Date();

  // argument defaults and validation
  const renderedTitle = (title || DEFAULT_TITLE)
    .replace(/YYYY-MM-DD/i, now.toISOString().substring(0, 10))
    .replace(/YYYYMMDD/i, now.toISOString().substring(0, 10).replace(/-/g, ''))
    .replace(/HH-MM/i, now.toISOString().substring(11, 5).replace(/:/g, '-'))
    .replace(/HHMM/i, now.toISOString().substring(11, 5).replace(/:/g, ''));

  const basename = sanitizeFilename(path.basename(renderedTitle), { replacement: '-'});
  const dirname = path.join(config.HOME_PATH, path.dirname(renderedTitle));
  // make sure the actual filename is properly escaped
  const filename = path.join(dirname, basename + '.md');

  if (!basename) {
    throw new Error(`Unable to create a file with an empty filename in ${JSON.stringify(dirname)}`);
  }

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
    templateSource = await fs.promises.readFile('/dev/stdin', 'utf-8');
  }

  // template
  const content = renderTemplate(templateSource || DEFAULT_TEMPLATE, {
    created: now,
    modified: now,
    tags,
    title: renderedTitle.split('/').pop(),
    username: config.USERNAME,
  });

  await fs.promises.writeFile(filename, content);
  open([filename]);
}
