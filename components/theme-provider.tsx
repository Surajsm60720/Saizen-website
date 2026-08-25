'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
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

/**
 * The old approach was a decorative diagonal gradient div sweeping OVER the
 * page while the actual theme flipped instantly underneath it, hidden by
 * the overlay — a trick, not a real reveal, and it read like one ("a stick
 * moving"). This uses the browser's real View Transitions API instead:
 * `startViewTransition` takes an actual "before" screenshot, runs the
 * callback (which flips the theme), takes an actual "after" screenshot, and
 * composites between them — real GPU-side old/new snapshots, not a hidden
 * instant swap. `theme-wipe-reveal` in globals.css clips the "after"
 * snapshot with an animated diagonal clip-path, so the new theme is
 * genuinely, progressively visible left-of-the-line as it sweeps, not
 * revealed all at once behind a decoration.
 *
 * Graceful, spec-required fallback: browsers without support (feature-
 * detected, not sniffed) just get the instant swap, which — since every
 * themed property already carries its own short CSS transition (body
 * background/color, .btn colors, etc.) — still crossfades on its own, just
 * without the wipe shape. That's the "generic dark/light animation" this
 * degrades to if the native API isn't there, not a broken/static jump.
 */
type StartViewTransition = (callback: () => void) => { finished: Promise<void> };

function getStartViewTransition(): StartViewTransition | undefined {
  return (document as unknown as { startViewTransition?: StartViewTransition }).startViewTransition;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
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
    const start = getStartViewTransition();

    if (reduce || !start) {
      applyTheme(next);
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;

    try {
      // flushSync forces React to commit the theme change synchronously
      // inside the callback, so the API's "after" snapshot is guaranteed to
      // capture the new theme rather than racing React's normal async batch.
      const transition = start(() => {
        flushSync(() => applyTheme(next));
      });
      transition.finished.finally(() => {
        busyRef.current = false;
      });
    } catch {
      // A native API misbehaving is still not a reason to strand the
      // toggle — fall back to the plain instant swap.
      applyTheme(next);
      busyRef.current = false;
    }
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
