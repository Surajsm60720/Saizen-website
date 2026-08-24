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
