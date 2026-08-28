# Saizen — site

One-page marketing site for **Saizen**, a personal iOS anime client (Next.js + Capacitor 7 + Swift). Plain, specific, no marketing superlatives — the page's only job is making someone confident enough to sideload the build.

This repo is the **site only**. The app itself lives at [github.com/Surajsm60720/Saizen](https://github.com/Surajsm60720/Saizen).

## Stack

- **Next.js 14** (App Router), static export (`output: 'export'`) — no server runtime, deploys as plain static files
- Hand-rolled CSS custom-property design tokens (`app/globals.css`) — no component library, no CSS-in-JS
- Vanilla scroll/animation logic — no animation or scroll-jacking dependencies
- TypeScript throughout

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

```bash
pnpm build        # static export to out/
pnpm typecheck
pnpm lint
```

`pnpm build` is the same build Vercel runs — to sanity-check the actual production output locally before deploying:

```bash
pnpm build
npx serve out      # or: cd out && python3 -m http.server 4000
```

## Deploying

Static export, zero-config on Vercel — connect the repo and it detects `output: 'export'` automatically. No `vercel.json`, no server functions, no environment variables required.

## Project structure

```
app/            Next.js App Router entry (layout, page, globals.css)
components/     One component per section/behaviour — Hero, Features,
                PhoneScrolly (the scroll-driven phone mockup), Install,
                Convergence, Footer, theme switcher, etc.
lib/            Shared content data (lib/content.ts — the feature copy
                driving both the Features ledger and PhoneScrolly) and
                small utilities (theme, edge-glow)
public/media/   Real device screenshots/recordings powering the phone
                mockup's screen content — trimmed, cropped, and
                re-encoded from source captures (see PhoneScrolly's own
                comments for the reasoning behind each crop)
docs/           Design/planning docs — see below
```

## The phone mockup (PhoneScrolly)

The scroll-driven phone that travels through the page is the site's centerpiece — a single `position: fixed` element whose position is driven by discrete scroll-position thresholds (not a continuous scrubbed animation), so a section handoff always takes the same fixed duration regardless of scroll speed. It has two entirely separate code paths:

- **Desktop (≥1100px):** phone docks in the hero, then rides a sticky rail beside the Features ledger, screen content following whichever row is nearest viewport center.
- **Mobile/tablet (<1100px):** phone has no hero presence at all — it appears pinned at the hero/features boundary and steps through an intro sequence, then one pinned card+screen pair per feature, then the tagline, sizing itself in JS to fill whatever room is actually free below the current card.

Both paths render the same real captures in `public/media/`: video for anything whose value is inherently about motion (a carousel, a live-dragged slider, a menu opening), static screenshots for anything that's really about layout.

## Docs

- `saizen-site-PRD.md` — build requirements
- `saizen-site-DESIGN.md` — visual design system (color tokens, type, the blade-wipe theme transition)
- `docs/superpowers/specs/` — dated design docs for specific features (e.g. the mobile PhoneScrolly rework)

## Notes

- Sideload-only personal project — no App Store build, no telemetry, no company behind it.
- Both light and dark themes are fully token-driven; there's no separate dark-mode stylesheet to keep in sync.
