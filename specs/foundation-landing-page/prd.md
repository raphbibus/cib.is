# Epic PRD — Foundation & Landing Page

> **Status:** Built · **Confidence:** 90% · **Brainstorm runs:** 3
> **Source:** [Roadmap](../roadmap.md)
>
> **Design update (as-built, user-approved):** the visual direction was reiterated after the initial
> build from a light "industrial/brutalist" look to a **dark band/merch tour-poster** aesthetic
> (near-black stage, neon pink→green accent, music identity: equalizer, CV "tracklist",
> "backstage-pass" CTA), and the display typeface moved from Space Grotesk to **Anton**. See the tech
> spec's **§9 Resolved Tech Decisions (TD6–TD10)**. Requirement/AC *substance* below is unchanged;
> the font names in R15/AC13 and the SEO note in AC11 have been synced to the as-built state.

## 1. Context

First epic of the **cib.is** portfolio + consulting-funnel site. It must ship a deployed,
on-brand single-page presence that tells Ralph's story (CV-based) and points a primary CTA
toward the future Offers page (Epic 2).

Ralph positions as an **organizational engineer, agile punk, and part-time consultant**. The
audience is **German KMU / Mittelstand leadership** (Geschäftsführer, HR-/Org-Leitung). Tone is
**punky and edgy but credible** enough for conservative German decision-makers. German only.

**Source material:** Ralph's CV at `specs/2026-cv-de-ralph.pdf`; testimonials & certifications in
`specs/foundation-landing-page/infos-ralph/` (Arbeitszeugnisse, Zertifikate, Zwischenzeugnis).
Placeholder imagery in `placeholders/` (Ralph swaps in real images later).

**Locked by roadmap (do not re-open):** Astro `output: 'static'` (zero-JS default); Tailwind CSS 4
via `@tailwindcss/vite`; self-hosted `woff2` fonts via `@font-face` + `<link rel=preload>` (never a
CDN); Netlify free tier + custom domain **cib.is**; no tracking/cookies/third-party scripts (no
cookie banner); site stays `noindex` until Epic 4. This epic also produces `/docs/architecture.md`
and `/docs/coding-guidelines.md`.

**Cross-cutting (apply here):** ends fully functional + verifiable in browser (local `astro dev` +
Netlify deploy preview); Lighthouse ≥ 95 all categories; zero render-blocking third-party requests;
semantic HTML, keyboard-navigable, visible focus, WCAG AA contrast.

## 2. Requirements

<!-- R1 -->
- **R1** — Astro project scaffolded with `output: 'static'` and Tailwind CSS 4 via
  `@tailwindcss/vite`; production build ships zero JS by default.
- **R2** — Brand fonts self-hosted as `woff2` via `@font-face` with `<link rel="preload">`; no
  font (or any asset) requested from a CDN/third-party origin.
- **R3** — `/docs/architecture.md` (stack, folder structure, build/deploy flow, Netlify Forms
  gotcha for static Astro) and `/docs/coding-guidelines.md` (component patterns, naming, a11y, perf
  budget, content-authoring rules) authored.
- **R4** — Design system expresses an **industrial/brutalist** visual language as Tailwind theme
  tokens (color, type, spacing): raw borders, monospace accents, structural grid; high-contrast,
  WCAG AA.
- **R5** — A **fuller component library** is built up front: shared `Layout`, header nav, footer,
  plus reusable primitives anticipating Epics 2–4 (Button, Section, Hero, Card, prose/typography
  styles, form-field primitives). Landing page is composed from these, not inline one-offs.
- **R6** — Landing page follows a **story-first arc**: (1) personal narrative/manifesto hero,
  (2) CV-based experience/story, (3) primary CTA. Copy presents Ralph as organizational engineer /
  agile punk / part-time consultant.
- **R7** — Positioning executes **"punk as bait, credibility as the close"**: an edgy hook in the
  first viewport, followed by credibility proof drawn from the CV (`specs/2026-cv-de-ralph.pdf`).
- **R8** — Primary CTA is an **obfuscated `mailto:`** link (resists trivial source scraping, works
  on click); to be repointed to the Offers funnel in Epic 2.
- **R9** — Imagery uses placeholders from `placeholders/` via `astro:assets`, structured so Ralph
  can swap in real images later without layout changes.
- **R10** — Page is **responsive** mobile→desktop and includes basic SEO/OG meta + favicon.
- **R11** — Global `<meta name="robots" content="noindex,nofollow">` in the shared `Layout`.
  **Release blocker for Epic 4:** must be removed to go public (tracked in roadmap Epic 4).
- **R12** — Deployment target is the existing **`ralphcibis.netlify.app`** site, connected to the
  repo and deployed on **push to `main`** (this serves as the preview). The cib.is / www.cib.is
  custom-domain connection is **deferred until Ralph's DNS update resolves** (handled at Epic 4
  go-public).
- **R13** — Lighthouse ≥ 95 in all categories; semantic HTML, keyboard-navigable, visible focus,
  WCAG AA contrast.
- **R14** — German landing copy is **drafted by Claude** from the CV (`specs/2026-cv-de-ralph.pdf`)
  and the testimonials/certs in `specs/foundation-landing-page/infos-ralph/`; **Ralph reviews/edits**
  before go-public. Copy is German, in the punk-but-credible voice.
- **R15** — Typefaces: **Anton** (display; superseded Space Grotesk per TD8), **IBM Plex Mono**
  (accents/labels), **Inter** (body) — all self-hosted `woff2` (satisfies R2).
- **R16** — Header nav = **wordmark + minimal in-page anchor links** („Story", „Kontakt") that scroll
  within the single page; no links to unbuilt routes.
- **R17** — Footer = wordmark + copyright + obfuscated contact `mailto:`, with **reserved placeholder
  slots** for Impressum/Datenschutz (filled in Epic 4); no non-functional legal links shown now.
- **R18** — A **brutalist placeholder favicon + OG image** are generated from the wordmark/initials,
  structured for easy later replacement by Ralph.

## 3. Acceptance Criteria

<!-- AC1 -->
- **AC1** (R1, R2) — `astro build` succeeds; on the deployed page the network tab shows **no**
  third-party/CDN requests; fonts load same-origin as `woff2` with a `preload` link in `<head>`.
- **AC2** (R1) — Production HTML ships no render-blocking JS bundle by default (zero-JS verified in
  the network tab).
- **AC3** (R3) — Both `/docs` files exist and cover the topics listed in R3.
- **AC4** (R4, R5) — Landing page renders via shared `Layout`/header/footer and theme tokens;
  library components are reused (rendered from components, confirmable in the source tree).
- **AC5** (R6, R7) — First viewport shows an edgy positioning hook; scrolling reveals CV-based
  credibility/experience, then the CTA — story-first order verifiable on screen.
- **AC6** (R8) — The CTA email is **not** present as a plaintext `mailto:`/address in the raw HTML
  source, yet clicking it opens the mail client with the correct address.
- **AC7** (R9) — Images render via `astro:assets` from `placeholders/`; replacing a placeholder
  file updates the rendered image with no layout breakage.
- **AC8** (R10) — Layout adapts cleanly at a mobile and a desktop breakpoint; page has title +
  description + OG tags and a favicon.
- **AC9** (R11) — Every served page's `<head>` contains `noindex,nofollow`.
- **AC10** (R12) — Site is reachable at **`ralphcibis.netlify.app`** and updates on push to `main`.
- **AC11** (R13) — Lighthouse ≥ 95 across Performance/Accessibility/Best-Practices; every
  interactive element is keyboard-reachable with a visible focus state. **SEO note:** the SEO
  category reports ~66 *by design* this epic — the only failing audit is `is-crawlable`, caused by
  the intentional `noindex` (R11/AC9); excluding it, SEO is 100, and it returns to ≥ 95 at Epic 4
  go-public. Met when Perf/Accessibility/Best-Practices ≥ 95 and SEO's sole deduction is the noindex.
- **AC12** (R14) — Shipped story/experience sections show **German copy** whose claims trace to the
  CV + `infos-ralph/` sources; no lorem-ipsum in those sections.
- **AC13** (R15) — Anton (display), IBM Plex Mono, and the body face (Inter) all load as same-origin
  `woff2` (verifiable in the network tab; extends AC1).
- **AC14** (R16) — Header shows wordmark + anchor links that scroll to their matching in-page
  sections; no 404 / dead links.
- **AC15** (R17) — Footer shows wordmark, copyright, and a working obfuscated `mailto:`; no live
  Impressum/Datenschutz links yet.
- **AC16** (R18) — A favicon renders in the browser tab and an OG image is referenced in meta; both
  are swappable via a single asset path.

## 4. Open Questions

> ✅ **Ready to build.** Confidence ≥ 90%; no blocking questions remain. See Requirements (R1–R18)
> and Acceptance Criteria (AC1–AC16). The items below are non-blocking polish to settle during
> implementation — sensible defaults are fine and don't need a brainstorm round.

### Deferred (non-blocking)
- **Accent color & wordmark design** — exact hex / logo treatment within the brutalist, high-contrast,
  WCAG-AA system. Builder picks a defensible default; Ralph can tweak.
- **Real assets** — production photos, final favicon, final OG image: Ralph supplies later; built to
  swap in without layout change (R9, R18).
- **Final copy edit pass** — Claude drafts (R14); Ralph's editorial pass happens before Epic 4 go-public.

## 5. Resolved Decisions

| D# | Question | Chosen | Produced |
|----|----------|--------|----------|
| D1 | Q1 Positioning strategy | Punk as bait, credibility as the close (CV = `specs/2026-cv-de-ralph.pdf`) | R7, AC5 |
| D2 | Q2 Narrative arc | Story-first (manifesto → experience → CTA) | R6, AC5 |
| D3 | Q3 CTA behavior | Obfuscated `mailto:`, repointed to funnel in Epic 2 | R8, AC6 |
| D4 | Q4 Visual identity | Brutalist base, executed as a **dark band/merch tour-poster** (TD6–TD9); placeholder images from `placeholders/` | R4, R9, AC4, AC7 |
| D5 | Q5 Design-system scope | Fuller component library up front | R5, AC4 |
| D6 | Q6 noindex mechanism | Global `noindex,nofollow` meta in Layout; remove in Epic 4 | R11, AC9 |
| D7 | Q7 Copy source | Claude drafts German copy from CV + `infos-ralph/`; Ralph edits | R14, AC12 |
| D8 | Q8 Typefaces | Anton (display, ex-Space Grotesk per TD8) + IBM Plex Mono + Inter, self-hosted | R15, AC13 |
| D9 | Q9 Header nav | Wordmark + in-page anchor links („Story", „Kontakt") | R16, AC14 |
| D10 | Q10 Footer | Wordmark + copyright + obfuscated mailto; reserved legal slots | R17, AC15 |
| D11 | Q11 Domain handling | Deploy to `ralphcibis.netlify.app` via push-to-main; cib.is deferred to Epic 4 (DNS pending) | R12, AC10 |
| D12 | Q12 Favicon/OG | Generate brutalist placeholder favicon + OG from wordmark/initials | R18, AC16 |
