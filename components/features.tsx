import { RevealSection } from './reveal-section';
import { features } from '@/lib/content';

export function Features() {
  return (
    <RevealSection>
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-jp">機能</p>
          <h2 className="sec-title">What is in the build</h2>
          <p className="sec-lede">Everything below is shipping in v1.4.2 and proven on a physical iPhone.</p>
        </div>
        <div className="rows">
          {features.map((feature) => (
            <article className="row" key={feature.en}>
              <div className="row-label">
                <span className="row-jp">{feature.jp}</span>
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
            </article>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
