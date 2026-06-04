import { describe, it, expect } from 'vitest';
import { buildMeta } from '@/lib/seo';

// T3 / AC8, AC9, AC16 — meta builder always emits the noindex guard + OG tags.
describe('lib/seo buildMeta', () => {
  it('always sets robots to noindex,nofollow (AC9)', () => {
    const meta = buildMeta({ title: 'X', description: 'Y', path: '/' });
    expect(meta.robots).toBe('noindex,nofollow');
  });

  it('builds an absolute canonical/OG url from site + path', () => {
    const meta = buildMeta({ title: 'X', description: 'Y', path: '/foo' });
    expect(meta.canonical).toBe('https://ralphcibis.netlify.app/foo');
    expect(meta.ogUrl).toBe('https://ralphcibis.netlify.app/foo');
  });

  it('returns title, description and an OG image path (AC8/AC16)', () => {
    const meta = buildMeta({ title: 'Hello', description: 'Desc', path: '/' });
    expect(meta.title).toBe('Hello');
    expect(meta.description).toBe('Desc');
    expect(meta.ogImage).toMatch(/^https:\/\/ralphcibis\.netlify\.app\/.+\.(png|jpg|webp)$/);
    expect(meta.ogType).toBe('website');
  });

  it('lets the caller override the OG image with an absolute url', () => {
    const meta = buildMeta({
      title: 'X',
      description: 'Y',
      path: '/',
      ogImage: 'https://ralphcibis.netlify.app/custom.png',
    });
    expect(meta.ogImage).toBe('https://ralphcibis.netlify.app/custom.png');
  });
});
