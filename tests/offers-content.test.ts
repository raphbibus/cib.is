import { describe, it, expect } from 'vitest';
import { offers } from '@/content/offers';

// T1 — Offers content schema (R1, R2, R4, R5, R8, R11). German, on-brand,
// no lorem-ipsum. The shape is asserted here so the page markup can rely on it.
describe('content/offers', () => {
  it('has exactly three offers in priority order leadership → org-dev → agile (R3)', () => {
    expect(offers.offers).toHaveLength(3);
    expect(offers.offers.map((o) => o.id)).toEqual(['leadership', 'org-dev', 'agile']);
    for (const o of offers.offers) {
      expect(o.id).toMatch(/^[a-z0-9-]+$/);
      expect(o.title.length).toBeGreaterThan(0);
      expect(o.body.length).toBeGreaterThan(20);
    }
  });

  it('sells the Friday at 490 € with a net = gross note (R1, R2)', () => {
    expect(offers.friday.price).toContain('490');
    expect(offers.friday.priceNote).toMatch(/netto.*brutto|brutto.*netto|Kleinunternehmer/i);
  });

  it('states the travel-cost note: >2h from Bamberg ⇒ Reisekosten (R2)', () => {
    expect(offers.friday.travelNote).toMatch(/Bamberg/);
    expect(offers.friday.travelNote).toMatch(/Reisekosten/i);
  });

  it('states on-site default + remote on request (R8/AC7)', () => {
    expect(offers.friday.delivery).toMatch(/vor Ort/i);
    expect(offers.friday.delivery).toMatch(/remote|aus der Ferne/i);
  });

  it('requires name, email and message (R5)', () => {
    expect(offers.form.required).toEqual(['name', 'email', 'message']);
    expect(offers.form.fields.name.length).toBeGreaterThan(0);
    expect(offers.form.fields.email.length).toBeGreaterThan(0);
    expect(offers.form.fields.company.length).toBeGreaterThan(0);
    expect(offers.form.fields.role.length).toBeGreaterThan(0);
    expect(offers.form.fields.message.length).toBeGreaterThan(0);
  });

  it('carries a captcha label, submit label and honeypot field name', () => {
    expect(offers.form.captchaLabel.length).toBeGreaterThan(0);
    expect(offers.form.submitLabel.length).toBeGreaterThan(0);
    expect(offers.form.honeypotName).toMatch(/^[a-z0-9-]+$/);
  });

  it('exposes field-level validation messages (T5)', () => {
    expect(offers.form.errors.name.length).toBeGreaterThan(0);
    expect(offers.form.errors.email.length).toBeGreaterThan(0);
    expect(offers.form.errors.emailFormat.length).toBeGreaterThan(0);
    expect(offers.form.errors.message.length).toBeGreaterThan(0);
    expect(offers.form.errors.captcha.length).toBeGreaterThan(0);
  });

  it('promises a personal reply within 2 Werktage (R11/AC10)', () => {
    expect(offers.confirmation.body).toMatch(/persönlich/i);
    expect(offers.confirmation.body).toMatch(/2 Werktage/);
    expect(offers.confirmation.headline.length).toBeGreaterThan(0);
  });

  it('carries inline submit-failure copy (R12/AC11)', () => {
    expect(offers.error.body.length).toBeGreaterThan(0);
  });

  it('has a single primary CTA with an anchor id and label (R9)', () => {
    expect(offers.cta.id).toMatch(/^[a-z0-9-]+$/);
    expect(offers.cta.label.length).toBeGreaterThan(0);
    expect(offers.cta.headline.length).toBeGreaterThan(0);
  });

  it('contains no lorem-ipsum and is German (umlauts / ß present)', () => {
    const blob = JSON.stringify(offers).toLowerCase();
    expect(blob).not.toContain('lorem');
    expect(blob).not.toContain('ipsum');
    expect(JSON.stringify(offers)).toMatch(/[äöüÄÖÜß]/);
  });
});
