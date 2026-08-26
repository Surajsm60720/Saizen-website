import { forwardRef, type CSSProperties } from 'react';

export interface PhoneScreen {
  label: string;
  color: string;
}

interface PhoneFrameProps {
  screens: PhoneScreen[];
  activeIndex: number;
}

/**
 * Presentational only — the hyper-realistic titanium/glass recipe from the
 * artifact (layered gradients for the bezel, a screen-blended sheen, a
 * radial-gradient dynamic-island glint), no PNG asset. Positioning, idle
 * float and pointer-tilt all live in the parent (PhoneScrolly); this just
 * renders the frame plus one absolutely-positioned "screen" layer per
 * feature, crossfading via `activeIndex` (-1 = the launch splash — the
 * kanji mark blooms in once on a dark screen, the same mark already used
 * by the toggle, the hero and the ink-convergence section). Positioning
 * and pointer-tilt live in the parent (PhoneScrolly); held steady
 * otherwise, no idle float.
 */
export const PhoneFrame = forwardRef<HTMLDivElement, PhoneFrameProps>(function PhoneFrame(
  { screens, activeIndex },
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
        <div className={`phone__placeholder${activeIndex === -1 ? ' is-shown' : ''}`}>
          <span className="phone__glow" aria-hidden="true" />
          <span className="phone__mark">最</span>
        </div>
        {screens.map((screen, index) => (
          <div
            key={screen.label}
            className={`phone__feature${index === activeIndex ? ' is-shown' : ''}`}
            style={{ '--fc': screen.color } as CSSProperties}
          >
            <span className="tag">{screen.label}</span>
          </div>
        ))}
        <span className="phone__sheen" aria-hidden="true" />
      </div>
      {/* Floats a few px above the glass, outside the clipped screen box
          for the same reason as the edges above. */}
      <span className="phone__island" aria-hidden="true" />
    </div>
  );
});
