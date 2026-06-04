import { test, expect } from '@playwright/test';

// AC7 — images via astro:assets; AC8 — responsive; AC11 — keyboard focus visible.
test.describe('images, responsive layout, a11y', () => {
  test('feature image is an optimized astro:assets output, not a raw placeholder (AC7)', async ({
    page,
  }) => {
    await page.goto('/');
    const img = page.locator('main img').first();
    await expect(img).toBeVisible();
    const src = (await img.getAttribute('src'))!;
    expect(src).toContain('/_astro/');
    expect(src).not.toContain('placeholders');
    // explicit dimensions prevent CLS
    expect(await img.getAttribute('width')).toBeTruthy();
    expect(await img.getAttribute('height')).toBeTruthy();
  });

  for (const vp of [
    { name: 'mobile', width: 375, height: 800 },
    { name: 'desktop', width: 1280, height: 900 },
  ]) {
    test(`layout adapts with no horizontal overflow at ${vp.name} (AC8)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test('first interactive element is keyboard-reachable with a visible focus ring (AC11)', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Tab'); // skip-link
    const focus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const s = getComputedStyle(el);
      return { tag: el.tagName, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth };
    });
    expect(focus.tag).toBe('A');
    expect(focus.outlineStyle).not.toBe('none');
    expect(parseFloat(focus.outlineWidth)).toBeGreaterThanOrEqual(2);
  });
});
