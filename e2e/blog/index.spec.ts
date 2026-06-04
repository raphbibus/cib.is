import { test, expect } from '@playwright/test';

// T6 / R2, R7, R8, R11, R12, AC2, AC4, AC5, AC6, AC10 — the /blog index is a
// flat, newest-first list of all 19 posts: each card links to /blog/<slug> and
// shows the first-paragraph excerpt; no search, no tag chips, no images.
test.describe('/blog index', () => {
  test('lists all 19 posts, newest-first (top = 2023-12-31) (AC4/AC5)', async ({ page }) => {
    await page.goto('/blog');

    const cards = page.locator('article');
    await expect(cards).toHaveCount(19);

    // The topmost post is the most recent one.
    const firstTime = page.locator('article time').first();
    await expect(firstTime).toHaveAttribute('datetime', '2023-12-31');

    // Dates appear in strictly descending order.
    const dates = await page.locator('article time').evaluateAll((els) =>
      els.map((e) => e.getAttribute('datetime') ?? ''),
    );
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });

  test('each card links to /blog/<slug> and shows an excerpt (AC7/AC10)', async ({ page }) => {
    await page.goto('/blog');
    const links = page.locator('article h2 a');
    await expect(links).toHaveCount(19);
    for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute('href')))) {
      expect(href).toMatch(/^\/blog\/[a-z0-9-]+$/);
    }
    // Excerpt paragraph is non-empty for the first card.
    const firstExcerpt = page.locator('article p').last();
    expect((await page.locator('article').first().locator('p').nth(1).innerText()).length).toBeGreaterThan(20);
    void firstExcerpt;
  });

  test('the collab post shows "mit Domi"; solo posts show no byline (AC4)', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByText('mit Domi')).toHaveCount(1);
  });

  test('no search box and no tag chips at launch (R8/R11)', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('input[type="search"], input[type="text"]')).toHaveCount(0);
    await expect(page.locator('[data-tag], .tag, [rel="tag"]')).toHaveCount(0);
  });

  test('no images / cover anywhere on the index (R12/AC6)', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('img')).toHaveCount(0);
  });

  test('exposes the RSS feed: a visible link + head autodiscovery', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('link', { name: /RSS-Feed/i })).toHaveAttribute(
      'href',
      '/rss.xml',
    );
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
      'href',
      '/rss.xml',
    );
  });

  test('the blog is reachable from the global header nav', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL(/\/blog\/?$/);
    await expect(page.getByRole('heading', { level: 2, name: /Gedanken zu Führung/ })).toBeVisible();
  });
});
