import { test, expect } from '@playwright/test';

// T5 / R7, AC2 — the footer links Impressum + Datenschutz live on every page;
// no disabled/aria-disabled legal slot remains.
const ROUTES = ['/', '/angebot', '/impressum', '/datenschutz', '/blog'];

for (const route of ROUTES) {
  test(`footer has live legal links on ${route} (R7)`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const footer = page.locator('footer');
    await expect(footer.locator('a[href="/impressum"]')).toHaveCount(1);
    await expect(footer.locator('a[href="/datenschutz"]')).toHaveCount(1);
    // no reserved/disabled legal slot left behind
    await expect(footer.locator('[data-legal-slot]')).toHaveCount(0);
    await expect(footer.locator('[aria-disabled="true"]')).toHaveCount(0);
  });
}

test('a blog post and the 404 page also expose the footer legal links (R7)', async ({ page }) => {
  // first post from the index
  await page.goto('/blog', { waitUntil: 'domcontentloaded' });
  const firstPost = await page.locator('a[href^="/blog/"]').first().getAttribute('href');
  await page.goto(firstPost!, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('footer a[href="/impressum"]')).toHaveCount(1);
  await expect(page.locator('footer a[href="/datenschutz"]')).toHaveCount(1);

  await page.goto('/this-route-does-not-exist-xyz', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('footer a[href="/impressum"]')).toHaveCount(1);
  await expect(page.locator('footer a[href="/datenschutz"]')).toHaveCount(1);
});
