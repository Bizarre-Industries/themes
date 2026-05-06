const { useState: _Sus, useMemo: _Smm, useEffect: _Sue } = React;

const P = window.BZR_PALETTE;
const VARIANTS = P.variantOrder.map((id) => ({ id, ...P.variants[id] }));
const SYNTAX_LEGEND = [["pl","plain","text"],["p","punctuation","() , ;"],["op","operator","+ -> ?:"],["kw-ctrl","control","if/for/return"],["kw-decl","declaration","const/fn/class"],["kw-mod","modifier","pub/async/static"],["s","string","\"signal\""],["tmpl","template","`x=${v}`"],["esc","escape","${...} \\n"],["rgx","regex","/[a-z]+/"],["n","number","3.14"],["bool","bool/null","true/None"],["const","constant","MAX_INT"],["t","type","Vec3"],["tprim","primitive","u32"],["f","function","render()"],["method","method",".send()"],["prop","property",".opts"],["param","parameter","(x, y)"],["v","variable","value"],["this","self/this","self"],["b","builtin","print"],["ns","namespace","std::io"],["d","decorator","@cache"],["pre","preprocessor","#include"],["c","comment","// note"],["cdoc","doc-comment","/** */"],["tag","jsx tag","<div>"],["attr","jsx attr","className"]];

window.BzrShowcase = function Showcase({ tweaksProp }) {
  const t = tweaksProp || (window.useTweaks ? window.useTweaks(window.BZR_TWEAK_DEFAULTS)[0] : window.BZR_TWEAK_DEFAULTS);
  const samples = window.BZR_SAMPLES;
  const sample = samples[t.sampleLang || 'ts'];
  const limeRole = t.limeRole || 'functions';
  const visible = t.activeVariant || 'pairs';
  const shown = visible === 'pairs'
    ? [P.variants.void, P.variants.paper, P.variants['void-hicontrast'], P.variants.workshop, P.variants.bone].map((v, i) => ({ id: ['void','paper','void-hicontrast','workshop','bone'][i], ...v }))
    : visible === 'all'
      ? VARIANTS
      : VARIANTS.filter((v) => v.id === visible);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--lime-active', P.brand.signalLime);
    document.documentElement.style.setProperty('--lime', P.brand.signalLime);
    document.documentElement.style.setProperty('--lime-glow', P.brand.limeGlow);
    document.documentElement.style.setProperty('--lime-ink', P.brand.limeInk);
  }, []);

  return (
    <div className="showcase">
      <header className="hero" data-shot="hero">
        <div className="eyebrow">
          <span className="star">✦</span>
          <span>BIZARRE INDUSTRIES</span>
          <span className="pill">THEMES / V0.2</span>
          <span className="pill">MAY 2026</span>
          <span className="pill">EVERY EDITOR. EVERY TERMINAL.</span>
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
            <p className="lede">Bizarre Industries themes use one canonical palette across editors, terminals, prompts, shells, and desktop tools. GitHub Monaspace carries the interface: Neon for code, Xenon for display, Krypton for labels, Argon for prose.</p>
            <dl className="hero-meta">
              <div><dt>brand accent</dt><dd>Signal Lime · {P.brand.signalLime}</dd></div>
              <div><dt>paper accent</dt><dd>Lime Ink · {P.brand.limeInk}</dd></div>
              <div><dt>type</dt><dd>Monaspace Neon · Xenon · Krypton</dd></div>
              <div><dt>variants</dt><dd>5 palettes · generated configs</dd></div>
            </dl>
          </div>
        </div>
        <div className="slogan-strip"><span>BZR / 002</span><span className="lime">CATCH THE STARS.</span><span>SCROLL</span></div>
      </header>

      <section className="section">
        <div className="section-head">
          <span className="section-num">§ 01 / PALETTE</span>
          <h2 className="section-title">Two limes. One brand.</h2>
          <span className="section-sub">dark · light · ansi</span>
        </div>
        <div className="lime-pair">
          <div className="lime-card" style={{ background: P.variants.void.bg, color: P.variants.void.fg }}>
            <div className="lime-swatch" style={{ background: P.brand.signalLime }}></div>
            <div><div className="lime-meta">DARK · BRAND HERO</div><div className="lime-name" style={{ color: P.brand.signalLime }}>Signal Lime</div><div className="lime-hex">{P.brand.signalLime}</div><div className="lime-desc">Hero accent for dark surfaces, prompt blocks, function names, cursor stars, and active focus rings.</div></div>
          </div>
          <div className="lime-card" style={{ background: P.variants.paper.bg, color: P.variants.paper.fg, borderColor: 'rgba(14,14,14,.12)' }}>
            <div className="lime-swatch" style={{ background: P.brand.limeInk }}></div>
            <div><div className="lime-meta">LIGHT · INK</div><div className="lime-name" style={{ color: P.brand.limeInk }}>Lime Ink</div><div className="lime-hex">{P.brand.limeInk}</div><div className="lime-desc">Darkened lime for readable type on paper and bone without losing brand recognition.</div></div>
          </div>
        </div>
        <div className="section-head" style={{ marginTop: 56 }}>
          <span className="section-num">§ 01.B / ANSI</span>
          <h2 className="section-title">Conventional ANSI, tuned to Bizarre.</h2>
          <span className="section-sub">8 normal · 8 bright</span>
        </div>
        <div className="ansi-dual">
          {['void', 'paper'].map((id) => {
            const v = P.variants[id];
            return <div className="ansi-half" key={id}><div className="ansi-half-label">{v.label}</div><div className="ansi-grid">{Object.entries(v.ansi).map(([nm, hex]) => <div key={nm} className="ansi-cell" style={{ background: hex, color: window.BZR_TEXT_ON[hex] || '#fff' }}><span className="nm">{nm}</span><span className="hex">{hex}</span></div>)}</div></div>;
          })}
        </div>
      </section>

      <section className="section" data-shot="syntax">
        <div className="section-head">
          <span className="section-num">§ 02 / SYNTAX</span>
          <h2 className="section-title">29 token roles. Each earns a hue.</h2>
          <span className="section-sub">control vs decl · param vs prop · template vs string</span>
        </div>
        <div className="legend-grid">
          {SYNTAX_LEGEND.map(([role, name, ex]) => (
            <React.Fragment key={role}>
              <div className="legend-card legend-dark"><div className="code" data-theme="dark" data-lime-role={limeRole} style={{ padding: 0 }}><span className={`tok-${role}`} style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 600 }}>{ex}</span></div><div className="legend-name">{name}</div><div className="legend-key">{role}</div></div>
              <div className="legend-card legend-light"><div className="code" data-theme="light" data-lime-role={limeRole} style={{ padding: 0 }}><span className={`tok-${role}`} style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 600 }}>{ex}</span></div><div className="legend-name">{name}</div><div className="legend-key">{role}</div></div>
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><span className="section-num">§ 03 / STATEMENT</span><h2 className="section-title">The wordmark is Lime.</h2><span className="section-sub">brand · type · accent</span></div>
        <p className="big-type">BZR<span className="lime">.</span><br/><span className="out">CATCH</span> THE <span className="lime">STARS</span><span className="lime">.</span></p>
      </section>

      <section className="section" data-shot="variants">
        <div className="section-head"><span className="section-num">§ 04 / VARIANTS</span><h2 className="section-title">Five generated palettes.</h2><span className="section-sub">dark · light · high contrast</span></div>
        <div className="variant-grid">
          {VARIANTS.map((v) => <div className="variant-card" key={v.id} style={{ '--bg': v.bg, '--fgc': v.fg, '--dim': v.fgDim }}><div className="variant-swatch"><div className="variant-name" style={{ color: v.accent }}>{v.label}</div><div className="variant-sub">{v.sub}</div></div><div className="variant-strip">{[v.bg, v.bg2, v.bg3, v.fg, v.accent, v.syntax.info].map((hex) => <span key={hex} style={{ background: hex }}></span>)}</div></div>)}
        </div>
      </section>

      {shown.map((v, idx) => (
        <section key={v.id} className={`section ${v.mode === 'light' ? 'light-section' : ''}`}>
          <div className="section-head"><span className="section-num">§ {String(idx + 5).padStart(2, '0')} / {v.mode.toUpperCase()}</span><h2 className="section-title">{v.label}</h2><span className="section-sub">{v.sub}</span></div>
          <div className="pair"><BzrEditor sample={sample} variant={v} limeRole={limeRole} /><BzrStarshipTerminal variant={v} /></div>
        </section>
      ))}

      <section className="section">
        <div className="section-head"><span className="section-num">§ 10 / SHELL BANNER</span><h2 className="section-title">First shell of the day.</h2><span className="section-sub">zsh · bash · fish · powershell</span></div>
        <div className="banner-pane"><div className="bzr">{` ██████╗ ██╗███████╗ █████╗ ██████╗ ██████╗ ███████╗`}</div><div className="bzr">{` ██████╔╝██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██╔════╝`}</div><div className="bzr">{` ██████╔╝██║  ███╔╝ ███████║██████╔╝██████╔╝█████╗  `}</div><div className="bzr">{` ██████╔╝██║███████╗██║  ██║██║  ██║██║  ██║███████╗`}</div><div>&nbsp;</div><div className="gray">{` ██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗`}</div><div className="gray">{` ██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝`}</div><div className="gray">{` ██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗`}</div><div>&nbsp;</div><div className="meta">  BZR / SHELL / V0.2 / MAY 2026   <span className="star">✦</span>   host: bench</div><div>&nbsp;</div><div className="quote">  {t.bannerLine || 'The hands knew it before the plan did.'}</div><div>&nbsp;</div><div className="slogan">  CATCH THE STARS.</div></div>
      </section>

      <footer className="foot"><span>BZR / THEMES / V0.2</span><span className="star-line"></span><span className="lime">✦ CATCH THE STARS.</span></footer>
    </div>
  );
};
