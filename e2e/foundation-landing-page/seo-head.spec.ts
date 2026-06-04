import { test, expect } from '@playwright/test';

// AC8 / AC9 / AC16 — head metadata: noindex, title/description/OG, favicon + OG image.
test.describe('SEO / head metadata', () => {
  test('contains noindex,nofollow on every served page (AC9)', async ({ page }) => {
    await page.goto('/');
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', 'noindex,nofollow');
  });

  test('has title, description and OG tags (AC8)', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Ralph Cibis/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /.{40,}/,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/og-default\.png$/,
    );
  });

  test('references a favicon and the OG image is reachable (AC16)', async ({ page, baseURL }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');

    const og = await page.request.get(new URL('/og-default.png', baseURL).href);
    expect(og.status()).toBe(200);
    expect(og.headers()['content-type']).toContain('image/png');

    const fav = await page.request.get(new URL('/favicon.svg', baseURL).href);
    expect(fav.status()).toBe(200);
  });
});
