import Handlebars from 'handlebars';
import dayjs from 'dayjs';

Handlebars.registerHelper('toISOString', (input) => {
  return new Handlebars.SafeString(input.toISOString());
});
Handlebars.registerHelper('format', (input, format) => {
  const d = dayjs(input);
  const str = typeof format === 'string' ? d.format(format) : d.toISOString();
  return new Handlebars.SafeString(str);
});

/**
 * Renders the vars into the source template using handlebars
 *
 * @param {string} source
 * @param {object<string, any>} data
 */
export function renderTemplate(source = '', data = {}) {
  const template = Handlebars.compile(source);
  // add default variable values
  const vars = Object.assign(data, {});
  return template(vars);
}
