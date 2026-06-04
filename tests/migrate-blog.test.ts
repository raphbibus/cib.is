import { describe, it, expect } from 'vitest';
import {
  isRalphFile,
  stripImages,
  transformPost,
  outputFilename,
  assertUniqueSlugs,
} from '../scripts/migrate-blog.mjs';

// T4 / R5, R6, R9, R12, R13, R14, AC4, AC6, AC8 — pure migration transforms,
// tested on fixtures (never the live dir). The script keeps the # H1 in the
// body (the loader lifts it at build time, TD2), strips inline images, names
// files YYYY-MM-DD-<slug>.md, and adds `coauthor: Domi` only on the collab post.
describe('migrate-blog transforms', () => {
  it('selects only filenames containing "ralph" (R5)', () => {
    expect(isRalphFile('2020-01-27-ralph.md')).toBe(true);
    expect(isRalphFile('2020-07-30-domiralph.md')).toBe(true);
    expect(isRalphFile('2020-05-01-domi.md')).toBe(false);
    expect(isRalphFile('2020-05-01-max.md')).toBe(false);
    expect(isRalphFile('2020-05-01-chereen.md')).toBe(false);
  });

  it('strips whole image lines including caption (R6/AC6)', () => {
    const md =
      'Vor dem Bild.\n\n![alt text](../img/blog/2020-01-27-ralph.webp "Lange Bildunterschrift")\n\nNach dem Bild.';
    const out = stripImages(md);
    expect(out).not.toMatch(/!\[/);
    expect(out).not.toContain('../img/blog/');
    expect(out).toContain('Vor dem Bild.');
    expect(out).toContain('Nach dem Bild.');
  });

  it('keeps the # H1 in the body (loader lifts it — TD2/AC7)', () => {
    const raw = '# Mein Titel\n\nText mit ![x](../img/blog/a.webp).';
    const { content } = transformPost('2020-01-27-ralph.md', raw);
    expect(content).toMatch(/^# Mein Titel/m);
  });

  it('adds coauthor: Domi frontmatter only for the domiralph post (R9)', () => {
    const collab = transformPost('2020-07-30-domiralph.md', '# Einfache Wahrheiten\n\nText.');
    expect(collab.content).toMatch(/^---\r?\ncoauthor:\s*Domi\r?\n---/);

    const solo = transformPost('2020-01-27-ralph.md', '# Solo\n\nText.');
    expect(solo.content).not.toMatch(/coauthor/);
    expect(solo.content).toMatch(/^# Solo/);
  });

  it('derives the output filename as YYYY-MM-DD-<slug>.md from the H1', () => {
    const { content } = transformPost(
      '2020-01-27-ralph.md',
      '# Innovationsangst: Eine Geschichte\n\nText.',
    );
    expect(outputFilename('2020-01-27-ralph.md', content)).toBe(
      '2020-01-27-innovationsangst-eine-geschichte.md',
    );
  });

  it('records each applied change and flagged judgment call in the notes (R13/R14)', () => {
    const { notes } = transformPost(
      '2020-01-27-ralph.md',
      '# Titel\n\n![bild](../img/blog/a.webp "cap")\n\nText.',
    );
    expect(Array.isArray(notes)).toBe(true);
    expect(notes.join(' ')).toMatch(/image|bild/i);
  });

  it('throws on a slug collision across outputs (URL permanence)', () => {
    const files = [
      { out: '2020-01-01-gleicher-titel.md' },
      { out: '2021-02-02-gleicher-titel.md' },
    ];
    expect(() => assertUniqueSlugs(files)).toThrow(/collision/i);
  });

  it('accepts a set of unique slugs', () => {
    expect(() =>
      assertUniqueSlugs([{ out: '2020-01-01-a.md' }, { out: '2020-01-02-b.md' }]),
    ).not.toThrow();
  });
});
