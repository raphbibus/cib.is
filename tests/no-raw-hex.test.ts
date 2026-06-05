import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

// T4 / R5 / AC5 (TD4) — mechanical token-hygiene lint.
//
// Markup must use @theme tokens / `var(--…)` / Tailwind token utilities, never a
// raw hex colour or an inline `style="…color…"`. This keeps a rebrand a one-edit
// change and stops token drift from silently returning (AD8). It is a MECHANICAL
// guard — it does not judge taste/coherence (that's Ralph's sign-off, D11).
//
// Scope: src/components/**/*.astro + src/pages/**/*.astro.
// global.css is exempt (that's where @theme hex literals legitimately live).

const root = new URL('../', import.meta.url);
const files = [
  ...globSync('src/components/**/*.astro', { cwd: fileURLToPath(root) }),
  ...globSync('src/pages/**/*.astro', { cwd: fileURLToPath(root) }),
];

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, root)), 'utf8');

// A raw CSS hex colour: # + 3, 4, 6 or 8 hex digits, NOT preceded by `&` (which
// would make it an HTML numeric entity like &#8217;) and not part of a longer
// hex run.
const RAW_HEX = /(?<![&\w])#[0-9a-fA-F]{3,8}\b/g;

// An inline style attribute that sets a colour (color / background-color / etc).
const INLINE_STYLE_COLOR = /style\s*=\s*("|')[^"']*color\s*:[^"']*\1/i;

describe('token hygiene — no raw hex / inline colour in markup (T4/TD4)', () => {
  it('scans at least the known surface components + pages', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it.each(files)('%s uses tokens, not raw hex colours', (rel) => {
    const src = read(rel);
    const hits = src.match(RAW_HEX) ?? [];
    expect(hits, `raw hex colour(s) in ${rel}: ${hits.join(', ')}`).toEqual([]);
  });

  it.each(files)('%s has no inline style colour declarations', (rel) => {
    const src = read(rel);
    expect(INLINE_STYLE_COLOR.test(src), `inline style colour in ${rel}`).toBe(false);
  });
});
