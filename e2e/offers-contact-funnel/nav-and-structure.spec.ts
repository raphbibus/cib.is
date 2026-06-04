import { test, expect } from '@playwright/test';

// T2 / T9 / T11 — one scrolling Offers page, three offers in priority order
// then the Friday, a single primary-CTA style repeated top + bottom anchoring
// to the form, and the landing CTA leading into the funnel (R3, R9, AC2, AC8).
test.describe('offers page structure & funnel wiring', () => {
  test('renders the three offers in order leadership → org dev → agile, then the Friday (AC2)', async ({
    page,
  }) => {
    await page.goto('/angebot');

    // section ids appear in DOM order
    const ids = await page.locator('section[id]').evaluateAll((els) => els.map((e) => e.id));
    const idx = (id: string) => ids.indexOf(id);
    expect(idx('leadership')).toBeGreaterThanOrEqual(0);
    expect(idx('leadership')).toBeLessThan(idx('org-dev'));
    expect(idx('org-dev')).toBeLessThan(idx('agile'));
    expect(idx('agile')).toBeLessThan(idx('freitag'));

    // single <main>, one h1
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('uses exactly one primary-CTA style and repeats it top + bottom (AC8)', async ({ page }) => {
    await page.goto('/angebot');
    // Only one data-variant style is used for buttons on the page.
    const variants = await page
      .locator('[data-variant]')
      .evaluateAll((els) => Array.from(new Set(els.map((e) => e.getAttribute('data-variant')))));
    expect(variants).toEqual(['solid']);

    // CTA links to the form anchor appear at least twice (top + bottom).
    const ctas = page.locator('a[href="#kontakt"][data-variant="solid"]');
    expect(await ctas.count()).toBeGreaterThanOrEqual(2);
  });

  test('clicking a primary CTA jumps to the on-page contact-form section (AC8)', async ({
    page,
  }) => {
    await page.goto('/angebot');
    await page.locator('a[href="#kontakt"]').first().click();
    await expect(page).toHaveURL(/#kontakt$/);
    // the form section is the scroll target and is in view
    const formSection = page.locator('section#kontakt');
    await expect(formSection).toBeVisible();
    await expect(formSection.locator('form[data-contact]')).toBeVisible();
  });

  test('landing primary CTA leads to /angebot (R9/AC8)', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /Angebot ansehen/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/angebot');
  });
});
