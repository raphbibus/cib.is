# Deployment (Netlify)

cib.is is a **static Astro site** on **Netlify free tier**, custom domain **cib.is**.
See [the roadmap](../specs/roadmap.md) for the hosting decisions.

## Netlify agent tooling (installed — source of truth)

Netlify's official agent skills are installed in `.claude/skills/` (via `netlify.ai`'s
`netlify/context-and-tools`). **Prefer these skills for all Netlify mechanics** — the sections
below only record cib.is-specific decisions. Relevant ones for us:

| Skill | Use for |
| :---- | :------ |
| `netlify-cli-and-deploy` | CLI install, link, deploy, env vars, `netlify dev` |
| `netlify-deploy` | CLI deploy workflow (preview/prod) |
| `netlify-config` | full `netlify.toml` syntax (build, redirects, headers, contexts) |
| `netlify-frameworks` | Astro on Netlify (adapter vs static) |
| `netlify-forms` | Netlify Forms — `data-netlify`, spam, AJAX, submissions API |
| `netlify-image-cdn` | optional image optimization endpoint |

(Also installed: `netlify-functions`, `netlify-edge-functions`, `netlify-blobs`, `netlify-database`,
`netlify-identity`, `netlify-caching`, `netlify-ai-gateway` — not needed for a static no-backend site,
but available if scope grows.)

### CLI (when you're ready to deploy — see `netlify-cli-and-deploy`)

```bash
npm install -g netlify-cli
netlify login   # prints a URL to open/share for browser auth
```

## How we deploy

Primary path is **Git-based continuous deploy**: connect the repo in the Netlify UI; every push to
`main` builds and deploys, and PRs get deploy previews (used as the per-epic browser-verifiable URL).

CLI deploys are available for manual/preview pushes:

```bash
netlify deploy            # draft/preview deploy
netlify deploy --prod     # production deploy
```

## `netlify.toml` (project default)

Static Astro output → build to `dist/`, no adapter:

```toml
[build]
  command = "npm run build"
  publish = "dist"

# Until Epic 4 ships Imprint + Privacy, keep the site out of search indexes.
[[headers]]
  for = "/*"
  [headers.values]
    X-Robots-Tag = "noindex"
```

(Drop the `noindex` header at public launch in Epic 4.)

## Netlify Forms (Epic 2 — contact / Friday booking)

Free tier includes Netlify Forms (100 submissions/mo). Forms are detected **at build time from the
static HTML**, so the form markup must be present in the prerendered output.

- Add `data-netlify="true"` and a unique `name` to the `<form>`; Netlify injects the hidden
  `form-name` input at build (see `netlify-forms`). Enable form detection in the Netlify UI.
- Add a honeypot field and/or a GDPR-friendly captcha for spam.
- **Astro static pages prerender the form**, so the markup is in `dist/` at deploy — no skeleton
  needed. The `public/__forms.html` skeleton in `netlify-forms` is only for *JS-rendered* forms
  (React/Vue/SSR); use it only if a form is built client-side / in a hydrated island.
- Custom success page: `action="/thank-you"` (extensionless path; Netlify serves `thank-you.html`).
- Verify the form appears under **Forms** in the Netlify dashboard after deploy.
- No cookies / no third-party trackers → no cookie banner (privacy decision in the roadmap).

## Environment variables

Set non-secret build config and any secrets in **Site settings → Environment variables** (or via
`netlify env:set KEY value`). Keep secrets out of the repo; `.env*` is git-ignored (see `.gitignore`).

## Constraints

- **Free tier**: mind build minutes and the 100 Forms submissions/month limit.
- **No tracking / no cookies**: don't add analytics or third-party scripts that set cookies.
- **Fonts self-hosted**: never load fonts from a CDN (see roadmap + coding guidelines).
