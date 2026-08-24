'use client';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'LIGHT' : 'DARK';

  return (
    <button type="button" className="toggle" onClick={toggleTheme} aria-label="Switch colour theme">
      <span className="blade" aria-hidden="true" />
      <span suppressHydrationWarning>{label}</span>
    </button>
  );
}
