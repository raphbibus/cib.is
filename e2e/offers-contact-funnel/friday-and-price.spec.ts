import { test, expect } from '@playwright/test';

// T3 / T11 — the Friday is the headline product priced 490 €, with net = gross,
// the >2h-from-Bamberg travel note, and on-site/remote delivery — all visible
// on first paint with NO interaction (R1, R2, R4, R8, AC1, AC3, AC7).
test.describe('Friday model & price (first paint, no interaction)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/angebot', { waitUntil: 'domcontentloaded' });
  });

  test('shows 490 € on first paint without interaction (AC3)', async ({ page }) => {
    await expect(page.getByText('490 €').first()).toBeVisible();
  });

  test('states net = gross / Kleinunternehmer (AC1)', async ({ page }) => {
    await expect(page.getByText(/netto = brutto/i).first()).toBeVisible();
    await expect(page.getByText(/Kleinunternehmer/i).first()).toBeVisible();
  });

  test('states the >2h-from-Bamberg travel-cost note (AC1)', async ({ page }) => {
    const friday = page.locator('section#freitag');
    await expect(friday.getByText(/Bamberg/)).toBeVisible();
    await expect(friday.getByText(/Reisekosten/i)).toBeVisible();
  });

  test('states on-site default + remote on request (AC7)', async ({ page }) => {
    const friday = page.locator('section#freitag');
    await expect(friday.getByText(/vor Ort/i)).toBeVisible();
    await expect(friday.getByText(/remote/i)).toBeVisible();
  });

  test('the price sits near a primary CTA (R4)', async ({ page }) => {
    // a 490 € price tag and a CTA both render above the fold area of the top hero
    const hero = page.locator('section').first();
    await expect(hero.getByText('490 €')).toBeVisible();
    await expect(hero.locator('a[href="#kontakt"]')).toBeVisible();
  });
});
