# Mobile PhoneScrolly Experience — Design

## Goal

Below the desktop breakpoint, `PhoneScrolly` currently no-ops entirely (`fly.style.opacity = '0'`, early return) — mobile and tablet visitors never see the phone, the intro captures, the per-feature screens, or the tagline. This spec adds a mobile-native equivalent of the desktop experience: no phone in the hero, then a pinned phone that steps through the intro captures, then a pinned per-feature sequence (title + body card above, phone screen below), then the tagline, then fade-out — all driven by the same fixed-position-phone + threshold-stage mechanism the desktop version already uses, just re-laid-out for a single column.

Screenshots/recordings for the phone's screen content are explicitly out of scope here — this spec only changes *when* and *how* the existing placeholder screens (splash, intro shots, feature chip, tagline) are shown on narrow viewports, not what's rendered inside them.

## Breakpoint

The existing desktop code path currently activates at `min-width: 900px`, which also happens to catch tablets (iPad portrait is 768–834px and already gets the "no phone" treatment, but iPad landscape at 1024px gets the cramped side-rail). Per user decision, tablets should get the new mobile design, not the side-rail. The cutoff moves to **1100px**:

- `< 1100px` → new mobile stage machine (this spec)
- `≥ 1100px` → existing desktop stage machine (hero dock → side-rail → tagline), unchanged

This single constant is shared by `phone-scrolly.tsx` (JS `matchMedia`) and `globals.css` (the `#phone-intro-zone`/`#phone-tagline-zone` mobile-collapse rule, the `.hero-grid`/`.hero-device` two-column rule, and the `.features-grid`/`.dock-anchor` rule) — all four currently hardcode `900px` and all four move to `1100px` together, so the three existing "mobile-mode" layouts (no hero phone slot, full-width ledger, no side rail) stay in sync with wherever the new mobile PhoneScrolly is active.

## Stage machine

Mobile gets its own `Stage` union, replacing the current early-return:

```
'pre' | 'intro' | 'feature-0' .. 'feature-8' | 'tagline' | 'gone'
```

(`'feature-N'` for each entry in `features` from `lib/content.ts` — 9 today, but the count must stay derived from `features.length`, not hardcoded, matching how `SCREENS` already works.)

- **pre** — above the hero/features boundary. Phone is not rendered (`opacity: 0`, matching today's reduced-motion/no-op path). No `hero` stage exists on mobile — the phone never appears inside the Hero section itself, per the explicit request to remove it from there.
- **intro** — a new pinned zone (`#phone-intro-zone-m`, mirroring the desktop zone's mechanics but mobile-only) that starts right where Hero ends. Phone parks centered, screen shows the idle splash then steps through `INTRO_SHOTS` exactly like the desktop intro zone does today (reuse the same span/progress formula).
- **feature-N** — one pinned zone per feature (`#phone-feature-zone-m`, tall enough for a comfortable single step — see Layout below), phone stays parked in the same centered spot, a text card pinned above it shows feature `N`'s index/title/body. Scrolling from feature-N's zone into feature-(N+1)'s zone swaps the card content and the phone's screen content together, both gated the same way the desktop docked stage already gates feature swaps (no swap until the *previous* card has fully exited, so two cards never visibly overlap).
- **tagline** — reuses the existing `#phone-tagline-zone` and its line-by-line reveal logic completely unchanged; only the *positioning* differs (mobile phone is already centered from the previous stage, so there's no rail-to-center travel to choreograph).
- **gone** — same fade-before-Install behavior as desktop, unchanged.

## Layout per stage

All mobile stages park the phone at the same spot: horizontally centered, vertically in the *lower* portion of the viewport (leaving room above for the intro's absence of a card, and for each feature's title+body card). Concretely: phone center at `y = vh * 0.62`, scaled down from the desktop's 272×558 footprint to fit comfortably beside a text card on a 360–430px-wide screen (target phone width ≈ `min(220px, vw * 0.55)`).

- **Intro**: no card above — just the phone, splash/shots only, matching desktop's intro zone (which also has no surrounding text).
- **Feature-N**: a card pinned at roughly `y = vh * 0.14` to `vh * 0.5` (above the phone), containing:
  - index + eyebrow (`"0N  BROWSE"` style, matching the ledger's existing `row-index`/`row-en` treatment)
  - `feature.title` (heading)
  - `feature.body` (the existing 1–2 sentence description)
  - **no chips** — decided against for mobile card density; chips remain desktop-ledger-only.
  Card content fades/pops in using the same `.mask`/`.pop` mechanism already used elsewhere (hero, ledger rows), not a new animation primitive.
- **End of features → tagline handoff**: once the last feature's card has fully exited, the card slot stays empty (nothing pinned above the phone) through the remainder of that zone and into the tagline zone — i.e., "the top portion disappears" is simply the card slot going empty, not a separate animated element to build.

## Scroll budget

Each pinned zone needs enough height for: (a) arrival lead so it doesn't trigger while the previous section is still exiting, (b) the actual step content, (c) exit lead. Desktop's intro zone uses `300vh` for 3 shots (~67vh "owned" scroll per shot after the 100vh arrival+exit overhead) and the tagline zone uses `280vh`. For mobile:

- Intro zone: keep `300vh` (unchanged shape, 3 shots).
- Each feature zone: `180vh` (~80vh owned scroll per feature after similar overhead — enough to read a 2-sentence body comfortably without dragging).
- Tagline zone: reuse existing `280vh` as-is.

These are starting values to tune against Playwright-verified real scroll distances during implementation, the same way the desktop zones were tuned this session (e.g. the tagline zone's `180vh → 280vh` correction after the reveal read as instant).

## Technical implementation

- **`phone-scrolly.tsx`**: branches on `matchMedia('(min-width: 1100px)')` into two code paths. Both share the same `.phone-fly` fixed element, `PhoneFrame` presentational component, and `clamp()` helper. The mobile path does **not** need the desktop's screen-content-lag mechanism (`screenStage` trailing `stage`, `moveTimer`, `slotOf()`) — that exists solely to hold outgoing screen content until the phone physically arrives at a *new* x/y slot, and on mobile the phone never moves (every stage parks at the same centered spot), so there is no arrival to wait for. Mobile screen/card content is driven directly off `stage`. The mobile path is new code, not a fork-and-diverge of the desktop `tick()` — desktop's stage thresholds (`introRect.top > 0`, `tagRect.top > mid`, etc.) are reused conceptually but the mobile version adds the per-feature zone lookups.
- **`features.tsx`**: below 1100px, does not render the ledger rows or the per-row reveal machinery at all — instead renders the tall empty per-feature spacer divs (`#phone-feature-zone-m-0` .. `-8`, ids keyed by feature index) that `PhoneScrolly` reads, mirroring how `#phone-intro-zone`/`#phone-tagline-zone` are empty divs read by `PhoneScrolly` today. The section heading ("What is in the build") still renders above the first spacer — matches desktop's Features heading still being present before the docked rail begins.
- **`globals.css`**: the four `900px` breakpoints move to `1100px` (see Breakpoint section). New rules for the mobile card (`.phone-feature-card` or similar), the mobile phone-fly sizing at narrow widths, and the new spacer zone heights.
- **`page.tsx`**: no structural change — `Features` already sits between the intro and tagline zones; the per-feature spacers live *inside* `Features`' own render output (mobile branch), not as siblings in `page.tsx`.

## Testing / verification

Same methodology as the rest of this session's PhoneScrolly work: Playwright scroll sweeps at a phone viewport (390×844) and a tablet viewport (820×1180, and 1024×1366 to check the raised breakpoint's other edge), checking:
- No stage's content renders before its zone has scrolled into a sensible position (mirrors the desktop "Browse appearing mid-flight" bug class).
- No two feature cards are ever simultaneously `.is-shown`.
- The 1100px breakpoint edge: 1099px gets the new mobile layout, 1100px gets the desktop rail, with no dead zone or double-render in between.
- `prefers-reduced-motion` still short-circuits to a static state (matching the existing `if (reduce) { ... return }` pattern).
- No new horizontal overflow introduced (per the 320px-width check this session already established as a real failure mode).

## Out of scope

- Actual screenshots/recordings for any screen content (explicitly deferred by the user until after this responsive pass).
- Any change to the desktop (≥1100px) visual experience beyond the breakpoint number itself.
- Landscape phone orientation (already rejected earlier this session, applies here too).
