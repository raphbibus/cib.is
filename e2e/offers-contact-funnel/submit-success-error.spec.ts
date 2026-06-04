import { test, expect } from '@playwright/test';

// T8 — AJAX submit behaviour (R7, R11, R12, AC6, AC10, AC11). The Netlify POST
// is intercepted (local preview has no Netlify backend): 200 → form replaced in
// place by the confirmation, no navigation; 500 → inline error, values kept,
// mailto fallback surfaced.
function captchaAnswer(text: string) {
  const m = text.match(/(\d+)\s*\+\s*(\d+)/)!;
  return String(Number(m[1]) + Number(m[2]));
}

async function fillValid(page: import('@playwright/test').Page) {
  await page.fill('[name="name"]', 'Ada Lovelace');
  await page.fill('[name="email"]', 'ada@example.com');
  await page.fill('[name="message"]', 'Wir kommen nicht ins Liefern.');
  const captcha = await page.locator('label', { hasText: /Kontrollfrage/i }).innerText();
  await page.fill('[name="captcha"]', captchaAnswer(captcha));
}

test.describe('contact form AJAX submit', () => {
  test('on success the form is replaced in place by the confirmation, no navigation (AC6/AC10)', async ({
    page,
  }) => {
    let body = '';
    await page.route('http://localhost:4321/', async (route) => {
      if (route.request().method() === 'POST') {
        body = route.request().postData() ?? '';
        await route.fulfill({ status: 200, contentType: 'text/html', body: 'OK' });
      } else {
        await route.continue();
      }
    });

    await page.goto('/angebot');
    await fillValid(page);
    await page.click('button[type="submit"]');

    // confirmation shown, form gone, URL unchanged (no navigation)
    const success = page.locator('[data-contact-success]');
    await expect(success).toBeVisible();
    await expect(success).toContainText(/persönlich/i);
    await expect(success).toContainText(/2 Werktage/);
    await expect(page.locator('form[data-contact]')).toBeHidden();
    await expect(page).toHaveURL(/\/angebot\/?$/);

    // the POST body carried the Netlify contract fields
    expect(body).toContain('form-name=kontakt');
    expect(body).toContain('email=ada%40example.com');
  });

  test('on failure an inline error is shown, values are preserved, mailto surfaced (AC11)', async ({
    page,
  }) => {
    await page.route('http://localhost:4321/', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 500, contentType: 'text/html', body: 'fail' });
      } else {
        await route.continue();
      }
    });

    await page.goto('/angebot');
    await fillValid(page);
    await page.click('button[type="submit"]');

    const errorBox = page.locator('[data-form-error]');
    await expect(errorBox).toBeVisible();
    // entered values are preserved
    await expect(page.locator('[name="name"]')).toHaveValue('Ada Lovelace');
    await expect(page.locator('[name="email"]')).toHaveValue('ada@example.com');
    await expect(page.locator('[name="message"]')).toHaveValue('Wir kommen nicht ins Liefern.');
    // mailto fallback surfaced
    await expect(errorBox.locator('a[data-eml]')).toBeVisible();
    // form still present (not replaced)
    await expect(page.locator('form[data-contact]')).toBeVisible();
  });
});
