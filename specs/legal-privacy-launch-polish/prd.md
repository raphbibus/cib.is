# Epic PRD — Legal, Privacy & Launch Polish

> **Status:** Ready · **Confidence:** 90% · **Brainstorm runs:** 3
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
banner." Confirmed achievable: spam protection is **honeypot-only** (Q1) and there is **no
analytics** (Q4), so the claim holds — provided QA proves zero client-side storage and third-party
requests. The one unavoidable processor is **Netlify Inc. (US)**: even with zero client JS, server
logs (IPs) and form submissions are processed in the US, so the Datenschutzerklärung must disclose
this with DPA + SCCs (Q5).

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

<!-- R1 -->
- **R1 — Honeypot-only spam protection.** The contact/booking form uses a honeypot field only; no
  third-party captcha, no cookies, and no client-side third-party requests are introduced. This
  underpins the no-cookie-banner claim. *(from Q1)*
- **R2 — Hand-authored legal pages.** Impressum and Datenschutzerklärung are written from scratch
  against §5 DDG and DSGVO checklists, tailored to the actual stack (Netlify hosting + Forms, no
  tracking). Ralph reviews and approves final wording before go-live. *(from Q2)*
- **R3 — Kleinunternehmer status surfaced correctly.** The Impressum reflects §19 UStG
  (Kleinunternehmer) status and additionally lists Ralph's USt-IdNr (supplied manually). Offer/price
  copy carries the note "Gemäß §19 UStG wird keine Umsatzsteuer berechnet"; no separate VAT line is
  shown. *(from Q3)*
- **R4 — Zero analytics / zero tracking.** No analytics, beacons, or tracking scripts of any kind in
  the production build. Funnel success is measured solely by booking requests arriving via Netlify
  Forms / email. *(from Q4)*
- **R5 — Netlify US-transfer disclosure.** The Datenschutzerklärung names Netlify as hosting + Forms
  processor, lists the processed data (IP/server logs, form submissions), states the legal bases
  (Art. 6 DSGVO), and references Netlify's DPA + EU Standard Contractual Clauses for the US transfer.
  *(from Q5)*
- **R6 — Hard-gated go-live.** `noindex` is removed only in a single dedicated deploy, gated on ALL
  of: legal pages live + footer-linked, Lighthouse ≥ 95, accessibility pass, cross-browser/responsive
  QA, and Ralph's final sign-off. Rollback is a single redeploy of the prior commit / re-adding
  `noindex`. *(from Q6)*
- **R7 — Two-channel quick contact.** The Impressum provides an obfuscated email address **and** a
  link to the contact form as the second fast-contact channel (phone kept private). *(from Q7)*
- **R8 — Stated retention + data-subject rights.** The Datenschutzerklärung states a concrete
  retention rule — **booking enquiries are deleted within one month after the enquiry is closed** —
  lists the data-subject rights (Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch,
  Datenübertragbarkeit, Beschwerde bei der Aufsichtsbehörde), and names Ralph's email as the contact
  for exercising them. *(from Q8)*
- **R9 — Sitemap & robots via Astro.** `@astrojs/sitemap` generates the sitemap; `robots.txt` allows
  all crawlers and references the sitemap. Both are effective at go-live; preview stays uncrawlable
  via `noindex`. *(from Q9)*
- **R10 — Site-wide static OG image + per-page meta.** One hand-designed static OG image is used
  site-wide (`og:image` + `twitter:image`), with per-page `og:title`/`og:description`. Source asset
  is `1.webp`. **⚠ Format caveat:** major social scrapers (Facebook, LinkedIn, WhatsApp, X) do not
  reliably render WebP `og:image`; a PNG/JPEG export is required for previews to work — see Deferred.
  *(from Q10)*
- **R11 — On-brand punk 404.** A custom 404 page with edgy brand copy/styling and clear links back to
  home, offers, and a mailto, served by Netlify for unknown URLs. *(from Q11)*
- **R12 — Automated no-cookie/no-third-party QA gate.** An automated check loads every route headless
  and asserts: `document.cookie` empty, no `localStorage`/`sessionStorage` writes, and zero non-cib.is
  network requests. It is part of the go-live gate and reusable on future deploys. *(from Q12)*

## 3. Acceptance Criteria

<!-- AC1 -->
- **AC1 →R1.** On the contact page, the browser network tab shows zero third-party requests, no
  cookies are set, and no consent banner appears; the form still rejects honeypot-filled submissions.
- **AC2 →R2.** Impressum contains all §5 DDG mandatory fields; Datenschutzerklärung contains all
  DSGVO-required disclosures; Ralph's sign-off is recorded before `noindex` removal.
- **AC3 →R3.** Impressum displays the USt-IdNr; the 490 € offer shows the §19 UStG no-VAT note; no
  VAT/USt line item appears anywhere.
- **AC4 →R4.** Production build contains no analytics/tracking scripts; network tab confirms no
  analytics or beacon requests on any page.
- **AC5 →R5.** The Datenschutzerklärung includes a Netlify section naming data categories, legal
  bases, and the US-transfer safeguard (DPA/SCCs).
- **AC6 →R6.** A documented go-live checklist exists; `noindex` is removed in its own deploy only
  after every gate passes; reverting to non-indexed is a single redeploy.
- **AC7 →R7.** The Impressum shows an obfuscated email and a working link to the contact form; both
  are reachable and together satisfy the two-channel expectation.
- **AC8 →R8.** The Datenschutzerklärung states the one-month-after-closing retention rule, lists all
  data-subject rights including Beschwerde bei der Aufsichtsbehörde, and gives a contact email.
- **AC9 →R9.** In production, the Astro-generated sitemap and `/robots.txt` are served; robots allows
  crawling and points to the sitemap; the preview environment remains `noindex`.
- **AC10 →R10.** Every page emits `og:image`, `twitter:image`, `og:title`, and `og:description`; the
  image renders correctly in a link-preview validator (in a social-supported raster format).
- **AC11 →R11.** Visiting an unknown URL returns the styled punk 404 with working links to home,
  offers, and a mailto.
- **AC12 →R12.** The automated check passes on all routes before go-live; a failure (any cookie,
  storage write, or third-party request) blocks `noindex` removal.

## 4. Open Questions

**✅ Ready to build.** All blocking decisions are resolved (D1–D12) and every Requirement (R1–R12)
maps to a verifiable Acceptance Criterion (AC1–AC12). No open questions block implementation.

### Deferred (non-blocking)
These don't block the build but need a quick input/decision during implementation:

- **OG image format (from R10/Q10).** ⚠ **A WebP `og:image` will not preview on most platforms**
  (Facebook, LinkedIn, WhatsApp, X expect JPEG/PNG). Recommended: export `1.webp` to a **1200×630
  PNG or JPEG** and point `og:image` at that. *Ralph asked to be informed — this is the heads-up.*
- **Real Impressum/Datenschutz content (content, not a decision).** Before final pages can ship,
  Ralph supplies: legal name, *ladungsfähige Anschrift* (no PO box), USt-IdNr, contact email, and
  the responsible *Aufsichtsbehörde* for the privacy "Beschwerderecht" line.
- **DNS/HTTPS confirmation.** Verify cib.is DNS points to Netlify and the TLS cert is valid as part
  of the go-live checklist (R6) — operational step, no decision needed.

## 5. Resolved Decisions

| D# | Question | Chosen | Produced |
|----|----------|--------|----------|
| D1 | Q1 — Form spam protection | Honeypot only (no third-party captcha) | R1, AC1 |
| D2 | Q2 — Legal text authorship | Hand-written by Claude + Ralph against §5 DDG / DSGVO, Ralph approves | R2, AC2 |
| D3 | Q3 — VAT status & display | Kleinunternehmer §19 UStG **+ USt-IdNr listed manually**; no-VAT note on prices | R3, AC3 |
| D4 | Q4 — Post-launch measurement | Pure: no analytics; success = booking requests in inbox | R4, AC4 |
| D5 | Q5 — Netlify US transfer | Disclose Netlify hosting + Forms, data + legal bases, DPA + SCCs | R5, AC5 |
| D6 | Q6 — Go-live cutover | Hard gate; `noindex` removed in a dedicated deploy; redeploy rollback | R6, AC6 |
| D7 | Q7 — Impressum quick contact | Obfuscated email + contact form as second channel | R7, AC7 |
| D8 | Q8 — Retention & rights | Delete enquiries within 1 month of closing + full rights list + email contact | R8, AC8 |
| D9 | Q9 — Sitemap & robots | `@astrojs/sitemap` + allow-all `robots.txt`, effective at go-live | R9, AC9 |
| D10 | Q10 — OG image | Single static site-wide OG image (source `1.webp`) + per-page meta | R10, AC10 |
| D11 | Q11 — 404 page | On-brand punk 404 with links to home, offers, mailto | R11, AC11 |
| D12 | Q12 — Prove no-cookie claim | Automated headless QA: no cookies/storage/third-party, blocks go-live on fail | R12, AC12 |
