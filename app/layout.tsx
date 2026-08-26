import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { InkCursor } from '@/components/ink-cursor';
import { TopBar } from '@/components/top-bar';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saizen — anime streaming at the comfort of your phone',
  description:
    'Saizen is a personal iOS anime client. Installable CDN stream modules resolve HLS/MP4 and play in a custom AVPlayer. Sideload only.',
  icons: {
    icon: [
      {
        url:
          'data:image/svg+xml,' +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#000"/><text x="32" y="46" font-size="40" text-anchor="middle" fill="#43FFD2" font-family="serif">最</text></svg>'
          ),
        type: 'image/svg+xml',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
};

const themeScript = `(function(){try{var key=${JSON.stringify(
  THEME_STORAGE_KEY
)};var stored=localStorage.getItem(key);var pref=(stored==='light'||stored==='dark'||stored==='system')?stored:'system';var resolved=pref==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):pref;document.documentElement.dataset.theme=resolved;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout is the correct place for this in App Router; the rule targets the legacy pages/_document.js pattern */}
        <link
          href="https://fonts.googleapis.com/css2?family=Quando&family=Puritan:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <InkCursor />
          <div className="page">
            <TopBar />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
