const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const palette = require('../palette.js');

function luminance(hex) {
  const raw = hex.replace(/^#/u, '');
  const channels = [0, 2, 4].map((offset) => Number.parseInt(raw.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(left, right) {
  const [light, dark] = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

function assertAA(foreground, background, label) {
  const ratio = contrast(foreground, background);
  assert.ok(ratio >= 4.5, `${label}: ${foreground} on ${background} is ${ratio.toFixed(6)}:1`);
}

function assertNonText(foreground, background, label) {
  const ratio = contrast(foreground, background);
  assert.ok(ratio >= 3, `${label}: ${foreground} against ${background} is ${ratio.toFixed(6)}:1`);
}

function strongestBlackOrWhite(background) {
  return contrast('#000000', background) >= contrast('#FFFFFF', background) ? '#000000' : '#FFFFFF';
}

test('light themes separate Lime Ink fills from accessible Lime Text', () => {
  assert.equal(palette.brand.limeInk, '#5F8A0F');
  assert.equal(palette.brand.limeText, '#4A7409');
  for (const id of ['paper', 'bone']) {
    const variant = palette.variants[id];
    assert.equal(variant.accent, palette.brand.limeInk, `${id} fill accent changed`);
    assert.equal(variant.accentText, palette.brand.limeText, `${id} text accent missing`);
    assertAA(variant.accentText, variant.bg, `${id} accentText/bg`);
    assertAA(variant.accentText, variant.bg2, `${id} accentText/bg2`);
  }
});

test('every normal syntax role clears WCAG AA on every canonical editor background', () => {
  for (const id of palette.variantOrder) {
    const variant = palette.variants[id];
    for (const [role, color] of Object.entries(variant.syntax)) assertAA(color, variant.bg, `${id} syntax.${role}`);
  }
});

test('every light-terminal ANSI foreground clears WCAG AA on Paper and Bone', () => {
  for (const id of ['paper', 'bone']) {
    const variant = palette.variants[id];
    for (const [name, color] of Object.entries(variant.ansi)) assertAA(color, variant.bg, `${id} ANSI ${name}`);
  }
});

test('light status text clears WCAG AA on raised editor and prompt surfaces', () => {
  for (const id of ['paper', 'bone']) {
    const variant = palette.variants[id];
    for (const role of ['error', 'warn', 'ok', 'info', 'hint']) {
      assertAA(variant.syntax[role], variant.bg3, `${id} raised status ${role}`);
    }
  }
});

test('generated VS Code foreground accents use accessible text or on-fill colors', () => {
  for (const id of palette.variantOrder) {
    const variant = palette.variants[id];
    const theme = JSON.parse(fs.readFileSync(path.join(root, `editors/vscode/themes/bizarre-${id}-color-theme.json`), 'utf8'));
    const colors = theme.colors;
    assertAA(colors['editorLineNumber.activeForeground'], variant.bg, `${id} active line number`);
    assertAA(colors['editor.selectionForeground'], colors['editor.selectionBackground'], `${id} selected editor text`);
    assertAA(colors['list.highlightForeground'], variant.bg3, `${id} list highlight on focused row`);
    assertAA(colors['textLink.foreground'], variant.bg, `${id} text link`);
    assertAA(colors['activityBarBadge.foreground'], colors['activityBarBadge.background'], `${id} activity badge`);
    assertAA(colors['button.foreground'], colors['button.background'], `${id} button`);
    assertNonText(colors.focusBorder, variant.bg2, `${id} focus border`);

    const normalText = [
      ['editorLineNumber.foreground', variant.bg],
      ['tab.inactiveForeground', variant.bg2],
      ['sideBarSectionHeader.foreground', variant.bg2],
      ['titleBar.inactiveForeground', variant.bg2],
      ['panelTitle.inactiveForeground', variant.bg],
      ['input.placeholderForeground', variant.bg2],
      ['gitDecoration.ignoredResourceForeground', variant.bg2],
      ['breadcrumb.foreground', variant.bg],
      ['descriptionForeground', variant.bg2],
    ];
    for (const [key, background] of normalText) assertAA(colors[key], background, `${id} ${key}`);
    assertNonText(colors['activityBar.inactiveForeground'], variant.bg2, `${id} inactive activity icon`);
  }
});

test('graphic accents retain Lime Ink while foreground accents use Lime Text', () => {
  const zed = JSON.parse(fs.readFileSync(path.join(root, 'editors/zed/themes/bizarre.json'), 'utf8'));
  const tmux = fs.readFileSync(path.join(root, 'terminals/tmux/bizarre.tmux.conf'), 'utf8');
  const tmuxInactive = [...tmux.matchAll(/window-status-format\s+"#\[fg=(#[0-9A-F]{6})\]/gu)].map((match) => match[1]);
  const tmuxPaneBorders = [...tmux.matchAll(/pane-active-border-style "fg=(#[0-9A-F]{6})"/gu)].map((match) => match[1]);
  const tmuxClockColors = [...tmux.matchAll(/clock-mode-colour "(#[0-9A-F]{6})"/gu)].map((match) => match[1]);
  assert.equal(tmuxInactive.length, palette.variantOrder.length);
  assert.equal(tmuxPaneBorders.length, palette.variantOrder.length);
  assert.equal(tmuxClockColors.length, palette.variantOrder.length);

  for (const [index, id] of palette.variantOrder.entries()) {
    const variant = palette.variants[id];
    const vscode = JSON.parse(fs.readFileSync(path.join(root, `editors/vscode/themes/bizarre-${id}-color-theme.json`), 'utf8'));
    assert.equal(vscode.colors.focusBorder, variant.accent, `${id} VS Code focus border`);

    const zedVariant = zed.themes.find((theme) => theme.name === variant.label).style;
    for (const key of ['border.focused', 'border.selected', 'panel.focused_border', 'pane.focused_border', 'icon.accent']) {
      assert.equal(zedVariant[key], variant.accent, `${id} Zed ${key}`);
    }

    assert.equal(tmuxInactive[index], variant.fgDim, `${id} tmux inactive window text`);
    assertAA(tmuxInactive[index], variant.bg, `${id} tmux inactive window text`);
    assert.equal(tmuxPaneBorders[index], variant.accent, `${id} tmux pane border`);
    assert.equal(tmuxClockColors[index], variant.accent, `${id} tmux clock graphic`);

    const bottom = fs.readFileSync(path.join(root, `tools/bottom/bizarre-${id}.toml`), 'utf8');
    assert.match(bottom, new RegExp(`selected_border_color = "${variant.accent}"`, 'u'), `${id} bottom border`);
    assert.match(bottom, new RegExp(`all_entry_color = "${variant.accentText}"`, 'u'), `${id} bottom CPU label`);
    assert.match(bottom, new RegExp(`cpu_core_colors = \\["${variant.accentText}"`, 'u'), `${id} bottom core label`);
    assert.match(bottom, new RegExp(`ram_color = "${variant.accentText}"`, 'u'), `${id} bottom RAM label`);
    assert.match(bottom, new RegExp(`tx_color = "${variant.accentText}"`, 'u'), `${id} bottom TX label`);
    assert.match(bottom, new RegExp(`graph_color = "${variant.fgDim}"`, 'u'), `${id} bottom graph chrome`);
    const k9s = fs.readFileSync(path.join(root, `tools/k9s/skins/bizarre-${id}.yaml`), 'utf8');
    assert.match(k9s, new RegExp(`logoColor: "${variant.accent}"`, 'u'), `${id} K9s logo`);
    assert.match(k9s, new RegExp(`focusColor: "${variant.accent}"`, 'u'), `${id} K9s focus border`);
    assert.match(k9s, new RegExp(`title:\\n\\s+fgColor: "${variant.accentText}"\\n\\s+bgColor: "${variant.bg}"\\n\\s+highlightColor: "${variant.accentText}"`, 'u'), `${id} K9s title highlight`);

    const hyprland = fs.readFileSync(path.join(root, `wm/hyprland/bizarre-${id}.conf`), 'utf8');
    assert.match(hyprland, new RegExp(`\\$bizarre_accent = rgb\\(${variant.accent.slice(1)}\\)`, 'u'), `${id} Hyprland accent`);
    for (const compositor of ['i3', 'sway']) {
      const config = fs.readFileSync(path.join(root, `wm/${compositor}/bizarre-${id}.conf`), 'utf8');
      assert.match(config, new RegExp(`set \\$bizarre_accent ${variant.accent}`, 'u'), `${id} ${compositor} accent`);
    }

    const startpage = fs.readFileSync(path.join(root, `web/startpages/bizarre-${id}.html`), 'utf8');
    assert.match(startpage, /h1 \{[^}]*color: var\(--bizarre-accent-text\)/su, `${id} startpage heading`);
  }
});

test('showcase terminal uses an AA branch label on its raised prompt segment', () => {
  for (const id of palette.variantOrder) {
    const variant = palette.variants[id];
    const branchForeground = variant.mode === 'light' ? variant.fg : variant.accentText;
    assertAA(branchForeground, variant.bg3, `${id} terminal branch label`);
  }

  const source = fs.readFileSync(path.join(root, 'showcase/showcase-terminal.jsx'), 'utf8');
  assert.match(source, /const branchFg = variant\.mode === 'light' \? variant\.fg : variant\.accentText;/u);
  assert.doesNotMatch(source, /background: smokeBg, color: variant\.accentText/u);
});

test('showcase captions and artifact paths use readable light-theme foregrounds', () => {
  for (const id of palette.variantOrder) {
    const variant = palette.variants[id];
    assertAA(variant.fgDim, variant.bg, `${id} card caption`);
    assertAA(variant.fgDim, variant.bg3, `${id} raised card caption`);
  }

  const source = fs.readFileSync(path.join(root, 'showcase/showcase-main.jsx'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'showcase/showcase.css'), 'utf8');
  assertNonText(palette.variants.void.fgFaint, palette.variants.void.bg, 'Void large display text');
  assert.match(css, /--display-muted: #7A7A7A/u);
  assert.match(css, /\.h1 \.gray \{ color: var\(--display-muted\); \}/u);
  assert.match(source, /color: v\.fgDim[^\n]*ansi 16/u);
  assert.match(css, /\.config-title code \{[^}]*color: var\(--dim\)[^}]*opacity: 1/u);
  assert.doesNotMatch(css, /\.config-title code \{[^}]*opacity: \.62/u);
});

test('showcase ANSI chip labels use opaque maximum-contrast black or white', () => {
  const html = fs.readFileSync(path.join(root, 'showcase/index.html'), 'utf8');
  const match = html.match(/window\.BZR_TEXT_ON = (\{[^;]+\});/u);
  assert.ok(match, 'showcase text-on-color map is missing');
  const textOn = JSON.parse(match[1]);
  for (const id of palette.variantOrder) {
    for (const [name, color] of Object.entries(palette.variants[id].ansi)) {
      assert.equal(textOn[color], strongestBlackOrWhite(color), `${id} ANSI ${name} label foreground`);
      assertAA(textOn[color], color, `${id} ANSI ${name} chip label`);
    }
  }
  const css = fs.readFileSync(path.join(root, 'showcase/showcase.css'), 'utf8');
  assert.match(css, /\.ansi-cell \.hex \{ opacity: 1;/u);
});

test('light adapters use Lime Text only as a foreground and Lime Ink only as a fill', () => {
  for (const id of ['paper', 'bone']) {
    const postman = fs.readFileSync(path.join(root, `devtools/postman/bizarre-${id}.css`), 'utf8');
    assert.match(postman, /color: var\(--bizarre-accent-text\) !important/u, `${id} Postman foreground`);
    assert.doesNotMatch(postman, /color: var\(--bizarre-accent\) !important/u, `${id} Postman Lime Ink foreground`);
  }

  const spotify = fs.readFileSync(path.join(root, 'apps/spotify/spicetify/user.css'), 'utf8');
  assert.match(spotify, /color: var\(--spice-text\)/u);
  assert.doesNotMatch(spotify, /color: var\(--spice-button\)/u);
});

test('WCAG calculations are not rounded into a false pass', () => {
  const ratio = contrast('#557A0D', palette.variants.bone.bg);
  assert.ok(ratio < 4.5, `control color unexpectedly passed at ${ratio}:1`);
});
