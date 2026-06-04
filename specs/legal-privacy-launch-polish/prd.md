# Epic PRD — Legal, Privacy & Launch Polish

> **Status:** Drafting · **Confidence:** 30% · **Brainstorm runs:** 1
> **Source:** [Roadmap](../roadmap.md)

## 1. Context

The final epic of the **cib.is** portfolio + soft-sales-funnel site (Ralph as organizational
engineer / agile punk / part-time consultant, funneling German KMU leadership toward a 490 €
consulting Friday). Its job is to make the site **legally launchable under German law** and
**production-ready**, then take it public.

Despite the roadmap label "Launch Polish", this is the **highest-legal-risk epic**: everything
prior was a `noindex` preview nobody can act against. Here the site becomes a public, commercial
(*geschäftsmäßig* — Ralph charges money) German web presence, so **§5 DDG/TMG** applies in full and
a missing/incorrect Impressum or a Datenschutzerklärung that doesn't match reality is direct
*Abmahnung* (cease-and-desist) exposure. The legal pages **are the deliverable**, not garnish.

**The load-bearing brand claim:** "no tracking, no cookies, no third-party scripts → no cookie
banner." It is on-brand and authentic — but it is currently *assumed*, not *verified*. Two known
risk points: (a) the spam protection chosen in Epic 2 (Netlify's built-in captcha is Google
reCAPTCHA → third-party, cookies, US tracking → would kill the no-banner claim), and (b) Netlify
Inc. is a **US company**, so even with zero client JS, server logs (IPs = personal data) imply an
international data transfer the Datenschutzerklärung must actually address.

**Scope (from roadmap):**
- Impressum (§5 DDG/TMG), content provided at refinement
- Datenschutzerklärung reflecting the no-tracking/no-cookies reality + Netlify hosting & Forms
- Site-wide footer links to Impressum + Privacy
- Launch polish: SEO/sitemap/robots, OG images, 404 page, accessibility pass, Lighthouse ≥ 95, cross-browser & responsive QA
- Go public: remove `noindex`, confirm cib.is DNS/HTTPS, final production deploy

**Locked decisions (from roadmap):** Astro static, Tailwind 4, self-hosted fonts, Netlify free tier
+ cib.is domain, Netlify Forms (request-only Friday booking), German only, no tracking/cookies/banner,
Lighthouse ≥ 95, WCAG AA, semantic/keyboard-accessible HTML.

**Browser-verifiable (definition of done):** Impressum + Privacy reachable from every page's footer;
sitemap/robots served; 404 works; Lighthouse ≥ 95; site live and indexable on cib.is.

## 2. Requirements
<!-- Empty until decisions are reconciled. -->

## 3. Acceptance Criteria
<!-- Empty until decisions are reconciled. -->

## 4. Open Questions
> How to answer: change `[ ]` to `[x]` on **one** option per question, or fill its `Other:` line.
> Don't delete a question — it moves to "Resolved Decisions" automatically on the next run.
> The `**(recommended)**` label is a suggestion only; nothing is pre-selected.

### Q1: What spam protection is actually on the contact form right now (Epic 2)?
This single answer decides whether Epic 4 is a clean checklist or a privacy-story rescue mission — it determines whether the "no cookie banner" claim survives.
- [ ] Honeypot only — zero third-party, no cookies; banner claim holds cleanly **(recommended)** — preserves the brand's entire privacy story and matches the roadmap's no-third-party principle
- [ ] Netlify's built-in captcha (Google reCAPTCHA) — third-party + cookies + US tracking → no-banner claim is dead; would need rip-out or a consent banner
- [ ] A privacy-respecting captcha (Friendly Captcha / Altcha / hCaptcha) — keeps spam down but adds a third-party request to disclose & assess
- [ ] Unsure — needs verification in the deployed Epic 2 build before this epic can proceed
- [ ] Other: 

### Q2: Who authors the Impressum & Datenschutzerklärung text, and who carries the liability?
German legal pages must be *correct*, not just present — wrong content is itself actionable.
- [ ] Generator (e.g. e-recht24 / Dr. Datenschutz template) adapted to our exact stack, reviewed by Ralph **(recommended)** — pragmatic, free/cheap, good enough for a single-person consulting site if tailored to the real data flows (Netlify, Forms, no tracking)
- [ ] Hand-written from scratch by Claude + Ralph against §5 DDG and DSGVO checklists — maximum fit to reality, but Ralph owns all liability with no template safety net
- [ ] Reviewed/produced by a lawyer (Fachanwalt IT-Recht) — lowest legal risk, but cost + time before launch
- [ ] Other: 

### Q3: What is Ralph's tax/VAT status, and how must it show on the site?
The "490 € net = gross" detail strongly implies Kleinunternehmer (§19 UStG) — which has Impressum and price-display consequences.
- [ ] Kleinunternehmer §19 UStG — no VAT; Impressum omits USt-IdNr, and prices carry a "gemäß §19 UStG keine Umsatzsteuer" note **(recommended)** — consistent with "490 € net = gross" and a part-time consultant
- [ ] VAT-registered with USt-IdNr — Impressum must list the USt-IdNr; prices shown incl./excl. USt explicitly
- [ ] Not yet decided / not yet registered — blocks correct Impressum wording
- [ ] Other: 

### Q4: How will Ralph know the funnel works after launch, given no tracking?
Going public with zero analytics means flying blind on the one thing the site exists for — conversions. Worth resolving deliberately, not by omission.
- [ ] Pure: no analytics at all; success measured only by booking requests landing in the inbox **(recommended)** — maximal brand integrity; for a low-volume consulting funnel, "did a request come in?" may be the only metric that matters
- [ ] Privacy-respecting, cookieless analytics (Plausible / GoatCounter, self-hosted or EU) — lightweight insight into traffic/sources; adds one third-party to disclose (script or proxied), softening the "no third-party" purity
- [ ] Server-side only (Netlify Analytics, log-based, no client JS, no cookies) — keeps the page clean and banner-free; paid add-on (~$9/mo), coarse data
- [ ] Other: 

### Q5: How does the Datenschutzerklärung handle Netlify being a US company?
Even with zero client JS, Netlify processes IPs/logs in the US → international transfer under DSGVO.
- [ ] Disclose Netlify as hosting + Forms processor, cite the Netlify DPA + EU Standard Contractual Clauses, name the data (IP/server logs, form submissions) and legal bases **(recommended)** — honest, standard, and keeps the free-tier stack
- [ ] Same disclosure but also add a DPA/AVV reference for Netlify Forms specifically (form data is more sensitive than logs)
- [ ] Re-evaluate hosting and move to an EU provider to avoid the transfer entirely — cleanest legally, but reopens a locked roadmap decision and delays launch
- [ ] Other: 

### Q6: How is the go-live cutover gated and reversed if something's wrong?
Removing `noindex` is the point of no easy return — once indexed, liability is live.
- [ ] Hard gate: legal pages live + linked, Lighthouse/a11y/QA all green, and a final manual review pass must ALL pass before `noindex` is removed in a single dedicated deploy; rollback = redeploy previous commit / re-add `noindex` **(recommended)** — makes the irreversible step explicit and auditable
- [ ] Remove `noindex` together with the legal-pages deploy (one shipment) — fewer steps, but couples legal correctness and public exposure into one risky move
- [ ] Soft launch: go indexable but submit no sitemap to Search Console for a grace period to catch issues — slower discovery, gentler blast radius
- [ ] Other: 

## 5. Resolved Decisions
<!-- | D# | Question | Chosen | Produced | -->
