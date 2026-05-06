const { useState: _Sus, useMemo: _Smm, useEffect: _Sue } = React;

const P = window.BZR_PALETTE;
const VARIANTS = P.variantOrder.map((id) => ({ id, ...P.variants[id] }));
const SYNTAX_LEGEND = [["pl","plain","text"],["p","punctuation","() , ;"],["op","operator","+ -> ?:"],["kw-ctrl","control","if/for/return"],["kw-decl","declaration","const/fn/class"],["kw-mod","modifier","pub/async/static"],["s","string","\"signal\""],["tmpl","template","`x=${v}`"],["esc","escape","${...} \\n"],["rgx","regex","/[a-z]+/"],["n","number","3.14"],["bool","bool/null","true/None"],["const","constant","MAX_INT"],["t","type","Vec3"],["tprim","primitive","u32"],["f","function","render()"],["method","method",".send()"],["prop","property",".opts"],["param","parameter","(x, y)"],["v","variable","value"],["this","self/this","self"],["b","builtin","print"],["ns","namespace","std::io"],["d","decorator","@cache"],["pre","preprocessor","#include"],["c","comment","// note"],["cdoc","doc-comment","/** */"],["tag","jsx tag","<div>"],["attr","jsx attr","className"]];
const TERMINAL_TARGETS = [
  { shot: 'terminal-alacritty', name: 'Alacritty', file: 'terminals/alacritty/bizarre-void.toml', variant: 'void', cmd: 'alacritty --config-file bizarre-void.toml' },
  { shot: 'terminal-kitty', name: 'Kitty', file: 'terminals/kitty/bizarre-void.conf', variant: 'void-hicontrast', cmd: 'kitty +kitten themes Bizarre Void' },
  { shot: 'terminal-ghostty', name: 'Ghostty', file: 'terminals/ghostty/bizarre-workshop', variant: 'workshop', cmd: 'theme = bizarre-workshop' },
  { shot: 'terminal-iterm2', name: 'iTerm2', file: 'terminals/iterm2/bizarre-paper.itermcolors', variant: 'paper', cmd: 'open bizarre-paper.itermcolors' },
  { shot: 'terminal-wezterm', name: 'WezTerm', file: 'terminals/wezterm/bizarre.lua', variant: 'bone', cmd: 'color_scheme = Bizarre Bone' },
  { shot: 'terminal-windows-terminal', name: 'Windows Terminal', file: 'terminals/windows-terminal/schemes.json', variant: 'void', cmd: 'colorScheme: Bizarre Void' },
  { shot: 'terminal-tmux', name: 'tmux', file: 'terminals/tmux/bizarre.tmux.conf', variant: 'workshop', cmd: 'source-file bizarre.tmux.conf' },
  { shot: 'terminal-zellij', name: 'Zellij', file: 'terminals/zellij/bizarre.kdl', variant: 'paper', cmd: 'theme "bizarre-paper"' },
];
const VSCODE_TARGETS = VARIANTS.map((v) => ({
  shot: 'vscode-' + v.id,
  name: v.label,
  file: 'editors/vscode/themes/bizarre-' + v.id + '-color-theme.json',
  variant: v.id,
}));
const EDITOR_TARGETS = [
  { shot: 'editor-zed', name: 'Zed', file: 'editors/zed/themes/bizarre.json', variant: 'void', lang: 'TS' },
  { shot: 'editor-jetbrains', name: 'JetBrains', file: 'editors/jetbrains/bizarre-void.icls', variant: 'void-hicontrast', lang: 'Kotlin' },
  { shot: 'editor-sublime', name: 'Sublime Text', file: 'editors/sublime/bizarre-workshop.sublime-color-scheme', variant: 'workshop', lang: 'Rust' },
  { shot: 'editor-vim', name: 'Vim', file: 'editors/vim/colors/bizarre-paper.vim', variant: 'paper', lang: 'VimL' },
  { shot: 'editor-neovim', name: 'Neovim', file: 'editors/neovim/colors/bizarre-bone.vim', variant: 'bone', lang: 'Lua' },
  { shot: 'editor-base16', name: 'Base16', file: 'editors/neovim-base16/bizarre-void.yaml', variant: 'void', lang: 'YAML' },
];
const SHELL_TARGETS = [
  { shot: 'shell-bash', name: 'Bash', file: 'shells/banner/bizarre.bash', variant: 'void', cmd: 'source shells/banner/bizarre.bash' },
  { shot: 'shell-zsh', name: 'Zsh', file: 'shells/banner/bizarre.zsh', variant: 'void-hicontrast', cmd: 'source shells/banner/bizarre.zsh' },
  { shot: 'shell-fish', name: 'Fish', file: 'shells/banner/bizarre.fish', variant: 'workshop', cmd: 'source shells/banner/bizarre.fish' },
  { shot: 'shell-powershell', name: 'PowerShell', file: 'shells/banner/bizarre.ps1', variant: 'paper', cmd: '. ./shells/banner/bizarre.ps1' },
  { shot: 'prompt-starship', name: 'Starship', file: 'prompt/starship.toml', variant: 'bone', cmd: 'starship init zsh' },
];
const TOOL_TARGETS = [
  { shot: 'tool-aerospace', name: 'AeroSpace', file: 'tools/aerospace/aerospace.toml', variant: 'void', key: 'focused border', value: P.brand.signalLime },
  { shot: 'tool-forklift', name: 'ForkLift', file: 'tools/forklift/Bizarre.json', variant: 'paper', key: 'selection', value: P.brand.limeInk },
  { shot: 'tool-jujutsu', name: 'Jujutsu', file: 'tools/jujutsu/config.toml', variant: 'workshop', key: 'change id', value: P.brand.signalLime },
  { shot: 'tool-starship', name: 'Starship', file: 'prompt/starship.toml', variant: 'bone', key: 'prompt block', value: P.brand.limeInk },
];
const CLI_TARGETS = [
  { name: 'bat', file: 'tools/bat/themes/bizarre-void.tmTheme', variant: 'void', key: 'syntax', value: 'TextMate' },
  { name: 'btop', file: 'tools/btop/bizarre-void.theme', variant: 'void-hicontrast', key: 'graphs', value: 'theme[]' },
  { name: 'delta', file: 'tools/delta/bizarre.gitconfig', variant: 'workshop', key: 'diff', value: 'feature' },
  { name: 'dircolors', file: 'tools/dircolors/bizarre.dircolors', variant: 'paper', key: 'LS_COLORS', value: 'ansi256' },
  { name: 'fzf', file: 'tools/fzf/bizarre.sh', variant: 'bone', key: 'picker', value: '24-bit' },
  { name: 'lazygit', file: 'tools/lazygit/config.yml', variant: 'void', key: 'panes', value: 'yaml' },
  { name: 'yazi', file: 'tools/yazi/flavors/bizarre-void.yazi/flavor.toml', variant: 'void-hicontrast', key: 'flavor', value: 'toml' },
  { name: 'eza', file: 'tools/eza/bizarre.sh', variant: 'workshop', key: 'files', value: 'EZA_COLORS' },
  { name: 'atuin', file: 'tools/atuin/themes/bizarre-void.toml', variant: 'paper', key: 'history', value: 'Meanings' },
  { name: 'bottom', file: 'tools/bottom/bizarre-void.toml', variant: 'bone', key: 'monitor', value: 'styles' },
  { name: 'k9s', file: 'tools/k9s/skins/bizarre-void.yaml', variant: 'void', key: 'cluster', value: 'skin' },
  { name: 'ranger', file: 'tools/ranger/colorschemes/bizarre_void.py', variant: 'void-hicontrast', key: 'files', value: 'python' },
  { name: 'vivid', file: 'tools/vivid/themes/bizarre-void.yml', variant: 'workshop', key: 'ls', value: 'yaml' },
];
const MINI_WORDMARK = ['BIZARRE', 'INDUSTRIES'];
const WORDMARK = {
  "bizarre": [
    "██████╗ ██╗███████╗ █████╗ ██████╗ ██████╗ ███████╗",
    "██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██╔════╝",
    "██████╔╝██║  ███╔╝ ███████║██████╔╝██████╔╝█████╗  ",
    "██╔══██╗██║ ███╔╝  ██╔══██║██╔══██╗██╔══██╗██╔══╝  ",
    "██████╔╝██║███████╗██║  ██║██║  ██║██║  ██║███████╗",
    "╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝"
  ],
  "industries": [
    "██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗",
    "██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝",
    "██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗",
    "██║██║╚██╗██║██║  ██║██║   ██║╚════██║   ██║   ██╔══██╗██║██╔══╝  ╚════██║",
    "██║██║ ╚████║██████╔╝╚██████╔╝███████║   ██║   ██║  ██║██║███████╗███████║",
    "╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝"
  ]
};

function variantById(id) {
  return { id, ...P.variants[id] };
}

function cardStyle(v) {
  return { '--bg': v.bg, '--fgc': v.fg, '--dim': v.fgDim, '--accent': v.accent, '--info': v.syntax.info, background: v.bg, color: v.fg };
}

function TerminalConfigCard({ target }) {
  const v = variantById(target.variant);
  return (
    <div className={'config-card ' + (v.mode === 'light' ? 'light' : '')} data-config-shot={target.shot} style={cardStyle(v)}>
      <div className="config-title"><strong>{target.name}</strong><code>{target.file}</code></div>
      <div className="mini-ansi">{Object.entries(v.ansi).map(([name, hex]) => <span className="ansi-chip" key={name} title={name + ' ' + hex} style={{ background: hex }}></span>)}</div>
      <div className="config-prompt"><span className="path">~/themes</span> <span className="cmd">✦</span> {target.cmd}<br/><span style={{ color: v.fgFaint }}>ansi 16 · accent {v.accent}</span></div>
    </div>
  );
}

function MiniVscodeCode({ variant }) {
  const s = variant.syntax;
  return (
    <div className="mini-code">
      <div><span style={{ color: s.kwDecl }}>export const</span> <span style={{ color: variant.accent }}>palette</span> <span style={{ color: s.op }}>=</span> <span style={{ color: s.punct }}>{'{'}</span></div>
      <div>&nbsp;&nbsp;<span style={{ color: s.prop }}>accent</span><span style={{ color: s.punct }}>:</span> <span style={{ color: s.string }}>'{variant.accent}'</span><span style={{ color: s.punct }}>,</span></div>
      <div>&nbsp;&nbsp;<span style={{ color: s.fn }}>renderTheme</span><span style={{ color: s.punct }}>(</span><span style={{ color: s.param }}>surface</span><span style={{ color: s.punct }}>)</span> <span style={{ color: s.punct }}>{'{'}</span></div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: s.kwCtrl }}>return</span> <span style={{ color: s.builtin }}>paint</span><span style={{ color: s.punct }}>(</span><span style={{ color: s.param }}>surface</span><span style={{ color: s.punct }}>)</span></div>
      <div>&nbsp;&nbsp;<span style={{ color: s.punct }}>{'}'}</span></div>
      <div><span style={{ color: s.punct }}>{'}'}</span><span style={{ color: s.punct }}>;</span></div>
    </div>
  );
}

function VscodeConfigCard({ target }) {
  const v = variantById(target.variant);
  return (
    <div className={'config-card ' + (v.mode === 'light' ? 'light' : '')} data-config-shot={target.shot} style={cardStyle(v)}>
      <div className="config-title"><strong>{target.name}</strong><code>{target.file}</code></div>
      <div className="vscode-window" style={{ background: v.bg }}>
        <div className="vscode-bar"><span className="vscode-dot active"></span><span className="vscode-dot"></span><span className="vscode-dot"></span><span style={{ marginLeft: 'auto' }}>VS Code</span></div>
        <div className="vscode-body">
          <div className="vscode-activity"><span className="vscode-icon file on"></span><span className="vscode-icon search"></span><span className="vscode-icon branch"></span><span className="vscode-icon gear"></span></div>
          <div className="vscode-side"><div className="active">themes</div><div>bizarre</div><div>palette.js</div><div>showcase</div></div>
          <div className="vscode-editor"><MiniVscodeCode variant={v} /></div>
        </div>
        <div className="vscode-status"><span>{v.label}</span><span>{v.mode}</span></div>
      </div>
    </div>
  );
}

function EditorConfigCard({ target }) {
  const v = variantById(target.variant);
  return (
    <div className={'config-card ' + (v.mode === 'light' ? 'light' : '')} data-config-shot={target.shot} style={cardStyle(v)}>
      <div className="config-title"><strong>{target.name}</strong><code>{target.file}</code></div>
      <div className="tool-body">
        <div><span className="key">variant</span>: <span className="value">{v.label}</span></div>
        <div><span className="key">language</span>: <span className="value">{target.lang}</span></div>
        <div><span className="key">background</span>: {v.bg}</div>
        <div><span className="key">foreground</span>: {v.fg}</div>
        <div><span className="key">function</span>: <span className="value">{v.syntax.fn}</span></div>
        <div><span className="key">string</span>: {v.syntax.string}</div>
      </div>
      <div className="tool-strip">{[v.bg2, v.bg3, v.syntax.kwCtrl, v.syntax.string, v.accent].map((hex) => <span key={hex} style={{ background: hex }}></span>)}</div>
    </div>
  );
}

function ShellConfigCard({ target }) {
  const v = variantById(target.variant);
  const isPrompt = target.name === 'Starship';
  return (
    <div className={'config-card shell-card ' + (v.mode === 'light' ? 'light' : '')} data-config-shot={target.shot} style={cardStyle(v)}>
      <div className="config-title"><strong>{target.name}</strong><code>{target.file}</code></div>
      <div className="shell-body">
        {MINI_WORDMARK.map((line) => <React.Fragment key={line}><span className="brand">{line}</span>{'\n'}</React.Fragment>)}
        <span className="muted">BZR / {isPrompt ? 'PROMPT' : 'SHELL'} / V0.2</span>{'\n\n'}
        <span className="quote">{isPrompt ? '✦ ~/themes  main +5' : 'CATCH THE STARS.'}</span>{'\n'}
        <span className="muted">{target.cmd}</span>
      </div>
    </div>
  );
}

function ToolConfigCard({ target }) {
  const v = variantById(target.variant);
  return (
    <div className={'config-card ' + (v.mode === 'light' ? 'light' : '')} data-config-shot={target.shot} style={cardStyle(v)}>
      <div className="config-title"><strong>{target.name}</strong><code>{target.file}</code></div>
      <div className="tool-body">
        <div><span className="key">{target.key}</span>: <span className="value">{target.value}</span></div>
        <div><span className="key">surface</span>: {v.bg}</div>
        <div><span className="key">border</span>: {v.border}</div>
        <div><span className="key">text</span>: {v.fg}</div>
        <div><span className="key">status</span>: {v.syntax.ok} / {v.syntax.warn} / {v.syntax.error}</div>
      </div>
      <div className="tool-strip">{[v.bg, v.bg2, v.bg3, v.fg, v.accent].map((hex) => <span key={hex} style={{ background: hex }}></span>)}</div>
    </div>
  );
}

function CliConfigCard({ target }) {
  const v = variantById(target.variant);
  return (
    <div className={'config-card cli-card ' + (v.mode === 'light' ? 'light' : '')} style={cardStyle(v)}>
      <div className="config-title"><strong>{target.name}</strong><code>{target.file}</code></div>
      <div className="tool-body">
        <div><span className="key">{target.key}</span>: <span className="value">{target.value}</span></div>
        <div><span className="key">accent</span>: <span className="value">{v.accent}</span></div>
        <div><span className="key">surface</span>: {v.bg}</div>
      </div>
      <div className="tool-strip">{[v.bg, v.bg2, v.border, v.syntax.info, v.accent].map((hex) => <span key={hex} style={{ background: hex }}></span>)}</div>
    </div>
  );
}

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

      <section className="section" data-shot="palette-ansi">
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

      <section className="section" data-shot="terminal-colors">
        <div className="section-head"><span className="section-num">§ 05 / TERMINAL COLORS</span><h2 className="section-title">Every terminal config gets the palette.</h2><span className="section-sub">alacritty · kitty · ghostty · iterm2 · wezterm · windows terminal · tmux · zellij</span></div>
        <div className="config-grid">
          {TERMINAL_TARGETS.map((target) => <TerminalConfigCard key={target.shot} target={target} />)}
        </div>
      </section>

      <section className="section" data-shot="vscode-themes">
        <div className="section-head"><span className="section-num">§ 06 / VS CODE</span><h2 className="section-title">All VS Code variants.</h2><span className="section-sub">activity bar · editor · status bar</span></div>
        <div className="config-grid vscode-grid">
          {VSCODE_TARGETS.map((target) => <VscodeConfigCard key={target.shot} target={target} />)}
        </div>
      </section>

      <section className="section" data-shot="editor-themes">
        <div className="section-head"><span className="section-num">§ 07 / EDITORS</span><h2 className="section-title">Editor ports beyond VS Code.</h2><span className="section-sub">zed · jetbrains · sublime · vim · neovim · base16</span></div>
        <div className="config-grid editor-grid">
          {EDITOR_TARGETS.map((target) => <EditorConfigCard key={target.shot} target={target} />)}
        </div>
      </section>

      <section className="section" data-shot="shells">
        <div className="section-head"><span className="section-num">§ 08 / SHELLS</span><h2 className="section-title">Shell banners and prompt.</h2><span className="section-sub">bash · zsh · fish · powershell · starship</span></div>
        <div className="config-grid shell-grid">
          {SHELL_TARGETS.map((target) => <ShellConfigCard key={target.shot} target={target} />)}
        </div>
      </section>

      <section className="section" data-shot="tools">
        <div className="section-head"><span className="section-num">§ 09 / TOOLS</span><h2 className="section-title">Desktop and workflow tools.</h2><span className="section-sub">aerospace · forklift · jujutsu · starship</span></div>
        <div className="config-grid tool-grid">
          {TOOL_TARGETS.map((target) => <ToolConfigCard key={target.shot} target={target} />)}
        </div>
      </section>

      <section className="section" data-shot="cli-tui">
        <div className="section-head"><span className="section-num">§ 10 / CLI + TUI</span><h2 className="section-title">Planned CLI ports now ship.</h2><span className="section-sub">bat · btop · delta · dircolors · fzf · lazygit · yazi · eza · atuin · bottom · k9s · ranger · vivid</span></div>
        <div className="config-grid cli-grid">
          {CLI_TARGETS.map((target) => <CliConfigCard key={target.name} target={target} />)}
        </div>
      </section>

      {shown.map((v, idx) => (
        <section key={v.id} className={`section ${v.mode === 'light' ? 'light-section' : ''}`}>
          <div className="section-head"><span className="section-num">§ {String(idx + 10).padStart(2, '0')} / {v.mode.toUpperCase()}</span><h2 className="section-title">{v.label}</h2><span className="section-sub">{v.sub}</span></div>
          <div className="pair"><BzrEditor sample={sample} variant={v} limeRole={limeRole} /><BzrStarshipTerminal variant={v} /></div>
        </section>
      ))}

      <section className="section" data-shot="shell-banner">
        <div className="section-head"><span className="section-num">§ 20 / SHELL BANNER</span><h2 className="section-title">First shell of the day.</h2><span className="section-sub">zsh · bash · fish · powershell</span></div>
        <div className="banner-pane">
          {WORDMARK.bizarre.map((line) => <div className="bzr" key={line}>{line}</div>)}
          <div>&nbsp;</div>
          {WORDMARK.industries.map((line) => <div className="gray" key={line}>{line}</div>)}
          <div>&nbsp;</div>
          <div className="meta">  BZR / SHELL / V0.2 / MAY 2026   <span className="star">✦</span>   host: bench</div>
          <div>&nbsp;</div>
          <div className="quote">  {t.bannerLine || 'The hands knew it before the plan did.'}</div>
          <div>&nbsp;</div>
          <div className="slogan">  CATCH THE STARS.</div>
        </div>
      </section>

      <footer className="foot"><span>BZR / THEMES / V0.2</span><span className="star-line"></span><span className="lime">✦ CATCH THE STARS.</span></footer>
    </div>
  );
};
