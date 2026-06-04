import { describe, it, expect } from 'vitest';
import { parseDateFromFilename, liftTitle, deriveEntry, blogSchema } from '@/lib/blog';

// T1 / R3, R9, R10, R11, R18, AC2, AC7 — the loader's pure derivation helpers:
// date from the filename prefix, title lifted from the first # H1 (removed from
// the body so it isn't rendered twice), id = slugify(title); plus the Zod schema.
describe('lib/blog derivation helpers', () => {
  it('parses the date from a YYYY-MM-DD filename prefix', () => {
    const d = parseDateFromFilename('2020-01-27-innovationsangst.md');
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString().slice(0, 10)).toBe('2020-01-27');
  });

  it('throws on a filename without a valid date prefix', () => {
    expect(() => parseDateFromFilename('innovationsangst.md')).toThrow();
  });

  it('lifts the first H1 into the title and strips that line from the body (AC7)', () => {
    const raw = '# Einfache Wahrheiten\n\nErster Absatz.\n\n## Zwischentitel\n';
    const { title, body } = liftTitle(raw);
    expect(title).toBe('Einfache Wahrheiten');
    expect(body).not.toMatch(/^#\s+Einfache Wahrheiten/m);
    expect(body).toContain('Erster Absatz.');
    expect(body).toContain('## Zwischentitel'); // sub-headings are untouched
  });

  it('throws if the body has no H1 to lift', () => {
    expect(() => liftTitle('Kein Titel hier.\n')).toThrow();
  });

  it('derives id/title/date/body for a full file (id = slugify(title))', () => {
    const entry = deriveEntry(
      '2020-01-27-innovationsangst.md',
      '# Innovationsangst: Eine Geschichte\n\nText.',
    );
    expect(entry.id).toBe('innovationsangst-eine-geschichte');
    expect(entry.data.title).toBe('Innovationsangst: Eine Geschichte');
    expect(entry.data.date.toISOString().slice(0, 10)).toBe('2020-01-27');
    expect(entry.body).toContain('Text.');
    expect(entry.body).not.toContain('# Innovationsangst');
  });

  it('schema accepts derived data and a valid coauthor', () => {
    const ok = blogSchema.safeParse({
      title: 'X',
      date: new Date('2020-01-27'),
      coauthor: 'Domi',
    });
    expect(ok.success).toBe(true);
  });

  it('schema rejects missing title or date', () => {
    expect(blogSchema.safeParse({ date: new Date() }).success).toBe(false);
    expect(blogSchema.safeParse({ title: 'X' }).success).toBe(false);
  });
});
