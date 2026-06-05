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
    expect(contrast(token('--color-neon-cyan'), ink)).toBeGreaterThanOrEqual(4.5);
  });

  it('neon pink works as a focus ring (≥ 3:1 non-text on both paper and ink)', () => {
    const pink = token('--color-neon-pink');
    expect(contrast(pink, token('--color-paper'))).toBeGreaterThanOrEqual(3);
    expect(contrast(pink, token('--color-ink'))).toBeGreaterThanOrEqual(3);
  });
});

// T5 / R5, R9 / AC5, AC9 — the unified `primary` CTA (TD1) is a gradient FILL with
// INK text on top (`bg-gradient-accent border-ink text-ink`). The reconciliation
// folds the old inline `ticketButtonClass` into one place that references the
// `--color-neon-green` token for its hover shadow. Both gradient endpoints must
// keep the ink-text-on-neon-fill leg of the contrast contract (≥ 4.5:1).
describe('unified primary CTA fill contract (T5/AC9)', () => {
  it('ink text on the neon gradient fill (both endpoints) meets WCAG AA (≥ 4.5:1)', () => {
    const ink = token('--color-ink');
    expect(contrast(ink, token('--color-neon-pink'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ink, token('--color-neon-green'))).toBeGreaterThanOrEqual(4.5);
  });

  it('the hover-shadow accent colour token (--color-neon-green) is defined', () => {
    // The primary variant draws its hard-shadow from this token, not a raw hex.
    expect(css).toMatch(/--color-neon-green:\s*#[0-9a-fA-F]{6}/);
  });
});

// T2 (epic "Warum ich das mache") / R8, R9 / AC8 — the two Haltung panel tints.
// Each panel gets an OPAQUE dark accent-washed background defined as a #rrggbb
// token in @theme. The contract: the fill stays dark enough that bone body text
// (`--color-paper`) AND muted body text (`--color-muted`) keep ≥ 4.5:1 on it —
// neon appears only as the decorative border, never as text on a light fill.
describe('Haltung tint tokens keep body text WCAG AA (T2/AC8)', () => {
  it('defines opaque dark tint tokens for both panels', () => {
    expect(css).toMatch(/--color-tint-pink:\s*#[0-9a-fA-F]{6}/);
    expect(css).toMatch(/--color-tint-green:\s*#[0-9a-fA-F]{6}/);
  });

  it('paper (bone) body text meets AA on both tints (≥ 4.5:1)', () => {
    const paper = token('--color-paper');
    expect(contrast(paper, token('--color-tint-pink'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(paper, token('--color-tint-green'))).toBeGreaterThanOrEqual(4.5);
  });

  it('muted secondary body text meets AA on both tints (≥ 4.5:1)', () => {
    const muted = token('--color-muted');
    expect(contrast(muted, token('--color-tint-pink'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(muted, token('--color-tint-green'))).toBeGreaterThanOrEqual(4.5);
  });
});

// T6 / R9 / AC9 (TD3) — 8-bit pixel accents bring the identity to life, with two
// hard guards: CSS-only motion suppressed under prefers-reduced-motion, and NO
// new pixel webfont (accents are committed inline SVG instead).
describe('8-bit accent motion safety (T6/AC9/TD3)', () => {
  it('defines a CSS-only pixel-blink keyframe + utility', () => {
    expect(css).toMatch(/@keyframes\s+pixel-blink/);
    expect(css).toMatch(/\.pixel-blink\s*{[^}]*animation:/);
  });

  it('neutralizes the pixel-blink animation under prefers-reduced-motion', () => {
    // After a reduced-motion media open, .pixel-blink must be turned off.
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.pixel-blink\s*{[^}]*animation:\s*none/,
    );
  });

  it('still guards the existing eq / nav-underline motion under reduced-motion', () => {
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.eq\s*>\s*span\s*{[^}]*animation:\s*none/,
    );
  });

  it('adds no new webfont — every @font-face is a brand family, not a pixel font (TD3)', () => {
    const faces = css.match(/@font-face\s*{[^}]*}/g) ?? [];
    const allowed = ['Anton', 'IBM Plex Mono', 'Inter'];
    expect(faces.length).toBeGreaterThanOrEqual(5);
    for (const f of faces) {
      const fam = f.match(/font-family:\s*"([^"]+)"/)?.[1];
      expect(allowed, `unexpected @font-face family: ${fam}`).toContain(fam);
    }
  });
});
