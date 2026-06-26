# 어디서나 글쓰기 — `/admin` CMS 설정 (Sveltia)

폰·태블릿·다른 PC 어디서든 브라우저로 `https://iamhardyha.github.io/admin/` 에 들어가
**GitHub 로그인**만 하면 글을 쓰고 바로 커밋할 수 있습니다. repo 쓰기 권한이 있는
사람(=나)만 저장 가능하고, 다른 사람은 로그인해도 아무것도 못 합니다.

> 로컬 dev 에디터(`npm run dev` → `/editor`)는 그대로 둡니다. 이건 *추가* 경로입니다.

정적 사이트는 OAuth 토큰 교환을 직접 못 하므로, **무료 Cloudflare Worker** 하나가
GitHub 로그인 중계를 합니다. 1회 설정(약 10분)만 하면 끝입니다.

---

## 1. GitHub OAuth App 만들기

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
2. 입력:
   - **Application name**: `iamhardyha blog CMS` (자유)
   - **Homepage URL**: `https://iamhardyha.github.io`
   - **Authorization callback URL**: `https://sveltia-cms-auth.<당신-계정>.workers.dev/callback`
     (Worker 주소는 2단계에서 정해집니다. 일단 임시로 넣고 나중에 정확히 수정 가능)
3. 생성 후 **Client ID** 복사, **Generate a new client secret** 눌러 **Client secret** 복사.
   (secret은 한 번만 보이니 안전한 곳에 보관)

## 2. Sveltia CMS Auth Worker 배포 (Cloudflare, 무료)

OAuth 중계용 워커입니다. 저장소: <https://github.com/sveltia/sveltia-cms-auth>

가장 쉬운 길:

1. Cloudflare 계정 로그인 → **Workers & Pages**.
2. 위 저장소를 **Deploy to Cloudflare** 하거나, 로컬에서:
   ```bash
   git clone https://github.com/sveltia/sveltia-cms-auth
   cd sveltia-cms-auth
   npm install
   npx wrangler deploy
   ```
3. 배포된 Worker에 **환경변수(Variables/Secrets)** 설정:
   - `GITHUB_CLIENT_ID` = 1단계 Client ID
   - `GITHUB_CLIENT_SECRET` = 1단계 Client secret
   - `ALLOWED_DOMAINS` = `iamhardyha.github.io`
   (대시보드: Worker → Settings → Variables, 또는 `npx wrangler secret put ...`)
4. Worker 주소 확인: 예 `https://sveltia-cms-auth.<계정>.workers.dev`
5. 1단계 OAuth App의 **callback URL**을 `…workers.dev/callback` 로 정확히 맞춰 저장.

## 3. config 연결

`public/admin/config.yml` 의 `base_url` 을 Worker 주소로 교체 (뒤 슬래시 없이):

```yaml
backend:
  name: github
  repo: iamhardyha/iamhardyha.github.io
  branch: main
  base_url: https://sveltia-cms-auth.<계정>.workers.dev
```

커밋 → push → GitHub Actions가 재배포.

## 4. 사용

1. 아무 기기에서 `https://iamhardyha.github.io/admin/` 접속
2. **Sign in with GitHub** → 권한 승인
3. **글(Posts)** → 새 글 작성. 새 글은 기본 `draft: true`(비공개)로 저장됩니다.
4. 다 쓰면 **draft 끄고** 저장 → 자동 커밋 → 빌드 → 공개.

---

## 동작/보안 요약

- **누가 쓰나**: GitHub 로그인 + 이 repo 쓰기 권한 = 나만. 남이 로그인해도 커밋 불가.
- **/admin 페이지 자체는 공개**: 로그인 버튼만 있는 껍데기라 정보가 없고, `noindex`라
  검색·사이트맵에서 제외됨. 실제 잠금은 "보이느냐"가 아니라 "GitHub 인증"입니다.
- **저장 형식**: `src/content/posts/<slug>.md` 로 YAML frontmatter + 본문. 스키마
  (title/description/pubDate/tags/series/cover/draft)와 일치하도록 필드를 맞춰 둠.
- **slug**: 한글 제목이어도 영문 슬러그를 직접 입력(기존 글 규칙과 동일). `slug` 필드는
  frontmatter에도 기록되지만 Astro 스키마가 무시하므로 URL/렌더에는 영향 없음.
- **이미지**: 업로드 시 `public/uploads/` 에 저장되고 `/uploads/<파일>` 로 참조됨.
- **로컬 에디터와 호환**: CMS가 쓰는 블록형 태그 목록도 로컬 에디터가 읽도록 파서를
  보강해 둠. 같은 글을 두 에디터에서 오가며 편집 가능.

## 비용

- Cloudflare Workers 무료 플랜(하루 10만 요청)으로 충분. GitHub/Pages도 무료.
