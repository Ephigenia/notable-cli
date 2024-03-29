export const options = [
  '-score',
  'score',
  'title',
  '-title',
  '-category',
  'category',
  '-created',
  'created',
  '-modified',
  'modified',
];

/**
 * @param {import('./data').ParsedNote} a
 * @param {import('./data').ParsedNote} a
 * @param {string} field
 * @return {Number}
 */
export function sort(a, b, field) {
  let modifier = v => v;
  let fieldname = field.replace(/^-/, '');
  if (fieldname !== field) {
    modifier = v => -v;
  }
  switch(fieldname) {
    case 'category':
      return modifier(String(a.category).localeCompare(String(b.category)));
    case 'score':
      return modifier(a.metadata.score - b.metadata.score);
    case 'created':
    case 'modified':
      if (!(a.metadata[String(fieldname)] instanceof Date)) return modifier(1);
      if (!(b.metadata[String(fieldname)] instanceof Date)) return modifier(1);
      return modifier(a.metadata[String(fieldname)] - b.metadata[String(fieldname)]);
    case 'title':
    default:
      return modifier(String(a.metadata.title).localeCompare(String(b.metadata.title)));
  }
}
