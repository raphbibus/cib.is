import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// T8 / R9, AC9 — @astrojs/sitemap generates /sitemap-index.xml (excluding
// /danke); public/robots.txt allows all crawlers and points to the sitemap on
// the canonical www host.
const root = fileURLToPath(new URL('..', import.meta.url));
const dist = (f: string) => fileURLToPath(new URL('../dist/' + f, import.meta.url));

describe('sitemap & robots (build output)', () => {
  beforeAll(() => {
    if (!existsSync(dist('sitemap-index.xml'))) {
      execSync('npm run build', { cwd: root, stdio: 'inherit' });
    }
  }, 180_000);

  it('emits a sitemap index at /sitemap-index.xml (R9/AC9)', () => {
    expect(existsSync(dist('sitemap-index.xml'))).toBe(true);
  });

  it('lists site routes on the canonical www host but excludes /danke (R9)', () => {
    // collect every generated sitemap-*.xml body
    const xml = readdirSync(fileURLToPath(new URL('../dist', import.meta.url)))
      .filter((f) => /^sitemap.*\.xml$/.test(f))
      .map((f) => readFileSync(dist(f), 'utf8'))
      .join('\n');
    expect(xml).toMatch(/https:\/\/www\.cib\.is\//);
    // the no-JS thank-you page must not be advertised to crawlers
    expect(xml).not.toMatch(/https:\/\/www\.cib\.is\/danke/);
  });

  it('ships robots.txt: allow-all + sitemap reference on www (R9/AC9)', () => {
    expect(existsSync(dist('robots.txt'))).toBe(true);
    const robots = readFileSync(dist('robots.txt'), 'utf8');
    expect(robots).toMatch(/User-agent:\s*\*/i);
    expect(robots).toMatch(/Allow:\s*\//i);
    expect(robots).toMatch(/Sitemap:\s*https:\/\/www\.cib\.is\/sitemap-index\.xml/i);
  });
});
