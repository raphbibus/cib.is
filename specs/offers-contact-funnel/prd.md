# Epic PRD — Offers & Contact Funnel

> **Status:** Drafting · **Confidence:** 30% · **Brainstorm runs:** 1
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
skeptic to say yes once. Whether that one Friday is the *product* or the *front door* to
larger engagements is the first open question — and it reshapes the entire page.

**Locked decisions (from roadmap):** Astro static, zero-JS default; Tailwind 4; Netlify
Forms (free tier, 100 submissions/mo) with honeypot + GDPR-friendly captcha; request-only
booking (Ralph confirms a Friday date manually by email); obfuscated mailto fallback;
German only; no tracking / no cookies / no third-party scripts (so no cookie banner);
`noindex` until Epic 4; Lighthouse ≥ 95; WCAG AA.

**In scope:** Offers page(s); funnel wiring landing → offers → contact; the booking/contact
form via Netlify Forms; success state; client-side validation; obfuscated mailto.
**Out of scope:** Legal pages (Epic 4); blog (Epic 3); calendar/payment integration;
automated scheduling; CRM.

## 2. Requirements

<!-- R1: ... (populated as decisions are reconciled) -->

## 3. Acceptance Criteria

<!-- AC1: ... (populated as decisions are reconciled) -->

> Carried from roadmap (baseline, will be formalized into AC as decisions land):
> Full click path landing → offers → submit a test request → success state; submission
> appears in Netlify Forms; obfuscated email resists trivial scraping yet works on click.

## 4. Open Questions

> How to answer: change `[ ]` to `[x]` on **one** option per question, or fill its `Other:` line.
> Don't delete a question — it moves to "Resolved Decisions" automatically on the next run.
> The `**(recommended)**` label is a suggestion only; nothing is pre-selected.

### Q1: Is the 490 € Friday the *product* or the *front door*?
- [ ] **The product** — the whole business is selling individual Fridays; the page sells one repeatable thing.
- [ ] **The front door (tripwire)** — the cheap Friday gets a skeptic into the room once; larger engagements are the real business. **(recommended)** — explains the low net=gross price, fits the "no upselling" voice (you earn the next step, you don't pitch it), and gives a skeptical Mittelstand buyer a low-risk first yes.
- [ ] **Both, explicitly tiered** — Friday as the named entry point, with one or two named follow-on engagement shapes shown honestly.
- [ ] Other: 

### Q2: How are the three offers (org dev, agile coaching, leadership) structured on the site?
- [ ] **One scrolling Offers page** — three offer sections + the Friday model, single page. **(recommended)** — simplest static build, keeps the funnel one clear path, easiest to keep on-brand and fast.
- [ ] **Three dedicated service pages + an Offers hub** — more SEO surface and depth, but more to maintain and a longer path to the form.
- [ ] **Folded into the landing page** — no separate Offers page; offers + CTA live on the homepage.
- [ ] Other: 

### Q3: How transparent is pricing on the page?
- [ ] **Show 490 € net = gross prominently** — price stated up front as a feature of the brand (radical transparency = the punk/no-bullshit proof). **(recommended)** — pricing openness *is* the differentiator vs. "request a quote" consultants; pre-qualifies and builds trust before the form.
- [ ] **Price only at the booking/contact step** — keep the offer story first, reveal price when they commit.
- [ ] **No price shown** — "request a proposal," price discussed individually.
- [ ] Other: 

### Q4: How much does the booking form ask?
- [ ] **Minimal** — name, email, message only; lowest friction.
- [ ] **Minimal + light qualifiers** — name, email, company, role, and "what's the pain / what would a good Friday change?" **(recommended)** — gives Ralph enough to triage and personalize the manual confirmation, without the form feeling like a sales-qualification gate.
- [ ] **Full qualification** — adds budget, team size, timeline, preferred date(s).
- [ ] Other: 

### Q5: Which GDPR-friendly captcha, given "no third-party scripts / no cookies"?
- [ ] **Honeypot only** — invisible field, zero friction; no human-facing challenge.
- [ ] **Honeypot + a homegrown logic/math question** — e.g. a small static question rendered server-side at build. **(recommended)** — stays fully first-party (no Google reCAPTCHA, no cookies, no third-party request → preserves the no-cookie-banner promise) while adding a real bot speed bump.
- [ ] **Netlify's built-in reCAPTCHA** — easy, but loads Google scripts/cookies → conflicts with the no-third-party / no-banner principle.
- [ ] Other: 

### Q6: What does success look like after submitting?
- [ ] **Inline success state** — replace the form with a confirmation in place, no navigation. **(recommended)** — fastest feedback, works cleanly with static Astro + Netlify Forms, no extra page to maintain.
- [ ] **Dedicated `/danke` thank-you page** — clean URL, redirect after submit; easier to expand later (e.g. "what happens next" content).
- [ ] Other: 

## 5. Resolved Decisions

<!-- | D# | Question | Chosen | Produced | -->
_None yet — answer the questions above and re-run `/brainstorm Offers & Contact Funnel`._
