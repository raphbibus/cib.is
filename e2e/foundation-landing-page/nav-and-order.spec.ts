import { test, expect } from '@playwright/test';

// AC14 — header nav anchors; AC5 — story-first DOM order.
test.describe('header nav + story-first arc', () => {
  test('header shows the wordmark and only in-page anchor links (AC14)', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header.getByRole('link', { name: /cib.*is/i })).toBeVisible();

    const navLinks = header.locator('nav a');
    await expect(navLinks).toHaveCount(2);
    const hrefs = await navLinks.evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute('href')),
    );
    for (const href of hrefs) {
      expect(href!.startsWith('#')).toBe(true); // in-page only, no routes
      // target id must exist
      await expect(page.locator(href!)).toHaveCount(1);
    }
  });

  test('clicking a nav anchor scrolls to the matching section (AC14)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Kontakt' }).click();
    await expect(page).toHaveURL(/#kontakt$/);
    // smooth-scroll is async — poll until the section top reaches the fold
    await expect
      .poll(async () => (await page.locator('#kontakt').boundingBox())!.y, { timeout: 5000 })
      .toBeLessThan(200);
  });

  test('DOM order is Hero → Story → experience → CTA (AC5)', async ({ page }) => {
    await page.goto('/');
    const tops = await page.evaluate(() => {
      const y = (sel: string) => {
        const el = document.querySelector(sel);
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
      };
      return {
        hero: y('#hero'),
        story: y('#story'),
        erfahrung: y('#erfahrung'),
        kontakt: y('#kontakt'),
      };
    });
    expect(tops.hero).toBeLessThan(tops.story);
    expect(tops.story).toBeLessThan(tops.erfahrung);
    expect(tops.erfahrung).toBeLessThan(tops.kontakt);
  });
});
