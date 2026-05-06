const { Fragment: _BzrFrag } = React;

window.BzrStarshipTerminal = function StarshipTerminal({ variant }) {
  const s = variant.syntax;
  const fg = variant.fg;
  const dim = variant.fgFaint;
  const dim2 = variant.fgGhost;
  const blue = s.info;
  const cyan = s.rgx;
  const red = s.error;
  const green = s.ok;
  const amber = s.warn;
  const violet = s.hint;
  const limeBg = variant.accent;
  const voidBg = variant.bg2;
  const smokeBg = variant.bg3;
  const limeFg = window.BZR_CONTRAST[variant.id] || '#0E0E0E';
  const dirFg = s.info;
  const styles = {
    pane: { background: variant.bg, color: fg },
    row: { whiteSpace: 'pre', display: 'block' },
    pwrap: { display: 'flex', alignItems: 'center', marginBottom: 2, marginTop: 6, fontFamily: 'var(--mono)', fontSize: 13 },
    chunk: { display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 9px', fontWeight: 600, fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: '22px' },
    wedgeR: (from, to) => ({ width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: `9px solid ${from}`, background: to, marginRight: 0 }),
    starLine: { color: variant.accentSoft, fontWeight: 700, fontFamily: 'var(--mono)', fontSize: 13, marginTop: 2, marginBottom: 8, letterSpacing: 0 },
    cmd: { color: fg },
  };
  const Prompt = ({ branch = 'main', git = '', cmd, dur, dir = '~/projects/bench', warn = false, ok = false, runtime }) => (
    <_BzrFrag>
      <div style={styles.pwrap}>
        <span style={{ ...styles.chunk, background: limeBg, color: limeFg }}>&nbsp;bzr&nbsp;</span>
        <span style={styles.wedgeR(limeBg, voidBg)}></span>
        <span style={{ ...styles.chunk, background: voidBg, color: dirFg, fontWeight: 500 }}>&nbsp;{dir}&nbsp;</span>
        <span style={styles.wedgeR(voidBg, smokeBg)}></span>
        {branch && <span style={{ ...styles.chunk, background: smokeBg, color: variant.accent, fontWeight: 500 }}>&nbsp; {branch}{' '}</span>}
        {git && <span style={{ ...styles.chunk, background: smokeBg, color: warn ? amber : ok ? green : amber, fontWeight: 500 }}>{git} </span>}
        {runtime && <span style={{ ...styles.chunk, background: smokeBg, color: blue, fontWeight: 500 }}>{runtime} </span>}
        {dur && <span style={{ ...styles.chunk, background: smokeBg, color: amber, fontWeight: 500 }}>⏱ {dur} </span>}
        <span style={styles.wedgeR(smokeBg, 'transparent')}></span>
      </div>
      <div style={styles.starLine}><span>✦</span> <span style={styles.cmd}>{cmd}</span></div>
    </_BzrFrag>
  );
  return (
    <div className={`pane ${variant.mode === 'light' ? 'light' : ''}`} style={{ '--bg': variant.bg }}>
      <div className="pane-chrome">
        <div className="dots"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
        <div className="tab-row"><span className="tab active">zsh - bench - 132x42</span><span className="tab">logs</span></div>
        <span className="pane-meta">starship · {variant.label}</span>
      </div>
      <div className="term" style={styles.pane}>
        <Prompt branch="main" git="~2 ?1" cmd="git status -sb" />
        <div style={{ ...styles.row, color: dim }}>## main...origin/main</div>
        <div style={{ ...styles.row, color: amber }}> M src/Orbit.tsx</div>
        <div style={{ ...styles.row, color: amber }}> M bench/oscilloscope.py</div>
        <div style={{ ...styles.row, color: dim2 }}>?? notes/2026-05-bench.md</div>
        <Prompt branch="main" git="~2 ?1" cmd="cargo build --release" dur="4.81s" />
        <div style={styles.row}><span style={{ color: green, fontWeight: 600 }}>   Compiling </span><span>bizarre-sampler </span><span style={{ color: dim }}>v0.2.0</span></div>
        <div style={styles.row}><span style={{ color: amber, fontWeight: 600 }}>   warning</span><span>: unused variable: </span><span style={{ color: violet }}>`epoch`</span><span style={{ color: dim }}> -> src/orbit.rs:42:9</span></div>
        <div style={styles.row}><span style={{ color: green, fontWeight: 600 }}>    Finished </span><span style={{ color: dim }}>release [optimized] in 4.81s</span></div>
        <Prompt branch="main" git="~2 ?1" cmd={<>curl -s <span style={{ color: amber }}>https://api.bizarre.industries/orbits/iss</span> | jq .</>} runtime="rs 1.78" />
        <div style={{ ...styles.row, color: dim }}>{'{'}</div>
        <div style={styles.row}><span style={{ color: cyan }}>{'  "id"'}</span><span style={{ color: dim }}>: </span><span style={{ color: amber }}>"25544"</span><span style={{ color: dim }}>,</span></div>
        <div style={styles.row}><span style={{ color: cyan }}>{'  "epoch"'}</span><span style={{ color: dim }}>: </span><span style={{ color: amber }}>"2026-05-07T03:14:00Z"</span><span style={{ color: dim }}>,</span></div>
        <div style={styles.row}><span style={{ color: cyan }}>{'  "a_km"'}</span><span style={{ color: dim }}>: </span><span style={{ color: blue }}>6791.2</span><span style={{ color: dim }}>,</span></div>
        <div style={styles.row}><span style={{ color: cyan }}>{'  "live"'}</span><span style={{ color: dim }}>: </span><span style={{ color: green, fontWeight: 600 }}>true</span></div>
        <div style={{ ...styles.row, color: dim }}>{'}'}</div>
        <Prompt branch="theme/syntax" git="+5" ok cmd="npm test" dur="2.4s" runtime="node 22" />
        <div style={{ ...styles.row, color: green, fontWeight: 600 }}>generated: clean</div>
        <div style={{ ...styles.row, color: dim }}>validation: json, toml, plist, xml, shell, lua</div>
        <div style={styles.pwrap}>
          <span style={{ ...styles.chunk, background: limeBg, color: limeFg }}>&nbsp;bzr&nbsp;</span>
          <span style={styles.wedgeR(limeBg, voidBg)}></span>
          <span style={{ ...styles.chunk, background: voidBg, color: dirFg, fontWeight: 500 }}>&nbsp;~/themes/bizarre&nbsp;</span>
          <span style={styles.wedgeR(voidBg, smokeBg)}></span>
          <span style={{ ...styles.chunk, background: smokeBg, color: variant.accent, fontWeight: 500 }}>&nbsp; theme/regen </span>
          <span style={{ ...styles.chunk, background: smokeBg, color: green, fontWeight: 500 }}>+5 </span>
          <span style={styles.wedgeR(smokeBg, 'transparent')}></span>
        </div>
        <div style={styles.starLine}><span>✦</span> <span className="blink" style={{ background: fg, width: 8, height: 16, display: 'inline-block', verticalAlign: '-3px' }}></span></div>
      </div>
    </div>
  );
};
