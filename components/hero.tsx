export function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <p className="eyebrow">Personal iOS anime client</p>
        <div className="lockup">
          <h1 className="kanji-xl">最善</h1>
          <div>
            <p className="wordmark">Saizen</p>
            <p className="reading">sai・zen — the optimal</p>
          </div>
        </div>
        <p className="tagline">
          Anime streaming at the comfort of <em>your phone</em>.
        </p>
        <p className="lede">
          Install stream modules, sign in with AniList or MyAnimeList in a player built for the way anime actually
          gets released. Everything runs on your device.
        </p>
        <div className="cta">
          <a className="btn btn-solid" href="https://github.com/Surajsm60720/Saizen/releases">
            Get the IPA
          </a>
          <a className="btn btn-ghost" href="https://github.com/Surajsm60720/Saizen">
            Read the source
          </a>
        </div>
        <p className="hero-note">
          <span>Next.js + Capacitor 7 + Swift</span>
          <span>·</span>
          <span>iOS 15+</span>
          <span>·</span>
          <span>Sideload only — no App Store build</span>
        </p>
      </div>
    </section>
  );
}
