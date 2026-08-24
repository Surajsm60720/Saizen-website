# Saizen Site — Design Document

**Version:** 1.0 · Source of truth for visual decisions
**Companion:** `saizen-site-PRD.md` (build requirements)

---

## 1. What this site is

A one-page site for **Saizen** — a personal iOS anime client (Next.js + Capacitor 7 + Swift) that resolves installable CDN stream modules to HLS/MP4 and plays them in a custom AVPlayer.

**Audience:** technically-minded anime watchers who already sideload apps. They know what an IPA is. They do not need "what is anime" framing, and they will notice inflated claims immediately.

**The page's single job:** make someone confident enough to sideload the build — by showing what actually works, not by selling.

**Tone:** plain, specific, quietly confident. No marketing superlatives. The product's honesty about being a sideload-only personal project *is* the credibility.

---

## 2. Design thesis

The name 最善 ("the optimal") and the blade motif drive everything. The site channels **sumi-e brushwork on paper** — mostly empty space, one decisive gesture. Not "anime fan site" (no character art, no gradients, no neon). The Japanese influence comes through *typography, restraint, and ink*, not decoration.

**Where the boldness is spent:** the blade-wipe theme transition and the sumi ink cursor trail. Everything else — layout, type, spacing — stays disciplined so those two land.

---

## 3. Colour tokens

Both themes are anchored on the brief's mandated pairs. Everything else is derived neutral.

### Light — hinomaru red on paper
| Token | Value | Role |
|---|---|---|
| `--accent` | `#BC002D` | Kanji, section marks, CTAs, links, selection |
| `--bg` | `#FFFFFF` | Page |
| `--ink` | `#0B0B0B` | Body text |
| `--ink-soft` | `rgba(11,11,11,.62)` | Secondary prose |
| `--ink-faint` | `rgba(11,11,11,.38)` | Eyebrows, meta, mono labels |
| `--rule` | `rgba(11,11,11,.14)` | Hairlines, grid gaps, borders |
| `--panel` | `#F7F5F3` | Alternating section ground (paper warmth) |
| `--brush` | `11,11,11` | Cursor ink (RGB triplet for canvas) |

### Dark — cathode cyan on true black
| Token | Value | Role |
|---|---|---|
| `--accent` | `#43FFD2` | as above |
| `--bg` | `#000000` | Page |
| `--ink` | `#FFFFFF` | Body text |
| `--ink-soft` | `rgba(255,255,255,.66)` | Secondary prose |
| `--ink-faint` | `rgba(255,255,255,.40)` | Meta |
| `--rule` | `rgba(255,255,255,.16)` | Hairlines |
| `--panel` | `#0A0A0A` | Alternating section ground |
| `--brush` | `67,255,210` | Cursor ink |

**Rules**
- Accent is used sparingly and always means "this is Saizen" — never as a background fill for large areas.
- No third hue. No gradients as decoration (the only gradient in the build is the blade's edge falloff).
- Dark mode is the default on load. It matches the app's own character and makes the cyan the first thing seen.

---

## 4. Typography

The site uses **the app's own typefaces** — Puritan and Quando, already shipping in Saizen. This is the strongest available tie between site and product, and neither is a default web pairing.

| Role | Face | Usage |
|---|---|---|
| Display | **Quando** | Wordmark, section titles, feature headings, tagline. Used with restraint — never for body copy. |
| Body | **Puritan** | All prose. |
| Utility | System mono stack (`ui-monospace, SFMono-Regular, Menlo`) | Eyebrows, version strings, chips, table headers, buttons. Always uppercase with wide tracking (`.11em`–`.22em`). |
| CJK | System serif stack (`Hiragino Mincho ProN, Yu Mincho, Noto Serif JP, Songti SC`) | 最善 and section labels. |

**Do not load a webfont for CJK.** Full Japanese font files are megabytes; there are only a handful of glyphs on the page. System stacks render them correctly and cost nothing.

**Scale:** fluid via `clamp()` throughout — no fixed breakpoint jumps in type size.
- Hero kanji: `clamp(76px, 17vw, 196px)`
- Wordmark: `clamp(30px, 5.4vw, 62px)`
- Section title: `clamp(26px, 4.1vw, 46px)`
- Body: `clamp(15px, .55vw + 13.6px, 17px)`, line-height `1.62`
- Mono utility: fixed `11–12.5px` (trace work, not size)

---

## 5. Layout

**Grid:** single centred column, `max-width: 1240px`, fluid gutter `clamp(20px, 5vw, 72px)`.

**Section rhythm:** every section separated by a 1px `--rule` hairline, alternating `--bg` / `--panel` grounds. Vertical padding `clamp(60px, 10vh, 116px)`.

**Section headers** carry a three-part stack:
```
視聴経路              ← CJK label, accent
How a stream…        ← Quando title
one-line lede         ← Puritan, --ink-soft
```

**Feature rows** use a two-column split at ≥900px (`minmax(190px,258px)` label rail + content), stacking below. The label rail pairs a CJK term with its romanised English in mono — this encodes the same bilingual logic the app's own naming uses.

**Numbering discipline:** `01 / 02 / 03` appears **only** on the playback pipeline, because that is a genuine ordered sequence (module resolves → candidate ranks → player takes over). Features are not numbered — they are not a sequence, and numbering them would be decoration.

---

## 6a. The blade wipe (theme transition)

A single fixed overlay sweeps diagonally across the viewport at `-18deg` — a bright accent edge with a soft falloff behind it, like light catching a blade. The theme swaps at ~250ms, mid-sweep, so the new palette appears *behind* the cut.

**Implementation constraints:**
- Transform + opacity only. Never animate `clip-path`, `width`, or `filter` — those trigger paint or layout on every frame.
- Single element, `will-change: transform, opacity`, `pointer-events: none`.
- Total duration 620ms; a `busy` flag prevents overlapping sweeps on rapid clicks.
- Under `prefers-reduced-motion`, the theme swaps instantly with no sweep.

### 6b. The sumi brush cursor

A canvas trail that renders as a tapered ink stroke — thick when the pointer moves slowly, thin when it moves fast, exactly like pressure on a real brush. Two overlaid ribbons (a solid body and a lighter inner streak) give dry-brush texture without a texture image.

**Implementation constraints — these are what keep it cheap:**
- **Fine pointers only.** `matchMedia('(pointer: fine)')` — never initialises on touch devices at all.
- **Idles out.** The rAF loop stops entirely when the trail decays to zero points, and restarts on the next move. No always-on loop.
- **DPR capped at 2.** Retina sharpness without quadrupling fill cost on 3x displays.
- **34 points max**, 620ms lifetime, jitter under 1.6px discarded.
- **Sits behind content** (`z-index: 0`, page at `1`) — ink under text, never obscuring reading.
- Cleared on `visibilitychange`; resize is debounced 150ms.
- Disabled entirely under `prefers-reduced-motion`.

---

## 7. Motion

Beyond the two signatures: scroll reveal only. `IntersectionObserver`, opacity + `translateY(14px)`, fires once per element, unobserved after. No parallax, no scroll-linked animation, no counters.

Hover: buttons lift `2px`. That is the whole hover vocabulary.

---

## 8. Quality floor

- **Responsive from the first line** — fluid `clamp()` type and spacing, no layout that only works at one width. Tables scroll horizontally in a bounded wrapper rather than breaking the page.
- **Touch targets** ≥44px (theme toggle is 44×36 minimum, buttons 48px tall).
- **Focus visible** — `2px solid var(--accent)` with offset on every interactive element.
- **Reduced motion respected** across all three motion systems.
- `viewport-fit=cover` plus safe-area awareness for notched devices.
- No horizontal overflow at any width from 320px up.

---

## 9. Performance budget

| Item | Rule |
|---|---|
| 3D / WebGL | **None.** Explicitly out of scope. |
| Images | None in the MVP. Any added later must be `loading="lazy"`, explicitly sized, and served as AVIF/WebP. |
| Webfonts | Two families max (Quando, Puritan), `display=swap`, with `preconnect`. No CJK webfont, ever. |
| JS | Vanilla, inline, no framework, no dependencies. Under ~4KB. |
| Animation | `transform` and `opacity` only. |
| Listeners | All `passive`. `IntersectionObserver` instead of scroll handlers. Resize debounced. |
| Canvas | Idles when pointer is still; DPR capped at 2; skipped on touch. |

**Target:** Lighthouse Performance ≥95 on mobile, CLS ≈0, no long tasks over 50ms during the blade transition.

---

## 10. Content integrity rule

**Every claim on the site must be verifiable in the repo at the stated version.** No roadmap items, no "coming soon", no aspirational feature names.

Specific traps to avoid:
- **The app does not have light/dark theming.** Settings → Appearance ships accent colour plus transparency/Frosted blur. The *site* has themes; do not imply the app does.
- Torrents are **optional offline only** — not the Watch path. Any copy suggesting torrent streaming is the product is wrong as of 1.4.0+.
- MobileVLCKit is a **probe fallback**, not a co-primary player.
- Release IPAs are **minor versions only** (1.4.0). Patches (1.4.1, 1.4.2) are local sideload builds with no Release asset.
- There is no App Store build, no TestFlight, no paid-account distribution path.

When the app ships a new feature, update the site copy from the README changelog, never from planning documents.

---

## 11. Amendment — glass material and the convergence section

Two additions layered on top of the rules above, added after the MVP shipped. Both are deliberate, scoped exceptions — everything in §1–10 still governs the rest of the page.

### 11a. Glass material (top bar, pipeline/feature cards, hero buttons)

The top bar, the pipeline steps, the feature rows, and the two hero CTAs use a "glass" treatment: a flat translucent fill (`--glass-bg`, ink-tinted relative to the theme's own background — never literal white paint on white paper) plus a directional edge-light glow, ported from React Bits' `BorderGlow` component (its edge-proximity and cursor-angle math, unmodified; its mesh-gradient `colors` prop dropped entirely for plain graded white — real light doesn't change hue with the theme).

This bends two rules from §3/§5/§7 on purpose:
- **"No third hue, no gradients as decoration"** — the edge-light is a second gradient beyond the blade's falloff. It stays white in both themes rather than introducing a hue, which is the compromise that made this acceptable.
- **Corner radius** — pipeline/feature cards round to 16px and hero buttons to a 24px pill, breaking from the site's otherwise near-flat 2px radius everywhere else (buttons, toggle, chips, table wrapper). This is deliberate, not drift: rounded, continuous-corner shapes are specifically what reads as "iOS 26 Liquid Glass," which is the thing this material exists to quote. Nothing outside this material adopts the rounder radius.

The glow itself: an `--edge-proximity` value (0 at a surface's center, 100 at its boundary) gates opacity, and a conic-gradient mask swept to `--cursor-angle` keeps the glow lit only on whichever edge the cursor is nearest — a beam that travels the border as the cursor moves, covering roughly a tenth of the perimeter at once, never the interior. Implementation: `lib/edge-glow.ts` (the hook), `components/glass-surface.tsx` + `components/edge-light.tsx` (the DOM), `.glass`/`.edge-light` in `app/globals.css` (the visuals). Respects `prefers-reduced-motion` (the glow is hidden outright, not just slowed).

Security's rows and the install table deliberately stay on the original flush hairline-list treatment — the glass material's scope is top bar + pipeline + features + hero buttons only.

### 11b. Convergence section

A new section, `統合` ("integration"), sits at the end of the page, after Install and before the footer. Every labeled fragment tag is real chip text flattened straight from `lib/content.ts` (`features.flatMap(f => f.chips ?? [])`) — not a hand-picked or placeholder list, so it stays in sync automatically as features change. A small number (10) of dim, unlabeled canvas points add background texture only; the "many things coming together" read is carried by the real content, not by particle count.

The sequence plays once, triggered by `IntersectionObserver` when the section scrolls into view — never on page load, never a loop, matching the discipline already established for scroll reveal elsewhere on the page. Canvas is used for the point swarm and the ink-burst finale (hundreds of DOM nodes would be the wrong tool); the labeled tags themselves are real, accessible-if-unhidden DOM text, not canvas-drawn. Disabled under `prefers-reduced-motion` (jumps straight to the resolved mark).
