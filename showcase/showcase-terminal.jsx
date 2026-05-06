/* Bizarre Industries — terminal session built around the actual Starship config.
   Render order:
     prompt-row (powerline chunks) → user input → output → blank
   Colors come from the Starship config (starship.toml) so this mirrors what
   the user *actually* sees. Re-uses the syntax palette for output where it
   makes sense (json keys, errors, paths). */
const { Fragment: _BzrFrag } = React;

window.BzrStarshipTerminal = function StarshipTerminal({ theme = 'dark', paneBg, accent = '#C6FF24', glow = '#E8FF8A' }) {
  // resolve palette to mode
  const dark = theme === 'dark';
  const fg     = dark ? '#E4E4E4' : '#1A1A1A';
  const dim    = dark ? '#7A7A7A' : '#8A8576';
  const dim2   = dark ? '#545454' : '#A8A395';
  const blue   = dark ? '#7BB3FF' : '#1F4FB0';
  const cyan   = dark ? '#9DEAEA' : '#0F6E6E';
  const red    = dark ? '#FF6F77' : '#B8276F';
  const green  = dark ? '#5BD06B' : '#3F7A1F';
  const amber  = dark ? '#FFB85C' : '#9F4A0E';
  const violet = dark ? '#D88AE0' : '#7E2A9A';

  // powerline backgrounds — match starship.toml
  const limeBg  = accent;        // hero
  const voidBg  = dark ? '#1A1A1A' : '#E6E3DA';   // dir
  const smokeBg = dark ? '#2B2B2B' : '#D8D4C7';   // git

  const limeFg  = dark ? '#0E0E0E' : '#0E0E0E';
  const dirFg   = dark ? '#7BB3FF' : '#1F4FB0';

  const styles = {
    pane: { background: paneBg, color: fg },
    row:  { whiteSpace:'pre', display:'block' },
    pwrap:{ display:'flex', alignItems:'center', marginBottom: 2, marginTop: 6, fontFamily:'var(--mono)', fontSize:13 },
    chunk:{ display:'inline-flex', alignItems:'center', height:22, padding:'0 9px', fontWeight:600, fontFamily:'var(--mono)', fontSize:12.5, lineHeight:'22px' },
    wedgeR:(from,to)=>({ width:0, height:0, borderTop:'11px solid transparent', borderBottom:'11px solid transparent', borderLeft:`9px solid ${from}`, background: to, marginRight:0 }),
    starLine:{ color: glow, fontWeight:700, fontFamily:'var(--mono)', fontSize:13, marginTop:2, marginBottom:8, letterSpacing:0 },
    cmd: { color: fg },
  };

  // a single "prompt + input" sequence
  const Prompt = ({ branch = 'main', git = '', cmd, dur, dir = '~/projects/bench', warn = false, ok = false, runtime }) => (
    <_BzrFrag>
      <div style={styles.pwrap}>
        <span style={{ ...styles.chunk, background: limeBg, color: limeFg }}>&nbsp;bzr&nbsp;</span>
        <span style={styles.wedgeR(limeBg, voidBg)}></span>
        <span style={{ ...styles.chunk, background: voidBg, color: dirFg, fontWeight:500 }}>&nbsp;{dir}&nbsp;</span>
        <span style={styles.wedgeR(voidBg, smokeBg)}></span>
        {branch && <span style={{ ...styles.chunk, background: smokeBg, color: accent, fontWeight:500 }}>&nbsp; {branch}{' '}</span>}
        {git && <span style={{ ...styles.chunk, background: smokeBg, color: warn ? amber : ok ? green : amber, fontWeight:500 }}>{git} </span>}
        {runtime && <span style={{ ...styles.chunk, background: smokeBg, color: blue, fontWeight:500 }}>{runtime} </span>}
        {dur && <span style={{ ...styles.chunk, background: smokeBg, color: amber, fontWeight:500 }}>⏱ {dur} </span>}
        <span style={styles.wedgeR(smokeBg, 'transparent')}></span>
      </div>
      <div style={styles.starLine}>
        <span style={{ color: glow }}>✦</span>{' '}
        <span style={styles.cmd}>{cmd}</span>
      </div>
    </_BzrFrag>
  );

  return (
    <div className={`pane ${theme === 'light' ? 'light' : ''}`} style={{ '--bg': paneBg }}>
      <div className="pane-chrome">
        <div className="dots"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
        <div className="tab-row">
          <span className="tab active">zsh — bench — 132×42</span>
          <span className="tab">logs</span>
        </div>
        <span className="pane-meta">starship · bizarre {theme}</span>
      </div>

      <div className="term" style={styles.pane}>

        {/* git status */}
        <Prompt branch="main" git="~2 ?1" cmd="git status -sb" />
        <div style={{ ...styles.row, color: dim }}>## main...origin/main</div>
        <div style={{ ...styles.row, color: amber }}> M src/Orbit.tsx</div>
        <div style={{ ...styles.row, color: amber }}> M bench/oscilloscope.py</div>
        <div style={{ ...styles.row, color: dim2 }}>?? notes/2026-04-bench.md</div>

        {/* cargo build */}
        <Prompt branch="main" git="~2 ?1" cmd="cargo build --release" dur="4.81s" />
        <div style={{ ...styles.row }}>
          <span style={{ color: green, fontWeight:600 }}>   Compiling </span>
          <span style={{ color: fg }}>bizarre-sampler </span>
          <span style={{ color: dim }}>v0.1.0 (./crates/sampler)</span>
        </div>
        <div style={{ ...styles.row }}>
          <span style={{ color: green, fontWeight:600 }}>   Compiling </span>
          <span style={{ color: fg }}>bizarre-relay  </span>
          <span style={{ color: dim }}>v0.1.0 (./crates/relay)</span>
        </div>
        <div style={{ ...styles.row }}>
          <span style={{ color: amber, fontWeight:600 }}>   warning</span>
          <span style={{ color: fg }}>: unused variable: </span>
          <span style={{ color: violet }}>`epoch`</span>
          <span style={{ color: dim }}> → src/orbit.rs:42:9</span>
        </div>
        <div style={{ ...styles.row }}>
          <span style={{ color: green, fontWeight:600 }}>    Finished </span>
          <span style={{ color: dim }}>release [optimized] in 4.81s</span>
        </div>

        {/* http GET */}
        <Prompt branch="main" git="~2 ?1" cmd={<>curl -s <span style={{color:amber}}>https://api.bizarre.industries/orbits/iss</span> | jq .</>} runtime="rs 1.78" />
        <div style={{ ...styles.row, color: dim }}>{'{'}</div>
        <div style={{ ...styles.row }}><span style={{color: cyan}}>{'  "id"'}</span><span style={{color: dim}}>: </span><span style={{color: amber}}>"25544"</span><span style={{color: dim}}>,</span></div>
        <div style={{ ...styles.row }}><span style={{color: cyan}}>{'  "epoch"'}</span><span style={{color: dim}}>: </span><span style={{color: amber}}>"2026-04-12T03:14:00Z"</span><span style={{color: dim}}>,</span></div>
        <div style={{ ...styles.row }}><span style={{color: cyan}}>{'  "a_km"'}</span><span style={{color: dim}}>: </span><span style={{color: blue}}>6791.2</span><span style={{color: dim}}>,</span></div>
        <div style={{ ...styles.row }}><span style={{color: cyan}}>{'  "e"'}</span><span style={{color: dim}}>:    </span><span style={{color: blue}}>0.000913</span><span style={{color: dim}}>,</span></div>
        <div style={{ ...styles.row }}><span style={{color: cyan}}>{'  "i_deg"'}</span><span style={{color: dim}}>: </span><span style={{color: blue}}>51.6406</span><span style={{color: dim}}>,</span></div>
        <div style={{ ...styles.row }}><span style={{color: cyan}}>{'  "live"'}</span><span style={{color: dim}}>:  </span><span style={{color: green, fontWeight:600}}>true</span></div>
        <div style={{ ...styles.row, color: dim }}>{'}'}</div>

        {/* test (with err) */}
        <Prompt branch="theme/syntax" git="+5" ok cmd="pytest -q bench/" dur="2.4s" runtime="py 3.12" />
        <div style={{ ...styles.row, color: green, fontWeight:600 }}>...... <span style={{color: red, fontWeight:700}}>F</span> ......</div>
        <div style={{ ...styles.row }}>
          <span style={{color: red, fontWeight:700}}>FAIL </span>
          <span style={{color: fg}}>bench/test_chirp.py::test_rms_against_known</span>
        </div>
        <div style={{ ...styles.row, color: dim }}>  expected 0.7071, got 0.7068 (Δ 3.0e-4)</div>
        <div style={{ ...styles.row }}>
          <span style={{color: dim}}>14 passed, </span>
          <span style={{color: red}}>1 failed </span>
          <span style={{color: dim}}>in 2.40s</span>
        </div>

        {/* the live prompt — cursor */}
        <Prompt branch="theme/syntax" git="+5" ok cmd={
          <>echo <span style={{ color: amber }}>"✦ catch the stars."</span> &gt;&gt; <span style={{ color: cyan }}>shells/manifesto.txt</span></>
        } />

        {/* ready prompt */}
        <div style={styles.pwrap}>
          <span style={{ ...styles.chunk, background: limeBg, color: limeFg }}>&nbsp;bzr&nbsp;</span>
          <span style={styles.wedgeR(limeBg, voidBg)}></span>
          <span style={{ ...styles.chunk, background: voidBg, color: dirFg, fontWeight:500 }}>&nbsp;~/dotfiles/bizarre&nbsp;</span>
          <span style={styles.wedgeR(voidBg, smokeBg)}></span>
          <span style={{ ...styles.chunk, background: smokeBg, color: accent, fontWeight:500 }}>&nbsp; theme/syntax{' '}</span>
          <span style={{ ...styles.chunk, background: smokeBg, color: green, fontWeight:500 }}>+5 </span>
          <span style={styles.wedgeR(smokeBg, 'transparent')}></span>
        </div>
        <div style={styles.starLine}>
          <span style={{ color: glow }}>✦</span>{' '}
          <span className="blink" style={{ background: fg, width: 8, height: 16, display: 'inline-block', verticalAlign: '-3px' }}></span>
        </div>
      </div>
    </div>
  );
};

window.BzrStarshipTerminal = window.BzrStarshipTerminal;
