import { describe, it, expect } from 'vitest';
import { publishedSorted, collectTags, collectSeries } from './posts';

const sample = [
  { id: 'a', data: { title: 'A', pubDate: new Date('2026-01-01'), tags: ['AI'], draft: false } },
  { id: 'b', data: { title: 'B', pubDate: new Date('2026-03-01'), tags: ['AI', '개발'], draft: false } },
  { id: 'c', data: { title: 'C', pubDate: new Date('2026-02-01'), tags: ['개발'], draft: true } },
];

describe('publishedSorted', () => {
  it('draft 제외, 최신순 정렬', () => {
    const r = publishedSorted(sample as any);
    expect(r.map((p) => p.id)).toEqual(['b', 'a']);
  });
});

describe('collectTags', () => {
  it('발행 글의 태그를 개수와 함께 집계(내림차순)', () => {
    const r = collectTags(sample as any);
    expect(r).toEqual([
      { tag: 'AI', count: 2 },
      { tag: '개발', count: 1 },
    ]);
  });
});

describe('collectSeries', () => {
  it('시리즈명 목록을 반환', () => {
    const withSeries = [
      { id: 'x', data: { title: 'X', pubDate: new Date('2026-01-01'), tags: [], series: 'S1', draft: false } },
    ];
    expect(collectSeries(withSeries as any)).toEqual(['S1']);
  });
});
