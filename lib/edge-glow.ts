'use client';

import { useEffect, useRef } from 'react';

/**
 * Ported from React Bits' BorderGlow (edge-proximity + cursor-angle math,
 * unmodified). Drives two CSS custom properties on the ref'd element:
 * --edge-proximity (0 at center, 100 at the boundary) and --cursor-angle
 * (which direction the cursor currently is). The CSS in globals.css turns
 * those into a directional glow that only lights up near whichever edge
 * the cursor is closest to.
 */
export function useEdgeGlow<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function edgeProximity(w: number, h: number, x: number, y: number) {
      const cx = w / 2;
      const cy = h / 2;
      const dx = x - cx;
      const dy = y - cy;
      let kx = Infinity;
      let ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    }

    function cursorAngle(w: number, h: number, x: number, y: number) {
      const cx = w / 2;
      const cy = h / 2;
      const dx = x - cx;
      const dy = y - cy;
      if (dx === 0 && dy === 0) return 0;
      let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (deg < 0) deg += 360;
      return deg;
    }

    function onPointerMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el!.style.setProperty('--edge-proximity', (edgeProximity(r.width, r.height, x, y) * 100).toFixed(3));
      el!.style.setProperty('--cursor-angle', cursorAngle(r.width, r.height, x, y).toFixed(3) + 'deg');
    }

    function onPointerLeave() {
      el!.style.setProperty('--edge-proximity', '0');
    }

    el.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return ref;
}
