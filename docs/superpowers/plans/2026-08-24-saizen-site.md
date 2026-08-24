# Saizen Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the production Next.js one-page Saizen marketing site — static export, dual theme with a blade-wipe transition, sumi-ink cursor trail, scroll reveal — matching `saizen-site-DESIGN.md` and `saizen-site-PRD.md`.

**Architecture:** Next.js 14 App Router, static export, TypeScript, pnpm. Design tokens live as raw CSS custom properties in `app/globals.css` (not Tailwind theme config) so the blade transition can swap the whole palette by flipping one `data-theme` attribute. Tailwind is installed for incidental layout utilities only — the visual system is semantic custom CSS ported from the MVP. All motion (blade sweep, ink cursor, scroll reveal) is vanilla React + refs + rAF/IntersectionObserver, no animation library. Site content (features, pipeline steps, install table, security items) lives in one typed data file so future README-driven updates are data edits, not markup edits.

**Tech Stack:** Next.js ^14.2, React ^18.3, TypeScript ^5.5, Tailwind ^3.4, pnpm.

**Spec:** `docs/superpowers/specs/2026-08-24-saizen-site-design.md` (implementation decisions), `saizen-site-DESIGN.md` (visual source of truth), `saizen-site-PRD.md` (requirements).

## Global Constraints

- Dark theme is the default; light accent `#BC002D` on `#FFFFFF`, dark accent `#43FFD2` on `#000000` — no third hue, no decorative gradients.
- Type: Quando (display only, never body) + Puritan (body) via Google Fonts with `preconnect` + `display=swap`; system mono stack for all-caps utility labels; system CJK serif stack for 最善 and section labels — **no CJK webfont, ever**.
- All type/spacing scales fluid via `clamp()` — no fixed breakpoint jumps. Verify 320/390/768/1024/1440/1920 before considering any section done. Zero horizontal overflow at any width.
- Blade transition: transform + opacity only, 620ms total, theme swap at 250ms, re-entrancy guarded via a busy flag, instant swap under `prefers-reduced-motion`.
- Ink cursor: fine pointers only (`matchMedia('(pointer: fine)')`), rAF loop idles to nothing when the trail is empty, DPR capped at 2, 34 points max / 620ms lifetime / jitter under 1.6px discarded, sits at `z-index: 0` behind page content at `z-index: 1`, cleared on `visibilitychange`, resize debounced 150ms, disabled under `prefers-reduced-motion`.
- Scroll reveal: IntersectionObserver only, fires once per element then unobserves, no scroll-linked animation, no parallax.
- No 3D/WebGL, no particle systems, no scroll-jacking libraries, no component library, no animation dependency.
- Every touch target ≥44px. Every interactive element gets a visible `2px solid var(--accent)` focus ring with offset.
- Every content claim traces to the live README (already verified — see spec). No roadmap items, no "coming soon."
- No unit test framework (static content page, nothing to unit-test). Verification per task is `pnpm typecheck` / `pnpm build` clean, plus a described manual check for visual/interactive tasks. Task 14 runs the full Definition of Done checklist from the PRD.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `.eslintrc.json`
- Create: `.gitignore`
- Create: `app/layout.tsx` (bare placeholder, replaced fully in Task 9)
- Create: `app/page.tsx` (bare placeholder, replaced incrementally starting Task 10)
- Create: `app/globals.css` (bare placeholder, replaced fully in Task 2)
- Create: `next-env.d.ts`

**Interfaces:**
- Produces: a buildable Next.js static-export skeleton (`pnpm build` succeeds, emits `out/`)

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "saizen-site",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 4: Write `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Write `postcss.config.mjs`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Write `.eslintrc.json`**

```json
{
  "extends": "next/core-web-vitals"
}
```

- [ ] **Step 7: Write `.gitignore`**

```
node_modules
.next
out
.DS_Store
*.pem
npm-debug.log*
.env*.local
next-env.d.ts
```

- [ ] **Step 8: Write `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.
```

- [ ] **Step 9: Write bare `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 10: Write bare `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saizen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 11: Write bare `app/page.tsx`**

```tsx
export default function Home() {
  return <main>Saizen</main>;
}
```

- [ ] **Step 12: Install dependencies**

Run: `pnpm install`
Expected: lockfile generated, no errors.

- [ ] **Step 13: Verify the build**

Run: `pnpm build`
Expected: succeeds, creates `out/index.html`.

- [ ] **Step 14: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.mjs tailwind.config.ts postcss.config.mjs .eslintrc.json .gitignore next-env.d.ts app/
git commit -m "chore: scaffold Next.js static-export project"
```

---

### Task 2: Design Tokens & Base Stylesheet

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: nothing
- Produces: every CSS custom property and class name every later component task relies on — `:root`/`[data-theme="dark"]` tokens (`--accent`, `--bg`, `--ink`, `--ink-soft`, `--ink-faint`, `--rule`, `--panel`, `--brush`, `--slash`), and classes `.page`, `#ink`, `.wrap`, `.top`, `.mark`, `.mark .kanji`, `.ver`, `.toggle`, `.toggle .blade`, `.slashfx`, `.slashfx.cut`, `.hero`, `.eyebrow`, `.lockup`, `.kanji-xl`, `.wordmark`, `.reading`, `.tagline`, `.tagline em`, `.lede`, `.cta`, `.btn`, `.btn-solid`, `.btn-ghost`, `.hero-note`, `.sec`, `.sec-alt`, `.sec-head`, `.sec-jp`, `.sec-title`, `.sec-lede`, `.pipe`, `.step`, `.step-n`, `.step code`, `.rows`, `.row`, `.row-label`, `.row-jp`, `.row-en`, `.chips`, `.tablewrap`, `table`/`th`/`td`, `.yes`, `.no`, `.callout`, `.foot`, `.rv`, `.rv.in`.

- [ ] **Step 1: Replace `app/globals.css` with the full token and base system**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================================
   SAIZEN — design tokens
   Light: hinomaru red on paper white
   Dark:  cathode cyan on true black
   ============================================================ */
:root {
  --accent: #bc002d;
  --bg: #ffffff;
  --ink: #0b0b0b;
  --ink-soft: rgba(11, 11, 11, 0.62);
  --ink-faint: rgba(11, 11, 11, 0.38);
  --rule: rgba(11, 11, 11, 0.14);
  --panel: #f7f5f3;
  --brush: 11, 11, 11; /* sumi ink, rgb triplet for canvas */
  --shadow: 0 1px 0 rgba(11, 11, 11, 0.06);

  --display: 'Quando', Georgia, serif;
  --body: 'Puritan', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
  --cjk: 'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', 'Songti SC', serif;

  --gut: clamp(20px, 5vw, 72px);
  --maxw: 1240px;
  --slash: -18deg;
}
[data-theme='dark'] {
  --accent: #43ffd2;
  --bg: #000000;
  --ink: #ffffff;
  --ink-soft: rgba(255, 255, 255, 0.66);
  --ink-faint: rgba(255, 255, 255, 0.4);
  --rule: rgba(255, 255, 255, 0.16);
  --panel: #0a0a0a;
  --brush: 67, 255, 210;
  --shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
html {
  -webkit-text-size-adjust: 100%;
}
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--body);
  font-size: clamp(15px, 0.55vw + 13.6px, 17px);
  line-height: 1.62;
  overflow-x: hidden;
  transition: background-color 0.18s linear, color 0.18s linear;
}
img,
svg {
  max-width: 100%;
  display: block;
}
a {
  color: inherit;
}
::selection {
  background: var(--accent);
  color: var(--bg);
}

/* ink canvas sits under content — strokes read as ink on paper, never block text */
#ink {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.page {
  position: relative;
  z-index: 1;
}

.wrap {
  max-width: var(--maxw);
  margin: 0 auto;
  padding-inline: var(--gut);
}

/* ---------- top bar ---------- */
.top {
  position: sticky;
  top: 0;
  z-index: 60;
  backdrop-filter: saturate(1.4) blur(14px);
  -webkit-backdrop-filter: saturate(1.4) blur(14px);
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  border-bottom: 1px solid var(--rule);
}
.top .wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 60px;
}
.mark {
  display: flex;
  align-items: baseline;
  gap: 10px;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.14em;
  font-size: 13px;
}
.mark .kanji {
  font-family: var(--cjk);
  font-size: 19px;
  letter-spacing: 0.06em;
  color: var(--accent);
}
.ver {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--ink-faint);
  letter-spacing: 0.06em;
}

.toggle {
  appearance: none;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--ink);
  min-width: 44px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 2px;
  cursor: pointer;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.toggle .blade {
  width: 13px;
  height: 1.5px;
  background: currentColor;
  transform: rotate(var(--slash));
  display: block;
}

/* ---------- the blade wipe ---------- */
.slashfx {
  position: fixed;
  inset: -30vh -70vw;
  z-index: 200;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    90deg,
    transparent 0 45.6%,
    color-mix(in srgb, var(--accent) 55%, transparent) 45.6% 48.4%,
    var(--accent) 48.4% 50%,
    transparent 50% 100%
  );
  transform: translate3d(-125%, 0, 0) rotate(var(--slash));
  will-change: transform, opacity;
}
.slashfx.cut {
  animation: cut 620ms cubic-bezier(0.72, 0, 0.18, 1);
}
@keyframes cut {
  0% {
    opacity: 1;
    transform: translate3d(-125%, 0, 0) rotate(var(--slash));
  }
  100% {
    opacity: 1;
    transform: translate3d(125%, 0, 0) rotate(var(--slash));
  }
}

/* ---------- hero ---------- */
.hero {
  padding: clamp(56px, 11vh, 120px) 0 clamp(48px, 9vh, 96px);
  position: relative;
}
.eyebrow {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-faint);
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 26px;
}
.eyebrow::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--rule);
}

.lockup {
  display: flex;
  align-items: flex-end;
  gap: clamp(14px, 3vw, 34px);
  flex-wrap: wrap;
}
.kanji-xl {
  font-family: var(--cjk);
  color: var(--accent);
  font-size: clamp(76px, 17vw, 196px);
  line-height: 0.84;
  letter-spacing: 0.02em;
  margin: 0;
}
.wordmark {
  font-family: var(--display);
  font-size: clamp(30px, 5.4vw, 62px);
  line-height: 1;
  letter-spacing: 0.05em;
  margin: 0 0 clamp(6px, 1vw, 14px);
}
.reading {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--ink-faint);
  text-transform: uppercase;
  margin: 10px 0 0;
}
.tagline {
  font-family: var(--display);
  font-size: clamp(21px, 2.9vw, 34px);
  line-height: 1.34;
  margin: clamp(30px, 5vh, 50px) 0 0;
  max-width: 19ch;
}
.tagline em {
  font-style: normal;
  color: var(--accent);
}
.lede {
  margin: 20px 0 0;
  max-width: 56ch;
  color: var(--ink-soft);
}

.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 48px;
  padding: 0 22px;
  border-radius: 2px;
  text-decoration: none;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  border: 1px solid var(--accent);
  transition: transform 0.14s ease, background-color 0.14s, color 0.14s;
}
.btn-solid {
  background: var(--accent);
  color: var(--bg);
}
.btn-ghost {
  color: var(--accent);
  background: transparent;
}
.btn:hover {
  transform: translateY(-2px);
}
.btn-ghost:hover {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}
.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.hero-note {
  margin-top: 26px;
  font-family: var(--mono);
  font-size: 11.5px;
  letter-spacing: 0.05em;
  color: var(--ink-faint);
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
}

/* ---------- section scaffold ---------- */
.sec {
  padding: clamp(60px, 10vh, 116px) 0;
  border-top: 1px solid var(--rule);
  position: relative;
}
.sec-alt {
  background: var(--panel);
}
.sec-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  margin-bottom: clamp(34px, 6vh, 60px);
}
.sec-jp {
  font-family: var(--cjk);
  color: var(--accent);
  font-size: clamp(17px, 2vw, 22px);
  letter-spacing: 0.14em;
  margin: 0;
}
.sec-title {
  font-family: var(--display);
  font-size: clamp(26px, 4.1vw, 46px);
  line-height: 1.16;
  margin: 0;
  letter-spacing: 0.01em;
}
.sec-lede {
  margin: 6px 0 0;
  max-width: 60ch;
  color: var(--ink-soft);
}

/* ---------- pipeline (a real sequence, so it is numbered) ---------- */
.pipe {
  display: grid;
  gap: 1px;
  background: var(--rule);
  border: 1px solid var(--rule);
}
@media (min-width: 820px) {
  .pipe {
    grid-template-columns: repeat(3, 1fr);
  }
}
.step {
  background: var(--bg);
  padding: clamp(24px, 3.4vw, 38px);
}
.sec-alt .step {
  background: var(--panel);
}
.step-n {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.step-n::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--rule);
}
.step h3 {
  font-family: var(--display);
  font-size: clamp(18px, 2.1vw, 23px);
  margin: 0 0 10px;
  line-height: 1.28;
}
.step p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 15px;
}
.step code {
  font-family: var(--mono);
  font-size: 12.5px;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 9%, transparent);
  padding: 1px 5px;
  border-radius: 2px;
}

/* ---------- feature rows ---------- */
.rows {
  border-top: 1px solid var(--rule);
}
.row {
  display: grid;
  gap: 10px 40px;
  padding: clamp(24px, 3.6vw, 38px) 0;
  border-bottom: 1px solid var(--rule);
  align-items: start;
}
@media (min-width: 900px) {
  .row {
    grid-template-columns: minmax(190px, 258px) minmax(0, 1fr);
  }
}
.row-label {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.row-jp {
  font-family: var(--cjk);
  color: var(--accent);
  font-size: 16px;
  letter-spacing: 0.12em;
  white-space: nowrap;
}
.row-en {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.17em;
  text-transform: uppercase;
  color: var(--ink-faint);
}
.row h3 {
  font-family: var(--display);
  font-size: clamp(19px, 2.3vw, 25px);
  margin: 0 0 8px;
  line-height: 1.3;
}
.row p {
  margin: 0;
  color: var(--ink-soft);
  max-width: 64ch;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 14px;
  padding: 0;
  list-style: none;
}
.chips li {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  color: var(--ink-soft);
  border: 1px solid var(--rule);
  border-radius: 2px;
  padding: 4px 9px;
}

/* ---------- install ---------- */
.tablewrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--rule);
}
table {
  border-collapse: collapse;
  width: 100%;
  min-width: 520px;
  font-size: 14.5px;
}
th,
td {
  text-align: left;
  padding: 14px 18px;
  border-bottom: 1px solid var(--rule);
  vertical-align: top;
}
th {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
  font-weight: 400;
}
tr:last-child td {
  border-bottom: 0;
}
td strong {
  font-weight: 700;
}
.yes {
  color: var(--accent);
}
.no {
  color: var(--ink-faint);
}

.callout {
  margin-top: 28px;
  border-left: 2px solid var(--accent);
  padding: 16px 0 16px 20px;
  color: var(--ink-soft);
  max-width: 66ch;
}
.callout b {
  color: var(--ink);
}

/* ---------- footer ---------- */
.foot {
  border-top: 1px solid var(--rule);
  padding: 44px 0 60px;
}
.foot .wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 18px 32px;
  align-items: center;
}
.foot a {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.09em;
  text-decoration: none;
  color: var(--ink-soft);
}
.foot a:hover {
  color: var(--accent);
}
.foot .fine {
  margin-left: auto;
  font-size: 12px;
  color: var(--ink-faint);
  max-width: 42ch;
}

/* ---------- scroll reveal ---------- */
.rv {
  opacity: 0;
  transform: translateY(14px);
}
.rv.in {
  opacity: 1;
  transform: none;
  transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.2, 0.7, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
  .rv {
    opacity: 1;
    transform: none;
  }
  .btn:hover {
    transform: none;
  }
}
```

- [ ] **Step 2: Verify the build**

Run: `pnpm build`
Expected: succeeds (Tailwind + custom CSS compile together with no errors).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add Saizen design tokens and base stylesheet"
```

---

### Task 3: Theme Constants

**Files:**
- Create: `lib/theme.ts`

**Interfaces:**
- Produces: `Theme` type (`'light' | 'dark'`), `THEME_STORAGE_KEY` constant — consumed by Task 4 (`theme-provider.tsx`) and Task 9 (`layout.tsx` pre-paint script).

- [ ] **Step 1: Write `lib/theme.ts`**

```ts
export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'saizen-theme';
```

- [ ] **Step 2: Verify types**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add lib/theme.ts
git commit -m "feat: add theme type and storage key constant"
```

---

### Task 4: Theme Provider, Blade Transition & Toggle

**Files:**
- Create: `components/theme-provider.tsx`
- Create: `components/theme-toggle.tsx`

**Interfaces:**
- Consumes: `Theme`, `THEME_STORAGE_KEY` from `lib/theme.ts` (Task 3); CSS classes `.slashfx`, `.slashfx.cut`, `.toggle`, `.toggle .blade` from `app/globals.css` (Task 2)
- Produces: `ThemeProvider` component, `useTheme(): { theme: Theme; toggleTheme: () => void }` hook (both exported from `components/theme-provider.tsx`), `ThemeToggle` component — consumed by Task 8 (`top-bar.tsx`) and Task 9 (`layout.tsx`)

- [ ] **Step 1: Write `components/theme-provider.tsx`**

```tsx
'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Theme } from '@/lib/theme';
import { THEME_STORAGE_KEY } from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const overlayRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const current = document.documentElement.dataset.theme as Theme | undefined;
    if (current === 'light' || current === 'dark') setTheme(current);
  }, []);

  function applyTheme(next: Theme) {
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#000000' : '#FFFFFF');
    setTheme(next);
  }

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const overlay = overlayRef.current;

    if (reduce || !overlay) {
      applyTheme(next);
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;

    overlay.classList.remove('cut');
    void overlay.offsetWidth;
    overlay.classList.add('cut');

    window.setTimeout(() => applyTheme(next), 250);
    window.setTimeout(() => {
      overlay.classList.remove('cut');
      busyRef.current = false;
    }, 640);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div ref={overlayRef} className="slashfx" aria-hidden="true" />
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 2: Write `components/theme-toggle.tsx`**

```tsx
'use client';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'LIGHT' : 'DARK';

  return (
    <button type="button" className="toggle" onClick={toggleTheme} aria-label="Switch colour theme">
      <span className="blade" aria-hidden="true" />
      <span suppressHydrationWarning>{label}</span>
    </button>
  );
}
```

The `suppressHydrationWarning` is deliberate: the server-rendered label always assumes the `'dark'` default, while the client's `useEffect` corrects it from the already-set `data-theme` attribute (set by the pre-paint script in Task 9) immediately after mount. The page's actual colors never flash — only this text node's initial value can differ for one frame, which React patches silently.

- [ ] **Step 3: Verify types**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add components/theme-provider.tsx components/theme-toggle.tsx
git commit -m "feat: add theme provider with blade-wipe transition and toggle"
```

(Manual verification of the blade sweep itself happens in Task 9, once it's wired into the layout and there's a page to look at.)

---

### Task 5: Ink Cursor

**Files:**
- Create: `components/ink-cursor.tsx`

**Interfaces:**
- Consumes: `#ink` canvas CSS and `--brush` token from `app/globals.css` (Task 2)
- Produces: `InkCursor` component — consumed by Task 9 (`layout.tsx`)

- [ ] **Step 1: Write `components/ink-cursor.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';

interface InkPoint {
  x: number;
  y: number;
  w: number;
  t: number;
  k?: number;
}

const MAX_POINTS = 34;
const LIFE_MS = 620;

export function InkCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(pointer: fine)');
    if (reduce.matches || !fine.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let points: InkPoint[] = [];
    let running = false;
    let resizeTimer: number | undefined;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = width + 'px';
      canvas!.style.height = height + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(size, 150);
    }
    window.addEventListener('resize', onResize, { passive: true });

    function onPointerMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return;
      const prev = points[points.length - 1];
      let w = 15;
      if (prev) {
        const d = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
        if (d < 1.6) return;
        w = Math.max(2.6, 15 - d * 0.5);
        w = prev.w + (w - prev.w) * 0.45;
      }
      points.push({ x: e.clientX, y: e.clientY, w, t: performance.now() });
      if (points.length > MAX_POINTS) points.shift();
      if (!running) {
        running = true;
        requestAnimationFrame(frame);
      }
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    function onVisibilityChange() {
      if (document.hidden) {
        points = [];
        ctx!.clearRect(0, 0, width, height);
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    function ribbon(list: InkPoint[], scale: number, alpha: number) {
      if (list.length < 3) return;
      const top: [number, number][] = [];
      const bottom: [number, number][] = [];
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        const n = list[Math.min(i + 1, list.length - 1)];
        const angle = Math.atan2(n.y - p.y, n.x - p.x) + Math.PI / 2;
        const taper = Math.sin((i / (list.length - 1)) * Math.PI);
        const w = p.w * scale * (0.35 + taper * 0.65) * (p.k ?? 1);
        top.push([p.x + Math.cos(angle) * w, p.y + Math.sin(angle) * w]);
        bottom.push([p.x - Math.cos(angle) * w, p.y - Math.sin(angle) * w]);
      }
      ctx!.beginPath();
      ctx!.moveTo(top[0][0], top[0][1]);
      for (let i = 1; i < top.length; i++) ctx!.lineTo(top[i][0], top[i][1]);
      for (let i = bottom.length - 1; i >= 0; i--) ctx!.lineTo(bottom[i][0], bottom[i][1]);
      ctx!.closePath();
      const rgb = getComputedStyle(document.documentElement).getPropertyValue('--brush').trim();
      ctx!.fillStyle = `rgba(${rgb},${alpha})`;
      ctx!.fill();
    }

    function frame(now: number) {
      ctx!.clearRect(0, 0, width, height);
      const live: InkPoint[] = [];
      for (const p of points) {
        const k = 1 - (now - p.t) / LIFE_MS;
        if (k > 0) {
          p.k = k;
          live.push(p);
        }
      }
      points = live;

      if (live.length > 2) {
        ribbon(live, 1, 0.8);
        ribbon(live, 0.42, 0.34);
      }

      if (live.length) {
        requestAnimationFrame(frame);
      } else {
        running = false;
        ctx!.clearRect(0, 0, width, height);
      }
    }

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  return <canvas ref={canvasRef} id="ink" aria-hidden="true" />;
}
```

- [ ] **Step 2: Verify types**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add components/ink-cursor.tsx
git commit -m "feat: add sumi-ink cursor trail canvas"
```

(Manual verification of the actual trail happens in Task 9, once mounted into the layout.)

---

### Task 6: Reveal Section Wrapper

**Files:**
- Create: `components/reveal-section.tsx`

**Interfaces:**
- Consumes: `.sec`, `.sec-alt`, `.rv`, `.rv.in` classes from `app/globals.css` (Task 2)
- Produces: `RevealSection` component with props `{ alt?: boolean; className?: string; children: React.ReactNode }`, renders a `<section>` — consumed by Task 11 (`pipeline.tsx`, `features.tsx`) and Task 12 (`security.tsx`, `install.tsx`)

Every section in the design that uses scroll-reveal is exactly a `<section class="sec [sec-alt] rv">` (Pipeline, Features, Security, Install — Hero, TopBar, and Footer never animate in). `RevealSection` is written specifically for that shape rather than as a generic polymorphic wrapper, since that is the only shape it ever needs to produce.

- [ ] **Step 1: Write `components/reveal-section.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';

interface RevealSectionProps {
  alt?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function RevealSection({ alt = false, className = '', children }: RevealSectionProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      el.classList.add('in');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const classes = ['sec', alt ? 'sec-alt' : '', 'rv', className].filter(Boolean).join(' ');

  return (
    <section ref={ref} className={classes}>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add components/reveal-section.tsx
git commit -m "feat: add IntersectionObserver-driven reveal section wrapper"
```

---

### Task 7: Site Content Data

**Files:**
- Create: `lib/content.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `PipelineStep`, `Feature`, `SecurityItem`, `InstallMethod` types and `pipelineSteps`, `features`, `securityItems`, `installMethods` arrays — consumed by Task 11 (`pipeline.tsx`, `features.tsx`) and Task 12 (`security.tsx`, `install.tsx`)

All copy below is verified against the live README at `Surajsm60720/Saizen` (see spec's Content verification section) — no invented claims.

- [ ] **Step 1: Write `lib/content.ts`**

```ts
export interface PipelineStep {
  number: string;
  title: string;
  body: string;
}

export interface Feature {
  jp: string;
  en: string;
  title: string;
  body: string;
  chips?: string[];
}

export interface SecurityItem {
  jp: string;
  en: string;
  body: string;
}

export interface InstallMethod {
  method: string;
  paidAccount: string;
  paidAccountLevel: 'yes' | 'no';
  notes: string;
}

export const pipelineSteps: PipelineStep[] = [
  {
    number: '01',
    title: 'Modules resolve the episode',
    body: 'Sources you install under Settings → Modules run in a JS runtime and return stream candidates. Module scripts load over HTTPS only.',
  },
  {
    number: '02',
    title: 'Candidates rank to HLS or MP4',
    body: 'Each candidate carries its URL and headers. Batch queueing uses resolveStreamsBatch, trying the last known-good module for that show first.',
  },
  {
    number: '03',
    title: 'A custom AVPlayer takes over',
    body: 'Playback runs through native AVPlayer chrome. MobileVLCKit stays in the build as a probe fallback for containers AVFoundation will not take.',
  },
];

export const features: Feature[] = [
  {
    jp: '閲覧',
    en: 'Browse',
    title: 'Home that fills in once you sign in',
    body: 'Discover rails with a View more link into Search filters, continue watching, and list-backed shelves after AniList or MAL sign-in. Personalised rails paint from cache first, then refresh in the background.',
    chips: ['Hero carousel', 'Prequels & sequels', 'Genre picks', 'Continue watching'],
  },
  {
    jp: '検索',
    en: 'Search',
    title: 'Filter, not a detour',
    body: 'Search by title, then narrow with the Filters sheet. Open an anime, come back, and the session is still there. The keyboard hides the tab bar instead of fighting it.',
    chips: ['Genre', 'Year', 'Season', 'Format', 'Status', 'Sort', 'In my list'],
  },
  {
    jp: '作品',
    en: 'Detail',
    title: 'The whole franchise, in order',
    body: 'Character, VA and staff rails with their own pages. Relations laid out as a watch order rather than a flat list. Edit your list entry without leaving the page, and tap an OP or ED title to copy it.',
    chips: ['Watch-order relations', 'Continue watching EP xx', 'OP/ED song names', 'Manga detail for relations'],
  },
  {
    jp: '放送',
    en: 'Schedule',
    title: 'A week of airings in device-local time',
    body: 'The Schedule tab shows what airs when, switchable between your list and the current season — no mental timezone maths.',
  },
  {
    jp: '再生',
    en: 'Player',
    title: 'Built for how episodes are watched',
    body: 'Custom AVPlayer chrome for CDN HLS and MP4. AniSkip marks openings and endings, then offers a Skip pill or skips them for you.',
    chips: ['±10s / play / next', 'Double- and triple-tap seek', 'Speed & aspect', 'AniSkip OP/ED', 'Optional auto-skip'],
  },
  {
    jp: '保存',
    en: 'Downloads',
    title: 'A queue that holds up',
    body: 'Pause, resume and cancel stay responsive while native work runs off the bridge thread. HTTP downloads report speed and bytes; HLS reports percent rather than inventing a total. Clear cache sweeps orphaned and partial packs.',
    chips: ['Batch Save', 'Lock-screen progress', 'Offline library playback'],
  },
  {
    jp: '同期',
    en: 'Accounts',
    title: 'AniList and MyAnimeList, both ways',
    body: 'Sign in once and your lists drive Home. Tokens live in the Keychain and nowhere else. Deleting an entry clears continue-watching without a restart.',
  },
  {
    jp: '秘匿',
    en: 'Incognito',
    title: 'Watch without leaving a trail',
    body: 'Flip Incognito on to pause list sync and Home continue. Session resume clears when you leave it. Downloads already on disk stay put.',
  },
  {
    jp: '外観',
    en: 'Appearance',
    title: 'Chrome you can tune',
    body: 'An icon-only frosted tab bar with drag-to-scrub selection across Home, Search, Schedule and More. Settings → Appearance controls the accent colour plus tab bar and top chrome transparency, with an optional Frosted blur.',
    chips: ['Puritan + Quando type', 'Transparency slider', 'Frosted blur'],
  },
];

export const securityItems: SecurityItem[] = [
  {
    jp: '鍵',
    en: 'Keys',
    body: 'Only public OAuth Client IDs go in the web env. The AniList Client Secret lives in a gitignored local Swift file, never in a NEXT_PUBLIC_* variable and never in the Settings UI. IPA packaging scans for secrets and refuses to produce a build if it finds one.',
  },
  {
    jp: '通信',
    en: 'Transport',
    body: 'Module and extension scripts load over HTTPS only. OAuth redirect URIs are checked against a host allowlist, loopback streams are authenticated, the Keychain has a key allowlist, and Capacitor bridge logging is off in release.',
  },
];

export const installMethods: InstallMethod[] = [
  {
    method: 'Xcode → Run',
    paidAccount: 'Not needed',
    paidAccountLevel: 'yes',
    notes: 'Best for daily personal use. Certificate lasts about 7 days.',
  },
  {
    method: 'Sideloadly / AltStore / Feather',
    paidAccount: 'Not needed',
    paidAccountLevel: 'yes',
    notes: 'Free Apple ID, roughly 7-day certs, re-sign periodically.',
  },
  {
    method: 'GitHub Release IPA',
    paidAccount: 'Not needed to host',
    paidAccountLevel: 'yes',
    notes: 'Installing still needs a sideload tool. Each installer trusts the certificate on their own device.',
  },
  {
    method: 'App Store / TestFlight',
    paidAccount: 'Required',
    paidAccountLevel: 'no',
    notes: 'Not available on a free account, and not a goal for this project.',
  },
];
```

- [ ] **Step 2: Verify types**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add lib/content.ts
git commit -m "feat: add README-verified site content data"
```

---

### Task 8: Top Bar

**Files:**
- Create: `components/top-bar.tsx`

**Interfaces:**
- Consumes: `ThemeToggle` from `components/theme-toggle.tsx` (Task 4); `.top`, `.mark`, `.mark .kanji`, `.ver` classes from `app/globals.css` (Task 2)
- Produces: `TopBar` component — consumed by Task 9 (`layout.tsx`)

- [ ] **Step 1: Write `components/top-bar.tsx`**

```tsx
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function TopBar() {
  return (
    <header className="top">
      <div className="wrap">
        <Link className="mark" href="#top">
          <span className="kanji">最善</span>
          <span>SAIZEN</span>
        </Link>
        <span className="ver">v1.4.2</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add components/top-bar.tsx
git commit -m "feat: add sticky top bar with wordmark and theme toggle"
```

---

### Task 9: Root Layout

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `ThemeProvider` (Task 4), `InkCursor` (Task 5), `TopBar` (Task 8), `THEME_STORAGE_KEY` (Task 3)
- Produces: the full HTML shell every page renders inside — `<html data-theme>`, pre-paint theme script, font links, favicon, viewport meta

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { InkCursor } from '@/components/ink-cursor';
import { TopBar } from '@/components/top-bar';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saizen — anime streaming at the comfort of your phone',
  description:
    'Saizen is a personal iOS anime client. Installable CDN stream modules resolve HLS/MP4 and play in a custom AVPlayer. Sideload only.',
  icons: {
    icon: [
      {
        url:
          'data:image/svg+xml,' +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#000"/><text x="32" y="46" font-size="40" text-anchor="middle" fill="#43FFD2" font-family="serif">最</text></svg>'
          ),
        type: 'image/svg+xml',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
};

const themeScript = `(function(){try{var key=${JSON.stringify(
  THEME_STORAGE_KEY
)};var stored=localStorage.getItem(key);var theme=(stored==='light'||stored==='dark')?stored:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=theme;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quando&family=Puritan:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <InkCursor />
          <div className="page">
            <TopBar />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 3: Manual check**

Run: `pnpm dev`, open `http://localhost:3000` in a desktop browser.
Expected: page loads dark by default (no flash of light theme), clicking the theme toggle in the top bar runs the diagonal blade sweep and swaps to light mid-sweep, moving the mouse over the page draws a tapered ink trail that fades out and stops animating once the mouse is still (check DevTools Performance/rAF — no continuous frames when idle).

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wire root layout with pre-paint theme script, fonts, top bar"
```

---

### Task 10: Hero Section

**Files:**
- Create: `components/hero.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `.hero`, `.eyebrow`, `.lockup`, `.kanji-xl`, `.wordmark`, `.reading`, `.tagline`, `.lede`, `.cta`, `.btn`, `.hero-note` classes from `app/globals.css` (Task 2)
- Produces: `Hero` component, and `app/page.tsx`'s `<main id="top">` wrapper that later tasks append siblings into

- [ ] **Step 1: Write `components/hero.tsx`**

```tsx
export function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <p className="eyebrow">Personal iOS anime client</p>
        <div className="lockup">
          <h1 className="kanji-xl">最善</h1>
          <div>
            <p className="wordmark">Saizen</p>
            <p className="reading">sai・zen — the optimal</p>
          </div>
        </div>
        <p className="tagline">
          Anime streaming at the comfort of <em>your phone</em>.
        </p>
        <p className="lede">
          Install stream modules, sign in with AniList or MyAnimeList in a player built for the way anime actually
          gets released. Everything runs on your device.
        </p>
        <div className="cta">
          <a className="btn btn-solid" href="https://github.com/Surajsm60720/Saizen/releases">
            Get the IPA
          </a>
          <a className="btn btn-ghost" href="https://github.com/Surajsm60720/Saizen">
            Read the source
          </a>
        </div>
        <p className="hero-note">
          <span>Next.js + Capacitor 7 + Swift</span>
          <span>·</span>
          <span>iOS 15+</span>
          <span>·</span>
          <span>Sideload only — no App Store build</span>
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
import { Hero } from '@/components/hero';

export default function Home() {
  return (
    <main id="top">
      <Hero />
    </main>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 4: Manual check**

Run: `pnpm dev`. Resize the browser through 320 / 390 / 768 / 1024 / 1440 / 1920px.
Expected: no horizontal scrollbar at any width, kanji/wordmark/tagline scale fluidly with no jump, both CTA buttons are ≥48px tall and lift 2px on hover.

- [ ] **Step 5: Commit**

```bash
git add components/hero.tsx app/page.tsx
git commit -m "feat: add hero section"
```

---

### Task 11: Pipeline & Features Sections

**Files:**
- Create: `components/pipeline.tsx`
- Create: `components/features.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `RevealSection` (Task 6), `pipelineSteps`/`features` from `lib/content.ts` (Task 7), `.pipe`/`.step`/`.step-n` and `.rows`/`.row`/`.row-label`/`.chips` classes from `app/globals.css` (Task 2)
- Produces: `Pipeline` and `Features` components, appended into `app/page.tsx`

Note on scope: the MVP styled one word inside step 02's body (`resolveStreamsBatch`) with the `.step code` monospace class. Content is now data-driven plain text (see `lib/content.ts`), so that one inline style is dropped in favor of a uniform data→JSX mapping — the `.step code` CSS rule stays defined for future use but nothing renders it yet. This is a deliberate simplification, not an oversight.

- [ ] **Step 1: Write `components/pipeline.tsx`**

```tsx
import { RevealSection } from './reveal-section';
import { pipelineSteps } from '@/lib/content';

export function Pipeline() {
  return (
    <RevealSection alt>
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-jp">視聴経路</p>
          <h2 className="sec-title">How a stream reaches the screen</h2>
          <p className="sec-lede">
            Watch runs on installable CDN modules. Torrents stay available for optional offline work, but they are
            no longer the path playback takes.
          </p>
        </div>
        <div className="pipe">
          {pipelineSteps.map((step) => (
            <article className="step" key={step.number}>
              <p className="step-n">{step.number}</p>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
```

- [ ] **Step 2: Write `components/features.tsx`**

```tsx
import { RevealSection } from './reveal-section';
import { features } from '@/lib/content';

export function Features() {
  return (
    <RevealSection>
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-jp">機能</p>
          <h2 className="sec-title">What is in the build</h2>
          <p className="sec-lede">Everything below is shipping in v1.4.2 and proven on a physical iPhone.</p>
        </div>
        <div className="rows">
          {features.map((feature) => (
            <article className="row" key={feature.en}>
              <div className="row-label">
                <span className="row-jp">{feature.jp}</span>
                <span className="row-en">{feature.en}</span>
              </div>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                {feature.chips && (
                  <ul className="chips">
                    {feature.chips.map((chip) => (
                      <li key={chip}>{chip}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
```

- [ ] **Step 3: Update `app/page.tsx`**

```tsx
import { Hero } from '@/components/hero';
import { Pipeline } from '@/components/pipeline';
import { Features } from '@/components/features';

export default function Home() {
  return (
    <main id="top">
      <Hero />
      <Pipeline />
      <Features />
    </main>
  );
}
```

- [ ] **Step 4: Verify the build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 5: Manual check**

Run: `pnpm dev`. Scroll down.
Expected: Pipeline renders 3 numbered steps in a 3-column grid at ≥820px, single column below; Features renders 9 rows, two-column (label rail + content) at ≥900px; both sections fade/slide up into view once as they cross into viewport, not on every scroll.

- [ ] **Step 6: Commit**

```bash
git add components/pipeline.tsx components/features.tsx app/page.tsx
git commit -m "feat: add pipeline and features sections"
```

---

### Task 12: Security & Install Sections

**Files:**
- Create: `components/security.tsx`
- Create: `components/install.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `RevealSection` (Task 6), `securityItems`/`installMethods` from `lib/content.ts` (Task 7), `.tablewrap`/`table`/`.yes`/`.no`/`.callout` classes from `app/globals.css` (Task 2)
- Produces: `Security` and `Install` components, appended into `app/page.tsx`

- [ ] **Step 1: Write `components/security.tsx`**

```tsx
import { RevealSection } from './reveal-section';
import { securityItems } from '@/lib/content';

export function Security() {
  return (
    <RevealSection alt>
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-jp">安全</p>
          <h2 className="sec-title">Secrets stay out of the build</h2>
          <p className="sec-lede">Packaging fails closed rather than shipping a key by accident.</p>
        </div>
        <div className="rows" style={{ borderTop: 0 }}>
          {securityItems.map((item, index) => (
            <article className="row" key={item.en} style={index === 0 ? { paddingTop: 0 } : undefined}>
              <div className="row-label">
                <span className="row-jp">{item.jp}</span>
                <span className="row-en">{item.en}</span>
              </div>
              <div>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
```

- [ ] **Step 2: Write `components/install.tsx`**

```tsx
import { RevealSection } from './reveal-section';
import { installMethods } from '@/lib/content';

export function Install() {
  return (
    <RevealSection>
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-jp">導入</p>
          <h2 className="sec-title">Getting it onto a phone</h2>
          <p className="sec-lede">
            Saizen is a personal sideload project. There is no App Store listing and no TestFlight.
          </p>
        </div>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Method</th>
                <th scope="col">Paid account</th>
                <th scope="col">What to expect</th>
              </tr>
            </thead>
            <tbody>
              {installMethods.map((row) => (
                <tr key={row.method}>
                  <td>
                    <strong>{row.method}</strong>
                  </td>
                  <td className={row.paidAccountLevel === 'yes' ? 'yes' : 'no'}>{row.paidAccount}</td>
                  <td>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="callout">
          <b>On version numbers.</b> Release IPAs use minor versions only — 1.2, 1.4, and so on. Patch builds like
          1.4.1 and 1.4.2 are local sideload builds and do not get their own Release asset. v1.4.0 is the current
          architecture IPA.
        </p>
      </div>
    </RevealSection>
  );
}
```

- [ ] **Step 3: Update `app/page.tsx`**

```tsx
import { Hero } from '@/components/hero';
import { Pipeline } from '@/components/pipeline';
import { Features } from '@/components/features';
import { Security } from '@/components/security';
import { Install } from '@/components/install';

export default function Home() {
  return (
    <main id="top">
      <Hero />
      <Pipeline />
      <Features />
      <Security />
      <Install />
    </main>
  );
}
```

- [ ] **Step 4: Verify the build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 5: Manual check**

Run: `pnpm dev`. Scroll to Install.
Expected: the distribution table scrolls horizontally inside its own bounded wrapper below ~520px viewport width rather than breaking page layout; "Not needed" cells render in accent color, "Required" renders faint.

- [ ] **Step 6: Commit**

```bash
git add components/security.tsx components/install.tsx app/page.tsx
git commit -m "feat: add security and install sections"
```

---

### Task 13: Footer & Final Page Assembly

**Files:**
- Create: `components/footer.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `.foot` classes from `app/globals.css` (Task 2)
- Produces: `Footer` component; `app/page.tsx` reaches its final, complete form

- [ ] **Step 1: Write `components/footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <a href="https://github.com/Surajsm60720/Saizen">Source</a>
        <a href="https://github.com/Surajsm60720/Saizen/releases">Releases</a>
        <a href="https://github.com/Surajsm60720/Saizen/blob/main/docs/SECURITY_TEST_PLAN.md">Security</a>
        <a href="https://github.com/Surajsm60720/Saizen/blob/main/STRUCTURE.md">Structure</a>
        <p className="fine">
          Personal sideload project. Do not redistribute copyrighted media. Respect local law and the terms of any
          index you query.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Finalize `app/page.tsx`**

```tsx
import { Hero } from '@/components/hero';
import { Pipeline } from '@/components/pipeline';
import { Features } from '@/components/features';
import { Security } from '@/components/security';
import { Install } from '@/components/install';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <>
      <main id="top">
        <Hero />
        <Pipeline />
        <Features />
        <Security />
        <Install />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 4: Manual check**

Run: `pnpm dev`. Confirm the page now matches DESIGN §6 top to bottom: top bar → hero → pipeline → features → security → install → footer, with alternating `.sec`/`.sec-alt` grounds visible between sections.

- [ ] **Step 5: Commit**

```bash
git add components/footer.tsx app/page.tsx
git commit -m "feat: add footer, complete page assembly"
```

---

### Task 14: Full QA Pass (Definition of Done)

**Files:** none (verification only; fix forward in the relevant component file if something fails)

**Interfaces:** none

- [ ] **Step 1: Clean build and static checks**

Run: `pnpm lint && pnpm typecheck && pnpm build`
Expected: all three pass with zero errors/warnings.

- [ ] **Step 2: Breakpoint sweep**

Run: `pnpm dev`, open in a desktop browser, use DevTools responsive mode.
Check at 320 / 390 / 768 / 1024 / 1440 / 1920px: no horizontal scroll, no overlapping text, install table scrolls inside its wrapper rather than breaking layout.

- [ ] **Step 3: Both themes, contrast**

Toggle both themes. Confirm the blade sweep runs smoothly with no layout shift, and clicking the toggle rapidly (5+ times fast) never produces overlapping sweeps or a stuck overlay (the `busy` guard from Task 4 blocks re-entrancy). Spot-check `--ink-soft` and `--ink-faint` text against `--bg`/`--panel` in both themes with a contrast checker; PRD §4.6 requires AA — if any combination fails, adjust the alpha value for that token in `app/globals.css` (Task 2) and re-check.

- [ ] **Step 4: Reduced motion**

Enable "reduce motion" in OS accessibility settings, reload the page.
Expected: theme toggle swaps instantly with no sweep, ink cursor never initializes (no canvas drawing on mouse move), sections are visible immediately with no fade-in delay.

- [ ] **Step 5: Touch / coarse pointer**

Use DevTools device emulation (touch) or an actual touch device.
Expected: ink cursor never initializes (`matchMedia('(pointer: fine)')` guard in Task 5).

- [ ] **Step 6: Keyboard and screen reader pass**

Tab from the top of the page to the footer.
Expected: every interactive element (theme toggle, both hero CTAs, all footer links) receives a visible `2px solid var(--accent)` focus ring with offset, in document order, with no keyboard trap. Confirm the theme toggle has `aria-label="Switch colour theme"` and the ink canvas / blade overlay both have `aria-hidden="true"` so a screen reader skips them.

- [ ] **Step 7: Theme persistence**

Set theme to light, reload the page.
Expected: page loads light immediately with no flash of dark theme before paint (this is what the Task 9 pre-paint script exists to guarantee).

- [ ] **Step 8: Content accuracy re-check**

Re-read `lib/content.ts` against `saizen-site-DESIGN.md` §10 traps: confirm no copy implies app-level light/dark theming, torrents are described as optional/offline only, MobileVLCKit is described as a probe fallback, and the install table doesn't imply App Store/TestFlight availability.

- [ ] **Step 9: Lighthouse (if a Chromium browser with DevTools is available)**

Run Lighthouse (mobile) against the `pnpm build && pnpm dlx serve out` static output, or against `pnpm dev`.
Target: Performance ≥95, Accessibility 100, CLS ≈0. If either target is missed, identify the offending resource (typically an unoptimized font load or a layout-triggering style) and fix it in the relevant task's file before considering the site done. If no Chromium DevTools access is available in this environment, note that explicitly rather than claiming a Lighthouse score that wasn't measured.

- [ ] **Step 10: Final commit**

```bash
git add -A
git commit -m "chore: QA pass — verify Definition of Done checklist" --allow-empty
```

(Use `--allow-empty` only if Steps 1–9 required no code changes; otherwise the fixes from those steps are already staged and this commit carries them.)
