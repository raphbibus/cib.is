/**
 * Blog collection derivation helpers + schema (T1 / R3, R9, R10, R11, R18, AC2, AC7).
 *
 * `title` and `date` are NOT baked into frontmatter — they are derived at build
 * time by the custom loader in `src/content.config.ts` (TD2):
 *   - `date`  is parsed from the `YYYY-MM-DD` filename prefix,
 *   - `title` is lifted from the first `# H1` (which is then stripped from the
 *     rendered body so the heading isn't shown twice — AC7),
 *   - the entry `id` is `slugify(title)` so file and route slug agree (TD3).
 *
 * These helpers are kept pure (and free of `astro:content`) so they can be
 * unit-tested in Vitest without the Astro virtual modules.
 */
import { z } from 'astro/zod';
import { slugify } from './slugify';

/** `title` lifted from the H1, `date` from the filename, optional `coauthor`. */
export const blogSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  coauthor: z.string().optional(),
});

export type BlogData = z.infer<typeof blogSchema>;

const DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})-/;

/** Parse the publish date from a `YYYY-MM-DD-<slug>.md` filename prefix (R7/R10). */
export function parseDateFromFilename(filename: string): Date {
  const m = DATE_PREFIX.exec(filename);
  if (!m) throw new Error(`No YYYY-MM-DD date prefix in filename: ${filename}`);
  const [, y, mo, d] = m;
  const date = new Date(`${y}-${mo}-${d}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date in filename: ${filename}`);
  return date;
}

/**
 * Lift the first `# H1` into `title` and return the body with that single line
 * removed (AC7). Sub-headings (`##`, `###`, …) are left untouched.
 */
export function liftTitle(raw: string): { title: string; body: string } {
  const lines = raw.split('\n');
  const idx = lines.findIndex((l) => /^#\s+\S/.test(l));
  if (idx === -1) throw new Error('No H1 (`# Title`) found in post body');
  const title = lines[idx].replace(/^#\s+/, '').trim();
  lines.splice(idx, 1);
  // Drop a now-leading blank line so the body starts at the first paragraph.
  while (lines.length && lines[0].trim() === '') lines.shift();
  return { title, body: lines.join('\n') };
}

export interface DerivedEntry {
  id: string;
  body: string;
  data: BlogData;
}

/** German long-form date (e.g. "27. Januar 2020"), shared by index + post page. */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Full derivation for one file: filename + raw contents → { id, body, data }. */
export function deriveEntry(
  filename: string,
  raw: string,
  coauthor?: string,
): DerivedEntry {
  const date = parseDateFromFilename(filename);
  const { title, body } = liftTitle(raw);
  const id = slugify(title);
  return { id, body, data: { title, date, ...(coauthor ? { coauthor } : {}) } };
}
