import type { CSSProperties } from 'react';
import { GlassSurface } from './glass-surface';

// Custom property for the pop-in stagger delay — cast since CSSProperties
// doesn't type arbitrary custom properties.
function popDelay(ms: number): CSSProperties {
  return { '--d': `${ms}ms` } as CSSProperties;
}

// No trailing spaces — spacing between words comes from .tagline's flex gap,
// not source whitespace (JSX renders these siblings with none) or a space
// baked into the text (unreliable inside inline-block across browsers).
const TAGLINE_WORDS: { text: string; delay: number; accent?: boolean }[] = [
  { text: 'Anime', delay: 420 },
  { text: 'streaming', delay: 475 },
  { text: 'at', delay: 530 },
  { text: 'the', delay: 585 },
  { text: 'comfort', delay: 640 },
  { text: 'of', delay: 695 },
  { text: 'your', delay: 750, accent: true },
  { text: 'phone.', delay: 805, accent: true },
];

export function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-grid">
        <div className="hero-content">
        <p className="eyebrow">
          <span className="mask">
            <span className="pop" style={popDelay(0)}>
              Personal iOS anime client
            </span>
          </span>
        </p>
        <div className="lockup">
          <h1 className="kanji-xl">
            <span className="mask">
              <span className="pop" style={popDelay(130)}>
                最善
              </span>
            </span>
          </h1>
          <div>
            <p className="wordmark">
              <span className="mask">
                <span className="pop" style={popDelay(220)}>
                  Saizen
                </span>
              </span>
            </p>
            <p className="reading">
              <span className="mask">
                <span className="pop" style={popDelay(310)}>
                  sai・zen — the optimal
                </span>
              </span>
            </p>
          </div>
        </div>
        <p className="tagline">
          {TAGLINE_WORDS.map((word) => (
            <span className="mask" key={word.text}>
              <span className={`pop${word.accent ? ' accent' : ''}`} style={popDelay(word.delay)}>
                {word.text}
              </span>
            </span>
          ))}
        </p>
        <p className="lede">
          <span className="mask block">
            <span className="pop" style={popDelay(900)}>
              Install stream modules, sign in with AniList or MyAnimeList in a player built for the way anime
              actually gets released. Everything runs on your device.
            </span>
          </span>
        </p>
        <div className="cta">
          <span className="mask" style={{ borderRadius: 24 }}>
            <span className="pop" style={popDelay(1030)}>
              <GlassSurface
                as="a"
                className="btn btn-solid"
                href="https://github.com/Surajsm60720/Saizen/releases"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="label">Get the IPA</span>
              </GlassSurface>
            </span>
          </span>
          <span className="mask" style={{ borderRadius: 24 }}>
            <span className="pop" style={popDelay(1100)}>
              <GlassSurface
                as="a"
                className="btn btn-ghost"
                href="https://github.com/Surajsm60720/Saizen"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="label">Read the source</span>
              </GlassSurface>
            </span>
          </span>
        </div>
        <p className="hero-note">
          <span className="mask">
            <span className="pop" style={popDelay(1200)}>Next.js + Capacitor 7 + Swift</span>
          </span>
          <span className="mask">
            <span className="pop" style={popDelay(1230)}>·</span>
          </span>
          <span className="mask">
            <span className="pop" style={popDelay(1260)}>iOS 15+</span>
          </span>
          <span className="mask">
            <span className="pop" style={popDelay(1290)}>·</span>
          </span>
          <span className="mask">
            <span className="pop" style={popDelay(1320)}>Sideload only — no App Store build</span>
          </span>
        </p>
        </div>
        {/* Reserves the phone's resting footprint — the real phone is a
            single `position: fixed` element (PhoneScrolly) that reads this
            slot's rect to dock here, then flies on toward Features as the
            page scrolls, rather than being rendered inside Hero itself. */}
        <div className="hero-device" id="hero-phone-anchor" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
