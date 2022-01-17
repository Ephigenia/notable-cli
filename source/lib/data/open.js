import { spawnSync } from 'child_process';

import config from './../../config.js';

export function open(notes) {
  spawnSync(config.EDITOR, notes);
}
