import Link from 'next/link';
import { ThemeSwitcher } from './theme-switcher';
import { GlassSurface } from './glass-surface';

export function TopBar() {
  return (
    <GlassSurface as="header" className="top">
      <div className="wrap">
        <Link className="mark" href="#top">
          Saizen
        </Link>
        <span className="ver">v1.4.2</span>
        <ThemeSwitcher />
      </div>
    </GlassSurface>
  );
}
