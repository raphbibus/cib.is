import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(
  fileURLToPath(new URL('../src/styles/global.css', import.meta.url)),
  'utf8',
);

// --- WCAG relative-luminance contrast helper (T4) ---
function lin(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function lum(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a: string, b: string) {
  const hi = Math.max(lum(a), lum(b));
  const lo = Math.min(lum(a), lum(b));
  return (hi + 0.05) / (lo + 0.05);
}
function token(name: string): string {
  const m = css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token ${name} not found in @theme`);
  return m[1];
}

describe('global.css @font-face (T2/R2)', () => {
  const families = [
    'Anton',
    'IBM Plex Mono',
    'Inter',
  ];
  it.each(families)('declares @font-face for %s with a same-origin woff2 src', (family) => {
    const block = new RegExp(
      `@font-face\\s*{[^}]*font-family:\\s*"${family}"[^}]*}`,
      'g',
    );
    const matches = css.match(block);
    expect(matches, `@font-face for ${family}`).toBeTruthy();
    for (const b of matches!) {
      expect(b).toMatch(/url\("\.\.\/assets\/fonts\/[^"]+\.woff2"\)/);
      expect(b).not.toContain('https://'); // never a CDN
    }
  });

  it('uses font-display: swap to protect LCP', () => {
    const faces = css.match(/@font-face\s*{[^}]*}/g) ?? [];
    expect(faces.length).toBeGreaterThanOrEqual(5);
    for (const f of faces) expect(f).toContain('font-display: swap');
  });
});

describe('global.css @theme brand tokens (T4/R4)', () => {
  it('defines the brutalist colour, neon, type and structural tokens', () => {
    for (const t of ['--color-paper', '--color-ink', '--color-neon-pink', '--color-neon-green']) {
      expect(css).toContain(`${t}:`);
    }
    expect(css).toMatch(/--gradient-accent:\s*linear-gradient/);
    expect(css).toMatch(/--font-display:\s*"Anton"/);
    expect(css).toMatch(/--font-mono:\s*"IBM Plex Mono"/);
    expect(css).toMatch(/--font-body:\s*"Inter"/);
    expect(css).toMatch(/--border-(hair|raw|slab):/);
  });

  it('body text (ink on paper) meets WCAG AA (≥ 4.5:1)', () => {
    expect(contrast(token('--color-ink'), token('--color-paper'))).toBeGreaterThanOrEqual(4.5);
  });

  it('neon accents meet WCAG AA as text on the dark ink surface (≥ 4.5:1)', () => {
    // The usage contract is: neon is text only on ink, or a fill under ink text.
    const ink = token('--color-ink');
    expect(contrast(token('--color-neon-pink'), ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('--color-neon-green'), ink)).toBeGreaterThanOrEqual(4.5);
  });

  it('neon pink works as a focus ring (≥ 3:1 non-text on both paper and ink)', () => {
    const pink = token('--color-neon-pink');
    expect(contrast(pink, token('--color-paper'))).toBeGreaterThanOrEqual(3);
    expect(contrast(pink, token('--color-ink'))).toBeGreaterThanOrEqual(3);
  });
});
