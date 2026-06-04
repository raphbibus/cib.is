import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { firstParagraph } from '@/lib/excerpt';
import { SITE_NAME } from '@/lib/seo';
import type { APIContext } from 'astro';

// /rss.xml — valid RSS 2.0 feed of all posts, newest-first, with the FULL
// rendered post HTML per item (R16/AC9, TD5). The loader stored each post's
// rendered HTML in `entry.rendered.html`, so the feed needs no re-render.
export async function GET(context: APIContext) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: `${SITE_NAME} — Blog`,
    description:
      'Texte über Leadership, Organisationsentwicklung und agiles Arbeiten von Ralph Cibis.',
    site: context.site ?? 'https://ralphcibis.netlify.app',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
      description: firstParagraph(post.body ?? ''),
      content: (post.rendered?.html ?? '').trim(),
    })),
  });
}
