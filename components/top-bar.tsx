import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { GlassSurface } from './glass-surface';

export function TopBar() {
  return (
    <GlassSurface as="header" className="top">
      <div className="wrap">
        <Link className="mark" href="#top">
          <span className="kanji">最善</span>
          <span>SAIZEN</span>
        </Link>
        <span className="ver">v1.4.2</span>
        <ThemeToggle />
      </div>
    </GlassSurface>
  );
}
