# Saizen site — architecture spec

**Date:** 2026-08-24
**Status:** approved
**Inputs:** `saizen-site-DESIGN.md` (visual source of truth), `saizen-site-PRD.md` (requirements)

This spec covers only the implementation decisions not already pinned down by DESIGN/PRD: file layout, component boundaries, state ownership, data flow, and testing strategy. Visual rules and content rules live in those two files and are not repeated here.

## Content verification

Pasted DESIGN/PRD content was checked against the live README at `Surajsm60720/Saizen` (fetched 2026-08-24). All factual claims (feature list, security model, distribution table, current version 1.4.2, Release-IPA-is-minor-versions-only rule) match. No content corrections were needed beyond fixing transcription corruption in the pasted markdown (dropped characters, broken table rows) — done in `saizen-site-DESIGN.md` / `saizen-site-PRD.md`.

Footer links verified live (200 OK): repo root, `STRUCTURE.md`, `docs/SECURITY_TEST_PLAN.md`, `/releases`.

## Stack

Next.js 14 App Router, static export (`output: 'export'`), TypeScript, pnpm. Tailwind included for layout utilities only (flex/grid helpers, spacing shorthand) — the token system stays raw CSS custom properties per PRD §3, because the blade transition needs to swap the whole palette atomically by flipping one `data-theme` attribute, which a Tailwind theme config cannot do at runtime without a CSS-var bridge anyway.

No component library. No animation library. Both are explicit "do not introduce" items in the PRD.

## File layout

```
app/
  layout.tsx        — <html>/<head> shell, font preconnect + stylesheet links,
                       pre-paint inline theme script, metadata, renders
                       <ThemeProvider><InkCursor/>{children}</ThemeProvider>
  page.tsx           — assembles the 7 sections in order
  globals.css        — :root and [data-theme="dark"] token blocks, base
                        element styles, section/typography scaffolding
                        (ported from the MVP CSS, 1:1)
components/
  top-bar.tsx        — wordmark, version string, <ThemeToggle/>
  hero.tsx
  pipeline.tsx       — the one numbered section
  features.tsx       — maps content.features
  security.tsx
  install.tsx        — maps content.installMethods
  footer.tsx
  theme-provider.tsx — client; owns theme state + blade overlay (see below)
  theme-toggle.tsx   — client; button, consumes theme-provider context
  scroll-reveal.tsx  — client; thin IntersectionObserver wrapper, one instance
                        per section via composition, not per element
  ink-cursor.tsx     — client; canvas trail, self-contained (no shared state)
lib/
  content.ts         — typed content data: features[], pipelineSteps[],
                        installMethods[], securityItems[] — README-sourced
  theme.ts            — 'light' | 'dark' type, localStorage key constant,
                        get-initial-theme() used by both the inline
                        pre-paint script (as inlined source, see below) and
                        theme-provider.tsx (kept as one string constant so
                        the two never drift)
```

## State ownership: theme + blade transition

One client component, `theme-provider.tsx`, owns:
- theme state (`'light' | 'dark'`), initialized from `document.documentElement.dataset.theme` (already set by the pre-paint script, so no hydration flash and no mismatch)
- a `busy` ref guarding re-entrant sweeps
- the fixed blade-overlay `<div>` (rendered once, always mounted)
- a `toggleTheme()` function exposed via context: starts the sweep animation, flips `data-theme` + localStorage at the 250ms mark, clears `busy` after 640ms; under `prefers-reduced-motion` it swaps instantly with no animation

`theme-toggle.tsx` is presentational: reads `theme`/`toggleTheme` from context, renders the button. This keeps the overlay element and the toggle button decoupled in the tree (overlay lives in the provider near the CSS z-index root; the toggle lives wherever the top bar puts it) while sharing exactly one source of truth, matching the MVP's single-script behavior without needing prop drilling.

The pre-paint script is a small inline `<script>` in `layout.tsx` (not an external file) so it runs before any JS bundle, reading `localStorage` then falling back to `prefers-color-scheme`, then falling back to dark (PRD §4.2: dark is default). Its logic is duplicated intentionally (3 lines) rather than imported, since it must run standalone before hydration.

## Ink cursor

Self-contained client component, no context, no props. Direct port of the MVP's vanilla logic into a `useEffect` with its own `useRef`s for the canvas, point buffer, and rAF handle. Mounted once in `layout.tsx` (not `page.tsx`) so it sits behind all page content at `z-index: 0` regardless of section.

## Scroll reveal

A generic `<Reveal>` client wrapper (IntersectionObserver, `rootMargin: '0px 0px -12% 0px'`, unobserve after first intersection, no-op entirely if `prefers-reduced-motion` or `IntersectionObserver` is unavailable). Each section component wraps its own root element in it — no central registry, no ref forwarding gymnastics.

## Data flow

Fully static. No fetching, no server actions, no API routes. `lib/content.ts` is the single editable surface for future README-driven updates — PRD §10/§5 both say updates come from the README changelog; keeping content as typed data (not JSX prose) makes that a data edit, not a markup edit.

## Error handling

None needed beyond TypeScript's own guarantees — there is no user input, no network call, no dynamic data. The only runtime branch with real failure modes is the ink-cursor canvas context (`getContext('2d')` can return `null` in theory); guard with an early return, matching the MVP.

## Testing strategy

No unit test framework. This is a static content page — there is no business logic to unit-test, and adding a test runner for a marketing site would be exactly the kind of unrequested abstraction the project's own conventions warn against.

Verification instead:
- `tsc --noEmit` and `next lint` clean on every change
- Manual pass against the PRD §8 Definition of Done checklist: breakpoints 320/390/768/1024/1440/1920, both themes AA contrast, blade transition rapid-click guard, cursor absent on touch + reduced-motion, theme persistence with no FOUC, keyboard nav to the end, Lighthouse mobile ≥95
- This manual pass is a named step in the implementation plan, not left implicit

## Favicon

Inline SVG, 最 glyph on the accent color, no external file dependency, no raster export needed. Not a "content image" under the PRD's no-images rule — that rule targets hero/feature imagery.

## Deployment

Static export works unmodified on Vercel (zero config) or any static host (GitHub Pages, Netlify, S3+CDN). No environment variables, no server runtime.
