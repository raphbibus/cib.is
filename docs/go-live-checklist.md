# Go-Live Checklist — cib.is

> **Status: LIVE — went public 2026-06-05.** The site is indexed; the go-public deploy flipped
> the default robots state to `index,follow` (commit "Go public: index the live site"). The
> gates below remain the record of what was verified before launch, and §2/§3 are kept as the
> cutover/rollback runbook. To take the site **back** to non-indexed, see §3.

Going public was **not a manual flag flip** on the live page: it was the first production deploy
made *after* every gate below passed, plus the one-time change of the robots default
(see [`src/lib/seo.ts`](../src/lib/seo.ts) — `robotsForContext`). This document is the gate (R6/AC6).

> **Indexing model (TD2, post-go-public).** `robots` is derived from `process.env.CONTEXT` at
> build time. `production` **and** local/unset builds → `index,follow`; only **deploy-preview**
> and **branch-deploy** → `noindex,nofollow`, so work-in-progress URLs never leak into search.
> Netlify additionally adds an automatic `X-Robots-Tag: noindex` to those non-production deploy
> subdomains as defence-in-depth. There is **no** unconditional noindex header in
> `netlify.toml`, so the production site is crawlable.

## 1. Hard gates — ALL must pass before the production deploy

- [ ] **Real legal content shipped.** Placeholders in [`src/content/legal.ts`](../src/content/legal.ts)
      replaced with the real values: legal name, *ladungsfähige Anschrift* (no PO box),
      USt-IdNr, contact email, and the responsible *Aufsichtsbehörde*.
- [ ] **Legal pages live + footer-linked.** `/impressum` and `/datenschutz` reachable and
      linked from the footer on **every** page (home, /angebot, blog post, 404).
- [ ] **Datenschutz matches reality.** Netlify (US) hosting + Forms disclosed, Art. 6 legal
      bases, DPA + EU SCCs, one-month-after-closing retention, full data-subject rights.
- [ ] **Privacy gate green.** `npx playwright test e2e/legal-privacy-launch-polish/no-cookies-no-third-party.spec.ts`
      passes on every route — zero cookies, zero storage writes, zero third-party/analytics
      requests. **A failure here blocks go-live** (AC12).
- [ ] **Lighthouse ≥ 95** in all four categories. Run `npm run preview` then `npm run lighthouse`.
      SEO returns to 100 once production indexing is on (the `is-crawlable` audit passes).
- [ ] **Accessibility pass.** WCAG AA: keyboard reachable, visible focus ring, headings in
      order, contrast holds. Verify legal pages (text-heavy) at 375 px — no overflow.
- [ ] **Cross-browser / responsive QA.** Spot-check Chrome, Firefox, Safari at 375 px and
      desktop. Legal pages, 404, footer links, OG preview.
- [ ] **Full automated suite green.** `npm test` (Vitest) and `npx playwright test` (e2e).
- [ ] **OG preview valid.** `public/og-default.png` is a 1200×630 PNG; validate the link
      preview in a social validator (PNG is required — WebP won't render on most platforms).
- [ ] **DNS / HTTPS verified.** `cib.is` and `www.cib.is` resolve to Netlify with a valid TLS
      cert; the apex and `ralphcibis.netlify.app` 301-redirect to `https://www.cib.is`
      (see [`netlify.toml`](../netlify.toml)).
- [ ] **Ralph's final sign-off recorded.** Name + date below before the production deploy.

  Sign-off: ____________________  Date: ____________

## 2. Cutover (dedicated deploy)

1. Confirm the working tree is the exact reviewed commit (no drift).
2. Deploy to the **production** context (push to `main`). The robots default is now `index,follow`
   (go-public change), and the production `CONTEXT` keeps the baked `<meta robots>` at
   `index,follow` while Netlify drops its automatic preview-noindex.
3. Verify on the live `https://www.cib.is`:
   - `view-source` shows `<meta name="robots" content="index,follow">`.
   - Response headers contain **no** `X-Robots-Tag: noindex`.
   - `https://www.cib.is/robots.txt` allows all and references `/sitemap-index.xml`.
   - `https://www.cib.is/sitemap-index.xml` resolves and excludes `/danke`.
   - The apex `https://cib.is` and `https://ralphcibis.netlify.app` 301 → `https://www.cib.is`.
4. (Optional) Submit the sitemap in Google Search Console.

## 3. Rollback

Going back to non-indexed is a **single redeploy**:

- **Fast path:** in the Netlify UI, *Deploys → redeploy the prior commit* (or "Publish deploy"
  on the last known-good build). The previous build's baked meta + Netlify behaviour restore
  the prior state.
- **Belt-and-braces:** revert the go-live commit (or temporarily force `noindex` by setting the
  robots default) and redeploy. Because indexing is context-driven, no hand-edited header has to
  be hunted down.

There is no destructive, irreversible step — the noindex flip is just which commit is the
current production deploy.
