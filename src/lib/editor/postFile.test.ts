import { describe, it, expect } from 'vitest';
import {
  SLUG_RE,
  slugify,
  serializePost,
  parsePost,
  validatePostInput,
  type PostMeta,
} from './postFile';

const baseMeta: PostMeta = {
  title: '좋은 도구는 질문을 바꾼다',
  description: 'AI 시대, 속도가 아니라 질문이 바뀌는 순간에 대하여.',
  pubDate: '2026-06-16',
  tags: ['AI', '조직문화', '개발'],
  series: 'AI와 일하기',
  draft: false,
};

describe('slugify', () => {
  it('lowercases and hyphenates ascii words', () => {
    expect(slugify('Good Tools Change Questions')).toBe('good-tools-change-questions');
  });

  it('collapses repeated separators and trims edges', () => {
    expect(slugify('  Hello --  World!!  ')).toBe('hello-world');
  });

  it('returns empty string for pure non-ascii (Korean) titles', () => {
    // Korean titles cannot become an ascii slug — caller must supply one.
    expect(slugify('좋은 도구는 질문을 바꾼다')).toBe('');
  });

  it('keeps digits', () => {
    expect(slugify('Astro 5 release notes')).toBe('astro-5-release-notes');
  });
});

describe('SLUG_RE', () => {
  it('accepts kebab-case ascii', () => {
    expect(SLUG_RE.test('good-tools-change-questions')).toBe(true);
    expect(SLUG_RE.test('welcome')).toBe(true);
    expect(SLUG_RE.test('astro-5')).toBe(true);
  });

  it('rejects path-traversal and unsafe characters', () => {
    expect(SLUG_RE.test('../secret')).toBe(false);
    expect(SLUG_RE.test('a/b')).toBe(false);
    expect(SLUG_RE.test('Hello')).toBe(false);
    expect(SLUG_RE.test('한글')).toBe(false);
    expect(SLUG_RE.test('-leading')).toBe(false);
    expect(SLUG_RE.test('trailing-')).toBe(false);
    expect(SLUG_RE.test('')).toBe(false);
  });
});

describe('serializePost', () => {
  it('emits YAML frontmatter followed by the body', () => {
    const out = serializePost({ meta: baseMeta, body: '본문입니다.\n' });
    expect(out).toContain('---\n');
    expect(out).toContain('title: "좋은 도구는 질문을 바꾼다"');
    expect(out).toContain('pubDate: 2026-06-16');
    expect(out).toContain('tags: ["AI", "조직문화", "개발"]');
    expect(out).toContain('series: "AI와 일하기"');
    expect(out).toContain('draft: false');
    expect(out.endsWith('본문입니다.\n')).toBe(true);
  });

  it('omits optional empty fields (series, cover, empty tags)', () => {
    const out = serializePost({
      meta: { ...baseMeta, tags: [], series: undefined, cover: undefined },
      body: 'x',
    });
    expect(out).not.toContain('series:');
    expect(out).not.toContain('cover:');
    expect(out).not.toContain('tags:');
  });

  it('escapes double quotes inside string values', () => {
    const out = serializePost({
      meta: { ...baseMeta, title: 'She said "hi"' },
      body: 'x',
    });
    expect(out).toContain('title: "She said \\"hi\\""');
  });

  it('ensures exactly one blank line between frontmatter and body', () => {
    const out = serializePost({ meta: baseMeta, body: '본문' });
    expect(out).toMatch(/---\n\n본문\n$/); // body is always newline-terminated
  });
});

describe('parsePost (round-trip)', () => {
  it('parses what serializePost produced back into meta + body', () => {
    const body = '첫 문단.\n\n## 소제목\n\n둘째 문단.\n';
    const raw = serializePost({ meta: baseMeta, body });
    const parsed = parsePost(raw);
    expect(parsed.meta.title).toBe(baseMeta.title);
    expect(parsed.meta.description).toBe(baseMeta.description);
    expect(parsed.meta.pubDate).toBe('2026-06-16');
    expect(parsed.meta.tags).toEqual(['AI', '조직문화', '개발']);
    expect(parsed.meta.series).toBe('AI와 일하기');
    expect(parsed.meta.draft).toBe(false);
    expect(parsed.body).toBe(body);
  });

  it('parses a hand-written post without series/draft', () => {
    const raw = [
      '---',
      'title: "블로그를 시작하며"',
      'description: "왜 이 공간을 만들었는지."',
      'pubDate: 2026-06-17',
      'tags: ["글쓰기", "회고"]',
      '---',
      '',
      '본문.',
      '',
    ].join('\n');
    const parsed = parsePost(raw);
    expect(parsed.meta.title).toBe('블로그를 시작하며');
    expect(parsed.meta.tags).toEqual(['글쓰기', '회고']);
    expect(parsed.meta.draft).toBe(false); // default
    expect(parsed.body).toBe('본문.\n');
  });
});

describe('parsePost (CMS interop)', () => {
  it('reads block-style YAML tag lists (as Sveltia/Decap writes them)', () => {
    const raw = [
      '---',
      'title: "X"',
      'description: "Y"',
      'pubDate: 2026-06-27',
      'tags:',
      '  - AI',
      '  - 글쓰기',
      'draft: true',
      '---',
      '',
      '본문.',
      '',
    ].join('\n');
    const parsed = parsePost(raw);
    expect(parsed.meta.tags).toEqual(['AI', '글쓰기']);
    expect(parsed.meta.draft).toBe(true);
    expect(parsed.body).toBe('본문.\n');
  });

  it('handles single-quoted and unquoted scalar values', () => {
    const raw = [
      '---',
      "title: 'She said'",
      'description: 좋은 글입니다',
      'pubDate: 2026-06-27',
      'draft: false',
      '---',
      '',
      '본문.',
    ].join('\n');
    const parsed = parsePost(raw);
    expect(parsed.meta.title).toBe('She said');
    expect(parsed.meta.description).toBe('좋은 글입니다');
  });

  it('ignores unknown frontmatter keys (e.g. a CMS slug field)', () => {
    const raw = [
      '---',
      'title: "X"',
      'slug: my-post',
      'description: "Y"',
      'pubDate: 2026-06-27',
      'draft: false',
      '---',
      '',
      '본문.',
    ].join('\n');
    const parsed = parsePost(raw);
    expect(parsed.meta.title).toBe('X');
    expect(parsed.body).toBe('본문.\n');
  });
});

describe('validatePostInput', () => {
  it('passes a well-formed input', () => {
    const r = validatePostInput({ ...baseMeta, slug: 'good-tools-change-questions' });
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it('rejects empty title and description', () => {
    const r = validatePostInput({ ...baseMeta, title: '', description: '', slug: 'x' });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('제목'))).toBe(true);
    expect(r.errors.some((e) => e.includes('설명'))).toBe(true);
  });

  it('rejects an invalid slug (path traversal)', () => {
    const r = validatePostInput({ ...baseMeta, slug: '../oops' });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.toLowerCase().includes('slug'))).toBe(true);
  });

  it('rejects a malformed pubDate', () => {
    const r = validatePostInput({ ...baseMeta, slug: 'ok', pubDate: '2026/6/16' });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('날짜'))).toBe(true);
  });
});
