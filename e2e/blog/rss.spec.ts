import { test, expect } from '@playwright/test';
import { XMLParser } from 'fast-xml-parser';

// T9 / R2, R16, AC9 — /rss.xml is valid RSS 2.0, has one item per post (19),
// newest-first, each carrying the FULL rendered post content (not the excerpt).
test.describe('/rss.xml feed', () => {
  test('is served as XML and parses as RSS 2.0', async ({ request }) => {
    const res = await request.get('/rss.xml');
    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toMatch(/xml/);

    const xml = await res.text();
    const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml);
    expect(parsed.rss['@_version']).toBe('2.0');
    expect(parsed.rss.channel.title).toContain('Blog');
  });

  test('has 19 items, newest-first, each with full content (AC9)', async ({ request }) => {
    const xml = await (await request.get('/rss.xml')).text();
    const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml);
    const items = parsed.rss.channel.item as Array<Record<string, unknown>>;

    expect(items).toHaveLength(19);

    // newest-first by pubDate
    const dates = items.map((i) => new Date(i.pubDate as string).valueOf());
    expect(dates).toEqual([...dates].sort((a, b) => b - a));

    // full content present and clearly longer than a one-paragraph excerpt
    for (const item of items) {
      const content = (item['content:encoded'] ?? '') as string;
      expect(content.length).toBeGreaterThan(200);
      expect(content).toMatch(/<p>/);
    }
  });
});
