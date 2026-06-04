import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// T12 / R6, AC6 — a documented, gated go-live checklist exists, covering the
// hard gates, the dedicated noindex-removal deploy, and the redeploy rollback.
const path = fileURLToPath(new URL('../docs/go-live-checklist.md', import.meta.url));

describe('docs/go-live-checklist.md', () => {
  it('exists', () => {
    expect(existsSync(path)).toBe(true);
  });

  it('documents the hard gates, the cutover, and the rollback (R6/AC6)', () => {
    const md = readFileSync(path, 'utf8').toLowerCase();
    // gates
    expect(md).toMatch(/lighthouse/);
    expect(md).toMatch(/a11y|accessib/);
    expect(md).toMatch(/legal|impressum|datenschutz/);
    expect(md).toMatch(/sign-?off|freigabe/);
    expect(md).toMatch(/privacy gate|no-cookies|no-cookie|third-party/);
    // context-driven cutover (production deploy) + rollback
    expect(md).toMatch(/production|context/);
    expect(md).toMatch(/rollback|redeploy|zurück/);
    expect(md).toMatch(/dns|https|tls/);
  });
});
