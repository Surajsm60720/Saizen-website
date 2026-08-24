'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Theme } from '@/lib/theme';
import { THEME_STORAGE_KEY } from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const overlayRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const current = document.documentElement.dataset.theme as Theme | undefined;
    if (current === 'light' || current === 'dark') setTheme(current);
  }, []);

  function applyTheme(next: Theme) {
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#000000' : '#FFFFFF');
    setTheme(next);
  }

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const overlay = overlayRef.current;

    if (reduce || !overlay) {
      applyTheme(next);
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;

    overlay.classList.remove('cut');
    void overlay.offsetWidth;
    overlay.classList.add('cut');

    // Matches the 900ms .slashfx.cut animation in globals.css — swap at ~40%
    // of total duration (360ms), clear busy shortly after it finishes (920ms).
    window.setTimeout(() => applyTheme(next), 360);
    window.setTimeout(() => {
      overlay.classList.remove('cut');
      busyRef.current = false;
    }, 920);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div ref={overlayRef} className="slashfx" aria-hidden="true" />
      {children}
    </ThemeContext.Provider>
  );
}
