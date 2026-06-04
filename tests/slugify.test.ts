import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/slugify';

// T2 / R2, R18, AC10, TD3 — title → clean, stable kebab-case slug with German
// transliteration so URLs are SEO-friendly and permanent.
describe('lib/slugify', () => {
  it('transliterates German diacritics (ä/ö/ü/ß → ae/oe/ue/ss)', () => {
    expect(slugify('Über große Stärke')).toBe('ueber-grosse-staerke');
    expect(slugify('Äpfel Öl Übung')).toBe('aepfel-oel-uebung');
    expect(slugify('Straße')).toBe('strasse');
  });

  it('lowercases and joins words with single hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Einfache Wahrheiten')).toBe('einfache-wahrheiten');
  });

  it('drops punctuation and collapses repeated separators', () => {
    expect(slugify('Innovationsangst: Eine Geschichte!!!')).toBe(
      'innovationsangst-eine-geschichte',
    );
    expect(slugify('Agile — ein "Meme"?')).toBe('agile-ein-meme');
    expect(slugify('a   b___c')).toBe('a-b-c');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --Hallo--  ')).toBe('hallo');
    expect(slugify('!Start und Ende!')).toBe('start-und-ende');
  });

  it('is stable / idempotent on an already-slug input', () => {
    expect(slugify('einfache-wahrheiten')).toBe('einfache-wahrheiten');
  });
});
