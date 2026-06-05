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

  it('serves an indexable robots meta now the site is public (go-public)', () => {
    // Live site: local/production builds index; only deploy-preview / branch-deploy
    // builds (which set CONTEXT) stay noindex — covered by tests/seo.test.ts.
    expect(html).toMatch(/<meta[^>]+name=["']robots["'][^>]+content=["']index,follow["']/i);
  });

  it('emits og:image and twitter:image for link previews (AC10)', () => {
    const ogImage = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    );
    const twitterImage = html.match(
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    );
    expect(ogImage, 'og:image meta').not.toBeNull();
    expect(twitterImage, 'twitter:image meta').not.toBeNull();
    // Both point at the same raster OG asset (PNG/JPEG render on social scrapers).
    expect(twitterImage![1]).toBe(ogImage![1]);
    expect(twitterImage![1]).toMatch(/\.(png|jpg|jpeg)$/i);
  });

  it('does not leak the plaintext contact address into the HTML (AC6)', () => {
    expect(html).not.toContain('website@cib.is');
    expect(html).not.toContain('mailto:website');
  });
});
