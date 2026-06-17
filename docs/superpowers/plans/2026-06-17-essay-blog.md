# 에세이 블로그 전환 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 단일 페이지 포트폴리오를 Astro 기반 미디엄식 라이트 미니멀 에세이 블로그로 전면 전환한다.

**Architecture:** Astro 정적 사이트 + Content Collections(Markdown/MDX)로 글을 관리한다. 라이트 기본 + 다크 토글, 세리프 본문, 그린 액센트의 미디엄 톤. GitHub Actions로 빌드해 GitHub Pages 루트에 배포한다. RSS·사이트맵·검색(Pagefind)·댓글(giscus)·방문자 집계(GoatCounter)를 포함한다.

**Tech Stack:** Astro 5, MDX, TypeScript, Vitest(유틸 단위 테스트), @astrojs/rss, @astrojs/sitemap, astro-pagefind, giscus, GoatCounter.

**Spec:** `docs/superpowers/specs/2026-06-17-essay-blog-design.md`

---

## 사전 메모: 외부 설정값 (구현 중 사용자가 발급해야 하는 값)

아래 값들은 코드 플레이스홀더가 아니라 외부 서비스에서 발급받는 **설정값**이다. `src/consts.ts`에 모아 두고, 발급 전까지는 빈 문자열로 두며 해당 기능은 값이 있을 때만 렌더한다.

- **giscus**: <https://giscus.app> 에서 repo(`iamhardyha/iamhardyha.github.io`) 선택 → Discussions 활성화 → `data-repo-id`, `data-category-id` 발급.
- **GoatCounter**: <https://www.goatcounter.com> 가입 → 사이트 코드(예: `iamhardyha`) 생성. 공개 카운터 사용을 위해 Settings에서 "Allow viewing without password / public statistics" 활성화. 일별 수치 표시는 read-only API 토큰(My Account → API tokens, "Read statistics" 권한) 발급.

이 값들이 없어도 빌드·배포는 정상 동작해야 한다(기능만 비활성).

---

## Task 1: Astro 프로젝트 스캐폴딩

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `public/.nojekyll`
- Modify: `.gitignore`
- Delete (Task 21에서): 기존 `index.html`, `assets/`

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "iamhardyha-blog",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && pagefind --site dist",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/rss": "^4.0.0",
    "@astrojs/sitemap": "^3.0.0"
  },
  "devDependencies": {
    "astro-pagefind": "^1.6.0",
    "pagefind": "^1.1.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: 의존성 설치**

Run: `npm install`
Expected: `node_modules/` 생성, 에러 없음.

- [ ] **Step 3: astro.config.mjs 작성**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://iamhardyha.github.io',
  output: 'static',
  integrations: [mdx(), sitemap(), pagefind()],
  markdown: {
    shikiConfig: { theme: 'github-light', wrap: true },
  },
});
```

- [ ] **Step 4: tsconfig.json 작성**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: src/env.d.ts 작성**

```ts
/// <reference path="../.astro/types.d.ts" />
```

- [ ] **Step 6: public/.nojekyll 생성 (빈 파일)**

Run: `mkdir -p public && touch public/.nojekyll`

- [ ] **Step 7: .gitignore 갱신**

기존 내용에 다음 줄을 추가한다 (파일 전체):

```
CLAUDE.md
.idea/
.superpowers/
node_modules/
dist/
.astro/
```

- [ ] **Step 8: 빌드 동작 확인**

Run: `npm run build`
Expected: 페이지가 0개여도 `astro build` 성공(경고 가능), `dist/` 생성. Pagefind는 색인 대상이 없으면 경고만 출력.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/env.d.ts public/.nojekyll .gitignore
git commit -m "chore: scaffold Astro project"
```

---

## Task 2: 사이트 상수 (`src/consts.ts`)

**Files:**
- Create: `src/consts.ts`

- [ ] **Step 1: consts.ts 작성**

```ts
export const SITE = {
  title: 'Hardy Ha',
  tagline: '하루하루 성장하는 개발자의 에세이',
  description: '개발·기술·조직문화·AI에 대한 개인적 사견을 에세이로 씁니다.',
  author: '하창현 (Hardy)',
  url: 'https://iamhardyha.github.io',
  avatar: 'https://avatars.githubusercontent.com/u/203849847?v=4',
  postsPerPage: 10,
};

export const NAV = [
  { label: 'Writing', href: '/writing' },
  { label: 'Topics', href: '/topics' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
];

export const SOCIAL = {
  github: 'https://github.com/iamhardyha',
  email: 'mailto:hachanghyeon411@gmail.com',
  tistory: 'https://devhardy.tistory.com/',
};

// 외부 서비스 설정값 — 발급 후 채운다. 빈 값이면 해당 기능 비활성.
export const GISCUS = {
  repo: 'iamhardyha/iamhardyha.github.io',
  repoId: '',       // giscus.app에서 발급
  category: 'Comments',
  categoryId: '',   // giscus.app에서 발급
};

export const GOATCOUNTER = {
  code: '',         // 예: 'iamhardyha' (https://iamhardyha.goatcounter.com)
  apiToken: '',     // read-only 통계 토큰(일별 수치 표시용). 없으면 '오늘' 숨김.
};
```

- [ ] **Step 2: Commit**

```bash
git add src/consts.ts
git commit -m "feat: add site constants"
```

---

## Task 3: 읽는 시간 유틸 (TDD)

**Files:**
- Create: `src/utils/reading-time.ts`
- Test: `src/utils/reading-time.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { describe, it, expect } from 'vitest';
import { readingTime } from './reading-time';

describe('readingTime', () => {
  it('빈 본문은 최소 1분', () => {
    expect(readingTime('')).toBe(1);
  });

  it('마크다운 기호/코드는 제외하고 글자 수로 계산', () => {
    // 500자 ≈ 1분. 1000자는 2분.
    const text = '가'.repeat(1000);
    expect(readingTime(text)).toBe(2);
  });

  it('한글 1500자는 3분', () => {
    const text = '나'.repeat(1500);
    expect(readingTime(text)).toBe(3);
  });

  it('마크다운 문법 문자는 세지 않는다', () => {
    const md = '# 제목\n\n```js\nconst a = 1;\n```\n' + '다'.repeat(500);
    // 코드/기호 제거 후 약 500자 → 1분
    expect(readingTime(md)).toBe(1);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/utils/reading-time.test.ts`
Expected: FAIL — `readingTime`가 정의되지 않음.

- [ ] **Step 3: 최소 구현 작성**

```ts
const CHARS_PER_MINUTE = 500;

/** 마크다운 본문에서 읽는 시간(분, 최소 1)을 계산한다. */
export function readingTime(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')   // 코드 블록 제거
    .replace(/`[^`]*`/g, '')          // 인라인 코드 제거
    .replace(/[#>*_~\-`!\[\]()]/g, '') // 마크다운 기호 제거
    .replace(/\s+/g, '');              // 공백 제거
  const minutes = Math.ceil(text.length / CHARS_PER_MINUTE);
  return Math.max(1, minutes);
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/utils/reading-time.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Commit**

```bash
git add src/utils/reading-time.ts src/utils/reading-time.test.ts
git commit -m "feat: add reading-time utility"
```

---

## Task 4: 콘텐츠 컬렉션 스키마 + 샘플 글

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/posts/welcome.md`
- Create: `src/content/posts/good-tools-change-questions.md`

- [ ] **Step 1: content.config.ts 작성**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    series: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
```

- [ ] **Step 2: 샘플 글 1 작성 (`src/content/posts/welcome.md`)**

```markdown
---
title: "블로그를 시작하며"
description: "왜 이 공간을 만들었는지, 무엇을 쓸 것인지에 대하여."
pubDate: 2026-06-17
tags: ["글쓰기", "회고"]
---

이곳은 개발 기술뿐 아니라 기술 일반, 조직문화, AI에 대한 생각을
에세이처럼 정리하는 공간입니다.

빠른 결론보다 천천히 생각을 펼치는 글을 쓰려 합니다.
```

- [ ] **Step 3: 샘플 글 2 작성 (`src/content/posts/good-tools-change-questions.md`)**

```markdown
---
title: "좋은 도구는 질문을 바꾼다"
description: "AI 시대, 속도가 아니라 질문이 바뀌는 순간에 대하여."
pubDate: 2026-06-16
tags: ["AI", "조직문화", "개발"]
series: "AI와 일하기"
---

새로운 도구가 들어오면 우리는 보통 "이걸로 무엇을 더 빨리 할 수 있나"를
먼저 묻는다. 그러나 정말 중요한 변화는 속도가 아니라 질문 자체가
바뀌는 순간에 일어난다.

## 무엇을 만들 것인가

AI가 코드를 대신 써주기 시작하면서, 나는 "어떻게 구현하지"보다
"무엇이 옳은 설계인가"를 더 자주 고민하게 됐다.
```

- [ ] **Step 4: 타입 동기화 및 빌드 확인**

Run: `npm run build`
Expected: 성공. 콘텐츠 스키마 검증 통과(잘못된 프론트매터면 에러). 아직 라우트가 없어 페이지는 생성되지 않을 수 있음.

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/content/posts/
git commit -m "feat: add posts collection schema and sample essays"
```

---

## Task 5: 글 목록 유틸 (TDD) — 발행 글 정렬·태그·시리즈 집계

**Files:**
- Create: `src/utils/posts.ts`
- Test: `src/utils/posts.test.ts`

`getCollection` 결과를 감싸 순수 함수로 가공한다(테스트 가능하도록 컬렉션 입력을 인자로 받음).

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/utils/posts.test.ts`
Expected: FAIL — 함수 미정의.

- [ ] **Step 3: 구현 작성**

```ts
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/utils/posts.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/posts.ts src/utils/posts.test.ts
git commit -m "feat: add post list/tag/series helpers"
```

---

## Task 6: 디자인 토큰 & 전역 스타일 (미디엄 라이트 + 다크)

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: global.css 작성**

```css
:root {
  --bg: #ffffff;
  --bg-soft: #fafafa;
  --text: #242424;
  --text-muted: #6b6b6b;
  --border: #e6e6e6;
  --accent: #1a8917;
  --accent-hover: #156d12;
  --serif: Georgia, "Nanum Myeongjo", "Apple SD Gothic Neo", serif;
  --sans: Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
  --content-width: 680px;
}

:root[data-theme="dark"] {
  --bg: #16181c;
  --bg-soft: #1f2227;
  --text: #e8e6e3;
  --text-muted: #9aa0a6;
  --border: #2c3036;
  --accent: #4caf50;
  --accent-hover: #66bb6a;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  transition: background 0.2s ease, color 0.2s ease;
}

a { color: var(--accent); text-decoration: none; }
a:hover { color: var(--accent-hover); }

.container {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 20px;
}

.wide { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add Medium-style design tokens (light + dark)"
```

---

## Task 7: 테마 토글 컴포넌트 (FOUC 방지)

**Files:**
- Create: `src/components/ThemeToggle.astro`

- [ ] **Step 1: ThemeToggle.astro 작성**

```astro
---
---
<button id="theme-toggle" aria-label="테마 전환" class="theme-toggle">
  <span class="theme-toggle__icon">🌙</span>
</button>

<style>
  .theme-toggle {
    background: none; border: none; cursor: pointer;
    font-size: 1.1rem; line-height: 1; padding: 6px;
    border-radius: 8px;
  }
  .theme-toggle:hover { background: var(--bg-soft); }
</style>

<script>
  const btn = document.getElementById('theme-toggle');
  const icon = btn?.querySelector('.theme-toggle__icon');
  function apply(theme: string) {
    document.documentElement.dataset.theme = theme;
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
  }
  btn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
  });
  // 초기 아이콘 동기화 (테마 클래스는 head 인라인 스크립트가 이미 적용)
  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  if (icon) icon.textContent = current === 'dark' ? '☀️' : '🌙';
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThemeToggle.astro
git commit -m "feat: add theme toggle component"
```

---

## Task 8: Nav, Footer 컴포넌트

**Files:**
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Nav.astro 작성**

```astro
---
import { SITE, NAV } from '../consts';
import ThemeToggle from './ThemeToggle.astro';
---
<header class="nav">
  <div class="wide nav__inner">
    <a href="/" class="nav__logo">{SITE.title}</a>
    <nav class="nav__links">
      {NAV.map((item) => <a href={item.href} class="nav__link">{item.label}</a>)}
      <a href="/search" class="nav__link" aria-label="검색">🔍</a>
      <ThemeToggle />
    </nav>
  </div>
</header>

<style>
  .nav { border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg); z-index: 10; }
  .nav__inner { display: flex; align-items: center; justify-content: space-between; height: 60px; }
  .nav__logo { font-family: var(--serif); font-size: 1.3rem; font-weight: 700; color: var(--text); }
  .nav__links { display: flex; align-items: center; gap: 18px; }
  .nav__link { color: var(--text-muted); font-size: 0.95rem; }
  .nav__link:hover { color: var(--text); }
  @media (max-width: 640px) {
    .nav__links { gap: 12px; }
    .nav__link { font-size: 0.85rem; }
  }
</style>
```

- [ ] **Step 2: Footer.astro 작성**

```astro
---
import { SITE, SOCIAL } from '../consts';
const year = new Date().getFullYear();
---
<footer class="footer">
  <div class="wide footer__inner">
    <div class="footer__links">
      <a href={SOCIAL.github} target="_blank" rel="noopener">GitHub</a>
      <a href={SOCIAL.tistory} target="_blank" rel="noopener">Tistory</a>
      <a href={SOCIAL.email}>Email</a>
      <a href="/rss.xml">RSS</a>
    </div>
    <p class="footer__copy">© {year} {SITE.author}</p>
  </div>
</footer>

<style>
  .footer { border-top: 1px solid var(--border); margin-top: 80px; padding: 30px 0; }
  .footer__inner { display: flex; flex-direction: column; gap: 10px; align-items: center; }
  .footer__links { display: flex; gap: 16px; }
  .footer__links a { color: var(--text-muted); font-size: 0.9rem; }
  .footer__copy { color: var(--text-muted); font-size: 0.85rem; margin: 0; }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.astro src/components/Footer.astro
git commit -m "feat: add nav and footer"
```

---

## Task 9: SEO 메타 + BaseLayout

**Files:**
- Create: `src/components/Seo.astro`
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Seo.astro 작성**

```astro
---
import { SITE } from '../consts';
interface Props {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
}
const { title, description = SITE.description, image = SITE.avatar, article = false } = Astro.props;
const fullTitle = title ? `${title} — ${SITE.title}` : `${SITE.title} — ${SITE.tagline}`;
const canonical = new URL(Astro.url.pathname, SITE.url).href;
---
<title>{fullTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:type" content={article ? 'article' : 'website'} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={image} />
<meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 2: BaseLayout.astro 작성 (head에 FOUC 방지 인라인 스크립트 포함)**

```astro
---
import { SITE, GOATCOUNTER } from '../consts';
import Seo from '../components/Seo.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
}
const props = Astro.props;
---
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href={SITE.avatar} type="image/png" />
    <link rel="alternate" type="application/rss+xml" title={SITE.title} href="/rss.xml" />
    <script is:inline>
      // FOUC 방지: 테마를 paint 전에 적용
      (function () {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored ?? (prefersDark ? 'dark' : 'light');
        document.documentElement.dataset.theme = theme;
      })();
    </script>
    <Seo {...props} />
    {GOATCOUNTER.code && (
      <script
        is:inline
        data-goatcounter={`https://${GOATCOUNTER.code}.goatcounter.com/count`}
        async
        src="//gc.zgo.at/count.js"
      ></script>
    )}
  </head>
  <body>
    <Nav />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Seo.astro src/layouts/BaseLayout.astro
git commit -m "feat: add SEO meta and base layout with no-FOUC theme + GoatCounter"
```

---

## Task 10: PostCard & FeaturedPost 컴포넌트

**Files:**
- Create: `src/components/PostMeta.astro`
- Create: `src/components/PostCard.astro`
- Create: `src/components/FeaturedPost.astro`

- [ ] **Step 1: PostMeta.astro 작성 (날짜·읽는 시간·태그 표시 공통)**

```astro
---
interface Props { pubDate: Date; minutes: number; tags?: string[]; }
const { pubDate, minutes, tags = [] } = Astro.props;
const dateStr = pubDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
---
<div class="meta">
  <span>{dateStr}</span>
  <span aria-hidden="true">·</span>
  <span>{minutes}분 읽기</span>
  {tags.length > 0 && <span aria-hidden="true">·</span>}
  {tags.map((t) => <a class="meta__tag" href={`/topics/${encodeURIComponent(t)}`}>{t}</a>)}
</div>
<style>
  .meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; color: var(--text-muted); font-size: 0.85rem; }
  .meta__tag { color: var(--accent); }
</style>
```

- [ ] **Step 2: PostCard.astro 작성**

```astro
---
import PostMeta from './PostMeta.astro';
import { readingTime } from '../utils/reading-time';
import type { CollectionEntry } from 'astro:content';
interface Props { post: CollectionEntry<'posts'>; }
const { post } = Astro.props;
const minutes = readingTime(post.body ?? '');
---
<article class="card">
  <a href={`/posts/${post.id}`} class="card__link">
    <h3 class="card__title">{post.data.title}</h3>
    <p class="card__desc">{post.data.description}</p>
  </a>
  <PostMeta pubDate={post.data.pubDate} minutes={minutes} tags={post.data.tags} />
</article>
<style>
  .card { padding: 24px 0; border-bottom: 1px solid var(--border); }
  .card__title { font-family: var(--serif); font-size: 1.4rem; margin: 0 0 6px; color: var(--text); }
  .card__desc { color: var(--text-muted); margin: 0 0 10px; }
</style>
```

- [ ] **Step 3: FeaturedPost.astro 작성**

```astro
---
import PostMeta from './PostMeta.astro';
import { readingTime } from '../utils/reading-time';
import type { CollectionEntry } from 'astro:content';
interface Props { post: CollectionEntry<'posts'>; }
const { post } = Astro.props;
const minutes = readingTime(post.body ?? '');
---
<article class="featured">
  <a href={`/posts/${post.id}`} class="featured__link">
    <span class="featured__label">Featured</span>
    <h2 class="featured__title">{post.data.title}</h2>
    <p class="featured__desc">{post.data.description}</p>
  </a>
  <PostMeta pubDate={post.data.pubDate} minutes={minutes} tags={post.data.tags} />
</article>
<style>
  .featured { padding: 40px 0; border-bottom: 2px solid var(--border); }
  .featured__label { color: var(--accent); font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; }
  .featured__title { font-family: var(--serif); font-size: 2.2rem; line-height: 1.2; margin: 10px 0; color: var(--text); }
  .featured__desc { color: var(--text-muted); font-size: 1.1rem; margin: 0 0 14px; }
  @media (max-width: 640px) { .featured__title { font-size: 1.7rem; } }
</style>
```

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: 컴포넌트 컴파일 에러 없음.

- [ ] **Step 5: Commit**

```bash
git add src/components/PostMeta.astro src/components/PostCard.astro src/components/FeaturedPost.astro
git commit -m "feat: add post card and featured post components"
```

---

## Task 11: 홈 페이지 `/`

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: index.astro 작성**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import FeaturedPost from '../components/FeaturedPost.astro';
import PostCard from '../components/PostCard.astro';
import { publishedSorted } from '../utils/posts';

const posts = publishedSorted(await getCollection('posts'));
const [featured, ...rest] = posts;
const latest = rest.slice(0, 6);
---
<BaseLayout>
  <div class="container">
    {featured && <FeaturedPost post={featured} />}
    <section class="latest">
      <h2 class="latest__heading">최근 글</h2>
      {latest.map((post) => <PostCard post={post} />)}
      <a href="/writing" class="latest__more">전체 글 보기 →</a>
    </section>
  </div>
</BaseLayout>

<style>
  .latest { padding-top: 20px; }
  .latest__heading { font-family: var(--serif); font-size: 1.1rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .latest__more { display: inline-block; margin-top: 24px; font-weight: 600; }
</style>
```

- [ ] **Step 2: dev 서버에서 홈 확인**

Run: `npm run dev` 후 브라우저로 `http://localhost:4321/` 접속.
Expected: 대표 글 1개 + 최근 글 카드 노출. 라이트 톤·세리프 제목 확인. 서버 종료(Ctrl+C).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add home page (editorial layout)"
```

---

## Task 12: Prose 본문 스타일 + 글 상세 `/posts/[slug]`

**Files:**
- Create: `src/styles/prose.css`
- Create: `src/layouts/PostLayout.astro`
- Create: `src/pages/posts/[...id].astro`

- [ ] **Step 1: prose.css 작성 (세리프 본문)**

```css
.prose { font-family: var(--serif); font-size: 1.18rem; line-height: 1.85; color: var(--text); }
.prose h2 { font-size: 1.6rem; margin-top: 2em; }
.prose h3 { font-size: 1.3rem; margin-top: 1.6em; }
.prose p { margin: 1.2em 0; }
.prose a { text-decoration: underline; }
.prose blockquote { border-left: 3px solid var(--accent); margin: 1.5em 0; padding: 0.2em 1em; color: var(--text-muted); }
.prose pre { background: var(--bg-soft); border: 1px solid var(--border); border-radius: 8px; padding: 16px; overflow-x: auto; font-size: 0.9rem; }
.prose code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.prose :not(pre) > code { background: var(--bg-soft); padding: 2px 5px; border-radius: 4px; font-size: 0.9em; }
.prose img { max-width: 100%; border-radius: 8px; }
```

- [ ] **Step 2: PostLayout.astro 작성 (와이드 커버 헤더 + 단일 컬럼)**

```astro
---
import BaseLayout from './BaseLayout.astro';
import PostMeta from '../components/PostMeta.astro';
import Comments from '../components/Comments.astro';
import { readingTime } from '../utils/reading-time';
import '../styles/prose.css';
import type { CollectionEntry } from 'astro:content';

interface Props { post: CollectionEntry<'posts'>; }
const { post } = Astro.props;
const { title, description, pubDate, tags, cover, series } = post.data;
const minutes = readingTime(post.body ?? '');
---
<BaseLayout title={title} description={description} image={cover} article={true}>
  <header class="post-header" style={cover ? `background-image:url(${cover})` : ''} class:list={["post-header", { 'post-header--cover': cover }]}>
    <div class="container post-header__inner">
      {series && <a class="post-header__series" href={`/series/${encodeURIComponent(series)}`}>📚 {series}</a>}
      <h1 class="post-header__title">{title}</h1>
      <PostMeta pubDate={pubDate} minutes={minutes} tags={tags} />
    </div>
  </header>
  <article class="container">
    <div class="prose">
      <slot />
    </div>
  </article>
  <div class="container">
    <Comments />
  </div>
</BaseLayout>

<style>
  .post-header { padding: 60px 0 30px; border-bottom: 1px solid var(--border); }
  .post-header--cover { background-size: cover; background-position: center; padding: 120px 0 40px; position: relative; }
  .post-header--cover::after { content:""; position:absolute; inset:0; background: linear-gradient(to bottom, rgba(0,0,0,.1), var(--bg) 95%); }
  .post-header__inner { position: relative; z-index: 1; }
  .post-header__title { font-family: var(--serif); font-size: 2.6rem; line-height: 1.2; margin: 12px 0 16px; }
  .post-header__series { color: var(--accent); font-size: 0.9rem; }
  @media (max-width: 640px) { .post-header__title { font-size: 1.9rem; } }
</style>
```

> 참고: 위 `<header>`의 `class`/`class:list` 중복 속성은 다음 Step에서 정리한다.

- [ ] **Step 3: post-header 속성 정리 — `<header>` 태그를 아래로 교체**

```astro
  <header class:list={["post-header", { 'post-header--cover': cover }]} style={cover ? `background-image:url(${cover})` : ''}>
```

- [ ] **Step 4: 글 상세 라우트 `src/pages/posts/[...id].astro` 작성**

```astro
---
import { getCollection, render } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';
import { publishedSorted } from '../../utils/posts';

export async function getStaticPaths() {
  const posts = publishedSorted(await getCollection('posts'));
  return posts.map((post) => ({ params: { id: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---
<PostLayout post={post}>
  <Content />
</PostLayout>
```

- [ ] **Step 5: 빌드 + dev 확인**

Run: `npm run build`
Expected: 각 발행 글에 대해 `dist/posts/<id>/index.html` 생성. 이어서 `npm run dev`로 한 글 열어 세리프 본문·헤더 확인 후 종료.

- [ ] **Step 6: Commit**

```bash
git add src/styles/prose.css src/layouts/PostLayout.astro src/pages/posts/
git commit -m "feat: add post detail page with cover header and serif prose"
```

---

## Task 13: 댓글 (giscus)

**Files:**
- Create: `src/components/Comments.astro`

(Task 12에서 이미 import 했으므로 이 파일이 있어야 빌드된다. 순서상 Task 12 빌드 전에 본 파일을 먼저 만들어도 무방하나, 분리해 관리한다.)

- [ ] **Step 1: Comments.astro 작성 (설정값 없으면 렌더 안 함)**

```astro
---
import { GISCUS } from '../consts';
const enabled = GISCUS.repoId && GISCUS.categoryId;
---
{enabled ? (
  <section class="comments">
    <script
      src="https://giscus.app/client.js"
      data-repo={GISCUS.repo}
      data-repo-id={GISCUS.repoId}
      data-category={GISCUS.category}
      data-category-id={GISCUS.categoryId}
      data-mapping="pathname"
      data-strict="1"
      data-reactions-enabled="1"
      data-emit-metadata="0"
      data-input-position="top"
      data-theme="light"
      data-lang="ko"
      crossorigin="anonymous"
      async
    ></script>
  </section>
) : null}

<style>.comments { margin-top: 60px; border-top: 1px solid var(--border); padding-top: 30px; }</style>
```

- [ ] **Step 2: 빌드 확인 (설정값 없을 때 비활성)**

Run: `npm run build`
Expected: 성공, 댓글 영역 미출력.

- [ ] **Step 3: Commit**

```bash
git add src/components/Comments.astro
git commit -m "feat: add giscus comments (config-gated)"
```

---

## Task 14: 전체 글 아카이브 `/writing` (페이지네이션)

**Files:**
- Create: `src/pages/writing/[...page].astro`

- [ ] **Step 1: writing 라우트 작성**

```astro
---
import { getCollection } from 'astro:content';
import type { GetStaticPaths, Page } from 'astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { publishedSorted } from '../../utils/posts';
import { SITE } from '../../consts';
import type { CollectionEntry } from 'astro:content';

export const getStaticPaths = (async ({ paginate }) => {
  const posts = publishedSorted(await getCollection('posts'));
  return paginate(posts, { pageSize: SITE.postsPerPage });
}) satisfies GetStaticPaths;

const { page } = Astro.props as { page: Page<CollectionEntry<'posts'>> };
---
<BaseLayout title="Writing">
  <div class="container">
    <h1 class="page-title">Writing</h1>
    {page.data.map((post) => <PostCard post={post} />)}
    <nav class="pager">
      {page.url.prev && <a href={page.url.prev}>← 이전</a>}
      <span>{page.currentPage} / {page.lastPage}</span>
      {page.url.next && <a href={page.url.next}>다음 →</a>}
    </nav>
  </div>
</BaseLayout>

<style>
  .page-title { font-family: var(--serif); font-size: 2rem; padding: 30px 0 10px; }
  .pager { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; color: var(--text-muted); }
</style>
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: `dist/writing/index.html` (1페이지) 생성. 글이 10개 초과면 `/writing/2` 등 생성.

- [ ] **Step 3: Commit**

```bash
git add src/pages/writing/
git commit -m "feat: add writing archive with pagination"
```

---

## Task 15: 태그 페이지 `/topics`, `/topics/[tag]`

**Files:**
- Create: `src/pages/topics/index.astro`
- Create: `src/pages/topics/[tag].astro`

- [ ] **Step 1: topics 인덱스 작성**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { collectTags } from '../../utils/posts';

const tags = collectTags(await getCollection('posts'));
---
<BaseLayout title="Topics">
  <div class="container">
    <h1 class="page-title">Topics</h1>
    <ul class="tag-cloud">
      {tags.map(({ tag, count }) => (
        <li><a href={`/topics/${encodeURIComponent(tag)}`}>{tag} <span>{count}</span></a></li>
      ))}
    </ul>
  </div>
</BaseLayout>

<style>
  .page-title { font-family: var(--serif); font-size: 2rem; padding: 30px 0 10px; }
  .tag-cloud { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 12px; }
  .tag-cloud a { border: 1px solid var(--border); border-radius: 999px; padding: 8px 16px; color: var(--text); }
  .tag-cloud a:hover { border-color: var(--accent); color: var(--accent); }
  .tag-cloud span { color: var(--text-muted); font-size: 0.85rem; }
</style>
```

- [ ] **Step 2: 태그별 글 목록 작성**

```astro
---
import { getCollection } from 'astro:content';
import type { GetStaticPaths } from 'astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { publishedSorted, collectTags } from '../../utils/posts';

export const getStaticPaths = (async () => {
  const all = await getCollection('posts');
  const tags = collectTags(all);
  const published = publishedSorted(all);
  return tags.map(({ tag }) => ({
    params: { tag },
    props: { tag, posts: published.filter((p) => p.data.tags.includes(tag)) },
  }));
}) satisfies GetStaticPaths;

const { tag, posts } = Astro.props;
---
<BaseLayout title={`#${tag}`}>
  <div class="container">
    <h1 class="page-title">#{tag}</h1>
    {posts.map((post) => <PostCard post={post} />)}
  </div>
</BaseLayout>

<style>.page-title { font-family: var(--serif); font-size: 2rem; padding: 30px 0 10px; }</style>
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: `dist/topics/index.html` + 각 태그별 페이지 생성(`dist/topics/AI/index.html` 등).

- [ ] **Step 4: Commit**

```bash
git add src/pages/topics/
git commit -m "feat: add topics index and per-tag pages"
```

---

## Task 16: 시리즈 페이지 `/series/[name]`

**Files:**
- Create: `src/pages/series/[name].astro`

- [ ] **Step 1: series 라우트 작성**

```astro
---
import { getCollection } from 'astro:content';
import type { GetStaticPaths } from 'astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { publishedSorted, collectSeries } from '../../utils/posts';

export const getStaticPaths = (async () => {
  const all = await getCollection('posts');
  const published = publishedSorted(all);
  return collectSeries(all).map((name) => ({
    params: { name },
    // 시리즈는 보통 오래된 글부터 읽으므로 오름차순
    props: { name, posts: published.filter((p) => p.data.series === name).reverse() },
  }));
}) satisfies GetStaticPaths;

const { name, posts } = Astro.props;
---
<BaseLayout title={`시리즈: ${name}`}>
  <div class="container">
    <p class="series-label">📚 시리즈</p>
    <h1 class="page-title">{name}</h1>
    {posts.map((post) => <PostCard post={post} />)}
  </div>
</BaseLayout>

<style>
  .series-label { color: var(--accent); margin: 30px 0 0; }
  .page-title { font-family: var(--serif); font-size: 2rem; padding: 6px 0 10px; }
</style>
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 시리즈가 있는 경우 `dist/series/<name>/index.html` 생성.

- [ ] **Step 3: Commit**

```bash
git add src/pages/series/
git commit -m "feat: add series pages"
```

---

## Task 17: About, Projects 페이지

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/pages/projects.astro`

- [ ] **Step 1: about.astro 작성**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE, SOCIAL } from '../consts';
---
<BaseLayout title="About">
  <div class="container about">
    <img class="about__avatar" src={SITE.avatar} alt={SITE.author} />
    <h1 class="about__name">{SITE.author}</h1>
    <p class="about__tagline">{SITE.tagline}</p>
    <div class="prose-lite">
      <p>
        하루하루 성장하는 개발자입니다. 개발 기술뿐 아니라 기술 일반,
        조직문화, 그리고 AI가 일하는 방식을 어떻게 바꾸는지에 대해
        에세이처럼 글을 씁니다.
      </p>
      <p>
        빠른 결론보다 천천히 생각을 펼치는 글을 지향합니다.
      </p>
    </div>
    <div class="about__links">
      <a href={SOCIAL.github} target="_blank" rel="noopener">GitHub</a>
      <a href={SOCIAL.tistory} target="_blank" rel="noopener">Tistory</a>
      <a href={SOCIAL.email}>Email</a>
    </div>
  </div>
</BaseLayout>

<style>
  .about { padding-top: 40px; text-align: center; }
  .about__avatar { width: 96px; height: 96px; border-radius: 50%; }
  .about__name { font-family: var(--serif); font-size: 1.8rem; margin: 16px 0 4px; }
  .about__tagline { color: var(--text-muted); margin: 0 0 24px; }
  .prose-lite { font-family: var(--serif); font-size: 1.1rem; line-height: 1.85; text-align: left; }
  .about__links { display: flex; justify-content: center; gap: 16px; margin-top: 30px; }
</style>
```

- [ ] **Step 2: projects.astro 작성**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const projects = [
  {
    title: 'Pocket Senior',
    desc: '출퇴근길에 읽는 백엔드 개발 미니북',
    href: 'https://iamhardyha.github.io/pocket-senior/',
    badge: 'PROJECT',
  },
  {
    title: '티스토리 블로그',
    desc: '기술 블로그 보러가기',
    href: 'https://devhardy.tistory.com/',
    badge: 'BLOG',
  },
];
---
<BaseLayout title="Projects">
  <div class="container">
    <h1 class="page-title">Projects</h1>
    {projects.map((p) => (
      <a class="proj" href={p.href} target="_blank" rel="noopener">
        <div>
          <span class="proj__badge">{p.badge}</span>
          <h3 class="proj__title">{p.title}</h3>
          <p class="proj__desc">{p.desc}</p>
        </div>
        <span class="proj__arrow">→</span>
      </a>
    ))}
  </div>
</BaseLayout>

<style>
  .page-title { font-family: var(--serif); font-size: 2rem; padding: 30px 0 10px; }
  .proj { display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; color: var(--text); }
  .proj:hover { border-color: var(--accent); }
  .proj__badge { color: var(--accent); font-size: 0.75rem; letter-spacing: 0.08em; }
  .proj__title { font-family: var(--serif); margin: 6px 0 4px; }
  .proj__desc { color: var(--text-muted); margin: 0; }
  .proj__arrow { font-size: 1.4rem; color: var(--text-muted); }
</style>
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: `dist/about/index.html`, `dist/projects/index.html` 생성.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro src/pages/projects.astro
git commit -m "feat: add about and projects pages"
```

---

## Task 18: RSS 피드 `/rss.xml`

**Files:**
- Create: `src/pages/rss.xml.ts`

- [ ] **Step 1: rss.xml.ts 작성**

```ts
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
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: `dist/rss.xml` 생성. 파일에 글 항목 포함.

- [ ] **Step 3: Commit**

```bash
git add src/pages/rss.xml.ts
git commit -m "feat: add RSS feed"
```

---

## Task 19: 검색 페이지 `/search` (Pagefind)

**Files:**
- Create: `src/pages/search.astro`

`astro-pagefind` 통합은 Task 1에서 추가됨. `npm run build`의 `pagefind --site dist`가 색인을 생성한다. dev 모드에서는 색인이 없을 수 있으니 빌드 후 `npm run preview`로 검증한다.

- [ ] **Step 1: search.astro 작성**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Search from 'astro-pagefind/components/Search';
---
<BaseLayout title="검색">
  <div class="container">
    <h1 class="page-title">검색</h1>
    <Search id="search" className="pagefind-ui" uiOptions={{ showImages: false }} />
  </div>
</BaseLayout>

<style>.page-title { font-family: var(--serif); font-size: 2rem; padding: 30px 0 10px; }</style>
```

- [ ] **Step 2: 빌드 후 프리뷰로 검색 확인**

Run: `npm run build && npm run preview`
브라우저: `http://localhost:4321/search` 에서 "도구" 등 검색.
Expected: 발행 글이 검색 결과로 노출. 종료(Ctrl+C).

- [ ] **Step 3: Commit**

```bash
git add src/pages/search.astro
git commit -m "feat: add Pagefind search page"
```

---

## Task 20: 방문자 카운터 (GoatCounter, 오늘/누적 공개 표시)

**Files:**
- Create: `src/components/VisitorCount.astro`
- Modify: `src/components/Footer.astro`

설계: 추적 스크립트는 Task 9의 BaseLayout에서 이미 로드(설정값 있을 때). 본 컴포넌트는 푸터에 **누적/오늘** 수치를 표시한다.
- **누적**: 공개 카운터 엔드포인트 `https://CODE.goatcounter.com/counter/TOTAL.json` (브라우저 임베드용, 인증 불필요) → `{count_unique}` 사용.
- **오늘**: read-only API 토큰이 있을 때만, `https://CODE.goatcounter.com/api/v0/stats/total?start=<오늘>&end=<오늘>` 호출. 토큰/CORS 문제로 실패하면 "오늘" 영역을 숨긴다(누적은 그대로 노출).

- [ ] **Step 1: VisitorCount.astro 작성**

```astro
---
import { GOATCOUNTER } from '../consts';
const enabled = !!GOATCOUNTER.code;
---
{enabled && (
  <div class="visitors" data-gc-code={GOATCOUNTER.code} data-gc-token={GOATCOUNTER.apiToken}>
    <span class="visitors__item">누적 <strong id="gc-total">—</strong></span>
    <span class="visitors__item visitors__today" id="gc-today-wrap" hidden>· 오늘 <strong id="gc-today">—</strong></span>
  </div>
)}

<script>
  const el = document.querySelector('.visitors') as HTMLElement | null;
  if (el) {
    const code = el.dataset.gcCode!;
    const token = el.dataset.gcToken;
    const fmt = (n: number | string) => Number(String(n).replace(/,/g, '')).toLocaleString('ko-KR');

    // 누적 (공개 카운터)
    fetch(`https://${code}.goatcounter.com/counter/TOTAL.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const total = document.getElementById('gc-total');
        if (total) total.textContent = fmt(d.count_unique ?? d.count ?? 0);
      })
      .catch(() => {});

    // 오늘 (토큰 있을 때만)
    if (token) {
      const today = new Date().toISOString().slice(0, 10);
      fetch(`https://${code}.goatcounter.com/api/v0/stats/total?start=${today}&end=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          const wrap = document.getElementById('gc-today-wrap');
          const todayEl = document.getElementById('gc-today');
          if (wrap && todayEl) {
            todayEl.textContent = fmt(d.total ?? 0);
            wrap.hidden = false;
          }
        })
        .catch(() => {});
    }
  }
</script>

<style>
  .visitors { color: var(--text-muted); font-size: 0.8rem; display: flex; gap: 6px; }
  .visitors strong { color: var(--text); }
</style>
```

- [ ] **Step 2: Footer.astro에 VisitorCount 삽입**

`src/components/Footer.astro`의 frontmatter import에 추가:

```astro
import VisitorCount from './VisitorCount.astro';
```

`<p class="footer__copy">…</p>` 바로 아래에 추가:

```astro
    <VisitorCount />
```

- [ ] **Step 3: 빌드 확인 (설정값 없을 때 비활성)**

Run: `npm run build`
Expected: 성공. GOATCOUNTER.code가 비어 있으면 카운터 미출력.

- [ ] **Step 4: Commit**

```bash
git add src/components/VisitorCount.astro src/components/Footer.astro
git commit -m "feat: add GoatCounter visitor counter (today/total)"
```

---

## Task 21: 404 페이지

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: 404.astro 작성**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="404">
  <div class="container nf">
    <h1 class="nf__code">404</h1>
    <p class="nf__msg">찾으시는 글이 없습니다.</p>
    <a href="/" class="nf__home">← 홈으로</a>
  </div>
</BaseLayout>

<style>
  .nf { text-align: center; padding: 100px 0; }
  .nf__code { font-family: var(--serif); font-size: 4rem; margin: 0; }
  .nf__msg { color: var(--text-muted); }
  .nf__home { font-weight: 600; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: add 404 page"
```

---

## Task 22: 배포 워크플로우 교체 + 구 자산 제거 + README

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Delete: `index.html`, `assets/css/style.css`, `assets/js/main.js` (및 `assets/` 디렉터리)
- Modify: `README.md`

- [ ] **Step 1: deploy.yml을 Astro 빌드 방식으로 교체**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: 구 포트폴리오 자산 삭제**

Run: `git rm index.html assets/css/style.css assets/js/main.js && rmdir assets/css assets/js assets 2>/dev/null; true`
Expected: 파일 삭제됨.

- [ ] **Step 3: README.md 갱신**

```markdown
# iamhardyha.github.io

하창현(Hardy)의 에세이 블로그. 개발·기술·조직문화·AI에 대한 사견을 씁니다.

## 개발

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro build + pagefind 색인
npm run preview  # 빌드 결과 미리보기
npm test         # 유틸 단위 테스트
```

## 글 쓰기

`src/content/posts/`에 마크다운(`.md`/`.mdx`) 파일을 추가합니다. 프론트매터:

```yaml
---
title: "제목"
description: "요약"
pubDate: 2026-06-17
tags: ["AI", "조직문화"]
series: "시리즈명"   # 선택
cover: "/images/x.jpg" # 선택
draft: false           # true면 미발행
---
```

Built with [Astro](https://astro.build). Deployed on GitHub Pages.
```

- [ ] **Step 4: 전체 빌드 + 테스트 확인**

Run: `npm test && npm run build`
Expected: 단위 테스트 PASS, 빌드 성공, `dist/`에 모든 페이지 + `rss.xml` + 사이트맵 + pagefind 색인 생성.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy.yml README.md
git add -A
git commit -m "ci: build Astro site in Pages workflow; remove legacy portfolio"
```

---

## Task 23: 최종 검증

- [ ] **Step 1: 클린 빌드**

Run: `rm -rf dist .astro && npm run build`
Expected: 에러 없이 완료.

- [ ] **Step 2: 프리뷰로 수동 점검**

Run: `npm run preview`
점검 항목(`http://localhost:4321`):
- [ ] 홈: 대표 글 + 최근 글, 라이트 톤·세리프 제목
- [ ] 다크 토글 동작 + 새로고침 후 유지 + 깜빡임(FOUC) 없음
- [ ] 글 상세: 와이드 헤더, 세리프 본문, 코드 하이라이트
- [ ] `/writing` 목록 + 페이지네이션
- [ ] `/topics`, `/topics/<태그>`
- [ ] `/series/<시리즈>` (해당 글 있을 때)
- [ ] `/about`, `/projects`
- [ ] `/search`에서 글 검색
- [ ] 모바일 폭(개발자도구)에서 반응형
- [ ] `/rss.xml`, `/sitemap-index.xml` 접근
종료(Ctrl+C).

- [ ] **Step 3: 산출물 파일 존재 확인**

Run: `ls dist/rss.xml dist/sitemap-index.xml dist/pagefind/ dist/.nojekyll dist/index.html`
Expected: 모두 존재.

- [ ] **Step 4: (선택) 외부 설정값 입력 후 재검증**

giscus·GoatCounter 발급값을 `src/consts.ts`에 입력했다면, 재빌드/프리뷰로 댓글 위젯·방문자 카운터(누적/오늘) 노출 확인. (`사전 메모` 참조)

---

## Self-Review 결과

- **Spec 커버리지**: 정체성/디자인(T6·T7·T9·T12), 스택(T1), 콘텐츠 모델(T4), 라우팅 전체(T11·T12·T14·T15·T16·T17), 컴포넌트 분리(T7~T10·T13·T20), 기능(RSS T18, 검색 T19, giscus T13, 시리즈 T16, 테마 토글 T7, 읽는 시간 T3·T10, 사이트맵 T1, OG/SEO T9, 코드 하이라이트 T12, 반응형 각 컴포넌트), 마이그레이션(T22), 검증(T23) — 모두 매핑됨. 방문자 집계(추가 요구)는 T20에서 커버.
- **플레이스홀더**: 외부 발급값(giscus/GoatCounter)은 `src/consts.ts`의 명시적 설정 상수로 분리하고 "값 있을 때만 렌더" 처리 — 코드 공백 아님.
- **타입 일관성**: `publishedSorted`/`collectTags`/`collectSeries`(T5), `readingTime`(T3), `post.id`(glob 로더 기준) 라우팅을 전 태스크에서 동일하게 사용.
- **주의점**: T12의 post-header 속성은 Step 3에서 `class:list` 한 줄로 정리.
