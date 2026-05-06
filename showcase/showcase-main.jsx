/* Bizarre Industries — showcase v0.2
   Dark+Light side-by-side, real Starship terminal, palette legend */
const { useState: _Sus, useMemo: _Smm, useEffect: _Sue } = React;

const VARIANTS = [
  { id: 'midnight', label: 'BIZARRE / MIDNIGHT',  theme: 'dark',  bg: '#0E0E0E', sub: 'Pure void. No grain.' },
  { id: 'dark',     label: 'BIZARRE / DARK',      theme: 'dark',  bg: '#1A1A1A', sub: 'The bench at midnight' },
  { id: 'graphite', label: 'BIZARRE / GRAPHITE',  theme: 'dark',  bg: '#222621', sub: 'Warm graphite, low contrast' },
  { id: 'paper',    label: 'BIZARRE / PAPER',     theme: 'light', bg: '#F2F0EA', sub: 'Daylight at the bench' },
  { id: 'porcelain',label: 'BIZARRE / PORCELAIN', theme: 'light', bg: '#F8F7F2', sub: 'Cleanroom white' },
];

const ANSI = [
  ['black','#0E0E0E','#1A1A1A'],['red','#F0525B','#C13D45'],['green','#3FB950','#3F7A1F'],['yellow','#E8A33D','#9F4A0E'],
  ['blue','#5B9FFF','#1F4FB0'],['magenta','#D88AE0','#7E2A9A'],['cyan','#7AD9D9','#0F6E6E'],['white','#E4E4E4','#1A1A1A'],
  ['br-black','#3D3D3D','#7A7568'],['br-red','#FF6F77','#B8276F'],['br-green','#5BD06B','#3F7A1F'],['br-yellow','#FFB85C','#9F4A0E'],
  ['br-blue','#7BB3FF','#2F5DC2'],['br-magenta','#E8A8EE','#9B3DAB'],['br-cyan','#9DEAEA','#0F6E6E'],['br-white','#FFFFFF','#0E0E0E'],
];

// Lime presets — different shades for the brand role.
// Each entry: [accent, glow, label]
const ACCENT_PRESETS = [
  ['#C6FF24', '#E8FF8A', 'Signal Lime'],
  ['#A8FF00', '#D2FF6B', 'Acid Lime'],
  ['#9FCC1F', '#C6E36A', 'Lime Ink'],
  ['#E8FF8A', '#F4FFC1', 'Lime Glow'],
];

const SYNTAX_LEGEND = [
  ['kw-ctrl', 'control', 'if/for/return'],
  ['kw-decl', 'decl', 'const/fn/class'],
  ['kw-mod', 'modifier', 'pub/async/static'],
  ['s', 'string', '"hello"'],
  ['tmpl', 'template', '`x=${v}`'],
  ['esc', 'escape/interp', '${...} \\n'],
  ['rgx', 'regex', '/[a-z]+/'],
  ['n', 'number', '3.14'],
  ['bool', 'bool/null', 'true/None'],
  ['const', 'CONSTANT', 'MAX_INT'],
  ['t', 'type', 'Vec3'],
  ['tprim', 'primitive', 'int/u32'],
  ['f', 'function', 'render()'],
  ['method', 'method', '.send()'],
  ['prop', 'property', '.opts'],
  ['param', 'parameter', '(x, y)'],
  ['v', 'variable', 'value'],
  ['this', 'self/this', 'self'],
  ['op', 'operator', '+ -> ?:'],
  ['p', 'punctuation', '() , ;'],
  ['ns', 'namespace', 'np / std'],
  ['d', 'decorator', '@cache'],
  ['pre', 'preprocessor', '#include'],
  ['c', 'comment', '// note'],
  ['cdoc', 'doc-comment', '/** */'],
  ['tag', 'jsx tag', '<div>'],
  ['attr', 'jsx attr', 'className'],
];

window.BzrShowcase = function Showcase({ tweaksProp }) {
  const t = tweaksProp || (window.useTweaks ? window.useTweaks(window.BZR_TWEAK_DEFAULTS)[0] : window.BZR_TWEAK_DEFAULTS);
  const samples = window.BZR_SAMPLES;
  const sampleKey = t.sampleLang || 'ts';
  const limeRole = t.limeRole || 'functions';
  const accent = t.accent || '#C6FF24';
  const accentGlow = t.accentGlow || '#E8FF8A';
  // resolve lime-active per theme: dark uses raw accent, light uses lime-ink for legibility
  const accentLight = t.accentLight || '#5F8A0F';

  React.useEffect(() => {
    document.documentElement.style.setProperty('--lime-active', accent);
    document.documentElement.style.setProperty('--lime', accent);
    document.documentElement.style.setProperty('--lime-glow', accentGlow);
    document.documentElement.style.setProperty('--lime-ink', accentLight);
  }, [accent, accentGlow, accentLight]);

  const visible = t.activeVariant || 'pairs';
  let variants;
  if (visible === 'pairs') {
    // canonical pairs: midnight ↔ paper, dark ↔ porcelain, graphite ↔ paper
    variants = [VARIANTS[0], VARIANTS[3], VARIANTS[1], VARIANTS[4], VARIANTS[2]];
  } else if (visible === 'all') {
    variants = VARIANTS;
  } else {
    variants = VARIANTS.filter(v => v.id === visible);
  }

  const sample = samples[sampleKey];

  // helper: lime active color per pane theme
  const limeFor = (theme) => theme === 'light' ? accentLight : accent;

  return (
    <div className="showcase">

      {/* ── HERO ── */}
      <header className="hero">
        <div className="eyebrow">
          <span className="star">✦</span>
          <span>BIZARRE INDUSTRIES</span>
          <span className="pill">CODEX / V0.2</span>
          <span className="pill">APR 2026</span>
          <span className="pill">A FLAG FOR PEOPLE ALREADY DOING THE WORK</span>
        </div>
        <div className="hero-grid">
          <div>
            <h1 className="h1">
              <span className="stack"><span className="lime">EVERY</span> EDITOR.</span>
              <span className="stack">EVERY <span className="gray">TERMINAL.</span></span>
              <span className="stack">ONE <span className="lime">LIME</span>.</span>
            </h1>
          </div>
          <div>
            <p className="lede">
              The Bizarre Industries codex — a syntax + UI palette tuned for late-night benches and bright cleanrooms. 27 semantic token roles. Dark uses Signal Lime; light uses Lime Ink so the brand reads on paper without muddying. Drop into VS Code, Zed, JetBrains, Neovim, eight terminals, your shell, and Starship.
            </p>
            <dl className="hero-meta">
              <div><dt>brand accent</dt><dd>Signal Lime · #C6FF24</dd></div>
              <div><dt>paper accent</dt><dd>Lime Ink · #5F8A0F</dd></div>
              <div><dt>type</dt><dd>JetBrains Mono · Space Grotesk</dd></div>
              <div><dt>variants</dt><dd>5 themes · 11 editors · 8 terminals</dd></div>
            </dl>
          </div>
        </div>
        <div className="slogan-strip">
          <span>BZR / 001</span>
          <span className="lime">CATCH THE STARS.</span>
          <span>SCROLL ↓</span>
        </div>
      </header>

      {/* ── PALETTE / ANSI ── */}
      <section className="section" data-screen-label="01 Palette">
        <div className="section-head">
          <span className="section-num">§ 01 / PALETTE</span>
          <h2 className="section-title">Two limes. One brand.</h2>
          <span className="section-sub">dark · light · ansi</span>
        </div>
        <div className="lime-pair">
          <div className="lime-card" style={{ background: '#0E0E0E', color: '#E4E4E4' }}>
            <div className="lime-swatch" style={{ background: accent }}></div>
            <div>
              <div className="lime-meta">DARK · BRAND HERO</div>
              <div className="lime-name" style={{ color: accent }}>Signal Lime</div>
              <div className="lime-hex">{accent}</div>
              <div className="lime-desc">High-luminance accent. Used for the wordmark, the prompt block, function names, and the cursor star.</div>
            </div>
          </div>
          <div className="lime-card" style={{ background: '#F2F0EA', color: '#1A1A1A' }}>
            <div className="lime-swatch" style={{ background: accentLight }}></div>
            <div>
              <div className="lime-meta" style={{ color:'#7A7568' }}>LIGHT · INK</div>
              <div className="lime-name" style={{ color: accentLight }}>Lime Ink</div>
              <div className="lime-hex" style={{ color:'#7A7568' }}>{accentLight}</div>
              <div className="lime-desc" style={{ color:'#3D3D3D' }}>Darkened to ~46% L*. The same role on paper — readable as type, recognizable as the brand. Never displaces Signal Lime in marketing.</div>
            </div>
          </div>
        </div>

        <div className="section-head" style={{ marginTop: 56 }}>
          <span className="section-num">§ 01.B / ANSI</span>
          <h2 className="section-title">Conventional ANSI · two modes.</h2>
          <span className="section-sub">8 + 8 bright</span>
        </div>
        <div className="ansi-dual">
          <div className="ansi-half">
            <div className="ansi-half-label">DARK</div>
            <div className="ansi-grid">
              {ANSI.map(([nm, hex]) => (
                <div key={nm} className="ansi-cell" style={{ background: hex, color: hex === '#FFFFFF' || hex === '#E4E4E4' || hex === '#5BD06B' || hex === '#FFB85C' || hex === '#9DEAEA' ? '#0E0E0E' : '#FFFFFF' }}>
                  <span className="nm">{nm}</span><span className="hex">{hex}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ansi-half">
            <div className="ansi-half-label">LIGHT</div>
            <div className="ansi-grid">
              {ANSI.map(([nm, , hex]) => (
                <div key={nm} className="ansi-cell" style={{ background: hex, color: hex === '#1A1A1A' || hex === '#0E0E0E' ? '#F2F0EA' : '#FFFFFF' }}>
                  <span className="nm">{nm}</span><span className="hex">{hex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SYNTAX LEGEND ── */}
      <section className="section" data-screen-label="02 Syntax Roles">
        <div className="section-head">
          <span className="section-num">§ 02 / SYNTAX</span>
          <h2 className="section-title">27 semantic roles. Each earns a hue.</h2>
          <span className="section-sub">control vs decl · param vs prop · template vs string</span>
        </div>
        <div className="legend-grid">
          {SYNTAX_LEGEND.map(([role, name, ex]) => (
            <_BzrFrag key={role}>
              <div className="legend-card legend-dark">
                <div className="code" data-theme="dark" data-lime-role={limeRole} style={{ padding:0 }}>
                  <span className={`tok-${role}`} style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:600 }}>{ex}</span>
                </div>
                <div className="legend-name">{name}</div>
                <div className="legend-key">{role}</div>
              </div>
              <div className="legend-card legend-light">
                <div className="code" data-theme="light" data-lime-role={limeRole} style={{ padding:0 }}>
                  <span className={`tok-${role}`} style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:600 }}>{ex}</span>
                </div>
                <div className="legend-name">{name}</div>
                <div className="legend-key">{role}</div>
              </div>
            </_BzrFrag>
          ))}
        </div>
      </section>

      {/* ── BIG TYPE statement ── */}
      <section className="section" data-screen-label="03 Statement">
        <div className="section-head">
          <span className="section-num">§ 03 / STATEMENT</span>
          <h2 className="section-title">Rule one: the wordmark is Lime.</h2>
          <span className="section-sub">brand · type · accent</span>
        </div>
        <p className="big-type" style={{ marginTop: 24 }}>
          BZR<span className="lime">.</span><br/>
          <span className="out">CATCH</span> <span>THE</span> <span className="lime">STARS</span><span className="lime">.</span>
        </p>
      </section>

      {/* ── VARIANT PAIRS ── */}
      {variants.map((v, idx) => (
        <section
          key={`${v.id}-${idx}`}
          className={`section ${v.theme === 'light' ? 'light-section' : ''}`}
          data-screen-label={`${String(idx + 4).padStart(2, '0')} ${v.label}`}
        >
          <div className="section-head">
            <span className="section-num">§ {String(idx + 4).padStart(2, '0')} / {v.theme.toUpperCase()}</span>
            <h2 className="section-title">{v.label}</h2>
            <span className="section-sub">{v.sub}</span>
          </div>
          <div className="pair">
            <BzrEditor sample={sample} theme={v.theme} limeRole={limeRole} paneBg={v.bg} />
            <BzrStarshipTerminal theme={v.theme} paneBg={v.bg} accent={limeFor(v.theme)} glow={v.theme === 'light' ? '#7A6308' : accentGlow} />
          </div>
        </section>
      ))}

      {/* ── BANNER ── */}
      <section className="section" data-screen-label={`${String(variants.length + 4).padStart(2, '0')} Shell Banner`}>
        <div className="section-head">
          <span className="section-num">§ {String(variants.length + 4).padStart(2, '0')} / SHELL BANNER</span>
          <h2 className="section-title">First shell of the day.</h2>
          <span className="section-sub">zsh · bash · fish · powershell</span>
        </div>
        <div className="banner-pane">
          <div className="bzr">{` ██████╗ ██╗███████╗ █████╗ ██████╗ ██████╗ ███████╗`}</div>
          <div className="bzr">{` ██████╔╝██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██╔════╝`}</div>
          <div className="bzr">{` ██╔══██╗██║  ███╔╝ ███████║██████╔╝██████╔╝█████╗  `}</div>
          <div className="bzr">{` ██████╔╝██║███████╗██║  ██║██║  ██║██║  ██║███████╗`}</div>
          <div className="bzr">{` ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝`}</div>
          <div>{` `}</div>
          <div className="gray">{` ██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗`}</div>
          <div className="gray">{` ██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝`}</div>
          <div className="gray">{` ██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗`}</div>
          <div className="gray">{` ██║██║╚██╗██║██║  ██║██║   ██║╚════██║   ██║   ██╔══██╗██║██╔══╝  ╚════██║`}</div>
          <div className="gray">{` ██║██║ ╚████║██████╔╝╚██████╔╝███████║   ██║   ██║  ██║██║███████╗███████║`}</div>
          <div className="gray">{` ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝`}</div>
          <div>&nbsp;</div>
          <div className="meta">{`  BZR / SHELL / V0.1 / APR 2026   `}<span className="star">✦</span>{`   host: bench`}</div>
          <div>&nbsp;</div>
          <div className="quote">{`  ${t.bannerLine || 'The hands knew it before the plan did.'}`}</div>
          <div>&nbsp;</div>
          <div className="slogan">{`  CATCH THE STARS.`}</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="foot">
        <span>BZR / CODEX / V0.2</span>
        <span className="star-line"></span>
        <span className="lime">✦ CATCH THE STARS.</span>
      </footer>
    </div>
  );
};

const _BzrFrag = React.Fragment;
