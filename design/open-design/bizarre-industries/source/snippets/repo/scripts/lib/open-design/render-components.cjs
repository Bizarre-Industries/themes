'use strict';

const { OD_SCHEMA_TOKENS } = require('./model.cjs');

const MODE_IDS = Object.freeze(['void', 'void-hicontrast', 'workshop', 'paper', 'bone']);
const PREVIEWS = Object.freeze([
  ['preview/overview.html', 'overview', 'Overview'],
  ['preview/variants.html', 'variants', 'Variants'],
  ['preview/colors.html', 'colors', 'Colors'],
  ['preview/syntax-ansi.html', 'syntax-ansi', 'Syntax and ANSI'],
  ['preview/typography.html', 'typography', 'Typography'],
  ['preview/spacing.html', 'spacing', 'Spacing'],
  ['preview/components.html', 'components', 'Components'],
  ['preview/coverage.html', 'coverage', 'Coverage'],
  ['preview/app.html', 'app', 'App Preview'],
]);
const ASSET_KEYS = Object.freeze([
  'badge', 'hero', 'variants', 'colors', 'syntax', 'components', 'coverage', 'app',
]);
const FIXTURE_TITLE = 'Bizarre Industries — source-derived components';
const FIXTURE_DESCRIPTION = 'A source-derived reference fixture for Bizarre Industries: industrial panels, local Monaspace roles, real shipped assets, and complete interaction-state specimens.';

const CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  min-height: 100vh;
  background:
    linear-gradient(color-mix(in srgb, var(--accent) 5%, transparent) 1px, transparent 1px) 0 0 / 64px 64px,
    linear-gradient(90deg, color-mix(in srgb, var(--accent) 5%, transparent) 1px, transparent 1px) 0 0 / 64px 64px,
    var(--bg);
  color: var(--fg);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-body);
}
button, input { font: inherit; }
button { color: inherit; }
img { display: block; max-width: 100%; }
code, pre, kbd { font-family: var(--font-mono); }
.preview-root { min-height: 100vh; }
.container { width: 100%; max-width: var(--container-max); margin-inline: auto; padding-inline: var(--container-gutter-desktop); }
.topbar { border-bottom: 1px solid var(--border-soft); background: var(--surface); }
.topbar-inner { display: flex; align-items: center; justify-content: space-between; gap: var(--space-6); min-height: 64px; padding-block: var(--space-3); }
.preview-nav { display: flex; gap: var(--space-3); font-family: 'Monaspace Krypton', 'Monaspace Neon', monospace; font-size: var(--text-xs); letter-spacing: 0.12em; text-transform: uppercase; }
.preview-nav a { color: var(--fg-2); text-underline-offset: 4px; }
.preview-nav a:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.preview-title { margin: 0; color: var(--fg); font-family: var(--font-display); font-size: var(--text-lg); line-height: var(--leading-tight); }
.mode-switcher { min-width: 0; margin: 0; padding: 0; border: 0; }
.mode-switcher legend { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.mode-options { display: flex; flex-wrap: wrap; gap: var(--space-1); }
.mode-option { min-height: 32px; padding: var(--space-1) var(--space-2); border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--fg); font-family: 'Monaspace Krypton', 'Monaspace Neon', monospace; font-size: var(--text-xs); cursor: pointer; }
.mode-option:hover { background: var(--surface-warm); }
.mode-option:active { background: var(--border-soft); }
.mode-option:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.mode-option[aria-pressed="true"] { background: var(--accent-active); color: var(--accent-on); border-color: var(--accent-active); }
.hero-section, .section { padding-block: var(--section-y-desktop); }
.section + .section { border-top: 1px solid var(--border-soft); }
.hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.9fr); gap: var(--space-12); align-items: end; }
.identity-badge { width: min(100%, 480px); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.eyebrow, .pill, .section-num, .section-sub, .slogan-strip, .pane-chrome, .pane-meta, .code-footer, .badge, .field label, .state-label { font-family: 'Monaspace Krypton', 'Monaspace Neon', monospace; letter-spacing: 0.12em; text-transform: uppercase; }
.eyebrow { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); margin: 0 0 var(--space-8); color: var(--fg-2); font-size: var(--text-sm); }
.pill { display: inline-flex; padding: var(--space-1) var(--space-2); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--fg-2); font-size: var(--text-xs); }
h1, h2, h3 { margin: 0; font-family: var(--font-display); line-height: var(--leading-tight); }
.hero-title { max-width: 13ch; font-size: clamp(var(--text-3xl), 7vw, var(--text-4xl)); letter-spacing: var(--tracking-display); }
h2 { font-size: var(--text-2xl); }
h3 { font-size: var(--text-xl); }
p { margin: 0; }
.lede { max-width: 62ch; color: var(--fg-2); font-size: var(--text-lg); }
.body-muted { color: var(--fg-2); }
.body-sm { font-size: var(--text-sm); }
.slogan-strip { display: flex; justify-content: space-between; gap: var(--space-4); margin-top: var(--space-12); padding-block: var(--space-4); border-top: 1px solid var(--border-soft); border-bottom: 1px solid var(--border-soft); color: var(--fg-2); font-size: var(--text-sm); }
.section-heading { display: grid; grid-template-columns: auto 1fr auto; gap: var(--space-6); align-items: end; margin-bottom: var(--space-8); padding-bottom: var(--space-4); border-bottom: 1px solid var(--border); }
.section-num, .section-sub { font-size: var(--text-xs); }
.section-num { color: var(--fg); }
.section-sub { color: var(--fg-2); text-align: right; }
.component-grid, .preview-grid, .state-grid, .palette-grid, .pane-grid, .coverage-grid, .type-grid, .spacing-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6); }
.state-grid, .coverage-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.palette-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.card, .panel { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--elev-flat); }
.card-body { padding: var(--space-6); }
.config-card { overflow: hidden; }
.config-title { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--border-soft); font-family: 'Monaspace Krypton', 'Monaspace Neon', monospace; font-size: var(--text-xs); letter-spacing: 0.12em; text-transform: uppercase; }
.config-title strong { display: block; margin-bottom: var(--space-1); font-family: var(--font-display); font-size: var(--text-lg); letter-spacing: 0; text-transform: none; }
.config-path { color: var(--fg-2); overflow-wrap: anywhere; }
.swatch { min-height: 112px; display: flex; flex-direction: column; justify-content: end; padding: var(--space-3); border: 1px solid var(--border-soft); border-radius: var(--radius-md); }
.swatch-bg { background: var(--bg); }
.swatch-surface { background: var(--surface); }
.swatch-accent { background: var(--accent-active); color: var(--accent-on); }
.swatch-danger { background: var(--danger); color: var(--bg); }
.ansi-grid { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: var(--space-1); }
.ansi-cell { min-width: 0; }
.ansi-chip { display: block; height: 44px; border: 1px solid var(--border-soft); border-radius: var(--radius-md); }
.ansi-cell code { display: block; margin-top: var(--space-1); color: var(--fg-2); font-size: var(--text-xs); overflow: hidden; text-overflow: ellipsis; }
.syntax-specimen { padding: var(--space-6); overflow-x: auto; font-size: var(--text-base); line-height: 1.65; }
.syntax-surface { background: var(--bg); }
.pane-grid { grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr); }
.pane { min-width: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); }
.pane-chrome { display: flex; align-items: center; gap: var(--space-3); min-height: 42px; padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--border-soft); font-size: var(--text-xs); }
.dots { display: flex; gap: var(--space-1); }
.dot { width: 10px; height: 10px; border: 1px solid var(--border); border-radius: 50%; background: var(--surface-warm); }
.tab-row { display: flex; gap: var(--space-1); min-width: 0; }
.tab { padding: var(--space-1) var(--space-2); border: 1px solid transparent; border-radius: var(--radius-sm); background: transparent; color: var(--fg-2); cursor: pointer; }
.tab:hover { color: var(--fg); }
.tab:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.tab[aria-selected="true"] { border-color: var(--border); background: var(--bg); color: var(--fg); }
.tab:disabled { cursor: not-allowed; opacity: 0.5; }
.pane-meta { margin-left: auto; color: var(--fg-2); font-size: var(--text-xs); white-space: nowrap; }
.code-pane, .terminal-pane { min-height: 286px; padding: var(--space-5); overflow: auto; font-family: var(--font-mono); font-size: var(--text-sm); line-height: 1.65; }
.code-line { display: grid; grid-template-columns: 32px 1fr; gap: var(--space-3); }
.gutter { color: var(--fg-2); text-align: right; user-select: none; }
.terminal-row { white-space: pre-wrap; overflow-wrap: anywhere; }
.prompt-segment { display: inline-block; margin: var(--space-1) 0; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); background: var(--accent-active); color: var(--accent-on); font-weight: 700; }
.code-footer { display: flex; flex-wrap: wrap; gap: var(--space-4); padding: var(--space-2) var(--space-3); border-top: 1px solid var(--border-soft); color: var(--fg-2); font-size: var(--text-xs); }
.badge { display: inline-flex; align-items: center; padding: var(--space-1) var(--space-2); border: 1px solid currentColor; border-radius: var(--radius-sm); font-size: var(--text-xs); }
.status-ok { color: var(--success); }
.status-error { color: var(--danger); }
.install-snippet { margin: 0; padding: var(--space-4); overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg); color: var(--fg); }
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); }
.button { min-height: 38px; padding: var(--space-2) var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); color: var(--fg); cursor: pointer; }
.button:hover { background: var(--surface-warm); border-color: var(--accent-hover); }
.button:active { background: var(--border-soft); }
.button:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.button:disabled { cursor: not-allowed; opacity: 0.5; }
.button[aria-pressed="true"] { background: var(--accent-active); color: var(--accent-on); border-color: var(--accent-active); }
.button.is-hover { background: var(--surface-warm); border-color: var(--accent-hover); }
.button.is-active { background: var(--border-soft); }
.button.is-focus-visible { box-shadow: var(--focus-ring); }
.button.is-error { border-color: var(--danger); color: var(--danger); }
.link { color: var(--fg); text-decoration-color: var(--accent-active); text-decoration-thickness: 1px; text-underline-offset: 4px; }
.link:hover { text-decoration-thickness: 2px; }
.link:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.field { display: grid; gap: var(--space-2); }
.field label { color: var(--fg); font-size: var(--text-xs); }
.field input { width: 100%; min-height: 40px; padding: var(--space-2) var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg); color: var(--fg); }
.field input:hover { border-color: var(--accent-hover); }
.field input:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.field input:disabled { opacity: 0.5; }
.field input[aria-invalid="true"] { border-color: var(--danger); }
.field-error { color: var(--danger); font-size: var(--text-sm); }
.state-label { display: block; margin-bottom: var(--space-2); color: var(--fg-2); font-size: var(--text-xs); }
.kbd { display: inline-flex; min-width: 28px; min-height: 26px; align-items: center; justify-content: center; padding: var(--space-1) var(--space-2); border: 1px solid var(--border); border-bottom-width: 2px; border-radius: var(--radius-sm); background: var(--surface); }
.light-stage { padding: var(--space-5); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg); color: var(--fg); }
.variant-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--space-3); }
.variant-card { min-width: 0; padding: var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg); color: var(--fg); }
.variant-strip { display: grid; grid-template-columns: repeat(4, 1fr); height: 36px; margin-top: var(--space-4); border: 1px solid var(--border-soft); border-radius: var(--radius-md); overflow: hidden; }
.variant-strip span:nth-child(1) { background: var(--bg); }
.variant-strip span:nth-child(2) { background: var(--surface); }
.variant-strip span:nth-child(3) { background: var(--border); }
.variant-strip span:nth-child(4) { background: var(--accent-active); }
.source-figure { margin: var(--space-6) 0 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); }
.source-figure img { width: 100%; }
.source-figure figcaption { padding: var(--space-3); border-top: 1px solid var(--border-soft); color: var(--fg-2); font-size: var(--text-sm); }
.type-sample { padding: var(--space-5); border-top: 1px solid var(--border-soft); }
.type-sample:first-child { border-top: 0; }
.type-display { font-family: 'Monaspace Xenon', 'Monaspace Neon', monospace; font-size: var(--text-2xl); font-weight: 700; }
.type-label { font-family: 'Monaspace Krypton', 'Monaspace Neon', monospace; letter-spacing: 0.12em; text-transform: uppercase; }
.type-code { font-family: 'Monaspace Neon', monospace; }
.type-prose { font-family: 'Monaspace Argon', 'Monaspace Neon', monospace; }
.spacing-sample { min-height: 96px; display: flex; align-items: end; gap: var(--space-2); padding: var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); }
.spacing-bar { width: 32px; border: 1px solid var(--border); background: var(--surface-warm); }
.spacing-4 { height: var(--space-1); }
.spacing-8 { height: var(--space-2); }
.spacing-16 { height: var(--space-4); }
.spacing-24 { height: var(--space-6); }
.spacing-32 { height: var(--space-8); }
.radius-two { border-radius: var(--radius-sm); }
.radius-four { border-radius: var(--radius-md); }
.radius-six { border-radius: var(--radius-lg); }
.coverage-card { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-4); padding: var(--space-4); }
.coverage-count { font-family: var(--font-display); font-size: var(--text-2xl); }
.app-shell { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: 500px; overflow: hidden; }
.app-sidebar { padding: var(--space-5); border-right: 1px solid var(--border-soft); }
.app-sidebar ul { margin: var(--space-4) 0 0; padding: 0; list-style: none; }
.app-sidebar li { padding-block: var(--space-2); border-bottom: 1px solid var(--border-soft); }
.app-main { padding: var(--space-6); }
.footer { display: flex; align-items: center; gap: var(--space-4); padding-block: var(--space-12); color: var(--fg-2); font-family: 'Monaspace Krypton', 'Monaspace Neon', monospace; font-size: var(--text-xs); letter-spacing: 0.12em; text-transform: uppercase; }
.footer-line { flex: 1; height: 1px; background: var(--border-soft); }
@media (max-width: 900px) {
  .container { padding-inline: var(--container-gutter-phone); }
  .topbar-inner { align-items: flex-start; flex-direction: column; }
  .hero-section, .section { padding-block: var(--section-y-phone); }
  .hero-grid, .component-grid, .preview-grid, .state-grid, .palette-grid, .pane-grid, .coverage-grid, .type-grid, .spacing-grid, .variant-grid, .app-shell { grid-template-columns: minmax(0, 1fr); }
  .section-heading { grid-template-columns: minmax(0, 1fr); }
  .section-sub { text-align: left; }
  .ansi-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .app-sidebar { border-right: 0; border-bottom: 1px solid var(--border-soft); }
}
`;

const SCRIPT = `
(() => {
  const root = document.querySelector('[data-preview-root]');
  const options = [...document.querySelectorAll('[data-theme-option]')];
  for (const option of options) {
    option.addEventListener('click', () => {
      root.setAttribute('data-bizarre-theme', option.getAttribute('data-theme-option'));
      for (const candidate of options) {
        candidate.setAttribute('aria-pressed', candidate === option ? 'true' : 'false');
      }
    });
  }

  const activateTab = (tab) => {
    const tablist = tab.closest('[role=tablist]');
    const tabs = [...tablist.querySelectorAll('[role=tab]')];
    for (const candidate of tabs) {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', selected ? 'true' : 'false');
      candidate.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(candidate.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    }
    tab.focus();
  };

  for (const tablist of document.querySelectorAll('[role=tablist]')) {
    const tabs = [...tablist.querySelectorAll('[role=tab]')];
    for (const tab of tabs) {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', (event) => {
        const index = tabs.indexOf(tab);
        let nextIndex;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        activateTab(tabs[nextIndex]);
      });
    }
  }
})();
`;

function sorted(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function esc(value) {
  return String(value).replace(/&/gu, '&amp;').replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;').replace(/"/gu, '&quot;').replace(/'/gu, '&#39;');
}

function requireModel(model) {
  if (!model || typeof model !== 'object' || Array.isArray(model)
    || model.defaultMode !== 'void' || !model.modes
    || JSON.stringify(Object.keys(model.modes)) !== JSON.stringify(MODE_IDS)) {
    throw new TypeError('component renderer requires the five-mode Open Design model');
  }
  for (const id of MODE_IDS) {
    const mode = model.modes[id];
    if (!mode || typeof mode.label !== 'string' || typeof mode.sub !== 'string'
      || !mode.od || !mode.bizarre
      || JSON.stringify(Object.keys(mode.od)) !== JSON.stringify(OD_SCHEMA_TOKENS)) {
      throw new TypeError(`invalid Open Design component mode: ${id}`);
    }
  }
  return model;
}

function switcher(model, id = '') {
  return `<fieldset class="mode-switcher"${id ? ` data-od-id="${id}"` : ''}>
  <legend>Artifact mode</legend><div class="mode-options">
  ${MODE_IDS.map((modeId) => `<button type="button" class="mode-option" data-theme-option="${modeId}" aria-pressed="${modeId === 'void' ? 'true' : 'false'}">${esc(model.modes[modeId].label)}</button>`).join('\n  ')}
  </div></fieldset>`;
}

function header(model, title, id = '', fixture = false) {
  const home = fixture ? './components.html' : './overview.html';
  const design = fixture ? './DESIGN.md' : '../DESIGN.md';
  return `<header class="topbar"><div class="container topbar-inner"><nav class="preview-nav" aria-label="Preview navigation"><a href="${home}">${fixture ? 'Components' : 'Overview'}</a><a href="${design}">DESIGN.md</a></nav><h1 class="preview-title">${esc(title)}</h1>${switcher(model, id)}</div></header>`;
}

function heading(number, title, sub, id = '') {
  return `<div class="section-heading"${id ? ` data-od-id="${id}"` : ''}><span class="section-num">${esc(number)}</span><h2>${esc(title)}</h2><span class="section-sub">${esc(sub)}</span></div>`;
}

function footer() {
  return '<footer class="container footer"><span>BZR / THEMES / V0.2</span><span class="footer-line"></span><span>✦ CATCH THE STARS.</span></footer>';
}

function syntax(id = '') {
  return `<pre class="card syntax-specimen syntax-surface"${id ? ` data-od-id="${id}"` : ''}><code><span class="tok-kw-decl bzr-syntax-kw-decl">export const</span> <span class="tok-v bzr-syntax-variable">palette</span> <span class="tok-op bzr-syntax-op">=</span> <span class="tok-p bzr-syntax-punct">{</span>
  <span class="tok-prop bzr-syntax-prop">accent</span><span class="tok-p bzr-syntax-punct">:</span> <span class="tok-s bzr-syntax-string">'Signal Lime'</span><span class="tok-p bzr-syntax-punct">,</span>
  <span class="tok-f bzr-syntax-fn">renderTheme</span><span class="tok-p bzr-syntax-punct">(</span><span class="tok-param bzr-syntax-param">surface</span><span class="tok-p bzr-syntax-punct">)</span>
<span class="tok-p bzr-syntax-punct">};</span> <span class="tok-c bzr-syntax-comment">// catch the stars</span></code></pre>`;
}

function ansi(id = '') {
  const names = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'bright-black', 'bright-red', 'bright-green', 'bright-yellow', 'bright-blue', 'bright-magenta', 'bright-cyan', 'bright-white'];
  return `<div class="ansi-grid"${id ? ` data-od-id="${id}"` : ''}>${names.map((name) => `<div class="ansi-cell"><span class="ansi-chip bzr-ansi-bg-${name}" aria-hidden="true"></span><code>${name}</code></div>`).join('')}</div>`;
}

function panes() {
  return `<div class="pane-grid">
  <article class="pane" data-od-id="code-pane">
    <div class="pane-chrome">
      <span class="dots" aria-hidden="true"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>
      <div class="tab-row" role="tablist" aria-label="Editor files" data-od-id="tab">
        <button id="editor-tab-orbit" type="button" class="tab" role="tab" aria-selected="true" aria-controls="editor-panel-orbit" tabindex="0" data-state="selected">Orbit.tsx</button>
        <button id="editor-tab-readme" type="button" class="tab" role="tab" aria-selected="false" aria-controls="editor-panel-readme" tabindex="-1" data-state="default">README.md</button>
        <button id="editor-tab-ports" type="button" class="tab" role="tab" aria-selected="false" aria-controls="editor-panel-ports" tabindex="-1" data-state="default">PORTS.md</button>
      </div>
      <span class="pane-meta">TS · Bizarre Void</span>
    </div>
    <div id="editor-panel-orbit" class="code-pane syntax-surface" role="tabpanel" aria-labelledby="editor-tab-orbit"><div class="code-line"><span class="gutter">1</span><code><span class="bzr-syntax-kw-decl">export const</span> <span class="bzr-syntax-variable">orbit</span> <span class="bzr-syntax-op">=</span> <span class="bzr-syntax-num">25544</span><span class="bzr-syntax-punct">;</span></code></div><div class="code-line"><span class="gutter">2</span><code><span class="bzr-syntax-fn">renderTheme</span><span class="bzr-syntax-punct">(</span><span class="bzr-syntax-string">'bizarre-void'</span><span class="bzr-syntax-punct">);</span></code></div></div>
    <div id="editor-panel-readme" class="code-pane syntax-surface" role="tabpanel" aria-labelledby="editor-tab-readme" hidden><p>Bizarre Industries themes share one canonical palette.</p></div>
    <div id="editor-panel-ports" class="code-pane syntax-surface" role="tabpanel" aria-labelledby="editor-tab-ports" hidden><p>Editors, terminals, shells, tools, apps, web, docs, and window managers.</p></div>
    <div class="code-footer"><span>● preview · Bizarre Void</span><span>ln 2, col 24</span><span>spaces: 2</span></div>
  </article>
  <article class="pane" data-od-id="terminal-pane"><div class="pane-chrome"><span class="dots" aria-hidden="true"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span><span>zsh - bench - 132x42</span><span class="pane-meta">starship · Bizarre Void</span></div><div class="terminal-pane"><div class="terminal-row"><span class="prompt-segment">bzr</span> <span class="bzr-status-info">~/themes</span> <span class="bzr-status-warn">main ~2 ?1</span></div><div class="terminal-row">✦ git status -sb</div><div class="terminal-row bzr-status-warn"> M src/Orbit.tsx</div><div class="terminal-row bzr-status-ok">sample command: npm test</div><div class="terminal-row bzr-status-hint">sample coverage: json, toml, plist, xml, shell, lua</div></div></article>
</div>`;
}

function controls() {
  return `<div class="state-grid"><article class="card card-body"><h3>Buttons</h3><div class="controls" data-od-id="button"><button type="button" class="button" data-state="default">Default</button><button type="button" class="button is-hover" data-state="hover">Hover</button><button type="button" class="button is-active" data-state="active">Active</button><button type="button" class="button is-focus-visible" data-state="focus-visible">Focus visible</button><button type="button" class="button" data-state="disabled" disabled>Disabled</button><button type="button" class="button" data-state="selected" aria-pressed="true">Selected</button><button type="button" class="button is-error" data-state="error">Error</button></div></article><article class="card card-body"><h3>Fields</h3><form class="component-form" aria-label="Field states"><div class="field" data-od-id="field" data-state="default"><label for="field-default">Repository</label><input id="field-default" value="Bizarre-Industries/themes" /></div><div class="field" data-state="focus-visible"><label for="field-focus">Command</label><input id="field-focus" value="npm run generate" /></div><div class="field" data-state="disabled"><label for="field-disabled">Locked mode</label><input id="field-disabled" value="Bizarre Void" disabled /></div><div class="field" data-state="error"><label for="field-error">Install target</label><input id="field-error" value="/missing/theme" aria-invalid="true" aria-describedby="field-error-message" /><p id="field-error-message" role="alert" class="field-error">Choose an existing directory.</p></div></form></article><article class="card card-body"><h3>Links and keys</h3><div class="controls" data-od-id="link"><a class="link" href="./DESIGN.md" data-state="default">Read DESIGN.md</a><a class="link" href="./DESIGN.md" data-state="hover">Hover link</a><a class="link" href="./DESIGN.md" data-state="focus-visible">Focus link</a></div><p data-od-id="kbd">Run <kbd class="kbd">⌘</kbd> <kbd class="kbd">K</kbd>.</p></article></div>`;
}

function documentHtml({ title, description, links, body }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${esc(title)}</title><meta name="description" content="${esc(description)}" />${links}<style>${CSS}</style></head><body>${body}<script>${SCRIPT}</script></body></html>\n`;
}

function renderComponentsHtml(model) {
  requireModel(model);
  const body = `<div class="preview-root" data-preview-root data-bizarre-theme="void">${header(model, 'Source-derived components', 'variant-selector', true)}<main class="container"><section class="hero-section" data-od-id="identity-lockup" data-source-evidence="showcase/showcase-main.jsx:272"><div class="hero-grid"><div><p class="eyebrow" data-od-id="eyebrow"><span>✦ BIZARRE INDUSTRIES</span><span class="pill" data-od-id="pill">THEMES / V0.2</span><span class="pill">MAY 2026 SNAPSHOT</span></p><h2 class="hero-title">YOUR EDITOR. YOUR TERMINAL. ONE LIME.</h2><p class="lede">One canonical palette across editors, terminals, prompts, shells, tools, and future Bizarre Industries surfaces.</p></div><img class="identity-badge icon-slot" src="./assets/brand/bizarre-badge.svg" alt="Bizarre Industries theme badge" /></div><div class="slogan-strip" data-od-id="slogan-strip"><span>BZR / 002</span><strong>CATCH THE STARS.</strong><span>REFERENCE FIXTURE</span></div></section><section class="section" data-source-evidence="showcase/showcase.css:section-head">${heading('§ 01 / PALETTE', 'Two limes. One brand.', 'dark · light · ANSI', 'section-heading')}<div class="palette-grid"><article class="swatch swatch-bg" data-od-id="swatch"><strong>Void</strong><code>--bg</code></article><article class="swatch swatch-surface"><strong>Surface</strong><code>--surface</code></article><article class="swatch swatch-accent"><strong>Signal Lime</strong><code>--accent-active</code></article><article class="swatch swatch-danger"><strong>Error</strong><code>--danger</code></article></div><div class="card card-body">${ansi('ansi-cell')}</div></section><section class="section" data-source-evidence="showcase/syntax.css">${heading('§ 02 / SYNTAX', '29 token roles. Each earns a hue.', 'control · declaration · string · type')}${syntax('syntax-specimen')}</section><section class="section" data-source-evidence="showcase/showcase-panes.jsx">${heading('§ 03 / PANES', 'Editor and terminal, one language.', 'Neon code · Krypton chrome')}${panes()}</section><section class="section" data-source-evidence="showcase/showcase-main.jsx:154">${heading('§ 04 / CONFIG', 'A shipped path, not a fictional product card.', 'terminal · status · install')}<div class="component-grid"><article class="card config-card" data-od-id="config-card"><div class="config-title"><strong>Alacritty</strong><code class="config-path">terminals/alacritty/bizarre-void.toml</code></div><div class="card-body"><span class="badge status-ok bzr-status-ok" data-od-id="status-badge">generated · current</span><p class="body-muted">ANSI 16 · Bizarre Void · source-backed adapter</p></div></article><article class="card card-body" data-od-id="install-snippet"><h3>Install snippet</h3><pre class="install-snippet"><code>git clone https://github.com/Bizarre-Industries/themes
cd themes &amp;&amp; npm ci &amp;&amp; npm test</code></pre></article></div></section><section class="section" data-source-evidence="showcase/showcase.css:controls">${heading('§ 05 / STATES', 'Controls stay literal and labeled.', 'default · hover · active · focus · disabled · selected · error')}${controls()}<article class="light-stage" data-bizarre-theme="paper"><span class="state-label">Bizarre Paper · light-mode reference</span><div class="controls"><button type="button" class="button">Paper action</button><a class="link" href="./DESIGN.md">Paper link</a><span class="badge status-error bzr-status-error">error</span></div></article></section></main>${footer()}</div>`;
  return documentHtml({
    title: FIXTURE_TITLE,
    description: FIXTURE_DESCRIPTION,
    links: '<link rel="stylesheet" href="./tokens.css" /><link rel="stylesheet" href="./assets/bizarre-tokens.css" />',
    body,
  });
}

const GROUPS = Object.freeze([
  ['buttons', 'Buttons and calls to action', [/\bbutton\b/iu, /\.btn(?:\b|[-_:])/iu, /\[type=["']?(?:button|submit|reset)/iu], [/^btn(?:$|-)/iu, /button/iu, /cta/iu], [/^button$/iu]],
  ['inputs', 'Form fields and controls', [/\binput\b/iu, /\btextarea\b/iu, /\bselect\b/iu, /\.field(?:\b|[-_:])/iu, /\blabel\b/iu], [/^field(?:$|-)/iu, /input/iu, /control/iu, /form/iu], [/^(input|textarea|select|label|form)$/iu]],
  ['cards', 'Cards and panels', [/\.card(?:\b|[-_:])/iu, /\.panel(?:\b|[-_:])/iu, /\.tile(?:\b|[-_:])/iu], [/^card(?:$|-)/iu, /^panel(?:$|-)/iu, /^tile(?:$|-)/iu], []],
  ['badges', 'Badges, chips, and status labels', [/\.badge(?:\b|[-_:])/iu, /\.chip(?:\b|[-_:])/iu, /\.tag(?:\b|[-_:])/iu, /\.pill(?:\b|[-_:])/iu], [/^badge(?:$|-)/iu, /^chip(?:$|-)/iu, /^tag(?:$|-)/iu, /^pill(?:$|-)/iu, /status/iu], []],
  ['links', 'Links and inline actions', [/\ba\b/iu, /\.link(?:\b|[-_:])/iu], [/^link(?:$|-)/iu], [/^a$/iu]],
  ['keyboard', 'Keyboard hints', [/\bkbd\b/iu, /\.kbd(?:\b|[-_:])/iu], [/^kbd(?:$|-)/iu, /keyboard/iu, /shortcut/iu], [/^kbd$/iu]],
  ['icons', 'Icon slots', [/\.icon(?:\b|[-_:])/iu, /\[aria-hidden=["']true["']\]/iu], [/^icon(?:$|-)/iu], [/^svg$/iu]],
  ['typography', 'Typography scale and text utilities', [/\bh[1-6]\b/iu, /\.lead(?:\b|[-_:])/iu, /\.eyebrow(?:\b|[-_:])/iu, /\.body-(?:muted|sm|small)\b/iu], [/^lead$/iu, /^eyebrow$/iu, /^body-(?:muted|sm|small)$/iu, /caption/iu], [/^h[1-6]$/iu, /^p$/iu]],
  ['layout', 'Layout primitives', [/\.container(?:\b|[-_:])/iu, /\.stack-\d+\b/iu, /\.row-(?:between|center|start|end)\b/iu, /\bsection\b/iu, /\bmain\b/iu, /\bnav\b/iu], [/^container$/iu, /^stack-\d+$/iu, /^row-(?:between|center|start|end)$/iu, /grid/iu, /layout/iu], [/^(main|section|nav|header|footer)$/iu]],
].map(([id, label, selectorMatchers, classMatchers, elementMatchers]) => ({
  id, label, selectorMatchers, classMatchers, elementMatchers,
})));

function stylesIn(html) {
  return [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/giu)]
    .map((match) => (match[1] || '').trim());
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//gu, '');
}

function stripAtRuleHeaders(css) {
  return css.replace(/@(media|supports|container|layer)\b[^{]*\{/giu, '{');
}

function splitSelectors(list) {
  const values = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < list.length; index += 1) {
    const char = list[index];
    if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth = Math.max(0, depth - 1);
    else if (char === ',' && depth === 0) {
      values.push(list.slice(start, index));
      start = index + 1;
    }
  }
  values.push(list.slice(start));
  return values;
}

function normalizeSelector(value) {
  return value.trim().replace(/\s+/gu, ' ');
}

function selectorsIn(css) {
  const values = [];
  const source = stripAtRuleHeaders(stripComments(css));
  for (const match of source.matchAll(/(?:^|[{}])\s*([^@{}][^{}]*?)\s*\{/gu)) {
    const list = (match[1] || '').trim();
    if (!list || list.includes(':root') || /^(?:from|to|\d+(?:\.\d+)?%)$/iu.test(list)) continue;
    for (const selector of splitSelectors(list)) {
      const normalized = normalizeSelector(selector);
      if (normalized && !normalized.startsWith('@')) values.push(normalized);
    }
  }
  return sorted(values);
}

function tokenReferences(source) {
  return sorted([...source.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/gu)].map((match) => match[1]));
}

function selectorTokenReferences(css) {
  const inventory = new Map();
  const source = stripAtRuleHeaders(stripComments(css));
  for (const match of source.matchAll(/(?:^|[{}])\s*([^@{}][^{}]*?)\s*\{([^{}]*)\}/gu)) {
    const list = (match[1] || '').trim();
    if (!list || list.includes(':root') || /^(?:from|to|\d+(?:\.\d+)?%)$/iu.test(list)) continue;
    const references = tokenReferences(match[2] || '');
    if (references.length === 0) continue;
    for (const raw of splitSelectors(list)) {
      const selector = normalizeSelector(raw);
      if (!selector || selector.startsWith('@')) continue;
      const values = inventory.get(selector) || new Set();
      for (const reference of references) values.add(reference);
      inventory.set(selector, values);
    }
  }
  return new Map([...inventory.entries()]
    .map(([selector, values]) => [selector, sorted(values)])
    .sort(([left], [right]) => left.localeCompare(right)));
}

function classesIn(html) {
  const values = [];
  for (const match of html.matchAll(/\bclass\s*=\s*(["'])(.*?)\1/gisu)) {
    values.push(...(match[2] || '').split(/\s+/u).filter(Boolean));
  }
  return sorted(values);
}

function elementsIn(html) {
  return sorted([...html.matchAll(/<\s*([a-z][a-z0-9-]*)\b/giu)]
    .map((match) => match[1].toLowerCase()));
}

function tokenNames(css) {
  return sorted([...stripComments(css).matchAll(/(--[a-zA-Z0-9_-]+)\s*:/gu)]
    .map((match) => match[1]));
}

function titleIn(html) {
  const value = /<title\b[^>]*>([\s\S]*?)<\/title>/iu.exec(html)?.[1]
    ?.trim().replace(/\s+/gu, ' ');
  return value ? decodeEntities(value) : undefined;
}

function descriptionIn(html) {
  const match = /<meta\b(?=[^>]*\bname\s*=\s*["']description["'])(?=[^>]*\bcontent\s*=\s*(["'])([\s\S]*?)\1)[^>]*>/iu.exec(html);
  const value = match?.[2]?.trim().replace(/\s+/gu, ' ');
  return value ? decodeEntities(value) : undefined;
}

function decodeEntities(value) {
  return value.replace(/&quot;/gu, '"').replace(/&#39;/gu, "'")
    .replace(/&amp;/gu, '&').replace(/&lt;/gu, '<').replace(/&gt;/gu, '>');
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function literalsIn(css) {
  const source = stripComments(css).replace(/:root(?:\[[^\]]+\])?\s*\{[\s\S]*?\}/gu, '');
  return {
    colorExpressions: countMatches(source, /(?:#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)|color-mix\([^)]*\))/giu),
    pixelValues: countMatches(source, /(?<![\w-])-?\d*\.?\d+px\b/gu),
    hardcodedFontFamilies: countMatches(source, /\bfont-family\s*:\s*(?!var\()/giu),
  };
}

function groupRecord(definition, inventory) {
  const selectors = inventory.selectors.filter((selector) =>
    definition.selectorMatchers.some((matcher) => matcher.test(selector)));
  const classes = inventory.classes.filter((className) =>
    definition.classMatchers.some((matcher) => matcher.test(className)));
  const elements = inventory.elements.filter((element) =>
    definition.elementMatchers.some((matcher) => matcher.test(element)));
  const references = sorted(selectors.flatMap((selector) =>
    inventory.bySelector.get(selector) || []));
  return {
    id: definition.id,
    label: definition.label,
    present: selectors.length > 0 || classes.length > 0 || elements.length > 0,
    selectors,
    classes,
    elements,
    tokenReferences: references.filter((token) => inventory.referenced.includes(token)),
  };
}

function renderComponentsManifest({ html, tokensCss }) {
  if (typeof html !== 'string' || !html.trim()) {
    throw new TypeError('component manifest requires components.html text');
  }
  if (typeof tokensCss !== 'string' || !tokensCss.trim()) {
    throw new TypeError('component manifest requires tokens.css text');
  }
  const styleBlocks = stylesIn(html);
  const css = styleBlocks.join('\n\n');
  const selectors = selectorsIn(css);
  const classes = classesIn(html);
  const elements = elementsIn(html);
  const declared = tokenNames(tokensCss);
  const referenced = tokenReferences(html);
  const title = titleIn(html);
  const description = descriptionIn(html);
  const inventory = {
    selectors,
    classes,
    elements,
    referenced,
    bySelector: selectorTokenReferences(css),
  };
  return {
    schemaVersion: 1,
    brandId: 'bizarre-industries',
    source: { componentsHtml: 'components.html', tokensCss: 'tokens.css' },
    fixture: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      styleBlockCount: styleBlocks.length,
      selectorCount: selectors.length,
      classCount: classes.length,
      elementCount: elements.length,
    },
    tokens: {
      declared,
      referenced,
      unusedDeclared: declared.filter((token) => !referenced.includes(token)),
      undeclaredReferenced: declared.length === 0
        ? []
        : referenced.filter((token) => !declared.includes(token)),
    },
    selectors,
    classes,
    elements,
    groups: GROUPS.map((definition) => groupRecord(definition, inventory)),
    literals: literalsIn(css),
  };
}

function requireCoverage(coverage) {
  if (!Array.isArray(coverage) || coverage.length === 0) {
    throw new TypeError('preview coverage must be a non-empty array of exact id, label, and count records');
  }
  const ids = new Set();
  for (const record of coverage) {
    if (!record || typeof record !== 'object' || Array.isArray(record)
      || Object.keys(record).sort().join(',') !== 'count,id,label'
      || typeof record.id !== 'string' || !record.id.trim()
      || typeof record.label !== 'string' || !record.label.trim()
      || !Number.isSafeInteger(record.count) || record.count < 0
      || ids.has(record.id)) {
      throw new TypeError('preview coverage records must contain exactly id, label, and count');
    }
    ids.add(record.id);
  }
  return coverage;
}

function packagePath(value) {
  if (typeof value !== 'string' || !value || value !== value.trim()
    || value.includes('\0') || value.includes('\\') || value.startsWith('/')
    || /^[a-z][a-z0-9+.-]*:/iu.test(value)) return false;
  return value.split('/').every((segment) => segment && segment !== '.' && segment !== '..');
}

function requireAssets(assets) {
  if (!assets || typeof assets !== 'object' || Array.isArray(assets)
    || JSON.stringify(sorted(Object.keys(assets))) !== JSON.stringify(sorted(ASSET_KEYS))) {
    throw new TypeError(`preview assets must provide package-root paths for: ${ASSET_KEYS.join(', ')}`);
  }
  for (const [key, value] of Object.entries(assets)) {
    if (!packagePath(value)) {
      throw new TypeError(`preview asset must be a canonical package-root path: ${key}`);
    }
  }
  return assets;
}

function asset(assets, key) {
  return `../${esc(assets[key])}`;
}

function figure(assets, key, alt, caption) {
  return `<figure class="source-figure"><img src="${asset(assets, key)}" alt="${esc(alt)}" /><figcaption>${esc(caption)}</figcaption></figure>`;
}

function overview(model, assets) {
  return `<section class="hero-section" data-source-evidence="README.md + showcase/assets/generated/hero.png"><div class="hero-grid"><div><p class="eyebrow"><span>✦ BIZARRE INDUSTRIES</span><span class="pill">OPEN DESIGN / V1</span></p><h2 class="hero-title">YOUR EDITOR. YOUR TERMINAL. ONE LIME.</h2><p class="lede">A generated theming bundle for editors, terminals, shells, prompts, tools, apps, web surfaces, docs, and window managers.</p><div class="slogan-strip"><span>BZR / 002</span><strong>CATCH THE STARS.</strong><span>AGENT-MANAGED</span></div></div><img class="identity-badge icon-slot" src="${asset(assets, 'badge')}" alt="Bizarre Industries theme badge" /></div></section><section class="section" data-source-evidence="DESIGN.md governance">${heading('§ 01 / PURPOSE', 'One source, five artifact modes.', 'palette.js · generated output')}<div class="component-grid"><article class="card card-body"><h3>Purpose</h3><p>Carry one verified visual system across development surfaces without pretending the repository is already a product UI library.</p></article><article class="card card-body"><h3>Governance</h3><p>Canonical sources change first. Agents regenerate, validate, and preserve installation safety.</p><a class="link" href="../DESIGN.md">Read DESIGN.md</a></article></div>${figure(assets, 'hero', 'Generated Bizarre Industries showcase hero', 'Real repository capture: showcase/assets/generated/hero.png')}</section>`;
}

function variants(model, assets) {
  const cards = MODE_IDS.map((id) => {
    const mode = model.modes[id];
    return `<article class="variant-card" data-bizarre-theme="${id}"><h3>${esc(mode.label)}</h3><p class="body-muted">${esc(mode.sub)}</p><div class="variant-strip" aria-label="${esc(mode.label)} token strip"><span></span><span></span><span></span><span></span></div></article>`;
  }).join('');
  return `<section class="section" data-source-evidence="palette.js:variantOrder">${heading('§ 01 / VARIANTS', 'Five generated palettes.', 'dark · high contrast · warm · light')}<div class="variant-grid">${cards}</div>${figure(assets, 'variants', 'Five generated Bizarre Industries variants', 'Real repository capture: showcase/assets/generated/variants.png')}</section>`;
}

function colors(assets) {
  return `<section class="section" data-source-evidence="palette.js brand, status, and variants">${heading('§ 01 / COLORS', 'Two limes. One brand.', 'surfaces · foregrounds · borders · status')}<div class="palette-grid"><article class="swatch swatch-bg"><strong>Void</strong><code>--bg</code></article><article class="swatch swatch-surface"><strong>Raised surface</strong><code>--surface</code></article><article class="swatch swatch-accent"><strong>Signal Lime / Lime Ink</strong><code>--accent-active</code></article><article class="swatch swatch-danger"><strong>Error</strong><code>--danger</code></article></div><div class="card card-body">${ansi()}</div>${figure(assets, 'colors', 'Bizarre palette and ANSI evidence', 'Real repository capture: showcase/assets/generated/palette-ansi.png')}</section>`;
}

function syntaxAnsi(assets) {
  return `<section class="section" data-source-evidence="showcase/syntax.css + palette.js">${heading('§ 01 / SYNTAX + ANSI', '29 roles. Sixteen terminal colors.', 'external Bizarre utility classes')}${syntax()}<div class="card card-body">${ansi()}</div>${figure(assets, 'syntax', 'Bizarre syntax role evidence', 'Real repository capture: showcase/assets/generated/syntax.png')}</section>`;
}

function typography() {
  return `<section class="section" data-source-evidence="palette.js:fonts + local packaged WOFF2 files">${heading('§ 01 / TYPOGRAPHY', 'Monaspace carries the interface.', 'Xenon · Krypton · Neon · Argon')}<div class="card type-grid"><div><div class="type-sample type-display">Monaspace Xenon / DISPLAY<br />CATCH THE STARS.</div><div class="type-sample type-label">Monaspace Krypton / labels / 0.12em</div></div><div><div class="type-sample type-code">Monaspace Neon / code<br />const signal = '#C6FF24';</div><div class="type-sample type-prose">Monaspace Argon / prose<br />Industrial, editorial, code-first, and locally packaged.</div></div></div><p class="body-muted">Weights 400, 600, and 700 use local package fonts; system monospace remains the offline fallback.</p></section>`;
}

function spacing() {
  return `<section class="section" data-source-evidence="showcase/showcase.css spacing and radius values">${heading('§ 01 / SPACING', 'A 64px grid with restrained geometry.', '64px desktop · 20px responsive')}<div class="spacing-grid"><article class="card card-body"><h3>Spacing evidence</h3><div class="spacing-sample"><span class="spacing-bar spacing-4"></span><span class="spacing-bar spacing-8"></span><span class="spacing-bar spacing-16"></span><span class="spacing-bar spacing-24"></span><span class="spacing-bar spacing-32"></span></div><p class="body-muted">4 / 8 / 16 / 24 / 32px source-derived steps.</p></article><article class="card card-body"><h3>Radius evidence</h3><div class="controls"><span class="swatch radius-two">2px</span><span class="swatch radius-four">4px</span><span class="swatch radius-six">6px</span></div><p class="body-muted">Pills, controls, and panels stay close to square.</p></article></div></section>`;
}

function components(assets) {
  return `<section class="section" data-source-evidence="showcase/showcase.css + source component patterns">${heading('§ 01 / COMPONENTS', 'Literal controls, source-backed panels.', 'real states · real labels')}<div class="component-grid"><article class="card card-body"><h3>Actions</h3><div class="controls" data-od-id="button"><button type="button" class="button">Generate</button><button type="button" class="button" aria-pressed="true">Selected</button><button type="button" class="button" disabled>Disabled</button><a class="link" href="../DESIGN.md">Design contract</a></div></article><article class="card card-body"><h3>Field</h3><div class="field"><label for="preview-component-field">Variant</label><input id="preview-component-field" value="Bizarre Void" /></div></article></div>${panes()}${figure(assets, 'components', 'Generated VS Code theme cards', 'Real repository capture: showcase/assets/generated/vscode-themes.png')}</section>`;
}

function coveragePage(coverage, assets) {
  const cards = coverage.map((record) => `<article class="card coverage-card"><div><h3>${esc(record.label)}</h3><code>${esc(record.id)}</code></div><strong class="coverage-count">${record.count}</strong></article>`).join('');
  return `<section class="section" data-source-evidence="repository coverage records + generated screenshots">${heading('§ 01 / COVERAGE', 'The palette ships where work happens.', 'source records, not marketing totals')}<div class="coverage-grid">${cards}</div><article class="card card-body"><span class="badge status-ok bzr-status-ok">verified path</span><code class="config-path">editors/vscode/themes/bizarre-void-color-theme.json</code></article>${figure(assets, 'coverage', 'Generated Bizarre workflow tool cards', 'Real repository capture: showcase/assets/generated/tools.png')}</section>`;
}

function app(assets) {
  return `<section class="section" data-source-evidence="showcase panes composed as an Open Design explorer">${heading('§ 01 / APP PREVIEW', 'A cohesive system explorer.', 'identity · tokens · panes · governance')}<article class="card app-shell"><aside class="app-sidebar"><p class="eyebrow">✦ BIZARRE INDUSTRIES</p><h3>CATCH THE STARS.</h3><ul><li>Overview</li><li>Five variants</li><li>Syntax + ANSI</li><li>Components</li><li>Coverage</li></ul></aside><div class="app-main"><span class="badge status-ok bzr-status-ok">Bizarre Void · active</span><h2>Your editor. Your terminal.</h2><p class="lede">One generated system, grounded in repository evidence.</p>${syntax()}<pre class="install-snippet"><code>npm run generate&#10;npm test</code></pre></div></article>${figure(assets, 'app', 'Generated Bizarre shell banner', 'Real repository capture: showcase/assets/generated/shell-banner.png')}</section>`;
}

function previewDocument(model, title, content) {
  const body = `<div class="preview-root" data-preview-root data-bizarre-theme="void">${header(model, title)}<main class="container">${content}</main>${footer()}</div>`;
  return documentHtml({
    title: `Bizarre Industries — ${title}`,
    description: `Bizarre Industries ${title} Open Design preview.`,
    links: '<link rel="stylesheet" href="../tokens.css" /><link rel="stylesheet" href="../assets/bizarre-tokens.css" />',
    body,
  });
}

function renderPreviewPages({ model, coverage, assets }) {
  requireModel(model);
  requireCoverage(coverage);
  requireAssets(assets);
  const content = {
    overview: overview(model, assets),
    variants: variants(model, assets),
    colors: colors(assets),
    'syntax-ansi': syntaxAnsi(assets),
    typography: typography(),
    spacing: spacing(),
    components: components(assets),
    coverage: coveragePage(coverage, assets),
    app: app(assets),
  };
  return new Map(PREVIEWS.map(([pagePath, role, title]) => [
    pagePath,
    previewDocument(model, title, content[role]),
  ]));
}

function renderSystemKit({ model, coverage, assets }) {
  const appPreview = renderPreviewPages({ model, coverage, assets }).get('preview/app.html');
  return appPreview.replace('href="./overview.html"', 'href="../preview/overview.html"');
}

module.exports = {
  renderComponentsHtml,
  renderComponentsManifest,
  renderPreviewPages,
  renderSystemKit,
};
