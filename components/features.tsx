import { RevealSection } from './reveal-section';
import { RevealRow } from './reveal-row';
import { features } from '@/lib/content';

export function Features() {
  return (
    <RevealSection id="features-section">
      <div className="wrap">
        <div className="sec-head">
          <h2 className="sec-title">What is in the build</h2>
          <p className="sec-lede">Everything below is shipping in v1.4.2 and proven on a physical iPhone.</p>
        </div>
        <div className="features-grid">
        <div className="rows rows--ledger">
          {features.map((feature, index) => (
            <RevealRow className="row" key={feature.en}>
              <span className="row-seam" aria-hidden="true" />
              <span className="blade-tick" aria-hidden="true" />
              <div className="row-label">
                <span className="row-index">
                  <span className="mask">
                    <span className="pop pop--gated">{`0${index + 1}`}</span>
                  </span>
                </span>
                <span className="row-en">
                  <span className="mask">
                    <span className="pop pop--gated">{feature.en}</span>
                  </span>
                </span>
              </div>
              <div>
                <h3>
                  <span className="mask block">
                    <span className="pop pop--gated">{feature.title}</span>
                  </span>
                </h3>
                <p>
                  <span className="mask block">
                    <span className="pop pop--gated">{feature.body}</span>
                  </span>
                </p>
                {feature.chips && (
                  <ul className="chips">
                    {feature.chips.map((chip) => (
                      <li key={chip}>
                        <span className="mask">
                          <span className="pop pop--gated">{chip}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </RevealRow>
          ))}
        </div>
        {/* Reserves the phone's docked footprint while it's pinned here —
            same anchor-rect pattern as the hero slot, read by PhoneScrolly. */}
        <div className="dock-anchor" id="dock-phone-anchor" aria-hidden="true" />
        </div>
        {/* Mobile/tablet only (<1100px, see globals.css) — replaces the
            ledger above with a tall empty spacer PhoneScrolly reads to
            drive its own pinned title+phone sequence, one step's worth
            of scroll per feature. Height stays derived from the feature
            count rather than hardcoded. */}
        <div
          className="phone-features-zone-m"
          id="phone-features-zone-m"
          aria-hidden="true"
          style={{ height: `${features.length * 180}vh` }}
        />
      </div>
    </RevealSection>
  );
}
