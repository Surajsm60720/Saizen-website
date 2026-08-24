'use client';

import { useEffect, useRef } from 'react';

interface RevealSectionProps {
  alt?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function RevealSection({ alt = false, className = '', children }: RevealSectionProps) {
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

  const classes = ['sec', alt ? 'sec-alt' : '', 'rv', className].filter(Boolean).join(' ');

  return (
    <section ref={ref} className={classes}>
      {children}
    </section>
  );
}
