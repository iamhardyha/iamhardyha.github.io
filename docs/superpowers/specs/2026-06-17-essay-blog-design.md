# 에세이 블로그 전환 설계 (Essay Blog Migration)

- **작성일**: 2026-06-17
- **상태**: 승인됨 (브레인스토밍 완료)
- **대상 레포**: `iamhardyha.github.io` (GitHub Pages 루트 사이트)

## 1. 목적과 배경

기존 단일 페이지 포트폴리오(`index.html`, 다크 글래스모피즘)를 **에세이 중심 블로그**로 전면 전환한다. 개발 기술뿐 아니라 개발 일반·기술·조직문화·AI 등 다양한 주제에 대한 개인적 사견을 에세이 형식으로 작성·발행하는 공간이 목표다.

마크다운으로 글을 쓰면 목록·상세·태그·RSS가 자동 생성되는 정적 사이트 생성기 기반으로 구축한다.

## 2. 정체성 & 디자인 방향

- **콘셉트**: 미디엄(Medium)식 라이트 미니멀 — "읽기 우선" 에세이 톤.
- **컬러 (라이트, 기본)**:
  - 배경: 순백 `#ffffff`
  - 본문 텍스트: 잉크 블랙 `#242424`
  - 메타/보조 텍스트: 회색 `#6b6b6b`
  - 액센트(태그·링크·구분선): 그린 `#1a8917`
- **컬러 (다크, 토글)**: 짙은 잉크 배경(예 `#16181c`) + 밝은 세리프 텍스트 + 그린 액센트 유지. 라이트와 한 쌍으로 설계.
- **테마 토글**: 라이트 기본. 초기값은 `prefers-color-scheme`, 사용자 선택은 `localStorage`에 저장. FOUC 방지를 위해 head에서 인라인 스크립트로 클래스 선적용.
- **타이포그래피**:
  - 본문: 세리프 (`Georgia, "Nanum Myeongjo", serif`), 행간 1.8~1.9, 본문 폭 약 680px.
  - UI/메타/네비: 산세리프 (`Pretendard, -apple-system, sans-serif`).
- **이전 글래스모피즘(보라/블루 글로우, glass-card)은 폐기**한다 (톤 변경에 따름).

## 3. 기술 스택

- **Astro** (정적 출력 `output: 'static'`).
- **콘텐츠**: Astro Content Collections + Markdown/MDX.
- **배포**: GitHub Actions에서 `astro build` → `dist/` 를 GitHub Pages에 배포. `.nojekyll` 유지.
- **통합/플러그인**:
  - `@astrojs/rss` — RSS 피드
  - `@astrojs/sitemap` — 사이트맵
  - `@astrojs/mdx` — MDX 지원
  - `astro-pagefind` (또는 Pagefind) — 글내 검색 (정적 인덱스)
  - Shiki (Astro 내장) — 코드 하이라이트
  - giscus — GitHub Discussions 기반 댓글

## 4. 콘텐츠 모델

`src/content/` 하위 `posts` 컬렉션. 프론트매터 스키마(zod로 검증):

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `title` | string | ✓ | 글 제목 |
| `description` | string | ✓ | 요약(목록·OG·검색용) |
| `pubDate` | date | ✓ | 발행일 |
| `updatedDate` | date | | 수정일 |
| `tags` | string[] | | 자유 태그 |
| `cover` | string | | 상세 헤더 커버 이미지 경로 |
| `series` | string | | 시리즈/연재 이름 |
| `draft` | boolean | | true면 빌드에서 제외 |

- **읽는 시간**은 본문 글자 수로 자동 계산(별도 필드 불필요).
- 마크다운 파일 추가 → 목록/상세/태그/시리즈/RSS/사이트맵에 자동 반영.

## 5. 페이지 / 라우팅

| 경로 | 내용 |
|---|---|
| `/` | 홈(에디토리얼/매거진) — 대표 글 1개 크게 + 최신 글 카드 그리드 |
| `/writing` | 전체 글 아카이브, 시간 역순, 페이지네이션 |
| `/posts/[slug]` | 글 상세 — 와이드 헤더(제목·메타·옵션 커버) + 세리프 단일 컬럼 + 댓글 |
| `/topics` | 태그 인덱스(태그별 글 수) |
| `/topics/[tag]` | 특정 태그의 글 목록 |
| `/series/[name]` | 시리즈/연재 묶음 목록 |
| `/about` | 소개 (기존 About 내용 이전·확장) |
| `/projects` | 외부 프로젝트/블로그 링크 카드 (Pocket Senior, 티스토리 등) |
| `/rss.xml` | 자동 생성 RSS |
| `/sitemap-index.xml` | 자동 생성 사이트맵 |

- **홈 대표 글 선정**: 가장 최근 글을 기본 대표로(추후 프론트매터 `featured` 플래그 도입 여지 — 현재 범위 외).

## 6. 컴포넌트 구조

작은 단일 책임 컴포넌트로 분리(파일당 200~400줄 이내 지향):

- `layouts/BaseLayout.astro` — html/head/메타/테마 스크립트/Nav/Footer
- `layouts/PostLayout.astro` — 와이드 헤더 + Prose 본문 + 댓글
- `components/Nav.astro` — Writing / About / Topics / Projects + 테마 토글 + 검색
- `components/Footer.astro`
- `components/ThemeToggle.astro`
- `components/PostCard.astro` — 목록/그리드 카드
- `components/FeaturedPost.astro` — 홈 대표 글
- `components/TagList.astro` / `SeriesBadge.astro`
- `components/Comments.astro` — giscus
- `components/Search.astro` — pagefind UI
- `components/Prose.astro` (또는 글로벌 `.prose` 스타일) — 세리프 본문 타이포

## 7. 기능 요약

- **기본 포함**: RSS, 사이트맵, OG/SEO 메타, 읽는 시간, 코드 하이라이트, 태그 페이지, 반응형.
- **추가**: giscus 댓글, Pagefind 글내 검색, 시리즈/연재 묶음.
- **제외(현재 범위 외)**: 뉴스레터 구독.

## 8. 마이그레이션 계획

1. 기존 루트 `index.html`, `assets/css`, `assets/js`(포트폴리오)는 Astro 구조로 대체.
2. About·Projects의 기존 콘텐츠는 새 `/about`, `/projects` 페이지로 이전. 외부 링크(GitHub, 이메일, 티스토리, Pocket Senior) 보존.
3. 기존 `.github/workflows/deploy.yml`(정적 파일 업로드)을 **Astro 빌드 후 배포** 워크플로우로 교체.
4. `.nojekyll` 유지. `.gitignore`에 `dist/`, `node_modules/`, `.astro/` 추가.
5. 글래스모피즘 관련 CSS/마크업 폐기.

## 9. 검증 기준

- `astro build` 성공, 내부 링크 깨짐 없음.
- 라이트/다크 토글 정상 동작 + 새로고침 후 선택 유지 + FOUC 없음.
- 모바일/데스크톱 반응형 정상.
- RSS(`/rss.xml`)·사이트맵 생성 확인.
- Pagefind 검색이 발행 글을 인덱싱·검색.
- giscus 댓글 위젯 로드.
- 샘플 에세이 1편으로 홈→목록→상세→태그→댓글 전체 플로우 확인.

## 10. 비고 / 추후 과제

- giscus는 GitHub repo의 Discussions 활성화 및 giscus 앱 설치 필요(사용자 액션).
- 홈 대표 글 수동 지정(`featured`)은 후속 개선 후보.
- 기존 티스토리 블로그와의 관계(병행/이전)는 콘텐츠 운영 결정 사항으로 본 설계 범위 외.
