import { RevealSection } from './reveal-section';

const FACTS = ['No App Store listing', 'No telemetry', 'Open source', 'Sideload, not a store'];

export function Install() {
  return (
    <RevealSection>
      <div className="wrap">
        <div className="sec-head">
          <h2 className="sec-title">Built in the open, outside the App Store</h2>
          <p className="sec-lede">
            No company, no ads, no telemetry — an open build anyone can run, inspect, or fork.
          </p>
        </div>
        <p className="manifesto-body">
          Saizen isn&apos;t submitted to the App Store, so there is no listing and no TestFlight. What exists
          instead is an open-source IPA — signed and sideloaded from{' '}
          <a href="https://github.com/Surajsm60720/Saizen/releases" target="_blank" rel="noopener noreferrer">
            GitHub Releases
          </a>
          , with the full source
          available for anyone who wants to build it themselves.
        </p>
        <ul className="chips">
          {FACTS.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </div>
    </RevealSection>
  );
}
