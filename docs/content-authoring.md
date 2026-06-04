# Content Authoring — Blog (R17)

How to write a blog post for cib.is. Posts are CommonMark `.md` files in the Astro
**Content Collection** at `src/content/blog/`. No MDX, no JS, no database — add a file,
rebuild, and it's published. Read with [architecture.md](architecture.md) and
[coding-guidelines.md](coding-guidelines.md).

## TL;DR — add a post

1. Create `src/content/blog/YYYY-MM-DD-<slug>.md` (date = publish date).
2. Make the first line a single `# H1` — that becomes the post title.
3. Write CommonMark below it. The build does the rest.

## Filename & date convention

- Pattern: **`YYYY-MM-DD-<title-slug>.md`** — e.g. `2024-05-01-agile-ohne-buzzwords.md`.
- The **date** is parsed from the `YYYY-MM-DD` filename prefix (not frontmatter). It drives
  the newest-first index ordering and the displayed date.
- The **`<title-slug>`** portion should equal `slugify(title)` so the file and the public
  route `/blog/<slug>` agree. German diacritics are transliterated (`ä→ae`, `ö→oe`,
  `ü→ue`, `ß→ss`). When in doubt, run the title through `src/lib/slugify.ts`.
- Slugs are **permanent** once a post is public (SEO/attract mode, Epic 4). Two posts must
  never slugify to the same slug — the build fails loudly on a collision.

## Title (the `# H1`)

- The **first `# H1` in the body is the title.** The loader lifts it into the post's
  `<h1>` and **removes that line from the rendered body** so the heading never appears
  twice (AC7). Keep writing the H1 in the file — don't duplicate it as frontmatter.
- Sub-headings (`##`, `###`) are yours to use and are rendered untouched. Keep a sane
  heading order (don't skip from `#` to `###`) for accessibility.

## Frontmatter schema

Frontmatter is **optional** and minimal — the only supported field is `coauthor`:

```markdown
---
coauthor: Domi
---
# Mein Titel

Erster Absatz …
```

| Field | Required | Notes |
| :--- | :--- | :--- |
| `title` | — | **Not** in frontmatter — derived from the `# H1`. |
| `date` | — | **Not** in frontmatter — derived from the filename prefix. |
| `coauthor` | optional | A co-author's name, e.g. `Domi` → renders a "mit Domi" note. Solo posts omit it (no byline). |

There is **no `tags`, `description`, or `cover` field** at launch (flat, conversion-first
index). The excerpt and SEO/OG `description` are auto-derived from the **first paragraph**.

## Image policy

- Migrated posts carry **no images** — all inline image references were stripped (R6/R12),
  and there are **no cover/hero images** anywhere in the blog.
- A future post that needs an image must use **`astro:assets`** (`<Image>` with a source in
  `src/assets/img/`) inside a fixed aspect-ratio wrapper, so there's no layout shift and the
  Lighthouse budget holds. Never hot-link or embed a remote/CDN image.
- **Video is out of scope** — no `<video>`, no `<iframe>` embeds, no player component.

## CTA convention

Every post detail page automatically ends with the end-of-post CTA block (`PostCta.astro`)
that links to the Offers page (`/angebot`). The copy is **personal / first-person** (Ralph
as a person, not a company). You don't add it per post — it's part of the post layout.

## Preview & checks

```bash
npm run dev       # local preview at /blog
npm run build     # validates the collection schema + derives title/date/slug
npm test          # unit tests (slugify, excerpt, schema, migration)
```
