import { test, expect } from '@playwright/test';

// T4 — "Warum ich das mache" / Haltung section on /angebot (R1, R2, R6, R9, R10;
// AC1, AC5, AC6, AC8, AC9). Placed between #freitag and #kontakt, two labelled
// panels, no new CTA, reader-panel stacks first on mobile.
test.describe('Haltung section on /angebot', () => {
  test('renders kicker "Haltung" + title "Warum ich das mache" in #haltung, after #freitag and before #kontakt (AC1/AC9)', async ({
    page,
  }) => {
    await page.goto('/angebot');

    const section = page.locator('section#haltung');
    await expect(section).toHaveCount(1);
    await expect(section).toContainText('Haltung');
    await expect(section.getByRole('heading', { name: 'Warum ich das mache' })).toBeVisible();

    // DOM order: #haltung sits between #freitag and #kontakt (AC1).
    const ids = await page.locator('section[id]').evaluateAll((els) => els.map((e) => e.id));
    const idx = (id: string) => ids.indexOf(id);
    expect(idx('haltung')).toBeGreaterThan(idx('freitag'));
    expect(idx('haltung')).toBeLessThan(idx('kontakt'));
  });

  test('shows both labelled panels "Was Sie bekommen" and "Was ich bekomme" (AC8)', async ({
    page,
  }) => {
    await page.goto('/angebot');
    const section = page.locator('section#haltung');
    await expect(section.getByText('Was Sie bekommen')).toBeVisible();
    await expect(section.getByText('Was ich bekomme')).toBeVisible();
  });

  test('introduces no new CTA inside the section (AC5)', async ({ page }) => {
    await page.goto('/angebot');
    const section = page.locator('section#haltung');
    await expect(section.locator('a[href="#kontakt"]')).toHaveCount(0);
    await expect(section.locator('[data-variant]')).toHaveCount(0);
  });

  test('stacks "Was Sie bekommen" above "Was ich bekomme" on mobile (375px) (AC8)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/angebot');
    const section = page.locator('section#haltung');
    const readerBox = await section.getByText('Was Sie bekommen').boundingBox();
    const mineBox = await section.getByText('Was ich bekomme').boundingBox();
    expect(readerBox).not.toBeNull();
    expect(mineBox).not.toBeNull();
    expect(readerBox!.y).toBeLessThan(mineBox!.y);
  });
});
