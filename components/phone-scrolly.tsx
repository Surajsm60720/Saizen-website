'use client';

import { useEffect, useRef, useState } from 'react';
import { PhoneFrame, type PhoneScreen } from './phone-frame';
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

const SCREENS: PhoneScreen[] = features.map((feature, i) => ({
  label: feature.en,
  color: COLORS[i % COLORS.length],
}));

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

type Stage = 'hero' | 'takeover' | 'docked' | 'gone';

/**
 * Three-stage scroll choreography: docked in the hero's reserved slot ->
 * takeover (scales toward viewport centre as the hero clears) -> docked to
 * a sticky rail beside Features, screen crossfading to whichever feature
 * row is nearest viewport-centre. Fades out for good once Features ends,
 * before Install/Convergence/Footer — those stay untouched.
 *
 * The phone itself is `position: fixed` and its target is computed every
 * scroll tick from the live bounding rects of two anchor elements that
 * live in Hero and Features (#hero-phone-anchor, #dock-phone-anchor) —
 * not reparented between them, so it can move continuously instead of
 * jumping between two separately-mounted instances.
 *
 * What the screen shows during hero/takeover is still an open question
 * (blade-wake vs. something else) — placeholder (-1, "Screenshot") until
 * that's settled; only the docked/Features stage has real content, the
 * per-feature colour tags.
 */
export function PhoneScrolly() {
  const flyRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(-1);
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

    function tick() {
      queued = false;
      const w = sizeRef.current.w;
      const h = sizeRef.current.h;
      const vh = window.innerHeight;

      const heroAnchor = document.getElementById('hero-phone-anchor');
      const dockAnchor = document.getElementById('dock-phone-anchor');
      const zone = document.getElementById('phone-transition-zone');
      const featuresSection = document.getElementById('features-section');
      if (!heroAnchor || !dockAnchor || !zone || !featuresSection || !fly) return;

      const heroRect = heroAnchor.getBoundingClientRect();
      const dockRect = dockAnchor.getBoundingClientRect();
      const zoneRect = zone.getBoundingClientRect();
      const featRect = featuresSection.getBoundingClientRect();

      const t = clamp((vh * 0.5 - zoneRect.top) / (zoneRect.height || 1), 0, 1);

      let x: number, y: number, scale: number;
      let stage: Stage;

      if (featRect.bottom <= 0) {
        stage = 'gone';
        x = y = 0;
        scale = 1;
      } else if (t <= 0) {
        stage = 'hero';
        x = heroRect.left;
        y = heroRect.top + heroRect.height / 2 - h / 2;
        scale = heroRect.width / w;
      } else if (t < 1) {
        stage = 'takeover';
        const midScale = 1.1;
        const midX = window.innerWidth / 2 - (w * midScale) / 2;
        const midY = vh / 2 - (h * midScale) / 2;
        const startScale = heroRect.width / w;
        x = lerp(heroRect.left, midX, t);
        y = lerp(heroRect.top + heroRect.height / 2 - h / 2, midY, t);
        scale = lerp(startScale, midScale, t);
      } else {
        stage = 'docked';
        x = dockRect.left;
        y = dockRect.top;
        scale = dockRect.width / w;
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

      if (stage === 'docked') {
        const centerY = vh / 2;
        let best = 0;
        let bestDist = Infinity;
        document.querySelectorAll('.rows--ledger .row').forEach((row, i) => {
          const r = row.getBoundingClientRect();
          const d = Math.abs((r.top + r.bottom) / 2 - centerY);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        if (best !== lastActive) {
          lastActive = best;
          setActiveFeature(best);
        }
      } else if (lastActive !== -1) {
        lastActive = -1;
        setActiveFeature(-1);
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
    const MAX_TILT = 7;
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
      <PhoneFrame ref={phoneRef} screens={SCREENS} activeIndex={activeFeature} />
    </div>
  );
}
