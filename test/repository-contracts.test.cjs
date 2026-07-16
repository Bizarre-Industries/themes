const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const palette = require('../palette.js');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function json(file) {
  return JSON.parse(read(file));
}

function noHash(value) {
  return value.replace(/^#/u, '').toUpperCase();
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function parseBase16(file) {
  return Object.fromEntries(
    read(file)
      .split('\n')
      .map((line) => line.match(/^(base[0-9A-F]{2}):\s+"([0-9A-F]{6})"$/u))
      .filter(Boolean)
      .map((match) => [match[1], match[2]]),
  );
}

function luminance(hex) {
  const raw = hex.replace(/^#/u, '');
  const channels = [0, 2, 4].map((offset) => Number.parseInt(raw.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

test('Xcode support is removed from code, docs, validation, and showcase', () => {
  assert.equal(fs.existsSync(path.join(root, 'editors/xcode')), false, 'editors/xcode must not exist');

  for (const file of [
    'scripts/generate.cjs',
    'scripts/validate.cjs',
    'README.md',
    'PORTS.md',
    'showcase/showcase-main.jsx',
    'showcase/index.html',
  ]) {
    assert.doesNotMatch(read(file), /\bxcode\b|xccolortheme|editor-xcode/iu, `${file} still advertises Xcode`);
  }
});

test('MIT license metadata is complete and consistent', () => {
  assert.equal(fs.existsSync(path.join(root, 'LICENSE')), true, 'LICENSE is missing');
  const license = read('LICENSE');
  assert.match(license, /MIT License/u);
  assert.match(license, /Copyright \(c\) 2026 Bizarre Industries/u);
  assert.match(license, /Permission is hereby granted, free of charge/u);
  assert.equal(json('package.json').license, 'MIT');
  assert.equal(json('package-lock.json').packages[''].license, 'MIT');
  assert.equal(json('editors/vscode/package.json').license, 'MIT');
});

test('README presents a static GitHub catalog and safe setup flow', () => {
  const readme = read('README.md');
  assert.match(readme, /static (?:GitHub )?catalog/iu);
  assert.doesNotMatch(readme, /interactive preview/iu);
  assert.doesNotMatch(readme, /local-(?:vscode|iterm2|zsh-banner|starship)\.png/u, 'README ships stale native captures');
  assert.match(readme, /npm ci/u);
  assert.match(readme, /npm run validate:strict/u);
  assert.match(readme, /portable[^\n]*explicit skips/iu);
  assert.match(readme, /strict[^\n]*missing validators[^\n]*fail/iu);

  const destructiveCommands = [
    /^\s*cp\s+prompt\/starship\.toml\s+~\/\.config\/starship\.toml\s*$/mu,
    /^\s*cp\s+tools\/aerospace\/aerospace\.toml\s+~\/\.config\/aerospace\/aerospace\.toml\s*$/mu,
    /^\s*cp\s+tools\/jujutsu\/config\.toml\s+~\/\.config\/jj\/config\.toml\s*$/mu,
  ];
  for (const pattern of destructiveCommands) assert.doesNotMatch(readme, pattern);

  assert.match(readme, /merge/iu);
  assert.match(readme, /existing config/iu);
});

test('generated documentation has current generator and version references', () => {
  assert.doesNotMatch(read('palette.js'), /scripts\/generate\.js\b/u);
  assert.doesNotMatch(read('scripts/generate.cjs'), /V0\.1/u);
});

test('static showcase entry point has no dormant interactive-control mount', () => {
  const html = read('showcase/index.html');
  assert.doesNotMatch(html, /useTweaks|TweaksPanel|TweakSelect|BZR_TWEAK_DEFAULTS/u);
});

test('Slack legacy imports use eight documented slots with readable text roles', () => {
  const lines = read('apps/slack/bizarre-sidebar-themes.txt').trim().split('\n');
  const labels = lines.filter((line) => line.startsWith('# Bizarre '));
  const imports = lines.filter((line) => /^#[0-9A-F]{6},/u.test(line));
  assert.equal(labels.length, palette.variantOrder.length);
  assert.equal(imports.length, palette.variantOrder.length);
  for (const [index, id] of palette.variantOrder.entries()) {
    const variant = palette.variants[id];
    const slots = imports[index].split(',');
    assert.deepEqual(slots, [
      variant.bg2,
      variant.bg,
      variant.accent,
      '#0E0E0E',
      variant.bg3,
      variant.fg,
      variant.syntax.ok,
      variant.syntax.error,
    ], `${id} Slack legacy slots`);
  }
});

test('static showcase runtime is local and precompiled after npm ci', () => {
  const html = read('showcase/index.html');
  assert.doesNotMatch(html, /https?:\/\//u, 'showcase runtime still depends on a CDN');
  assert.doesNotMatch(html, /type="text\/babel"|babel\.min\.js/u, 'showcase still transpiles JSX in the browser');
  assert.match(html, /\.\.\/node_modules\/react\/umd\/react\.development\.js/u);
  assert.match(html, /\.\.\/node_modules\/react-dom\/umd\/react-dom\.development\.js/u);
  assert.match(html, /showcase\.js/u);
  assert.equal(fs.existsSync(path.join(root, 'showcase/showcase.js')), true, 'precompiled showcase bundle is missing');
});

test('browser showcase verification is independent from native captures', () => {
  const manifest = json('showcase/assets/generated/manifest.json');
  assert.equal(Object.hasOwn(manifest, 'nativeScreenshots'), false, 'browser manifest still owns native capture hashes');
  assert.doesNotMatch(read('scripts/render-showcase.cjs'), /missing native showcase screenshot/u);
});

test('native capture verification has a separate read-only manifest', () => {
  const { localInputState, localShots, verifyLocalCaptures } = require('../scripts/render-local-captures.cjs');
  const scripts = json('package.json').scripts;
  assert.equal(scripts['check:local'], 'node scripts/render-local-captures.cjs --check');
  assert.doesNotMatch(scripts.test, /check:local|render:local/u, 'npm test must not require unpublished native captures');
  assert.doesNotMatch(read('.github/workflows/verify.yml'), /render:local/u, 'CI must never capture native applications');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-local-check-'));
  const manifestFile = path.join(directory, 'local-manifest.json');
  const state = localInputState();
  const captures = localShots.map((file) => {
    const bytes = Buffer.from(`capture:${file}`);
    fs.writeFileSync(path.join(directory, file), bytes);
    return { file, sha256: sha256(bytes) };
  });
  fs.writeFileSync(manifestFile, `${JSON.stringify({ version: 2, ...state, captures }, null, 2)}\n`);

  assert.deepEqual(verifyLocalCaptures(directory, manifestFile), []);
  const before = fs.readFileSync(manifestFile);
  fs.writeFileSync(manifestFile, `${JSON.stringify({ version: 2, ...state, inputFingerprint: '0'.repeat(64), captures }, null, 2)}\n`);
  assert.match(verifyLocalCaptures(directory, manifestFile).join('\n'), /inputs changed/u);
  fs.writeFileSync(manifestFile, before);
  fs.writeFileSync(path.join(directory, localShots[0]), 'changed');
  assert.match(verifyLocalCaptures(directory, manifestFile).join('\n'), /changed/u);
  assert.deepEqual(fs.readFileSync(manifestFile), before, 'native verification modified its manifest');
});

test('native capture commit publishes only a complete staged set', () => {
  const { commitLocalCaptures, localShots, verifyLocalCaptures } = require('../scripts/render-local-captures.cjs');
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-local-commit-'));
  const staging = path.join(workspace, 'staging');
  const output = path.join(workspace, 'output');
  const manifestFile = path.join(output, 'local-manifest.json');
  fs.mkdirSync(staging);
  for (const file of localShots.slice(0, -1)) fs.writeFileSync(path.join(staging, file), `capture:${file}`);

  assert.throws(() => commitLocalCaptures(staging, output, manifestFile), /did not produce/u);
  assert.equal(fs.existsSync(manifestFile), false, 'incomplete capture set published a manifest');

  const finalFile = localShots.at(-1);
  fs.writeFileSync(path.join(staging, finalFile), `capture:${finalFile}`);
  commitLocalCaptures(staging, output, manifestFile);
  assert.deepEqual(verifyLocalCaptures(output, manifestFile), []);
  assert.deepEqual(fs.readdirSync(output).filter((file) => file.includes('.tmp-')), []);
});

test('showcase cleanup removes only unchanged browser screenshots it previously hashed', () => {
  const { localShots, removeObsoleteScreenshots } = require('../scripts/render-showcase.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-showcase-cleanup-'));
  const unchanged = Buffer.from('owned browser screenshot');
  const modified = Buffer.from('user modified screenshot');
  const native = Buffer.from('native screenshot');
  fs.writeFileSync(path.join(directory, 'obsolete.png'), unchanged);
  fs.writeFileSync(path.join(directory, 'modified.png'), modified);
  fs.writeFileSync(path.join(directory, 'local-native.png'), native);
  for (const file of localShots) fs.writeFileSync(path.join(directory, file), native);

  removeObsoleteScreenshots({ screenshots: [
    { file: 'obsolete.png', sha256: sha256(unchanged) },
    { file: 'modified.png', sha256: sha256('old bytes') },
    { file: 'local-native.png', sha256: sha256(native) },
    ...localShots.map((file) => ({ file, sha256: sha256(native) })),
  ] }, new Set(), directory);

  assert.equal(fs.existsSync(path.join(directory, 'obsolete.png')), false);
  assert.equal(fs.readFileSync(path.join(directory, 'modified.png'), 'utf8'), modified.toString());
  assert.equal(fs.existsSync(path.join(directory, 'local-native.png')), false);
  for (const file of localShots) assert.equal(fs.readFileSync(path.join(directory, file), 'utf8'), native.toString());
});

test('every showcase target exists and previews its actual variant', () => {
  const source = read('showcase/showcase-main.jsx');
  const records = [];
  const pattern = /\{[^{}\n]*\bfile:\s*'([^']+)'[^{}\n]*\bvariant:\s*'([^']+)'[^{}\n]*\}/gu;
  for (const match of source.matchAll(pattern)) records.push({ file: match[1], variant: match[2] });
  assert.ok(records.length >= 80, `expected at least 80 showcase targets, found ${records.length}`);

  const slugs = [...palette.variantOrder].sort((a, b) => b.length - a.length);
  for (const record of records) {
    assert.equal(fs.existsSync(path.join(root, record.file)), true, `missing showcase target ${record.file}`);
    const artifactVariant = slugs.find((id) => record.file.includes(`bizarre-${id}`)
      || record.file.includes(`bizarre_${id.replaceAll('-', '_')}`));
    if (artifactVariant) {
      assert.equal(record.variant, artifactVariant, `${record.file} renders ${record.variant}, not ${artifactVariant}`);
    } else {
      assert.equal(record.variant, 'void', `${record.file} is a default/aggregate artifact and must render void`);
    }
  }
});

test('Base16 schemes match the documented Bizarre semantic mapping', () => {
  for (const id of palette.variantOrder) {
    const variant = palette.variants[id];
    const slots = parseBase16(`editors/neovim-base16/bizarre-${id}.yaml`);
    const base0A = variant.mode === 'dark' ? variant.accentSoft : variant.accentText;
    const expected = {
      base00: variant.bg,
      base01: variant.bg2,
      base02: variant.bg3,
      base03: variant.fgDim,
      base04: variant.fgDim,
      base05: variant.fgDim,
      base06: variant.fg,
      base07: variant.ansi.brWhite,
      base08: variant.syntax.error,
      base09: variant.syntax.num,
      base0A,
      base0B: variant.syntax.string,
      base0C: variant.syntax.rgx,
      base0D: variant.syntax.fn,
      base0E: variant.syntax.decorator,
      base0F: variant.syntax.type,
    };
    assert.deepEqual(slots, Object.fromEntries(Object.entries(expected).map(([key, value]) => [key, noHash(value)])), id);

    const ramp = Array.from({ length: 8 }, (_, index) => luminance(slots[`base0${index}`]));
    for (let index = 1; index < ramp.length; index += 1) {
      if (variant.mode === 'dark') assert.ok(ramp[index] >= ramp[index - 1], `${id} neutral ramp is not ascending`);
      else assert.ok(ramp[index] <= ramp[index - 1], `${id} neutral ramp is not descending`);
    }
  }
});

test('tmux variant option selects one of five real branches', () => {
  const source = read('terminals/tmux/bizarre.tmux.conf');
  assert.match(source, /@bizarre-variant/u);
  assert.doesNotMatch(source, /Uncomment to use/iu);
  for (const id of palette.variantOrder) assert.match(source, new RegExp(`%el(?:)?if[^\\n]*${id}|%if[^\\n]*${id}`, 'u'));
  assert.match(source, /invalid|unknown/iu);
});

test('Sketch export preserves semantic aliases instead of de-duplicating hex values', () => {
  const data = json('design/sketch/bizarre.sketchpalette');
  const actual = new Set(data.colors.map((color) => color.name));
  const expected = Object.keys(palette.brand).map((key) => `brand/${key}`);
  for (const id of palette.variantOrder) {
    for (const key of ['bg', 'bg2', 'bg3', 'fg', 'accent', 'accentText', 'border', 'selection']) {
      expected.push(`${id}/${key}`);
    }
  }
  for (const name of expected) assert.equal(actual.has(name), true, `missing Sketch semantic color ${name}`);
  assert.equal(actual.size, expected.length, 'Sketch export contains missing or duplicate semantic names');
});

test('generated SVG badge exists, is tracked, and is explicitly validated', () => {
  const badge = 'devtools/github-readme-assets/bizarre-badge.svg';
  assert.equal(fs.existsSync(path.join(root, badge)), true, 'generated badge is missing');
  const ignored = spawnSync('git', ['check-ignore', '--no-index', '-q', '--', badge], { cwd: root });
  assert.equal(ignored.status, 1, 'generated badge is still ignored');
  assert.match(read('scripts/validate.cjs'), /devtools\/github-readme-assets\/bizarre-badge\.svg/u);
});

test('generator never inspects or deletes AGENTS.md', () => {
  assert.doesNotMatch(read('scripts/generate.cjs'), /AGENTS\.md|maybeRemoveMemoryAgents/u);
});

test('portable validation does not write Python bytecode into the repository', () => {
  const validator = read('scripts/validate.cjs');
  assert.doesNotMatch(validator, /py_compile/u);
  assert.match(validator, /compile\(pathlib\.Path\(sys\.argv\[1\]\)\.read_bytes\(\), sys\.argv\[1\], ["']exec["']\)/u);
});
