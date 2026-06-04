# Tech Spec — Foundation & Landing Page

> **Status:** Built · **Confidence:** 95% · **Spec runs:** 2 · **As-built sync:** 1
> **Source PRD:** [prd.md](prd.md)
> **Guidelines:** docs/architecture.md, docs/coding-guidelines.md, docs/deployment.md, docs/testing.md
>
> **As-built note:** after the initial build the visual direction was reiterated (user-approved) from
> a light "industrial/brutalist" look to a **dark band/merch tour-poster** aesthetic with a neon
> pink→green accent, leaning into the music identity (Thomann). This spec has been synced to the
> as-built state; see **§9 Resolved Tech Decisions (TD6–TD10)** for the diff. Requirement/AC
> *substance* is unchanged — only the visual execution and the display typeface moved.

## 1. Overview

We scaffold the **cib.is** site as a static Astro project (`output: 'static'`, zero-JS by
default) styled with Tailwind CSS 4 via `@tailwindcss/vite`. The deliverable is a single,
responsive, German landing page that tells Ralph's story (manifesto hero → CV-based credibility →
CTA) in a **dark band/merch tour-poster** visual language (built on a brutalist base — raw heavy
borders, monospace labels, structural grid — flipped to a near-black stage with a neon pink→green
accent and a music identity: equalizer, a CV "tracklist", a "backstage-pass" CTA), built from a
reusable component library that anticipates Epics 2–4.

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
| A2 | Styling | Tailwind 4 via `@tailwindcss/vite`; brand tokens in `@theme`; **dark-first theme** (ink stage, bone text) with a **neon pink→green gradient** accent (TD7); page CSS inlined (`build.inlineStylesheets: 'always'`) to drop the render-blocking stylesheet | Locked; v4 puts tokens in CSS `@theme`, no `tailwind.config.js`; dark surface lets neon read at WCAG-AA as text | Tailwind 3 config-file flow |
| A3 | Fonts | Self-hosted, subset-to-latin `woff2` from upstream OFL (Fontsource latin builds), **2 weights/family except the single-weight display face**: **Anton 400** (poster display, TD8), IBM Plex Mono 400/500, Inter 400/600; `@font-face` + `<link rel=preload>` for the two above-the-fold faces (Anton + Inter 400) only | R2/R15 (TD4/TD8); preload only what the first paint needs to protect LCP | Space Grotesk (superseded by Anton, TD8); Google Fonts CDN |
| A4 | Component model | A primitives library (`src/components/`) — `Layout`, `Header`, `Footer`, `Button`, `Section`, `Hero`, `Card`, `Prose`, `FormField`, `MailtoLink`, `BaseHead` — composed into the page. `Card` doubles as an album **tracklist row** (optional `track` prop) | R5/AC4; front-loads Epics 2–4 reuse | Inline one-off markup |
| A5 | Content/copy location | German copy lives in a **typed TS data module** `src/content/landing.ts` (typed `{ hero, sections[], cta }` shape), separate from markup | R14 (TD3); type-safe, one file for Ralph to edit, no Content-Collection overhead for one page (Collections arrive in Epic 3) | Hard-coded strings in `.astro`; single-entry Content Collection |
| A6 | Image pipeline | `astro:assets` `<Image>` from `placeholders/` (moved to `src/assets/img/`), fixed aspect-ratio wrappers, responsive `widths`/`sizes`. One eager hero shot (LCP) + a **3-up promo gallery shown on md+ only** (mobile keeps the single hero image) | R9/AC7; optimizes the source images to keep Lighthouse perf ≥ 95; swappable by path | `<img>` with raw files (perf fail) |
| A7 | Indexing guard | `<meta robots noindex,nofollow>` in `Layout` **and** `X-Robots-Tag` header in `netlify.toml` | R11/AC9; defence-in-depth, single removal point in Epic 4 | Meta-only |
| A8 | Deploy | Git-based continuous deploy to `ralphcibis.netlify.app` on push to `main`; `netlify.toml` per `docs/deployment.md` | R12/AC10 | CLI-only manual deploys |
| A9 | Component testing | `.astro`/DOM behaviour verified via **Playwright e2e** against `npm run preview`; Vitest covers only pure logic (`lib/*`) + build-output assertions | TD1; simplest + most stable for a tiny static site, matches `docs/testing.md` ("e2e is the rendered-output source of truth"), avoids the experimental Container API | Vitest + Astro Container API; jsdom fragments |
| A10 | mailto obfuscation | One small, **dependency-free hand-rolled inline `<script>`** (emitted **once in `Layout`**, binds every `a[data-eml]`) assembles the CTA/footer address on first interaction (pointerdown/focus) from `lib/mailto.ts` (XOR+base64) tokens; no framework, no `client:*` island | R8/AC6 (TD2); robust against trivial scraping, negligible non-blocking bytes (keeps AC2), zero new deps | strict no-JS entity/CSS tricks (weaker); `client:load` island (real bundle); duplicating the script per `MailtoLink` |

## 3. Design

### 3.1 Components / Modules

```
src/
  assets/fonts/            anton-400, ibm-plex-mono-{400,500}, inter-{400,600} .woff2 (latin subset)
  assets/img/              promo images (moved from /placeholders), consumed by astro:assets
  styles/global.css        @import "tailwindcss"; @theme { neon/dark tokens }; @font-face blocks; utilities (eq, nav-underline, perforation, grain, gradient)
  lib/
    mailto.ts              encode()/decode() (XOR+base64) for obfuscated address (pure, unit-tested)
    seo.ts                 buildMeta() → title/description/OG/robots (pure, unit-tested)
  content/
    landing.ts             typed German copy: hero, story sections, CTA labels (A5)
  components/
    Layout.astro           <html>, <head> (meta/OG/robots/preload), global.css, <slot/>, shared mailto decoder (A10)
    Header.astro           wordmark + in-page anchor links (Story, Kontakt) + "Buchen" button
    Footer.astro           copyright (Metropolregion Nürnberg · deutschlandweit), obfuscated mailto, reserved legal slots
    Button.astro           variant/size props; brutalist/neon styling
    Section.astro          semantic <section> w/ id (anchor targets), "pass"-tag kicker
    Hero.astro             manifesto hook (first viewport) + equalizer
    Card.astro             experience item / album tracklist row (optional `track` number)
    Prose.astro            typographic wrapper for long-form copy
    FormField.astro        label+input primitive (built now, used in Epic 2)
    MailtoLink.astro       renders the obfuscated CTA token (decoder lives in Layout, A10)
    BaseHead.astro         <head> tags (favicon, OG, robots, font preloads)
  pages/
    index.astro            composes Layout + Hero + promo gallery + Section(s) + tracklist + ticket CTA
public/
  favicon.svg / favicon.ico, og-default.png   (dark/neon placeholder, swappable — R18)
scripts/
  generate-assets.mjs      regenerates favicon.ico + og-default.png via Playwright chromium (no build-time image deps — TD5)
docs/
  architecture.md, coding-guidelines.md       (R3 deliverables)
netlify.toml                                  (build + X-Robots-Tag header)
```

### 3.2 Data model & contracts

- **Theme tokens** (`@theme` in `global.css`): dark-first palette — `--color-ink` (near-black
  stage / page bg), `--color-paper` (bone text), `--color-surface`, `--color-line`, `--color-ghost`
  (dim tracklist numerals), `--color-muted`; neon accent `--color-neon-pink` + `--color-neon-green`
  + `--gradient-accent`; `--font-display` (**Anton**), `--font-mono` (IBM Plex Mono), `--font-body`
  (Inter), structural spacing + border tokens. **Contrast contract (WCAG-AA):** neon is text only on
  the dark surface (pink 5.7:1, green 14.5:1 on ink), a fill with ink text on top (≥ 5.7:1), a focus
  ring (≥ 3:1), or decorative graphics; bone-on-ink body is 17.45:1; `--color-ghost` meets the 3:1
  large-text minimum. Never neon text on a light fill.
- **`lib/mailto.ts`**: `encode(addr: string): string` and `decode(token: string): string` —
  inverse functions; `decode(encode(x)) === x`; `encode(x)` must not contain the literal `@` or the
  plaintext address (AC6).
- **`lib/seo.ts`**: `buildMeta({title, description, ogImage, path})` → object consumed by
  `Layout`/`BaseHead`; always includes `robots: 'noindex,nofollow'` (AC9).
- **Copy contract** (A5, `src/content/landing.ts`): a typed shape
  `{ hero: {...}, sections: Section[], cta: {...} }` so components read structured German content;
  claims trace to the CV + `infos-ralph/` (AC12).
- **`MailtoLink.astro` + inline obfuscation** (A10): the address is emitted only as a
  `lib/mailto.ts`-encoded token in `data-*` attributes (no plaintext, no literal `mailto:` in
  source); a single shared inline `<script>` in `Layout` decodes it and sets `href` on first
  interaction (pointerdown/focus).

### 3.3 External integrations / config

- **Netlify** (`netlify.toml`): `command = "npm run build"`, `publish = "dist"`, `X-Robots-Tag:
  noindex` header for `/*` (drop in Epic 4). Continuous deploy on push to `main`.
- **Fonts** (A3/TD4/TD8): latin-subset woff2 from upstream OFL (via Fontsource latin builds) —
  Anton 400 (display), IBM Plex Mono 400/500, Inter 400/600; committed under `src/assets/fonts/`.
  No network fetch at runtime. The acquisition step is documented in `docs/coding-guidelines.md` (T14).
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
   `dist/index.html` and the built HTML ships **no** bundled/`<script type="module">` JS (AC2). The
   single small inline mailto obfuscation script (A10) is allowed — assert there is no emitted JS
   *bundle* and no `client:*` hydration, not a blanket "zero `<script>`". Initially red — no project.
2. **Implement:** `npm create astro@latest` (minimal, static), set `output: 'static'`; add
   `@tailwindcss/vite` + `@import "tailwindcss"` in `global.css`; install `vitest` + Playwright
   per `docs/testing.md`; wire `npm test`.
3. **Refactor:** lock `astro.config`, scripts, tsconfig paths (`@/*` → `src/*`).

### T2 — Self-hosted, preloaded `woff2` fonts  (satisfies R2, R15)
1. **Failing test:** unit assert `global.css` declares `@font-face` for Anton (display) + IBM Plex
   Mono + Inter (body) with `src` pointing at same-origin `/...woff2` (no `https://`); e2e in T16
   asserts the network tab.
2. **Implement:** add subset `woff2` to `src/assets/fonts/`; `@font-face` blocks; `<link
   rel="preload" as="font" type="font/woff2" crossorigin>` for the two above-the-fold faces in
   `Layout`.
3. **Refactor:** `font-display: swap`; confirm no unused weights shipped.

### T3 — Base `Layout` + SEO/OG/robots + favicon wiring  (satisfies R10, R11, R18)
1. **Failing test:** Vitest on `lib/seo.ts` `buildMeta()` returns `robots: 'noindex,nofollow'`,
   title, description, OG tags, and an OG image path; **e2e (T16)** asserts the rendered `Layout`
   `<head>` includes them (per A9).
2. **Implement:** `Layout.astro` + `BaseHead.astro` emitting `<title>`, `<meta description>`, OG
   tags, `<meta robots noindex,nofollow>`, favicon `<link>`, font preloads.
3. **Refactor:** single source for site metadata constants.

### T4 — Brutalist design-system tokens  (satisfies R4)
1. **Failing test:** unit assert `global.css` `@theme` defines the color/type/spacing/border
   tokens, and a contrast check on accent-vs-paper meets WCAG AA (≥ 4.5:1 for text).
2. **Implement:** `@theme` token block; raw-border / monospace-accent / structural-grid utilities.
3. **Refactor:** name tokens semantically; document in coding-guidelines (T14).

### T5 — Component library primitives  (satisfies R5)
1. **Failing test:** per primitive (`Button`, `Section`, `Hero`, `Card`, `Prose`, `FormField`), an
   **e2e (T16)** assertion that a fixture page renders it as the expected semantic element with a
   variant prop applied (per A9 — no Vitest component rendering).
2. **Implement:** the primitives, props-driven, using theme tokens only (no inline hex).
3. **Refactor:** extract shared variant logic; ensure `Section` emits `id` for anchors.

### T6 — Obfuscated `mailto:` CTA  (satisfies R8)  — per A10
1. **Failing test:** Vitest on `lib/mailto.ts`: `decode(encode(addr)) === addr` and `encode(addr)`
   contains neither the plaintext address nor a literal `@`/`mailto:`. **e2e (T16)** asserts the
   rendered token is absent from raw HTML yet a click opens the correct address (AC6).
2. **Implement:** `mailto.ts` encode/decode + `MailtoLink.astro` emitting the encoded token in a
   `data-*` attr + one small dependency-free inline `<script>` that decodes and sets `href` on
   click/focus (A10).
3. **Refactor:** single shared address constant reused by CTA and footer; keep the inline script to
   a few lines so it stays non-blocking and within the perf budget.

### T7 — Header nav  (satisfies R16)
1. **Failing test:** **e2e (T16)** asserts `Header` renders wordmark + anchor links whose `href` are
   in-page (`#story`, `#kontakt`), match section ids, and scroll to them; no external/route links
   (AC14).
2. **Implement:** `Header.astro`; sticky/semantic `<nav>`; keyboard-focusable links.
3. **Refactor:** drive link list from a config array.

### T8 — Footer  (satisfies R17)
1. **Failing test:** **e2e (T16)** asserts `Footer` shows wordmark + copyright + working obfuscated
   mailto; reserved Impressum/Datenschutz slots exist but render **no** live links yet (AC15).
2. **Implement:** `Footer.astro` reusing `MailtoLink`; commented/disabled legal slots.
3. **Refactor:** share address + year constants.

### T9 — Images via `astro:assets`  (satisfies R9)
1. **Failing test:** **e2e (T16)** asserts the section's image is an optimized `astro:assets` output
   (transformed URL, not a raw `<img src="placeholders/...">`) and that swapping the source file
   keeps the wrapper/aspect ratio (AC7).
2. **Implement:** move `placeholders/*` into `src/assets/img/`; fixed aspect-ratio wrappers; eager
   for the LCP hero shot, lazy for the md+-only 3-up promo gallery; responsive `widths`/`sizes`.
3. **Refactor:** centralize image imports so Ralph swaps by replacing one file.

### T10 — Landing page composition (story-first arc)  (satisfies R6, R7, R10)
1. **Failing test:** **e2e (T16)** asserts `index.astro` DOM order is Hero (edgy hook) →
   Story/experience section(s) → CTA, and that layout adapts cleanly at a mobile and a desktop
   viewport (AC5, AC8).
2. **Implement:** compose `Layout` + `Hero` + `Section`(s) + `Card`s + `Button`/`MailtoLink` from
   the library; bind to copy module (T11).
3. **Refactor:** ensure no inline one-offs (AC4) — everything via primitives.

### T11 — German copy from CV + infos-ralph  (satisfies R7, R14)
1. **Failing test:** assert the copy module is non-empty German content (no lorem-ipsum) for hero,
   ≥ 2 story sections, and CTA; smoke-check key claims exist (AC12).
2. **Implement:** Claude drafts punk-but-credible, **KMU-readable** German copy traced to
   `specs/2026-cv-de-ralph.pdf` + `infos-ralph/*.pdf`; store in the typed `src/content/landing.ts`
   module (A5). Experience is a 6-entry "tracklist" (incl. the **New York** station and the
   **Lagarde 1** Beirat volunteering). Positioning: home base = **Metropolregion Nürnberg**, offer
   **deutschlandweit** (no "Bamberg" framing). Flag for Ralph's editorial pass before Epic 4.
3. **Refactor:** structure copy so sections map 1:1 to data entries.

### T12 — Brutalist placeholder favicon + OG image  (satisfies R18)
1. **Failing test:** assert `public/favicon.*` and `public/og-default.png` exist and are referenced
   by `Layout` meta via a single swappable path (AC16).
2. **Implement:** hand-author an SVG wordmark/initials (A5-brand) → export the favicon set
   (SVG + ico fallback) and a 1200×630 OG image; no build-time image deps (TD5).
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
1. **Failing test:** a scripted Lighthouse run (`npm run lighthouse` against `npm run preview`)
   asserting **Performance / Accessibility / Best-Practices ≥ 95**, plus an a11y assertion that
   every interactive element is keyboard-reachable with a visible focus ring (AC11).
2. **Implement:** fix perf (responsive image sizing, font preload, inlined CSS / no render-blocking),
   a11y (landmarks, focus-visible, AA contrast), best-practices items until green.
3. **Refactor:** record the perf budget in coding-guidelines (T14).

> **AC11 / SEO caveat (by design — read before verifying).** The Lighthouse **SEO** category
> reports **~66, not ≥ 95**, and this is **expected**: the *only* failing SEO audit is
> `is-crawlable` ("Page is blocked from indexing"), which fails *because* the site is deliberately
> `noindex,nofollow` until Epic 4 (R11/AC9). Excluding that single audit, SEO scores **100**
> (`npm run lighthouse -- --skip-audits=is-crawlable` to confirm). The noindex guard is removed at
> Epic 4 go-public, at which point SEO returns to ≥ 95 automatically. **Verification should treat
> AC11 as met when Performance/Accessibility/Best-Practices ≥ 95 and the sole SEO deduction is the
> intentional `noindex`.** As-built: Performance 99 · Accessibility 100 · Best-Practices 100 · SEO 66.

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
- **Unit / integration (Vitest)** — pure logic only (`lib/mailto.ts`, `lib/seo.ts`, token/
  contrast checks, build-output assertions). Per **A9**, `.astro` components get **no** Vitest
  render coverage — their rendered output is verified in e2e.
- **E2E (Playwright Test)** — `e2e/foundation-landing-page/*.spec.ts`, run against `npm run
  preview`; this layer is the source of truth for all `.astro`/DOM behaviour plus the
  network/no-JS-bundle/font/noindex/responsive/mailto/anchor/image ACs (T16).
- **Agentic click-through (Playwright MCP)** — final QA via `verify-epic`, confirming the story-
  first arc and CTA behave in a real browser.
- **Lighthouse** — gate for AC11/R13 (T15).
- ACs map to tests via the traceability table (§4) and the per-AC grouping in T16.

## 7. Risks & Non-functional

- **Performance (Lighthouse ≥ 95):** the placeholder JPEGs are 2–3 MB — must go through
  `astro:assets` with explicit dimensions or perf fails. Preload only above-the-fold fonts to
  protect LCP. (T9, T2, T15)
- **mailto obfuscation JS:** resolved (A10) — a few-line dependency-free inline `<script>`,
  non-blocking and outside any bundle, so AC2 (no render-blocking JS bundle) still holds. Watch that
  it doesn't dent Lighthouse Best-Practices; if it ever does, fall back to entity/CSS encoding.
- **Accessibility:** brutalist high-contrast palette must still hit WCAG AA (4.5:1 text); visible
  focus rings must survive the raw-border aesthetic. (T4, T15)
- **GDPR / privacy:** no cookies, no trackers, fonts same-origin → no cookie banner; nothing in this
  epic processes personal data (the form is Epic 2).
- **Indexing leak:** a public German site without Impressum/Datenschutz is a legal risk — mitigated
  by `noindex` meta **and** `X-Robots-Tag` header, both removed only in Epic 4. (A7, T3, T13)
  *Side effect:* this caps the Lighthouse **SEO** category at ~66 for the whole epic (the
  `is-crawlable` audit) — by design, not a defect (see the T15 caveat).
- **AC10 live deploy is a manual one-time step:** `netlify.toml` build wiring is committed and
  tested, but connecting the repo to `ralphcibis.netlify.app` (and the push-to-`main` deploy) is a
  Netlify-UI action for Ralph. Local/preview QA can't assert the live URL; verification should
  record AC10 as "config done, live connect pending" rather than a failure.
- **Astro component testability:** resolved (A9) — `.astro`/DOM behaviour is verified in Playwright
  e2e, not Vitest. Trade-off accepted: the component feedback loop needs a `preview` build, so it's
  coarser-grained than a unit "red" test; the e2e suite (T16) is written red-first to preserve TDD.
- **Rollback:** static site on Netlify — revert the commit / redeploy previous build; no data
  migrations.

## 8. Open Tech Decisions

> How to answer: change `[ ]` to `[x]` on **one** option per decision, or fill its `Other:` line.
> Don't delete a decision — it moves to "Resolved Tech Decisions" on the next run.
> The `**(recommended)**` label is a suggestion only; nothing is pre-selected.

✅ **None open.** All high-impact decisions are resolved (see §9). The PRD's `Deferred
(non-blocking)` polish (exact accent hex / wordmark treatment, real production assets, Ralph's final
copy edit pass) is intentionally settled during implementation with defensible defaults.

## 9. Resolved Tech Decisions

| TD# | Chosen | Changed |
| :-- | :----- | :------ |
| TD1 | Pure-logic units (Vitest) + Playwright e2e for all rendered output | Added **A9**; rewrote the §5 TDD-layer note and the failing-test of T3/T5/T6/T7/T8/T9/T10 to put `.astro`/DOM assertions in the e2e suite (T16); updated §6 Testing Strategy and the testability risk. |
| TD2 | Small, dependency-free hand-rolled **inline `<script>`** that decodes a `lib/mailto.ts` token on click (strict zero-JS purity *not* required) | Added **A10**; relaxed the "zero-JS" overview bullet to "no render-blocking JS *bundle*" (AC2 still holds); updated T1 build assertion to allow the inline script, expanded T6 implement/refactor, and resolved the obfuscation risk. |
| TD3 | Typed TS data module `src/content/landing.ts` | Firmed **A5** + the §3 module map and copy contract; updated T11 to store copy there. |
| TD4 | Download upstream OFL + subset to latin, 2 weights/family (Space Grotesk 500/700, IBM Plex Mono 400/500, Inter 400/600) | Firmed **A3**, the §3 fonts entry, and the §3.3 fonts note (document the subset step in T14). |
| TD5 | Hand-authored SVG wordmark/initials → favicon set + 1200×630 OG, no build-time image deps (generated via Playwright chromium in `scripts/generate-assets.mjs`) | Firmed the §2 imagery intent and T12 implement step. |

### Post-build design reiteration (user-approved, as-built sync)

> These supersede parts of the original PRD/spec on **visual execution only** — requirement and AC
> *substance* (self-hosted woff2, zero third-party, noindex, WCAG-AA, responsive, story-first arc,
> obfuscated mailto, etc.) is unchanged.

| TD# | Chosen | Changed |
| :-- | :----- | :------ |
| TD6 | **Dark-first theme** — near-black `ink` stage, bone `paper` text, raised `surface`, dim `line`/`ghost`, faint film-grain overlay | Overview + A2 + §3.2. Replaces the light "industrial/brutalist" surface (brutalist *language* — heavy borders, mono labels, structural grid — retained). PRD R4/AC4 "industrial/brutalist" reads as the brutalist-rooted **band/merch** execution. |
| TD7 | **Neon pink→green gradient** accent (`--color-neon-pink`, `--color-neon-green`, `--gradient-accent`); strict WCAG-AA usage contract (neon as text only on dark / as fill under ink text / focus ring / decoration) | Replaces the single red `--color-accent`. Updated A2, §3.2, T4-era contrast checks (`tests/global-css.test.ts` now asserts neon-on-ink ≥ 4.5 and ink-on-paper ≥ 4.5). PRD "Accent color & wordmark" deferred item resolved here. |
| TD8 | **Anton** (heavy condensed, single weight 400) as the poster **display** face; IBM Plex Mono + Inter unchanged; display `line-height: 1` so capital umlauts (Ä/Ö/Ü) don't clip | Supersedes **Space Grotesk** in A3/§3.1/§3.3, T2, and PRD R15/AC13 (which now name Anton for display). Substance of R15/AC13 — three self-hosted woff2 families (display + mono + body), same-origin — unchanged. |
| TD9 | **Music/band identity** (Thomann): CV as a numbered **tracklist** (`Card.track`), **backstage-pass/ticket** CTA (`.perforation`), **equalizer** motif, header **"Buchen"** button. An LED **marquee** was trialled then **removed** (felt dated). | New A4/§3.1 detail + T10/T12 presentation. No AC change. |
| TD10 | **Positioning/location:** home base **Metropolregion Nürnberg**, offer **deutschlandweit** (no "Bamberg"); experience expanded to 6 tracklist entries incl. **New York** + **Lagarde 1** Beirat; copy made **KMU-readable** (fewer buzzwords) | Updated T11 + `landing.ts`. Still traces to CV + `infos-ralph/` (AC12). |
