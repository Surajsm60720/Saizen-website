export interface Feature {
  en: string;
  title: string;
  body: string;
  chips?: string[];
}

export const features: Feature[] = [
  {
    en: 'Browse',
    title: 'Home that fills in once you sign in',
    body: 'Discover rails with a View more link into Search filters, continue watching, and list-backed shelves after AniList or MAL sign-in. Personalised rails paint from cache first, then refresh in the background.',
    chips: ['Hero carousel', 'Prequels & sequels', 'Genre picks', 'Continue watching'],
  },
  {
    en: 'Search',
    title: 'Filter, not a detour',
    body: 'Search by title, then narrow with the Filters sheet. Open an anime, come back, and the session is still there. The keyboard hides the tab bar instead of fighting it.',
    chips: ['Genre', 'Year', 'Season', 'Format', 'Status', 'Sort', 'In my list'],
  },
  {
    en: 'Detail',
    title: 'The whole franchise, in order',
    body: 'Character, VA and staff rails with their own pages. Relations laid out as a watch order rather than a flat list. Edit your list entry without leaving the page, and tap an OP or ED title to copy it.',
    chips: ['Watch-order relations', 'Continue watching EP xx', 'OP/ED song names', 'Manga detail for relations'],
  },
  {
    en: 'Schedule',
    title: 'A week of airings in device-local time',
    body: 'The Schedule tab shows what airs when, switchable between your list and the current season — no mental timezone maths.',
  },
  {
    en: 'Player',
    title: 'Built for how episodes are watched',
    body: 'Custom AVPlayer chrome for CDN HLS and MP4. AniSkip marks openings and endings, then offers a Skip pill or skips them for you.',
    chips: ['±10s / play / next', 'Double- and triple-tap seek', 'Speed & aspect', 'AniSkip OP/ED', 'Optional auto-skip'],
  },
  {
    en: 'Downloads',
    title: 'A queue that holds up',
    body: 'Pause, resume and cancel stay responsive while native work runs off the bridge thread. HTTP downloads report speed and bytes; HLS reports percent rather than inventing a total. Clear cache sweeps orphaned and partial packs.',
    chips: ['Batch Save', 'Lock-screen progress', 'Offline library playback'],
  },
  {
    en: 'Accounts',
    title: 'AniList and MyAnimeList, both ways',
    body: 'Sign in once and your lists drive Home. Tokens live in the Keychain and nowhere else. Deleting an entry clears continue-watching without a restart.',
  },
  {
    en: 'Incognito',
    title: 'Watch without leaving a trail',
    body: 'Flip Incognito on to pause list sync and Home continue. Session resume clears when you leave it. Downloads already on disk stay put.',
  },
  {
    en: 'Appearance',
    title: 'Chrome you can tune',
    body: 'An icon-only frosted tab bar with drag-to-scrub selection across Home, Search, Schedule and More. Settings → Appearance controls the accent colour plus tab bar and top chrome transparency, with an optional Frosted blur.',
    chips: ['Puritan + Quando type', 'Transparency slider', 'Frosted blur'],
  },
];

