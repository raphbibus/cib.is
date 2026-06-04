import { test, expect } from '@playwright/test';

// T8 / R1, AC1 — every post detail ends with a personal, first-person CTA that
// links to the Offers page; clicking it navigates there.
const SOLO = '/blog/innovationsangst-eine-geschichte-ueber-alman-memes-sauna-und-organisationskultur';
const COLLAB = '/blog/einfache-wahrheiten';

test.describe('end-of-post CTA', () => {
  for (const slug of [SOLO, COLLAB]) {
    test(`post ${slug} ends with the CTA block linking to /angebot`, async ({ page }) => {
      await page.goto(slug);
      const cta = page.locator('[data-post-cta]');
      await expect(cta).toBeVisible();

      const button = cta.locator('a[href="/angebot"]');
      await expect(button).toBeVisible();

      // CTA is the last block of the article (end-of-post).
      const ctaBox = await cta.boundingBox();
      const articleBox = await page.locator('article').boundingBox();
      expect(ctaBox!.y).toBeGreaterThan(articleBox!.y + articleBox!.height / 2);
    });
  }

  test('the CTA copy is personal / first-person, not company "wir"', async ({ page }) => {
    await page.goto(SOLO);
    const text = await page.locator('[data-post-cta]').innerText();
    expect(text.toLowerCase()).toMatch(/\bich\b|\bmein\b|\bmir\b/);
  });

  test('clicking the CTA navigates to the Offers page (AC1)', async ({ page }) => {
    await page.goto(SOLO);
    await page.locator('[data-post-cta] a[href="/angebot"]').click();
    await expect(page).toHaveURL(/\/angebot\/?$/);
    await expect(page.locator('h1')).toBeVisible();
  });
});
