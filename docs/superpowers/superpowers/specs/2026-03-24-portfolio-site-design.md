# Portfolio Site Design Spec

## Overview

Transform `iamhardyha.github.io` from a Jekyll blog into a single-page animated portfolio site with a Dark + Glassmorphism hybrid design.

## Goals

- Personal branding site for developer "Hardy" (하창현)
- Trendy, animation-rich, mobile-first responsive design
- No build tools — pure HTML/CSS/JS deployed on GitHub Pages
- Replace existing Jekyll blog (blogging continues on Tistory)

## Design Direction

**Style:** Dark base (#0a0a0f → #0f0a1a → #120e24) with Glassmorphism card accents.
**Accent color:** Purple (#c4b5fd, #8b5cf6, #7c3aed) with blue secondary (#60a5fa, #3b82f6).
**Typography:** System font stack, large hero text (2.4rem), clean hierarchy.
**Glass cards:** `rgba(255,255,255,0.04)` background, `backdrop-filter: blur(10px)`, `1px solid rgba(255,255,255,0.08)` border.

## Page Structure

Single page, vertical scroll, 7 sections:

### 1. Navigation
- Left: "Hardy Ha" logo text (white, bold)
- Right: About / Projects / Contact links
- Sticky top, border-bottom separator
- Smooth scroll to sections on click

### 2. Hero
- "안녕하세요 👋" — large white text, fade-up animation
- "하루하루 성장하는 개발자 **하디**입니다" — "하디" has animated gradient text (purple ↔ blue)
- No CTA buttons

### 3. Motto
- "어제의 나보다 개발을 더 잘하자"
- Typing animation: characters appear one by one with blinking cursor
- Wrapped in subtle glass container with italic style

### 4. About Me
- Section label: "ABOUT ME" (purple, uppercase, letter-spacing)
- Glass card containing:
  - Name: 하창현 (Hardy)
  - Self-introduction text (placeholder for now — user will fill in)
- Scroll fade-in animation

### 5. Projects & Blog
- Section label: "PROJECTS & BLOG"
- Two glass cards, scroll fade-in:

**Card 1 — Pocket Senior:**
- Purple gradient icon (📚)
- Title: "Pocket Senior" + purple `PROJECT` badge
- Description: "출퇴근길에 읽는 백엔드 개발 미니북"
- Tech tags: VitePress, Vue 3, 27 Notes
- Links to: `https://iamhardyha.github.io/pocket-senior/`
- Arrow indicator (→)

**Card 2 — Tistory Blog:**
- Orange gradient icon (📝)
- Title: "티스토리 블로그" + orange `BLOG` badge
- Description: "기술 블로그 보러가기"
- Links to: Tistory blog URL (placeholder `href="#"` until user provides URL; marked as pre-launch prerequisite)
- Arrow indicator (→)

### 6. Contact
- Section label: "CONTACT"
- 3 glass cards in a row:
  - GitHub (🐙) → `https://github.com/iamhardyha`
  - Email (✉️) → `mailto:hachanghyeon411@gmail.com`
  - LinkedIn (💼) → omit until user provides URL; add later as a card
- Hover glow + lift animation

### 7. Footer
- "© 2026 Hardy Ha. All rights reserved."
- Top border separator

## Animations (6 total)

| Animation | Where | Implementation |
|-----------|-------|----------------|
| Typing | Motto section | JS-based (`setTimeout` per character) for reliable proportional font support, blinking cursor via CSS |
| Scroll fade-in | All sections below hero | Intersection Observer API, `translateY(20px)` → `translateY(0)` + opacity |
| Floating glow | Background | CSS `@keyframes` on absolute-positioned blur circles, varying durations (4-6s) |
| Gradient text | "하디" in hero | `background-size: 200%`, `animation: gradientShift 3s ease infinite` |
| Hover interaction | All glass cards | `transform: translateY(-2px)`, `border-color` glow, `box-shadow` on `:hover` |
| Smooth scroll | Nav links | `scroll-behavior: smooth` + anchor links |

## Responsive Design

**Mobile-first approach:**
- Base styles for mobile (< 768px)
- Cards stack vertically
- Contact cards: 3-column grid maintained (compact padding)
- Nav: simplified links (all 3 links visible, smaller font) — only 3 items, hamburger is unnecessary complexity
- `@media (prefers-reduced-motion: reduce)`: disable animations for accessibility

**Desktop (≥ 768px):**
- Max-width container (640-800px) centered
- Larger hero text
- More prominent floating glows

## Technical Details

**File structure after migration:**
```
/
├── index.html          # Single page (replaces docs/ Jekyll structure)
├── assets/
│   ├── css/
│   │   └── style.css   # All styles
│   └── js/
│       └── main.js     # Intersection Observer, typing animation
├── # Note: pocket-senior/ is hosted in a separate repo (iamhardyha/pocket-senior)
├── .gitignore
└── README.md
```

**Jekyll removal & GitHub Pages migration:**
- Remove `docs/` directory (Jekyll config, layouts, posts, includes)
- Remove Jekyll-specific files (`_config.yml`, `_posts/`, `_layouts/`, `_includes/`)
- Place `index.html` at repo root
- **Update GitHub Pages source** from `/docs` to `/` (root) in repository Settings > Pages

**Performance targets:**
- No external JS frameworks
- CSS animations use `transform` and `opacity` only (GPU-accelerated)
- `backdrop-filter` limited to card elements only (not full-page)
- `prefers-reduced-motion` media query to disable animations for accessibility
- Total page size < 50KB (initial version, excluding future images)

**HTML head metadata:**
- `<html lang="ko">`
- `<title>Hardy Ha — 하루하루 성장하는 개발자</title>`
- `<meta name="description" content="하루하루 성장하는 개발자 하디의 포트폴리오">`
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Open Graph tags for social sharing (og:title, og:description, og:image)
- Favicon

## Out of Scope

- Experience / Tech Stack sections (user has not provided this info)
- Dark/light mode toggle (dark only)
- Blog post content (stays on Tistory)
- Contact form (links only)
- Analytics / tracking
