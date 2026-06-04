import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (f: string) =>
  readFileSync(fileURLToPath(new URL('../docs/' + f, import.meta.url)), 'utf8').toLowerCase();

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
