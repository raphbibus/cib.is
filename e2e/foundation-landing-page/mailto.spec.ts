import { test, expect } from '@playwright/test';

const EMAIL = 'ralph@cib.is';

// AC6 — obfuscated mailto absent from raw HTML yet works on interaction.
// AC15 — footer wordmark + copyright + working mailto; no live legal links.
test.describe('obfuscated mailto + footer', () => {
  test('raw served HTML contains neither the address nor a mailto: link (AC6)', async ({
    page,
    baseURL,
  }) => {
    const res = await page.request.get(baseURL!);
    const html = await res.text();
    expect(html).not.toContain(EMAIL);
    expect(html).not.toContain('mailto:' + EMAIL.split('@')[0]);
  });

  test('CTA mailto resolves to the correct address after interaction (AC6)', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /Schreib mir/i });
    await expect(cta).toBeVisible();
    // before interaction the href is just a placeholder
    await expect(cta).toHaveAttribute('href', '#');
    // focusing reveals the assembled mailto (keyboard path)
    await cta.focus();
    await expect(cta).toHaveAttribute('href', new RegExp(`^mailto:${EMAIL}`));
  });

  test('footer shows wordmark, copyright, working mailto and no live legal links (AC15)', async ({
    page,
  }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.getByText(/cib/i).first()).toBeVisible();
    await expect(footer.getByText(/©/)).toBeVisible();

    const mail = footer.getByRole('link', { name: /E-?Mail/i });
    await mail.focus();
    await expect(mail).toHaveAttribute('href', new RegExp(`^mailto:${EMAIL}`));

    // Impressum / Datenschutz are reserved placeholders, NOT live links yet.
    await expect(footer.getByRole('link', { name: /Impressum/i })).toHaveCount(0);
    await expect(footer.getByRole('link', { name: /Datenschutz/i })).toHaveCount(0);
    await expect(footer.locator('[data-legal-slot="impressum"]')).toBeVisible();
    await expect(footer.locator('[data-legal-slot="datenschutz"]')).toBeVisible();
  });
});
