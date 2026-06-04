# Tech Spec — Legal, Privacy & Launch Polish

> **Status:** Ready to build · **Confidence:** 92% · **Spec runs:** 2
> **Source PRD:** [prd.md](prd.md)
> **Guidelines:** docs/architecture.md, docs/coding-guidelines.md, docs/deployment.md, docs/testing.md

## 1. Overview

This epic adds the **legal pages**, the **launch-polish artifacts** (sitemap/robots, OG, 404), a
**provable privacy guarantee**, and the **go-public cutover** to the existing static Astro site. It
is mostly additive — new `src/pages/*.astro`, a typed `src/content/legal.ts` content module, a few
edits to existing files (`Footer.astro`, `seo.ts`, `netlify.toml`, `astro.config.mjs`,
`scripts/generate-assets.mjs`) — plus a reusable automated QA gate.

**Reconciliation notes vs. the PRD (important):**
- **Spam protection (R1) — RESOLVED (TD3):** keep **honeypot + the first-party math captcha**
  (`ContactForm.astro` + `src/lib/captcha.ts`). Both are first-party, same-origin, cookieless, so
  R1's intent (no third-party, no cookies, no banner) holds; R1 is read as "no *third-party* spam
  protection". No form changes needed — T11 proves the privacy guarantee still holds.
- **OG image (R10):** `public/og-default.png` already exists as a 1200×630 **PNG** referenced by
  `DEFAULT_OG_IMAGE` in `seo.ts` — so the WebP-won't-preview caveat is already avoided. The task is
  to regenerate that PNG from `placeholders/1.webp` (keep PNG output).
- **Go-public single removal point (R6):** noindex is enforced in **two** places that must flip
  together — the hard-wired `robots: 'noindex,nofollow'` in `src/lib/seo.ts` (surfaced via
  `BaseHead.astro`) and the `X-Robots-Tag` header in `netlify.toml`.
- **Canonical domain — RESOLVED (TD1):** the production canonical host is **`https://www.cib.is`**
  (the `www` subdomain is Netlify's configured primary, per Ralph — works better with their load
  balancer). `SITE_URL`/`astro.config.mjs` `site` switch to `https://www.cib.is`; the apex `cib.is`
  and `ralphcibis.netlify.app` 301-redirect to `www.cib.is` so canonical/OG/sitemap all resolve to a
  single host (no duplicate content).

## 2. Key Architecture Decisions

- **Legal copy lives in a typed content module** (`src/content/legal.ts`), mirroring
  `landing.ts`/`offers.ts` — no hard-coded German strings in `.astro` (coding-guidelines). Personal
  data (legal name, *ladungsfähige Anschrift*, USt-IdNr, Aufsichtsbehörde) are clearly-marked
  placeholders Ralph fills before go-live.
- **Legal pages reuse primitives** — `Layout` + `Prose` for readable long-form, `MailtoLink` for the
  obfuscated email — so they inherit a11y, fonts, header/footer, and the perf budget for free.
- **Privacy claim is a test, not prose** — R12 is implemented as a Playwright spec asserting zero
  cookies / zero storage writes / zero cross-origin requests across **every** route, extending the
  existing per-epic `no-third-party.spec.ts` pattern into a launch gate.
- **Indexing is context-driven, not hand-flipped (TD2)** — robots state derives from Netlify's
  `CONTEXT` env so production indexes while deploy previews stay `noindex`, removing the risk of a
  stray manual edit indexing a preview.

## 3. Design

### 3.1 Components / Modules / Pages
| Path | Kind | Purpose | Reqs |
| :--- | :--- | :--- | :--- |
| `src/content/legal.ts` | new module | typed Impressum + Datenschutz content (+ placeholders) | R2,R3,R5,R8 |
| `src/pages/impressum.astro` | new page | §5 DDG Impressum + USt-IdNr + §19 note + obfuscated email + phone (second channel) | R2,R3,R7 |
| `src/pages/datenschutz.astro` | new page | Datenschutzerklärung (Netlify/US, logs, form data, retention, rights) | R2,R5,R8 |
| `src/pages/404.astro` | new page | on-brand punk 404 with home/offers/mailto links | R11 |
| `src/components/Footer.astro` | edit | replace disabled legal slots with live `<a>` to /impressum + /datenschutz | R7 |
| `src/content/offers.ts` + `PriceTag.astro` | edit | §19 UStG no-VAT note on the 490 € offer | R3 |
| `scripts/generate-assets.mjs` | edit | regenerate `public/og-default.png` (1200×630 PNG) from `placeholders/1.webp` | R10 |
| `astro.config.mjs` | edit | add `@astrojs/sitemap`; set `site` to `https://www.cib.is` (TD1) | R9 |
| `public/robots.txt` | new | allow-all + sitemap reference (`https://www.cib.is/sitemap-index.xml`) | R9 |
| `src/lib/seo.ts` | edit | context-driven `robots` (TD2); `SITE_URL = https://www.cib.is` | R6 |
| `netlify.toml` | edit | condition `X-Robots-Tag` to non-prod contexts (TD2); 301 apex+netlify.app → `www.cib.is` | R6 |
| `docs/go-live-checklist.md` | new | gated cutover + rollback steps + sign-off | R6 |

### 3.2 Data model & contracts
`src/content/legal.ts` (illustrative shape):
```ts
export interface Impressum {
  name: string; address: string[];        // ladungsfähige Anschrift (placeholder)
  email: { user: string; domain: string }; // fed to MailtoLink (obfuscated)
  ustId: string;                            // USt-IdNr (placeholder)
  kleinunternehmerNote: string;             // §19 UStG line
  phone: string;                            // second quick-contact channel (R7, per IHK)
}
export interface Datenschutz {
  controller: string;
  sections: { heading: string; body: string[] }[]; // Netlify/US, logs, form, retention, rights
  retention: string;       // "...innerhalb eines Monats nach Abschluss..."
  rights: string[];        // Auskunft, Berichtigung, Löschung, ... Beschwerde b. Aufsichtsbehörde
  supervisoryAuthority: string; // placeholder
}
```
`buildMeta()` keeps its current contract; only the `robots` source and `SITE_URL` change.

### 3.3 External integrations / config
- **`@astrojs/sitemap`** (new dep) — generates `/sitemap-index.xml`; `filter` excludes `/danke`.
- **Netlify** — `netlify.toml` deploy-context headers + a 301 redirect (TD1); rely on Netlify's
  automatic `noindex` on non-production deploys as defence-in-depth (TD2).
- **DNS/HTTPS** — verify cib.is → Netlify + valid TLS as a checklist step (operational, no code).

## 4. Requirement → Implementation Traceability
| Item | Covered by tasks |
| :--- | :--- |
| R1 / AC1 | T11 (+ existing `no-third-party` e2e), TD3 |
| R2 / AC2 | T1, T2, T3, T5 |
| R3 / AC3 | T1, T2, T4 |
| R4 / AC4 | T11 |
| R5 / AC5 | T1, T3 |
| R6 / AC6 | T9, T10, T12, T13 |
| R7 / AC7 | T2, T5 |
| R8 / AC8 | T1, T3 |
| R9 / AC9 | T8 |
| R10 / AC10 | T7 |
| R11 / AC11 | T6 |
| R12 / AC12 | T11 |

## 5. TDD Implementation Plan
Order: content/data → pages → polish → cutover → QA gate. Each task is test-first.

### T1 — Legal content module  (R2, R3, R5, R8)
1. **Failing test** `tests/legal-content.test.ts`: import `src/content/legal.ts`; assert Impressum has name/address/email/`ustId`/`kleinunternehmerNote`; Datenschutz has a Netlify section, retention text containing "Monat", a rights list including "Aufsichtsbehörde".
2. **Implement** the typed module with real structure + clearly-marked placeholders.
3. **Refactor** shared types into the module; no copy in `.astro`.

### T2 — Impressum page  (R2, R3, R7 / AC2, AC3, AC7)
1. **Failing e2e** `e2e/legal-privacy-launch-polish/impressum.spec.ts`: `/impressum` 200s; contains the §5 fields, the USt-IdNr, the §19 UStG note, a `MailtoLink` (no raw `mailto:` literal in HTML), and a phone number as the second quick-contact channel (per IHK — §5 DDG requires a means of fast direct contact; the booking-form link was replaced by phone).
2. **Implement** `src/pages/impressum.astro` via `Layout` + `Prose`, sourced from `legal.ts`.

### T3 — Datenschutz page  (R2, R5, R8 / AC2, AC5, AC8)
1. **Failing e2e** `datenschutz.spec.ts`: `/datenschutz` 200s; names Netlify as host + Forms processor; mentions IP/server logs + form submissions; states Art. 6 legal bases; references DPA + SCCs / US transfer; states "innerhalb eines Monats nach Abschluss" retention; lists rights incl. Beschwerde bei der Aufsichtsbehörde; shows a contact email.
2. **Implement** `src/pages/datenschutz.astro` from `legal.ts`.

### T4 — §19 UStG price note  (R3 / AC3)
1. **Failing test** (extend `tests/offers-content.test.ts` or e2e): the 490 € offer renders "Gemäß §19 UStG wird keine Umsatzsteuer berechnet"; no "zzgl. USt"/VAT line appears anywhere.
2. **Implement** the note in `offers.ts` and render via `PriceTag.astro`/`angebot.astro`.

### T5 — Live footer legal links  (R7 / AC2)
1. **Failing e2e** `footer-legal.spec.ts`: on `/`, `/angebot`, a blog post, and `/404`, the footer has `<a href="/impressum">` and `<a href="/datenschutz">`; no `aria-disabled` legal slot remains.
2. **Implement** swap the disabled `<span data-legal-slot>` for real anchors in `Footer.astro`.

### T6 — Punk 404 page  (R11 / AC11)
1. **Failing e2e** `404.spec.ts`: an unknown URL returns 404; page has brand heading + links to `/`, `/angebot`, and a `mailto`; footer legal links present.
2. **Implement** `src/pages/404.astro` via `Layout`.

### T7 — OG image from 1.webp  (R10 / AC10)
1. **Failing test** (extend `tests/assets.test.ts`): `public/og-default.png` exists, is PNG, **1200×630**.
2. **Implement** extend `scripts/generate-assets.mjs` to render `og-default.png` from
   `placeholders/1.webp` at 1200×630 (output stays PNG; `DEFAULT_OG_IMAGE` unchanged).

### T8 — Sitemap & robots  (R9 / AC9)  · TD4 → `@astrojs/sitemap` + static `robots.txt`
1. **Failing test/e2e** `robots-sitemap.spec.ts`: built output has `sitemap-index.xml` (excludes `/danke`); `/robots.txt` allows all and references `https://www.cib.is/sitemap-index.xml`.
2. **Implement** add `@astrojs/sitemap` to `astro.config.mjs` with a `filter` dropping `/danke`; add `public/robots.txt` (`User-agent: *` / `Allow: /` / `Sitemap: https://www.cib.is/sitemap-index.xml`).

### T9 — Context-driven indexing  (R6 / AC6)  · TD2
1. **Failing test** (extend `tests/seo.test.ts` + `tests/netlify-config.test.ts`): with `CONTEXT=production`, `buildMeta().robots` is index-able (`index,follow`) and `netlify.toml` emits no `X-Robots-Tag: noindex`; with a non-production context, `noindex` persists in both the meta and the header.
2. **Implement** drive `seo.ts` `robots` from `process.env.CONTEXT === 'production'`; scope the `X-Robots-Tag` header to non-production deploy contexts in `netlify.toml` (rely on Netlify's automatic preview-noindex as defence-in-depth).

### T10 — Production domain & canonical  (R6, SEO)  · TD1 → `https://www.cib.is`
1. **Failing test** (extend `tests/seo.test.ts` + `tests/netlify-config.test.ts`): `SITE_URL === 'https://www.cib.is'`; canonical/OG resolve to `www.cib.is`; a 301 redirect from the apex `cib.is` **and** `ralphcibis.netlify.app` → `https://www.cib.is` is configured.
2. **Implement** set `astro.config.mjs` `site: 'https://www.cib.is'`, update `SITE_URL`, add the redirects in `netlify.toml` (`force = true`).

### T11 — Provable privacy QA gate  (R1, R4, R12 / AC1, AC4, AC12)
1. **Failing e2e** `no-cookies-no-third-party.spec.ts`: for each route (`/`, `/angebot`,
   `/impressum`, `/datenschutz`, `/blog`, one post, `/danke`, `/404`): assert `document.cookie === ''`,
   `localStorage.length === 0` and `sessionStorage.length === 0` after load, and every network
   request is same-origin; assert no analytics/beacon requests anywhere.
2. **Implement** make it pass (it should, given the architecture); wire it into the go-live gate.

### T12 — Go-live checklist & rollback  (R6 / AC6)
1. Write `docs/go-live-checklist.md`: gates (legal pages live + footer-linked, Lighthouse ≥ 95,
   a11y pass, cross-browser/responsive QA, T11 green, Ralph sign-off) → remove noindex in a
   dedicated deploy → verify → **rollback = redeploy prior commit / re-add noindex**.

### T13 — Final QA pass  (R6, perf/a11y ACs)
1. Run `npm run lighthouse` (expect SEO back to 100 once noindex is gone), full Playwright suite,
   and a manual cross-browser/responsive sweep at 375 px. Record results against the checklist.

## 6. Testing Strategy
- **Vitest** (`tests/`): pure logic + content shape — `legal-content`, `offers-content`, `seo`,
  `netlify-config`, `assets`.
- **Playwright e2e** (`e2e/legal-privacy-launch-polish/`): page content, footer links, 404,
  robots/sitemap, and the privacy gate (T11).
- **Lighthouse**: the ≥ 95 gate (`npm run lighthouse`), expected to restore SEO=100 post-noindex.
- **Click-through**: `verify-epic` Playwright MCP pass over the legal pages, 404, and footer links.
- ACs map 1:1 to the tasks above (see §4); the privacy ACs (AC1/AC4/AC12) are one reusable spec.

## 7. Risks & Non-functional
- **Legal correctness depends on real content** — placeholder personal data must be replaced before
  go-live; the spec builds the structure, Ralph supplies the facts (deferred in PRD).
- **noindex flip is irreversible-ish** — mitigated by context-driven robots (TD2) + a single
  dedicated deploy + redeploy rollback (T12).
- **Duplicate content** if both cib.is and netlify.app stay indexable — handled by TD1's redirect.
- **a11y/contrast** — legal pages are text-heavy; reuse `Prose` (already AA) and keep the focus ring.
- **Perf** — pages are static, zero-JS; no new runtime requests; OG PNG is build-time only.
- **GDPR** — Netlify US transfer disclosed (R5); no cookies/no tracking proven by T11.

## 8. Open Tech Decisions

**✅ Ready to build.** All high-impact decisions (TD1, TD2) and the routine ones (TD3, TD4) are
resolved (see §9). Every R#/AC# maps to a task in §4. The TDD plan in §5 is the build order.

### Deferred (non-blocking)
- **Real legal content** — Ralph supplies legal name, *ladungsfähige Anschrift*, USt-IdNr,
  Aufsichtsbehörde, and contact email; tasks T1–T3 ship the structure with marked placeholders.
- **DNS/HTTPS verification** — confirm apex `cib.is` + `www.cib.is` resolve to Netlify with valid
  TLS as a go-live checklist step (T12); Ralph notes Netlify domains are already configured.

## 9. Resolved Tech Decisions

| TD# | Chosen | Changed |
|----|--------|---------|
| TD1 | Canonical = **`https://www.cib.is`**; 301 apex + netlify.app → www | Overview, §3 table, T10; `SITE_URL`/`site`/redirects |
| TD2 | Context-driven robots via Netlify `CONTEXT` (prod indexes, previews noindex) | §2 arch decision, T9; `seo.ts` + `netlify.toml` contexts |
| TD3 | Keep honeypot **+** first-party math captcha; R1 read as "no third-party" | Overview reconciliation, R1/AC1 trace; no form changes |
| TD4 | `@astrojs/sitemap` + static `public/robots.txt` | T8; new dep + robots file |
