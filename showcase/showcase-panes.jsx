/* Bizarre Industries — editor pane (v0.2) */
const { useState: _ueS, useEffect: _ueE } = React;

window.BzrCode = function Code({ sample, theme = 'dark', limeRole = 'functions' }) {
  return (
    <div className="code" data-theme={theme} data-lime-role={limeRole}>
      {sample.lines.map((toks, i) => (
        <div key={i} className={`line ${i + 1 === sample.cur ? 'cur' : ''}`}>
          <span className="gutter">{i + 1}</span>
          <span className="src">
            {toks.map(([type, text], j) => (
              <span key={j} className={`tok-${type}`}>{text}</span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
};

window.BzrEditor = function Editor({ sample, theme, limeRole, paneBg }) {
  return (
    <div className={`pane ${theme === 'light' ? 'light' : ''}`} style={{ '--bg': paneBg, background: paneBg }}>
      <div className="pane-chrome">
        <div className="dots"><span className="dot live"></span><span className="dot"></span><span className="dot"></span></div>
        <div className="tab-row">
          <span className="tab active">{sample.name}</span>
          <span className="tab">README.md</span>
          <span className="tab">CHANGELOG</span>
        </div>
        <span className="pane-meta">{sample.lang} · UTF-8 · LF</span>
      </div>
      <BzrCode sample={sample} theme={theme} limeRole={limeRole} />
      <div className="code-footer">
        <span className="live">● bizarre {theme}</span>
        <span>ln {sample.cur}, col 24</span>
        <span>spaces: 2</span>
        <span>lime: {limeRole}</span>
        <span style={{ marginLeft: 'auto' }}>✦ catch the stars</span>
      </div>
    </div>
  );
};
