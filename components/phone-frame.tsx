import { forwardRef, type CSSProperties } from 'react';

export type ScreenMedia = { kind: 'image'; src: string } | { kind: 'video'; src: string; poster: string };

export interface PhoneScreen {
  label: string;
  color: string;
  media: ScreenMedia;
}

export interface IntroShot {
  label: string;
  src: string;
}

export type PhoneScreenKind = 'idle' | 'intro' | 'feature' | 'tagline';

const TAGLINE_LINES = ["The anime you’re watching,", 'now at the comfort of', 'your phone.'];

interface PhoneFrameProps {
  screens: PhoneScreen[];
  introShots: IntroShot[];
  introIndex: number;
  activeIndex: number;
  taglineLines: number;
  screenKind: PhoneScreenKind;
}

/**
 * Presentational only — the hyper-realistic titanium/glass recipe from the
 * artifact (layered gradients for the bezel, a screen-blended sheen, a
 * radial-gradient dynamic-island glint), no PNG asset. Positioning and
 * pointer-tilt live in the parent (PhoneScrolly).
 *
 * Four screen states, crossfaded via `screenKind` plus the relevant index:
 * idle (the launch splash, while resting in the hero), intro (the
 * scroll-stepped opening captures), feature (one per Features row) and
 * tagline (the closing line, echoing the hero's own — its three lines
 * build up as `taglineLines` climbs with continued scroll, not on a
 * fixed timer). Real device screenshots/recordings (`public/media/`),
 * cropped to drop the system status bar and object-fit: cover'd to the
 * screen's aspect ratio — a bottom scrim keeps the `tag` caption legible
 * over busy content. Portrait only, no landscape flip.
 */
export const PhoneFrame = forwardRef<HTMLDivElement, PhoneFrameProps>(function PhoneFrame(
  { screens, introShots, introIndex, activeIndex, taglineLines, screenKind },
  ref
) {
  return (
    <div className="phone" ref={ref}>
      {/* Side faces give the body real thickness under the tilt — plain
          rotateY(90deg) slivers, siblings of the (clipped) screen rather
          than children of it, so they can't collide with the
          overflow:hidden + preserve-3d combo that caused the leak. */}
      <span className="phone__edge phone__edge--right" aria-hidden="true" />
      <span className="phone__edge phone__edge--left" aria-hidden="true" />
      <span className="phone__btn phone__btn--action" aria-hidden="true" />
      <span className="phone__btn phone__btn--vol-up" aria-hidden="true" />
      <span className="phone__btn phone__btn--vol-down" aria-hidden="true" />
      <span className="phone__btn phone__btn--power" aria-hidden="true" />
      <div className="phone__screen">
        <div className={`phone__placeholder${screenKind === 'idle' ? ' is-shown' : ''}`}>
          <span className="phone__glow" aria-hidden="true" />
          <span className="phone__mark">最</span>
        </div>
        {introShots.map((shot, index) => (
          <div
            key={shot.label}
            className={`phone__shot${screenKind === 'intro' && index === introIndex ? ' is-shown' : ''}`}
          >
            <img className="phone__media" src={shot.src} alt="" loading="lazy" />
            <span className="tag">{shot.label}</span>
          </div>
        ))}
        {screens.map((screen, index) => (
          <div
            key={screen.label}
            className={`phone__feature${screenKind === 'feature' && index === activeIndex ? ' is-shown' : ''}`}
            style={{ '--fc': screen.color } as CSSProperties}
          >
            {screen.media.kind === 'video' ? (
              <video
                className="phone__media"
                src={screen.media.src}
                poster={screen.media.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="none"
              />
            ) : (
              <img className="phone__media" src={screen.media.src} alt="" loading="lazy" />
            )}
            <span className="tag">{screen.label}</span>
          </div>
        ))}
        <div className={`phone__tagline${screenKind === 'tagline' ? ' is-shown' : ''}`}>
          <p>
            {/* Designed line breaks, not left to reflow. Each line's own
                reveal is tied to `taglineLines`, which climbs as the
                reader keeps scrolling through the tagline zone — building
                the sentence up over real scroll distance, not a fixed
                timer every visit plays back identically. */}
            {TAGLINE_LINES.map((line, index) => (
              <span
                key={line}
                className={`phone__tagline-line${index < taglineLines ? ' is-shown' : ''}${
                  index === TAGLINE_LINES.length - 1 ? ' accent' : ''
                }`}
              >
                {line}
              </span>
            ))}
          </p>
        </div>
        <span className="phone__sheen" aria-hidden="true" />
      </div>
      {/* Floats a few px above the glass, outside the clipped screen box
          for the same reason as the edges above. */}
      <span className="phone__island" aria-hidden="true" />
    </div>
  );
});
