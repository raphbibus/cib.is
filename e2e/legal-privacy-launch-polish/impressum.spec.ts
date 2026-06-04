import { test, expect } from '@playwright/test';

// T2 / R2, R3, R7 — the Impressum carries the §5 DDG mandatory fields, the
// USt-IdNr, the §19 UStG note, an obfuscated email (no raw mailto: literal),
// and a phone number as the second quick-contact channel (per IHK).
test.describe('Impressum (§5 DDG)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/impressum', { waitUntil: 'domcontentloaded' });
  });

  test('returns 200 and renders an Impressum heading (R2)', async ({ page }) => {
    const res = await page.goto('/impressum');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: /Impressum/i })).toBeVisible();
  });

  test('shows the §5 fields: name + ladungsfähige Anschrift (R2)', async ({ page }) => {
    const body = await page.locator('main').innerText();
    expect(body).toMatch(/Ralph Cibis|\[Ralph Cibis/);
    expect(body).toMatch(/Deutschland/);
  });

  test('lists the USt-IdNr and the §19 UStG note (R3)', async ({ page }) => {
    const body = await page.locator('main').innerText();
    expect(body).toMatch(/USt-IdNr|Umsatzsteuer-Identifikationsnummer/i);
    expect(body).toMatch(/§\s*19\s*UStG/);
  });

  test('exposes an obfuscated email — no raw mailto: literal in the HTML (R7)', async ({ page }) => {
    const html = await page.content();
    expect(html).not.toContain('mailto:website');
    expect(html).not.toContain('website@cib.is');
    // the obfuscated MailtoLink token is present in the page body
    await expect(page.locator('main a[data-eml]')).toHaveCount(1);
  });

  test('provides a phone number as the second quick-contact channel (R7, per IHK)', async ({ page }) => {
    const tel = page.locator('main a[href^="tel:"]');
    await expect(tel).toHaveCount(1);
    await expect(tel).toHaveText(/0176\s*2357\s*9314/);
  });
});
