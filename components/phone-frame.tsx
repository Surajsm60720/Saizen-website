import { forwardRef, type CSSProperties } from 'react';

export interface PhoneScreen {
  label: string;
  color: string;
  landscape?: boolean;
}

export type PhoneScreenKind = 'idle' | 'feature' | 'tagline';

interface PhoneFrameProps {
  screens: PhoneScreen[];
  activeIndex: number;
  screenKind: PhoneScreenKind;
}

/**
 * Presentational only — the hyper-realistic titanium/glass recipe from the
 * artifact (layered gradients for the bezel, a screen-blended sheen, a
 * radial-gradient dynamic-island glint), no PNG asset. Positioning, spin,
 * landscape roll and pointer-tilt all live in the parent (PhoneScrolly);
 * this renders three screen states — idle (the launch splash), feature
 * (a play-icon "recording" placeholder — real captures are still the
 * actual blocker, this just sells "this is video") and tagline (the
 * closing line, echoing the hero's own tagline) — crossfading between
 * them via `screenKind`/`activeIndex`.
 */
export const PhoneFrame = forwardRef<HTMLDivElement, PhoneFrameProps>(function PhoneFrame(
  { screens, activeIndex, screenKind },
  ref
) {
  return (
    <div className="phone" ref={ref}>
      {/* Flat placeholder back face — shown only mid-spin when the front
          rotates away. A designed back face is future work; this just
          keeps the spin from looking see-through in the meantime. */}
      <span className="phone__back" aria-hidden="true" />
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
        {screens.map((screen, index) => (
          <div
            key={screen.label}
            className={`phone__feature${screenKind === 'feature' && index === activeIndex ? ' is-shown' : ''}${
              screen.landscape ? ' phone__feature--landscape' : ''
            }`}
            style={{ '--fc': screen.color } as CSSProperties}
          >
            <span className="tag">{screen.label}</span>
            <span className="play" aria-hidden="true" />
            <span className="bar" aria-hidden="true" />
          </div>
        ))}
        <div className={`phone__tagline${screenKind === 'tagline' ? ' is-shown' : ''}`}>
          <p>
            The anime you&rsquo;re watching, now at the comfort of <span className="accent">your phone</span>.
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
