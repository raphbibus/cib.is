import { test, expect } from '@playwright/test';

// T6 — the contact form markup (R5, R6, R7, TD1/TD2). Fields, honeypot,
// hidden form-name, captcha question rendered, progressive-enhancement attrs.
test.describe('contact form markup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/angebot');
  });

  test('shows name/email/company/role/message fields (R5/AC4)', async ({ page }) => {
    const form = page.locator('form[data-contact]');
    for (const name of ['name', 'email', 'company', 'role', 'message']) {
      await expect(form.locator(`[name="${name}"]`)).toHaveCount(1);
    }
    // message is a textarea
    await expect(form.locator('textarea[name="message"]')).toHaveCount(1);
  });

  test('marks name/email/message required and email as type=email', async ({ page }) => {
    const form = page.locator('form[data-contact]');
    await expect(form.locator('[name="name"]')).toHaveAttribute('required', '');
    await expect(form.locator('[name="email"]')).toHaveAttribute('required', '');
    await expect(form.locator('[name="message"]')).toHaveAttribute('required', '');
    await expect(form.locator('[name="email"]')).toHaveAttribute('type', 'email');
    // company/role optional
    await expect(form.locator('[name="company"]')).not.toHaveAttribute('required', '');
  });

  test('carries the progressive-enhancement attrs: POST + data-netlify + action=/danke (TD1)', async ({
    page,
  }) => {
    const form = page.locator('form[data-contact]');
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute('data-netlify', 'true');
    await expect(form).toHaveAttribute('action', '/danke');
    // hidden form-name matches the form name (Netlify contract)
    await expect(form).toHaveAttribute('name', 'kontakt');
    await expect(form.locator('input[type="hidden"][name="form-name"]')).toHaveValue('kontakt');
  });

  test('honeypot field is present, off the tab order and hidden from AT (R6)', async ({ page }) => {
    const form = page.locator('form[data-contact]');
    const honeypotName = await form.getAttribute('data-netlify-honeypot');
    expect(honeypotName).toBeTruthy();
    const hp = form.locator(`[name="${honeypotName}"]`);
    await expect(hp).toHaveCount(1);
    await expect(hp).toBeHidden(); // visually hidden (display:none wrapper)
    await expect(hp).toHaveAttribute('tabindex', '-1');
    // wrapper is aria-hidden
    const wrapperHidden = await hp.evaluate((el) => !!el.closest('[aria-hidden="true"]'));
    expect(wrapperHidden).toBe(true);
  });

  test('renders the captcha question as label text + encodes the answer in a data-* attr (TD2)', async ({
    page,
  }) => {
    const form = page.locator('form[data-contact]');
    // encoded answer present, and NOT the plaintext digits
    const token = await form.getAttribute('data-captcha');
    expect(token).toBeTruthy();
    // captcha question is rendered as a label
    const captchaLabel = page.locator('label', { hasText: /Kontrollfrage/i });
    await expect(captchaLabel).toBeVisible();
    const text = await captchaLabel.innerText();
    expect(text).toMatch(/\d+\s*\+\s*\d+/);
    // the plaintext answer must not appear verbatim in the token
    const m = text.match(/(\d+)\s*\+\s*(\d+)/)!;
    const answer = String(Number(m[1]) + Number(m[2]));
    expect(token).not.toContain(answer);
  });
});
