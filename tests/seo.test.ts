import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildMeta, SITE_URL } from '@/lib/seo';

// T9 / R6 / TD2 — robots is context-driven: production indexes, every other
// (preview / branch / local) stays noindex. T10 / TD1 — canonical host is www.
describe('lib/seo buildMeta', () => {
  const originalContext = process.env.CONTEXT;
  beforeEach(() => {
    delete process.env.CONTEXT;
  });
  afterEach(() => {
    if (originalContext === undefined) delete process.env.CONTEXT;
    else process.env.CONTEXT = originalContext;
  });

  it('indexes in the production deploy context (R6/TD2)', () => {
    process.env.CONTEXT = 'production';
    const meta = buildMeta({ title: 'X', description: 'Y', path: '/' });
    expect(meta.robots).toBe('index,follow');
  });

  it('stays noindex,nofollow on deploy previews (R6/TD2)', () => {
    process.env.CONTEXT = 'deploy-preview';
    const meta = buildMeta({ title: 'X', description: 'Y', path: '/' });
    expect(meta.robots).toBe('noindex,nofollow');
  });

  it('stays noindex,nofollow on branch deploys (R6/TD2)', () => {
    process.env.CONTEXT = 'branch-deploy';
    const meta = buildMeta({ title: 'X', description: 'Y', path: '/' });
    expect(meta.robots).toBe('noindex,nofollow');
  });

  it('defaults to noindex,nofollow when no context is set (local/safe default)', () => {
    const meta = buildMeta({ title: 'X', description: 'Y', path: '/' });
    expect(meta.robots).toBe('noindex,nofollow');
  });

  // T10 / TD1 — canonical host is the www subdomain (Netlify primary).
  it('uses https://www.cib.is as the canonical site host (R6/TD1)', () => {
    expect(SITE_URL).toBe('https://www.cib.is');
  });

  it('builds an absolute canonical/OG url from www.cib.is + path (TD1)', () => {
    const meta = buildMeta({ title: 'X', description: 'Y', path: '/foo' });
    expect(meta.canonical).toBe('https://www.cib.is/foo');
    expect(meta.ogUrl).toBe('https://www.cib.is/foo');
  });

  it('returns title, description and an OG image path (AC8/AC10)', () => {
    const meta = buildMeta({ title: 'Hello', description: 'Desc', path: '/' });
    expect(meta.title).toBe('Hello');
    expect(meta.description).toBe('Desc');
    expect(meta.ogImage).toMatch(/^https:\/\/www\.cib\.is\/.+\.(png|jpg|webp)$/);
    expect(meta.ogType).toBe('website');
  });

  it('lets the caller override the OG image with an absolute url', () => {
    const meta = buildMeta({
      title: 'X',
      description: 'Y',
      path: '/',
      ogImage: 'https://www.cib.is/custom.png',
    });
    expect(meta.ogImage).toBe('https://www.cib.is/custom.png');
  });

  // T5a / R15 — blog posts opt into og:type=article; default stays 'website'.
  it('defaults ogType to website when not given', () => {
    const meta = buildMeta({ title: 'X', description: 'Y', path: '/' });
    expect(meta.ogType).toBe('website');
  });

  it('accepts ogType=article for blog posts (R15)', () => {
    const meta = buildMeta({
      title: 'Post',
      description: 'Excerpt',
      path: '/blog/post',
      ogType: 'article',
    });
    expect(meta.ogType).toBe('article');
  });
});
