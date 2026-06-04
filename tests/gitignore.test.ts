import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// T5b / R14, AC8 — the private editorial notes must never be committed.
const root = fileURLToPath(new URL('..', import.meta.url));

describe('editorial-notes.md is gitignored', () => {
  it('.gitignore lists editorial-notes.md', () => {
    const gi = readFileSync(fileURLToPath(new URL('../.gitignore', import.meta.url)), 'utf8');
    expect(gi.split('\n').some((l) => l.trim() === 'editorial-notes.md')).toBe(true);
  });

  it('git treats editorial-notes.md as ignored', () => {
    const out = execFileSync('git', ['check-ignore', 'editorial-notes.md'], {
      cwd: root,
      encoding: 'utf8',
    }).trim();
    expect(out).toBe('editorial-notes.md');
  });
});
