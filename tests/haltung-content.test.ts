import { describe, it, expect } from 'vitest';
import { offers } from '@/content/offers';

// T1 — "Warum ich das mache" / Haltung content schema (R2, R3, R4, R5, R6, R7,
// R11; AC2, AC3, AC4, AC6, AC10). German, formal Sie, on-brand, no lorem. Shape
// is asserted here so the page markup + HaltungBlock can rely on it.
describe('content/offers.haltung', () => {
  const h = offers.haltung;

  it('exposes the haltung section with the canonical id/kicker/title (R2/R10; AC1/AC9)', () => {
    expect(h).toBeTruthy();
    expect(h.id).toBe('haltung');
    expect(h.kicker).toBe('Haltung');
    expect(h.title).toBe('Warum ich das mache');
  });

  it('labels the two panels "Was Sie bekommen" and "Was ich bekomme" (R9/AC8)', () => {
    expect(h.reader.label).toBe('Was Sie bekommen');
    expect(h.mine.label).toBe('Was ich bekomme');
  });

  it('each block carries a bold one-line claim + a 2–3 sentence paragraph (R11/AC10)', () => {
    for (const block of [h.reader, h.mine]) {
      expect(block.claim.length).toBeGreaterThan(0);
      expect(block.body.length).toBeGreaterThan(40);
    }
  });

  it('the lead states the consultant-skepticism / hands-on-under-pressure stance (R3/AC2)', () => {
    expect(h.lead.length).toBeGreaterThan(40);
    expect(h.lead).toMatch(/Berater|Stunden/i);
  });

  it('"Was ich bekomme" names the Erfahrung trade and ties it to the 490 € (R4/R5/AC3)', () => {
    expect(h.mine.body).toMatch(/Erfahrung/i);
    expect(h.mine.body).toMatch(/490/);
  });

  it('uses formal Sie — no du/dein/dich/dir/euch/euer reader-address (R7/AC4)', () => {
    const blob = [h.lead, h.title, h.kicker, h.reader.label, h.reader.claim, h.reader.body, h.mine.label, h.mine.claim, h.mine.body].join('\n');
    expect(blob).not.toMatch(/\b(du|dein|dich|dir|euch|euer|eure?)\b/i);
  });

  it('is German (umlaut / ß present) and contains no lorem-ipsum (R7)', () => {
    const blob = [h.lead, h.reader.claim, h.reader.body, h.mine.claim, h.mine.body].join('\n');
    expect(blob.toLowerCase()).not.toContain('lorem');
    expect(blob.toLowerCase()).not.toContain('ipsum');
    expect(blob).toMatch(/[äöüÄÖÜß]/);
  });
});
