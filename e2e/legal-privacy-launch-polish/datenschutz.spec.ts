import { test, expect } from '@playwright/test';

// T3 / R2, R5, R8 — the Datenschutzerklärung names Netlify as host + Forms
// processor, the processed data, the Art. 6 legal bases, the US-transfer
// safeguard (DPA/SCC), the one-month retention rule, the full rights list incl.
// Beschwerde bei der Aufsichtsbehörde, and a contact email.
test.describe('Datenschutzerklärung (DSGVO)', () => {
  let body = '';
  test.beforeEach(async ({ page }) => {
    const res = await page.goto('/datenschutz', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    body = await page.locator('main').innerText();
  });

  test('renders a Datenschutz heading (R2)', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Datenschutz/i })).toBeVisible();
  });

  test('names Netlify as host + Forms processor with US transfer (R5)', () => {
    expect(body).toMatch(/Netlify/);
    expect(body).toMatch(/USA|Vereinigte Staaten/);
    expect(body).toMatch(/Standardvertragsklauseln|SCC/);
    expect(body).toMatch(/Auftragsverarbeitung|DPA/);
  });

  test('discloses processed data + Art. 6 legal bases (R5)', () => {
    expect(body).toMatch(/IP-Adresse|Server-Logfiles|Logfile/i);
    expect(body).toMatch(/Formular|Anfrage/i);
    expect(body).toMatch(/Art\.?\s*6/);
  });

  test('states the one-month-after-closing retention rule (R8)', () => {
    expect(body).toMatch(/innerhalb eines Monats nach Abschluss/i);
  });

  test('lists the data-subject rights incl. Beschwerde bei der Aufsichtsbehörde (R8)', () => {
    for (const right of ['Auskunft', 'Berichtigung', 'Löschung', 'Einschränkung', 'Widerspruch', 'Datenübertragbarkeit']) {
      expect(body).toMatch(new RegExp(right, 'i'));
    }
    expect(body).toMatch(/Aufsichtsbehörde/);
  });

  test('offers a contact email for exercising rights (R8) without leaking plaintext', async ({ page }) => {
    const html = await page.content();
    expect(html).not.toContain('website@cib.is');
    await expect(page.locator('a[data-eml]')).not.toHaveCount(0);
  });
});
