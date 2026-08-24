import { RevealSection } from './reveal-section';
import { installMethods } from '@/lib/content';

export function Install() {
  return (
    <RevealSection>
      <div className="wrap">
        <div className="sec-head">
          <h2 className="sec-title">Getting it onto a phone</h2>
          <p className="sec-lede">
            Saizen is a personal sideload project. There is no App Store listing and no TestFlight.
          </p>
        </div>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Method</th>
                <th scope="col">Paid account</th>
                <th scope="col">What to expect</th>
              </tr>
            </thead>
            <tbody>
              {installMethods.map((row) => (
                <tr key={row.method}>
                  <td>
                    <strong>{row.method}</strong>
                  </td>
                  <td className={row.paidAccountLevel === 'yes' ? 'yes' : 'no'}>{row.paidAccount}</td>
                  <td>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="callout">
          <b>On version numbers.</b> Release IPAs use minor versions only — 1.2, 1.4, and so on. Patch builds like
          1.4.1 and 1.4.2 are local sideload builds and do not get their own Release asset. v1.4.0 is the current
          architecture IPA.
        </p>
      </div>
    </RevealSection>
  );
}
