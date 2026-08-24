# Saizen Site — PRD

**Status:** Ready to build
**Design source of truth:** `saizen-site-DESIGN.md`

---

## 1. Objective

Ship a production one-page site for **Saizen**, matching the design direction, built to survive iteration and future feature additions.

Saizen is a personal iOS anime client (Next.js + Capacitor 7 + Swift, currently v1.4.2). Live Watch resolves installable CDN stream modules to HLS/MP4 and plays them in a custom AVPlayer. Libtorrent remains for optional offline work only. It is a sideload-only personal project — no App Store build.

---

## 2. Design principles carried in from skill guidance

Craft (spacing rhythm, type detail, interaction polish) follows general web/Apple design best practice. Identity (the mandated palette, the blade transition, the brush cursor, the Japanese aesthetic) follows the brief and is never traded away for generic polish.

---

## 3. Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router), static export | Matches the app repo's own stack; deploys anywhere |
| Styling | Tailwind + CSS custom properties for the theme tokens | Tokens must stay CSS vars so the blade transition can swap them atomically |
| Components | Bespoke — no component library | Most of this page is three divs; a library doesn't earn its place here |
| Animation | Vanilla + CSS only | No animation dependency for scroll reveal, blade wipe, or cursor |
| Deployment | Static — Vercel or any static host | No server runtime needed |

**Do not** introduce: 3D libraries, WebGL, particle systems, cursor libraries, scroll-jacking libraries, or any dependency whose job can be done in <100 lines of vanilla JS.

---

## 4. Hard requirements

### 4.1 Responsive from the first commit
Not a later pass. Build mobile-first, verify at **320 / 390 / 768 / 1024 / 1440 / 1920** before considering any section done. Fluid `clamp()` scaling rather than breakpoint jumps. Zero horizontal overflow at any width.

### 4.2 Themes
- Light: accent `#BC002D`, background `#FFFFFF`
- Dark: accent `#43FFD2`, background `#000000`
- Dark is the default. Persist the choice to `localStorage` and honour `prefers-color-scheme` on first visit.
- Apply the stored theme **before first paint** (inline script in `<head>`) to avoid a flash of the wrong theme.

### 4.3 The blade transition
Diagonal accent sweep at `-18deg`, theme swaps mid-sweep so the new palette appears behind the cut. 620ms total. Transform + opacity only. Re-entrancy guarded. Instant swap under `prefers-reduced-motion`. See DESIGN §6a.

### 4.4 The sumi brush cursor
Canvas ink trail, tapered by pointer velocity. See DESIGN §6b for the full constraint list — the constraints *are* the requirement. In particular: fine pointers only, rAF idles when empty, DPR capped at 2, sits behind content, disabled under reduced motion.

### 4.5 Performance
Lighthouse mobile Performance ≥95, CLS ≈0. No 3D assets. Two webfonts maximum. No CJK webfont. All listeners passive. See DESIGN §9.

### 4.6 Accessibility
Visible focus rings on all interactive elements, ≥44px touch targets, semantic landmarks, `aria-label` on the theme toggle, sufficient contrast in both themes (verify the `--ink-soft` and `--ink-faint` tokens against both backgrounds — adjust the alpha if any fails AA).

---

## 5. Content rule — read this before writing copy

**Only describe what ships in the repo at the current version.** No "coming soon", no aspirational claims.

Source content from `README.md` in `Surajsm60720/Saizen` — specifically the Features list and the What's New tables. When the app updates, update the site from the README changelog, never from planning docs.

**Known traps:**
- The app has **no light/dark theming**. Appearance ships accent colour + transparency/Frosted blur. The site has themes; the app does not. Do not conflate them.
- Torrents are **optional offline only**, not the Watch path (true since 1.4.0).
- MobileVLCKit is a **probe fallback**, not a co-primary player.
- Release IPAs are **minor versions only** (v1.4.0 current). Patches like 1.4.1/1.4.2 are local sideload builds without Release assets.
- No App Store, no TestFlight.

---

## 6. Page structure

| # | Section | Content | Notes |
|---|---|---|---|
| 1 | Sticky top bar | SAIZEN wordmark, version, theme toggle | Blurred, translucent, hairline bottom border |
| 2 | Hero | 最善 lockup, wordmark, reading, tagline, lede, two CTAs, tech meta line | Typographic hero — no device mock, no screenshots in v1. The only place CJK appears on the page. |
| 3 | Features | Browse, Search, Detail, Schedule, Player, Downloads, Accounts, Incognito, Appearance | Two-column rows with EN label rail (no CJK) |
| 4 | Install | Honest table of the four distribution methods + version-numbering callout | Free Apple ID / ~7-day certs stated plainly |
| 5 | Convergence | Feature chips spiral into the 最善 mark, once, on scroll into view | Closing moment before the footer |
| 6 | Footer | Source, Releases, Security doc, Structure doc, legal line | |

The playback-pipeline walkthrough and the security section were both removed outright (not just restyled) — judged to be more implementation/security detail than a public-facing site should volunteer. See `saizen-site-DESIGN.md` §11c for the full rationale.

---

## 7. Build order

1. **Scaffold + tokens.** Next.js static export, CSS custom properties for both themes, fonts wired with `preconnect` + `display=swap`, pre-paint theme script.
2. **Stage, no motion.** All seven sections, real copy, fully responsive. Verify every breakpoint before moving on.
3. **Theme toggle + blade transition.** Add persistence. Verify reduced-motion path.
4. **Scroll reveal.** IntersectionObserver, once per element.
5. **Brush cursor.** Last, because it is the easiest to make expensive. Profile it: the rAF loop must be absent from the performance timeline when the pointer is still.
6. **Audit.** Lighthouse mobile + desktop, keyboard-only pass, VoiceOver pass, both themes, reduced-motion on.

---

## 8. Definition of done

- [ ] Renders correctly 320px → 1920px, no horizontal scroll, no overlapping text
- [ ] Both themes pass WCAG AA on all text
- [ ] Blade transition runs at 60fps, no layout shift, guarded against rapid clicks
- [ ] Brush cursor absent on touch devices and under reduced motion; rAF idles when pointer is still
- [ ] Theme persists across reloads with no flash on load
- [ ] Lighthouse mobile Performance ≥95, Accessibility 100
- [ ] Keyboard-navigable to end with visible focus
- [ ] Every factual claim traceable to the repo README at the stated version

---

## 9. Iteration notes

Likely iteration axes, in the order they are most likely to be wanted:

- **Screenshots.** The hero is typographic by choice; real device screenshots would strengthen the Features section considerably once there is polished UI to show. Add as lazy-loaded, explicitly-sized AVIF/WebP inside a simple device frame. This is the single highest-value addition.
- **Blade angle and duration.** The sweep angle and the 620ms/250ms pair are tunable; the swap point should stay at roughly 40% of total duration.
- **Brush character.** Point count, lifetime, and the velocity→width curve control how wet or dry the stroke reads.
- **Section grounds.** The alternating `--panel` rhythm can be dropped entirely for a flatter, quieter page if the current version feels too banded.
