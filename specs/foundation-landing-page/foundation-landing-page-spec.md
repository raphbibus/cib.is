# Tech Spec — Foundation & Landing Page

> **Status:** Ready to build · **Confidence:** 93% · **Spec runs:** 2
> **Source PRD:** [prd.md](prd.md)
> **Guidelines:** docs/architecture.md *(to be authored — R3)*, docs/coding-guidelines.md *(to be authored — R3)*, docs/deployment.md, docs/testing.md

## 1. Overview

We scaffold the **cib.is** site as a static Astro project (`output: 'static'`, zero-JS by
default) styled with Tailwind CSS 4 via `@tailwindcss/vite`. The deliverable is a single,
responsive, German landing page that tells Ralph's story (manifesto hero → CV-based credibility →
CTA) in an **industrial/brutalist** visual language, built from a reusable component library that
anticipates Epics 2–4.

Hard technical constraints from the roadmap/PRD that shape everything below:
- **Zero third-party requests** at runtime — fonts self-hosted as same-origin `woff2`; no CDN, no
  trackers, no cookie banner (AC1, AC13, R2).
- **No render-blocking JS bundle by default** — Astro ships no client bundle unless a component
  opts in with a `client:*` directive (AC2 holds). Strict zero-JS *purity* is **not** a hard
  constraint (TD2): the obfuscated `mailto:` CTA uses one small, dependency-free, hand-rolled inline
  `<script>` that assembles the address on click — non-blocking, no framework, no island hydration.
- **`noindex,nofollow`** on every page until Epic 4 (R11, AC9), enforced both in the `<head>` meta
  and via the `X-Robots-Tag` header already specced in `docs/deployment.md`.
- **Lighthouse ≥ 95** in all four categories, WCAG AA, keyboard-navigable (R13, AC11).
- Deploy target is the existing **`ralphcibis.netlify.app`** via push-to-`main` (R12, AC10);
  custom domain deferred to Epic 4.

The epic also authors `/docs/architecture.md` and `/docs/coding-guidelines.md` (R3, AC3).

## 2. Key Architecture Decisions

| # | Decision | Choice | Rationale | Rejected |
| :- | :------- | :----- | :-------- | :------- |
| A1 | Generator & output | Astro `output: 'static'` | Locked by roadmap; zero-JS, prerendered HTML, Netlify-friendly | Next/SSR (needless JS, adapter) |
| A2 | Styling | Tailwind 4 via `@tailwindcss/vite`; brand tokens in `@theme` | Locked; v4 puts design tokens in CSS `@theme`, no `tailwind.config.js` needed | Tailwind 3 config-file flow |
| A3 | Fonts | Self-hosted, subset-to-latin `woff2` from upstream OFL sources, **2 weights/family** (Space Grotesk 500/700, IBM Plex Mono 400/500, Inter 400/600); `@font-face` + `<link rel=preload>` for the two above-the-fold faces only | R2/R15 (TD4); preload only what the first paint needs to protect LCP | Fontsource-copied files (weight bloat risk); Google Fonts CDN |
| A4 | Component model | A primitives library (`src/components/`) — `Layout`, `Header`, `Footer`, `Button`, `Section`, `Hero`, `Card`, `Prose`, `FormField` — composed into the page | R5/AC4; front-loads Epics 2–4 reuse | Inline one-off markup |
| A5 | Content/copy location | German copy lives in a **typed TS data module** `src/content/landing.ts` (typed `{ hero, sections[], cta }` shape), separate from markup | R14 (TD3); type-safe, one file for Ralph to edit, no Content-Collection overhead for one page (Collections arrive in Epic 3) | Hard-coded strings in `.astro`; single-entry Content Collection |
| A6 | Image pipeline | `astro:assets` `<Image>` from `placeholders/` (moved to `src/assets/`), fixed aspect-ratio wrappers | R9/AC7; optimizes the 2–3 MB source JPEGs to keep Lighthouse perf ≥ 95; swappable by path | `<img>` with raw files (perf fail) |
| A7 | Indexing guard | `<meta robots noindex,nofollow>` in `Layout` **and** `X-Robots-Tag` header in `netlify.toml` | R11/AC9; defence-in-depth, single removal point in Epic 4 | Meta-only |
| A8 | Deploy | Git-based continuous deploy to `ralphcibis.netlify.app` on push to `main`; `netlify.toml` per `docs/deployment.md` | R12/AC10 | CLI-only manual deploys |
| A9 | Component testing | `.astro`/DOM behaviour verified via **Playwright e2e** against `npm run preview`; Vitest covers only pure logic (`lib/*`) + build-output assertions | TD1; simplest + most stable for a tiny static site, matches `docs/testing.md` ("e2e is the rendered-output source of truth"), avoids the experimental Container API | Vitest + Astro Container API; jsdom fragments |
| A10 | mailto obfuscation | One small, **dependency-free hand-rolled inline `<script>`** assembles the CTA/footer address on click from `lib/mailto.ts`-encoded tokens; no framework, no `client:*` island | R8/AC6 (TD2); robust against trivial scraping, negligible non-blocking bytes (keeps AC2), zero new deps | strict no-JS entity/CSS tricks (weaker); `client:load` island (real bundle) |

## 3. Design

### 3.1 Components / Modules

```
src/
  assets/fonts/            space-grotesk-{500,700}, ibm-plex-mono-{400,500}, inter-{400,600} .woff2 (latin subset)
  assets/img/              placeholder images (moved from /placeholders), consumed by astro:assets
  styles/global.css        @import "tailwindcss"; @theme { brand tokens }; @font-face blocks
  lib/
    mailto.ts              encode()/decode() for obfuscated address (pure, unit-tested)
    seo.ts                 buildMeta() → title/description/OG/robots (pure, unit-tested)
  content/
    landing.ts             typed German copy: hero, story sections, CTA labels (A5)
  components/
    Layout.astro           <html>, <head> (meta/OG/robots/preload), global.css, <slot/>
    Header.astro           wordmark + in-page anchor links (Story, Kontakt)
    Footer.astro           wordmark, copyright, obfuscated mailto, reserved legal slots
    Button.astro           variant/size props; brutalist styling
    Section.astro          semantic <section> w/ id (anchor targets), grid container
    Hero.astro             manifesto hook (first viewport)
    Card.astro             credibility/experience items
    Prose.astro            typographic wrapper for long-form copy
    FormField.astro        label+input primitive (built now, used in Epic 2)
    MailtoLink.astro       renders the obfuscated CTA (impl depends on TD2)
    BaseHead.astro         optional split of <head> tags (favicon, OG, preload)
  pages/
    index.astro            composes Layout + Hero + Section(s) + CTA
public/
  favicon.svg / favicon.ico, og-default.png   (brutalist placeholder, swappable — R18)
docs/
  architecture.md, coding-guidelines.md       (R3 deliverables)
netlify.toml                                  (build + X-Robots-Tag header)
```

### 3.2 Data model & contracts

- **Theme tokens** (`@theme` in `global.css`): `--color-ink`, `--color-paper`, `--color-accent`
  (defensible brutalist default, WCAG-AA against paper/ink — see deferred), `--font-display`
  (Space Grotesk), `--font-mono` (IBM Plex Mono), `--font-body` (Inter/system), structural spacing
  + border tokens.
- **`lib/mailto.ts`**: `encode(addr: string): string` and `decode(token: string): string` —
  inverse functions; `decode(encode(x)) === x`; `encode(x)` must not contain the literal `@` or the
  plaintext address (AC6).
- **`lib/seo.ts`**: `buildMeta({title, description, ogImage, path})` → object consumed by
  `Layout`/`BaseHead`; always includes `robots: 'noindex,nofollow'` (AC9).
- **Copy contract** (A5, `src/content/landing.ts`): a typed shape
  `{ hero: {...}, sections: Section[], cta: {...} }` so components read structured German content;
  claims trace to the CV + `infos-ralph/` (AC12).
- **`MailtoLink.astro` + inline obfuscation** (A10): the address is emitted only as a
  `lib/mailto.ts`-encoded token in a `data-*` attribute (no plaintext, no literal `mailto:` in
  source); one small inline `<script>` decodes it and sets `href` on click/focus.

### 3.3 External integrations / config

- **Netlify** (`netlify.toml`): `command = "npm run build"`, `publish = "dist"`, `X-Robots-Tag:
  noindex` header for `/*` (drop in Epic 4). Continuous deploy on push to `main`.
- **Fonts** (A3/TD4): downloaded from upstream OFL sources, subset to latin at build-prep time,
  2 weights per family; committed under `src/assets/fonts/`. No network fetch at runtime. The
  acquisition/subset step is documented in `docs/coding-guidelines.md` (T14).
- **No** analytics, captcha, or third-party scripts in this epic.

## 4. Requirement → Implementation Traceability

| Item | Covered by tasks |
| :--- | :--- |
| R1 | T1 |
| R2 | T2 |
| R3 | T14 |
| R4 | T4 |
| R5 | T5 |
| R6 | T10 |
| R7 | T10, T11 |
| R8 | T6 |
| R9 | T9 |
| R10 | T3, T10 |
| R11 | T3, T13 |
| R12 | T13 |
| R13 | T15 |
| R14 | T11 |
| R15 | T2 |
| R16 | T7 |
| R17 | T8 |
| R18 | T3, T12 |
| AC1 | T2, T16 |
| AC2 | T1, T16 |
| AC3 | T14 |
| AC4 | T5, T10, T16 |
| AC5 | T10, T16 |
| AC6 | T6, T16 |
| AC7 | T9, T16 |
| AC8 | T3, T10, T16 |
| AC9 | T3, T13, T16 |
| AC10 | T13 |
| AC11 | T15, T16 |
| AC12 | T11 |
| AC13 | T2, T16 |
| AC14 | T7, T16 |
| AC15 | T8, T16 |
| AC16 | T3, T12, T16 |

## 5. TDD Implementation Plan

> Each task is test-first. Per **A9 (TD1)**, the failing test for pure logic (`lib/mailto.ts`,
> `lib/seo.ts`, token/contrast checks, build output) is a **Vitest** test; the failing test for any
> `.astro`/DOM behaviour is a **Playwright e2e** assertion in the T16 suite (run against
> `npm run preview`). Component tasks below therefore name a Vitest test for their logic and an
> e2e assertion for their rendered output; write the e2e assertion red first, then build the
> component to green.

### T1 — Scaffold Astro static + Tailwind 4 + test tooling  (satisfies R1)
1. **Failing test:** add `tests/build.test.ts` (or a CI step) asserting `npm run build` produces
   `dist/index.html` and the built HTML contains **no** `<script type="module">` app bundle
   (zero-JS, AC2). Initially red — no project.
2. **Implement:** `npm create astro@latest` (minimal, static), set `output: 'static'`; add
   `@tailwindcss/vite` + `@import "tailwindcss"` in `global.css`; install `vitest` + Playwright
   per `docs/testing.md`; wire `npm test`.
3. **Refactor:** lock `astro.config`, scripts, tsconfig paths (`@/*` → `src/*`).

### T2 — Self-hosted, preloaded `woff2` fonts  (satisfies R2, R15)
1. **Failing test:** unit assert `global.css` declares `@font-face` for Space Grotesk + IBM Plex
   Mono + body face with `src` pointing at same-origin `/...woff2` (no `https://`); e2e placeholder
   in T16 will assert the network tab.
2. **Implement:** add subset `woff2` to `src/assets/fonts/`; `@font-face` blocks; `<link
   rel="preload" as="font" type="font/woff2" crossorigin>` for the two above-the-fold faces in
   `Layout`.
3. **Refactor:** `font-display: swap`; confirm no unused weights shipped.

### T3 — Base `Layout` + SEO/OG/robots + favicon wiring  (satisfies R10, R11, R18)
1. **Failing test:** unit-test `lib/seo.ts` `buildMeta()` returns `robots: 'noindex,nofollow'`,
   title, description, OG tags, and an OG image path; assert rendered `Layout` `<head>` includes
   them (per TD1).
2. **Implement:** `Layout.astro` + `BaseHead.astro` emitting `<title>`, `<meta description>`, OG
   tags, `<meta robots noindex,nofollow>`, favicon `<link>`, font preloads.
3. **Refactor:** single source for site metadata constants.

### T4 — Brutalist design-system tokens  (satisfies R4)
1. **Failing test:** unit assert `global.css` `@theme` defines the color/type/spacing/border
   tokens, and a contrast check on accent-vs-paper meets WCAG AA (≥ 4.5:1 for text).
2. **Implement:** `@theme` token block; raw-border / monospace-accent / structural-grid utilities.
3. **Refactor:** name tokens semantically; document in coding-guidelines (T14).

### T5 — Component library primitives  (satisfies R5)
1. **Failing test:** per primitive (`Button`, `Section`, `Hero`, `Card`, `Prose`, `FormField`),
   render-and-assert it produces the expected semantic element + applies a variant prop (per TD1).
2. **Implement:** the primitives, props-driven, using theme tokens only (no inline hex).
3. **Refactor:** extract shared variant logic; ensure `Section` emits `id` for anchors.

### T6 — Obfuscated `mailto:` CTA  (satisfies R8)  — depends on TD2
1. **Failing test:** unit-test `lib/mailto.ts`: `decode(encode(addr)) === addr` and the
   encoded/rendered token does **not** contain the plaintext address or a literal `mailto:` in
   source (AC6).
2. **Implement:** `mailto.ts` encode/decode + `MailtoLink.astro` per the TD2 mechanism.
3. **Refactor:** single shared address constant reused by CTA and footer.

### T7 — Header nav  (satisfies R16)
1. **Failing test:** render `Header` → asserts wordmark + anchor links whose `href` are in-page
   (`#story`, `#kontakt`) and match section ids; no external/route links (AC14).
2. **Implement:** `Header.astro`; sticky/semantic `<nav>`; keyboard-focusable links.
3. **Refactor:** drive link list from a config array.

### T8 — Footer  (satisfies R17)
1. **Failing test:** render `Footer` → wordmark + copyright + obfuscated mailto present; reserved
   Impressum/Datenschutz slots exist but render **no** live links yet (AC15).
2. **Implement:** `Footer.astro` reusing `MailtoLink`; commented/disabled legal slots.
3. **Refactor:** share address + year constants.

### T9 — Images via `astro:assets`  (satisfies R9)
1. **Failing test:** render the section using `<Image>` → asserts output is an optimized
   `astro:assets` element (not a raw `<img src="placeholders/...">`) and swapping the source path
   keeps the wrapper/aspect ratio (AC7).
2. **Implement:** move `placeholders/*` into `src/assets/img/`; fixed aspect-ratio wrappers; lazy
   below-the-fold, eager for LCP image.
3. **Refactor:** centralize image imports so Ralph swaps by replacing one file.

### T10 — Landing page composition (story-first arc)  (satisfies R6, R7, R10)
1. **Failing test:** render `index.astro` → DOM order is Hero (edgy hook) → Story/experience
   section(s) → CTA; responsive container classes present at mobile + desktop breakpoints (AC5,
   AC8).
2. **Implement:** compose `Layout` + `Hero` + `Section`(s) + `Card`s + `Button`/`MailtoLink` from
   the library; bind to copy module (T11).
3. **Refactor:** ensure no inline one-offs (AC4) — everything via primitives.

### T11 — German copy from CV + infos-ralph  (satisfies R7, R14)
1. **Failing test:** assert the copy module is non-empty German content (no lorem-ipsum) for hero,
   ≥ 2 story sections, and CTA; smoke-check key claims exist (AC12).
2. **Implement:** Claude drafts punk-but-credible German copy traced to `specs/2026-cv-de-ralph.pdf`
   + `infos-ralph/*.pdf`; store per TD3. Flag for Ralph's editorial pass before Epic 4.
3. **Refactor:** structure copy so sections map 1:1 to data entries.

### T12 — Brutalist placeholder favicon + OG image  (satisfies R18)
1. **Failing test:** assert `public/favicon.*` and `public/og-default.png` exist and are referenced
   by `Layout` meta via a single swappable path (AC16).
2. **Implement:** generate favicon (SVG + ico fallback) and a 1200×630 OG image from the
   wordmark/initials.
3. **Refactor:** document the swap path in coding-guidelines (T14).

### T13 — Netlify deploy config + push-to-main  (satisfies R11, R12)
1. **Failing test:** assert `netlify.toml` has `command`, `publish = "dist"`, and an
   `X-Robots-Tag: noindex` header for `/*` (AC9 defence-in-depth, AC10 build wiring).
2. **Implement:** commit `netlify.toml`; connect repo → `ralphcibis.netlify.app`; confirm push to
   `main` builds & deploys.
3. **Refactor:** note the single removal point for noindex (meta + header) for Epic 4.

### T14 — `/docs/architecture.md` + `/docs/coding-guidelines.md`  (satisfies R3)
1. **Failing test:** assert both files exist and cover the R3 topics (stack, folder structure,
   build/deploy flow, Netlify-Forms-for-static-Astro gotcha; component patterns, naming, a11y, perf
   budget, content-authoring rules) (AC3).
2. **Implement:** author both, aligned to the as-built project and `docs/deployment.md`/`testing.md`.
3. **Refactor:** cross-link from README/roadmap.

### T15 — Lighthouse + accessibility pass  (satisfies R13)
1. **Failing test:** a check (Lighthouse CI or scripted run) asserting all four categories ≥ 95 and
   an a11y assertion that every interactive element is keyboard-reachable with a visible focus ring
   (AC11).
2. **Implement:** fix perf (image sizing, preload, no render-blocking), a11y (landmarks, focus-
   visible, contrast), SEO/best-practices items until green.
3. **Refactor:** record the perf budget in coding-guidelines (T14).

### T16 — E2E verification suite  (satisfies AC1, AC2, AC5–AC9, AC11, AC13–AC16)
1. **Failing test:** author `e2e/foundation-landing-page/*.spec.ts` (Playwright) asserting: no
   third-party/CDN network requests; fonts load same-origin `woff2` with preload; zero app JS
   bundle; `noindex,nofollow` in head; anchor links scroll to sections; obfuscated mailto absent in
   raw HTML yet opens correct address on click; images via astro:assets; mobile+desktop layout;
   favicon + OG meta present; keyboard focus visible.
2. **Implement:** make each assertion pass against `npm run preview` (port 4321).
3. **Refactor:** group specs by AC; keep stable selectors.

## 6. Testing Strategy

Per `docs/testing.md`:
- **Unit / integration (Vitest)** — pure logic always (`lib/mailto.ts`, `lib/seo.ts`, token/
  contrast checks, build-output assertions). Whether `.astro` components also get unit-level
  render-and-assert coverage depends on **TD1**.
- **E2E (Playwright Test)** — `e2e/foundation-landing-page/*.spec.ts`, run against `npm run
  preview`; this layer is the source of truth for the network/zero-JS/font/noindex/responsive/
  mailto/anchor ACs (T16).
- **Agentic click-through (Playwright MCP)** — final QA via `verify-epic`, confirming the story-
  first arc and CTA behave in a real browser.
- **Lighthouse** — gate for AC11/R13 (T15).
- ACs map to tests via the traceability table (§4) and the per-AC grouping in T16.

## 7. Risks & Non-functional

- **Performance (Lighthouse ≥ 95):** the placeholder JPEGs are 2–3 MB — must go through
  `astro:assets` with explicit dimensions or perf fails. Preload only above-the-fold fonts to
  protect LCP. (T9, T2, T15)
- **Zero-JS vs. mailto obfuscation:** strong client-side obfuscation usually needs JS, which dents
  the zero-JS guarantee and could affect Best-Practices/perf. Resolved by **TD2**.
- **Accessibility:** brutalist high-contrast palette must still hit WCAG AA (4.5:1 text); visible
  focus rings must survive the raw-border aesthetic. (T4, T15)
- **GDPR / privacy:** no cookies, no trackers, fonts same-origin → no cookie banner; nothing in this
  epic processes personal data (the form is Epic 2).
- **Indexing leak:** a public German site without Impressum/Datenschutz is a legal risk — mitigated
  by `noindex` meta **and** `X-Robots-Tag` header, both removed only in Epic 4. (A7, T3, T13)
- **Astro component testability:** `.astro` files aren't trivially unit-testable; the TDD promise
  hinges on **TD1**.
- **Rollback:** static site on Netlify — revert the commit / redeploy previous build; no data
  migrations.

## 8. Open Tech Decisions

> How to answer: change `[ ]` to `[x]` on **one** option per decision, or fill its `Other:` line.
> Don't delete a decision — it moves to "Resolved Tech Decisions" on the next run.
> The `**(recommended)**` label is a suggestion only; nothing is pre-selected.

### TD1: How do we unit-test `.astro` components TDD-first? _(high-impact)_
- [ ] **Vitest + Astro Container API** — render components to HTML strings in unit tests; true
  test-first for every component (T3, T5, T7, T8, T9, T10). Cost: Container API is still
  experimental and adds test setup/maintenance.
- [x] **Pure-logic units + Playwright for all rendered output** — Vitest covers only `lib/*` and
  build assertions; every component/DOM assertion lives in the e2e suite (T16). **(recommended)** —
  simplest, most stable for a tiny static site; matches `docs/testing.md`'s "e2e is the rendered-
  output source of truth" and avoids leaning on an experimental API. Cost: component feedback loop
  is slower (needs a build/preview), less granular "failing unit test first".
- [ ] **`@testing-library` + jsdom on rendered fragments** — render component output into jsdom and
  query it. Cost: extra deps, awkward fit for Astro's compile model.
- [ ] Other: 

### TD2: How is the CTA `mailto:` obfuscated without breaking zero-JS? _(high-impact)_
- [ ] **Build-time HTML-entity / reversed-string encoding, no JS** — address stored encoded in the
  HTML, made clickable via CSS `direction`/entity tricks. Pros: keeps strict zero-JS. Cons: weaker
  against modern scrapers; AC6 ("not present as plaintext mailto in raw HTML") is satisfiable but
  resilience is modest.
- [ ] **Tiny inline `<script>` island that assembles the address on click** — a few lines of inline
  JS (no framework, no `client:*` hydration of a component), decoding `lib/mailto.ts` output.
  **(recommended)** — robustly satisfies AC6 (no plaintext in source, works on click), negligible
  bytes, doesn't pull in a runtime/bundle so it stays effectively zero-JS for perf. Cons: technically
  introduces a sliver of inline JS — must confirm it doesn't dent Lighthouse Best-Practices/perf.
- [ ] **`client:load` Astro/JS component for the link** — full island hydration. Cons: ships a real
  JS bundle, contradicts the zero-JS default for a trivial need.
- [x] Other: Ralph never gave a zero-JS constraint. But keep dependencies low. You can create a small obfuscation script by yourself.

### TD3: Where does the German landing copy live? _(high-impact)_
- [x] **Typed TS data module (`src/content/landing.ts`)** — structured object imported by
  components. **(recommended)** — type-safe, one file for Ralph to edit, clean separation from
  markup, no Content Collection overhead for a single page; Epic 3 introduces Collections for the
  blog where they earn their keep. Cons: editing requires touching a `.ts` file.
- [ ] **Astro Content Collection (single entry) / frontmatter `.md`** — Markdown copy with schema.
  Pros: prose-friendly editing, sets up the Epic 3 pattern early. Cons: heavier for one page;
  structured hero/CTA fields fit awkwardly in Markdown.
- [ ] **Inline strings in `index.astro` / components** — simplest. Cons: violates A5, couples copy to
  markup, harder for Ralph to edit safely.
- [ ] Other: 

### TD4: Font acquisition, weights, and subsetting
- [x] **Download from upstream (OFL) + subset to latin, ship 2 weights per family** — e.g. Space
  Grotesk 500/700, IBM Plex Mono 400/500, body 400/600. **(recommended)** — minimal bytes for the
  brutalist look, protects perf budget; all three are OFL-licensed and self-hostable. Cons: manual
  acquisition/subset step (document it in T14).
- [ ] **Use Fontsource `woff2` files copied locally (not its CDN)** — convenient versioned files.
  Cons: easy to accidentally pull more weights than needed; must verify same-origin only.
- [ ] **System-stack body + self-hosted display/mono only** — drop the body webfont entirely. Cons:
  R15 lists Inter "or a system stack" as acceptable — fastest, but less typographic control.
- [ ] Other: 

### TD5: How is the brutalist placeholder favicon + OG image produced?
- [x] **Hand-authored SVG wordmark/initials → export favicon set + 1200×630 OG** — full control,
  on-brand, swappable by path. **(recommended)** — matches the brutalist system, no extra runtime
  deps, one asset path for Ralph to replace later (R18/AC16). Cons: a little manual design effort.
- [ ] **Generate at build via a script (e.g. `satori`/`sharp`)** — programmatic OG from the
  wordmark. Cons: adds a build-time dependency for a placeholder Ralph will replace anyway.
- [ ] Other: 

## 9. Resolved Tech Decisions

<!-- | TD# | Chosen | Changed --> 

*Empty — nothing reconciled yet. Answer the decisions in §8 and re-run `/write-spec foundation-landing-page` (or `/write-spec epic 1`).*
