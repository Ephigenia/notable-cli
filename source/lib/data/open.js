import { spawnSync } from 'child_process';

import config from './../../config.js';

/**
 * Open the given notes in the systems standard $EDITOR
 *
 * @param {string[]} filename
 * @return {void}
 */
export function open(filenames) {
  spawnSync(config.EDITOR, filenames);
}
