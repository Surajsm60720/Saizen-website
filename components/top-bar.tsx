import Link from 'next/link';
import { APP_VERSION } from '@/lib/app-version';
import { ThemeSwitcher } from './theme-switcher';
import { GlassSurface } from './glass-surface';

export function TopBar() {
  return (
    <GlassSurface as="header" className="top">
      <div className="wrap">
        <Link className="mark" href="#top">
          Saizen
        </Link>
        <span className="ver">v{APP_VERSION}</span>
        <ThemeSwitcher />
      </div>
    </GlassSurface>
  );
}
