import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const toml = readFileSync(
  fileURLToPath(new URL('../netlify.toml', import.meta.url)),
  'utf8',
);

describe('netlify.toml', () => {
  it('declares the build command and dist publish dir (AC10)', () => {
    expect(toml).toMatch(/command\s*=\s*"npm run build"/);
    expect(toml).toMatch(/publish\s*=\s*"dist"/);
  });

  // T9 / R6 / TD2 — production must be indexable: no unconditional X-Robots-Tag
  // noindex applied to /*. (Non-prod noindex is the baked <meta robots> +
  // Netlify's automatic deploy-preview/branch-deploy noindex — see seo.ts.)
  it('does NOT force a global noindex X-Robots-Tag on production (R6/TD2)', () => {
    // strip comment lines so a documentation comment never trips the check
    const active = toml
      .split('\n')
      .filter((l) => !l.trimStart().startsWith('#'))
      .join('\n');
    expect(active).not.toMatch(/X-Robots-Tag\s*=\s*"noindex/i);
  });

  // T10 / R6 / TD1 — single canonical host: 301 the apex cib.is AND the old
  // netlify.app subdomain to https://www.cib.is (force = true).
  it('301-redirects the apex cib.is host to www.cib.is (TD1)', () => {
    expect(toml).toMatch(/\[\[redirects\]\]/);
    expect(toml).toMatch(/Host\s*=\s*\[\s*"cib\.is"\s*\]/);
    expect(toml).toMatch(/to\s*=\s*"https:\/\/www\.cib\.is/);
  });

  it('301-redirects the old netlify.app subdomain to www.cib.is (TD1)', () => {
    expect(toml).toMatch(/ralphcibis\.netlify\.app/);
  });

  it('forces the canonical redirects with status 301 (TD1)', () => {
    expect(toml).toMatch(/status\s*=\s*301/);
    expect(toml).toMatch(/force\s*=\s*true/);
  });
});
