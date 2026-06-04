import { describe, it, expect } from 'vitest';
import { firstParagraph, EXCERPT_MAX } from '@/lib/excerpt';

// T3 / R10, R15, AC7 — derive a plain-text excerpt from the first paragraph for
// the index card and the SEO/OG description (TD4).
describe('lib/excerpt firstParagraph', () => {
  it('returns the first paragraph as plain text', () => {
    const md = 'Erster Absatz mit Inhalt.\n\nZweiter Absatz.';
    expect(firstParagraph(md)).toBe('Erster Absatz mit Inhalt.');
  });

  it('ignores leading blank lines', () => {
    const md = '\n\n   \nErster echter Absatz.\n\nNoch was.';
    expect(firstParagraph(md)).toBe('Erster echter Absatz.');
  });

  it('skips a leading heading and uses the first prose paragraph', () => {
    const md = '# Titel\n\nDer erste richtige Absatz steht hier.\n\nMehr.';
    expect(firstParagraph(md)).toBe('Der erste richtige Absatz steht hier.');
  });

  it('strips inline markdown (links, bold, italics, code)', () => {
    const md = 'Ein [Link](https://example.com), **fett**, _kursiv_ und `code`.';
    expect(firstParagraph(md)).toBe('Ein Link, fett, kursiv und code.');
  });

  it('collapses internal whitespace / soft line breaks within a paragraph', () => {
    const md = 'Zeile eins\nZeile zwei im selben Absatz.\n\nNeuer Absatz.';
    expect(firstParagraph(md)).toBe('Zeile eins Zeile zwei im selben Absatz.');
  });

  it('truncates to a sane length for meta description', () => {
    const long = 'Wort '.repeat(100).trim();
    const out = firstParagraph(long);
    expect(out.length).toBeLessThanOrEqual(EXCERPT_MAX);
    expect(out.endsWith('…')).toBe(true);
  });

  it('returns an empty string for empty input', () => {
    expect(firstParagraph('')).toBe('');
    expect(firstParagraph('   \n\n  ')).toBe('');
  });
});
