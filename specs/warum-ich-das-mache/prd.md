# Epic PRD — "Warum ich das mache" Section

> **Status:** Ready · **Confidence:** 90% · **Brainstorm runs:** 3
> **Source:** [Roadmap](../roadmap.md)

## 1. Context

A short **"why I'm doing this"** section on `/angebot` that stops the offer from reading as a
cut-price *knock-off* of expensive consulting. Today the page goes "Das Produkt" (Der Freitag,
490 € netto = brutto, `#freitag`) → straight to "Kontakt" (`#kontakt`). For a German Mittelstand
decision-maker the unspoken question is *"why so cheap — what's the catch?"*. This section answers
it head-on, the same way the rest of the site does: punk hook, then the receipts.

The stance Ralph wants to put on the page:
- He's **not a fan of over-priced consultants** who do consulting as a full-time job and therefore
  *sell hours* for a living.
- The **best consultants and mentors stay hands-on** in real companies/jobs under real pressure —
  not the "I'm gone the moment it gets tough" type.
- The other side of the coin: **Ralph wants to keep learning and gathering experience** too.
- So the offer is a deliberate, honest **compromise**, not a discount: *"you get a consultant who
  hasn't lost touch with business reality"* ↔ *"the other half of my pay is the experience I gather
  working with my customers."*

Lives inside Epic 2's `/angebot` funnel and must obey the post-launch rules: static / zero-JS,
self-hosted fonts, no new third-party requests, no cookie banner, WCAG AA + visible focus,
Lighthouse ≥ 95, and the voice/register baseline in [voice-and-design.md](../../docs/voice-and-design.md)
(formal **Sie**, "ich" for Ralph, canonical terminology, kein Bullshit/kein Upselling). The single
primary CTA → contact form stays the only call to action; this section adds no new CTA.

## 2. Requirements

- **R1:** Add one new content section to `/angebot`, placed **between** the "Das Produkt" / Der Freitag
  section (`#freitag`) and the "Kontakt" contact-form section (`#kontakt`).
- **R2:** The section's heading is the kicker **"Haltung"** + title **"Warum ich das mache"**, matching the kicker+title rhythm of the surrounding sections.
- **R3:** The copy states the stance against over-priced, hours-selling, full-time consultants and
  argues that the best consultants/mentors stay hands-on in real companies under real pressure
  (not the "leaves when it gets tough" kind).
- **R4:** The copy names Ralph's own motive — he, too, wants to keep learning and gathering experience.
- **R5:** The copy frames the offer as an **honest two-way compromise** and **names the trade directly**:
  part of what Ralph takes home is the experience gained working with customers, so the 490 € is
  deliberately lower — not a knock-off / discount.
- **R6:** Section copy lives in `src/content/offers.ts` (no hard-coded strings in `angebot.astro`),
  rendered via the existing `Section` / `Prose` components, consistent with the surrounding sections.
- **R7:** Register & voice follow `docs/voice-and-design.md`: formal **Sie** (no `du`/`dein`/`euch`
  reader-address), "ich" for Ralph, canonical terminology (Der Freitag; 490 € netto = brutto), and the
  punk-as-bait / credibility-as-close, no-upselling tone. No new primary CTA is introduced.
- **R8 (non-functional):** Stay within locked decisions — static, zero-JS, no new third-party requests,
  no cookie banner; preserve valid heading hierarchy, WCAG AA contrast, visible focus, Lighthouse ≥ 95;
  no regressions to existing unit/e2e tests or the live funnel.
- **R9:** The section presents the two-way deal as **two labelled blocks side by side** — **"Was Sie
  bekommen"** (the reader's side: a consultant who hasn't lost touch with business reality) and **"Was
  ich bekomme"** (Ralph's side: experience and learning). Each block is a **dark panel with a
  low-opacity accent wash and a neon accent border** (one pink, one green); body text on the tinted
  panel must still meet WCAG AA. On small screens the blocks stack vertically with **"Was Sie bekommen"
  first**.
- **R10:** The section has a stable anchor id **`#haltung`** and is **not** added to any site navigation.
- **R11:** Each block's content is a **bold one-line claim + a 2–3 sentence paragraph**, in parallel
  structure between the two blocks, keeping the prose voice (not a bullet/feature grid).

## 3. Acceptance Criteria

- **AC1:** On `/angebot`, a section with kicker "Haltung" and title "Warum ich das mache" renders in the
  DOM **after** `#freitag` and **before** `#kontakt`.
- **AC2:** The section text expresses the consultant-skepticism + stay-hands-on-under-real-pressure
  stance (R3).
- **AC3:** The section text expresses Ralph's "I keep learning / experience is the other half of the
  pay" framing and **explicitly states** the 490 € is deliberately lower because of it (R4, R5).
- **AC4:** The copy addresses the reader as formal **Sie** with no `du`/`dein`/`dich`/`dir`/`euch`/`euer`
  reader-address forms; Ralph refers to himself as "ich".
- **AC5:** The section introduces **no** new primary CTA; the page still has exactly the existing
  single CTA treatment anchoring to `#kontakt`.
- **AC6:** The section's strings are sourced from `src/content/offers.ts`; `angebot.astro` contains no
  hard-coded copy for the section.
- **AC7:** Existing unit + e2e tests pass, heading hierarchy is valid (single `h1`, ordered headings),
  and Lighthouse stays ≥ 95.
- **AC8:** The section renders two labelled blocks — "Was Sie bekommen" and "Was ich bekomme" — side by
  side on desktop and stacked on mobile (with "Was Sie bekommen" first), each a dark panel with a
  distinct low-opacity accent wash (one pink, one green) and a neon accent border; block body text
  meets WCAG AA contrast against its tinted background.
- **AC9:** The section's container element has `id="haltung"`.
- **AC10:** Each block contains a bold one-line claim followed by a short paragraph (2–3 sentences),
  parallel in structure across the two blocks.

## 4. Open Questions

> ✅ **Ready to build.** All decisions are resolved; no blocking questions remain. Requirements
> (R1–R11) and Acceptance Criteria (AC1–AC10) above are the contract. Next: `/write-spec "Warum ich das mache"`.

### Deferred (non-blocking) — for the tech spec
These are implementation details for `/write-spec` to pin down as Open Tech Decisions; they don't block the PRD:
- **Tint token values:** exact low-opacity pink/green wash colors + neon border tokens, chosen so block
  body text clears WCAG AA on the tinted panel (the one risk flagged in Q7).
- **Side ↔ accent mapping:** which block gets pink vs green ("Was Sie bekommen" vs "Was ich bekomme").
- **Component reuse:** whether the two-block layout extends `Card`/`Section` or is a small new partial.

## 5. Resolved Decisions

| D# | Question | Chosen | Produced |
| :-- | :-- | :-- | :-- |
| D1 | Where does the section go? | Between Der Freitag (`#freitag`) and Kontakt (`#kontakt`) — per Ralph | R1, AC1 |
| D2 | Language & register | German, formal **Sie**, "ich" for Ralph (per voice-and-design.md) | R7, AC4 |
| D3 | Source of truth | Copy in `src/content/offers.ts`, rendered via `Section`/`Prose` | R6, AC6 |
| D4 | New call to action? | No — the single CTA → `#kontakt` stays the only one | R7, AC5 |
| D5 | Q1 · Heading | Kicker "Haltung" + title "Warum ich das mache" | R2, AC1 |
| D11 | Q7 · Block colors | Two accent-tinted dark panels (pink wash ↔ green wash) + neon borders; body text ≥ AA on tint | R9, AC8 |
| D12 | Q8 · Mobile order | "Was Sie bekommen" stacks first | R9, AC8 |
| D13 | Q9 · Block content | Bold one-line claim + 2–3 sentence paragraph per block, parallel structure | R11, AC10 |
| D6 | Q2 · Explicitness | Name the price ↔ experience trade directly | R5, AC3 |
| D7 | Q3 · Shape | Two side-by-side labelled blocks "Was Sie bekommen" ↔ "Was ich bekomme", distinct bg colors | R9, AC8 |
| D8 | Q4 · Visual treatment | Per Q3 — two distinct background-colored blocks (not a plain single section) | R9, AC8 |
| D9 | Q5 · Anchor/nav | `id="haltung"`, not added to any nav | R10, AC9 |
| D10 | Q6 · Copy | Draft on-brand German now; sign-off = Ralph's merge instruction on the epic branch | R7 |
