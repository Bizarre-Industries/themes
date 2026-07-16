const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const palette = require('../palette.js');

const root = path.resolve(__dirname, '..');
const showcaseCss = fs.readFileSync(path.join(root, 'showcase/showcase.css'), 'utf8');

const expectedSchemaTokens = [
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
];

test('Open Design model exposes the exact schema and five artifact modes', () => {
  const { OD_SCHEMA_TOKENS, buildOpenDesignModel } =
    require('../scripts/lib/open-design/model.cjs');
  const model = buildOpenDesignModel({ palette, showcaseCss });

  assert.deepEqual(OD_SCHEMA_TOKENS, expectedSchemaTokens);
  assert.equal(OD_SCHEMA_TOKENS.length, 56);
  assert.equal(new Set(OD_SCHEMA_TOKENS).size, 56);
  assert.ok(Object.isFrozen(OD_SCHEMA_TOKENS));
  assert.equal(model.defaultMode, 'void');
  assert.deepEqual(Object.keys(model.modes), palette.variantOrder);
  for (const id of palette.variantOrder) {
    assert.deepEqual(Object.keys(model.modes[id].od).sort(), [...OD_SCHEMA_TOKENS].sort());
  }
});

test('Void is the root contract and modes preserve accent semantics', () => {
  const { buildOpenDesignModel } = require('../scripts/lib/open-design/model.cjs');
  const model = buildOpenDesignModel({ palette, showcaseCss });

  assert.equal(model.modes.void.od['--bg'], palette.variants.void.bg);
  assert.equal(model.modes.void.od['--accent'], palette.variants.void.accent);
  assert.equal(model.modes.paper.od['--accent'], palette.variants.paper.accent);
  assert.equal(model.modes.paper.bizarre['--bzr-accent-text'], palette.variants.paper.accentText);
  assert.notEqual(model.modes.paper.od['--accent-on'], palette.variants.paper.accentText);
});

test('Open Design fallbacks are replaced by source-backed or explicit neutral values', () => {
  const { buildOpenDesignModel } = require('../scripts/lib/open-design/model.cjs');
  const model = buildOpenDesignModel({ palette, showcaseCss });
  const rootTokens = model.modes.void.od;

  assert.equal(rootTokens['--font-body'], palette.fonts.prose);
  assert.equal(rootTokens['--motion-fast'], '0ms');
  assert.equal(rootTokens['--motion-base'], '0ms');
  assert.equal(rootTokens['--ease-standard'], 'linear');
  assert.equal(rootTokens['--radius-pill'], '2px');
  assert.equal(rootTokens['--container-max'], '100%');
  assert.deepEqual(model.derived['--section-y-desktop'], {
    value: '88px',
    source: 'showcase/showcase.css:.section',
  });
  assert.deepEqual(model.derived['--focus-ring'], {
    value: '0 0 0 2px var(--accent)',
    source: 'derived/accessibility',
  });
  assert.equal(rootTokens['--elev-flat'], 'none');
  assert.equal(rootTokens['--elev-ring'], '0 0 0 1px var(--border)');
  assert.equal(rootTokens['--elev-raised'], 'none');
  assert.equal(rootTokens['--focus-ring'], '0 0 0 2px var(--accent)');
});

test('chooseOnFill selects the stronger canonical foreground by WCAG contrast', () => {
  const { chooseOnFill } = require('../scripts/lib/open-design/model.cjs');

  assert.equal(chooseOnFill('#C6FF24'), '#0E0E0E');
  assert.equal(chooseOnFill('#0E0E0E'), '#F9F8F2');
});

test('Bizarre extensions preserve source roles for every artifact mode', () => {
  const { buildOpenDesignModel } = require('../scripts/lib/open-design/model.cjs');
  const model = buildOpenDesignModel({ palette, showcaseCss });
  const sourceName = (name) => name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
  const ansiName = (name) => sourceName(name).replace(/^br-/u, 'bright-');

  for (const id of palette.variantOrder) {
    const variant = palette.variants[id];
    const tokens = model.modes[id].bizarre;

    for (const [name, value] of Object.entries(palette.brand)) {
      assert.equal(tokens[`--bzr-${sourceName(name)}`], value, `${id} brand.${name}`);
    }
    for (const [name, value] of Object.entries(variant.syntax)) {
      assert.equal(tokens[`--bzr-syntax-${sourceName(name)}`], value, `${id} syntax.${name}`);
    }
    for (const [name, value] of Object.entries(palette.status[variant.mode])) {
      assert.equal(tokens[`--bzr-status-${name}`], value, `${id} status.${name}`);
    }
    for (const [name, value] of Object.entries(variant.ansi)) {
      assert.equal(tokens[`--bzr-ansi-${ansiName(name)}`], value, `${id} ansi.${name}`);
    }

    assert.equal(tokens['--bzr-accent-text'], variant.accentText);
    assert.equal(tokens['--bzr-cursor'], variant.cursor);
    assert.equal(tokens['--bzr-cursor-blink'], '1.1s steps(1)');
  }
});
