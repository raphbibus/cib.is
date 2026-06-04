/**
 * Title → clean, stable kebab-case slug (R2/R18/AC10, TD3).
 *
 * German diacritics are transliterated (ä→ae, ö→oe, ü→ue, ß→ss) so blog URLs
 * are ASCII-clean, SEO-friendly, and permanent once published. The same
 * function names the migrated files and derives the collection entry id, so
 * file and route always agree.
 */
const TRANSLITERATIONS: Array<[RegExp, string]> = [
  [/ä/g, 'ae'],
  [/ö/g, 'oe'],
  [/ü/g, 'ue'],
  [/ß/g, 'ss'],
];

export function slugify(title: string): string {
  let s = title.toLowerCase();
  for (const [from, to] of TRANSLITERATIONS) s = s.replace(from, to);
  return s
    .normalize('NFKD') // strip any remaining combining accents
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-') // every run of non-alphanumerics → one hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
