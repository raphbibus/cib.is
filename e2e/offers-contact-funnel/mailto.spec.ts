import { test, expect } from '@playwright/test';

const EMAIL = 'ralph@cib.is';

// T10 — the obfuscated mailto fallback on the Offers page (R10, AC9). The raw
// HTML must not leak the address; the fallback (surfaced in the error state,
// see submit-success-error) resolves to the real mailto after interaction,
// reusing the Epic 1 Layout decoder — no new JS.
test.describe('obfuscated mailto fallback (offers)', () => {
  test('served HTML contains no plaintext address and no mailto:<local> literal (AC9)', async ({
    page,
    baseURL,
  }) => {
    const res = await page.request.get(`${baseURL}/angebot`);
    const html = await res.text();
    expect(html).not.toContain(EMAIL);
    expect(html).not.toContain('mailto:' + EMAIL.split('@')[0]);
  });

  test('the fallback link resolves to the correct mailto after interaction (AC9)', async ({
    page,
  }) => {
    // Reveal the error state so the fallback link is visible, then focus it.
    await page.route('http://localhost:4321/', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 500, contentType: 'text/html', body: 'fail' });
      } else {
        await route.continue();
      }
    });
    await page.goto('/angebot');

    // fill a valid + captcha-correct submission so it reaches the (failing) POST
    await page.fill('[name="name"]', 'Ada');
    await page.fill('[name="email"]', 'ada@example.com');
    await page.fill('[name="message"]', 'Hallo Ralph');
    const captcha = await page.locator('label', { hasText: /Kontrollfrage/i }).innerText();
    const m = captcha.match(/(\d+)\s*\+\s*(\d+)/)!;
    await page.fill('[name="captcha"]', String(Number(m[1]) + Number(m[2])));
    await page.click('button[type="submit"]');

    const fallback = page.locator('[data-form-error] a[data-eml]');
    await expect(fallback).toBeVisible();
    await fallback.focus();
    await expect(fallback).toHaveAttribute('href', new RegExp(`^mailto:${EMAIL}`));
  });
});
