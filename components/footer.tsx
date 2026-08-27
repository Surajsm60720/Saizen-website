export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-mark">
            <p className="kanji">最善</p>
            <div>
              <p className="word">SAIZEN</p>
              <p className="reading">sai・zen — the optimal</p>
            </div>
          </div>
          <nav className="foot-links" aria-label="Project links">
            <a href="https://github.com/Surajsm60720/Saizen">Source</a>
            <a href="https://github.com/Surajsm60720/Saizen/releases">Releases</a>
            <a href="https://github.com/Surajsm60720/Saizen/blob/main/docs/SECURITY_TEST_PLAN.md">Security</a>
            <a href="https://github.com/Surajsm60720/Saizen/blob/main/STRUCTURE.md">Structure</a>
          </nav>
        </div>
        <div className="foot-bottom">
          <p className="fine">
            Personal sideload project. Do not redistribute copyrighted media. Respect local law and the terms of any
            index you query.
          </p>
          <p className="credit">© 2026 Saizen · Built with Next.js, Capacitor &amp; Swift</p>
        </div>
      </div>
    </footer>
  );
}
