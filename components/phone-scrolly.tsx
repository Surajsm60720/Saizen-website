'use client';

import { useEffect, useRef, useState } from 'react';
import { PhoneFrame, type IntroShot, type PhoneScreen, type PhoneScreenKind, type ScreenMedia } from './phone-frame';
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

// Real device captures (public/media/), keyed by the feature's own `en`
// name so a reordering of lib/content.ts's features array can't silently
// mismatch a screen with the wrong footage. Video vs. image per feature
// was picked by whether the feature's value is fundamentally about
// motion (a carousel, a live-dragged slider, a menu opening) or about
// layout/information a still frame already reads fine — see the
// mobile-experience discussion this asset set came out of.
const FEATURE_MEDIA: Record<string, ScreenMedia> = {
  Browse: { kind: 'video', src: '/media/browse.mp4', poster: '/media/browse-poster.webp' },
  Search: { kind: 'video', src: '/media/search.mp4', poster: '/media/search-poster.webp' },
  Detail: { kind: 'image', src: '/media/detail.webp' },
  Schedule: { kind: 'image', src: '/media/schedule.webp' },
  Player: { kind: 'video', src: '/media/player.mp4', poster: '/media/player-poster.webp' },
  Downloads: { kind: 'image', src: '/media/downloads.webp' },
  Accounts: { kind: 'image', src: '/media/accounts.webp' },
  Incognito: { kind: 'image', src: '/media/incognito.webp' },
  Appearance: { kind: 'video', src: '/media/appearance.mp4', poster: '/media/appearance-poster.webp' },
};

const SCREENS: PhoneScreen[] = features.map((feature, i) => ({
  label: feature.en,
  color: COLORS[i % COLORS.length],
  media: FEATURE_MEDIA[feature.en] ?? { kind: 'image', src: '/media/detail.webp' },
}));

// The opening tour, before any named feature — Home, then a title's
// Detail page, then the Player — three real captures instead of a
// generic label. Each gets an equal slice of the intro zone's scroll, so
// the count here and #phone-intro-zone's height together decide how long
// each one holds.
const INTRO_SHOTS: IntroShot[] = [
  { label: 'Home', src: '/media/intro-1.webp' },
  { label: 'Detail', src: '/media/intro-2.webp' },
  { label: 'Player', src: '/media/intro-3.webp' },
];

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

type Stage = 'hero' | 'intro' | 'docked' | 'tagline' | 'gone';

/**
 * Five stages, each owning a stretch of the page:
 *
 *   hero     phone rests in the hero's reserved slot, showing the splash
 *   intro    #phone-intro-zone — tall and empty, so the phone parks dead
 *            centre for its whole length while the screen steps through
 *            INTRO_SHOTS, one per equal slice of that scroll
 *   docked   Features — phone sits on the right rail, screen following
 *            whichever row is nearest viewport centre
 *   tagline  #phone-tagline-zone — centre again; its three lines build up
 *            as scroll continues rather than firing together on a timer
 *   gone     faded out before Install/Convergence/Footer, untouched
 *
 * Two different mechanisms on purpose. *Which* stage is current comes
 * from plain threshold checks against the viewport's vertical centre, and
 * the move between stages is one fixed-duration CSS transition on
 * .phone-fly — so a handoff always takes the same ~0.6s no matter how
 * fast the page is scrolled, rather than smearing across whatever
 * distance separates two sections (the old scroll-scrubbed lerp, which is
 * what made the phone linger over content it didn't belong on).
 *
 * *Within* the intro and tagline stages the phone doesn't move at all —
 * it's parked, and scrolling advances content instead of position. That's
 * what makes those zones read as pinned sequences the reader scrubs
 * through rather than dead space they scroll past.
 */
export function PhoneScrolly() {
  const flyRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(-1);
  const [introIndex, setIntroIndex] = useState(0);
  const [taglineLines, setTaglineLines] = useState(0);
  const [screenKind, setScreenKind] = useState<PhoneScreenKind>('idle');
  const sizeRef = useRef({ w: 272, h: 558 });
  const stageRef = useRef<Stage>('hero');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wide = window.matchMedia('(min-width: 1100px)').matches;
    const fly = flyRef.current;
    const phone = phoneRef.current;
    if (reduce || !fly || !phone) {
      if (fly) fly.style.opacity = '0';
      return;
    }

    if (!wide) {
      // ---- Mobile / tablet path (<1100px) ----
      // No hero stage at all — the phone doesn't exist until the
      // hero/features boundary, then stays pinned to one spot for each
      // stage's whole duration (intro shots, then a per-feature step,
      // then the tagline) rather than travelling between a hero slot and
      // a side rail. Position/size ARE still written imperatively every
      // tick (like desktop), just computed from the live viewport and
      // the feature card's real measured bottom edge rather than fixed
      // percentages — a fixed CSS scale also turned out to be Firefox's
      // undoing (see the removed <1099px rule's history): dividing two
      // different-unit lengths inside scale() is invalid there and drops
      // the whole transform, and separately, fixed vh-based numbers for
      // both the card and the phone could drift out of sync on unusual
      // viewport heights. Measuring the card directly makes "never
      // overlaps" a guarantee instead of two formulas hoped to agree.
      //
      // Also why there's no screenStage/moveTimer lag here: that exists
      // on desktop purely to hold outgoing content until the phone
      // physically arrives at a new x/y slot. The mobile phone never
      // moves within a stage, so there's no arrival to wait for —
      // content is driven straight off `stage`.
      let mQueued = false;
      let mLastKind: PhoneScreenKind | null = null;
      let mLastActive = -2;
      let mLastIntro = -1;
      let mLastTaglineLines = -1;
      let mTaglineEntryTop: number | null = null;

      function mobileTick() {
        mQueued = false;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const introZone = document.getElementById('phone-intro-zone');
        const featZone = document.getElementById('phone-features-zone-m');
        const tagZone = document.getElementById('phone-tagline-zone');
        const cardEl = document.querySelector<HTMLElement>('.phone-card-m');
        if (!introZone || !featZone || !tagZone || !fly) return;

        const introRect = introZone.getBoundingClientRect();
        const featRect = featZone.getBoundingClientRect();
        const tagRect = tagZone.getBoundingClientRect();

        // Same shape as the desktop stage checks: each boundary uses
        // whichever line guarantees the phone/card are never shown over
        // content they don't belong on.
        //
        // 'arriving' is the stretch between the intro shots finishing and
        // the features spacer's own top clearing the viewport — Features'
        // "What is in the build" heading sits directly above that spacer
        // and needs to scroll fully away first. The phone used to hold
        // the last intro shot through that whole stretch, but the heading
        // is tall enough (with body copy under it) that it kept scrolling
        // up into the still-visible phone. Simpler and matches what was
        // asked for: fade out for that stretch, fade back in once the
        // feature card genuinely has room, rather than trying to hold a
        // position that a variable-height heading can still collide with.
        const fadeLead = vh * 0.5;
        let stage: 'pre' | 'intro' | 'arriving' | 'features' | 'tagline' | 'gone';
        if (tagRect.bottom <= vh + fadeLead) stage = 'gone';
        else if (introRect.top > 0) stage = 'pre';
        else if (introRect.bottom > vh) stage = 'intro';
        else if (featRect.top > 0) stage = 'arriving';
        else if (featRect.bottom > vh) stage = 'features';
        else stage = 'tagline';

        const hidden = stage === 'pre' || stage === 'arriving' || stage === 'gone';
        fly.style.opacity = hidden ? '0' : '1';

        if (!hidden) {
          // Fill whatever room is actually available: from just below the
          // feature card (when one is showing) or a small top margin
          // (intro, tagline — no card competing for space) down to near
          // the bottom of the viewport. Capped at the phone's native
          // 272x558 so it never scales up past desktop's own size on a
          // tall/narrow viewport, and width-capped separately so a
          // short-but-wide viewport doesn't blow it out sideways.
          const topLimit = stage === 'features' && cardEl ? cardEl.getBoundingClientRect().bottom + 14 : vh * 0.07;
          const available = Math.max(vh - topLimit - 16, 160);
          let h = Math.min(available * 0.96, 558);
          let w = h * (272 / 558);
          const maxW = vw * 0.86;
          if (w > maxW) {
            w = maxW;
            h = w * (558 / 272);
          }
          const scale = h / 558;
          const x = vw / 2 - w / 2;
          fly.style.transform = `translate(${x}px, ${topLimit}px) scale(${scale})`;
        }

        let kind: PhoneScreenKind = stage === 'gone' ? mLastKind ?? 'idle' : 'idle';
        let activeIdx = stage === 'gone' ? mLastActive : -1;
        let introIdx = mLastIntro < 0 ? 0 : mLastIntro;

        if (stage === 'intro') {
          kind = 'intro';
          const span = introRect.height - vh;
          const p = clamp(-introRect.top / (span || 1), 0, 0.999999);
          introIdx = Math.floor(p * INTRO_SHOTS.length);
        } else if (stage === 'features') {
          kind = 'feature';
          const span = featRect.height - vh;
          const p = clamp(-featRect.top / (span || 1), 0, 0.999999);
          activeIdx = Math.floor(p * SCREENS.length);
        } else if (stage === 'tagline') {
          kind = 'tagline';
        }

        // Same entry-anchored progress as desktop's tagline reveal (see
        // that block's comment) — without it, the reveal is measured from
        // raw scroll position while the container's own CSS opacity fade
        // (gated by the screenKind state update below) ramps in on its
        // own separate clock, so the lines can already look mostly or
        // fully revealed the moment the text is actually visible.
        let taglineLines = 0;
        if (stage === 'tagline') {
          if (mTaglineEntryTop === null) mTaglineEntryTop = tagRect.top;
          const activeSpan = tagRect.height - vh;
          const p = clamp((mTaglineEntryTop - tagRect.top) / (activeSpan * 0.6 || 1), 0, 1);
          taglineLines = p < 0.15 ? 0 : p < 0.45 ? 1 : p < 0.75 ? 2 : 3;
        } else {
          mTaglineEntryTop = null;
        }

        if (kind !== mLastKind || activeIdx !== mLastActive || introIdx !== mLastIntro || taglineLines !== mLastTaglineLines) {
          mLastKind = kind;
          mLastActive = activeIdx;
          mLastIntro = introIdx;
          mLastTaglineLines = taglineLines;
          setScreenKind(kind);
          setActiveFeature(activeIdx);
          setIntroIndex(introIdx);
          setTaglineLines(taglineLines);
        }
      }

      function onMobileScroll() {
        if (mQueued) return;
        mQueued = true;
        requestAnimationFrame(mobileTick);
      }

      window.addEventListener('scroll', onMobileScroll, { passive: true });
      window.addEventListener('resize', onMobileScroll);
      mobileTick();

      return () => {
        window.removeEventListener('scroll', onMobileScroll);
        window.removeEventListener('resize', onMobileScroll);
      };
    }

    // ---- Desktop path (>=1100px) ----
    // Natural (unscaled) size of the rendered phone, read once — avoids
    // hardcoding a size that could drift from the actual CSS.
    const rect = fly.getBoundingClientRect();
    if (rect.width && rect.height) sizeRef.current = { w: rect.width, h: rect.height };

    let queued = false;
    let lastActive = -2;
    let lastIntro = -1;
    let lastTaglineLines = -1;
    let lastKind: PhoneScreenKind | null = null;
    let lastStage: Stage | null = null;
    // Held back until the entrance timer below fires — the phone's
    // *position* is still set correctly on the very first tick (so it
    // never jumps once visible), only its opacity stays at 0 until then,
    // so the reveal is a deliberate fade-in rather than the phone just
    // appearing the instant JS mounts.
    let entered = false;
    // What the *screen* is showing, which trails `stage` whenever the
    // phone has to physically travel: the content belongs to where the
    // phone is going, so swapping it the moment the stage flips showed
    // e.g. the Browse capture while the phone was still mid-flight from
    // the centre, before Features had even arrived. It holds the outgoing
    // stage's content for the length of the move instead.
    let screenStage: Stage = 'hero';
    let moveTimer: ReturnType<typeof setTimeout> | undefined;
    // tagRect.top captured the first tick screenStage becomes 'tagline' —
    // the reveal's own zero point. Anchoring to raw scroll position instead
    // let the move-lag delay above eat into the reveal before the text was
    // even visible, so the lines were already mostly (or fully) revealed
    // the instant the container finished fading in.
    let taglineEntryTop: number | null = null;
    // Matches .phone-fly's transform transition in globals.css, plus a
    // little slack so the swap lands after the phone has settled.
    const MOVE_MS = 640;
    // Where each stage parks the phone — a stage change only counts as a
    // move (and so only delays the screen swap) if this differs.
    const slotOf = (s: Stage) => (s === 'hero' ? 'hero' : s === 'docked' ? 'rail' : 'centre');

    function tick() {
      queued = false;
      const w = sizeRef.current.w;
      const h = sizeRef.current.h;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const mid = vh / 2;

      const heroAnchor = document.getElementById('hero-phone-anchor');
      const dockAnchor = document.getElementById('dock-phone-anchor');
      const introZone = document.getElementById('phone-intro-zone');
      const taglineZone = document.getElementById('phone-tagline-zone');
      if (!heroAnchor || !dockAnchor || !introZone || !taglineZone || !fly) return;

      const heroRect = heroAnchor.getBoundingClientRect();
      const dockRect = dockAnchor.getBoundingClientRect();
      const introRect = introZone.getBoundingClientRect();
      const tagRect = taglineZone.getBoundingClientRect();

      // Which zone owns the phone. Checked in page order and mutually
      // exclusive, so this is monotonic on the way down and reverses
      // cleanly on the way back up.
      //
      // Every boundary is set so the phone is never over content it
      // doesn't belong on, which means each one uses a different line:
      //
      //  - It leaves the hero only once the hero is *entirely* past the
      //    viewport top (introRect.top <= 0). Handing off at the centre
      //    line instead put the centred phone straight over the hero's
      //    still-visible CTA row and note.
      //  - It leaves the centre before an incoming content section is on
      //    screen at all (that section's top still down at vh), which
      //    also gives the 0.6s move runway to finish before the section's
      //    heading arrives.
      //  - The exit gets extra lead again, because unlike the others it
      //    fades in place rather than moving out of the column — the fade
      //    has to *finish* while Install is still below the fold.
      const fadeLead = vh * 0.5;
      let stage: Stage;
      if (tagRect.bottom <= vh + fadeLead) {
        stage = 'gone';
      } else if (introRect.top > 0) {
        stage = 'hero';
      } else if (introRect.bottom > vh) {
        stage = 'intro';
      } else if (tagRect.top > mid) {
        stage = 'docked';
      } else {
        stage = 'tagline';
      }

      let x: number;
      let y: number;
      let scale: number;

      if (stage === 'hero') {
        x = heroRect.left;
        y = heroRect.top + heroRect.height / 2 - h / 2;
        scale = heroRect.width / w;
      } else if (stage === 'docked') {
        // Fixed vertical-centre target, not dockAnchor's own (sticky) top
        // — sticky elements drift near the end of their containing block
        // as the browser releases them, which has no bearing on where the
        // phone should sit. Only its left edge is read from the anchor.
        x = dockRect.left;
        y = mid - h / 2;
        scale = 1;
      } else {
        // intro, tagline and gone all park dead centre.
        x = vw / 2 - w / 2;
        y = mid - h / 2;
        scale = 1;
      }

      fly.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      fly.style.opacity = stage === 'gone' || !entered ? '0' : '1';
      if (stage !== 'hero') {
        phone!.style.setProperty('--rx', '0deg');
        phone!.style.setProperty('--ry', '0deg');
      }

      // Hand the screen over only once the phone has finished travelling
      // to this stage's slot; until then it keeps showing the outgoing
      // stage's content (see screenStage above).
      if (stage !== lastStage) {
        if (moveTimer) clearTimeout(moveTimer);
        if (lastStage !== null && slotOf(stage) !== slotOf(lastStage)) {
          moveTimer = setTimeout(() => {
            screenStage = stage;
            tick();
          }, MOVE_MS);
        } else {
          screenStage = stage;
        }
      }

      // 'gone' deliberately holds whatever was last showing instead of
      // falling back to the splash: the fade-out is a transition, so
      // swapping the screen at the same moment made the splash flash into
      // view on the way out.
      let kind: PhoneScreenKind = screenStage === 'gone' ? lastKind ?? 'idle' : 'idle';
      let activeIdx = screenStage === 'gone' ? lastActive : -1;
      let introIdx = lastIntro < 0 ? 0 : lastIntro;

      if (screenStage === 'intro') {
        kind = 'intro';
        // 0 as the intro zone's top clears the viewport, 1 at the handoff
        // to Features — the exact span over which this stage is current
        // (see the stage checks above), split into one slice per shot.
        const span = introRect.height - vh;
        const p = clamp(-introRect.top / (span || 1), 0, 0.999999);
        introIdx = Math.floor(p * INTRO_SHOTS.length);
      } else if (screenStage === 'docked') {
        kind = 'feature';
        let best = 0;
        let bestDist = Infinity;
        document.querySelectorAll('.rows--ledger .row').forEach((row, i) => {
          const r = row.getBoundingClientRect();
          const d = Math.abs((r.top + r.bottom) / 2 - mid);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        activeIdx = best;
      } else if (screenStage === 'tagline') {
        kind = 'tagline';
      }

      // The tagline's three lines build up as the reader keeps scrolling,
      // rather than all popping in together on a fixed timer the instant
      // the stage flips — tied to actual scroll position the same way
      // the intro shots are, just accumulating instead of replacing.
      // Gated on `screenStage` (not raw `stage`, which flips as soon as
      // the phone enters this zone, before the screen content or the
      // container's own fade-in have caught up) and measured from the
      // entry point captured below, so progress starts at 0 exactly when
      // the tagline text is first visible, not sometime during the move.
      let taglineLines = 0;
      if (screenStage === 'tagline') {
        if (taglineEntryTop === null) taglineEntryTop = tagRect.top;
        // Same shape as the intro span (zone height minus one viewport —
        // the scroll this stage actually owns, per the boundary math
        // above), but only 60% of it drives the reveal, measured from the
        // entry point captured above rather than from raw scroll position:
        // finishing there instead of at the very end leaves a real pause
        // with the full line visible before the exit fade starts, rather
        // than the third line landing right as it's about to disappear
        // again.
        const activeSpan = tagRect.height - vh;
        const p = clamp((taglineEntryTop - tagRect.top) / (activeSpan * 0.6 || 1), 0, 1);
        taglineLines = p < 0.15 ? 0 : p < 0.45 ? 1 : p < 0.75 ? 2 : 3;
      } else {
        taglineEntryTop = null;
      }

      if (kind !== lastKind || activeIdx !== lastActive || introIdx !== lastIntro || taglineLines !== lastTaglineLines) {
        lastKind = kind;
        lastActive = activeIdx;
        lastIntro = introIdx;
        lastTaglineLines = taglineLines;
        setScreenKind(kind);
        setActiveFeature(activeIdx);
        setIntroIndex(introIdx);
        setTaglineLines(taglineLines);
      }
      lastStage = stage;
      stageRef.current = stage;
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    tick();

    // Entrance: position is already correct from the tick() above, but
    // opacity stays 0 until this fires — timed to land alongside the
    // hero's own staggered text (lede/CTA are still popping in around
    // here), so the phone reads as part of that same entrance beat
    // instead of just appearing the instant the page finishes hydrating.
    const enterTimer = setTimeout(() => {
      entered = true;
      tick();
    }, 550);

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
    // hero slot — elsewhere its position is already transitioning, and
    // reacting to the whole window's pointer position there would just
    // look jittery rather than responsive.
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
      clearTimeout(enterTimer);
      if (moveTimer) clearTimeout(moveTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      ro?.disconnect();
    };
  }, []);

  return (
    <>
      <div className="phone-fly" ref={flyRef} aria-hidden="true">
        <PhoneFrame
          ref={phoneRef}
          screens={SCREENS}
          introShots={INTRO_SHOTS}
          introIndex={introIndex}
          activeIndex={activeFeature}
          taglineLines={taglineLines}
          screenKind={screenKind}
        />
      </div>
      {/* Mobile/tablet only (see .phone-card-m's <1100px rule) — the
          title+body pinned above the phone while it steps through each
          feature. Desktop shows this same information via the ledger
          rows instead, so this stays hidden there. */}
      <div className="phone-card-m" aria-hidden="true">
        {features.map((feature, index) => (
          <div
            key={feature.en}
            className={`phone-card-m__item${screenKind === 'feature' && index === activeFeature ? ' is-shown' : ''}`}
          >
            <p className="phone-card-m__eyebrow">
              <span className="idx">{String(index + 1).padStart(2, '0')}</span> {feature.en}
            </p>
            <h3>{feature.title}</h3>
            <p className="phone-card-m__body">{feature.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
