'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { Theme, ThemePreference } from '@/lib/theme';
import { THEME_STORAGE_KEY } from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  toggleTheme: () => void;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

function systemPrefersLight(): boolean {
  return window.matchMedia('(prefers-color-scheme: light)').matches;
}

function resolve(pref: ThemePreference): Theme {
  return pref === 'system' ? (systemPrefersLight() ? 'light' : 'dark') : pref;
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
  // Native APIs extracted off their object lose the `this` binding they
  // need — calling the bare reference throws "Illegal invocation" (caught
  // below and silently mistaken for "unsupported browser", which is what
  // made every theme switch fall back to the instant swap regardless of
  // support). bind(document) keeps the receiver intact.
  const fn = (document as unknown as { startViewTransition?: StartViewTransition }).startViewTransition;
  return fn ? fn.bind(document) : undefined;
}

/**
 * View Transitions render in the document's top layer, above every normal
 * element regardless of z-index — a plain fixed div cannot paint over the
 * old/new snapshots. The Popover API renders in that same top layer, and
 * (being shown *after* the transition starts) stacks above it, so this is
 * the one reliable way to put a live, independently-animated blade glow
 * over the wipe: a manual popover shown for the transition's duration,
 * with its own plain CSS animation — no view-transition snapshot timing
 * involved at all.
 */
type PopoverEl = HTMLElement & { showPopover?: () => void; hidePopover?: () => void };

function showBlade(el: HTMLElement | null) {
  const p = el as PopoverEl | null;
  if (p?.showPopover) {
    try {
      p.showPopover();
    } catch {
      /* already shown — fine */
    }
  }
  el?.classList.remove('active');
  void el?.offsetWidth;
  el?.classList.add('active');
}

function hideBlade(el: HTMLElement | null) {
  el?.classList.remove('active');
  const p = el as PopoverEl | null;
  if (p?.hidePopover) {
    try {
      p.hidePopover();
    } catch {
      /* already hidden — fine */
    }
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [theme, setTheme] = useState<Theme>('dark');
  const busyRef = useRef(false);
  const bladeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme as Theme | undefined;
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const storedPref: ThemePreference =
      stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    setPreferenceState(storedPref);
    if (current === 'light' || current === 'dark') setTheme(current);
    // `popover` set imperatively rather than as a JSX attribute — avoids
    // depending on this project's exact @types/react version shipping the
    // (fairly recent) typed prop.
    bladeRef.current?.setAttribute('popover', 'manual');
  }, []);

  // While on 'system', track the OS preference live so the site follows it
  // without needing a reload — not just a one-time read at mount.
  useEffect(() => {
    if (preference !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => applyResolved(resolve('system'));
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preference]);

  function applyResolved(next: Theme) {
    document.documentElement.dataset.theme = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#000000' : '#FFFFFF');
    setTheme(next);
  }

  function runTransition(apply: () => void) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = getStartViewTransition();

    if (reduce || !start) {
      apply();
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;

    try {
      // flushSync forces React to commit the theme change synchronously
      // inside the callback, so the API's "after" snapshot is guaranteed to
      // capture the new theme rather than racing React's normal async batch.
      const transition = start(() => {
        flushSync(apply);
      });
      // Top-layer stacking is insertion order: show the popover only after
      // start() has created the transition's own top-layer entry, so the
      // popover's entry lands after it (visually on top). Doing this the
      // other way around — as before — silently buried the glow under the
      // transition's snapshots: it was animating correctly the whole time,
      // just invisibly.
      showBlade(bladeRef.current);
      transition.finished.finally(() => {
        busyRef.current = false;
        hideBlade(bladeRef.current);
      });
    } catch {
      // A native API misbehaving is still not a reason to strand the
      // toggle — fall back to the plain instant swap.
      apply();
      busyRef.current = false;
      hideBlade(bladeRef.current);
    }
  }

  function setPreference(pref: ThemePreference) {
    window.localStorage.setItem(THEME_STORAGE_KEY, pref);
    setPreferenceState(pref);
    const next = resolve(pref);
    if (next === theme) return;
    runTransition(() => applyResolved(next));
  }

  function toggleTheme() {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <ThemeContext.Provider value={{ theme, preference, toggleTheme, setPreference }}>
      {children}
      <div ref={bladeRef} className="theme-blade" aria-hidden="true">
        <span className="theme-blade__line" />
      </div>
    </ThemeContext.Provider>
  );
}
