'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

interface RevealRowProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Same IntersectionObserver pattern as RevealSection, but per-row instead
 * of per-section: each row gets its own `.in` when IT scrolls into view,
 * not when the section as a whole does. Without this, all nine rows'
 * cuts/pops fired together the moment Features appeared — visually a
 * cascade, but all triggered by one shared scroll moment rather than each
 * row actually reacting to being scrolled to.
 */
export function RevealRow({ className = '', style, children }: RevealRowProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      el.classList.add('in');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <article ref={ref} className={className} style={style}>
      {children}
    </article>
  );
}
