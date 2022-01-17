import { expect } from 'chai';
import { renderTemplate } from './renderTemplate.js';

describe('renderTemplate', () => {

  it('returns the rendered template', () => {
    const result = renderTemplate('Hello my Name is {{ name }}', {
      name: 'Ephigenia'
    });
    expect(result).to.eq('Hello my Name is Ephigenia');
  });

  describe('helpers', () => {
    describe('format', () => {
      it('defaults to ISO time format', () => {
        const template = '{{ format date }}';
        const data = {
          date: '2021-12-24 12:00:00',
        };
        const result = renderTemplate(template, data);
        expect(result).to.match(/2021-12-24/);
      });
      it('formats string dates to the given format', () => {
        const template = '{{ format date "YYYY-MM-DD"}}';
        const data = {
          date: '2021-12-24 12:00',
        };
        const result = renderTemplate(template, data);
        expect(result).to.eq('2021-12-24');
      });
      it('formats the given date using the template string', () => {
        const template = '{{ format date "YYYY-MM-DD"}}';
        const data = {
          date: new Date('2021-01-03'),
        };
        const result = renderTemplate(template, data);
        expect(result).to.eq('2021-01-03');
      });
    });
  });
}); // describe
