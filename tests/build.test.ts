import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// T1 / AC2 — the production build must emit prerendered HTML and ship NO JS
// bundle / no client:* hydration. The single tiny inline mailto script (A10)
// is allowed; an emitted <script type="module" src=...> bundle is not.
const root = fileURLToPath(new URL('..', import.meta.url));
const distIndex = fileURLToPath(new URL('../dist/index.html', import.meta.url));

describe('production build output', () => {
  let html = '';

  beforeAll(() => {
    if (!existsSync(distIndex)) {
      execSync('npm run build', { cwd: root, stdio: 'inherit' });
    }
    html = readFileSync(distIndex, 'utf8');
  }, 180_000);

  it('produces dist/index.html', () => {
    expect(existsSync(distIndex)).toBe(true);
    expect(html.length).toBeGreaterThan(500);
  });

  it('ships no bundled/module JS and no Astro island hydration (AC2)', () => {
    // No external module bundle.
    expect(html).not.toMatch(/<script[^>]*type=["']module["'][^>]*src=/i);
    // No Astro island runtime / hydration directives in the output.
    expect(html).not.toContain('astro-island');
    expect(html).not.toMatch(/client:(load|idle|visible|media|only)/);
  });

  it('keeps the noindex guard in the served HTML (AC9)', () => {
    expect(html).toMatch(/<meta[^>]+name=["']robots["'][^>]+content=["']noindex,nofollow["']/i);
  });

  it('does not leak the plaintext contact address into the HTML (AC6)', () => {
    expect(html).not.toContain('ralph@cib.is');
    expect(html).not.toContain('mailto:ralph');
  });
});
