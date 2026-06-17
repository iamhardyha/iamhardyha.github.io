# iamhardyha.github.io

하창현(Hardy)의 에세이 블로그. 개발·기술·조직문화·AI에 대한 사견을 씁니다.

## 개발

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro build (+ Pagefind 색인)
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
