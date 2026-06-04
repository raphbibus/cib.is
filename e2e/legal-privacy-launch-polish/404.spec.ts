import { test, expect } from '@playwright/test';

// T6 / R11, AC11 — an unknown URL returns 404 and renders the on-brand punk
// page with links to home, offers and a mailto; footer legal links present.
test.describe('punk 404', () => {
  test('an unknown URL returns HTTP 404', async ({ page }) => {
    const res = await page.goto('/kaputt-und-weg-' + Date.now(), {
      waitUntil: 'domcontentloaded',
    });
    expect(res?.status()).toBe(404);
  });

  test('renders a brand heading and links to home, offers, and a mailto (R11)', async ({ page }) => {
    await page.goto('/nope-not-here', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('main a[href="/"]')).not.toHaveCount(0);
    await expect(page.locator('main a[href="/angebot"]')).not.toHaveCount(0);
    // obfuscated mailto (no plaintext literal)
    await expect(page.locator('main a[data-eml]')).not.toHaveCount(0);
    const html = await page.content();
    expect(html).not.toContain('mailto:website');
  });

  test('keeps the footer legal links (R7)', async ({ page }) => {
    await page.goto('/still-missing', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('footer a[href="/impressum"]')).toHaveCount(1);
    await expect(page.locator('footer a[href="/datenschutz"]')).toHaveCount(1);
  });
});
