'use client';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button type="button" className="toggle" onClick={toggleTheme} aria-label={label}>
      <span className="blade" aria-hidden="true" />
    </button>
  );
}
