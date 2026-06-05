# Tech Spec — Coherence Pass (Design & Voice)

> **Status:** Ready to build · **Confidence:** 92% · **Spec runs:** 2
> **Source PRD:** [prd.md](prd.md)
> **Guidelines:** docs/architecture.md, docs/coding-guidelines.md

## 1. Overview

A post-launch consolidation pass over the existing static Astro site. **No new pages, features,
third-party requests, or client JS** (R2) — the work is: (1) an **audit** that inventories every
design/copy drift (R8), (2) a drafted **`docs/voice-and-design.md`** voice + design guide (R4/R11),
(3) **token reconciliation + shared-component extraction** so the design propagates from one place
(R5), with a **single primary-CTA treatment** unified across button CTAs (R3), (4) a **copy/register
pass** putting the funnel into formal *Sie* while the blog keeps Ralph's first-person voice (R1/R7),
all **within the established band-merch/tour-poster identity** (R9), and (5) **human verification**
— a written voice checklist + Ralph's per-surface sign-off (R6/R10).

The pass aligns with the current architecture: brand tokens live in `src/styles/global.css`
(`@theme`); German copy lives in **typed TS content modules** (`src/content/*.ts`), never hard-coded
in `.astro`; primitives live in `src/components/`; tests are Vitest (pure/markup) + Playwright (e2e).

**Verification posture (locked by the PRD).** Per D6 there is **no automated copy lint** and per D11
**no structural no-dup gate and no visual-regression snapshots** — voice and *coherence* are judged by
the human checklist + Ralph's sign-off. This spec therefore TDD-tests only the **mechanical** facts
that don't encroach on those decisions (a CTA's hover treatment exists, new animations honor
`prefers-reduced-motion`, the guide file has its required sections, blog post bodies are byte-for-byte
unchanged, the full existing suite + Lighthouse stay green). Subjective taste stays with Ralph.

## 2. Key Architecture Decisions

- **AD1 — Reuse the existing system; do not introduce a new one.** All sharpening happens inside the
  documented dark-first band-merch identity (gradient accent pink→green, Anton/IBM Plex Mono/Inter,
  the contrast contract, music motifs). Tokens are added/renamed, not replaced. *(R9; coding-guidelines
  "Visual system")*
- **AD2 — The "green hover" is real drift, and it's the seed of the unified CTA.** The landing primary
  CTA is an **inline `ticketButtonClass`** in `index.astro` (`hover:-translate-y-0.5
  hover:-translate-x-0.5 hover:shadow-[6px_6px_0_0_var(--color-neon-green)]`) — a one-off that bypasses
  `Button.astro`. The epic promotes this hard-green-shadow hover into a **new dedicated `primary`
  variant** on `Button.astro` (TD1); `solid`/`outline` stay as-is. Every button CTA outside
  header/footer is routed through `variant="primary"`. *(R3/R5; TD1)*
- **AD6 — CTA *panels* stay per-page; only the button is shared (TD2).** The "backstage-pass/ticket"
  panel markup is **not** extracted into a `<CtaBlock>` component this epic — each page keeps its own
  panel and just swaps its button for `<Button variant="primary">`. **Reconciliation note:** this
  narrows AC5 — of its four named patterns, the **button** is the shared component, **section header**
  and **card** reuse the existing `Section`/`Card` primitives, and the **CTA block is deliberately
  left per-page** by Ralph's choice. Coherence of the panels is then carried by the shared button +
  Ralph's visual sign-off (AC10), not a block component. *(R5/AC5; TD2)*
- **AD7 — 8-bit highlights via committed inline SVG sprites; no new fonts (TD3).** Pixel/8-bit accents
  are small same-origin **inline SVG** assets (committed under `src/assets/img/`), not a pixel
  webfont and not new `@font-face` blocks (Ralph: no font changes). Any motion on them is CSS-only and
  reduced-motion-safe. *(R9/AC9; TD3)*
- **AD8 — A mechanical token-hygiene lint is added (TD4).** A new Vitest check greps `.astro` markup
  for raw hex / inline color and fails CI, so token drift can't silently return. This is a *mechanical*
  guard (not a taste/coherence gate), so it sits alongside — not against — the human sign-off of D11.
  *(R5/AC5; TD4)*
- **AD3 — Copy changes are content-module edits, not markup edits.** The *Sie* register pass edits the
  German strings in `src/content/{landing,offers,legal}.ts` (and CTA/chrome copy), never strings inside
  `.astro`. The blog's first-person voice lives in `src/content/blog-cta.ts` + post bodies and is left
  alone. *(R1/R7; coding-guidelines "Content authoring")*
- **AD4 — Two new docs are the durable artifacts.** `specs/coherence-pass-design-voice/design-voice-audit.md`
  (the drift inventory / work breakdown, R8) and `docs/voice-and-design.md` (the living guide, R4/R11).
  The voice checklist (R6) is a section of the guide. *(R4/R6/R8/R11)*
- **AD5 — Coherence/voice are human-gated; mechanics are TDD-gated.** See §1 verification posture.
  *(D6/D11)*

## 3. Design

### 3.1 Components / Modules

In-scope surfaces and their files (the audit covers all of these):

| Surface | Files |
| :--- | :--- |
| Landing | `src/pages/index.astro`, `src/content/landing.ts`, `Hero.astro`, `Section.astro`, `Card.astro`, `Prose.astro` |
| Offers | `src/pages/angebot.astro`, `src/content/offers.ts`, `PriceTag.astro` |
| Contact form + states | `ContactForm.astro`, `FormField.astro`, `src/pages/danke.astro`, `src/lib/formValidate.ts` (msgs in `offers.ts`) |
| Blog (chrome/CTA only) | `src/pages/blog/**`, `PostCard.astro`, `PostCta.astro`, `src/content/blog-cta.ts` — **post bodies in `src/content/blog/*` untouched (R7)** |
| Legal | `src/pages/impressum.astro`, `src/pages/datenschutz.astro`, `src/content/legal.ts` |
| 404 | `src/pages/404.astro` |
| Chrome | `Header.astro`, `Footer.astro`, `MailtoLink.astro` |
| Shared / tokens | `Layout.astro`, `Button.astro`, `Section.astro`, `Card.astro`, `Prose.astro`, `src/styles/global.css` |

Component work (decisions resolved):
- **`Button.astro`** — gains a **new `primary` variant** (TD1) carrying the green hard-shadow hover
  (`hover:-translate-* + hover:shadow-[…var(--color-neon-green)]`); `solid`/`outline` unchanged. Keeps
  the `data-variant`/`data-size` hooks already used by e2e (`data-variant="primary"` is the e2e hook
  for the R3 set).
- **CTA panels — not extracted (TD2).** Each page keeps its own "backstage-pass/ticket" panel markup;
  only the button inside becomes `<Button variant="primary">`. No `<CtaBlock>` component this epic.
- **Section header** — `Section.astro` already owns the kicker + poster heading + `accent` bar; the
  one-off header markup (e.g. the inline Haltung block in `index.astro`) is migrated onto it rather
  than adding a new primitive. *(architecture decision, no question)*
- **8-bit accents — inline SVG sprites (TD3).** Small same-origin SVGs committed under
  `src/assets/img/` (or inline in markup), applied as decorative highlights per the audit. **No new
  `@font-face` / webfont** (Ralph: no font changes). Any motion is CSS-only and inside
  `@media (prefers-reduced-motion: reduce)`.
- **`global.css`** — add any `@theme` token the `primary` variant needs (e.g. a named hover-shadow
  offset) and CSS-only keyframes for accent motion, all reduced-motion-guarded.
- **Token-hygiene lint (TD4)** — new `tests/no-raw-hex.test.ts` scans `src/components/**/*.astro` and
  `src/pages/**/*.astro` for raw hex (`#rgb`/`#rrggbb`) and inline `style="…color…"`, allowing only
  `@theme` tokens / `var(--…)` / Tailwind token utilities. `global.css` (where `@theme` hex is
  legitimate) is exempt.

### 3.2 Data model & contracts

- No schema changes. Content stays in the existing typed interfaces (`landing`, `offers`, `legal`,
  `blogCta`). Register edits change **string values only**; existing content tests
  (`offers-content.test.ts`, `landing-content.test.ts`, `legal-content.test.ts`) must keep passing,
  so any structural copy a test asserts (e.g. the §19 UStG note, "2 Werktage") is preserved.
- `docs/voice-and-design.md` required sections (asserted by an extended `tests/docs.test.ts`):
  **Terminology glossary**, **Register rule** (Sie on funnel / first-person in blog), **Voice
  principles** (3–5), **Do/Don't examples**, and a **Design reference** (tokens + the shared
  components). *(R11/AC11)*

### 3.3 External integrations / config

None. Netlify Forms behavior must be preserved if `ContactForm.astro` is refactored — the static
`<form>` markup (honeypot, `data-netlify`, `action="/danke"`) stays intact (architecture "Netlify
Forms gotcha"); the existing offers e2e specs guard this.

## 4. Requirement → Implementation Traceability

| Item | Covered by tasks |
| :--- | :--- |
| R1 / AC1 (Sie funnel, first-person blog) | T6 (+ T1 audit, T9 checklist) |
| R2 / AC2 (no new page/feature/3p/JS; suite + Lighthouse green) | T10 |
| R3 / AC3 (unified primary-CTA hover treatment) | T3 |
| R4 / AC4 (voice-and-design.md, Ralph-approved) | T2, T9 |
| R5 / AC5 (tokens reconciled + shared button; CTA block per-page per TD2) | T3, T5, T4 (lint) |
| R6 / AC6 (written voice checklist + sign-off) | T2, T9 |
| R7 / AC7 (all surfaces aligned; blog bodies unchanged) | T1, T6, T7, T8 |
| R8 / AC8 (design-voice-audit.md inventory) | T1 |
| R9 / AC9 (sharpen in identity; CSS-only + reduced-motion; LH ≥ 95) | T5, T6, T10 |
| R10 / AC10 (Ralph design visual sign-off) | T9 |
| R11 / AC11 (guide contents: glossary/register/principles/examples) | T2 |

## 5. TDD Implementation Plan

Ordered so the audit and guide come first (they scope everything), then mechanical/structural work
(test-first), then the human-gated copy pass and sign-off.

### T1 — Audit artifact (satisfies R8/AC8; feeds R1–R11) — *discovery, not test-first*
Produce `specs/coherence-pass-design-voice/design-voice-audit.md`: a table per in-scope surface ×
five drift categories (token / CTA / component / copy / register), each row a concrete finding +
fix + status. This **is** the work breakdown. (No failing test precedes a discovery artifact;
AC8 is verified by `tests/docs.test.ts` checking the file exists and covers every surface — written
in T2's test pass.)

### T2 — Voice & design guide + its existence test (satisfies R4, R6, R11 / AC4, AC11)
1. **Failing test:** extend `tests/docs.test.ts` to assert `docs/voice-and-design.md` exists and
   contains the required section headings (glossary, register rule, 3–5 principles, do/don't
   examples, design reference) **and** that `design-voice-audit.md` exists covering every surface.
2. **Implement:** draft `docs/voice-and-design.md` from the corpus (19 posts + offers + landing) +
   roadmap; embed the voice checklist as a section.
3. **Refactor:** cross-link from `architecture.md`/`coding-guidelines.md`. (Ralph's approval recorded
   in T9.)

### T3 — `primary` CTA variant, routed across surfaces (satisfies R3, R5 / AC3, AC5)
1. **Failing e2e:** in a new `e2e/coherence-pass-design-voice/` spec, assert every button-styled CTA
   outside `<header>`/`<footer>` (landing→offers, offers→contact/submit, blog-post→offers,
   404→home/offers) renders `data-variant="primary"` and the green hard-shadow on `:hover`, and that
   header/footer nav links do **not**.
2. **Implement:** add the `primary` variant to `Button.astro` (TD1); replace the inline
   `ticketButtonClass` in `index.astro` and the equivalent button CTAs on offers, 404, and the
   blog-post CTA with `<Button variant="primary">`. Panels stay per-page (TD2).
3. **Refactor:** delete the dead inline class strings; confirm no panel-markup extraction crept in.

### T4 — Token-hygiene lint (satisfies R5 / AC5; TD4)
1. **Failing test:** add `tests/no-raw-hex.test.ts` scanning `src/components/**/*.astro` and
   `src/pages/**/*.astro` for raw hex (`#rgb`/`#rrggbb`) and inline `style="…color…"`; assert none
   (allow `var(--…)` and Tailwind token utilities; exempt `global.css`). It fails first against any
   current raw-hex drift the audit found.
2. **Implement:** migrate flagged markup onto `@theme` tokens / utilities until the lint passes.
3. **Refactor:** keep the lint in the default `npm test` run so drift can't return.

### T5 — Token reconciliation (satisfies R5, R9 / AC5, AC9)
1. **Failing test:** extend `tests/global-css.test.ts` for any new `@theme` token the unified CTA /
   8-bit highlight needs (existence + contrast where it's a text/fill pairing, reusing the existing
   WCAG helper).
2. **Implement:** add the token(s); migrate drifted inline values (per the T1 audit) onto `@theme`
   tokens / utilities.
3. **Refactor:** verify the contrast-contract tests still pass.

### T6 — 8-bit SVG accents + animation, reduced-motion safe (satisfies R9, R7 / AC9; TD3)
1. **Failing test:** extend `tests/global-css.test.ts` to assert every new animation/keyframe is
   disabled/neutralized inside `@media (prefers-reduced-motion: reduce)` (mirrors the existing
   `.eq`/`.nav-underline` guard assertions); optionally assert the committed SVG accents are
   same-origin assets (no new `@font-face`).
2. **Implement:** add small committed inline **SVG** pixel/8-bit accents under `src/assets/img/` (TD3,
   no new fonts) + CSS-only keyframes; apply as small accents per the audit.
3. **Refactor:** confirm no `client:*` / JS bundle and no new font face added.

### T7 — Register & copy pass on the funnel (satisfies R1, R7 / AC1) — *content + review*
Edit the German strings in `src/content/{landing,offers,legal}.ts` and funnel chrome/CTA copy to
consistent formal **Sie**; leave `blog-cta.ts` and `src/content/blog/*` first-person. Existing
content tests must stay green (preserve asserted phrases). Register correctness is verified by the
R6 checklist in T9 — **not** an automated lint (D6).

### T8 — Blog-bodies-unchanged guard (satisfies R7 / AC7)
1. **Failing test:** a test asserting `git diff` over `src/content/blog/*.md` post **bodies** is empty
   (or a content snapshot of body bytes is unchanged), so an accidental edit fails CI.
2. **Implement:** N/A (guard only); confirm green throughout the epic.

### T9 — Human verification & sign-off (satisfies R6, R10, R4 / AC6, AC10, AC4)
Apply the voice checklist to each in-scope surface; Ralph reviews each surface for voice **and**
design coherence and signs off; record the sign-off (location per Deferred note). Approve
`voice-and-design.md`.

### T10 — Regression + Lighthouse gate (satisfies R2, R9 / AC2, AC9)
Run `npm test`, `npm run test:e2e`, and `npm run lighthouse` — all green, Lighthouse ≥ 95 (SEO
caveat per coding-guidelines). Produce the before/after change list proving no new page/route,
feature, third-party request, or client JS.

## 6. Testing Strategy

- **Unit / markup (Vitest):** `global-css.test.ts` (new tokens, contrast, reduced-motion guards —
  T5/T6); new `no-raw-hex.test.ts` (token hygiene in `.astro` markup — T4); `docs.test.ts` (guide +
  audit existence/sections — T2); existing content tests must stay green after the register pass (T7);
  blog-bodies guard (T8).
- **e2e (Playwright):** new `e2e/coherence-pass-design-voice/` spec for the unified CTA treatment and
  the header/footer exclusion (T3); existing e2e suites (landing, offers/mailto, blog, legal) are the
  regression gate (T10).
- **Lighthouse:** `npm run lighthouse` ≥ 95 (T10).
- **Human (per D6/D11):** voice checklist + Ralph's per-surface sign-off cover register *quality*,
  tone, and design *coherence* — deliberately not automated.

## 7. Risks & Non-functional

- **Scope creep** — "targeted improvement" (R2) can slide into redesign. Guardrail: the audit (T1) is
  the only sanctioned work list; anything not a drift fix is out.
- **Contrast regressions** — sharpening neon/edges must keep the contrast contract; `global-css.test.ts`
  asserts AA, and neon stays text-on-ink / fill-under-ink only (never neon text on light).
- **Motion a11y / perf** — new animations are CSS-only and reduced-motion-safe (T6); watch CLS and the
  Lighthouse budget (T10).
- **Form breakage** — refactoring `ContactForm.astro` must preserve the static Netlify `<form>` markup
  and `action="/danke"`; offers e2e guards it (note: `e2e/**/mailto.spec.ts` are already modified in
  the working tree — keep them green).
- **Accidental blog edits** — guarded by T8.
- **Rollback** — pure front-end/content change on static output; revert is a redeploy of the prior
  commit.

## 8. Open Tech Decisions

**✅ Ready to build.** All four high-impact decisions are resolved (TD1–TD4); every R#/AC# maps to a
task in the traceability table. Implementation order: **T1** audit → **T2** guide + docs test → **T3**
`primary` CTA variant → **T4** token-hygiene lint → **T5** tokens → **T6** 8-bit SVG accents → **T7**
Sie register pass → **T8** blog-bodies guard → **T9** human sign-off → **T10** regression + Lighthouse.

### Deferred (non-blocking)
- **Concrete edit list** — produced by the T1 audit by design (not pre-listed).
- **Per-surface 8-bit/animation choices** — which accents get an SVG pixel highlight is a per-surface
  design call during T6, inside the CSS-only + reduced-motion guards.
- **Sign-off recording location** — PRD addendum vs audit doc vs PR; pick during T9.

## 9. Resolved Tech Decisions

| TD# | Chosen | Changed |
|----|--------|---------|
| TD1 | Dedicated `primary` variant on `Button.astro` (solid/outline unchanged) | AD2; T3; Button design |
| TD2 | Share only the button; CTA panels stay per-page (no `<CtaBlock>`) | AD6; T4 (was block-extraction) repurposed to lint; AC5 narrowed (button shared, block per-page) |
| TD3 | 8-bit accents as committed inline SVG; no new fonts | AD7; T6; global.css/asset design |
| TD4 | Add a mechanical raw-hex/inline-color lint to `npm test` | AD8; new T4 + `no-raw-hex.test.ts`; testing strategy |
