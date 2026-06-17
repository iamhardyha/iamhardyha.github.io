import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { publishedSorted } from '../utils/posts';
import { SITE } from '../consts';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = publishedSorted(await getCollection('posts'));
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/posts/${post.id}/`,
      categories: post.data.tags,
    })),
  });
}
