/**
 * SEO / OG / robots meta builder (R6/R10/TD1/TD2).
 *
 * `robots` is **context-driven** (TD2). The site is now **live and public**, so
 * production *and* local builds index; only Netlify **deploy previews** and
 * **branch deploys** stay `noindex,nofollow`, so work-in-progress URLs never
 * leak into search. Netlify also auto-adds `X-Robots-Tag: noindex` to those
 * non-production deploys as defence-in-depth (see netlify.toml).
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
 * Go-public default (2026): the live site indexes. Only Netlify deploy previews
 * and branch deploys — which always set CONTEXT — stay out of search indexes;
 * production and unset/local builds index.
 */
export function robotsForContext(context = process.env.CONTEXT): Robots {
  return context === 'deploy-preview' || context === 'branch-deploy'
    ? 'noindex,nofollow'
    : 'index,follow';
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
