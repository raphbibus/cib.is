#!/usr/bin/env node
/**
 * One-time blog migration (T4 / R5, R6, R9, R12, R13, R14, TD1, TD6).
 *
 * Reads the `ralph` posts from `blog-old-agile-punks/`, applies safe MECHANICAL
 * fixes only, and writes committed `.md` files into `src/content/blog/` named
 * `YYYY-MM-DD-<slug>.md`. The `# H1` is KEPT in the body — the content loader
 * lifts it into `title` at build time (TD2). Inline images are stripped (R6).
 * `coauthor: Domi` frontmatter is written only on the collab post (R9). Every
 * applied change and flagged judgment call is appended to `editorial-notes.md`
 * (gitignored — R14/AC8). After the output is reviewed + committed, delete
 * `blog-old-agile-punks/` by hand (TD6).
 *
 * The transforms are pure (string → string) and unit-tested in
 * tests/migrate-blog.test.ts; only main() touches the filesystem.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const COLLAB_FILE = 'domiralph';
const DISCARDED_AUTHORS = ['domi', 'max', 'chereen'];

/** Mirror of src/lib/slugify.ts (kept inline so the script runs under plain node). */
export function slugify(title) {
  let s = title.toLowerCase();
  s = s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** R5 — only files whose name contains "ralph" are migrated. */
export function isRalphFile(filename) {
  return /ralph/i.test(filename);
}

/** R6/AC6 — remove every inline image line (and its caption) entirely. */
export function stripImages(markdown) {
  return markdown
    .split('\n')
    .filter((line) => !/!\[[^\]]*\]\([^)]*\)/.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

function firstH1(markdown) {
  const m = /^#\s+(.+?)\s*$/m.exec(markdown);
  if (!m) throw new Error('No H1 found in post body');
  return m[1].trim();
}

function datePrefix(filename) {
  const m = /^(\d{4}-\d{2}-\d{2})-/.exec(filename);
  if (!m) throw new Error(`No YYYY-MM-DD prefix in ${filename}`);
  return m[1];
}

/**
 * Transform one post body. Returns the new `content` and the `notes` (applied
 * changes + flagged judgment calls for Ralph). The H1 stays in the body.
 */
export function transformPost(filename, raw) {
  const notes = [];
  let body = raw.replace(/\r\n/g, '\n').trimEnd() + '\n';

  // Mechanical: strip inline images (R6).
  const imageCount = (body.match(/!\[[^\]]*\]\([^)]*\)/g) || []).length;
  if (imageCount > 0) {
    body = stripImages(body);
    notes.push(`- [${filename}] removed ${imageCount} inline image reference(s) (R6).`);
  }

  // Flag (do NOT auto-edit) any mention of a discarded author — judgment call (R13).
  for (const author of DISCARDED_AUTHORS) {
    if (author === 'domi' && /domiralph/.test(filename)) continue; // collab byline, not a stray ref
    const re = new RegExp(`\\b${author}\\b`, 'i');
    if (re.test(body)) {
      notes.push(
        `- [${filename}] JUDGMENT CALL: mentions discarded author "${author}" — review reference/voice (R13).`,
      );
    }
  }

  // R9 — collab post gets a "mit Domi" byline via coauthor frontmatter; solo posts none.
  let content = body;
  if (filename.includes(COLLAB_FILE)) {
    content = `---\ncoauthor: Domi\n---\n${body}`;
    notes.push(`- [${filename}] added \`coauthor: Domi\` frontmatter ("mit Domi") (R9).`);
  }

  return { content, notes };
}

/** Output filename: date prefix from the input + slug from the H1. */
export function outputFilename(inputFilename, content) {
  return `${datePrefix(inputFilename)}-${slugify(firstH1(content))}.md`;
}

/** URL permanence — two posts must never slugify to the same slug (TD3). */
export function assertUniqueSlugs(files) {
  const seen = new Map();
  for (const f of files) {
    const slug = f.out.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    if (seen.has(slug)) {
      throw new Error(`Slug collision: "${slug}" from ${f.out} and ${seen.get(slug)}`);
    }
    seen.set(slug, f.out);
  }
}

// --- filesystem runner (only when invoked directly) -------------------------

async function main() {
  const root = new URL('../', import.meta.url);
  const srcDir = new URL('blog-old-agile-punks/', root);
  const outDir = new URL('src/content/blog/', root);
  const notesPath = fileURLToPath(new URL('editorial-notes.md', root));
  const gitignorePath = fileURLToPath(new URL('.gitignore', root));

  await mkdir(outDir, { recursive: true });

  const all = await readdir(srcDir);
  const ralph = all.filter(isRalphFile).sort();
  const outputs = [];
  const allNotes = [];

  for (const filename of ralph) {
    const raw = await readFile(new URL(filename, srcDir), 'utf8');
    const { content, notes } = transformPost(filename, raw);
    const out = outputFilename(filename, content);
    outputs.push({ in: filename, out, content });
    allNotes.push(...notes);
  }

  assertUniqueSlugs(outputs);

  for (const o of outputs) {
    await writeFile(new URL(o.out, outDir), o.content, 'utf8');
  }

  const header = `# Editorial notes — blog migration\n\n` +
    `Auto-generated by scripts/migrate-blog.mjs. Gitignored (R14/AC8). For Ralph's review.\n\n` +
    `Migrated ${outputs.length} ralph posts; discarded posts by ${DISCARDED_AUTHORS.join('/')} only.\n\n` +
    `## Applied changes & flagged judgment calls\n\n`;
  await writeFile(notesPath, header + allNotes.join('\n') + '\n', 'utf8');

  // Ensure editorial-notes.md is gitignored (R14/AC8).
  ensureGitignored(gitignorePath, 'editorial-notes.md');

  console.log(`Migrated ${outputs.length} posts → src/content/blog/`);
  for (const o of outputs) console.log(`  ${o.in}  →  ${o.out}`);
  console.log(`Wrote ${notesPath} (${allNotes.length} notes).`);
  console.log('Review + commit the posts, then delete blog-old-agile-punks/ (TD6).');
}

export function ensureGitignored(gitignorePath, entry) {
  let current = existsSync(gitignorePath) ? readFileSync(gitignorePath, 'utf8') : '';
  if (current.split('\n').some((l) => l.trim() === entry)) return false;
  const block = `\n# Private editorial notes from the blog migration — never commit (R14/AC8)\n${entry}\n`;
  appendFileSync(gitignorePath, block);
  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
