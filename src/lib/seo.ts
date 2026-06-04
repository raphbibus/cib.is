/**
 * SEO / OG / robots meta builder (R6/R10/TD1/TD2).
 *
 * `robots` is **context-driven** (TD2): only the Netlify `production` deploy
 * context indexes; deploy previews, branch deploys and local builds stay
 * `noindex,nofollow`. This removes the risk of a stray manual edit indexing a
 * preview — go-public is just a production deploy, not a hand-flipped flag.
 * Netlify also auto-adds `X-Robots-Tag: noindex` to non-production deploys as
 * defence-in-depth (see netlify.toml).
 *
 * Canonical host is `https://www.cib.is` (TD1) — Netlify's configured primary;
 * the apex and the old netlify.app subdomain 301 to it (netlify.toml).
 */
export const SITE_URL = 'https://www.cib.is';
export const SITE_NAME = 'cib.is';
export const DEFAULT_OG_IMAGE = '/og-default.png';

export type OgType = 'website' | 'article';
export type Robots = 'index,follow' | 'noindex,nofollow';

export interface MetaInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  /** Blog posts pass 'article'; defaults to 'website' for site pages (R15). */
  ogType?: OgType;
}

export interface Meta {
  title: string;
  description: string;
  robots: Robots;
  canonical: string;
  ogUrl: string;
  ogImage: string;
  ogType: OgType;
  siteName: string;
}

function absolute(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE_URL).href;
}

/**
 * Index only in the Netlify production deploy context (TD2). Anything else —
 * deploy-preview, branch-deploy, or an unset CONTEXT (local build) — stays
 * out of search indexes.
 */
export function robotsForContext(context = process.env.CONTEXT): Robots {
  return context === 'production' ? 'index,follow' : 'noindex,nofollow';
}

export function buildMeta({ title, description, path, ogImage, ogType }: MetaInput): Meta {
  const canonical = absolute(path);
  return {
    title,
    description,
    robots: robotsForContext(),
    canonical,
    ogUrl: canonical,
    ogImage: absolute(ogImage ?? DEFAULT_OG_IMAGE),
    ogType: ogType ?? 'website',
    siteName: SITE_NAME,
  };
}
