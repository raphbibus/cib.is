import { test, expect } from '@playwright/test';

// T14 — progressive enhancement, no-JS path (R7, AC6, TD1). With JavaScript
// disabled, the script enhancement is absent, so the native <form> must POST to
// its action (/danke). The POST is intercepted (local preview has no Netlify
// backend) to prove a native navigation is triggered rather than staying put.
test.describe('progressive enhancement: no-JS path', () => {
  // reducedMotion avoids the decorative equalizer animation making the submit
  // button's click target flaky; the site honors prefers-reduced-motion anyway.
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('the form carries the native POST/data-netlify/action attrs without JS', async ({
    page,
  }) => {
    await page.goto('/angebot');
    const form = page.locator('form[data-contact]');
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute('data-netlify', 'true');
    await expect(form).toHaveAttribute('action', '/danke');
  });

  test('submitting natively POSTs toward /danke (intercepted) instead of staying in place', async ({
    page,
  }) => {
    await page.route('**/danke', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Danke</h1>' });
      } else {
        await route.continue();
      }
    });

    await page.goto('/angebot');
    await page.fill('[name="name"]', 'Ada');
    await page.fill('[name="email"]', 'ada@example.com');
    await page.fill('[name="message"]', 'Hallo ohne JS');

    // force:true skips actionability auto-wait (the decorative animation can
    // keep the click target "unstable"); we only care that the native form
    // submission fires a POST toward the action.
    const [request] = await Promise.all([
      page.waitForRequest((r) => r.url().includes('/danke') && r.method() === 'POST'),
      page.locator('button[type="submit"]').click({ force: true }),
    ]);
    expect(request.method()).toBe('POST');
  });
});

// /danke renders the German confirmation (JS on is fine here).
test.describe('static /danke success page', () => {
  test('renders the persönlich / 2 Werktage confirmation (R11/AC10)', async ({ page }) => {
    await page.goto('/danke');
    await expect(page.getByText(/persönlich/i)).toBeVisible();
    await expect(page.getByText(/2 Werktage/)).toBeVisible();
  });
});
