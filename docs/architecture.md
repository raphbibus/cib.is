# Architecture — cib.is

How the cib.is site is built and shipped. Read this (with
[coding-guidelines.md](coding-guidelines.md) and [voice-and-design.md](voice-and-design.md))
before refining or implementing any epic.

## Stack

| Concern | Choice | Notes |
| :------ | :----- | :---- |
| Generator | **Astro** `output: 'static'` | Prerendered HTML, zero JS by default. No SSR adapter. |
| Styling | **Tailwind CSS 4** via `@tailwindcss/vite` | No `tailwind.config.js`; brand tokens live in `src/styles/global.css` under `@theme`. |
| Fonts | Self-hosted **woff2** (latin subset) | Anton (poster display), IBM Plex Mono (mono/labels), Inter (body). `@font-face` + `<link rel=preload>`. Never a CDN (R2). |
| Images | **`astro:assets`** `<Image>` | Source files in `src/assets/img/`; optimized to `/_astro/*` at build. |
| Content | Typed TS module `src/content/landing.ts` | Astro Content Collections arrive with the blog (Epic 3). |
| Hosting | **Netlify** free tier | Git-based continuous deploy. See [deployment.md](deployment.md). |
| Tests | **Vitest** (pure logic) + **Playwright** (rendered output / e2e) | See [testing.md](testing.md). |

The whole site is **zero-JS by default**. The only JavaScript shipped is one small,
dependency-free inline `<script>` in `Layout.astro` that decodes the obfuscated `mailto:`
address on interaction — no bundle, no Astro island hydration (`client:*`).

## Folder / project structure

```
src/
  assets/fonts/      self-hosted latin-subset woff2 (2 weights/family)
  assets/img/        source images consumed by astro:assets
  styles/global.css  @import "tailwindcss"; @theme brand tokens; @font-face blocks
  lib/
    mailto.ts        encode()/decode() for the obfuscated address (pure, unit-tested)
    seo.ts           buildMeta() → title/description/OG/robots (pure, unit-tested)
  content/
    landing.ts       typed German landing copy (hero, sections[], cta)
  components/
    Layout.astro     <html>/<head> (via BaseHead) + Header + Footer + mailto decoder
    BaseHead.astro   <title>, meta, OG, robots, favicon, font preloads
    Header.astro     wordmark + in-page anchor nav
    Footer.astro     wordmark, copyright, obfuscated mailto, reserved legal slots
    Button.astro Section.astro Hero.astro Card.astro Prose.astro FormField.astro
    MailtoLink.astro renders the obfuscated CTA token (decoder lives in Layout)
  pages/
    index.astro      composes the landing page from the component library
public/              favicon.svg, favicon.ico, og-default.png (swappable placeholders)
scripts/
  generate-assets.mjs  regenerates og-default.png + favicon.ico (Playwright, no image deps)
docs/                architecture.md, coding-guidelines.md, deployment.md, testing.md
netlify.toml         build command, publish dir, X-Robots-Tag noindex header
```

Path alias: `@/*` → `src/*` (see `tsconfig.json` / `vitest.config.ts`).

## Build & deploy flow

1. `npm run build` → Astro prerenders `src/pages/**` to `dist/`, Tailwind compiles, fonts &
   images are hashed into `dist/_astro/`.
2. Push to `main` → Netlify runs `npm run build` (per `netlify.toml`) and publishes `dist/`
   to **ralphcibis.netlify.app**. PRs get deploy previews.
3. `npm run preview` serves `dist/` on port 4321 — this is what the Playwright e2e suite runs
   against.

**Indexing guard:** the site is `noindex,nofollow` everywhere until Epic 4 — enforced both by
`<meta name="robots">` (in `BaseHead.astro`) and the `X-Robots-Tag` header (in `netlify.toml`).
Both are removed together at go-public.

## Netlify Forms gotcha (static Astro) — relevant from Epic 2

Netlify detects forms **at build time from the static HTML**, so the `<form>` markup must be
present in the prerendered `dist/` output:

- Add `data-netlify="true"` + a unique `name` to a server-rendered (`.astro`) `<form>`; Netlify
  injects the hidden `form-name` input at build. Because Astro static pages prerender the form,
  the markup is already in `dist/` — **no `public/__forms.html` skeleton needed**.
- The `__forms.html` skeleton is only required for **JS-rendered** forms (React/Vue/SSR or a
  hydrated island) where the markup isn't in the static HTML.
- Add a honeypot field and a GDPR-friendly captcha for spam; success via `action="/thank-you"`.
- See [deployment.md](deployment.md) and the `netlify-forms` skill for full mechanics.
