import { test, expect } from '@playwright/test';

// AC14 — header nav anchors; AC5 — story-first DOM order.
test.describe('header nav + story-first arc', () => {
  test('header shows the wordmark (home) and a Story link back to the start page (AC14)', async ({
    page,
  }) => {
    await page.goto('/');
    const header = page.locator('header');
    // wordmark links home
    await expect(header.getByRole('link', { name: /cib.*is/i })).toHaveAttribute('href', '/');

    // Nav: a "Story" link back to the start page + a "Blog" link (Epic 3).
    await expect(header.getByRole('link', { name: 'Story' })).toHaveAttribute('href', '/#story');
    await expect(header.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
    // the Story target exists on the home page
    await expect(page.locator('#story')).toHaveCount(1);
  });

  test('clicking the Story nav link scrolls to the story section on the home page (AC14)', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Story' }).click();
    await expect(page).toHaveURL(/\/#story$/);
    // smooth-scroll is async — poll until the section top reaches the fold
    await expect
      .poll(async () => (await page.locator('#story').boundingBox())!.y, { timeout: 5000 })
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
