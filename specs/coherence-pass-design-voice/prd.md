# Epic PRD — Coherence Pass (Design & Voice)

> **Status:** Ready · **Confidence:** 90% · **Brainstorm runs:** 3
> **Source:** [Roadmap](../roadmap.md)

## 1. Context

The fifth epic of the **cib.is** portfolio + soft-sales-funnel site (Ralph as organizational
engineer / agile punk / part-time consultant, funneling German KMU leadership toward a 490 €
consulting Friday). It is a **post-launch consistency pass**: Epics 1–4 each shipped their own
surface (landing, offers + form, blog, legal + 404) and the site is now live and indexable. Along
the way, design and copy drifted — page-local styling one-offs, inconsistent tone, mixed German
register. This epic makes the whole thing feel like **one piece**.

**The baseline (the goal in one line):** *more punk, more Mittelstand, more Ralph.* Three dials to
balance deliberately — edgy/punk attitude, the trust and register German Mittelstand
decision-makers expect, and Ralph's authentic personal voice — applied consistently across every
surface.

This is **not** a redesign or a new-feature epic. Two work streams:
- **Design coherence** — reconcile shipped styling drift back into the Tailwind theme tokens
  (color, type scale, spacing, radii) and extract repeated patterns into shared components so a
  token change propagates everywhere.
- **Voice coherence** — a single tone guide capturing the punk × Mittelstand × Ralph baseline
  (German register, recurring terminology, the "no bullshit, no upselling" register), then a copy
  pass across the surfaces to align voice, terminology, and rhythm.
- **Minor page structure** only — consistent section rhythm, heading hierarchy, CTA placement; no
  new pages or features.
- **Learning artifact** — a living `/docs/voice-and-design.md` read at the start of every future
  refinement, alongside `architecture.md` + `coding-guidelines.md`.

**Locked decisions (from roadmap):** Astro `output: 'static'`, zero-JS by default, Tailwind 4,
self-hosted `woff2` fonts (never CDN), Netlify free tier + cib.is, German only, no
tracking/cookies/banner, WCAG AA + visible focus, Lighthouse ≥ 95, semantic/keyboard-accessible
HTML. This epic must stay **inside** all of these — no new third-party requests, no new JS, no
regressions to the live funnel or existing unit/e2e tests.

**Browser-verifiable (definition of done, from roadmap):** all pages share one visual system
(tokens/components, not page-local one-offs); copy reads in one consistent voice with consistent
register and terminology; section/CTA rhythm is consistent page-to-page; existing unit + e2e tests
still pass and Lighthouse stays ≥ 95.

## 2. Requirements

<!-- R1 -->
- **R1 — Split register: Sie on the funnel, first-person in the blog.** Every conversion/marketing
  surface (landing, offers, contact/booking form incl. field labels, validation + success states,
  404, and footer chrome) addresses the reader as formal **Sie** — no `du`/`dein` reader-address
  forms. The blog (post bodies and the post CTA) keeps Ralph's **first-person personal** voice and
  is exempt from the Sie rule. *(from Q1)*
- **R2 — Consistency + targeted improvement, inside the locked decisions.** The pass may both align
  drift *and* sharpen weak spots (flat copy, off-brand styling), but is hard-bounded: **no new
  pages, no new features, no new third-party requests, no new client JS**, and all existing
  unit/e2e tests keep passing. Anything beyond "improve what's already here" is out of scope. *(from
  Q2)*
- **R3 — One consistent primary-CTA highlight.** The green-hover highlight currently used only on
  the landing→offers CTA becomes the single shared treatment for **every button-styled CTA outside
  the header and footer** (e.g. landing→offers, offers→contact, blog-post→offers, 404→home/offers).
  Plain inline text links and header/footer nav are **not** in this set — the rule applies to things
  that are buttons, not links. *(from Q2 — Ralph's remark; set defined in Q9)*
- **R4 — A drafted, Ralph-approved `/docs/voice-and-design.md`.** Claude authors the voice + design
  guide from the existing corpus (the 19 migrated blog posts + offers + landing copy) and the
  roadmap; Ralph edits and approves it. It becomes the living artifact read at the start of every
  future refinement, alongside `architecture.md` + `coding-guidelines.md`. *(from Q3)*
- **R5 — Tokens reconciled + repeated patterns extracted into shared components.** Drifted styling
  values are pulled back into the Tailwind theme tokens (color, type scale, spacing, radii), and the
  repeated patterns — **CTA block, section header, card, button** — are lifted into single shared
  Astro components reused across surfaces, replacing page-local one-offs. *(from Q4)*
- **R6 — Voice verified by a written checklist + Ralph sign-off.** Verification of voice/tone is a
  **human** pass (no automated copy lint this epic): a written voice checklist is applied to each
  in-scope surface and Ralph signs off before the epic closes. *(from Q5)*
- **R7 — Scope = all surfaces; blog post bodies untouched.** In scope: landing, offers, form states,
  blog **index + CTA + chrome**, legal pages, 404, footer. The **migrated blog post bodies are left
  as authored** (Ralph's authentic archive) — no content rewrites to `src/content/blog/*`. *(from
  Q6)*
- **R8 — Audit-first: a `design-voice-audit.md` drift inventory.** The epic opens by producing
  `specs/coherence-pass-design-voice/design-voice-audit.md` listing every drift (token / CTA /
  component / copy / register) per in-scope surface. This inventory drives the implementation work
  and is the source for the R6 voice checklist. The audit is updated to "resolved" as items are
  fixed. *(from Q7)*
- **R9 — Sharpen within the existing identity (no new identity).** Reuse the current palette/type;
  apply existing accents more boldly and consistently — bolder edges, the green highlight, stronger
  heading weight/size, tighter rhythm. Small **8-bit/pixel-style highlights** and some **CSS
  animations** to bring things to life are allowed, with two hard guards: animations are **CSS-only**
  (no new client JS) and **respect `prefers-reduced-motion`** (WCAG); no wholesale new identity
  motifs. *(from Q8 — incl. Ralph's addition)*
- **R10 — Design coherence proven by Ralph's visual sign-off.** Whether the design reads as unified
  is decided by Ralph **eyeballing each in-scope surface** and signing off — no structural/no-dup
  grep gate and no automated visual-regression snapshots this epic. *(from Q10)*
- **R11 — Voice guide contents: glossary + register + principles + examples.** The voice section of
  `voice-and-design.md` (and the R6 checklist derived from it) contains: a **canonical terminology
  glossary** (e.g. "agile punk", "Friday model / 490 € net = gross", consistent entity naming), the
  **Sie/first-person register rule** (R1), **3–5 named voice principles**, and **do/don't example
  sentences**. *(from Q11)*

## 3. Acceptance Criteria

<!-- AC1 -->
- **AC1 →R1.** Every conversion surface (landing, offers, form labels/validation/success, 404,
  footer) addresses the reader as Sie with zero `du`/`dein` reader-address forms; blog post bodies
  and the post CTA remain first-person and are unchanged by the register rule.
- **AC2 →R2.** A before/after change list shows the pass added no new page/route, no new feature, no
  new third-party request and no new client JS; the full unit + e2e suite still passes and
  Lighthouse stays ≥ 95.
- **AC3 →R3.** Every button-styled CTA outside the header and footer renders the same green-hover
  highlight as the landing→offers CTA (hover check); plain inline text links and header/footer nav
  are unaffected.
- **AC4 →R4.** `/docs/voice-and-design.md` exists, is derived from the existing corpus + roadmap, and
  carries Ralph's recorded approval before the epic closes.
- **AC5 →R5.** The CTA block, section header, card, and button exist as shared Astro components and
  are used on the surfaces that need them; previously page-local color/type/spacing/radii values
  resolve to Tailwind theme tokens. (Coherence itself is judged per AC10, not by a structural gate.)
- **AC6 →R6.** A written voice checklist exists; each in-scope surface is reviewed against it and
  Ralph's sign-off is recorded before the epic closes.
- **AC7 →R7.** All listed surfaces are aligned; a diff confirms `src/content/blog/*` post bodies are
  unchanged.
- **AC8 →R8.** `design-voice-audit.md` exists, covers every in-scope surface across the five drift
  categories (token/CTA/component/copy/register), and each listed item is marked resolved by the end
  of the epic.
- **AC9 →R9.** Visual sharpening stays within the existing palette/type; any CSS animation runs with
  no new client JS and is suppressed under `prefers-reduced-motion`; Lighthouse stays ≥ 95 and the
  a11y pass holds.
- **AC10 →R10.** Ralph's per-surface visual sign-off on design coherence is recorded before the epic
  closes.
- **AC11 →R11.** `voice-and-design.md` contains the terminology glossary, the Sie/first-person
  register rule, 3–5 named voice principles, and do/don't examples; the R6 checklist is derived from
  it.

## 4. Open Questions

**✅ Ready to build.** All blocking decisions are resolved (D1–D12) and every Requirement (R1–R11)
maps to a verifiable Acceptance Criterion (AC1–AC11). Implementation runs **audit-first** (R8):
produce `design-voice-audit.md`, draft `voice-and-design.md` (R4/R11), then reconcile tokens +
extract shared components (R5) and run the copy/register pass (R1) across all in-scope surfaces
(R7), within the locked-decision guardrails (R2, R9). Close on the voice checklist + Ralph's
per-surface visual sign-off (R6, R10).

### Deferred (non-blocking)
These don't block the build; they get settled *during* implementation:

- **Concrete edit list (from R8).** The audit will enumerate the actual per-surface fixes — by
  design these aren't pre-listed here; the audit *is* the work breakdown.
- **8-bit / animation specifics (from R9).** Exactly which accents get a pixel-style highlight or a
  CSS animation is a design call made surface-by-surface during the pass, inside the CSS-only +
  reduced-motion guards.
- **Sign-off recording (from R6/R10).** Where Ralph's sign-off is recorded (PRD addendum, audit
  doc, or commit/PR) — pick at implementation; no decision needed now.

## 5. Resolved Decisions

| D# | Question | Chosen | Produced |
|----|----------|--------|----------|
| D1 | Q1 — German register | Sie on conversion surfaces; first-person voice in the blog | R1, AC1 |
| D2 | Q2 — How aggressive | Consistency + targeted improvement, inside locked decisions | R2, AC2 |
| D3 | Q2 (Ralph's remark) — CTA highlight | Green-hover treatment unified across all large non-header CTAs | R3, AC3 |
| D4 | Q3 — Capturing the voice | Claude drafts `voice-and-design.md` from the corpus; Ralph approves | R4, AC4 |
| D5 | Q4 — Design refactor depth | Reconcile tokens + extract shared components (CTA, section header, card, button) | R5, AC5 |
| D6 | Q5 — Verifying voice | Written voice checklist + Ralph sign-off (no automated lint) | R6, AC6 |
| D7 | Q6 — Surface scope | All surfaces aligned; migrated blog post bodies left untouched | R7, AC7 |
| D8 | Q7 — Audit first? | Formal `design-voice-audit.md` drift inventory drives the work | R8, AC8 |
| D9 | Q8 — Visual "punk" dial | Sharpen within existing identity + 8-bit highlights + CSS animations (CSS-only, reduced-motion) | R9, AC9 |
| D10 | Q9 — CTA set definition | Button-styled CTAs outside header/footer (buttons, not links) | R3, AC3 |
| D11 | Q10 — Proving design unified | Ralph's per-surface visual sign-off; no structural/snapshot gate | R10, AC10 |
| D12 | Q11 — Voice guide contents | Glossary + register rule + 3–5 principles + do/don't examples | R11, AC11 |
