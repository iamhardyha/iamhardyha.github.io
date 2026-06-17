import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'posts'>;

export function publishedSorted(posts: Post[]): Post[] {
  return posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function collectTags(posts: Post[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of publishedSorted(posts)) {
    for (const tag of p.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function collectSeries(posts: Post[]): string[] {
  const set = new Set<string>();
  for (const p of publishedSorted(posts)) {
    if (p.data.series) set.add(p.data.series);
  }
  return [...set];
}
