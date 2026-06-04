import { describe, it, expect } from 'vitest';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pub = (f: string) => fileURLToPath(new URL('../public/' + f, import.meta.url));
const baseHead = readFileSync(
  fileURLToPath(new URL('../src/components/BaseHead.astro', import.meta.url)),
  'utf8',
);
const seo = readFileSync(
  fileURLToPath(new URL('../src/lib/seo.ts', import.meta.url)),
  'utf8',
);

// T12 / AC16 — favicon + OG image exist and are referenced via single swappable paths.
describe('brand placeholder assets', () => {
  it('ships favicon.svg, favicon.ico and og-default.png', () => {
    expect(existsSync(pub('favicon.svg'))).toBe(true);
    expect(existsSync(pub('favicon.ico'))).toBe(true);
    expect(existsSync(pub('og-default.png'))).toBe(true);
    expect(statSync(pub('og-default.png')).size).toBeGreaterThan(1000);
  });

  it('references the favicon from <head> via /favicon.svg', () => {
    expect(baseHead).toMatch(/rel="icon"[^>]*href="\/favicon\.svg"/);
  });

  it('references the OG image via a single swappable path', () => {
    expect(seo).toMatch(/DEFAULT_OG_IMAGE\s*=\s*'\/og-default\.png'/);
  });
});
