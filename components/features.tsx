import { RevealSection } from './reveal-section';
import { GlassSurface } from './glass-surface';
import { features } from '@/lib/content';

export function Features() {
  return (
    <RevealSection>
      <div className="wrap">
        <div className="sec-head">
          <h2 className="sec-title">What is in the build</h2>
          <p className="sec-lede">Everything below is shipping in v1.4.2 and proven on a physical iPhone.</p>
        </div>
        <div className="rows rows--cards">
          {features.map((feature, index) => (
            <GlassSurface
              as="article"
              className="row glass"
              key={feature.en}
              style={{ transitionDelay: `${index * 55}ms` }}
            >
              <div className="row-label">
                <span className="row-en">{feature.en}</span>
              </div>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                {feature.chips && (
                  <ul className="chips">
                    {feature.chips.map((chip) => (
                      <li key={chip}>{chip}</li>
                    ))}
                  </ul>
                )}
              </div>
            </GlassSurface>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
