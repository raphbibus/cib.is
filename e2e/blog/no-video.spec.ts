import { test, expect } from '@playwright/test';

// T11 / R4, AC3 — video embedding is out of scope: no <video>, no <iframe>, no
// video-player component anywhere in the blog (index or any post).
const PAGES = [
  '/blog',
  '/blog/innovationsangst-eine-geschichte-ueber-alman-memes-sauna-und-organisationskultur',
  '/blog/einfache-wahrheiten',
];

test.describe('no video anywhere in the blog', () => {
  for (const path of PAGES) {
    test(`${path} has no <video>, <iframe> or player`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('video')).toHaveCount(0);
      await expect(page.locator('iframe')).toHaveCount(0);
      await expect(page.locator('[data-video], .video-player, video-player')).toHaveCount(0);
    });
  }
});
