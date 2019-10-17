'use strict';

function escapeFilename(str) {
  return str.replace(/(["\s'$`\\])/g,'\\$1');
}

module.exports = escapeFilename;
