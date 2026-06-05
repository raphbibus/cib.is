# Design & Voice Audit — Coherence Pass

> Drift inventory (R8/AC8). The **work breakdown** for this epic: every in-scope surface ×
> five drift categories (**token / CTA / component / copy / register**). Each row is a concrete
> finding + fix + status. Items flip to ✅ **resolved** as the pass lands them.
>
> Status legend: ✅ resolved · 🟡 in progress · ⬜ open · ➖ no drift found (surface clean in
> that category).

Audit run: 2026-06-04. Source review covered every file in the §3.1 surface table of
[the spec](coherence-pass-design-voice-spec.md).

---

## Cross-cutting findings (drive T3/T4/T5/T6/T7)

| # | Category | Finding | Fix | Task | Status |
| :-- | :--- | :--- | :--- | :--- | :--- |
| X1 | CTA | The green hard-shadow hover lives only as an inline `ticketButtonClass` in `index.astro` — a one-off that bypasses `Button.astro`. Every other button CTA (`offers`, `404`, `PostCta`, submit) uses `variant="solid"`/`"outline"` and has no unified hover. | Promote the green hard-shadow hover into a dedicated `primary` variant on `Button.astro` (TD1); route every button-styled CTA outside `<header>`/`<footer>` through it. | T3 | ✅ |
| X2 | token | No `@theme` token names the CTA hover-shadow offset/colour; the offset (`6px 6px`) is a magic value inside the inline class. | Add a named hover-shadow construct to the `primary` variant; keep the colour as `var(--color-neon-green)`. | T3/T5 | ✅ |
| X3 | token | No mechanical guard stops raw hex / inline `style="…color…"` from re-entering `.astro` markup. Current markup is already clean (only HTML entities like `&#8217;` present — not colours), but drift can silently return. | Add `tests/no-raw-hex.test.ts` to the default `npm test` run (TD4). | T4 | ✅ |
| X4 | component | Animation is CSS-only today (`.eq`, `.nav-underline`) and reduced-motion-guarded. New 8-bit accents/motion must keep that contract. | 8-bit accents as committed inline SVG (no new `@font-face`); any keyframes guarded under `@media (prefers-reduced-motion: reduce)` (TD3). | T6 | ✅ |
| X5 | register | The funnel mixes informal **du/dein/euch/ihr** address with the intended formal **Sie**. Concentrated in `offers.ts`, `landing.ts` (haltung + CTA), `legal.ts` (Datenschutz), and the hard-coded `404.astro` copy. | Convert all reader-address forms on conversion/legal surfaces to formal **Sie**; leave blog first-person. | T7 | ✅ |

---

## Landing — `index.astro`, `landing.ts`, `Hero`, `Section`, `Card`, `Prose`

| Category | Finding | Fix | Task | Status |
| :--- | :--- | :--- | :--- | :--- |
| token | Markup uses `@theme` tokens / utilities throughout (`bg-ink`, `border-paper`, `text-gradient`, `bg-neon-green`). No raw hex. | Hold the line via the new lint. | T4 | ✅ |
| CTA | Primary CTA "Angebot ansehen" is the inline `ticketButtonClass` (the green-hover one-off, X1). | Replace with `<Button variant="primary" href="/angebot">`; delete the dead class string. | T3 | ✅ |
| component | The inverted **Haltung** block is bespoke header markup (kicker pill + poster `h2`) duplicating what `Section` owns; promo/CTA panels are intentional per-page panels (TD2 — not extracted). | Leave Haltung's gradient-fill block as-is (its inversion is deliberate identity, AD1); panels stay per-page (TD2/AD6). Only the button is shared. | T3 | ✅ |
| copy | On-brand, CV-traceable, no lorem. Reads in voice. | No rewrite; tighten register only. | T7 | ✅ |
| register | `haltung.body`: "bei **euch** … mit **euch**"; `cta.body`: "Schau es **dir** an." | → "bei **Ihnen** … mit **Ihnen**"; "Schau**en Sie** es **sich** an." | T7 | ✅ |

## Offers — `angebot.astro`, `offers.ts`, `PriceTag`

| Category | Finding | Fix | Task | Status |
| :--- | :--- | :--- | :--- | :--- |
| token | Tokens/utilities only; accent system via `Section accent`. No raw hex. | Lint guards it. | T4 | ✅ |
| CTA | Two `href="#kontakt"` CTAs use `variant="solid"` (top + Friday); submit uses default solid. None carry the unified green hover (X1). | Route top, Friday, and submit through `variant="primary"`. | T3 | ✅ |
| component | Section header + cards already use `Section`/`PriceTag` primitives. CTA panel stays per-page (TD2). | No extraction. | — | ➖ |
| copy | On-brand, no lorem; asserted facts (490 €, §19 UStG, 2 Werktage, Bamberg/Reisekosten, vor Ort/remote) must be preserved. | Preserve all asserted phrases during register edit. | T7 | ✅ |
| register | Pervasive informal address: `cta.body` "Schreib mir … bei euch"; `intro.body` "eure Teams … bei euch"; offer bodies "mit euch / bei euch"; `friday.body` "nur mit euch … habt ihr … ihr … könnt"; `delivery` "bei euch"; `errors` "gib/beschreib/rechne"; `privacyNote` "Deine … dir"; `confirmation.body` "schlage dir"; `error.body` "Deine … versuch … schreib". | Convert every form to **Sie**; keep "vor Ort", "remote", "persönlich", "2 Werktage", "Bamberg", "Reisekosten", §19 UStG note. | T7 | ✅ |

## Contact form + states — `ContactForm.astro`, `FormField.astro`, `danke.astro`, `formValidate.ts`

| Category | Finding | Fix | Task | Status |
| :--- | :--- | :--- | :--- | :--- |
| token | `border-neon-green`/`border-neon-pink`/`bg-surface` utilities; no raw hex. | Lint guards. | T4 | ✅ |
| CTA | Submit `<Button type="submit">` (default solid) is a button CTA without the unified hover (X1). | `variant="primary"`. `danke.astro` "← Zurück zum Angebot" is a secondary back-link → also routed to `primary` for a single uniform button treatment. | T3 | ✅ |
| component | Form built from `FormField`/`Button`/`MailtoLink` primitives; static Netlify `<form>` (`data-netlify`, honeypot, `action="/danke"`) must stay intact. | No structural change; preserve form markup (guarded by offers e2e). | — | ➖ |
| copy | Field labels/messages live in `offers.ts` (no hard-coded strings). | — | — | ➖ |
| register | Error/label/placeholder copy is informal (covered under Offers `offers.ts` row). | Sie pass in `offers.ts`. | T7 | ✅ |

## Blog (chrome / CTA only) — `blog/**`, `PostCard`, `PostCta`, `blog-cta.ts`

| Category | Finding | Fix | Task | Status |
| :--- | :--- | :--- | :--- | :--- |
| token | Tokens/utilities only (`border-neon-green`, `text-neon-green`). | Lint guards. | T4 | ✅ |
| CTA | `PostCta` uses `variant="solid"` — the blog-post→offers button is in the unified set (X1). | `variant="primary"`. | T3 | ✅ |
| component | Uses `Section`/`Prose`/`Button`/`PostCard`. | — | — | ➖ |
| copy | First-person, Ralph's voice — **correct and exempt** (R7). | Leave `blog-cta.ts` + post bodies untouched. | T7/T8 | ✅ |
| register | **First-person by design** (du/ich) — exempt from the Sie rule. | No change; guard bodies byte-for-byte (T8). | T8 | ✅ |

## Legal — `impressum.astro`, `datenschutz.astro`, `legal.ts`

| Category | Finding | Fix | Task | Status |
| :--- | :--- | :--- | :--- | :--- |
| token | Tokens/utilities only. | Lint guards. | T4 | ✅ |
| CTA | No button CTAs (chrome links only). | — | — | ➖ |
| component | Uses `Section`/`Prose`/`MailtoLink`. | — | — | ➖ |
| copy | Legally complete; asserted phrases (§19 UStG, retention, rights, Netlify/SCC) must be preserved. | Preserve asserted phrases. | T7 | ✅ |
| register | `datenschutz` body mixes informal **du/dir/deine**: "die **du** uns … schickst", "von **dir** … **deine** Nachricht", "**deiner** Formularangaben", "Wenn **du** uns … kontaktierst … **deine** Angaben". | Convert to **Sie** (AD3 includes `legal.ts`); keep all legal phrasings. | T7 | ✅ |

## 404 — `404.astro`

| Category | Finding | Fix | Task | Status |
| :--- | :--- | :--- | :--- | :--- |
| token | `border-neon-pink`/`text-neon-pink` utilities; no raw hex. | Lint guards. | T4 | ✅ |
| CTA | Two buttons: "← Zur Startseite" (`solid`) and "Zum Angebot" (`outline`). Per spec T3 enumeration (404→home/offers) both are in the unified set. | Route **both** through `variant="primary"`. | T3 | ✅ |
| component | Uses `Button`/`MailtoLink` primitives. | — | — | ➖ |
| copy | Copy is **hard-coded in markup** (no 404 content module). On-brand; minimal-change rule (R2) → edit inline rather than introduce a new module. | Edit inline strings for register only. | T7 | ✅ |
| register | `description` "… oder schreib mir."; MailtoLink label "Schreib mir". (Impersonal "gibt's"/"geht's" are statements, not reader-address — kept.) | → "schreiben Sie mir" / "Schreiben Sie mir". | T7 | ✅ |

## Chrome — `Header.astro`, `Footer.astro`, `MailtoLink.astro`, `Layout.astro`

| Category | Finding | Fix | Task | Status |
| :--- | :--- | :--- | :--- | :--- |
| token | "Buchen" button is an **inline gradient class** in `Header.astro` mirroring `solid`, but header buttons are **excluded** from the unified primary set (R3). | Leave as-is (header/footer excluded by R3/AC3). Tokens/utilities only — no raw hex. | T3 | ✅ |
| CTA | Header "Buchen" + footer links are **chrome**, explicitly out of the primary-CTA set. | No change; the new e2e asserts header/footer buttons are **not** `primary`. | T3 | ✅ |
| component | Header/Footer are shared primitives already. | — | — | ➖ |
| copy / register | Footer/header copy ("Buchen", "E-Mail schreiben", "Organisations-Punk") carries no reader-address du/dein forms. | No change. | — | ➖ |

---

## Resolution summary

All five drift categories across all in-scope surfaces are accounted for. Mechanical fixes
(CTA unification T3, token hygiene T4/T5, motion safety T6, register T7) are TDD-gated. Subjective
coherence + register *quality* are carried to Ralph's per-surface sign-off (T9 / AC6 / AC10).

---

## Voice checklist application + sign-off (T9 / R6, R10 / AC6, AC10)

The checklist lives in [docs/voice-and-design.md §6](../../docs/voice-and-design.md). Sign-off is
**recorded here** (location chosen per the spec's deferred decision).

**Claude's mechanical pass** (the observable/automatable items — register, terminology, tokens,
motion safety) per surface. The **two human columns** (subjective voice *quality* and design
*coherence*) require Ralph eyeballing each surface — they stay ⬜ until he signs.

| Surface | Register = Sie | Terminology | Tokens / no raw hex | Motion safe | Voice quality (Ralph) | Design coherence (Ralph) |
| :--- | :--: | :--: | :--: | :--: | :--: | :--: |
| Landing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Offers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contact form + states | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Blog (chrome/CTA) — first-person, exempt | ✅ (exempt) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Legal (Impressum/Datenschutz) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 404 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chrome (Header/Footer) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Mechanical pass:** ✅ green — verified by the automated suite (register scan clean on every funnel
surface; `no-raw-hex` lint green; `global-css` reduced-motion + CTA-fill contracts green;
`docs`/content/e2e green).

> **Ralph's sign-off (R6/R10/AC4/AC6/AC10) — ✅ APPROVED.**
> Ralph reviewed each in-scope surface for voice **and** design coherence and approved the guide.
>
> - [x] Voice + design coherence reviewed per surface — _signed: Ralph Cibis (ralph.cibis@thomann.io) · date: 2026-06-05_
> - [x] `docs/voice-and-design.md` approved — _signed: Ralph Cibis (ralph.cibis@thomann.io) · date: 2026-06-05_
>
> `docs/voice-and-design.md` is now the **approved, living** voice + design guide — read it at the
> start of every future refinement.
</content>
</invoke>
