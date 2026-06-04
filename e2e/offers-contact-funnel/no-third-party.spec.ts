import { test, expect } from '@playwright/test';

// T13 — zero third-party (R6, AC5). Loading and submitting the Offers page must
// fire NO cross-origin requests (only same-origin assets + the same-origin
// Netlify form POST). The captcha is verified first-party client-side.
function captchaAnswer(text: string) {
  const m = text.match(/(\d+)\s*\+\s*(\d+)/)!;
  return String(Number(m[1]) + Number(m[2]));
}

test.describe('zero third-party (offers)', () => {
  test('loads with no cross-origin requests and no external JS bundle (AC5)', async ({
    page,
    baseURL,
  }) => {
    const origin = new URL(baseURL!).origin;
    const offenders: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('blob:')) return;
      if (!url.startsWith(origin)) offenders.push(url);
    });

    await page.goto('/angebot', { waitUntil: 'networkidle' });
    expect(offenders, `third-party requests: ${offenders.join(', ')}`).toEqual([]);

    // the form script is an inline/same-origin module — never a third-party src
    const externalModules = await page
      .locator('script[type="module"][src]')
      .evaluateAll((els) =>
        els
          .map((e) => (e as HTMLScriptElement).src)
          .filter((src) => src && !src.startsWith(origin)),
      );
    expect(externalModules).toEqual([]);
  });

  test('a full submit stays same-origin: wrong captcha rejected, correct one reaches the POST (AC5)', async ({
    page,
    baseURL,
  }) => {
    const origin = new URL(baseURL!).origin;
    const offenders: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('blob:')) return;
      if (!url.startsWith(origin)) offenders.push(url);
    });

    let postCount = 0;
    await page.route('http://localhost:4321/', async (route) => {
      if (route.request().method() === 'POST') {
        postCount++;
        await route.fulfill({ status: 200, contentType: 'text/html', body: 'OK' });
      } else {
        await route.continue();
      }
    });

    await page.goto('/angebot', { waitUntil: 'networkidle' });

    // wrong captcha → rejected client-side, no POST
    await page.fill('[name="name"]', 'Ada');
    await page.fill('[name="email"]', 'ada@example.com');
    await page.fill('[name="message"]', 'Hallo');
    await page.fill('[name="captcha"]', '0');
    await page.click('button[type="submit"]');
    await expect(page.locator('[name="captcha"]')).toHaveAttribute('aria-invalid', 'true');
    expect(postCount).toBe(0);

    // correct captcha + empty honeypot → reaches the POST
    const captcha = await page.locator('label', { hasText: /Kontrollfrage/i }).innerText();
    await page.fill('[name="captcha"]', captchaAnswer(captcha));
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-contact-success]')).toBeVisible();
    expect(postCount).toBe(1);

    expect(offenders, `third-party requests: ${offenders.join(', ')}`).toEqual([]);
  });
});
