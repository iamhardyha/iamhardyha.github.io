# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Jekyll blog at `iamhardyha.github.io` into a single-page animated portfolio with Dark + Glassmorphism design.

**Architecture:** Pure HTML/CSS/JS single page. `index.html` at repo root with external `assets/css/style.css` and `assets/js/main.js`. No build tools. GitHub Pages serves from root (`/`).

**Tech Stack:** HTML5, CSS3 (custom properties, backdrop-filter, keyframes, Intersection Observer), vanilla JavaScript.

**Spec:** `docs/superpowers/specs/2026-03-24-portfolio-site-design.md`

---

## File Structure

```
/
├── index.html              # Single page — all 7 sections (nav, hero, motto, about, projects, contact, footer)
├── assets/
│   ├── css/
│   │   └── style.css       # All styles: reset, variables, layout, glass cards, animations, responsive
│   └── js/
│       └── main.js         # Typing animation, Intersection Observer for scroll fade-in
├── .gitignore              # Updated: add .superpowers/
├── .nojekyll               # Tells GitHub Pages to skip Jekyll processing
└── README.md               # Updated: describe the portfolio site
```

**Files to remove (Jekyll):**
- `docs/_config.yml`, `docs/_posts/`, `docs/_layouts/`, `docs/_includes/`
- `docs/about.md`, `docs/categories.html`, `docs/index.html`
- `docs/assets/` (css, img), `docs/Gemfile`, `docs/.ruby-version`, `docs/.gitignore`
- Keep `docs/superpowers/` (specs and plans)

---

## Task 1: Remove Jekyll and set up new file structure

**Files:**
- Remove: `docs/_config.yml`, `docs/_posts/`, `docs/_layouts/`, `docs/_includes/`, `docs/about.md`, `docs/categories.html`, `docs/index.html`, `docs/assets/`, `docs/Gemfile`, `docs/.ruby-version`, `docs/.gitignore`
- Create: `index.html` (skeleton), `assets/css/style.css` (empty), `assets/js/main.js` (empty), `.nojekyll`
- Modify: `.gitignore`

- [ ] **Step 1: Move spec/plan files out of docs temporarily**

```bash
mkdir -p superpowers-backup
cp -r docs/superpowers superpowers-backup/
```

- [ ] **Step 2: Remove the entire docs directory**

```bash
git rm -r docs/
```

- [ ] **Step 3: Restore spec/plan files to docs/superpowers**

```bash
mkdir -p docs/superpowers
cp -r superpowers-backup/* docs/superpowers/
rm -rf superpowers-backup
```

- [ ] **Step 4: Create new directory structure**

```bash
mkdir -p assets/css assets/js
touch assets/css/style.css assets/js/main.js
touch .nojekyll
```

- [ ] **Step 5: Create skeleton index.html**

Create `index.html` with:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hardy Ha — 하루하루 성장하는 개발자</title>
  <meta name="description" content="하루하루 성장하는 개발자 하디의 포트폴리오">
  <meta property="og:title" content="Hardy Ha — 하루하루 성장하는 개발자">
  <meta property="og:description" content="하루하루 성장하는 개발자 하디의 포트폴리오">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://iamhardyha.github.io">
  <meta property="og:image" content="https://avatars.githubusercontent.com/u/203849847?v=4">
  <link rel="icon" href="https://avatars.githubusercontent.com/u/203849847?v=4" type="image/png">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <!-- Sections will be added in subsequent tasks -->
  <script src="assets/js/main.js"></script>
</body>
</html>
```

- [ ] **Step 6: Update .gitignore**

Add `.superpowers/` to `.gitignore`:

```
CLAUDE.md
.idea/
.superpowers/
```

- [ ] **Step 7: Verify structure and commit**

```bash
ls index.html assets/css/style.css assets/js/main.js .nojekyll
```

Expected: all 4 files listed.

```bash
git add -A
git commit -m "chore: remove Jekyll, scaffold portfolio site structure"
```

---

## Task 2: CSS foundation — variables, reset, layout, glass card base

**Files:**
- Modify: `assets/css/style.css`

- [ ] **Step 1: Write CSS custom properties and reset**

In `assets/css/style.css`:

```css
/* ===== Reset & Base ===== */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Background gradient stops */
  --bg-primary: #0a0a0f;
  --bg-mid: #0f0a1a;
  --bg-deep: #120e24;

  /* Accent */
  --purple-light: #c4b5fd;
  --purple-mid: #8b5cf6;
  --purple-dark: #7c3aed;
  --blue-light: #60a5fa;
  --blue-mid: #3b82f6;

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-muted: rgba(255, 255, 255, 0.4);

  /* Glass */
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur: blur(10px);

  /* Spacing */
  --section-padding: 60px 20px;
  --container-max: 720px;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-mid) 30%, var(--bg-deep) 60%, var(--bg-primary) 100%);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 2: Write glass card and section label base styles**

Append to `assets/css/style.css`:

```css
/* ===== Layout ===== */
.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 20px;
}

/* ===== Section Label ===== */
.section-label {
  font-size: 0.7rem;
  color: rgba(139, 92, 246, 0.6);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

/* ===== Glass Card ===== */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.glass-card:hover {
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
  transform: translateY(-2px);
}
```

- [ ] **Step 3: Write floating glow animation styles**

Append to `assets/css/style.css`:

```css
/* ===== Floating Glows (Background) ===== */
.glow-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
}

.glow--1 {
  top: -60px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: rgba(139, 92, 246, 0.12);
  animation: glowPulse 4s ease-in-out infinite;
}

.glow--2 {
  top: 40%;
  left: -60px;
  width: 160px;
  height: 160px;
  background: rgba(59, 130, 246, 0.08);
  animation: glowFloat 5s ease-in-out infinite;
}

.glow--3 {
  top: 75%;
  right: -30px;
  width: 120px;
  height: 120px;
  background: rgba(139, 92, 246, 0.08);
  animation: glowFloat 6s ease-in-out infinite reverse;
}

@keyframes glowPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.08); }
}

@keyframes glowFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
```

- [ ] **Step 4: Write scroll fade-in and gradient text animations**

Append to `assets/css/style.css`:

```css
/* ===== Scroll Fade-In ===== */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ===== Gradient Text ===== */
.gradient-text {
  background: linear-gradient(90deg, var(--purple-light), var(--blue-light), var(--purple-light));
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* ===== Typing Cursor ===== */
.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--purple-light);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.8s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ===== Accessibility ===== */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
  .fade-in { opacity: 1; transform: none; }
}
```

- [ ] **Step 5: Open index.html in browser and verify dark background renders**

```bash
open index.html
```

Expected: solid dark page, no content visible yet. Background gradient should show.

- [ ] **Step 6: Commit**

```bash
git add assets/css/style.css
git commit -m "feat: add CSS foundation — variables, reset, glass cards, animations"
```

---

## Task 3: Navigation bar

**Files:**
- Modify: `index.html` (add nav HTML)
- Modify: `assets/css/style.css` (add nav styles)

- [ ] **Step 1: Add nav HTML to index.html**

Replace the `<!-- Sections will be added -->` comment in `<body>` with:

```html
  <!-- Floating background glows -->
  <div class="glow-container">
    <div class="glow glow--1"></div>
    <div class="glow glow--2"></div>
    <div class="glow glow--3"></div>
  </div>

  <!-- Navigation -->
  <nav class="nav">
    <div class="nav__inner container">
      <a href="#" class="nav__logo">Hardy Ha</a>
      <div class="nav__links">
        <a href="#about" class="nav__link">About</a>
        <a href="#projects" class="nav__link">Projects</a>
        <a href="#contact" class="nav__link">Contact</a>
      </div>
    </div>
  </nav>

  <!-- Main content wrapper -->
  <main>
    <!-- Sections added in subsequent tasks -->
  </main>

  <script src="assets/js/main.js"></script>
```

- [ ] **Step 2: Add nav styles to style.css**

Append to `assets/css/style.css`:

```css
/* ===== Navigation ===== */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.nav__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.nav__logo {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
}

.nav__links {
  display: flex;
  gap: 20px;
}

.nav__link {
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.nav__link:hover {
  color: var(--purple-light);
}
```

- [ ] **Step 3: Verify nav renders — sticky, logo left, links right**

```bash
open index.html
```

Expected: dark page with sticky nav bar at top. "Hardy Ha" on left, 3 links on right.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: add sticky navigation bar"
```

---

## Task 4: Hero section + Motto with typing animation

**Files:**
- Modify: `index.html` (add hero + motto HTML)
- Modify: `assets/css/style.css` (add hero + motto styles)
- Modify: `assets/js/main.js` (add typing animation)

- [ ] **Step 1: Add hero and motto HTML to index.html**

Inside `<main>`, replace the comment with:

```html
    <!-- Hero -->
    <section class="hero">
      <div class="container hero__content">
        <h1 class="hero__greeting fade-in">안녕하세요 👋</h1>
        <p class="hero__intro fade-in">하루하루 성장하는 개발자 <span class="gradient-text hero__name">하디</span>입니다</p>
      </div>
    </section>

    <!-- Motto -->
    <section class="motto fade-in">
      <div class="container">
        <div class="motto__box">
          <span class="motto__text" id="motto-text"></span>
          <span class="typing-cursor" id="motto-cursor"></span>
        </div>
      </div>
    </section>

    <!-- Remaining sections added in subsequent tasks -->
```

- [ ] **Step 2: Add hero and motto styles**

Append to `assets/css/style.css`:

```css
/* ===== Hero ===== */
.hero {
  padding: 80px 0 50px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero__greeting {
  font-size: 2.4rem;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1.3;
}

.hero__intro {
  margin-top: 14px;
  font-size: 1.15rem;
  color: var(--text-secondary);
  line-height: 1.6;
  transition-delay: 0.2s;
}

.hero__name {
  font-weight: 700;
  font-size: 1.2rem;
}

/* ===== Motto ===== */
.motto {
  padding: 0 0 60px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.motto__box {
  display: inline-block;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 12px 24px;
  min-height: 44px;
}

.motto__text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-style: italic;
}
```

- [ ] **Step 3: Write typing animation in main.js**

In `assets/js/main.js`:

```javascript
// ===== Typing Animation =====
function typeText(elementId, text, speed = 100) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let index = 0;

  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }

  // Start after a short delay to let the page settle
  setTimeout(type, 1200);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  typeText('motto-text', '" 어제의 나보다 개발을 더 잘하자 "', 80);
});
```

- [ ] **Step 4: Verify hero text and typing animation in browser**

```bash
open index.html
```

Expected: "안녕하세요 👋" large, "하루하루 성장하는 개발자 하디입니다" below with "하디" in gradient, motto types out character by character.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/style.css assets/js/main.js
git commit -m "feat: add hero section and motto with typing animation"
```

---

## Task 5: About Me section

**Files:**
- Modify: `index.html` (add about HTML)
- Modify: `assets/css/style.css` (add about styles)

- [ ] **Step 1: Add About Me HTML**

In `index.html`, replace `<!-- Remaining sections -->` with:

```html
    <!-- About Me -->
    <section id="about" class="section fade-in">
      <div class="container">
        <p class="section-label">About Me</p>
        <div class="glass-card about-card">
          <h2 class="about-card__name">하창현 (Hardy)</h2>
          <p class="about-card__bio">
            자기소개 내용이 들어갑니다.<br>
            어떤 개발자인지, 관심 분야, 목표 등을 작성할 수 있어요.
          </p>
        </div>
      </div>
    </section>

    <!-- Remaining sections added in subsequent tasks -->
```

- [ ] **Step 2: Add About Me styles**

Append to `assets/css/style.css`:

```css
/* ===== Sections (shared) ===== */
.section {
  padding: var(--section-padding);
  position: relative;
  z-index: 1;
}

/* ===== About ===== */
.about-card__name {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.about-card__bio {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.8;
}
```

- [ ] **Step 3: Verify About Me section renders with glass card**

```bash
open index.html
```

Expected: "ABOUT ME" purple label, glass card with name and placeholder bio.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: add About Me section"
```

---

## Task 6: Projects & Blog section

**Files:**
- Modify: `index.html` (add projects HTML)
- Modify: `assets/css/style.css` (add project card styles)

- [ ] **Step 1: Add Projects & Blog HTML**

In `index.html`, replace `<!-- Remaining sections -->` with:

```html
    <!-- Projects & Blog -->
    <section id="projects" class="section fade-in">
      <div class="container">
        <p class="section-label">Projects & Blog</p>

        <!-- Pocket Senior -->
        <a href="https://iamhardyha.github.io/pocket-senior/" target="_blank" rel="noopener" class="glass-card project-card">
          <div class="project-card__icon project-card__icon--purple">📚</div>
          <div class="project-card__body">
            <div class="project-card__header">
              <h3 class="project-card__title">Pocket Senior</h3>
              <span class="badge badge--purple">PROJECT</span>
            </div>
            <p class="project-card__desc">출퇴근길에 읽는 백엔드 개발 미니북</p>
            <div class="project-card__tags">
              <span class="tag tag--purple">VitePress</span>
              <span class="tag tag--blue">Vue 3</span>
              <span class="tag tag--purple">27 Notes</span>
            </div>
          </div>
          <span class="project-card__arrow">→</span>
        </a>

        <!-- Tistory Blog -->
        <a href="#" class="glass-card project-card project-card--spaced">
          <div class="project-card__icon project-card__icon--orange">📝</div>
          <div class="project-card__body">
            <div class="project-card__header">
              <h3 class="project-card__title">티스토리 블로그</h3>
              <span class="badge badge--orange">BLOG</span>
            </div>
            <p class="project-card__desc">기술 블로그 보러가기</p>
          </div>
          <span class="project-card__arrow">→</span>
        </a>
      </div>
    </section>

    <!-- Remaining sections added in subsequent tasks -->
```

- [ ] **Step 2: Add project card styles**

Append to `assets/css/style.css`:

```css
/* ===== Project Card ===== */
.project-card {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.project-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.project-card__icon--purple {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(167, 139, 250, 0.3));
}

.project-card__icon--orange {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(251, 191, 36, 0.3));
}

.project-card__body {
  flex: 1;
  min-width: 0;
}

.project-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.project-card__title {
  font-size: 0.9rem;
  font-weight: 600;
}

.project-card__desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.project-card__tags {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.project-card__arrow {
  color: rgba(255, 255, 255, 0.3);
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.project-card:hover .project-card__arrow {
  transform: translateX(4px);
}

.project-card + .project-card {
  margin-top: 12px;
}

/* ===== Badge ===== */
.badge {
  font-size: 0.55rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.badge--purple {
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: var(--purple-light);
}

.badge--orange {
  background: rgba(251, 146, 60, 0.15);
  border: 1px solid rgba(251, 146, 60, 0.25);
  color: rgba(251, 191, 36, 0.8);
}

/* ===== Tag ===== */
.tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.6rem;
}

.tag--purple {
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.2);
  color: rgba(139, 92, 246, 0.8);
}

.tag--blue {
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: rgba(59, 130, 246, 0.8);
}
```

- [ ] **Step 3: Verify both project cards render with badges and tags**

```bash
open index.html
```

Expected: "PROJECTS & BLOG" label, Pocket Senior card with purple PROJECT badge + tech tags, Tistory card with orange BLOG badge. Hover shows arrow slide and glow.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: add Projects & Blog section with Pocket Senior"
```

---

## Task 7: Contact section and Footer

**Files:**
- Modify: `index.html` (add contact + footer HTML)
- Modify: `assets/css/style.css` (add contact + footer styles)

- [ ] **Step 1: Add Contact and Footer HTML**

In `index.html`, replace `<!-- Remaining sections -->` with:

```html
    <!-- Contact -->
    <section id="contact" class="section fade-in">
      <div class="container">
        <p class="section-label">Contact</p>
        <div class="contact-grid">
          <a href="https://github.com/iamhardyha" target="_blank" rel="noopener" class="glass-card contact-card">
            <span class="contact-card__icon">🐙</span>
            <span class="contact-card__label">GitHub</span>
          </a>
          <a href="mailto:hachanghyeon411@gmail.com" class="glass-card contact-card">
            <span class="contact-card__icon">✉️</span>
            <span class="contact-card__label">Email</span>
          </a>
          <!-- LinkedIn: uncomment when URL is available
          <a href="#" target="_blank" rel="noopener" class="glass-card contact-card">
            <span class="contact-card__icon">💼</span>
            <span class="contact-card__label">LinkedIn</span>
          </a>
          -->
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <p class="footer__text">© 2026 Hardy Ha. All rights reserved.</p>
    </div>
  </footer>
```

- [ ] **Step 2: Add contact and footer styles**

Append to `assets/css/style.css`:

```css
/* ===== Contact ===== */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
}

.contact-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 14px;
  text-align: center;
}

.contact-card__icon {
  font-size: 1.3rem;
}

.contact-card__label {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 6px;
}

/* ===== Footer ===== */
.footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
  position: relative;
  z-index: 1;
}

.footer__text {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.25);
}
```

- [ ] **Step 3: Verify contact cards and footer render**

```bash
open index.html
```

Expected: "CONTACT" label, 2 cards (GitHub, Email) in a grid. Footer at bottom with copyright.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: add Contact section and Footer"
```

---

## Task 8: Scroll fade-in with Intersection Observer

**Files:**
- Modify: `assets/js/main.js`

- [ ] **Step 1: Add Intersection Observer to main.js**

Append to `assets/js/main.js`:

```javascript
// ===== Scroll Fade-In (Intersection Observer) =====
function initScrollFadeIn() {
  const elements = document.querySelectorAll('.fade-in');

  // If reduced motion is preferred, show everything immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
}
```

- [ ] **Step 2: Add initScrollFadeIn to DOMContentLoaded**

Update the DOMContentLoaded listener in `main.js`:

```javascript
document.addEventListener('DOMContentLoaded', function () {
  typeText('motto-text', '" 어제의 나보다 개발을 더 잘하자 "', 80);
  initScrollFadeIn();
});
```

- [ ] **Step 3: Verify scroll animations in browser**

```bash
open index.html
```

Expected: Hero text fades in on load. Scroll down — About Me, Projects, Contact sections each fade up as they enter the viewport.

- [ ] **Step 4: Commit**

```bash
git add assets/js/main.js
git commit -m "feat: add scroll fade-in with Intersection Observer"
```

---

## Task 9: Responsive design — mobile and desktop

**Files:**
- Modify: `assets/css/style.css` (add media queries)

- [ ] **Step 1: Add desktop media query**

Append to `assets/css/style.css`:

```css
/* ===== Desktop (≥ 768px) ===== */
@media (min-width: 768px) {
  :root {
    --section-padding: 80px 20px;
    --container-max: 800px;
  }

  .hero {
    padding: 120px 0 60px;
  }

  .hero__greeting {
    font-size: 3.2rem;
  }

  .hero__intro {
    font-size: 1.3rem;
  }

  .hero__name {
    font-size: 1.4rem;
  }

  .motto__text {
    font-size: 1rem;
  }

  .nav__inner {
    padding: 18px 20px;
  }

  .contact-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    max-width: 400px;
    margin: 0 auto;
  }

  .glow--1 {
    width: 300px;
    height: 300px;
  }

  .glow--2 {
    width: 240px;
    height: 240px;
  }

  .glow--3 {
    width: 180px;
    height: 180px;
  }
}
```

- [ ] **Step 2: Verify mobile layout (Chrome DevTools, 375px width)**

Open Chrome DevTools → Toggle device toolbar → iPhone SE (375px).

Expected: all sections stack vertically, nav links visible (no hamburger), text readable, cards full width, contact grid 2-col.

- [ ] **Step 3: Verify desktop layout (full width)**

Expected: content centered with max-width 800px, larger hero text, bigger glows.

- [ ] **Step 4: Commit**

```bash
git add assets/css/style.css
git commit -m "feat: add responsive design for mobile and desktop"
```

---

## Task 10: Final polish and deployment prep

**Files:**
- Modify: `index.html` (final tweaks)
- Modify: `.gitignore`
- Modify: `README.md`

- [ ] **Step 1: Update README.md**

```markdown
# iamhardyha.github.io

Personal portfolio site for Hardy Ha (하창현).

Built with pure HTML/CSS/JS. Deployed on GitHub Pages.
```

- [ ] **Step 2: Verify .nojekyll exists at root**

```bash
ls -la .nojekyll
```

Expected: file exists.

- [ ] **Step 3: Full visual review — check all 7 sections**

Open `index.html` in browser and verify:
1. Nav: sticky, logo left, links right, smooth scroll works
2. Hero: fade-in, gradient text on "하디"
3. Motto: typing animation with blinking cursor
4. About: glass card with placeholder text
5. Projects: Pocket Senior card (click opens pocket-senior), Blog card
6. Contact: GitHub + Email cards with hover glow
7. Footer: copyright text
8. Background: floating glows animate
9. Scroll: all sections fade in on scroll
10. Mobile: check at 375px width

- [ ] **Step 4: Commit all remaining changes**

```bash
git add index.html assets/ .gitignore .nojekyll README.md docs/superpowers/
git commit -m "feat: portfolio site ready for deployment"
```

- [ ] **Step 5: Note for user — GitHub Pages configuration**

After pushing to `main`, go to **Settings > Pages** in the GitHub repository and change the source from `/docs` to `/` (root). The site will deploy automatically.

---

## Pre-Launch Checklist

These items need user input before the site goes fully live:

- [ ] **Tistory blog URL** — update the `href="#"` on the Tistory card in `index.html`
- [ ] **About Me text** — replace placeholder bio in the About section
- [ ] **LinkedIn URL** — optionally add a third contact card
- [ ] **GitHub Pages source** — change from `/docs` to `/` (root) in repo settings
