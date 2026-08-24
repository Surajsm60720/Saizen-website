import { RevealSection } from './reveal-section';
import { pipelineSteps } from '@/lib/content';

export function Pipeline() {
  return (
    <RevealSection alt>
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-jp">視聴経路</p>
          <h2 className="sec-title">How a stream reaches the screen</h2>
          <p className="sec-lede">
            Watch runs on installable CDN modules. Torrents stay available for optional offline work, but they are
            no longer the path playback takes.
          </p>
        </div>
        <div className="pipe">
          {pipelineSteps.map((step) => (
            <article className="step" key={step.number}>
              <p className="step-n">{step.number}</p>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
