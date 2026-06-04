# Roadmap — cib.is Portfolio & Consulting Site

## Context

A personal portfolio + soft sales-funnel website presenting Ralph as an
**organizational engineer, agile punk, and part-time consultant**. It tells his story (CV-based)
while funneling German KMU leadership toward booking a consulting Friday (490 € net = gross).
Tone: punky, edgy, but authentic enough for German Mittelstand decision-makers.

This is the **big-picture roadmap**. Each epic is refined and implemented in its own later session.

### Locked decisions
- **Generator:** Astro, `output: 'static'` (zero-JS by default → fast, no cookie banner needed)
- **Styling:** Tailwind CSS 4 via `@tailwindcss/vite`
- **Fonts:** self-hosted `woff2` via `@font-face` + `<link rel=preload>` — never loaded from a CDN/Google
- **Blog:** flatfile Markdown/MDX in the repo via Astro **Content Collections**; images via `astro:assets`, video embeddable
- **Hosting:** Netlify free tier; custom domain **cib.is**
- **Contact/booking:** Netlify Forms (free tier, 100 submissions/mo) + honeypot + GDPR-friendly captcha; **request-only** Friday booking (manual confirm by email), plus an obfuscated mailto fallback
- **Language:** German only
- **Privacy:** no tracking, no cookies, no third-party scripts → no cookie banner
- **Learning artifact:** `/docs` folder with architecture + coding guidelines, read by both Ralph and Claude when planning/implementing every epic
- **Epic order:** funnel-first

### Cross-cutting principles (apply to every epic)
- Each epic ends **fully functional and verifiable in the browser** (local `astro dev` + a Netlify deploy preview)
- Keep the site `noindex` / on preview until **Epic 4** ships legal pages — avoid a public German site without Imprint/Privacy
- Performance budget: Lighthouse ≥ 95 across the board; zero render-blocking third-party requests
- Accessibility: semantic HTML, keyboard-navigable, visible focus, WCAG AA contrast (matters for the punk palette)
- Every epic refinement re-reads `/docs/architecture.md` + `/docs/coding-guidelines.md` first

---

## The 5 Epics

### Epic 1 — Foundation & Landing Page
**Goal:** A deployed, on-brand single-page presence telling Ralph's story.

**Scope:**
- Astro project scaffold; Tailwind 4 wired; self-hosted fonts via `@font-face` + preload
- Netlify config + connect **cib.is** custom domain; first deploy live (preview, noindex)
- `/docs/architecture.md` (stack, folder structure, build/deploy flow, Netlify Forms gotcha for static Astro) and `/docs/coding-guidelines.md` (component patterns, naming, a11y, perf budget, content authoring rules)
- Design system: punk/edgy color + type tokens in the Tailwind theme; shared `Layout`, header nav, footer
- **Landing page** (CV-based, content provided at refinement): hero (positioning: org engineer / agile punk / part-time consultant), story/experience sections, primary CTA pointing toward the future Offers page
- Responsive (mobile → desktop), basic SEO/OG meta + favicon

**Browser-verifiable:** Landing page renders locally and on Netlify preview; nav + footer present; responsive; fonts self-hosted (no external font requests in the network tab).

---

### Epic 2 — Offers & Contact Funnel
**Goal:** The money path — present consulting offers and capture booking requests.

**Scope:**
- **Offers page:** org development, agile coaching, leadership training/coaching — pragmatic, "no bullshit, no upselling" voice; the **Friday model** (whole Friday, 490 € net = gross) clearly stated
- Funnel wiring: landing-page CTA → Offers → contact
- **Contact / booking form** via Netlify Forms: honeypot + GDPR-friendly captcha; request-only (Ralph confirms a Friday date manually by email); success/thank-you state; client-side validation
- **Obfuscated mailto** fallback link
- Form submission verified to land in the Netlify dashboard

**Browser-verifiable:** Full click path landing → offers → submit a test request → success state; submission appears in Netlify Forms; obfuscated email resists trivial scraping yet works on click.

---

### Epic 3 — Blog (flatfile, agile-punk)
**Goal:** A repo-managed writing space for agile-punk & organizational philosophy.

**Scope:**
- Astro **Content Collection** for blog: Markdown/MDX posts in the repo with frontmatter (title, date, tags, excerpt, optional cover)
- **Blog index** (list, newest first, tags) + **post detail** template
- **Media:** optimized images via `astro:assets`; embeddable video (self-hosted or privacy-respecting embed — no tracking)
- RSS feed + per-post SEO/OG; reading-friendly typography matching the punk system
- Migrate existing posts Ralph provides at refinement
- `/docs/content-authoring.md` documenting the post format & media workflow

**Browser-verifiable:** Index lists posts; a post renders with an embedded image and video; tags filter; RSS validates; adding a Markdown file produces a new post on rebuild.

---

### Epic 4 — Legal, Privacy & Launch Polish
**Goal:** Make it legally launchable and production-ready, then go public.

**Scope:**
- **Imprint (Impressum):** minimum required under German law (§5 DDG/TMG), content provided at refinement
- **Privacy (Datenschutzerklärung):** reflects no-tracking/no-cookies reality; covers Netlify hosting + Netlify Forms data handling; no cookie banner needed
- Footer links to Imprint + Privacy site-wide
- Launch polish: SEO/sitemap/robots, OG images, 404 page, accessibility pass, Lighthouse/perf pass, cross-browser & responsive QA
- **Go public:** remove `noindex`, confirm cib.is DNS/HTTPS, final production deploy

**Browser-verifiable:** Imprint + Privacy reachable from every page's footer; sitemap/robots served; 404 works; Lighthouse ≥ 95; site live and indexable on cib.is.

---

### Epic 5 — Coherence Pass (Design & Voice)
**Goal:** A post-launch consistency pass that makes the whole site feel like one piece — **more punk, more Mittelstand, more Ralph** — by unifying the design and the copy that grew across Epics 1–4. Refined/brainstormed in its own later session; this is the big-picture frame.

**Scope:**
- **Design coherence:** audit the styling actually shipped across landing, offers, blog (index + post), legal pages and 404; reconcile drift back into the Tailwind theme tokens (color, type scale, spacing, radii). Extract repeated patterns (CTA blocks, section headers, cards, buttons) into shared components so a token change propagates everywhere
- **Voice coherence:** a single tone guide capturing the **punk × Mittelstand × Ralph** baseline — German register (consistent *Sie*/*du*), recurring terms ("agile punk", the Friday model / 490 € net = gross), the "no bullshit, no upselling" register. Then a copy pass over every surface (hero, offers, blog CTA, form labels & success state, footer, 404, legal-adjacent microcopy) to align voice, terminology, and rhythm
- **Page structure:** minor restructuring only — consistent section rhythm, heading hierarchy, and CTA placement across pages; no new pages or features
- **Learning artifact:** a living `/docs/voice-and-design.md` (voice guide + design-token/component reference) read at the start of every future refinement, alongside `architecture.md` + `coding-guidelines.md`
- **Stay inside locked decisions:** static, zero-JS, self-hosted fonts, no new third-party requests, no cookie banner; preserve a11y (WCAG AA, visible focus) and the Lighthouse ≥ 95 budget; no regressions to existing tests/e2e or the live funnel

**Browser-verifiable:** All pages share one visual system (tokens/components, not page-local one-offs); copy reads in one consistent voice with consistent *Sie*/*du* and terminology; section/CTA rhythm is consistent page-to-page; existing unit + e2e tests still pass and Lighthouse stays ≥ 95.
