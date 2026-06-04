import { test, expect } from '@playwright/test';

// T11 / R1, R4, R12 — the provable privacy guarantee and the go-live gate.
// For EVERY route: zero cookies, zero localStorage/sessionStorage writes, every
// network request same-origin, and no analytics/beacon requests anywhere. A
// failure here (any cookie, storage write, or third-party request) blocks
// noindex removal.
const ANALYTICS = /google-analytics|googletagmanager|gtag|doubleclick|facebook|connect\.facebook|hotjar|segment|mixpanel|plausible|matomo|sentry|fullstory|clarity|beacon|collect\?/i;

const STATIC_ROUTES = ['/', '/angebot', '/impressum', '/datenschutz', '/blog', '/danke'];

test.describe('privacy gate — no cookies / storage / third-party', () => {
  for (const route of STATIC_ROUTES) {
    test(`${route} sets no cookies, no storage, no third-party requests (R1/R4/R12)`, async ({
      page,
      baseURL,
      context,
    }) => {
      const origin = new URL(baseURL!).origin;
      const offenders: string[] = [];
      const analytics: string[] = [];
      page.on('request', (req) => {
        const url = req.url();
        if (url.startsWith('data:') || url.startsWith('blob:')) return;
        if (!url.startsWith(origin)) offenders.push(url);
        if (ANALYTICS.test(url)) analytics.push(url);
      });

      await page.goto(route, { waitUntil: 'networkidle' });

      expect(offenders, `third-party requests on ${route}: ${offenders.join(', ')}`).toEqual([]);
      expect(analytics, `analytics/beacon requests on ${route}: ${analytics.join(', ')}`).toEqual([]);

      const cookies = await context.cookies();
      expect(cookies, `cookies on ${route}`).toEqual([]);

      const storage = await page.evaluate(() => ({
        cookie: document.cookie,
        local: localStorage.length,
        session: sessionStorage.length,
      }));
      expect(storage.cookie, `document.cookie on ${route}`).toBe('');
      expect(storage.local, `localStorage writes on ${route}`).toBe(0);
      expect(storage.session, `sessionStorage writes on ${route}`).toBe(0);
    });
  }

  test('a blog post and the 404 page are equally clean (R1/R4/R12)', async ({
    page,
    baseURL,
    context,
  }) => {
    const origin = new URL(baseURL!).origin;
    const check = async (route: string) => {
      const offenders: string[] = [];
      const handler = (url: string) => {
        if (url.startsWith('data:') || url.startsWith('blob:')) return;
        if (!url.startsWith(origin)) offenders.push(url);
      };
      const listener = (req: import('@playwright/test').Request) => handler(req.url());
      page.on('request', listener);
      await page.goto(route, { waitUntil: 'networkidle' });
      page.off('request', listener);
      expect(offenders, `third-party on ${route}: ${offenders.join(', ')}`).toEqual([]);
      expect(await context.cookies(), `cookies on ${route}`).toEqual([]);
      const s = await page.evaluate(() => document.cookie + '|' + localStorage.length + '|' + sessionStorage.length);
      expect(s, `storage on ${route}`).toBe('|0|0');
    };

    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    const firstPost = await page.locator('a[href^="/blog/"]').first().getAttribute('href');
    await check(firstPost!);
    await check('/diese-seite-fehlt-' + Date.now());
  });
});
