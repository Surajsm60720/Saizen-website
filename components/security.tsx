import { RevealSection } from './reveal-section';
import { securityItems } from '@/lib/content';

export function Security() {
  return (
    <RevealSection alt>
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-jp">安全</p>
          <h2 className="sec-title">Secrets stay out of the build</h2>
          <p className="sec-lede">Packaging fails closed rather than shipping a key by accident.</p>
        </div>
        <div className="rows" style={{ borderTop: 0 }}>
          {securityItems.map((item, index) => (
            <article className="row" key={item.en} style={index === 0 ? { paddingTop: 0 } : undefined}>
              <div className="row-label">
                <span className="row-jp">{item.jp}</span>
                <span className="row-en">{item.en}</span>
              </div>
              <div>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
