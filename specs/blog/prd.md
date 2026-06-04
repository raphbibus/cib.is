# Epic PRD — Blog (flatfile, agile-punk)

> **Status:** Drafting · **Confidence:** 30% · **Brainstorm runs:** 1
> **Source:** [Roadmap](../roadmap.md)

## 1. Context

A repo-managed writing space for Ralph's agile-punk & organizational philosophy,
living inside the cib.is portfolio/consulting site. The site is a soft sales funnel
(landing → offers → request a 490 € Friday); the blog's job is to support that funnel —
but *how* it supports it (convert warm visitors vs. attract cold ones vs. signal
credibility) is the central unresolved strategic question (see Q1), and it shapes nearly
every downstream decision.

**Locked from roadmap:** Astro static (`output: 'static'`, zero-JS default), Tailwind 4,
self-hosted fonts, German only, no tracking/cookies/third-party scripts (so no cookie
banner), Netlify free tier, `noindex` until Epic 4 ships legal pages.

**Roadmap scope (seed):** Astro Content Collection for posts (Markdown/MDX, frontmatter:
title/date/tags/excerpt/optional cover); blog index (newest-first, tags) + post detail
template; optimized images via `astro:assets` + embeddable video (privacy-respecting);
RSS feed; per-post SEO/OG; reading-friendly punk typography; migrate Ralph's existing
posts; `/docs/content-authoring.md` documenting the format & media workflow.

**Browser-verifiable (target):** Index lists posts; a post renders with an embedded image
and video; tags filter; RSS validates; adding a Markdown file produces a new post on rebuild.

## 2. Requirements

<!-- Empty until decisions are reconciled. -->

## 3. Acceptance Criteria

<!-- Empty until decisions are reconciled. -->

## 4. Open Questions

> How to answer: change `[ ]` to `[x]` on **one** option per question, or fill its `Other:` line.
> Don't delete a question — it moves to "Resolved Decisions" automatically on the next run.
> The `**(recommended)**` label is a suggestion only; nothing is pre-selected.

### Q1: What is the blog's primary job in the funnel?
This decision drives content strategy, post count, taxonomy, SEO emphasis, and CTAs.
- [ ] **Convert** — deepen trust for visitors already on-site; few deep evergreen essays; strong post→offer CTA — focuses effort where intent is highest, fits a part-time consultant who can't feed a content mill
- [ ] **Attract** — pull cold strangers via SEO/shareability; more posts, keyword-shaped; volume game — biggest reach but demands sustained output and conflicts with `noindex`-until-Epic-4
- [ ] **Ballast** — exist to signal "real practitioner"; quality over cadence, no growth pressure — lowest effort, but then the epic is mostly cosmetic
- [ ] **Convert-first, attract-later** — build for conversion now (deep posts + CTA), keep the door open for SEO once legal pages ship and indexing is on **(recommended)** — matches funnel-first roadmap order and the realistic cadence of one person; doesn't over-build for traffic that isn't there yet
- [ ] Other: 

### Q2: Authoring format — Markdown or MDX?
- [ ] **Markdown (`.md`) only** — simplest authoring, no JSX, fewest moving parts — keeps content portable and the build dumb; aligns with zero-JS default
- [ ] **MDX (`.mdx`)** — allows embedded components (callouts, custom video embed, CTA blocks) inside posts — more expressive, but pulls JS/components into content and risks scope creep **(recommended)** — the roadmap already names MDX, and a punk blog likely wants pull-quotes / CTA blocks / a privacy video component inline; Astro ships zero JS unless a component needs it, so the zero-JS budget holds
- [ ] Other: 

### Q3: How are videos embedded, given the no-tracking / no-third-party-scripts rule?
- [ ] **Self-hosted `<video>`** — MP4/WebM in the repo or on Netlify, native HTML player — zero third parties, full control, but bloats the repo and eats Netlify bandwidth
- [ ] **Privacy embed (e.g. YouTube `nocookie`, or click-to-load facade)** — offload hosting/bandwidth — saves repo size, but `youtube-nocookie` still hits a third party on play; a click-to-load facade keeps the initial page clean **(recommended)** — a click-to-load facade (poster image → loads embed only on click) honors "no third-party scripts on load," keeps the cookie-banner-free promise, and avoids hosting heavy video
- [ ] **Defer video entirely** — ship image support now, add video when a post actually needs it — avoids solving a problem with no current content
- [ ] Other: 

### Q4: How much existing content seeds the launch, and is there any to migrate?
- [ ] **Migrate existing posts** — Ralph has posts elsewhere to import — need source + count to scope migration effort
- [ ] **Write 2–3 new flagship posts** — start clean with conversion-grade essays — best if the job is Convert (Q1); small, high-quality set **(recommended)** — a funnel blog needs depth not breadth at launch; 2–3 strong posts prove the template and give the GF something to read
- [ ] **Ship empty with one placeholder/"hello" post** — infrastructure now, content later — fastest to "done," but an empty blog can hurt more than help
- [ ] Other: 

### Q5: Does the blog need full-text search or filtering beyond tags at launch?
- [ ] **Tags only (filter by tag), no search** — newest-first index + tag pages — zero-JS friendly, trivial to build, enough for a small post set **(recommended)** — with a handful of posts, search is over-engineering; tags already cover discovery
- [ ] **Client-side search (e.g. Pagefind)** — static-friendly full-text search — nice at scale, but adds JS + build step for a blog that may have <10 posts
- [ ] Other: 

## 5. Resolved Decisions

<!-- | D# | Question | Chosen | Produced | -->
