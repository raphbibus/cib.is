/**
 * SEO / OG / robots meta builder (R10/R11/R18, A7).
 *
 * `robots` is hard-wired to `noindex,nofollow` for the whole epic — this is
 * the single meta-side removal point for Epic 4 go-public (the matching
 * `X-Robots-Tag` header lives in netlify.toml).
 */
export const SITE_URL = 'https://ralphcibis.netlify.app';
export const SITE_NAME = 'cib.is';
export const DEFAULT_OG_IMAGE = '/og-default.png';

export type OgType = 'website' | 'article';

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
  robots: 'noindex,nofollow';
  canonical: string;
  ogUrl: string;
  ogImage: string;
  ogType: OgType;
  siteName: string;
}

function absolute(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE_URL).href;
}

export function buildMeta({ title, description, path, ogImage, ogType }: MetaInput): Meta {
  const canonical = absolute(path);
  return {
    title,
    description,
    robots: 'noindex,nofollow',
    canonical,
    ogUrl: canonical,
    ogImage: absolute(ogImage ?? DEFAULT_OG_IMAGE),
    ogType: ogType ?? 'website',
    siteName: SITE_NAME,
  };
}
