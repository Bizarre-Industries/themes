'use strict';

const DARK_ON_FILL = '#0E0E0E';
const LIGHT_ON_FILL = '#F9F8F2';

const OD_SCHEMA_TOKENS = Object.freeze([
  '--bg', '--surface', '--surface-warm',
  '--fg', '--fg-2', '--muted', '--meta',
  '--border', '--border-soft',
  '--accent', '--accent-on', '--accent-hover', '--accent-active',
  '--success', '--warn', '--danger',
  '--font-display', '--font-body', '--font-mono',
  '--text-xs', '--text-sm', '--text-base', '--text-lg',
  '--text-xl', '--text-2xl', '--text-3xl', '--text-4xl',
  '--leading-body', '--leading-tight', '--tracking-display',
  '--space-1', '--space-2', '--space-3', '--space-4',
  '--space-5', '--space-6', '--space-8', '--space-12',
  '--section-y-desktop', '--section-y-tablet', '--section-y-phone',
  '--radius-sm', '--radius-md', '--radius-lg', '--radius-pill',
  '--elev-flat', '--elev-ring', '--elev-raised', '--focus-ring',
  '--motion-fast', '--motion-base', '--ease-standard',
  '--container-max', '--container-gutter-desktop',
  '--container-gutter-tablet', '--container-gutter-phone',
]);

const DERIVED = Object.freeze({
  '--text-xs': ['10px', 'showcase/showcase.css:.lime-meta'],
  '--text-sm': ['11px', 'showcase/showcase.css:.eyebrow'],
  '--text-base': ['13px', 'showcase/showcase.css:.code'],
  '--text-lg': ['17px', 'showcase/showcase.css:.lede'],
  '--text-xl': ['18px', 'showcase/showcase.css:.variant-name'],
  '--text-2xl': ['30px', 'showcase/showcase.css:.section-title'],
  '--text-3xl': ['48px', 'showcase/showcase.css:.h1 minimum'],
  '--text-4xl': ['96px', 'showcase/showcase.css:.h1 maximum'],
  '--leading-body': ['1.6', 'showcase/showcase.css:.lede'],
  '--leading-tight': ['0.94', 'showcase/showcase.css:.h1'],
  '--tracking-display': ['0', 'showcase/showcase.css:.h1'],
  '--space-1': ['4px', 'showcase/showcase.css:.mini-ansi gap'],
  '--space-2': ['8px', 'showcase/showcase.css:.ansi-cell padding'],
  '--space-3': ['12px', 'showcase/showcase.css:.eyebrow gap'],
  '--space-4': ['16px', 'showcase/showcase.css:.slogan-strip padding'],
  '--space-5': ['18px', 'showcase/showcase.css:.hero-meta gap'],
  '--space-6': ['24px', 'showcase/showcase.css:.section-head gap'],
  '--space-8': ['32px', 'showcase/showcase.css:.section-head margin'],
  '--space-12': ['56px', 'showcase/showcase.css:.hero-grid gap'],
  '--section-y-desktop': ['88px', 'showcase/showcase.css:.section'],
  '--section-y-tablet': ['88px', 'showcase/showcase.css:.section'],
  '--section-y-phone': ['88px', 'showcase/showcase.css:.section'],
  '--radius-sm': ['2px', 'showcase/showcase.css:.pill'],
  '--radius-md': ['4px', 'showcase/showcase.css:.lime-swatch'],
  '--radius-lg': ['6px', 'showcase/showcase.css:.variant-card'],
  '--radius-pill': ['2px', 'showcase/showcase.css:.pill'],
  '--elev-flat': ['none', 'derived/showcase'],
  '--elev-ring': ['0 0 0 1px var(--border)', 'showcase/showcase.css:hairline borders'],
  '--elev-raised': ['none', 'derived/showcase'],
  '--focus-ring': ['0 0 0 2px var(--accent)', 'derived/accessibility'],
  '--motion-fast': ['0ms', 'explicit neutral:no general motion contract'],
  '--motion-base': ['0ms', 'explicit neutral:no general motion contract'],
  '--ease-standard': ['linear', 'explicit neutral:no general motion contract'],
  '--container-max': ['100%', 'showcase/showcase.css full-width sections'],
  '--container-gutter-desktop': ['64px', 'showcase/showcase.css:.section'],
  '--container-gutter-tablet': ['20px', 'showcase/showcase.css media rule'],
  '--container-gutter-phone': ['20px', 'showcase/showcase.css media rule'],
});

const DERIVED_MODEL = Object.freeze(Object.fromEntries(
  Object.entries(DERIVED).map(([name, [value, source]]) => [
    name,
    Object.freeze({ value, source }),
  ]),
));

function normalizeHex(hex) {
  if (typeof hex !== 'string') throw new TypeError('background must be a hexadecimal color');
  const match = hex.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/iu);
  if (!match) throw new TypeError(`unsupported hexadecimal color: ${hex}`);
  const digits = match[1].length === 3
    ? [...match[1]].map((digit) => `${digit}${digit}`).join('')
    : match[1];
  return [0, 2, 4].map((offset) => Number.parseInt(digits.slice(offset, offset + 2), 16) / 255);
}

function luminance(hex) {
  const channels = normalizeHex(hex).map((channel) => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(left, right) {
  const values = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function chooseOnFill(background) {
  return contrast(DARK_ON_FILL, background) >= contrast(LIGHT_ON_FILL, background)
    ? DARK_ON_FILL
    : LIGHT_ON_FILL;
}

function sourceName(name) {
  return name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
}

function ansiName(name) {
  return sourceName(name).replace(/^br-/u, 'bright-');
}

function mapTokens(entries, prefix, nameMapper = sourceName) {
  return Object.fromEntries(Object.entries(entries).map(([name, value]) => [
    `${prefix}${nameMapper(name)}`,
    value,
  ]));
}

function buildBizarreTokens({ brand, fonts, status, variant }) {
  return {
    ...mapTokens(brand, '--bzr-'),
    '--bzr-bg': variant.bg,
    '--bzr-bg-2': variant.bg2,
    '--bzr-bg-3': variant.bg3,
    '--bzr-bg-4': variant.bg4,
    '--bzr-fg': variant.fg,
    '--bzr-fg-dim': variant.fgDim,
    '--bzr-fg-faint': variant.fgFaint,
    '--bzr-fg-ghost': variant.fgGhost,
    '--bzr-selection': variant.sel,
    '--bzr-line': variant.line,
    '--bzr-border': variant.border,
    '--bzr-accent': variant.accent,
    '--bzr-accent-text': variant.accentText,
    '--bzr-accent-soft': variant.accentSoft,
    '--bzr-info': status.info,
    '--bzr-hint': status.hint,
    '--bzr-font-label': fonts.label,
    '--bzr-font-hand': fonts.hand,
    ...mapTokens(variant.syntax, '--bzr-syntax-'),
    ...mapTokens(status, '--bzr-status-'),
    ...mapTokens(variant.ansi, '--bzr-ansi-', ansiName),
    '--bzr-cursor': variant.cursor,
    '--bzr-cursor-blink': '1.1s steps(1)',
  };
}

function buildOpenDesignTokens({ fonts, status, variant }) {
  const values = {
    '--bg': variant.bg,
    '--surface': variant.bg2,
    '--surface-warm': variant.bg3,
    '--fg': variant.fg,
    '--fg-2': variant.fgDim,
    '--muted': variant.fgFaint,
    '--meta': variant.fgGhost,
    '--border': variant.border,
    '--border-soft': variant.line,
    '--accent': variant.accent,
    '--accent-on': chooseOnFill(variant.accent),
    '--accent-hover': variant.accent,
    '--accent-active': variant.accent,
    '--success': status.ok,
    '--warn': status.warn,
    '--danger': status.error,
    '--font-display': fonts.display,
    '--font-body': fonts.prose,
    '--font-mono': fonts.mono,
    ...Object.fromEntries(Object.entries(DERIVED_MODEL).map(([name, entry]) => [name, entry.value])),
  };

  return Object.fromEntries(OD_SCHEMA_TOKENS.map((name) => [name, values[name]]));
}

function buildOpenDesignModel({ palette, showcaseCss }) {
  if (typeof showcaseCss !== 'string' || showcaseCss.trim() === '') {
    throw new TypeError('showcaseCss must contain showcase/showcase.css text');
  }

  const modes = Object.fromEntries(palette.variantOrder.map((id) => {
    const variant = palette.variants[id];
    const status = palette.status[variant.mode];
    return [id, {
      id,
      label: variant.label,
      sub: variant.sub,
      mode: variant.mode,
      od: buildOpenDesignTokens({ fonts: palette.fonts, status, variant }),
      bizarre: buildBizarreTokens({
        brand: palette.brand,
        fonts: palette.fonts,
        status,
        variant,
      }),
    }];
  }));

  return {
    defaultMode: 'void',
    modes,
    derived: DERIVED_MODEL,
  };
}

module.exports = {
  OD_SCHEMA_TOKENS,
  buildOpenDesignModel,
  chooseOnFill,
};
