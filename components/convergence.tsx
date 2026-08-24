'use client';

import { useEffect, useRef } from 'react';
import { features } from '@/lib/content';

interface Fragment {
  el: HTMLSpanElement;
  startAngle: number;
  startRadius: number;
  delay: number;
  duration: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
}

interface Star {
  cx: number;
  cy: number;
  startAngle: number;
  startRadius: number;
  delay: number;
  duration: number;
  size: number;
  spiralAmt: number;
}

interface BurstDot {
  x: number;
  y: number;
  dx: number;
  dy: number;
  r: number;
}

// Every label is real chip text already shown in the Features section above —
// no placeholders. Flattened here so this stays in sync with lib/content.ts
// automatically rather than duplicating a hand-picked list.
const FRAGMENT_LABELS = features.flatMap((f) => f.chips ?? []);
const STAR_COUNT = 10;

function easeInCubic(t: number) {
  return t * t * t;
}

export function Convergence() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const mark = markRef.current;
    if (!stage || !canvas || !mark) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) {
      mark.classList.add('in');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let frags: Fragment[] = [];
    let stars: Star[] = [];
    let burstDots: BurstDot[] = [];
    let burstStart = 0;
    let burstDone = false;
    let startTime = 0;
    let maxFinish = 0;
    let played = false;

    function sizeCanvas() {
      const r = stage!.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function buildFragments() {
      stage!.querySelectorAll('.conv-frag').forEach((el) => el.remove());
      frags = [];
      const cx = W / 2;
      const cy = H / 2;
      const maxRadius = Math.max(W, H) * 0.7;
      for (let i = 0; i < FRAGMENT_LABELS.length; i++) {
        const angle = (Math.PI * 2 * i) / FRAGMENT_LABELS.length - Math.PI / 2 + (Math.random() * 0.4 - 0.2);
        const radius = maxRadius * (0.35 + Math.random() * 0.65);
        const el = document.createElement('span');
        el.className = 'conv-frag';
        el.textContent = FRAGMENT_LABELS[i];
        stage!.insertBefore(el, mark);
        frags.push({
          el,
          startAngle: angle,
          startRadius: radius,
          delay: i * 45 + Math.random() * 35,
          duration: 1000 + Math.random() * 450,
          cx,
          cy,
          w: 0,
          h: 0,
        });
      }
      frags.forEach((f) => {
        f.w = f.el.offsetWidth;
        f.h = f.el.offsetHeight;
      });
    }

    function buildStars(cx: number, cy: number) {
      stars = [];
      const maxRadius = Math.max(W, H) * 0.85;
      for (let i = 0; i < STAR_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = maxRadius * (0.3 + Math.random() * 0.7);
        stars.push({
          cx,
          cy,
          startAngle: angle,
          startRadius: radius,
          delay: Math.random() * 900,
          duration: 1100 + Math.random() * 600,
          size: 0.7 + Math.random() * 1.5,
          spiralAmt: 0.3 + Math.random() * 1.1,
        });
      }
    }

    function drawStars(elapsed: number, rgb: string) {
      for (const s of stars) {
        const t = (elapsed - s.delay) / s.duration;
        if (t < 0 || t > 1) continue;
        const eased = easeInCubic(t);
        const r = s.startRadius * (1 - eased);
        const spiral = s.startAngle + eased * s.spiralAmt;
        const x = s.cx + Math.cos(spiral) * r;
        const y = s.cy + Math.sin(spiral) * r;
        if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
        const opacity = t < 0.1 ? t / 0.1 : t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 0.32;
        ctx!.beginPath();
        ctx!.arc(x, y, s.size * (1 - eased * 0.3), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${rgb},${opacity})`;
        ctx!.fill();
      }
    }

    function positionFragment(f: Fragment, elapsed: number) {
      let t = (elapsed - f.delay) / f.duration;
      if (t < 0) {
        const x0 = f.cx + Math.cos(f.startAngle) * f.startRadius;
        const y0 = f.cy + Math.sin(f.startAngle) * f.startRadius;
        f.el.style.transform = `translate(${x0 - f.w / 2}px,${y0 - f.h / 2}px)`;
        f.el.style.opacity = '0';
        return false;
      }
      t = Math.min(t, 1);
      const eased = easeInCubic(t);
      const r = f.startRadius * (1 - eased);
      const spiral = f.startAngle + eased * 1.1;
      const x = f.cx + Math.cos(spiral) * r;
      const y = f.cy + Math.sin(spiral) * r;
      const scale = 1 - eased * 0.35;
      const opacity = t < 0.15 ? t / 0.15 : t > 0.8 ? Math.max(0, (1 - t) / 0.2) : 1;
      f.el.style.transform = `translate(${x - f.w / 2}px,${y - f.h / 2}px) scale(${scale})`;
      f.el.style.opacity = String(opacity);
      return t >= 1;
    }

    function spawnBurst(cx: number, cy: number) {
      burstDots = [];
      const n = 40;
      for (let i = 0; i < n; i++) {
        const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
        const dist = 34 + Math.random() * 130;
        burstDots.push({ x: cx, y: cy, dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist, r: 2 + Math.random() * 3.5 });
      }
      burstStart = performance.now();
    }

    function frame(now: number) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;

      ctx!.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const rgb = getComputedStyle(document.documentElement).getPropertyValue('--brush').trim();
      const fallProgress = Math.min(elapsed / maxFinish, 1);
      const glowEase = easeInCubic(fallProgress);
      const glowR = 6 + glowEase * (Math.min(W, H) * 0.22);
      const glowAlpha = 0.05 + glowEase * 0.45;
      const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      grad.addColorStop(0, `rgba(${rgb},${glowAlpha})`);
      grad.addColorStop(1, `rgba(${rgb},0)`);
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx!.fill();

      drawStars(elapsed, rgb);

      let allDone = true;
      for (const f of frags) {
        if (!positionFragment(f, elapsed)) allDone = false;
      }

      if (allDone && elapsed >= maxFinish && !burstDone && burstDots.length === 0) {
        spawnBurst(cx, cy);
      }

      if (burstDots.length) {
        const bElapsed = now - burstStart;
        const life = 480;
        const k = 1 - bElapsed / life;
        if (k > 0) {
          for (const d of burstDots) {
            const travel = 1 - Math.pow(1 - Math.min(bElapsed / life, 1), 2);
            const x = d.x + d.dx * travel;
            const y = d.y + d.dy * travel;
            ctx!.beginPath();
            ctx!.arc(x, y, d.r * k, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(${rgb},${0.7 * k})`;
            ctx!.fill();
          }
        } else if (!burstDone) {
          burstDone = true;
          mark!.classList.add('in');
        }
      }

      if (!burstDone) requestAnimationFrame(frame);
    }

    function playSequence() {
      sizeCanvas();
      buildFragments();
      buildStars(W / 2, H / 2);
      maxFinish = 0;
      frags.forEach((f) => {
        maxFinish = Math.max(maxFinish, f.delay + f.duration);
      });
      stars.forEach((s) => {
        maxFinish = Math.max(maxFinish, s.delay + s.duration);
      });
      startTime = 0;
      burstDots = [];
      burstDone = false;
      requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played) {
            played = true;
            playSequence();
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -20% 0px' }
    );
    observer.observe(stage);

    let resizeTimer: number | undefined;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (played) sizeCanvas();
      }, 150);
    }
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <section className="sec conv">
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-jp">統合</p>
          <h2 className="sec-title">Every piece, one build</h2>
          <p className="sec-lede">
            Modules, player, downloads, accounts, security — everything above compiles into one binary you sideload
            once.
          </p>
        </div>
        <div className="conv-stage" ref={stageRef}>
          <canvas className="conv-canvas" ref={canvasRef} aria-hidden="true" />
          <div className="conv-mark" ref={markRef} aria-hidden="true">
            <p className="kanji">最善</p>
            <p className="word">SAIZEN</p>
          </div>
        </div>
      </div>
    </section>
  );
}
