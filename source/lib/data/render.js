import * as marked from 'marked';
import TerminalRenderer from 'marked-terminal';

export function render(content) {
  marked.setOptions({
    renderer: new TerminalRenderer(),
  });
  return marked.marked(content);
}
