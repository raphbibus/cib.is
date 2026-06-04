import { test, expect } from '@playwright/test';

// T12 — client-side validation (R5, AC4). Empty required fields or a malformed
// email block the submit with an inline, screen-reader-accessible message
// (aria-invalid + aria-describedby → role="alert"); no network request fires.
test.describe('contact form validation', () => {
  test.beforeEach(async ({ page }) => {
    // record any POST so we can assert none fired on a blocked submit
    await page.route('http://localhost:4321/', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'text/html', body: 'OK' });
      } else {
        await route.continue();
      }
    });
    await page.goto('/angebot');
  });

  function captchaAnswer(text: string) {
    const m = text.match(/(\d+)\s*\+\s*(\d+)/)!;
    return String(Number(m[1]) + Number(m[2]));
  }

  test('empty required fields block submit with accessible messages, no POST', async ({ page }) => {
    let posted = false;
    page.on('request', (r) => {
      if (r.method() === 'POST') posted = true;
    });

    await page.click('button[type="submit"]');

    const email = page.locator('[name="email"]');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    const describedby = await email.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    const alert = page.locator(`#${describedby}`);
    await expect(alert).toHaveAttribute('role', 'alert');
    await expect(alert).not.toBeEmpty();

    expect(posted).toBe(false);
  });

  test('a malformed email is flagged with the format message, no POST', async ({ page }) => {
    let posted = false;
    page.on('request', (r) => {
      if (r.method() === 'POST') posted = true;
    });

    await page.fill('[name="name"]', 'Ada');
    await page.fill('[name="email"]', 'not-an-email');
    await page.fill('[name="message"]', 'Hallo');
    const captcha = await page.locator('label', { hasText: /Kontrollfrage/i }).innerText();
    await page.fill('[name="captcha"]', captchaAnswer(captcha));

    await page.click('button[type="submit"]');

    const email = page.locator('[name="email"]');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#err-email')).toContainText(/gültig/i);
    expect(posted).toBe(false);
  });

  test('a wrong captcha blocks submit even with valid fields, no POST', async ({ page }) => {
    let posted = false;
    page.on('request', (r) => {
      if (r.method() === 'POST') posted = true;
    });

    await page.fill('[name="name"]', 'Ada');
    await page.fill('[name="email"]', 'ada@example.com');
    await page.fill('[name="message"]', 'Hallo');
    await page.fill('[name="captcha"]', '-999'); // definitely wrong

    await page.click('button[type="submit"]');

    await expect(page.locator('[name="captcha"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#err-captcha')).not.toBeEmpty();
    expect(posted).toBe(false);
  });

  test('valid + correct captcha passes validation (submit proceeds to POST)', async ({ page }) => {
    await page.fill('[name="name"]', 'Ada Lovelace');
    await page.fill('[name="email"]', 'ada@example.com');
    await page.fill('[name="message"]', 'Wir kommen nicht ins Liefern.');
    const captcha = await page.locator('label', { hasText: /Kontrollfrage/i }).innerText();
    await page.fill('[name="captcha"]', captchaAnswer(captcha));

    const [request] = await Promise.all([
      page.waitForRequest((r) => r.method() === 'POST'),
      page.click('button[type="submit"]'),
    ]);
    expect(request).toBeTruthy();
  });
});
