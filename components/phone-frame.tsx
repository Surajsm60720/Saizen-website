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
 * feature, crossfading via `activeIndex` (-1 = idle placeholder, still
 * undecided — see DESIGN.md).
 */
export const PhoneFrame = forwardRef<HTMLDivElement, PhoneFrameProps>(function PhoneFrame(
  { screens, activeIndex },
  ref
) {
  return (
    <div className="phone-rig">
      <div className="phone" ref={ref}>
        <span className="phone__btn phone__btn--action" aria-hidden="true" />
        <span className="phone__btn phone__btn--vol-up" aria-hidden="true" />
        <span className="phone__btn phone__btn--vol-down" aria-hidden="true" />
        <span className="phone__btn phone__btn--power" aria-hidden="true" />
        <div className="phone__screen">
          <span className={`phone__placeholder${activeIndex === -1 ? ' is-shown' : ''}`}>Screenshot</span>
          {screens.map((screen, index) => (
            <div
              key={screen.label}
              className={`phone__feature${index === activeIndex ? ' is-shown' : ''}`}
              style={{ '--fc': screen.color } as CSSProperties}
            >
              <span className="tag">{screen.label}</span>
            </div>
          ))}
          <span className="phone__island" aria-hidden="true" />
          <span className="phone__sheen" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});
