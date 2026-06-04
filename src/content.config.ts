import { defineCollection } from 'astro:content';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { blogSchema, deriveEntry } from '@/lib/blog';

// First Content Collection on the site (architecture.md: "arrives with the blog,
// Epic 3"). The `blog` collection uses a CUSTOM LOADER (TD2): instead of baking
// title/date into frontmatter, the loader derives them at build time —
//   date  = the YYYY-MM-DD filename prefix,
//   title = the first # H1 (then stripped from the rendered body — AC7),
//   id    = slugify(title) (TD3) so file and /blog/<slug> route agree.
// Frontmatter carries only an optional `coauthor` (e.g. "Domi" → "mit Domi").
const BLOG_DIR = new URL('./content/blog/', import.meta.url);

/** Minimal YAML-frontmatter split — the only field is `coauthor` (R9). */
function splitFrontmatter(raw: string): { coauthor?: string; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { body: raw };
  const fm = m[1];
  const co = /^coauthor:\s*["']?([^"'\n]+?)["']?\s*$/m.exec(fm);
  return { coauthor: co?.[1]?.trim(), body: raw.slice(m[0].length) };
}

function blogLoader() {
  return {
    name: 'blog-loader',
    async load({ store, renderMarkdown, parseData, generateDigest }: any) {
      store.clear();
      const files = (await readdir(BLOG_DIR))
        .filter((f) => f.endsWith('.md'))
        .sort(); // deterministic order

      const seen = new Map<string, string>();
      for (const filename of files) {
        const raw = await readFile(new URL(filename, BLOG_DIR), 'utf8');
        const { coauthor, body: rawBody } = splitFrontmatter(raw);
        const { id, body, data } = deriveEntry(filename, rawBody, coauthor);

        // URL permanence: two posts must never slugify to the same id (TD3).
        if (seen.has(id)) {
          throw new Error(
            `Slug collision: "${id}" from ${filename} and ${seen.get(id)}`,
          );
        }
        seen.set(id, filename);

        const parsed = await parseData({ id, data });
        store.set({
          id,
          data: parsed,
          body,
          rendered: await renderMarkdown(body),
          digest: generateDigest(raw),
        });
      }
    },
  };
}

const blog = defineCollection({
  loader: blogLoader(),
  schema: blogSchema,
});

export const collections = { blog };
