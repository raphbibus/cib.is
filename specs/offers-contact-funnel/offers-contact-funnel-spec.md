# Tech Spec — Offers & Contact Funnel

> **Status:** ✅ Ready to build · **Confidence:** 92% · **Spec runs:** 2
> **Source PRD:** [prd.md](prd.md)
> **Guidelines:** docs/architecture.md, docs/coding-guidelines.md, docs/testing.md, docs/deployment.md

## 1. Overview

Epic 2 adds the **money path**: a single scrolling Offers page that presents the three
consulting offers (leadership → org dev → agile), sells the **Friday** as one repeatable
490 € product, and ends in an on-page **booking/contact form** wired to **Netlify Forms**.
The Epic 1 landing CTA is repointed from a `mailto:` to this new page.

Technically this is **the first interactive surface** on an otherwise zero-JS static site.
It is built entirely from the Epic 1 primitive library (`Section`, `Card`, `Button`,
`FormField`, `MailtoLink`, `Layout`) plus:

- a new typed content module `src/content/offers.ts` (mirrors `landing.ts`),
- a new `ContactForm.astro` component (server-rendered `<form data-netlify>` so Netlify
  detects it at build time — see architecture.md "Netlify Forms gotcha"),
- one small **Astro-processed `<script>` module** (TD3) — a Vite-bundled, TypeScript
  client script (no framework, no hydration island) that handles client-side validation,
  the homegrown captcha gate, AJAX submit, inline success-replace, and inline error + input
  preservation. It imports the shared `src/lib` helpers (`formValidate`, captcha `decode`).
  The Layout mailto decoder stays the existing inline script (Epic 1, unchanged),
- a pure, unit-tested `src/lib/captcha.ts` for the homegrown math/logic question,
- a small extension to `FormField.astro` for accessible inline validation messages,
- **progressive enhancement** (TD1): the form natively POSTs to Netlify and lands on a
  static `/danke` success page when JS is off; the bundled script upgrades it to inline
  AJAX replace + captcha gate when JS is on.

All Epic 1 constraints carry forward: Astro `output: 'static'`, Tailwind 4 `@theme`
tokens, self-hosted fonts, **zero third-party requests at runtime**, no cookies/tracking
(so no cookie banner), `noindex` until Epic 4, Lighthouse ≥ 95, WCAG AA, German only.

## 2. Key Architecture Decisions

These shape the build. The ones still open are tracked in §8; the ones already settled by
the PRD/guidelines are recorded here.

1. **Static form, build-time Netlify detection.** The `<form>` is server-rendered in a
   `.astro` page, so its markup is already in `dist/` — Netlify detects it at build with no
   `public/__forms.html` skeleton (that skeleton is only needed for JS-rendered forms). We
   add `data-netlify="true"`, a unique `name`, and `data-netlify-honeypot`. _(architecture.md)_

2. **Client logic ships as an Astro-processed `<script>` module (TD3).** A normal Astro
   `<script>` (not `is:inline`) is bundled & hashed by Vite into `/_astro/`, type-checked,
   and can `import` shared `src/lib` helpers — the idiomatic Astro way to add client JS on
   an Astro stack (Ralph's steer). **It is _not_ a hydrated `client:*` framework island:**
   the repo has no UI-framework integration, and adding one would pull in a framework
   runtime and break the zero-bundle budget. The module is `type="module"` (deferred,
   non-render-blocking) and same-origin, so AC5 (zero third-party) and Lighthouse ≥ 95 hold.
   Trade-off vs a raw inline blob: one extra small same-origin hashed request, bought back
   with TypeScript typing and DRY reuse of `formValidate`/captcha `decode`. The Layout
   mailto decoder stays an inline script (Epic 1, unchanged). _(see Deferred note re: TD3)_

3. **Spam protection is first-party only.** Netlify honeypot field + a homegrown math/logic
   question rendered at build time, its **answer lightly encoded (XOR+base64, `mailto.ts`
   style) in a `data-*` attribute** (TD2) and decoded client-side by the bundled script. No
   reCAPTCHA, no third-party scripts, no cookies (R6). Verification is necessarily
   **client-side** (the site has no server); the honeypot + Netlify's built-in spam filter
   are the real defense against no-JS bots, while the math question adds friction for
   JS-running bots.

4. **Reuse, don't reinvent.** Offers/Friday sections use `Section` + `Card`; the price block,
   CTAs, and form fields use `Button`/`FormField`; the mailto fallback reuses the existing
   `MailtoLink` + Layout decoder (R10 is already satisfied by Epic 1 infrastructure).

5. **Content lives in a typed module.** `src/content/offers.ts` holds all German copy
   (offers, Friday model, price/travel notes, form labels, captcha phrasing, confirmation,
   error text). No hard-coded strings in `.astro` (coding-guidelines.md). Placeholder
   on-brand copy now; Ralph's editorial pass before Epic 4.

6. **Funnel wiring.** Landing CTA (`index.astro`) → Offers page. Offers page has **one**
   primary CTA style, repeated top + bottom, both anchoring to the on-page form section
   (R9). The form is a `Section` with the CTA's anchor `id`.

## 3. Design

### 3.1 Components / Modules

| File | Kind | Responsibility |
| :--- | :--- | :--- |
| `src/pages/<route>.astro` | new page | Composes the Offers page: top CTA → 3 offer `Section`s → Friday `Section` (price) → bottom CTA → `ContactForm`. Default route `/angebot` (slug confirmation deferred, see §7). |
| `src/content/offers.ts` | new module | Typed German copy: `offers[3]`, `friday` (price, net=gross note, travel note, delivery note), `cta`, `form` (field labels, captcha, submit), `confirmation`, `error`. |
| `src/components/ContactForm.astro` | new component | Progressive-enhancement (TD1) `<form name="kontakt" method="POST" data-netlify="true" data-netlify-honeypot="…" action="/danke">` with `FormField`s, hidden `form-name`, honeypot, captcha field (encoded answer in `data-*`, TD2), submit `Button`, and empty `aria-live` success/error containers. Includes the Astro-bundled `<script>` module (TD3). |
| `src/components/FormField.astro` | extend | Add optional inline validation message: `aria-invalid`, `aria-describedby`, and a `role="alert"`/`aria-live` error `<span>` slot per field (AC4 screen-reader-accessible). Backwards compatible — Epic 1 callers unaffected. |
| `src/lib/captcha.ts` | new module | Pure: `makeChallenge()` → `{ question, answer }` (build-time), `verify(input, answer)`, and encode/decode of the answer for the data-attribute (per TD2). Unit-tested. |
| `src/pages/danke.astro` | new page | Native no-JS success page (TD1 = progressive enhancement). Static German confirmation mirroring the inline success copy (R11 "persönlich, binnen 2 Werktage"). The form's `action` target for the no-JS path. |
| `src/pages/index.astro` | edit | Repoint the landing primary CTA from `MailtoLink` to a link to the Offers page (R9). |

### 3.2 Data model & contracts

```ts
// src/content/offers.ts
export interface Offer { id: string; kicker: string; title: string; body: string; }
export interface Friday {
  id: string;
  kicker: string; title: string; body: string;
  price: string;          // "490 €"
  priceNote: string;      // net = gross / Kleinunternehmerregelung
  travelNote: string;     // ">2h von Bamberg ⇒ Reisekosten on top"
  delivery: string;       // on-site default, remote on request (R8/AC7)
}
export interface OffersForm {
  fields: { name: string; email: string; company: string; role: string; message: string }; // labels
  required: ('name' | 'email' | 'message')[];
  captchaLabel: string;   // surrounds the build-time question
  submitLabel: string;    // primary CTA label, e.g. "Freitag anfragen"
  honeypotName: string;
}
export interface OffersContent {
  cta: { id: string; label: string; headline: string; body: string };
  offers: [Offer, Offer, Offer];          // leadership, org dev, agile — in order (R3)
  friday: Friday;
  form: OffersForm;
  confirmation: { headline: string; body: string }; // "persönlich, binnen 2 Werktage" (R11/AC10)
  error: { body: string };                          // inline submit-failure copy (R12/AC11)
}
```

**Netlify Forms submission contract (AJAX path):** `POST` to `/` (or the form's `action`),
`Content-Type: application/x-www-form-urlencoded`, body includes `form-name=kontakt` plus all
named fields. Netlify returns `200`/redirect on accept. The honeypot field must be empty;
the `form-name` must match the rendered form's `name`.

**Captcha data flow (TD2):** at build, `makeChallenge()` produces `{question, answer}`. The
question renders into the label; the answer is **XOR+base64-encoded** (`mailto.ts` style) into
a `data-*` attribute on the form — the plaintext answer never appears verbatim in the served
HTML. The bundled script imports `decode()` to read it and verifies the user's input before
allowing the AJAX submit. The no-JS path skips the captcha check and relies on honeypot +
Netlify's spam filter (TD1).

### 3.3 External integrations / config

- **Netlify Forms** (free tier, 100 submissions/mo): no API key, no script. Detection is
  automatic from static markup. Submissions land in the Netlify Forms dashboard.
- **netlify.toml:** unchanged for forms (no extra config needed). The native
  `<form action="/danke">` resolves to the new static page (TD1); no redirect rule required.
- **No new runtime dependencies and no UI framework.** Client JS is one small Astro-bundled,
  same-origin, deferred `<script type="module">` (TD3) — zero third-party, no island runtime.

## 4. Requirement → Implementation Traceability

| Item | Covered by tasks |
| :--- | :--- |
| R1  | T1, T3 |
| R2  | T1, T3 |
| R3  | T1, T2 |
| R4  | T1, T2, T3 |
| R5  | T1, T4, T5, T6 |
| R6  | T7, T6 |
| R7  | T6, T8, T14 |
| R8  | T1, T3 |
| R9  | T2, T9 |
| R10 | T10 (reuse Epic 1) |
| R11 | T1, T8 |
| R12 | T6, T8 |
| AC1 | T3, T11 |
| AC2 | T2, T11 |
| AC3 | T3, T11 |
| AC4 | T4, T5, T6, T12 |
| AC5 | T7, T13 (+ manual dashboard) |
| AC6 | T8, T13, T14 (+ manual dashboard) |
| AC7 | T3, T11 |
| AC8 | T2, T9, T11 |
| AC9 | T10 (reuse Epic 1 e2e pattern) |
| AC10| T1, T8, T11 |
| AC11| T6, T8, T13 |

Every R# and AC# maps to at least one task. Manual-only confirmations (real Netlify dashboard
appearance for AC5/AC6) are flagged in §6 — they require a deploy preview, not local preview.

## 5. TDD Implementation Plan

> Test-first throughout. Pure logic → Vitest; rendered output / behavior → Playwright
> (`e2e/offers-contact-funnel/*.spec.ts`, run against `npm run preview`). Order: content &
> pure libs first, then markup, then the interactive script, then e2e.

### T1 — Offers content module  (satisfies R1, R2, R4, R5, R8, R11)
1. Write failing test `tests/offers-content.test.ts`: `offers` has exactly 3 entries with
   ids in order leadership→org-dev→agile; `friday.price` contains "490"; `priceNote` mentions
   net=gross/Kleinunternehmer; `travelNote` mentions Bamberg + Reisekosten; `delivery`
   mentions vor Ort + remote; `confirmation.body` contains "persönlich" and "2 Werktage";
   required = name/email/message.
2. Implement: `src/content/offers.ts` with the typed shape from §3.2 + on-brand placeholder copy.
3. Refactor: share interfaces; keep voice consistent with `landing.ts`.

### T2 — Offers page composition & routing  (satisfies R3, R9)
1. Write failing e2e `nav-and-structure.spec.ts`: the Offers route renders 4 sections in
   order (3 offers + Friday) on one scrolling page; exactly one primary-CTA `data-variant`
   style is present; CTA appears at top and bottom.
2. Implement: `src/pages/<route>.astro` composing `Section`/`Card` from `offers.ts`.
3. Refactor: extract repeated CTA markup; ensure single `<main>`, heading order.

### T3 — Friday-model & price section  (satisfies R1, R2, R4, R8)
1. Write failing e2e `friday-and-price.spec.ts`: 490 € + net=gross note + travel note + on-site/
   remote note all visible on first paint with **no interaction**; price sits near a CTA.
2. Implement: Friday `Section` markup pulling from `friday` content.
3. Refactor: a small price block partial reused near top CTA and in the Friday section (R4).

### T4 — FormField accessible validation extension  (satisfies R5, AC4)
1. Write failing test `tests/formfield.test.ts` (rendered): when given an error, the field gets
   `aria-invalid="true"`, an `aria-describedby` pointing at a `role="alert"` message node.
2. Implement: extend `FormField.astro` props (`error?`, `errorId?`) — backward compatible.
3. Refactor: ensure label/required markup unchanged for Epic 1 callers.

### T5 — Client-side validation helpers  (satisfies R5, AC4)
1. Write failing test `tests/form-validate.test.ts`: pure `validate(values)` → missing
   name/email/message flagged; malformed email flagged; valid input passes; email regex spec'd.
2. Implement: `src/lib/formValidate.ts` (pure).
3. Refactor: reuse the regex constant; export field-level messages from content.

### T6 — ContactForm component + honeypot + captcha field  (satisfies R5, R6, R7, R12, AC4)
1. Write failing e2e `form-fields.spec.ts`: form shows name/email/company/role/message; the
   honeypot field is present but visually hidden + `tabindex=-1` + `aria-hidden`; hidden
   `form-name` matches; captcha question is rendered as label text; the form has
   `method="POST"` + `action="/danke"` + the encoded answer in a `data-*` attribute (TD1/TD2).
2. Implement: `ContactForm.astro` progressive-enhancement `<form method="POST" data-netlify
   action="/danke" data-netlify-honeypot>` with `FormField`s, captcha field, submit `Button`,
   empty `aria-live` success + error nodes.
3. Refactor: wire copy from `offers.ts`; mark the anchor `id` for the CTA target.

### T7 — Homegrown captcha library  (satisfies R6, AC5)
1. Write failing test `tests/captcha.test.ts`: `makeChallenge()` returns a question string +
   integer answer; `verify(correct)` true, `verify(wrong)` false; the encoded answer (per TD2)
   round-trips and the **plaintext answer never appears** verbatim in the encoded token.
2. Implement: `src/lib/captcha.ts` (pure; deterministic at build).
3. Refactor: align encode/decode style with `mailto.ts` (TD2 = XOR+base64 obfuscation).

### T8 — Astro-bundled form script: submit, success, error  (satisfies R7, R11, R12, AC4, AC6, AC11)
1. Write failing e2e `submit-success-error.spec.ts` (Playwright intercepts the Netlify POST):
   - valid submit + correct captcha + empty honeypot → request fired; form replaced in place
     by confirmation containing "persönlich"/"2 Werktage"; **no navigation** (URL unchanged).
   - intercepted failure (e.g. route fulfilled 500) → inline error shown, entered values
     retained, mailto fallback surfaced.
   - wrong captcha / missing required field → submit blocked, inline SR-accessible message,
     no network request fired.
2. Implement: an Astro-processed `<script>` module (TD3 — Vite-bundled, `type="module"`, no
   `is:inline`, no framework island) that imports `validate` from `formValidate` and `decode`
   from `captcha`: `preventDefault` → validate → captcha gate → `fetch` POST urlencoded to
   Netlify → on ok replace form with confirmation (focus moved to it) → on fail render error
   + preserve values + reveal `MailtoLink`.
3. Refactor: keep the module tiny + framework-free; the no-JS path (no script) falls through
   to the native POST → `/danke` (T14).

### T9 — Repoint landing CTA + CTA anchor behavior  (satisfies R9, AC8)
1. Write failing e2e (extend `nav-and-structure.spec.ts`): on `/`, the primary CTA links to the
   Offers route; on the Offers page, clicking top/bottom CTA scrolls to the form section.
2. Implement: edit `index.astro` CTA to link to the Offers route; ensure CTAs use `href="#<form-id>"`.
3. Refactor: confirm no competing primary CTA remains on either page.

### T10 — Obfuscated mailto fallback on Offers page  (satisfies R10, AC9)
1. Write failing e2e `mailto.spec.ts` (offers): served HTML for the Offers route contains no
   plaintext address and no `mailto:` literal; after interaction the fallback link resolves to
   `mailto:ralph@cib.is`.
2. Implement: place `MailtoLink` in the error fallback (and/or near the form) — reuses Epic 1
   decoder; no new JS needed for this.
3. Refactor: ensure the fallback is reachable from the error state (ties to T8).

### T11 — Content/structure e2e assertions  (satisfies AC1, AC2, AC3, AC7, AC8, AC10)
1. Write failing e2e consolidating visible-text assertions for AC1/AC3/AC7/AC10 and order AC2.
2. Implement: covered by T1–T3 content/markup; this task only asserts.
3. Refactor: de-dupe selectors via test helpers.

### T12 — Validation e2e  (satisfies AC4)
1. Write failing e2e: malformed email + empty required fields block submit with an inline
   message linked via `aria-describedby`; filling the 3 required fields + valid email passes
   validation (submit allowed, then intercepted per T8).

### T13 — No-third-party + spam-path e2e  (satisfies AC5, AC6, AC11)
1. Write failing e2e `no-third-party.spec.ts` (offers): loading + submitting fires **zero**
   cross-origin requests (only same-origin + the Netlify form POST to same origin); wrong
   captcha rejected client-side; correct captcha + empty honeypot reaches the POST.
2. **Manual (deploy preview):** confirm a real test submission appears in the Netlify Forms
   dashboard and the success/redirect works (local `preview` has no Netlify backend — see §6).

### T14 — Progressive-enhancement no-JS path + `/danke` page  (satisfies R7, AC6, TD1)
1. Write failing tests:
   - rendered/e2e: the form (no JS executed yet) carries `method="POST"`, `data-netlify`,
     and `action="/danke"`; with JavaScript **disabled** (Playwright `javaScriptEnabled:false`
     project) submitting triggers a native navigation toward the action (intercepted, since
     local preview has no Netlify backend) rather than staying in place.
   - e2e: `/danke` renders the German confirmation including "persönlich" + "2 Werktage".
2. Implement: `src/pages/danke.astro` (static success page reusing `Layout` + `offers.ts`
   `confirmation` copy); ensure the form degrades gracefully without the script.
3. Refactor: share the confirmation copy between the inline success node (T8) and `/danke`
   so the two never drift.

## 6. Testing Strategy

- **Unit/integration (Vitest):** content schema (T1), FormField rendering (T4), validation
  helpers (T5), captcha lib (T7). Fast, run per task.
- **e2e (Playwright, `e2e/offers-contact-funnel/`):** structure/order, price-on-first-paint,
  validation, captcha gate, AJAX success-replace, error+preserve+mailto, zero-third-party,
  mailto obfuscation. Runs against `npm run preview` (static `dist/`).
- **Netlify POST in e2e is intercepted**, not real: `npm run preview` serves static files with
  no Netlify backend, so `page.route()` fulfills the form POST to simulate Netlify 200 (success
  path) and 500 (failure path). This makes AC6/AC11 behavior testable locally.
- **No-JS path (TD1):** a Playwright project with `javaScriptEnabled: false` verifies the form
  natively POSTs to `/danke` (T14) — the script enhancement is absent, so the markup must work
  on its own.
- **Lighthouse note (TD3):** the bundled `<script type="module">` is deferred + same-origin;
  confirm it adds no third-party request and keeps Performance ≥ 95.
- **Manual deploy-preview checks (cannot be automated locally):** AC5/AC6 "entry appears in the
  Netlify Forms dashboard" — verified once on a PR deploy preview by submitting a test request.
  Flag explicitly in the QA report; do not claim it from a green local suite.
- **Lighthouse gate:** re-run `npm run lighthouse` on the Offers route; keep ≥ 95 (SEO still 66
  by design until Epic 4 noindex removal). The new inline script must stay tiny.
- **a11y:** keyboard-reachable form, visible focus ring, `aria-live`/`role="alert"` validation
  + success messaging, focus moved to confirmation on success (WCAG AA).

## 7. Risks & Non-functional

- **No-JS users + captcha (key risk).** With no server, the math captcha can only be verified
  in JS, so it does nothing against typical no-JS spam bots — the **honeypot + Netlify's spam
  filter are the real no-JS defense**. The no-JS *human* path is covered by progressive
  enhancement (TD1): the native form POSTs to `/danke`, captcha skipped, honeypot enforced.
- **Performance:** one small Astro-bundled `<script type="module">` (TD3) — deferred,
  same-origin, no framework runtime. Keep it minimal to protect Lighthouse ≥ 95. The chosen
  option is explicitly **not** a `client:*` framework island (which would need a new
  integration + bundle); see the Deferred confirmation note in case Ralph meant otherwise.
- **a11y:** inline validation + success/error must be announced (`aria-live`, `role="alert"`,
  `aria-invalid`, `aria-describedby`); focus management on success.
- **GDPR/legal:** no cookies, no tracking, no third-party scripts → no cookie banner needed.
  Form collects PII (name/email/company/role/message) → a privacy note/link is wanted, but the
  Datenschutz page is **Epic 4**; for now a short inline note + the noindex guard. Don't ship
  to public index before Epic 4 (already enforced).
- **Spam volume vs free tier:** 100 submissions/mo. Honeypot + captcha + Netlify filter should
  keep real volume well under cap; if exceeded, revisit.
- **Edge cases:** double-submit (disable button while in-flight), network timeout (treat as
  failure path), back-button after success, very long message field.
- **Rollback:** the Offers page + repointed landing CTA are additive; reverting the `index.astro`
  CTA edit and removing the route restores Epic 1 behavior.

## 8. Open Tech Decisions

> How to answer: change `[ ]` to `[x]` on **one** option per decision, or fill its `Other:` line.
> Don't delete a decision — it moves to "Resolved Tech Decisions" on the next run.
> The `**(recommended)**` label is a suggestion only; nothing is pre-selected.

_None — all high-impact decisions resolved (see §9). Remaining items are non-blocking (below)._

## 9. Resolved Tech Decisions

| TD# | Chosen | Changed |
| :-- | :----- | :------ |
| TD1 | **Progressive enhancement** — native `<form method=POST action=/danke>`; JS upgrades to AJAX inline-replace | Added `src/pages/danke.astro` (now confirmed, not conditional); `ContactForm` form attrs (`method`/`action`); new task **T14** (no-JS path + `/danke`); traceability R7/AC6 += T14; no-JS Playwright project in §6; risk note updated |
| TD2 | **Lightly-encoded captcha answer** (XOR+base64, `mailto.ts` style) in a `data-*` attribute, decoded client-side | Arch decision #3 + §3.2 captcha-flow rewritten; `captcha.ts` adds encode/decode; T6 asserts encoded answer in markup; T7 asserts plaintext never appears verbatim |
| TD3 | **Astro-processed `<script>` module** (Vite-bundled, `type=module`, TS) — _interpreting Ralph's "astro variant on an astro stack" note; **not** a `client:*` framework island, which the repo can't host without a new integration_ | Arch decision #2 rewritten; Overview + §3.3 updated (no framework, no `is:inline` blob); T8 reworded to a bundled module importing `formValidate`/`decode`; Lighthouse note in §6; perf risk note |

---

### Deferred (non-blocking)
Sensible defaults applied in design; Ralph can finalize during implementation/content:

- **TD3 interpretation — confirm at implementation:** Ralph checked the "island (`client:*`)"
  option with the note *"the astro variant sounds most promising on an astro stack."* This spec
  reconciles that as Astro's idiomatic **Vite-bundled `<script>` module** (no framework, no
  hydration) — because a true `client:*` island would require adding a UI-framework integration
  (React/Preact/etc.), a new dependency + bundle that breaks the zero-bundle/Lighthouse budget.
  If Ralph genuinely wants a framework island, say so and we'll add a follow-up decision to pick
  the framework; otherwise the bundled-script approach stands. **Not blocking** the build.
- **Offers route slug:** `/angebot` vs `/leistungen` (PRD defers). Default in design: `/angebot`.
- **Final CTA label:** "Freitag anfragen" assumed; confirm exact wording (PRD).
- **Captcha question phrasing & honeypot field name:** exact homegrown question + field name —
  implementation detail; keep screen-reader-accessible per WCAG AA.
- **Response-time number:** "2 Werktage" assumed (R11); confirm Ralph can hold to it.
- **Offer & Friday German copy:** placeholder on-brand draft now; Ralph's editorial pass pre-Epic 4.
