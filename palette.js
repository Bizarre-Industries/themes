// Bizarre Industries — canonical palette
// Single source of truth. All editor + terminal configs are generated
// from this file by scripts/generate.js. Edit here, never edit configs.
//
// Layout:
//   brand            — fixed brand anchors (Signal Lime, Void Gray, etc.)
//   syntax.dark      — 27-role syntax map for any dark surface
//   syntax.light     — 27-role syntax map for any light surface
//   ansi.dark        — 16 ANSI tones for dark terminals
//   ansi.light       — 16 ANSI tones for light terminals
//   variants[id]     — per-variant overrides (5 flavors)
//
// Token roles (matching showcase/syntax.css and showcase/samples.js):
//   pl plain · p punct · op operator
//   kw-ctrl (if/for/return) · kw-decl (const/fn/class) · kw-mod (pub/async/static)
//   s string · tmpl template body · esc escape · rgx regex
//   n number · bool true/false/null · const SCREAMING_CASE
//   t type · tprim primitive type
//   f function · method · prop · param · v variable · this self/this
//   b builtin · ns namespace · d decorator · pre preprocessor
//   c comment · cdoc doc-comment · tag jsx/html tag · attr jsx/html attr

const brand = {
  signalLime:  '#C6FF24',  // hero accent on dark
  limeGlow:    '#E8FF8A',  // secondary accent / hover
  limeInk:     '#5F8A0F',  // accent on light (WCAG AA on paper)
  acidLime:    '#A8FF00',  // optional saturated punch
  voidGray:    '#545454',  // structural neutral
};

// Typography — GitHub Monaspace family (industrial / utilitarian, fits the
// "bench at midnight" register better than a generic coding mono).
//   Xenon  — slab serif, used for headings and brand wordmark
//   Neon   — geometric sans, the default code mono
//   Argon  — humanist, alt comments / docstrings
//   Krypton — modular industrial, eyebrows / labels
//   Radon  — handwriting, signage / annotations
const fonts = {
  // CSS stacks (with safe fallbacks)
  display:  "'Monaspace Xenon', 'Monaspace Neon', 'Menlo', monospace",
  mono:     "'Monaspace Neon', 'Menlo', 'SFMono-Regular', monospace",
  prose:    "'Monaspace Argon', 'Monaspace Neon', ui-monospace, monospace",
  label:    "'Monaspace Krypton', 'Monaspace Neon', monospace",
  hand:     "'Monaspace Radon', 'Monaspace Neon', monospace",

  // Bare family names for editors / terminals that take the family as a string
  display_family: 'Monaspace Xenon',
  mono_family:    'Monaspace Neon',
  prose_family:   'Monaspace Argon',
  label_family:   'Monaspace Krypton',
  hand_family:    'Monaspace Radon',
};

// Diagnostic / status colors — shared across syntax + UI
const statusDark = {
  error:  '#FF6F77',
  warn:   '#FFB85C',
  ok:     '#5BD06B',
  info:   '#7BB3FF',
  hint:   '#D88AE0',
};
const statusLight = {
  error:  '#B8276F',
  warn:   '#9F4A0E',
  ok:     '#3F7A1F',
  info:   '#1F4FB0',
  hint:   '#7E2A9A',
};

// 27-role syntax — DARK (renders on any of the dark variant bgs)
const syntaxDark = {
  plain:      '#E4E4E4',
  punct:      '#7A7A7A',
  op:         '#9DEAEA',
  kwCtrl:     '#FF8FCF',
  kwDecl:     '#D88AE0',
  kwMod:      '#B989E5',
  string:     '#E8A33D',
  tmpl:       '#FFC36B',
  esc:        '#FFE08A',
  rgx:        '#FF9E3D',
  num:        '#7BB3FF',
  bool:       '#5B9FFF',
  constant:   '#9DD0FF',
  type:       '#7AD9D9',
  tprim:      '#7AD9D9',
  fn:         '#C6FF24',
  method:     '#A8E658',
  prop:       '#C6E58B',
  param:      '#FFB07A',
  variable:   '#E4E4E4',
  self:       '#FF8FCF',
  builtin:    '#E8A33D',
  ns:         '#9DEAEA',
  decorator:  '#FF8FCF',
  pre:        '#B989E5',
  comment:    '#6F6F6F',
  docComment: '#9AB585',
  tag:        '#FF8FCF',
  attr:       '#C6FF24',
  ...statusDark,
};

// 27-role syntax — LIGHT (renders on any of the light variant bgs)
const syntaxLight = {
  plain:      '#1A1A1A',
  punct:      '#8A8576',
  op:         '#0F6E6E',
  kwCtrl:     '#B8276F',
  kwDecl:     '#7E2A9A',
  kwMod:      '#603F94',
  string:     '#9F4A0E',
  tmpl:       '#B85A1A',
  esc:        '#7A6308',
  rgx:        '#A85C1B',
  num:        '#1F4FB0',
  bool:       '#1B4099',
  constant:   '#2F5DC2',
  type:       '#0F6E6E',
  tprim:      '#0F6E6E',
  fn:         '#5F8A0F',
  method:     '#4A7409',
  prop:       '#5C7A2A',
  param:      '#A0480E',
  variable:   '#1A1A1A',
  self:       '#B8276F',
  builtin:    '#9F4A0E',
  ns:         '#0F6E6E',
  decorator:  '#B8276F',
  pre:        '#603F94',
  comment:    '#9A9482',
  docComment: '#5C7A2A',
  tag:        '#B8276F',
  attr:       '#5F8A0F',
  ...statusLight,
};

// 16 ANSI for dark terminals — bright_green is Signal Lime (the hero)
const ansiDark = {
  black:     '#1A1A1A',
  red:       '#F0525B',
  green:     '#3FB950',
  yellow:    '#E8A33D',
  blue:      '#5B9FFF',
  magenta:   '#D88AE0',
  cyan:      '#7AD9D9',
  white:     '#E4E4E4',
  brBlack:   '#3D3D3D',
  brRed:     '#FF6F77',
  brGreen:   '#C6FF24', // Signal Lime
  brYellow:  '#FFB85C',
  brBlue:    '#7BB3FF',
  brMagenta: '#E8A8EE',
  brCyan:    '#9DEAEA',
  brWhite:   '#FFFFFF',
};

// 16 ANSI for light terminals — bright_green is Lime Ink
const ansiLight = {
  black:     '#1A1A1A',
  red:       '#C13039',
  green:     '#3F7A1F',
  yellow:    '#9F4A0E',
  blue:      '#1F4FB0',
  magenta:   '#7E2A9A',
  cyan:      '#0F6E6E',
  white:     '#545454',
  brBlack:   '#7A7568',
  brRed:     '#E04050',
  brGreen:   '#5F8A0F', // Lime Ink
  brYellow:  '#C28225',
  brBlue:    '#3D78C7',
  brMagenta: '#A55EAF',
  brCyan:    '#4FA3A3',
  brWhite:   '#0E0E0E',
};

// 5 canonical variants — every editor and terminal ships these five.
// Each variant defines surface chrome only; syntax + ANSI come from the
// shared dark or light maps above.
const variants = {
  'void': {
    label: 'Bizarre Void',
    sub:   'pure void · lime accent · the default',
    mode:  'dark',
    bg:    '#0E0E0E',
    bg2:   '#1A1A1A',
    bg3:   '#2B2B2B',
    bg4:   '#3D3D3D',
    fg:    '#E4E4E4',
    fgDim: '#9C9C9C',
    fgFaint:'#7A7A7A',
    fgGhost:'#545454',
    cursor: brand.signalLime,
    sel:   '#2B3A0E',
    line:  '#1A1A1A',
    border:'#3D3D3D',
    accent: brand.signalLime,
    accentSoft: brand.limeGlow,
    syntax: syntaxDark,
    ansi:   ansiDark,
  },
  'void-hicontrast': {
    label: 'Bizarre Void Hi-Contrast',
    sub:   'pure black · max lime · OLED / projector',
    mode:  'dark',
    bg:    '#000000',
    bg2:   '#0E0E0E',
    bg3:   '#1F1F1F',
    bg4:   '#3D3D3D',
    fg:    '#F9F8F2',
    fgDim: '#B8B8B8',
    fgFaint:'#7A7A7A',
    fgGhost:'#545454',
    cursor: brand.signalLime,
    sel:   '#3A4D0E',
    line:  '#0E0E0E',
    border:'#545454',
    accent: brand.signalLime,
    accentSoft: brand.limeGlow,
    syntax: syntaxDark,
    ansi:   { ...ansiDark, black: '#000000' },
  },
  'workshop': {
    label: 'Bizarre Workshop',
    sub:   'warm dark · lower contrast · long sessions',
    mode:  'dark',
    bg:    '#1A1815',
    bg2:   '#23211C',
    bg3:   '#2D2A23',
    bg4:   '#3D3A33',
    fg:    '#E4E2DA',
    fgDim: '#9C9A91',
    fgFaint:'#7A7568',
    fgGhost:'#545040',
    cursor: brand.signalLime,
    sel:   '#3A3618',
    line:  '#23211C',
    border:'#3D3A33',
    accent: brand.signalLime,
    accentSoft: brand.limeGlow,
    syntax: syntaxDark,
    ansi:   { ...ansiDark, black: '#1A1815' },
  },
  'paper': {
    label: 'Bizarre Paper',
    sub:   'warm off-white · lime ink · the default light',
    mode:  'light',
    bg:    '#F9F8F2',
    bg2:   '#F2F0EA',
    bg3:   '#E6E3DA',
    bg4:   '#D8D4C7',
    fg:    '#1F1F1F',
    fgDim: '#3D3D3D',
    fgFaint:'#7A7568',
    fgGhost:'#A8A395',
    cursor: brand.limeInk,
    sel:   '#DCEFA8',
    line:  '#F2F0EA',
    border:'#D8D4C7',
    accent: brand.limeInk,
    accentSoft: '#9FCC1F',
    syntax: syntaxLight,
    ansi:   ansiLight,
  },
  'bone': {
    label: 'Bizarre Bone',
    sub:   'softer light · warmer neutrals',
    mode:  'light',
    bg:    '#F5F2EA',
    bg2:   '#EDE9DD',
    bg3:   '#DDD8CB',
    bg4:   '#C8C2B2',
    fg:    '#2B2B2B',
    fgDim: '#4A4A4A',
    fgFaint:'#857F70',
    fgGhost:'#B0AA9A',
    cursor: brand.limeInk,
    sel:   '#D4E89F',
    line:  '#EDE9DD',
    border:'#DDD8CB',
    accent: brand.limeInk,
    accentSoft: '#9FCC1F',
    syntax: syntaxLight,
    ansi:   { ...ansiLight, black: '#2B2B2B' },
  },
};

module.exports = {
  brand,
  fonts,
  syntax: { dark: syntaxDark, light: syntaxLight },
  status: { dark: statusDark, light: statusLight },
  ansi:   { dark: ansiDark,   light: ansiLight   },
  variants,
  variantOrder: ['void', 'void-hicontrast', 'workshop', 'paper', 'bone'],
};
