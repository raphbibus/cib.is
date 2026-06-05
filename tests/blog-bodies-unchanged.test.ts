import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// T8 / R7 / AC7 — the 19 migrated blog posts are Ralph's authentic archive. The
// coherence pass touches blog CHROME/CTA only; it must NOT rewrite post bodies in
// src/content/blog/*. This guard fails the moment a tracked post file differs
// from HEAD (staged or unstaged) or a new post file appears unexpectedly.
const root = fileURLToPath(new URL('..', import.meta.url));
const git = (cmd: string) => execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();

describe('blog post bodies are unchanged (R7/AC7)', () => {
  it('has no git diff under src/content/blog vs HEAD', () => {
    const diff = git('git diff HEAD -- src/content/blog');
    expect(diff, diff && `unexpected blog edits:\n${diff}`).toBe('');
  });

  it('introduces no untracked files under src/content/blog', () => {
    const untracked = git('git ls-files --others --exclude-standard -- src/content/blog');
    expect(untracked, untracked && `unexpected new blog files:\n${untracked}`).toBe('');
  });
});
