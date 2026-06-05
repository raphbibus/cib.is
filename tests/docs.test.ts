import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (f: string) =>
  readFileSync(fileURLToPath(new URL('../docs/' + f, import.meta.url)), 'utf8').toLowerCase();

const readAbs = (rel: string) =>
  readFileSync(fileURLToPath(new URL('../' + rel, import.meta.url)), 'utf8').toLowerCase();

// T14 / AC3 — both /docs files exist and cover the R3 topics.
describe('docs deliverables', () => {
  it('docs/architecture.md exists and covers stack, structure, deploy + Netlify Forms gotcha', () => {
    const f = fileURLToPath(new URL('../docs/architecture.md', import.meta.url));
    expect(existsSync(f)).toBe(true);
    const md = read('architecture.md');
    expect(md).toContain('astro');
    expect(md).toContain('tailwind');
    expect(md).toMatch(/folder structure|project structure|directory/);
    expect(md).toMatch(/build|deploy/);
    expect(md).toContain('netlify forms');
  });

  it('docs/coding-guidelines.md exists and covers patterns, naming, a11y, perf, content', () => {
    const f = fileURLToPath(new URL('../docs/coding-guidelines.md', import.meta.url));
    expect(existsSync(f)).toBe(true);
    const md = read('coding-guidelines.md');
    expect(md).toMatch(/component/);
    expect(md).toMatch(/naming/);
    expect(md).toMatch(/accessib|a11y/);
    expect(md).toMatch(/perf|lighthouse|budget/);
    expect(md).toMatch(/content|copy|authoring/);
  });

  // T12 / R17 — the blog post-authoring guide documents the format authors need.
  it('docs/content-authoring.md exists and covers frontmatter, filename/date, images, CTA', () => {
    const f = fileURLToPath(new URL('../docs/content-authoring.md', import.meta.url));
    expect(existsSync(f)).toBe(true);
    const md = read('content-authoring.md');
    expect(md).toMatch(/frontmatter|coauthor/);
    expect(md).toMatch(/filename|yyyy-mm-dd|date/);
    expect(md).toMatch(/image|astro:assets/);
    expect(md).toMatch(/cta|angebot/);
    expect(md).toMatch(/slug|h1|title/);
  });
});

// T2 / R4, R6, R11 / AC4, AC11 — the living voice + design guide and the audit
// that scopes the coherence pass. Existence + required sections (the guide) and
// full-surface coverage (the audit). Subjective quality is human-gated (T9).
describe('coherence-pass voice & design deliverables', () => {
  it('docs/voice-and-design.md exists with glossary, register rule, principles, do/don\'t, design reference + checklist', () => {
    const f = fileURLToPath(new URL('../docs/voice-and-design.md', import.meta.url));
    expect(existsSync(f)).toBe(true);
    const md = read('voice-and-design.md');
    // terminology glossary
    expect(md).toMatch(/glossar|terminolog/);
    // Sie-on-funnel / first-person-in-blog register rule
    expect(md).toMatch(/register/);
    expect(md).toContain('sie');
    expect(md).toMatch(/erste person|first.person|ich-form|first person/);
    // 3–5 named voice principles
    expect(md).toMatch(/prinzip|principle/);
    // do/don't examples
    expect(md).toMatch(/do\s*\/?\s*don'?t|so nicht|so ja|gut:|schlecht:/);
    // design reference: tokens + shared components
    expect(md).toMatch(/token|@theme/);
    expect(md).toMatch(/button|komponent|component/);
    // the embedded voice checklist (R6)
    expect(md).toMatch(/checkliste|checklist/);
  });

  it('design-voice-audit.md exists and covers every in-scope surface across the five drift categories', () => {
    const rel = 'specs/coherence-pass-design-voice/design-voice-audit.md';
    expect(existsSync(fileURLToPath(new URL('../' + rel, import.meta.url)))).toBe(true);
    const md = readAbs(rel);
    // every in-scope surface
    for (const surface of ['landing', 'offers', 'contact form', 'blog', 'legal', '404', 'chrome']) {
      expect(md, `audit must cover surface: ${surface}`).toContain(surface);
    }
    // the five drift categories
    for (const cat of ['token', 'cta', 'component', 'copy', 'register']) {
      expect(md, `audit must cover category: ${cat}`).toContain(cat);
    }
  });
});
