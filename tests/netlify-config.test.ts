import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const toml = readFileSync(
  fileURLToPath(new URL('../netlify.toml', import.meta.url)),
  'utf8',
);

// T13 / AC9, AC10 — build wiring + noindex header defence-in-depth.
describe('netlify.toml', () => {
  it('declares the build command and dist publish dir (AC10)', () => {
    expect(toml).toMatch(/command\s*=\s*"npm run build"/);
    expect(toml).toMatch(/publish\s*=\s*"dist"/);
  });

  it('sets an X-Robots-Tag noindex header for /* (AC9)', () => {
    expect(toml).toMatch(/for\s*=\s*"\/\*"/);
    expect(toml).toMatch(/X-Robots-Tag\s*=\s*"noindex/i);
  });
});
