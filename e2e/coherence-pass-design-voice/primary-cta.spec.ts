import { test, expect } from '@playwright/test';

// T3 / R3 / AC3 — the unified primary-CTA treatment.
//
// Every button-styled CTA OUTSIDE <header>/<footer> renders data-variant="primary"
// and shows the green hard-shadow on :hover (the promoted landing→offers hover,
// now the single shared treatment, TD1). Header/footer chrome buttons are
// explicitly excluded; plain inline text links carry no data-variant.

const NEON_GREEN_RGB = '57, 255, 20'; // --color-neon-green #39ff14

const SURFACES = [
  { name: 'landing', path: '/' },
  { name: 'offers', path: '/angebot' },
  { name: '404', path: '/diese-seite-gibt-es-nicht-xyz' },
];

test.describe('unified primary CTA treatment (AC3)', () => {
  for (const s of SURFACES) {
    test(`${s.name}: every button CTA outside header/footer is data-variant="primary"`, async ({
      page,
    }) => {
      await page.goto(s.path);
      const variants = await page.locator('[data-variant]').evaluateAll((els) =>
        els
          .filter((e) => !e.closest('header') && !e.closest('footer'))
          .map((e) => e.getAttribute('data-variant')),
      );
      expect(variants.length, `${s.name} should have at least one body CTA`).toBeGreaterThan(0);
      for (const v of variants) expect(v).toBe('primary');
    });

    test(`${s.name}: header and footer carry no primary-variant buttons`, async ({ page }) => {
      await page.goto(s.path);
      await expect(page.locator('header [data-variant="primary"]')).toHaveCount(0);
      await expect(page.locator('footer [data-variant="primary"]')).toHaveCount(0);
    });
  }

  test('blog post: the post CTA button is data-variant="primary"', async ({ page }) => {
    await page.goto('/blog');
    await page.locator('a[href^="/blog/"]').first().click();
    const cta = page.locator('[data-post-cta] [data-variant]');
    await expect(cta).toHaveAttribute('data-variant', 'primary');
  });

  test('the primary CTA reveals the green hard-shadow on hover', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('[data-variant="primary"]').first();
    await cta.hover();
    const shadow = await cta.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');
    expect(shadow).toContain(NEON_GREEN_RGB);
  });

  test('header/footer nav links are not styled as primary CTAs', async ({ page }) => {
    await page.goto('/');
    // The "Buchen" header button and footer links must not be primary.
    await expect(page.locator('header a[data-variant="primary"]')).toHaveCount(0);
    await expect(page.locator('footer a[data-variant="primary"]')).toHaveCount(0);
  });
});
