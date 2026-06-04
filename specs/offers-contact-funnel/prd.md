# Epic PRD — Offers & Contact Funnel

> **Status:** ✅ Ready to build · **Confidence:** 92% · **Brainstorm runs:** 3
> **Source:** [Roadmap](../roadmap.md)

## 1. Context

The **money path** of cib.is. After the landing page (Epic 1) tells Ralph's story, this
epic presents the consulting offers and captures booking requests — without ever feeling
like a "funnel."

Audience: German **KMU / Mittelstand** leadership (GF, Bereichsleitung), ~45–58, who are
quietly frustrated (a team that won't self-organize, a stalled transformation, an unnamed
leadership conflict) and skeptical of buzzword "agile coaches." The moment before they act,
they're asking: *"Is this a real operator, or another LinkedIn guy who'll cost €20k and
leave a Confluence page?"*

The brand voice ("organizational engineer, agile punk, no bullshit, no upselling") is in
direct tension with classic funnel tactics (scarcity nudges, benefit-bullets, social-proof
carousels). The central design challenge is an **anti-funnel**: a page that converts
*because* it refuses to sell.

The **490 € net = gross** Friday is unusually cheap for consulting. That price is a signal:
it reads as *Kleinunternehmer / solo operator*, and it lowers the risk barrier enough for a
skeptic to say yes once. (Ralph: the price can be kept low because I'm working hands-on at a
job where I can eat my own dog food every day. I take less money and trade it against my
off-day and more experience.) The Friday is sold as **the product** — one repeatable thing,
not a teaser for larger engagements.

**Locked decisions (from roadmap):** Astro static; Tailwind 4; Netlify Forms (free tier,
100 submissions/mo) with honeypot + GDPR-friendly captcha; request-only booking (Ralph
confirms a Friday date manually by email); obfuscated mailto fallback; German only; no
tracking / no cookies / no third-party scripts (so no cookie banner); `noindex` until
Epic 4; Lighthouse ≥ 95; WCAG AA. (Ralph: zero-JS is a guideline, not a fixed rule —
discussed in Epic 1; JS is acceptable where it earns its keep, e.g. AJAX form submit.)

**In scope:** Offers page(s); funnel wiring landing → offers → contact; the booking/contact
form via Netlify Forms; success state; client-side validation; obfuscated mailto.
**Out of scope:** Legal pages (Epic 4); blog (Epic 3); calendar/payment integration;
automated scheduling; CRM.

## 2. Requirements

- **R1** — The Offers page sells the Friday as a single, self-contained, repeatable product
  (one whole Friday with the client). No upsell to multi-day packages or retainers.
- **R2** — Price is shown as **490 €** with an explicit *net = gross* note (Kleinunternehmer­
  regelung). A transparent surcharge note states that travel costs (train/hotel) are added on
  top when the client location is more than ~2 hours' drive from Bamberg.
- **R3** — A single scrolling Offers page contains three offer sections in priority order —
  (1) Leadership training/coaching, (2) Organizational development, (3) Agile coaching —
  followed by the Friday-model section.
- **R4** — The 490 € price is displayed prominently and without interaction (in the
  Friday-model section and near the primary CTA), framed as radical transparency.
- **R5** — The booking form collects: name, email, company, role, and a free-text message
  ("what's the pain / what would a good Friday change?"). Name, email, and message are
  required and client-side validated (email format); company and role are optional.
- **R6** — Spam protection uses a Netlify honeypot field **plus** a first-party logic/math
  question rendered at build time. No Google reCAPTCHA, no third-party scripts, no cookies.
- **R7** — On a successful submission the form is replaced in place by a confirmation message
  with no page navigation (AJAX submit to Netlify Forms; JS permitted per the guideline note).
- **R8** — The Friday is delivered **on-site at the client by default**; remote delivery is
  available on request. The Friday-model copy states both.
- **R9** — A single primary CTA ("Freitag anfragen", final copy TBD) appears at the **top and
  bottom** of the Offers page and anchors to the on-page contact-form section; no competing
  primary CTAs exist. The booking form lives as a section on the Offers page (the CTA's anchor
  target). The Epic 1 landing CTA links to the Offers page.
- **R10** — The fallback email is an **obfuscated, JS-assembled mailto**: the raw address does
  not appear in the served static HTML and the link opens the correct mailto on click.
- **R11** — The post-submit confirmation states a concrete expectation: Ralph replies
  **personally within 2 Werktage** and proposes a Friday date.
- **R12** — If the AJAX submit fails, an **inline error** is shown, the user's entered data is
  **preserved**, and the obfuscated mailto fallback is surfaced as an alternative.

## 3. Acceptance Criteria

- **AC1** — On the Offers page, the Friday appears as the headline product priced 490 €, with
  visible *net = gross* wording and the ">2h-from-Bamberg ⇒ travel costs on top" note.
- **AC2** — One Offers route renders all three offer sections in order leadership → org dev →
  agile, plus the Friday-model section, on a single scrolling page.
- **AC3** — The 490 € price is visible on first paint without any interaction.
- **AC4** — The form shows fields name/email/company/role/message; submitting with the three
  required fields filled succeeds; a missing required field or malformed email blocks submit
  with an inline, screen-reader-accessible validation message.
- **AC5** — The Offers/contact page makes **zero** third-party network requests (verify in the
  network tab); a wrong captcha answer is rejected; a correct answer with an empty honeypot
  submits successfully and the entry appears in the Netlify Forms dashboard.
- **AC6** — After a valid submit, the confirmation replaces the form without a navigation, and
  the submission appears in the Netlify dashboard.
- **AC7** — The Friday-model section states on-site delivery as default and remote on request.
- **AC8** — The primary CTA appears at top and bottom; clicking either jumps to the on-page
  contact-form section; only one primary-CTA style is present on the page.
- **AC9** — The served static HTML contains no plaintext email address; with JS enabled the
  fallback link resolves to the correct mailto and works on click.
- **AC10** — The inline confirmation text includes the "persönlich, binnen 2 Werktage" promise.
- **AC11** — Simulating a failed submit shows an inline error, retains the entered field
  values, and surfaces the mailto fallback.

> Baseline click-path (from roadmap): landing → offers → submit a test request → success
> state; submission appears in Netlify Forms; obfuscated email resists trivial scraping yet
> works on click. (Formalized further by R/AC above + Q9 below.)

## 4. Open Questions

✅ **Ready to build.** All blocking decisions are resolved (D1–D11) and every Requirement
(R1–R12) maps to a verifiable Acceptance Criterion (AC1–AC11). A builder can implement the
Offers page + contact funnel from the sections above without guessing on structure, flow,
pricing, form behavior, spam protection, success/error states, or delivery model.

Start from **§2 Requirements** and **§3 Acceptance Criteria**; verify against the baseline
click-path note.

### Deferred (non-blocking)
These don't block the build — sensible defaults are fine, and Ralph can finalize during
implementation/content authoring:

- **Offer & Friday copy (German):** the actual section text and the Friday-model wording
  (roadmap says content is provided at refinement). Default: draft on-brand placeholder copy.
- **Final CTA label:** "Freitag anfragen" assumed; confirm exact wording.
- **Route/slug:** German URL for the Offers page (e.g. `/angebot` vs `/leistungen`).
  Default: pick one in implementation; the form is an anchored section on that page.
- **Response-time number:** "2 Werktage" assumed in R11 — confirm Ralph can hold to it.
- **Captcha question phrasing & field naming:** exact homegrown logic question and the
  honeypot field name — implementation detail; keep it screen-reader-accessible per WCAG AA.

## 5. Resolved Decisions

| D# | Question | Chosen | Produced |
|----|----------|--------|----------|
| D1 | Q1 — Friday: product or front door? | **The product** (single repeatable Friday; travel costs on top >2h from Bamberg) | R1, R2, AC1 |
| D2 | Q2 — Offers page structure | **One scrolling Offers page** (priority order: leadership, org dev, agile) | R3, AC2 |
| D3 | Q3 — Pricing transparency | **Show 490 € net = gross prominently** (Kleinunternehmerregelung) | R4, AC3 |
| D4 | Q4 — Booking form depth | **Minimal + light qualifiers** (name, email, company, role, message) | R5, AC4 |
| D5 | Q5 — Captcha within no-third-party constraint | **Honeypot + homegrown logic question** | R6, AC5 |
| D6 | Q6 — Success state | **Inline success (AJAX, no navigation)** | R7, AC6 |
| D7 | Q7 — Delivery mode | **On-site by default** (remote on request) | R8, AC7 |
| D8 | Q8 — Funnel CTA wiring | **One primary CTA repeated** (top + bottom, anchors to on-page form) | R9, AC8 |
| D9 | Q9 — Email obfuscation | **JS-assembled mailto** | R10, AC9 |
| D10 | Q10 — Confirmation promise | **Personal reply within 2 Werktage** | R11, AC10 |
| D11 | Q11 — Submit failure handling | **Inline error + preserve input + mailto fallback** | R12, AC11 |
