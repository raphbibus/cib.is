import { test, expect } from '@playwright/test';

// T7a / T7b — R3, R10, R12, R18, R15, AC2, AC6, AC7, AC10 — a post renders in
// Prose with the loader-derived title as the single <h1> (no duplicate from the
// body), no images, the right byline, and per-post article SEO/OG meta.
const SOLO = '/blog/innovationsangst-eine-geschichte-ueber-alman-memes-sauna-und-organisationskultur';
const COLLAB = '/blog/einfache-wahrheiten';

test.describe('/blog/<slug> post detail', () => {
  test('renders the title exactly once as the page <h1>, no duplicate H1 (AC7)', async ({
    page,
  }) => {
    await page.goto(SOLO);
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('Innovationsangst');
    // The body must not repeat the title as another heading.
    await expect(
      page.getByRole('heading', { name: /^Innovationsangst/, level: 2 }),
    ).toHaveCount(0);
  });

  test('body renders inside the Prose wrapper with real content (R3/AC2)', async ({ page }) => {
    await page.goto(SOLO);
    const article = page.locator('article');
    await expect(article).toBeVisible();
    expect((await article.innerText()).length).toBeGreaterThan(500);
  });

  test('no images / cover image on a post (R12/AC6)', async ({ page }) => {
    await page.goto(SOLO);
    await expect(page.locator('img')).toHaveCount(0);
  });

  test('the collab post shows "mit Domi"; a solo post shows no byline (R9/AC4)', async ({
    page,
  }) => {
    // The byline lives in the post <header> next to the date — scope there so
    // the German word "mit" in the body prose doesn't cause a false positive.
    await page.goto(COLLAB);
    await expect(page.locator('article header')).toContainText('mit Domi');

    await page.goto(SOLO);
    await expect(page.locator('article header')).not.toContainText(/\bmit\b/);
  });

  test('emits article SEO/OG meta with a description and the noindex guard (R15/T7b)', async ({
    page,
  }) => {
    await page.goto(SOLO);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex,nofollow',
    );
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect((desc ?? '').length).toBeGreaterThan(20);
  });

  test('is reachable from the index link (AC10)', async ({ page }) => {
    await page.goto('/blog');
    await page.getByRole('link', { name: /Innovationsangst/ }).click();
    await expect(page).toHaveURL(new RegExp(SOLO.replace(/\//g, '\\/')));
    await expect(page.locator('h1')).toContainText('Innovationsangst');
  });
});
