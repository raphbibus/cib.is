import { test, expect } from '@playwright/test';

// AC1 / AC2 / AC13 — no third-party requests, fonts same-origin woff2 + preload,
// no app JS bundle.
test.describe('zero third-party / zero-JS-bundle', () => {
  test('makes no requests to a third-party / CDN origin', async ({ page, baseURL }) => {
    const origin = new URL(baseURL!).origin;
    const offenders: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('blob:')) return;
      if (!url.startsWith(origin)) offenders.push(url);
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    expect(offenders, `third-party requests: ${offenders.join(', ')}`).toEqual([]);
  });

  test('loads every font as a same-origin woff2 with a preload link (AC1/AC13)', async ({
    page,
    baseURL,
  }) => {
    const origin = new URL(baseURL!).origin;
    const fontReqs: string[] = [];
    page.on('request', (req) => {
      if (req.url().endsWith('.woff2')) fontReqs.push(req.url());
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    // ensure fonts are actually fetched
    await page.evaluate(() => (document as any).fonts.ready);

    expect(fontReqs.length).toBeGreaterThan(0);
    for (const u of fontReqs) expect(u.startsWith(origin)).toBe(true);

    // preload links for the two above-the-fold faces
    const preloads = page.locator('link[rel="preload"][as="font"]');
    await expect(preloads).toHaveCount(2);
    for (const href of await preloads.evaluateAll((els) =>
      els.map((e) => (e as HTMLLinkElement).getAttribute('href')),
    )) {
      expect(href).toMatch(/\.woff2$/);
      expect(href!.startsWith('http')).toBe(false); // same-origin relative path
    }
  });

  test('ships no module/bundled JS and no Astro island hydration (AC2)', async ({ page }) => {
    const scriptRequests: string[] = [];
    page.on('request', (req) => {
      if (req.resourceType() === 'script') scriptRequests.push(req.url());
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    expect(scriptRequests, `external scripts: ${scriptRequests.join(', ')}`).toEqual([]);

    const moduleScripts = await page.locator('script[type="module"][src]').count();
    expect(moduleScripts).toBe(0);
    expect(await page.locator('astro-island').count()).toBe(0);
  });
});
