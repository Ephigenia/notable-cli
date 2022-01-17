import { expect } from 'chai';
import { render } from './render.js';

describe('render', () => {
  it('returns rendered markdown', function() {
    const input = `# hello marcel`
    const result = render(input);
    expect(result).to.match(/hello marcel/);
  })
}); // suite
