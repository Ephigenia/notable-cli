'use strict';

const fg = 'grey';
const active = 'blue';

module.exports = function() {
  return {
    fg: fg,
    focus: {
      fg: 'white',
      border: {
        fg: active,
      },
    },
    scrollbar: {
      bg: fg,
    },
  };
};
