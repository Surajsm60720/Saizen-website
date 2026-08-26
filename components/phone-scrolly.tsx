'use client';

import { useEffect, useRef, useState } from 'react';
import { PhoneFrame, type PhoneScreen, type PhoneScreenKind } from './phone-frame';
import { features } from '@/lib/content';

// Decorative per-feature identity colours — unrelated to the site's
// light/dark accent token, same as the ink-convergence fragments already
// don't reskin per theme. Cycles if there are ever more features than
// colours.
const COLORS = [
  '#BC002D',
  '#7A4FBE',
  '#1E6FBE',
  '#1E8F5F',
  '#B8860B',
  '#C24E2A',
  '#2A7F8C',
  '#8C2A5E',
  '#5E7A2A',
];

// Player is the one feature that gets the phone to flip to landscape —
// it's the only screen where portrait doesn't make sense to show.
const LANDSCAPE_LABEL = 'Player';

const SCREENS: PhoneScreen[] = features.map((feature, i) => ({
  label: feature.en,
  color: COLORS[i % COLORS.length],
  landscape: feature.en === LANDSCAPE_LABEL,
}));

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

type Stage = 'hero' | 'takeover' | 'docked' | 'tagline' | 'gone';

/**
 * Scroll choreography: docked in the hero's reserved slot -> takeover (a
 * one-time rotateY spin flourish plus scaling toward viewport centre as
 * the hero clears) -> docked to a sticky rail beside Features, screen
 * crossfading to whichever feature row is nearest viewport-centre and
 * flipping to landscape for Player (rotateZ, top edge going left/bottom
 * going right) -> a closing tagline, phone re-centred once more -> fades
 * out for good before Install/Convergence/Footer, which stay untouched.
 *
 * The phone itself is `position: fixed` and its target is computed every
 * scroll tick from the live bounding rects of anchor elements that live
 * in Hero, Features and the tagline zone — not reparented between them,
 * so it can move continuously instead of jumping between instances.
 */
export function PhoneScrolly() {
  const flyRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(-1);
  const [screenKind, setScreenKind] = useState<PhoneScreenKind>('idle');
  const sizeRef = useRef({ w: 272, h: 558 });
  const stageRef = useRef<Stage>('hero');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wide = window.matchMedia('(min-width: 900px)').matches;
    const fly = flyRef.current;
    const phone = phoneRef.current;
    if (reduce || !wide || !fly || !phone) {
      if (fly) fly.style.opacity = '0';
      return;
    }

    // Natural (unscaled) size of the rendered phone, read once — avoids
    // hardcoding a size that could drift from the actual CSS.
    const rect = fly.getBoundingClientRect();
    if (rect.width && rect.height) sizeRef.current = { w: rect.width, h: rect.height };

    let queued = false;
    let lastActive = -2;
    let lastKind: PhoneScreenKind | null = null;
    let hasSpun = false;
    // Whether dockAnchor's native sticky has actually engaged yet — true
    // once its rect first reaches the intended stuck offset. Before that
    // (Features just started, anchor still in normal flow, likely still
    // below the fold) its real position must be followed as-is or the
    // phone would appear pinned to centre before it's meant to arrive.
    let hasStuck = false;
    // Last real docked position, captured every tick while actually
    // docked — the tagline phase lerps away from this rather than from
    // dockAnchor's own rect, which is no longer meaningful once Features
    // has scrolled fully past (sticky containment gone, rect is stale).
    const lastDock = { x: 0, y: 0, scale: 1 };

    function tick() {
      queued = false;
      const w = sizeRef.current.w;
      const h = sizeRef.current.h;
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      const heroAnchor = document.getElementById('hero-phone-anchor');
      const dockAnchor = document.getElementById('dock-phone-anchor');
      const zone = document.getElementById('phone-transition-zone');
      const featuresSection = document.getElementById('features-section');
      const taglineZone = document.getElementById('phone-tagline-zone');
      if (!heroAnchor || !dockAnchor || !zone || !featuresSection || !taglineZone || !fly) return;

      const heroRect = heroAnchor.getBoundingClientRect();
      const dockRect = dockAnchor.getBoundingClientRect();
      const zoneRect = zone.getBoundingClientRect();
      const featRect = featuresSection.getBoundingClientRect();
      const tagRect = taglineZone.getBoundingClientRect();

      // Driven by the zone's BOTTOM crossing the viewport, not its top
      // crossing the middle — the old formula guaranteed Features' own
      // heading would be sitting at exactly viewport-centre (fighting the
      // phone for the same spot) the instant takeover finished, no matter
      // how tall the zone was. This finishes with the zone (and therefore
      // Features' heading) already at/above the viewport top.
      const t = clamp((vh - zoneRect.bottom) / (zoneRect.height || 1), 0, 1);

      // Which feature row is nearest viewport-centre — computed up front
      // since both the landscape shrink (position) and the screen/roll
      // (below) need it.
      const centerY = vh / 2;
      let dockedIdx = 0;
      let bestDist = Infinity;
      document.querySelectorAll('.rows--ledger .row').forEach((row, i) => {
        const r = row.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - centerY);
        if (d < bestDist) {
          bestDist = d;
          dockedIdx = i;
        }
      });
      const isLandscapeRow = !!SCREENS[dockedIdx]?.landscape;

      let x: number, y: number, scale: number;
      let stage: Stage;

      // dockAnchor is a native `position: sticky` element. Track it as-is
      // while it's still settling into its stuck position (Features just
      // started, anchor may still be below the fold in normal flow) — but
      // once it's actually reached that position, lock it there for good.
      // Without this, its own containing block (the Features grid column)
      // ending releases it early and it starts scrolling away with the
      // document well before featuresSection's own bottom crosses 0; the
      // explicit tagline lerp below is what's meant to carry it onward
      // from the stuck position, not an uncontrolled native release.
      const stickyTop = vh / 2 - h / 2;
      if (!hasStuck && dockRect.top <= stickyTop + 1) hasStuck = true;
      const dockTop = hasStuck ? Math.max(dockRect.top, stickyTop) : dockRect.top;
      const dockCenterX = dockRect.left + dockRect.width / 2;
      const dockCenterY = dockTop + dockRect.height / 2;

      if (tagRect.bottom <= 0) {
        stage = 'gone';
        x = y = 0;
        scale = 1;
      } else if (featRect.bottom > 0) {
        if (t <= 0) {
          stage = 'hero';
          x = heroRect.left;
          y = heroRect.top + heroRect.height / 2 - h / 2;
          scale = heroRect.width / w;
        } else if (t < 1) {
          stage = 'takeover';
          const midScale = 1.1;
          const midX = vw / 2 - (w * midScale) / 2;
          const midY = vh / 2 - (h * midScale) / 2;
          const startScale = heroRect.width / w;
          x = lerp(heroRect.left, midX, t);
          y = lerp(heroRect.top + heroRect.height / 2 - h / 2, midY, t);
          scale = lerp(startScale, midScale, t);
        } else {
          stage = 'docked';
          // Centre-anchored rather than top-left, so shrinking for the
          // landscape case scales in place instead of drifting sideways
          // into the row text next to it — a fixed top-left position at
          // the rotated (much wider) size was covering the ledger.
          scale = dockRect.width / w;
          if (isLandscapeRow) scale *= 0.52;
          x = dockCenterX - (w * scale) / 2;
          y = dockCenterY - (h * scale) / 2;
          lastDock.x = x;
          lastDock.y = y;
          lastDock.scale = scale;
        }
      } else {
        stage = 'tagline';
        // Smooth lerp from wherever it was last actually docked to the
        // centred tagline position, scrubbed by how far into the tagline
        // zone we are — the old version snapped straight to centre the
        // instant Features ended, no interpolation at all.
        const t3 = clamp((vh * 0.5 - tagRect.top) / (tagRect.height || 1), 0, 1);
        const endX = vw / 2 - w / 2;
        const endY = vh / 2 - h / 2;
        x = lerp(lastDock.x, endX, t3);
        y = lerp(lastDock.y, endY, t3);
        scale = lerp(lastDock.scale, 1, t3);
      }

      stageRef.current = stage;

      if (stage === 'gone') {
        fly.style.opacity = '0';
      } else {
        fly.style.opacity = '1';
        fly.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      }
      if (stage !== 'hero') {
        phone!.style.setProperty('--rx', '0deg');
        phone!.style.setProperty('--ry', '0deg');
      }

      // One-time spin flourish, fired mid-takeover. Left at 360deg rather
      // than reset to 0 afterward — visually identical at rest, and
      // resetting would trigger a visible reverse-spin snap-back through
      // the normal tilt transition.
      if (stage === 'takeover' && t > 0.45 && !hasSpun) {
        hasSpun = true;
        phone!.classList.add('spinning');
        phone!.style.setProperty('--spin', '360deg');
        setTimeout(() => phone!.classList.remove('spinning'), 900);
      }
      if (stage === 'hero') hasSpun = false;

      // Landscape roll only while docked on the Player row — top edge
      // goes left, bottom goes right (rotateZ(-90deg), not +90).
      let kind: PhoneScreenKind = 'idle';
      let activeIdx = -1;
      let roll = '0deg';

      if (stage === 'docked') {
        kind = 'feature';
        activeIdx = dockedIdx;
        if (isLandscapeRow) roll = '-90deg';
      } else if (stage === 'tagline') {
        kind = 'tagline';
      }
      phone!.style.setProperty('--roll', roll);

      if (kind !== lastKind || activeIdx !== lastActive) {
        lastKind = kind;
        lastActive = activeIdx;
        setScreenKind(kind);
        setActiveFeature(activeIdx);
      }
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    tick();

    // The anchors are fixed-pixel-sized, but the *hero text* isn't — it
    // reflows once Quando/Puritan finish loading (taller than the fallback
    // serif/sans), which shifts the hero-grid row's vertical centering and
    // therefore heroAnchor's position after this first tick already ran.
    // Neither a scroll nor a resize event fires for that, so it drifted
    // uncorrected. Re-sync once fonts are ready, and keep watching the
    // hero section generally in case anything else reflows it later.
    document.fonts?.ready?.then(() => onScroll());
    let ro: ResizeObserver | undefined;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(onScroll);
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) ro.observe(heroContent);
    }

    // Pointer-driven 3D tilt on the phone, only while it's resting in the
    // hero slot (matches the standalone prototype) — during takeover/dock
    // its own position is already animating, and reacting to the whole
    // window's pointer position at a tiny docked scale would just look
    // jittery rather than responsive.
    const MAX_TILT = 11;
    function onPointerMove(e: PointerEvent) {
      if (stageRef.current !== 'hero') return;
      const r = phone!.getBoundingClientRect();
      const nx = clamp(((e.clientX - r.left) / (r.width || 1)) * 2 - 1, -1, 1);
      const ny = clamp(((e.clientY - r.top) / (r.height || 1)) * 2 - 1, -1, 1);
      phone!.style.setProperty('--ry', `${(nx * MAX_TILT).toFixed(2)}deg`);
      phone!.style.setProperty('--rx', `${(-ny * MAX_TILT).toFixed(2)}deg`);
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      ro?.disconnect();
    };
  }, []);

  return (
    <div className="phone-fly" ref={flyRef} aria-hidden="true">
      <PhoneFrame ref={phoneRef} screens={SCREENS} activeIndex={activeFeature} screenKind={screenKind} />
    </div>
  );
}
