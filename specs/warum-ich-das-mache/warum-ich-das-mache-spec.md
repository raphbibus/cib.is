# Tech Spec — "Warum ich das mache" Section

> **Status:** Ready to build · **Confidence:** 92% · **Spec runs:** 2
> **Source PRD:** [prd.md](prd.md)
> **Guidelines:** docs/architecture.md, docs/coding-guidelines.md, docs/voice-and-design.md

## 1. Overview

Add one new content section to the `/angebot` page ([src/pages/angebot.astro](../../src/pages/angebot.astro)),
between the Friday/product section (`#freitag`) and the contact-form section (`#kontakt`). It answers
the "why so cheap — what's the catch?" question head-on: a short punk hook (skepticism toward
over-priced, hours-selling consultants; the best mentors stay hands-on under real pressure), then the
honest two-way deal rendered as **two side-by-side colored panels** — **"Was Sie bekommen"** (a
consultant who hasn't lost touch with business reality) and **"Was ich bekomme"** (experience and
learning, so the 490 € is deliberately lower — not a discount).

Technically this is: (1) a typed `haltung` block added to the existing `src/content/offers.ts` content
module (no hard-coded strings in `.astro`); (2) two new dark **tint tokens** in the `@theme` block of
`src/styles/global.css` so each panel has a distinct accent-washed background that still clears WCAG AA
for body text; (3) a small presentational component for the panel; (4) a plain `Section` (`id="haltung"`,
kicker "Haltung", title "Warum ich das mache") wired into the page. Stays static / zero-JS, same-origin,
no new third-party requests, no new primary CTA. The existing `no-raw-hex` and `global-css` contrast
tests already guard token hygiene and contrast — the new tokens extend those guards.

## 2. Key Architecture Decisions

- **AD1 — Copy lives in `src/content/offers.ts`, not a new module.** The section is part of the offers
  funnel; co-locating it with the other `/angebot` copy keeps one content source for the page (R6, AD
  in coding-guidelines "no hard-coded strings"). Add a `haltung` field to `OffersContent`.
- **AD2 — Distinct backgrounds via *opaque dark tint tokens*, not rgba overlays.** The two panels each
  get a near-black, accent-tinted background defined as a solid hex token in `@theme`
  (`--color-tint-pink`, `--color-tint-green`). Opaque hex (vs a semi-transparent wash) is what the
  existing `tests/global-css.test.ts` contrast helper can read and assert (it parses `#rrggbb` from the
  token), and it composes predictably over the grain overlay. This honors the contrast contract
  (coding-guidelines §"Neon accent"): the *fill* stays dark so **paper/bone body text** keeps ≥ 4.5:1;
  neon appears only as the **decorative border** and (optionally) the **label text on the dark panel** —
  never neon text on a light fill. (Approach confirmed in **TD1**.)
- **AD3 — A small presentational panel component**, composed twice inside the section, rather than
  inlining one-off markup (coding-guidelines §"Component patterns"). It takes an `accent`, a `label`
  (block heading), a `claim` (bold one-liner) and body copy. (Shape confirmed in **TD2**.)
  **Accent mapping (TD3):** "Was Sie bekommen" → **green** (the reader's win), "Was ich bekomme" →
  **pink** (Ralph's side).
- **AD4 — The section wrapper is a *plain* `Section`** (no `accent` prop): the section's own kicker uses
  the default paper treatment; the color lives in the two inner panels (PRD D8 — "not a plain single
  section" refers to the panels, not the section chrome). `Section` already owns `id` + `scroll-mt`
  (R10/AC9) and emits the kicker+title in the page rhythm (R2/AC1).
- **AD5 — The R3 "stance" copy is the section lead; the two panels carry R4/R5.** A short `lead`
  paragraph (Prose) above the panels delivers the consultant-skepticism hook (AC2); "Was Sie bekommen"
  states the reader's side, "Was ich bekomme" names the experience trade and ties it explicitly to the
  490 € (AC3). Reader panel is first in source order, so it stacks first on mobile (AC8).

## 3. Design

### 3.1 Components / Modules

- **`src/components/HaltungBlock.astro` (new).** One accent-washed panel. Props:
  ```ts
  interface Props {
    accent: 'pink' | 'green';   // selects bg tint token + neon border color
    label: string;              // block heading, e.g. "Was Sie bekommen"
    claim: string;              // bold one-line punch
    class?: string;             // merged last (coding-guidelines)
  }
  // body copy via <slot/>
  ```
  Markup: `<article>` with `bg-tint-{accent}`, a neon top/left border (`border-neon-{accent}`,
  decorative — `aria-hidden` not needed since it's a border), an `<h3>` label (mono kicker style),
  a bold `<p>`/`<strong>` claim, and the slotted body paragraph in `text-muted`. All colors via
  tokens — no raw hex (keeps `no-raw-hex.test.ts` green). Heading is `<h3>` so the section reads
  h2 → h3 (valid hierarchy, AC7).
- **`src/pages/angebot.astro` (edit).** Insert a new `<Section id="haltung" kicker={haltung.kicker}
  title={haltung.title}>` **between** the `#freitag` `<Section>` and the `#kontakt` `<Section>`. Inside:
  a `<Prose>` lead, then a responsive 2-col grid (`grid gap-* lg:grid-cols-2`) holding the two
  `HaltungBlock`s in order reader (`accent="green"`) → mine (`accent="pink"`). No `Button`/CTA inside (AC5).
- **`src/styles/global.css` (edit).** Add two tint tokens to `@theme` and the matching Tailwind
  utilities resolve automatically (`bg-tint-pink`, `bg-tint-green`) since Tailwind 4 derives utilities
  from `--color-*` tokens.

### 3.2 Data model & contracts

Extend `src/content/offers.ts`:
```ts
export interface HaltungBlock {
  label: string;   // "Was Sie bekommen" | "Was ich bekomme"
  claim: string;   // bold one-liner
  body: string;    // 2–3 sentence paragraph (R11)
}
export interface Haltung {
  id: string;          // "haltung" (R10/AC9)
  kicker: string;      // "Haltung"
  title: string;       // "Warum ich das mache" (R2/AC1)
  lead: string;        // R3 stance / hook (AC2)
  reader: HaltungBlock; // "Was Sie bekommen" — reality-tested consultant (R5)
  mine: HaltungBlock;   // "Was ich bekomme" — learning + explicit 490 € trade (R4/R5/AC3)
}
// add to OffersContent:
//   haltung: Haltung;
```
Copy is German, formal **Sie**, "ich" for Ralph (R7/AC4); `mine.body` mentions both *Erfahrung* and
*490 €* to satisfy AC3; canonical terms (Der Freitag; 490 € netto = brutto) per voice-and-design.md.
Draft on-brand copy now, flagged for Ralph's editorial sign-off = his merge instruction (PRD D10).

### 3.3 External integrations / config

None. No new fonts, scripts, third-party requests, or build config. Tailwind 4 reads the new
`--color-tint-*` tokens from `@theme` with no config file change (architecture.md).

## 4. Requirement → Implementation Traceability

| Item | Covered by tasks |
| :--- | :--- |
| R1  | T4 |
| R2  | T1, T4 |
| R3  | T1 |
| R4  | T1 |
| R5  | T1 |
| R6  | T1, T4 |
| R7  | T1 |
| R8  | T2, T4 (token hygiene + contrast), T5 |
| R9  | T2, T3, T4 |
| R10 | T4 |
| R11 | T1, T3 |
| AC1 | T4 |
| AC2 | T1 |
| AC3 | T1 |
| AC4 | T1 |
| AC5 | T4 |
| AC6 | T1, T4 |
| AC7 | T5 (full QA / verify-epic) |
| AC8 | T2, T3, T4 |
| AC9 | T4 |
| AC10 | T1, T3 |

## 5. TDD Implementation Plan

### T1 — Content model + German copy in `offers.ts`  (R2, R3, R4, R5, R6, R7, R11; AC2, AC3, AC4, AC6, AC10)
1. **Write failing tests** in `tests/haltung-content.test.ts` (mirrors `offers-content.test.ts`): asserts
   `offers.haltung` exists; `id === 'haltung'`, `kicker === 'Haltung'`, `title === 'Warum ich das mache'`;
   `reader.label === 'Was Sie bekommen'`, `mine.label === 'Was ich bekomme'`; each block has non-empty
   `claim` + `body` (`body.length > 40`); `lead` mentions a consultant/hours stance (`/Berater|Stunden/i`)
   (AC2); `mine.body` matches `/Erfahrung/i` **and** `/490/` (AC3); no informal reader-address in any
   haltung string (`/\b(du|dein|dich|dir|euch|euer|eure?)\b/i` ⇒ none) (AC4); German (umlaut/ß present),
   no lorem.
2. **Implement:** add `HaltungBlock` + `Haltung` interfaces, add `haltung` to `OffersContent`, write the
   draft copy.
3. **Refactor:** keep the file's existing comment/voice conventions.

### T2 — Tint tokens + contrast guard  (R8, R9; AC8)
1. **Write failing tests** extending `tests/global-css.test.ts`: `--color-tint-pink` and `--color-tint-green`
   are defined in `@theme`; `contrast(paper, tint-pink) ≥ 4.5` and `contrast(paper, tint-green) ≥ 4.5`;
   `contrast(muted, tint-*) ≥ 4.5` (reuse the file's existing `contrast()`/`token()` helpers).
2. **Implement:** add the two opaque dark-tint hex tokens to `@theme` (values chosen so the assertions
   pass — near-black with a pink / green cast).
3. **Refactor:** add a one-line comment per token (contrast ratio), matching the existing token comments.

### T3 — `HaltungBlock.astro` component  (R9, R11; AC8, AC10)
1. **Write failing test:** an e2e assertion in T4's spec (Astro components render through the page) — the
   block exposes its `label` as an `<h3>`, a bold claim, and body text, on a tinted panel. (No isolated
   unit renderer in this project; component output is verified via the built page.)
2. **Implement:** create the component per §3.1, tokens only (no raw hex → `no-raw-hex.test.ts` stays green).
3. **Refactor:** ensure `class` prop merges last.

### T4 — Wire the section into `/angebot`  (R1, R2, R6, R9, R10; AC1, AC5, AC6, AC8, AC9)
1. **Write failing e2e** `e2e/warum-ich-das-mache/section.spec.ts`:
   - `section#haltung` exists with kicker "Haltung" and title "Warum ich das mache" (AC1).
   - **DOM order:** `#haltung` appears after `#freitag` and before `#kontakt` (compare bounding-box `y`
     or document order via `evaluate`) (AC1).
   - Both panel labels "Was Sie bekommen" and "Was ich bekomme" are visible (AC8).
   - **No new CTA:** `#haltung a[href="#kontakt"]` count is `0` and `#haltung` contains no primary
     `Button` (AC5).
   - **Mobile order:** at 375 px, "Was Sie bekommen" renders above "Was ich bekomme" (`y` comparison) (AC8).
2. **Implement:** import `haltung` from `offers.ts`; render the `<Section>` + `<Prose>` lead + 2-col grid
   with two `HaltungBlock`s between the friday and kontakt sections.
3. **Refactor:** keep the existing in-file comment style documenting the new section.

### T5 — Full epic QA  (AC7; confirms R8)
1. Delegate to **`verify-epic "Warum ich das mache"`**: full Vitest + Playwright suite (existing specs
   must stay green — landing/offers/nav/no-third-party/no-js), the new specs, the browser click-through,
   and the Lighthouse gate (`npm run preview` + `npm run lighthouse`, all four ≥ 95). Heading hierarchy
   stays valid (single `h1`; section `h2` → block `h3`).

## 6. Testing Strategy

- **Unit (Vitest):** `tests/haltung-content.test.ts` (content shape, German, Sie-register, AC2/AC3/AC4/AC10
  keywords) + additions to `tests/global-css.test.ts` (tint tokens + AA contrast). Mechanical guards
  `tests/no-raw-hex.test.ts` cover the new component automatically.
- **E2E (Playwright Test):** `e2e/warum-ich-das-mache/section.spec.ts` for placement/order, the two
  labelled panels, no-new-CTA, and mobile stacking order. Runs against `npm run preview`.
- **Click-through + Lighthouse:** via `verify-epic` at the end (AC7).
- **AC → test map:** AC1→section.spec (kicker/title + order); AC2/AC3/AC4/AC10→haltung-content;
  AC5→section.spec (no CTA); AC6→haltung-content (+ no hard-coded strings by construction);
  AC7→verify-epic; AC8→global-css (contrast) + section.spec (two panels, mobile order); AC9→section.spec (`#haltung`).

## 7. Risks & Non-functional

- **Contrast on tinted panels (a11y, R8/AC8) — main risk.** Body text must stay ≥ 4.5:1 on the tint and
  neon must never become text-on-light. Mitigation: opaque *dark* tints + the T2 contrast assertions in
  `global-css.test.ts`; neon stays border/label-on-dark per the contract.
- **Heading hierarchy (AC7).** New `h3`s under the section `h2` keep order valid; no second `h1`.
- **Zero-JS / perf (Lighthouse ≥ 95).** Pure markup + CSS tokens; no script, no new font, no image, no
  third-party request — no measurable perf cost.
- **Voice drift.** Draft copy is flagged for Ralph's editorial sign-off (= merge instruction, PRD D10);
  the Sie-register unit assertion catches accidental `du` forms.
- **Rollback.** Self-contained: revert `offers.ts`, `global.css`, `angebot.astro`, the new component, and
  the two test files. No data, no migration, no config.

## 8. Open Tech Decisions

> ✅ **Ready to build.** All tech decisions are resolved; no high-impact decisions remain open.
> Requirements R1–R11 / AC1–AC10 are fully covered by the traceability table (§4) and the TDD plan (§5).
> Next: `/implement-epic "Warum ich das mache"`.

## 9. Resolved Tech Decisions

| TD# | Chosen | Changed |
| :-- | :-- | :-- |
| TD1 | Opaque dark tint tokens (`--color-tint-pink` / `--color-tint-green`) in `@theme`; body text bone, neon only as border/label | Confirmed AD2; T2 asserts the tokens exist + AA contrast on each |
| TD2 | New `HaltungBlock.astro` presentational panel, composed twice | Confirmed AD3; T3 builds the component |
| TD3 | "Was Sie bekommen" → green, "Was ich bekomme" → pink | Pinned the accent→side mapping in AD3 + the `angebot.astro` wiring (T4) |
