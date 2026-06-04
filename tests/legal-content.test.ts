import { describe, it, expect } from 'vitest';
import { impressum, datenschutz } from '@/content/legal';

// T1 / R2, R3, R5, R8 — the typed legal content module. Shape is asserted here
// so the page markup (impressum.astro / datenschutz.astro) can rely on it.
// German only, no lorem-ipsum; personal data are clearly-marked placeholders
// Ralph fills before go-live.
describe('content/legal — Impressum', () => {
  it('carries the §5 DDG mandatory fields: name, address, email, USt-IdNr (R2/R3)', () => {
    expect(impressum.name.length).toBeGreaterThan(0);
    expect(Array.isArray(impressum.address)).toBe(true);
    expect(impressum.address.length).toBeGreaterThan(0);
    expect(impressum.email.user.length).toBeGreaterThan(0);
    expect(impressum.email.domain).toMatch(/\./);
    expect(impressum.ustId.length).toBeGreaterThan(0);
  });

  it('states the §19 UStG Kleinunternehmer note (R3)', () => {
    expect(impressum.kleinunternehmerNote).toMatch(/§\s*19\s*UStG/);
    expect(impressum.kleinunternehmerNote).toMatch(/Umsatzsteuer/i);
  });

  it('provides a phone number as the second quick-contact channel (R7, per IHK)', () => {
    // §5 DDG / IHK: a direct phone line replaces the booking-form link.
    expect(impressum.phone).toMatch(/\d/);
    expect(impressum.phone.replace(/\D/g, '').length).toBeGreaterThanOrEqual(10);
  });
});

describe('content/legal — Datenschutz', () => {
  it('names a responsible controller (R5)', () => {
    expect(datenschutz.controller.length).toBeGreaterThan(0);
  });

  it('has a Netlify section disclosing hosting + Forms + US transfer (R5)', () => {
    const blob = JSON.stringify(datenschutz);
    expect(blob).toMatch(/Netlify/);
    const netlifySection = datenschutz.sections.find((s) => /Netlify/i.test(s.heading + s.body.join(' ')));
    expect(netlifySection, 'a section mentioning Netlify must exist').toBeTruthy();
    // legal bases + US-transfer safeguard (DPA / SCC / Standardvertragsklauseln)
    expect(blob).toMatch(/Art\.?\s*6/);
    expect(blob).toMatch(/Standardvertragsklauseln|SCC|DPA|Auftragsverarbeitung/i);
  });

  it('discloses the processed data categories: IP/server logs + form submissions (R5)', () => {
    const blob = JSON.stringify(datenschutz);
    expect(blob).toMatch(/IP|Server-?Log|Logfile/i);
    expect(blob).toMatch(/Formular|Anfrage/i);
  });

  it('states the one-month-after-closing retention rule (R8)', () => {
    expect(datenschutz.retention).toMatch(/Monat/);
    expect(datenschutz.retention).toMatch(/innerhalb eines Monats nach Abschluss/i);
  });

  it('lists the full data-subject rights incl. Beschwerde bei der Aufsichtsbehörde (R8)', () => {
    const joined = datenschutz.rights.join(' ');
    for (const right of ['Auskunft', 'Berichtigung', 'Löschung', 'Einschränkung', 'Widerspruch', 'Datenübertragbarkeit']) {
      expect(joined, `missing right: ${right}`).toMatch(new RegExp(right, 'i'));
    }
    expect(joined).toMatch(/Aufsichtsbehörde/);
    expect(datenschutz.supervisoryAuthority.length).toBeGreaterThan(0);
  });

  it('is German and contains no lorem-ipsum', () => {
    const blob = JSON.stringify({ impressum, datenschutz }).toLowerCase();
    expect(blob).not.toContain('lorem');
    expect(blob).not.toContain('ipsum');
    expect(JSON.stringify({ impressum, datenschutz })).toMatch(/[äöüÄÖÜß]/);
  });
});
