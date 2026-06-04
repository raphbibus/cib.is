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

  // T7 / R10, AC10 — the OG image is a real PNG at the social-required 1200×630
  // (WebP would not preview on Facebook/LinkedIn/WhatsApp/X — see PRD R10).
  it('og-default.png is a PNG raster at 1200×630 (R10/AC10)', () => {
    const buf = readFileSync(pub('og-default.png'));
    // PNG signature
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(buf.subarray(0, 8).equals(sig)).toBe(true);
    // IHDR: width @ byte 16 (BE u32), height @ byte 20 (BE u32)
    expect(buf.readUInt32BE(16)).toBe(1200);
    expect(buf.readUInt32BE(20)).toBe(630);
  });
});
