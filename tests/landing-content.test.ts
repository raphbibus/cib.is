import { describe, it, expect } from 'vitest';
import { landing } from '@/content/landing';

// T11 / AC12 — German, credible, CV-traceable copy; no lorem-ipsum.
describe('content/landing', () => {
  it('has a hero with a kicker, headline and lead', () => {
    expect(landing.hero.kicker.length).toBeGreaterThan(0);
    expect(landing.hero.headline.length).toBeGreaterThan(10);
    expect(landing.hero.lead.length).toBeGreaterThan(20);
  });

  it('has at least two story/experience sections', () => {
    expect(landing.sections.length).toBeGreaterThanOrEqual(2);
    for (const s of landing.sections) {
      expect(s.id).toMatch(/^[a-z0-9-]+$/);
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.body.length).toBeGreaterThan(20);
    }
  });

  it('has a CTA with a label and lead-in', () => {
    expect(landing.cta.headline.length).toBeGreaterThan(0);
    expect(landing.cta.buttonLabel.length).toBeGreaterThan(0);
  });

  it('contains no lorem-ipsum placeholder text', () => {
    const blob = JSON.stringify(landing).toLowerCase();
    expect(blob).not.toContain('lorem');
    expect(blob).not.toContain('ipsum');
  });

  it('traces key CV claims (credibility as the close)', () => {
    const blob = JSON.stringify(landing);
    // Credibility anchors that exist in specs/2026-cv-de-ralph.pdf
    expect(blob).toMatch(/Thomann/);
    expect(blob).toMatch(/(25 auf 100|von 25|100 Mitarbeit)/);
    // New York station + Lagarde 1 volunteering must be represented
    expect(blob).toMatch(/New York/);
    expect(blob).toMatch(/Lagarde/);
  });

  it('keeps the experience section free of jargon-only filler (KMU-readable)', () => {
    const cards = landing.sections.flatMap((s) => s.cards ?? []);
    expect(cards.length).toBeGreaterThanOrEqual(6);
    for (const c of cards) {
      expect(c.body.length).toBeGreaterThan(40);
    }
  });

  it('contains German content (umlauts / ß present)', () => {
    const blob = JSON.stringify(landing);
    expect(blob).toMatch(/[äöüÄÖÜß]/);
  });
});
