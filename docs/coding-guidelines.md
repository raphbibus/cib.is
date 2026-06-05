# Coding Guidelines — cib.is

Conventions for building cib.is. Read with [architecture.md](architecture.md) and
[voice-and-design.md](voice-and-design.md) (the living voice + design guide — read at the start of
every refinement).

## Component patterns

- **Compose from the primitives library** (`src/components/`) — never inline one-off markup for
  something a primitive already covers (R5/AC4). Primitives: `Layout`, `Header`, `Footer`,
  `Button`, `Section`, `Hero`, `Card`, `Prose`, `FormField`, `MailtoLink`.
- Every component takes a **typed `Props` interface** in its frontmatter. Accept a `class` prop
  and merge it last so callers can extend styling.
- `Section` owns the anchor `id` and `scroll-mt` — in-page nav targets come from there.
- **No raw hex colours or font names in markup** — use the `@theme` tokens (`bg-ink`,
  `text-paper`, `text-muted`, `text-neon-green`, `text-gradient`, `font-display`, `font-mono`,
  `font-body`) so a rebrand is one edit.

## Visual system — dark band/merch poster

The site is a **dark-first, band-merch / tour-poster** aesthetic (think Architects / BMTH / Linkin
Park merch sites), leaning into the music identity (Thomann):
- **Surfaces:** near-black `--color-ink` stage, bone `--color-paper` text, raised `--color-surface`
  panels, dim `--color-line` hairlines, faint film-grain overlay (`body::after`).
- **Type:** `Anton` (heavy condensed, uppercase) for poster headlines, `IBM Plex Mono` for
  labels/passes/meta, `Inter` for body. Headlines use `clamp()` so the longest word never overflows
  the mobile viewport — verify at 375px (the e2e overflow test guards this).
- **Neon accent (pink→green gradient):** the contrast contract is strict — neon is **text only on
  the dark surface** (pink 5.7:1, green 14.5:1 on ink), a **fill with ink text on top** (ink-on-neon
  ≥ 5.7:1, e.g. the CTA button and the inverted Haltung block), a **focus ring** (≥ 3:1), or
  **decorative graphics** (marquee `◆`, equalizer bars, the wordmark dot). Never neon text on a
  light fill. Dim `--color-ghost` (tracklist numerals) meets the 3:1 large-text minimum.
- **Music motifs:** the `eq` equalizer bars, the CV rendered as a numbered **tracklist** (`Card`
  with a `track` prop), and the **backstage-pass / ticket** CTA (`.perforation`). All animation is
  CSS-only and pauses under `prefers-reduced-motion`.
- **Zero-JS by default.** Do not add `client:*` directives or a JS bundle. The only allowed
  script is the single inline mailto decoder in `Layout.astro`. If you think you need JS, ask
  whether the static approach works first.

## Naming

- Components: `PascalCase.astro`. Library modules: `camelCase.ts` in `src/lib/`.
- Anchor ids and `data-*` hooks: `kebab-case` (`#story`, `#kontakt`, `data-legal-slot`).
- Theme tokens: semantic, not literal — `--color-accent`, not `--color-red`.
- Import via the `@/*` alias, not long relative paths.

## Accessibility (a11y)

- Semantic HTML and landmarks: one `<main>`, `<header>`/`<nav>`/`<footer>`, real headings in order.
- **Keyboard-reachable** with a **visible focus ring** — the global `:focus-visible` outline (accent,
  3px) must survive the brutalist aesthetic; don't remove outlines.
- A skip-link to `#main` is provided in `Layout`.
- **WCAG AA contrast (≥ 4.5:1 for text):** ink-on-paper is 17.45:1, accent-on-paper 5.22:1. Any new
  colour pairing used for text must be checked (see `tests/global-css.test.ts`).
- Every image needs a meaningful `alt`; the `lang` is `de`.

## Performance budget

- **Lighthouse ≥ 95** in all four categories (Performance / Accessibility / Best-Practices / SEO).
- **Zero third-party / CDN requests at runtime** — fonts and all assets are same-origin.
- Images go through `astro:assets` with a fixed aspect-ratio wrapper (no CLS); the LCP image is
  `loading="eager" fetchpriority="high"`, everything below the fold is lazy.
- **Preload only the two above-the-fold font faces** (Anton, Inter 400); `font-display: swap`.
- No render-blocking JS bundle. Keep the inline mailto script to a few lines.
- The page CSS is **inlined** (`build.inlineStylesheets: 'always'`) to drop the render-blocking
  stylesheet request.

**Lighthouse gate:** run `npm run preview` then `npm run lighthouse`. Current scores:
Performance 99 · Accessibility 100 · Best-Practices 100. **SEO reports 66 by design** — the only
failing audit is `is-crawlable`, because the site is deliberately `noindex,nofollow` until Epic 4
(R11/AC9). Excluding that one audit, SEO is 100; it returns to 100 automatically at go-public when
the noindex guard is removed.

## Content authoring rules

- German copy lives in the typed module `src/content/landing.ts` (`{ hero, sections[], cta }`).
  Edit copy there — never hard-code strings in `.astro`.
- Voice: **punk as bait, credibility as the close** — edgy hook first, then CV-traceable proof.
  Claims must trace to `specs/2026-cv-de-ralph.pdf` + `specs/foundation-landing-page/infos-ralph/`.
- No lorem-ipsum in shipped sections. German only. Ralph does an editorial pass before Epic 4.

## Swapping placeholder assets

- **Images:** replace the file in `src/assets/img/` (keep the name or update the import in
  `index.astro`). The aspect-ratio wrapper keeps layout intact.
- **Favicon / OG:** edit `public/favicon.svg`, then re-run `node scripts/generate-assets.mjs` to
  regenerate `public/favicon.ico` + `public/og-default.png`. The OG path is referenced once via
  `DEFAULT_OG_IMAGE` in `src/lib/seo.ts`.

## Fonts — acquisition & subset (R2/A3)

The committed woff2 files are **latin-subset, 2 weights per family**, sourced from the upstream OFL
fonts (Anton, IBM Plex Mono, Inter) via Fontsource's pre-subset latin builds. They are
self-hosted under `src/assets/fonts/` and served same-origin — **never** loaded from a CDN at
runtime. To add a weight: drop the subset woff2 in, add an `@font-face` block in `global.css`, and
only add a `preload` if the face is above the fold.
