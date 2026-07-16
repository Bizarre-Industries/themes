'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const palette = require('../palette.js');
const {
  OD_SCHEMA_TOKENS,
  buildOpenDesignModel,
} = require('../scripts/lib/open-design/model.cjs');
const {
  renderBizarreTokensCss,
  renderDesignTokensJson,
  renderTailwindV4Css,
  renderTokensCss,
} = require('../scripts/lib/open-design/render-tokens.cjs');
const {
  renderDesignMd,
  renderEvidenceMd,
  renderManifest,
  renderMetadata,
  renderTokenContractReport,
  renderUsageMd,
} = require('../scripts/lib/open-design/render-docs.cjs');
const {
  renderComponentsHtml,
  renderComponentsManifest,
  renderPreviewPages,
  renderSystemKit,
} = require('../scripts/lib/open-design/render-components.cjs');

const root = path.resolve(__dirname, '..');
const readme = fs.readFileSync(path.join(root, 'README.md'));
const showcaseCss = fs.readFileSync(path.join(root, 'showcase/showcase.css'), 'utf8');
const model = buildOpenDesignModel({ palette, showcaseCss });
const head = '0123456789abcdef0123456789abcdef01234567';
const alternateHead = '89abcdef0123456789abcdef0123456789abcdef';

const fontEntries = [
  ['Monaspace Argon', 'argon', 400],
  ['Monaspace Argon', 'argon', 600],
  ['Monaspace Argon', 'argon', 700],
  ['Monaspace Krypton', 'krypton', 400],
  ['Monaspace Krypton', 'krypton', 600],
  ['Monaspace Krypton', 'krypton', 700],
  ['Monaspace Neon', 'neon', 400],
  ['Monaspace Neon', 'neon', 600],
  ['Monaspace Neon', 'neon', 700],
  ['Monaspace Xenon', 'xenon', 400],
  ['Monaspace Xenon', 'xenon', 600],
  ['Monaspace Xenon', 'xenon', 700],
].map(([family, slug, weight]) => ({
  family,
  file: `fonts/monaspace-${slug}-latin-${weight}-normal.woff2`,
  weight,
  style: 'normal',
}));

const previewPages = [
  ['overview', 'overview', 'Overview'],
  ['variants', 'variants', 'Variants'],
  ['colors', 'colors', 'Colors'],
  ['syntax-ansi', 'syntax-ansi', 'Syntax and ANSI'],
  ['typography', 'typography', 'Typography'],
  ['spacing', 'spacing', 'Spacing'],
  ['components', 'components', 'Components'],
  ['coverage', 'coverage', 'Coverage'],
  ['app', 'app', 'App Preview'],
].map(([file, role, title]) => ({ path: `preview/${file}.html`, role, title }));

const previewCoverage = [
  { id: 'editors', label: 'Sentinel Editors', count: 17 },
  { id: 'terminals', label: 'Sentinel Terminals', count: 14 },
  { id: 'shells', label: 'Sentinel Shells', count: 5 },
  { id: 'prompts', label: 'Sentinel Prompts', count: 1 },
  { id: 'tools', label: 'Sentinel Tools', count: 18 },
  { id: 'apps', label: 'Sentinel Apps', count: 9 },
  { id: 'web', label: 'Sentinel Web', count: 11 },
  { id: 'docs', label: 'Sentinel Docs', count: 15 },
  { id: 'window-managers', label: 'Sentinel Window Managers', count: 12 },
];

const previewAssets = {
  badge: 'assets/brand/sentinel-bizarre-badge.svg',
  hero: 'assets/showcase/sentinel-hero.png',
  variants: 'assets/showcase/sentinel-variants.png',
  colors: 'assets/showcase/sentinel-palette-ansi.png',
  syntax: 'assets/showcase/sentinel-syntax.png',
  components: 'assets/showcase/sentinel-vscode-themes.png',
  coverage: 'assets/showcase/sentinel-tools.png',
  app: 'assets/showcase/sentinel-shell-banner.png',
};

function customProperties(text) {
  return [...text.matchAll(/(?<![\w-])(--[a-z0-9-]+)\s*:/giu)].map((match) => match[1]);
}

function declarationsFor(text, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const match = text.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'u'));
  assert.ok(match, `missing CSS block: ${selector}`);
  return Object.fromEntries([...match[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/giu)]
    .map((declaration) => [declaration[1], declaration[2].trim()]));
}

function cssRules(text) {
  return [...text.matchAll(/([^{}]+)\{([^{}]*)\}/gu)].map((match) => ({
    selectors: match[1].split(',').map((selector) => selector.trim()),
    declarations: Object.fromEntries([...match[2].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/giu)]
      .map((declaration) => [declaration[1], declaration[2].trim()])),
  }));
}

function effectiveDeclarations(text, selector) {
  const effective = { ...declarationsFor(text, ':root') };
  for (const rule of cssRules(text)) {
    if (rule.selectors.includes(selector)) Object.assign(effective, rule.declarations);
  }
  return effective;
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function resourceValues(html, attribute) {
  const pattern = new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, 'giu');
  return [...html.matchAll(pattern)].map((match) => match[2]);
}

function attributeValue(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  return new RegExp(`\\b${escaped}\\s*=\\s*(["'])(.*?)\\1`, 'iu').exec(tag)?.[2];
}

function renderedSyntaxOccurrences(html) {
  const stack = [];
  const occurrences = [];
  const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  for (const match of html.matchAll(/<\/?[a-z][^>]*>/giu)) {
    const tag = match[0];
    const name = /^<\/?\s*([a-z][a-z0-9-]*)/iu.exec(tag)?.[1]?.toLowerCase();
    if (!name) continue;
    if (/^<\//u.test(tag)) {
      const index = stack.map((entry) => entry.name).lastIndexOf(name);
      if (index >= 0) stack.length = index;
      continue;
    }
    const classes = new Set((attributeValue(tag, 'class') || '').split(/\s+/u).filter(Boolean));
    for (const className of classes) {
      const syntax = /^bzr-syntax-([a-z0-9-]+)$/u.exec(className);
      if (!syntax) continue;
      occurrences.push({
        className,
        suffix: syntax[1],
        insideSyntaxSurface: classes.has('syntax-surface')
          || stack.some((entry) => entry.classes.has('syntax-surface')),
      });
    }
    if (!voidElements.has(name) && !/\/\s*>$/u.test(tag)) stack.push({ name, classes });
  }
  return occurrences;
}

function assertLocalResources(html, stylesheetHrefs, allowedResources) {
  const stylesheets = [...html.matchAll(/<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=(["'])(.*?)\1)[^>]*>/giu)]
    .map((match) => match[2]);
  assert.deepEqual(stylesheets, stylesheetHrefs);
  for (const attribute of ['href', 'src', 'action', 'poster']) {
    for (const value of resourceValues(html, attribute)) {
      assert.ok(!/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/iu.test(value),
        `non-local ${attribute} resource: ${value}`);
      assert.ok(allowedResources.has(value), `unexpected ${attribute} resource: ${value}`);
    }
  }
  assert.doesNotMatch(html, /@import\b/iu);
  assert.doesNotMatch(html, /url\s*\(/iu);
  assert.doesNotMatch(html, /<script\b[^>]*\bsrc\s*=/iu);
}

function contrast(left, right) {
  const luminance = (hex) => {
    const raw = hex.replace(/^#/u, '');
    const linear = [0, 2, 4]
      .map((offset) => Number.parseInt(raw.slice(offset, offset + 2), 16) / 255)
      .map((channel) => channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const [light, dark] = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

test('manifest renders the exact Open Design v1 contract', () => {
  const manifestText = renderManifest({ model, head });
  const manifest = JSON.parse(manifestText);

  assert.deepEqual(manifest, {
    schemaVersion: 'od-design-system-project/v1',
    id: 'bizarre-industries',
    name: 'Bizarre Industries',
    category: 'Developer Tools',
    description: 'One generated theme system for editors, terminals, shells, prompts, tools, and future Bizarre Industries product surfaces.',
    source: {
      type: 'github',
      url: 'https://github.com/Bizarre-Industries/themes',
      branch: 'main',
    },
    files: {
      design: 'DESIGN.md',
      tokens: 'tokens.css',
      designTokens: 'design-tokens.json',
      tailwind: 'tailwind-v4.css',
      components: 'components.html',
    },
    assetsDir: 'assets',
    previewDir: 'preview',
    usage: 'USAGE.md',
    componentsManifest: 'components.manifest.json',
    importMode: 'hybrid',
    craft: {
      applies: ['color', 'type'],
      suggested: [],
      exemptions: [],
    },
    fonts: fontEntries,
    preview: {
      dir: 'preview',
      pages: previewPages,
    },
    sourceFiles: {
      scanned: 'source/scanned-files.json',
      evidence: 'source/evidence.md',
      tokens: 'source/tokens.source.json',
      report: 'source/token-contract.report.json',
      snippets: 'source/snippets/INDEX.json',
    },
  });
  assert.deepEqual(Object.keys(manifest), [
    'schemaVersion', 'id', 'name', 'category', 'description', 'source', 'files',
    'assetsDir', 'previewDir', 'usage', 'componentsManifest', 'importMode', 'craft',
    'fonts', 'preview', 'sourceFiles',
  ]);
  assert.equal(renderManifest({ model, head: alternateHead }), manifestText);
  assert.doesNotMatch(manifestText, new RegExp(`${head}|${alternateHead}`, 'u'));
  assert.deepEqual(Object.keys(manifest.craft), ['applies', 'suggested', 'exemptions']);
  assert.equal(manifest.fonts.length, 12);
  assert.ok(manifest.fonts.every((entry) =>
    Object.keys(entry).join(',') === 'family,file,weight,style'));
  assert.deepEqual(manifest.preview, { dir: 'preview', pages: previewPages });
});

test('metadata is the exact published agent-managed record', () => {
  const metadata = {
    title: 'Bizarre Industries',
    category: 'Developer Tools',
    surface: 'web',
    status: 'published',
    artifactMode: 'agent-managed',
    projectId: 'ds-bizarre-industries',
  };
  assert.deepEqual(JSON.parse(renderMetadata()), metadata);
  assert.equal(renderMetadata(), `${JSON.stringify(metadata, null, 2)}\n`);
});

test('tokens.css declares only the exact 56 Open Design tokens in root and all modes', () => {
  const css = renderTokensCss(model);
  const schema = new Set(OD_SCHEMA_TOKENS);
  const rootDeclarations = declarationsFor(css, ':root');

  assert.deepEqual(rootDeclarations, model.modes.void.od);
  for (const value of Object.values(rootDeclarations)) {
    const references = [...value.matchAll(/var\((--[a-z0-9-]+)\)/giu)]
      .map((match) => match[1]);
    assert.ok(references.every((name) => schema.has(name)),
      `root declaration contains an undeclared var() reference: ${value}`);
  }
  for (const id of palette.variantOrder) {
    const declarations = declarationsFor(css, `[data-bizarre-theme="${id}"]`);
    assert.deepEqual(declarations, model.modes[id].od);
    assert.deepEqual(new Set(Object.keys(declarations)), schema);
    assert.equal(Object.keys(declarations).length, 56);
  }
  assert.equal(customProperties(css).length, 56 * 6);
  assert.ok(customProperties(css).every((name) => schema.has(name)));
  assert.doesNotMatch(css, /--bzr-/u);
});

test('assets/bizarre-tokens.css shares light roles and resolves the complete Bizarre map per mode', () => {
  const css = renderBizarreTokensCss(model);
  const rules = cssRules(css);
  const rootDeclarations = declarationsFor(css, ':root');
  const lightSelectors = [
    '[data-bizarre-theme="paper"]',
    '[data-bizarre-theme="bone"]',
  ];
  const lightRule = rules.find((rule) =>
    lightSelectors.every((selector) => rule.selectors.includes(selector))
      && rule.selectors.length === lightSelectors.length);

  assert.deepEqual(rootDeclarations, model.modes.void.bizarre);
  assert.ok(lightRule, 'Paper and Bone must share one light syntax/status/ANSI rule');
  const expectedSharedLight = Object.fromEntries(Object.entries(model.modes.paper.bizarre)
    .filter(([name, value]) => {
      const isSharedRole = name === '--bzr-info' || name === '--bzr-hint'
        || name.startsWith('--bzr-syntax-')
        || name.startsWith('--bzr-status-')
        || name.startsWith('--bzr-ansi-');
      return isSharedRole
        && value === model.modes.bone.bizarre[name]
        && value !== model.modes.void.bizarre[name];
    }));
  assert.deepEqual(lightRule.declarations, expectedSharedLight);

  for (const id of palette.variantOrder) {
    const selector = `[data-bizarre-theme="${id}"]`;
    const directRule = rules.find((rule) =>
      rule.selectors.length === 1 && rule.selectors[0] === selector);
    assert.ok(directRule, `missing direct mode rule: ${id}`);
    const baseline = id === 'paper' || id === 'bone'
      ? { ...rootDeclarations, ...expectedSharedLight }
      : rootDeclarations;
    const expectedDelta = Object.fromEntries(Object.entries(model.modes[id].bizarre)
      .filter(([name, value]) => value !== baseline[name]));

    assert.deepEqual(directRule.declarations, expectedDelta);
    assert.deepEqual(effectiveDeclarations(css, selector), model.modes[id].bizarre);
  }
  assert.ok(rules.indexOf(lightRule) < rules.findIndex((rule) =>
    rule.selectors.length === 1 && rule.selectors[0] === lightSelectors[0]));
  assert.deepEqual(
    Object.keys(rules.find((rule) => rule.selectors[0] === '[data-bizarre-theme="void-hicontrast"]').declarations)
      .filter((name) => name.startsWith('--bzr-syntax-') || name.startsWith('--bzr-status-')),
    [],
  );
  assert.equal(model.modes.paper.bizarre['--bzr-ansi-black'], rootDeclarations['--bzr-ansi-black']);
  assert.equal(
    rules.find((rule) => rule.selectors[0] === '[data-bizarre-theme="bone"]').declarations['--bzr-ansi-black'],
    model.modes.bone.bizarre['--bzr-ansi-black'],
  );
  assert.ok(customProperties(css).every((name) => name.startsWith('--bzr-')));
  assert.match(css, /@font-face/u);
  assert.match(css, /\.\.\/fonts\/monaspace-neon-latin-400-normal\.woff2/u);
  assert.doesNotMatch(css, /url\(["']?\.\/fonts\//u);

  const extensionNames = Object.keys(model.modes.void.bizarre);
  const syntaxSuffixes = extensionNames
    .filter((name) => name.startsWith('--bzr-syntax-'))
    .map((name) => name.slice('--bzr-syntax-'.length));
  const statusSuffixes = extensionNames
    .filter((name) => name.startsWith('--bzr-status-'))
    .map((name) => name.slice('--bzr-status-'.length));
  const ansiSuffixes = extensionNames
    .filter((name) => name.startsWith('--bzr-ansi-'))
    .map((name) => name.slice('--bzr-ansi-'.length));
  for (const suffix of syntaxSuffixes) {
    assert.match(css, new RegExp(`\\.bzr-syntax-${suffix}\\s*\\{\\s*color:\\s*var\\(--bzr-syntax-${suffix}\\);\\s*\\}`, 'u'));
  }
  for (const suffix of statusSuffixes) {
    assert.match(css, new RegExp(`\\.bzr-status-${suffix}\\s*\\{\\s*color:\\s*var\\(--bzr-status-${suffix}\\);\\s*\\}`, 'u'));
  }
  for (const suffix of ansiSuffixes) {
    assert.match(css, new RegExp(`\\.bzr-ansi-fg-${suffix}\\s*\\{\\s*color:\\s*var\\(--bzr-ansi-${suffix}\\);\\s*\\}`, 'u'));
    assert.match(css, new RegExp(`\\.bzr-ansi-bg-${suffix}\\s*\\{\\s*background-color:\\s*var\\(--bzr-ansi-${suffix}\\);\\s*\\}`, 'u'));
  }
});

test('design-tokens.json preserves every mode and labels derived provenance', () => {
  const tokens = JSON.parse(renderDesignTokensJson(model));

  assert.equal(tokens.schemaVersion, 1);
  assert.equal(tokens.defaultMode, 'void');
  assert.deepEqual(Object.keys(tokens.modes), palette.variantOrder);
  for (const id of palette.variantOrder) {
    assert.deepEqual(tokens.modes[id].openDesign, model.modes[id].od);
    assert.deepEqual(tokens.modes[id].bizarre, model.modes[id].bizarre);
  }
  assert.equal(tokens.derived['--section-y-desktop'].provenance, 'derived/showcase');
  assert.equal(tokens.derived['--radius-pill'].provenance, 'derived/showcase');
  assert.equal(tokens.derived['--focus-ring'].provenance, 'derived/accessibility');
  assert.equal(tokens.derived['--motion-fast'].provenance, 'explicit/neutral');
  for (const [name, entry] of Object.entries(model.derived)) {
    assert.equal(tokens.derived[name].value, entry.value);
    assert.equal(tokens.derived[name].source, entry.source);
  }
});

test('Tailwind v4 bindings reference only declared Open Design schema tokens', () => {
  const css = renderTailwindV4Css(model);
  const references = [...css.matchAll(/var\((--[a-z0-9-]+)\)/giu)].map((match) => match[1]);

  assert.match(css, /@theme\s+inline\s*\{/u);
  assert.ok(references.length >= OD_SCHEMA_TOKENS.length);
  assert.deepEqual(new Set(references), new Set(OD_SCHEMA_TOKENS));
  assert.ok(references.every((name) => OD_SCHEMA_TOKENS.includes(name)));
  assert.doesNotMatch(css, /var\(--bzr-/u);
});

test('DESIGN.md promotes README identity, modes, public boundary, safety, and governance', () => {
  const design = renderDesignMd({ model, readme });

  for (const phrase of [
    'CATCH THE STARS',
    'BZR / THEMES / V0.2 / MAY 2026',
    'Static GitHub Catalog',
    'future Bizarre Industries website',
    'Bizarre Void',
    'Bizarre Void Hi-Contrast',
    'Bizarre Workshop',
    'Bizarre Paper',
    'Bizarre Bone',
    'cp -n',
    'merge only the documented theme keys manually',
    'palette.js',
    'Node ^20.17.0 or >=22.9.0',
    'npm ci',
    'npm run generate',
    'npm test',
    'npx playwright install chromium',
    'agent-managed',
    'asset-status: unavailable',
    'MIT',
  ]) assert.match(design, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));
  assert.match(design, new RegExp(palette.fonts.hand.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));

  assert.match(design, /full root README.*source\/snippets\/repo\/README\.md/isu);
  for (const evidencePath of [
    'source/snippets/repo/showcase/index.html',
    'source/snippets/repo/palette.js',
    'source/snippets/repo/PALETTE.md',
    'source/snippets/repo/PORTS.md',
    'source/snippets/repo/LICENSE',
  ]) assert.match(design, new RegExp(evidencePath.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));
  assert.doesNotMatch(design, /\]\((?:showcase\/index\.html|palette\.js|PALETTE\.md|PORTS\.md|LICENSE)\)/u);
  assert.ok(Buffer.byteLength(design) < readme.length, 'DESIGN.md must not concatenate README.md');
  assert.doesNotMatch(design, /## Current Coverage[\s\S]*GNOME Terminal/u);

  const voidTokens = model.modes.void.od;
  for (const line of [
    `Page Background: \`${voidTokens['--bg']}\``,
    `Foreground: \`${voidTokens['--fg']}\``,
    `Primary Brand: \`${voidTokens['--accent']}\``,
    `Muted: \`${voidTokens['--muted']}\``,
    `Border: \`${voidTokens['--border']}\``,
    `Surface: \`${voidTokens['--surface']}\``,
    `Display: \`${voidTokens['--font-display']}\``,
    `Body: \`${voidTokens['--font-body']}\``,
    `Mono: \`${voidTokens['--font-mono']}\``,
  ]) assert.match(design, new RegExp(line.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));
});

test('USAGE.md gives agents the normative-first, extension-second mode contract', () => {
  const usage = renderUsageMd();

  assert.match(usage, /tokens\.css first/iu);
  assert.match(usage, /assets\/bizarre-tokens\.css/iu);
  assert.match(usage, /syntax.*ANSI|ANSI.*syntax/isu);
  assert.match(usage, /non-default artifact mode/iu);
  assert.match(usage, /data-bizarre-theme/u);
  assert.match(usage, /Void.*default/isu);
  assert.match(usage, /do not edit.*palette\.js/isu);
});

test('evidence markdown is revision-control-state-independent and uses file hashes as provenance', () => {
  const entries = [
    {
      sourcePath: 'z-last.txt', packagePath: 'source/snippets/repo/z-last.txt',
      kind: 'text/plain', bytes: 5, sha256: 'b'.repeat(64),
      classification: 'canonical', generated: false,
    },
    {
      sourcePath: 'README.md', packagePath: 'source/snippets/repo/README.md',
      kind: 'text/markdown', bytes: readme.length, sha256: 'a'.repeat(64),
      classification: 'documentation', generated: true,
    },
  ];
  const evidence = renderEvidenceMd({
    entries,
    head,
    status: [
      ' M README.md',
      '?? AGENTS.md',
      ' M "README.md"',
      'R  README.md -> z-last.txt',
      'R  README.md -> excluded.txt',
      ' M README.md -> z-last.txt',
      'not porcelain status',
      '',
    ].join('\n'),
  });
  const alternate = renderEvidenceMd({
    entries,
    head: alternateHead,
    status: '',
  });

  assert.equal(alternate, evidence);
  assert.doesNotMatch(evidence, new RegExp(`${head}|${alternateHead}`, 'u'));
  assert.doesNotMatch(evidence, /Git HEAD|Working Tree Snapshot/iu);
  assert.match(evidence, /source\/snippets\/repo\/README\.md/u);
  assert.match(evidence, /byte-for-byte|verbatim/iu);
  assert.match(evidence, /per-file SHA-256/iu);
  assert.doesNotMatch(evidence, /^ M README\.md$/mu);
  assert.doesNotMatch(evidence, /^R  README\.md -> z-last\.txt$/mu);
  assert.doesNotMatch(evidence, /AGENTS\.md/u);
  assert.doesNotMatch(evidence, /excluded\.txt/u);
  assert.doesNotMatch(evidence, /"README\.md"/u);
  assert.doesNotMatch(evidence, /not porcelain status/u);
  assert.doesNotMatch(evidence, /^ M README\.md -> z-last\.txt$/mu);
  assert.ok(evidence.indexOf('README.md') < evidence.indexOf('z-last.txt'));
});

test('token contract report is deterministic and reports schema and source provenance', () => {
  const reportText = renderTokenContractReport(model);
  const report = JSON.parse(reportText);

  assert.ok(reportText.endsWith('\n'));
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.contract, 'TOKEN_SCHEMA');
  assert.deepEqual(report.summary, {
    totalTokens: 56,
    declaredTokens: 56,
    sourceBackedTokens: 56,
    sourceBackedA1: 26,
    requiredA1: 26,
    fallbackTokens: 0,
    aliasTokens: 0,
    score: 100,
    grade: 'excellent',
    recommendRebuild: false,
  });
  assert.deepEqual(report.layers, {
    'A1-identity': { total: 8, sourceBacked: 8, fallback: 0, alias: 0 },
    'A1-structure': { total: 18, sourceBacked: 18, fallback: 0, alias: 0 },
    A2: { total: 26, sourceBacked: 26, fallback: 0, alias: 0 },
    'B-slot': { total: 4, sourceBacked: 4, fallback: 0, alias: 0 },
  });
  assert.deepEqual(report.selfCheck, { ok: true, errors: [], warnings: [] });
  assert.equal(report.tokens.length, 56);
  assert.deepEqual(report.tokens.map(({ name }) => name), OD_SCHEMA_TOKENS);
  assert.ok(report.tokens.every((record) => record.confidence === 'high'));
  assert.ok(report.tokens.every((record) => Object.keys(record).join(',') ===
    'name,layer,value,confidence,reason,sources'));
  assert.equal(report.tokens.find(({ name }) => name === '--focus-ring').sources[0],
    'derived/accessibility');
  assert.match(report.tokens.find(({ name }) => name === '--section-y-desktop').sources[0],
    /^showcase\/showcase\.css:/u);
  assert.equal(report.tokens.find(({ name }) => name === '--bg').sources[0], 'palette.js');
  assert.doesNotMatch(reportText, /generatedAt/u);
});

test('token contract report self-check rejects undeclared root var references', () => {
  const malformed = {
    ...model,
    modes: {
      ...model.modes,
      void: {
        ...model.modes.void,
        od: {
          ...model.modes.void.od,
          '--focus-ring': '0 0 0 2px var(--outside-schema)',
        },
      },
    },
  };
  const report = JSON.parse(renderTokenContractReport(malformed));

  assert.equal(report.selfCheck.ok, false);
  assert.ok(report.selfCheck.errors.length > 0);
  assert.match(report.selfCheck.errors.join('\n'), /--focus-ring.*--outside-schema/iu);
  assert.equal(report.summary.recommendRebuild, true);
  assert.equal(report.summary.score, 75);
  assert.equal(report.summary.grade, 'usable');
  assert.equal(
    report.tokens.find(({ name }) => name === '--focus-ring').value,
    '0 0 0 2px var(--outside-schema)',
  );
});

test('component fixture is source-derived, local, state-complete, and schema-token clean', () => {
  const html = renderComponentsHtml(model);

  for (const component of [
    'identity-lockup',
    'eyebrow',
    'pill',
    'slogan-strip',
    'section-heading',
    'variant-selector',
    'swatch',
    'ansi-cell',
    'syntax-specimen',
    'code-pane',
    'terminal-pane',
    'config-card',
    'status-badge',
    'install-snippet',
    'link',
    'button',
    'field',
    'tab',
    'kbd',
  ]) assert.match(html, new RegExp(`data-od-id=["']${component}["']`, 'u'));

  for (const state of [
    'default', 'hover', 'active', 'focus-visible', 'disabled', 'selected', 'error',
  ]) assert.match(html, new RegExp(`data-state=["']${state}["']`, 'u'));

  assert.match(html, /<link\s+[^>]*href=["']\.\/tokens\.css["']/u);
  assert.match(html, /<link\s+[^>]*href=["']\.\/assets\/bizarre-tokens\.css["']/u);
  assert.match(html, /<img\s+[^>]*src=["']\.\/assets\/brand\/bizarre-badge\.svg["']/u);
  assert.match(html, /class=["'][^"']*tok-kw-decl/u);
  assert.match(html, /class=["'][^"']*bzr-syntax-kw-decl/u);
  assert.match(html, /class=["'][^"']*ansi-cell/u);
  assert.match(html, /https:\/\/github\.com\/Bizarre-Industries\/themes/u);
  assert.equal([...html.matchAll(/linear-gradient\s*\(/giu)].length, 2);
  assert.doesNotMatch(html, /(?:radial|conic|repeating-linear|repeating-radial)-gradient\s*\(/iu);
  assert.doesNotMatch(html, /backdrop-filter/iu);
  assert.doesNotMatch(html, /var\(\s*--bzr-/iu);

  assertLocalResources(
    html,
    ['./tokens.css', './assets/bizarre-tokens.css'],
    new Set([
      './tokens.css',
      './assets/bizarre-tokens.css',
      './assets/brand/bizarre-badge.svg',
      './components.html',
      './DESIGN.md',
    ]),
  );

  const references = [...html.matchAll(/var\(\s*(--[a-z0-9-]+)/giu)]
    .map((match) => match[1]);
  assert.ok(references.length > 0);
  assert.ok(references.every((name) => OD_SCHEMA_TOKENS.includes(name)),
    `component fixture references tokens outside TOKEN_SCHEMA: ${references.filter((name) => !OD_SCHEMA_TOKENS.includes(name)).join(', ')}`);

  for (const id of palette.variantOrder) {
    assert.match(html, new RegExp(`data-theme-option=["']${id}["']`, 'u'));
  }
  assert.match(html, /<button\b(?=[^>]*data-theme-option=["']void["'])(?=[^>]*aria-pressed=["']true["'])[^>]*>/u);
  for (const id of palette.variantOrder.slice(1)) {
    assert.match(html, new RegExp(`<button\\b(?=[^>]*data-theme-option=["']${id}["'])(?=[^>]*aria-pressed=["']false["'])[^>]*>`, 'u'));
  }
  assert.match(html, /<fieldset\b[^>]*class=["'][^"']*mode-switcher/u);
  assert.match(html, /<legend>Artifact mode<\/legend>/u);
  assert.match(html, /<button\b[^>]*type=["']button["']/u);
  assert.match(html, /<button\b[^>]*disabled(?:\s|>)/u);
  assert.match(html, /role=["']tablist["']/u);
  assert.match(html, /role=["']tab["'][^>]*aria-selected=["']true["']/u);
  assert.match(html, /<label\b[^>]*for=["'][^"']+["']/u);
  assert.match(html, /<input\b[^>]*aria-invalid=["']true["'][^>]*aria-describedby=["']field-error-message["']/u);
  assert.match(html, /id=["']field-error-message["'][^>]*role=["']alert["']/u);
  assert.match(html, /<a\b[^>]*href=["']\.\//u);
  assert.match(html, /<kbd\b/u);
  assert.match(html, /\.button:hover\s*\{/u);
  assert.match(html, /\.button:active\s*\{/u);
  assert.match(html, /\.button:focus-visible\s*\{/u);
  assert.match(html, /64px/u);
  assert.match(html, /@media\s*\(max-width:\s*900px\)/u);
  assert.match(html, /padding-inline:\s*var\(--container-gutter-desktop\)/u);
  assert.match(html, /padding-inline:\s*var\(--container-gutter-phone\)/u);

  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/giu)];
  assert.equal(scripts.length, 1);
  assert.doesNotMatch(scripts[0][1], /\bsrc\s*=/iu);
  assert.match(scripts[0][2], /setAttribute\(["']data-bizarre-theme["']/u);
  assert.match(scripts[0][2], /setAttribute\(["']aria-pressed["']/u);
  assert.doesNotMatch(scripts[0][2], /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/iu);

  const extensionCss = renderBizarreTokensCss(model);
  const usedExtensionClasses = [...new Set(
    [...html.matchAll(/\bclass\s*=\s*(["'])(.*?)\1/gisu)]
      .flatMap((match) => match[2].split(/\s+/u))
      .filter((name) => /^bzr-(?:syntax|status|ansi-(?:fg|bg))-/u.test(name)),
  )];
  assert.ok(usedExtensionClasses.length > 0);
  for (const className of usedExtensionClasses) {
    assert.match(extensionCss, new RegExp(`\\.${className}\\s*\\{`, 'u'));
  }

  for (const [id, mode] of Object.entries(model.modes)) {
    assert.ok(contrast(mode.od['--accent-on'], mode.od['--accent-active']) >= 4.5,
      `${id} button text does not meet WCAG AA`);
    assert.ok(contrast(mode.od['--danger'], mode.od['--surface']) >= 4.5,
      `${id} error text does not meet WCAG AA`);
  }
});

test('component manifest matches Open Design schema v1 and extracts a deterministic inventory', () => {
  const html = renderComponentsHtml(model);
  const tokensCss = renderTokensCss(model);
  const manifest = renderComponentsManifest({ html, tokensCss });

  assert.deepEqual(manifest, renderComponentsManifest({ html, tokensCss }));
  assert.deepEqual(Object.keys(manifest), [
    'schemaVersion', 'brandId', 'source', 'fixture', 'tokens',
    'selectors', 'classes', 'elements', 'groups', 'literals',
  ]);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.brandId, 'bizarre-industries');
  assert.deepEqual(manifest.source, {
    componentsHtml: 'components.html',
    tokensCss: 'tokens.css',
  });
  assert.deepEqual(Object.keys(manifest.fixture), [
    'title', 'description', 'styleBlockCount', 'selectorCount', 'classCount', 'elementCount',
  ]);
  assert.equal(manifest.fixture.title, 'Bizarre Industries — source-derived components');
  assert.match(manifest.fixture.description, /source-derived/iu);
  assert.equal(manifest.fixture.styleBlockCount, 1);
  assert.ok(manifest.fixture.selectorCount > 0);
  assert.ok(manifest.fixture.classCount > 0);
  assert.ok(manifest.fixture.elementCount > 0);
  assert.deepEqual(Object.keys(manifest.tokens), [
    'declared', 'referenced', 'unusedDeclared', 'undeclaredReferenced',
  ]);
  assert.deepEqual(manifest.tokens.declared, sorted(OD_SCHEMA_TOKENS));
  assert.ok(manifest.tokens.referenced.length > 0);
  assert.deepEqual(manifest.tokens.undeclaredReferenced, []);
  assert.deepEqual(
    manifest.groups.map(({ id, label }) => ({ id, label })),
    [
      { id: 'buttons', label: 'Buttons and calls to action' },
      { id: 'inputs', label: 'Form fields and controls' },
      { id: 'cards', label: 'Cards and panels' },
      { id: 'badges', label: 'Badges, chips, and status labels' },
      { id: 'links', label: 'Links and inline actions' },
      { id: 'keyboard', label: 'Keyboard hints' },
      { id: 'icons', label: 'Icon slots' },
      { id: 'typography', label: 'Typography scale and text utilities' },
      { id: 'layout', label: 'Layout primitives' },
    ],
  );
  assert.ok(manifest.groups.every((group) => Object.keys(group).join(',') ===
    'id,label,present,selectors,classes,elements,tokenReferences'));
  assert.deepEqual(Object.keys(manifest.literals), [
    'colorExpressions', 'pixelValues', 'hardcodedFontFamilies',
  ]);
  assert.ok(manifest.selectors.includes('.button'));
  assert.ok(manifest.classes.includes('config-card'));
  assert.ok(manifest.elements.includes('button'));

  for (const values of [
    manifest.tokens.declared,
    manifest.tokens.referenced,
    manifest.tokens.unusedDeclared,
    manifest.tokens.undeclaredReferenced,
    manifest.selectors,
    manifest.classes,
    manifest.elements,
  ]) assert.deepEqual(values, sorted(values));

  const styleCss = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/giu)]
    .map((match) => match[1]).join('\n').replace(/\s+/gu, ' ');
  const fixtureClasses = new Set(
    [...html.matchAll(/\bclass\s*=\s*(["'])(.*?)\1/gisu)]
      .flatMap((match) => match[2].split(/\s+/u).filter(Boolean)),
  );
  const fixtureElements = new Set(
    [...html.matchAll(/<\s*([a-z][a-z0-9-]*)\b/giu)].map((match) => match[1].toLowerCase()),
  );
  for (const selector of manifest.selectors) {
    assert.ok(styleCss.includes(selector), `manifest selector is absent from fixture CSS: ${selector}`);
  }
  for (const className of manifest.classes) {
    assert.ok(fixtureClasses.has(className), `manifest class is absent from fixture HTML: ${className}`);
  }
  for (const element of manifest.elements) {
    assert.ok(fixtureElements.has(element), `manifest element is absent from fixture HTML: ${element}`);
  }
  for (const group of manifest.groups) {
    assert.ok(group.selectors.every((selector) => manifest.selectors.includes(selector)));
    assert.ok(group.classes.every((className) => manifest.classes.includes(className)));
    assert.ok(group.elements.every((element) => manifest.elements.includes(element)));
    assert.ok(group.tokenReferences.every((token) => manifest.tokens.referenced.includes(token)));
  }
});

test('nine local previews are responsive, mode-switchable, and source-derived', () => {
  const pages = renderPreviewPages({
    model,
    coverage: previewCoverage,
    assets: previewAssets,
  });
  const expected = [
    ['preview/overview.html', 'Overview'],
    ['preview/variants.html', 'Variants'],
    ['preview/colors.html', 'Colors'],
    ['preview/syntax-ansi.html', 'Syntax and ANSI'],
    ['preview/typography.html', 'Typography'],
    ['preview/spacing.html', 'Spacing'],
    ['preview/components.html', 'Components'],
    ['preview/coverage.html', 'Coverage'],
    ['preview/app.html', 'App Preview'],
  ];

  assert.ok(pages instanceof Map);
  assert.deepEqual([...pages.keys()], expected.map(([pagePath]) => pagePath));
  for (const [pagePath, title] of expected) {
    const html = pages.get(pagePath);
    assert.equal(typeof html, 'string');
    assert.match(html, new RegExp(`<title>Bizarre Industries — ${title.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}</title>`, 'u'));
    assert.match(html, /<meta\s+name=["']viewport["']\s+content=["']width=device-width,\s*initial-scale=1["']/u);
    assert.match(html, /<link\s+[^>]*href=["']\.\.\/tokens\.css["']/u);
    assert.match(html, /<link\s+[^>]*href=["']\.\.\/assets\/bizarre-tokens\.css["']/u);
    assert.match(html, /@media\s*\(max-width:\s*900px\)/u);
    assert.match(html, /data-source-evidence=["'][^"']+["']/u);
    assert.match(html, /class=["'][^"']*mode-switcher/u);
    for (const id of palette.variantOrder) {
      assert.match(html, new RegExp(`data-theme-option=["']${id}["']`, 'u'));
    }
    assert.match(html, /<button\b(?=[^>]*data-theme-option=["']void["'])(?=[^>]*aria-pressed=["']true["'])[^>]*>/u);
    assert.equal([...html.matchAll(/data-theme-option=["'][^"']+["']/gu)].length, 5);
    assert.match(html, /setAttribute\(["']data-bizarre-theme["']/u);
    assert.match(html, /setAttribute\(["']aria-pressed["']/u);
    assert.equal([...html.matchAll(/linear-gradient\s*\(/giu)].length, 2);
    assert.doesNotMatch(html, /(?:radial|conic|repeating-linear|repeating-radial)-gradient\s*\(/iu);
    assert.doesNotMatch(html, /backdrop-filter/iu);
    assert.doesNotMatch(html, /var\(\s*--bzr-/iu);
    assert.match(html, /padding-inline:\s*var\(--container-gutter-desktop\)/u);
    assert.match(html, /padding-inline:\s*var\(--container-gutter-phone\)/u);
    assert.match(html, /<main\b/u);
    assert.match(html, /<nav\b[^>]*aria-label=["']Preview navigation["']/u);
    assert.match(html, /<fieldset\b[^>]*class=["'][^"']*mode-switcher/u);
    assert.match(html, /<legend>Artifact mode<\/legend>/u);

    const pageAsset = Object.values(previewAssets)
      .map((asset) => `../${asset}`)
      .find((asset) => html.includes(asset));
    const resources = new Set([
      '../tokens.css',
      '../assets/bizarre-tokens.css',
      './overview.html',
      '../DESIGN.md',
      ...Object.values(previewAssets).map((asset) => `../${asset}`),
    ]);
    assert.ok(pageAsset || pagePath === 'preview/typography.html' || pagePath === 'preview/spacing.html',
      `${pagePath} must propagate a supplied asset path`);
    assertLocalResources(html, ['../tokens.css', '../assets/bizarre-tokens.css'], resources);
  }

  assert.match(pages.get('preview/overview.html'), /assets\/brand\/sentinel-bizarre-badge\.svg/u);
  assert.match(pages.get('preview/variants.html'), /assets\/showcase\/sentinel-variants\.png/u);
  assert.match(pages.get('preview/colors.html'), /Signal Lime|Lime Ink/u);
  assert.match(pages.get('preview/syntax-ansi.html'), /tok-kw-decl/u);
  assert.match(pages.get('preview/typography.html'), /Monaspace Xenon/u);
  assert.match(pages.get('preview/spacing.html'), /64px/u);
  assert.match(pages.get('preview/components.html'), /data-od-id=["']button["']/u);
  assert.match(pages.get('preview/coverage.html'), /Sentinel Editors/u);
  assert.match(pages.get('preview/coverage.html'), />17</u);
  for (const record of previewCoverage) {
    assert.match(pages.get('preview/coverage.html'), new RegExp(record.label, 'u'));
    assert.match(pages.get('preview/coverage.html'), new RegExp(`>${record.count}<`, 'u'));
  }
  assert.match(pages.get('preview/app.html'), /CATCH THE STARS\./u);
});

test('system kit exposes the Bizarre app preview through Open Design native showcase paths', () => {
  const html = renderSystemKit({
    model,
    coverage: previewCoverage,
    assets: previewAssets,
  });

  assert.match(html, /<title>Bizarre Industries — App Preview<\/title>/u);
  assert.match(html, /href=["']\.\.\/tokens\.css["']/u);
  assert.match(html, /href=["']\.\.\/assets\/bizarre-tokens\.css["']/u);
  assert.match(html, /href=["']\.\.\/preview\/overview\.html["']/u);
  assert.match(html, /href=["']\.\.\/DESIGN\.md["']/u);
  assert.match(html, /CATCH THE STARS\./u);
  assert.doesNotMatch(html, /href=["']\.\/overview\.html["']/u);
});

test('rendered text and status colors use AA-safe foreground roles in every mode', () => {
  const fixture = renderComponentsHtml(model);
  const pages = renderPreviewPages({
    model,
    coverage: previewCoverage,
    assets: previewAssets,
  });
  const artifacts = [fixture, ...pages.values()];

  for (const html of artifacts) {
    assert.doesNotMatch(html, /\bcolor\s*:\s*var\(\s*--(?:muted|meta)\s*\)/iu);
  }

  const renderedStatusSuffixes = [...new Set(
    artifacts.flatMap((html) => [...html.matchAll(/\bbzr-status-([a-z0-9-]+)/giu)]
      .map((match) => match[1])),
  )].sort();
  assert.deepEqual(renderedStatusSuffixes, ['error', 'hint', 'info', 'ok', 'warn']);

  for (const [id, mode] of Object.entries(model.modes)) {
    for (const foreground of ['--fg', '--fg-2']) {
      for (const background of ['--bg', '--surface']) {
        assert.ok(contrast(mode.od[foreground], mode.od[background]) >= 4.5,
          `${id} ${foreground} on ${background} must meet WCAG AA`);
      }
    }
    for (const status of ['--success', '--warn', '--danger']) {
      assert.ok(contrast(mode.od[status], mode.od['--surface']) >= 4.5,
        `${id} ${status} on --surface must meet WCAG AA`);
    }
    for (const suffix of renderedStatusSuffixes) {
      assert.ok(contrast(mode.bizarre[`--bzr-status-${suffix}`], mode.od['--surface']) >= 4.5,
        `${id} --bzr-status-${suffix} on --surface must meet WCAG AA`);
    }
  }
});

test('every rendered syntax role uses its declared AA-safe container background', () => {
  const fixture = renderComponentsHtml(model);
  const pages = renderPreviewPages({
    model,
    coverage: previewCoverage,
    assets: previewAssets,
  });
  const artifacts = new Map([['components.html', fixture], ...pages]);
  const fixtureCss = /<style\b[^>]*>([\s\S]*?)<\/style>/iu.exec(fixture)?.[1] || '';
  const backgroundMatch = /\.syntax-surface\s*\{[^}]*\bbackground\s*:\s*var\(\s*(--[a-z0-9-]+)\s*\)/iu.exec(fixtureCss);

  assert.ok(backgroundMatch, 'syntax surfaces must declare their actual token background');
  const backgroundToken = backgroundMatch[1];
  assert.equal(backgroundToken, '--bg');

  const inventory = [];
  for (const [artifactPath, html] of artifacts) {
    const occurrences = renderedSyntaxOccurrences(html);
    for (const occurrence of occurrences) {
      assert.equal(occurrence.insideSyntaxSurface, true,
        `${artifactPath} renders ${occurrence.className} outside .syntax-surface`);
      inventory.push({ artifactPath, ...occurrence });
    }
  }
  assert.ok(inventory.length > 0);
  const suffixes = [...new Set(inventory.map(({ suffix }) => suffix))].sort();
  assert.deepEqual(suffixes, [
    'comment', 'fn', 'kw-decl', 'num', 'op', 'param', 'prop', 'punct', 'string', 'variable',
  ]);

  for (const [id, mode] of Object.entries(model.modes)) {
    for (const suffix of suffixes) {
      const foreground = mode.bizarre[`--bzr-syntax-${suffix}`];
      assert.equal(typeof foreground, 'string', `${id} is missing --bzr-syntax-${suffix}`);
      assert.ok(contrast(foreground, mode.od[backgroundToken]) >= 4.5,
        `${id} --bzr-syntax-${suffix} on ${backgroundToken} must meet WCAG AA`);
    }
  }
});

test('editor tabs expose linked panels and local keyboard operation', () => {
  const html = renderComponentsHtml(model);
  const tabTags = [...html.matchAll(/<button\b(?=[^>]*\brole=["']tab["'])[^>]*>/giu)]
    .map((match) => match[0]);
  const panelTags = [...html.matchAll(/<div\b(?=[^>]*\brole=["']tabpanel["'])[^>]*>/giu)]
    .map((match) => match[0]);

  assert.equal(tabTags.length, 3);
  assert.equal(panelTags.length, 3);
  const tabIds = tabTags.map((tag) => attributeValue(tag, 'id'));
  const panelIds = panelTags.map((tag) => attributeValue(tag, 'id'));
  assert.equal(new Set(tabIds).size, tabIds.length);
  assert.equal(new Set(panelIds).size, panelIds.length);
  assert.ok(tabIds.every(Boolean));
  assert.ok(panelIds.every(Boolean));

  for (const tag of tabTags) {
    const selected = attributeValue(tag, 'aria-selected') === 'true';
    assert.equal(attributeValue(tag, 'tabindex'), selected ? '0' : '-1');
    const panelId = attributeValue(tag, 'aria-controls');
    assert.ok(panelIds.includes(panelId));
    const panel = panelTags.find((candidate) => attributeValue(candidate, 'id') === panelId);
    assert.equal(attributeValue(panel, 'aria-labelledby'), attributeValue(tag, 'id'));
    assert.equal(/\shidden(?:\s|>)/u.test(panel), !selected);
  }
  assert.equal(tabTags.filter((tag) => attributeValue(tag, 'aria-selected') === 'true').length, 1);

  const script = /<script\b[^>]*>([\s\S]*?)<\/script>/iu.exec(html)?.[1] || '';
  assert.match(script, /querySelectorAll\(["']\[role=[^"']*tab[^"']*\]["']\)/u);
  assert.match(script, /addEventListener\(["']click["']/u);
  assert.match(script, /addEventListener\(["']keydown["']/u);
  for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) {
    assert.match(script, new RegExp(key, 'u'));
  }
  assert.match(script, /preventDefault\(\)/u);
  assert.match(script, /\.hidden\s*=/u);
  assert.match(script, /\.tabIndex\s*=/u);
  assert.match(script, /\.focus\(\)/u);
  assert.doesNotMatch(script, /\b(?:location|history|cookie)\b|fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/iu);
});

test('every generated page has one visible topbar h1 and real local navigation links', () => {
  const fixture = renderComponentsHtml(model);
  const pages = renderPreviewPages({
    model,
    coverage: previewCoverage,
    assets: previewAssets,
  });
  const artifacts = [
    [fixture, './components.html', './DESIGN.md'],
    ...[...pages.values()].map((html) => [html, './overview.html', '../DESIGN.md']),
  ];

  for (const [html, homeHref, designHref] of artifacts) {
    const h1Tags = [...html.matchAll(/<h1\b[^>]*>/giu)].map((match) => match[0]);
    assert.equal(h1Tags.length, 1);
    assert.match(h1Tags[0], /class=["'][^"']*preview-title/u);
    assert.doesNotMatch(h1Tags[0], /aria-hidden|\bhidden\b/u);
    assert.match(html, /<header\b[^>]*class=["'][^"']*topbar[^"']*["'][^>]*>[\s\S]*?<h1\b[^>]*class=["'][^"']*preview-title[^"']*["'][^>]*>[\s\S]*?<\/h1>[\s\S]*?<\/header>/u);
    const nav = /<nav\b[^>]*aria-label=["']Preview navigation["'][^>]*>([\s\S]*?)<\/nav>/u.exec(html)?.[1] || '';
    assert.match(nav, new RegExp(`<a\\b[^>]*href=["']${homeHref.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}["']`, 'u'));
    assert.match(nav, new RegExp(`<a\\b[^>]*href=["']${designHref.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}["']`, 'u'));
  }

  assert.match(fixture, /<h2\b[^>]*class=["'][^"']*hero-title[^"']*["'][^>]*>YOUR EDITOR\./u);
  assert.match(pages.get('preview/overview.html'), /<h2\b[^>]*class=["'][^"']*hero-title[^"']*["'][^>]*>YOUR EDITOR\./u);
});

test('responsive grid collapse is shrink-safe without hiding root overflow', () => {
  const html = renderComponentsHtml(model);
  const css = /<style\b[^>]*>([\s\S]*?)<\/style>/iu.exec(html)?.[1] || '';

  function assertShrinkSafe(source) {
    const mediaStart = source.indexOf('@media (max-width: 900px)');
    assert.ok(mediaStart >= 0, 'missing 900px responsive rule');
    const responsiveCss = source.slice(mediaStart);
    const columns = [...responsiveCss.matchAll(/grid-template-columns\s*:\s*([^;]+);/giu)]
      .map((match) => match[1].trim());
    assert.ok(columns.length >= 3, 'responsive grid inventory is unexpectedly incomplete');
    for (const value of columns) {
      assert.match(value, /minmax\(0,\s*1fr\)/u,
        `responsive grid column is not shrink-safe: ${value}`);
    }
  }

  assertShrinkSafe(css);
  const unsafeControl = css.replace(
    'grid-template-columns: minmax(0, 1fr);',
    'grid-template-columns: 1fr;',
  );
  assert.notEqual(unsafeControl, css, 'negative control did not modify the responsive grid');
  assert.throws(() => assertShrinkSafe(unsafeControl), /not shrink-safe/u);

  const rootRules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/gu)]
    .filter((match) => match[1].split(',').some((selector) =>
      ['html', 'body', '.preview-root'].includes(selector.trim())));
  assert.ok(rootRules.length > 0);
  for (const rule of rootRules) {
    assert.doesNotMatch(rule[2], /overflow(?:-x)?\s*:\s*hidden/iu);
  }
});

test('preview renderer rejects malformed coverage records and unsafe package asset paths', () => {
  assert.throws(() => renderPreviewPages({
    model,
    coverage: [{ id: 'editors', label: 'Editors', count: 1, extra: true }],
    assets: previewAssets,
  }), /coverage.*id.*label.*count/iu);
  assert.throws(() => renderPreviewPages({
    model,
    coverage: previewCoverage,
    assets: { ...previewAssets, badge: '/assets/brand/badge.svg' },
  }), /package-root.*asset|asset.*package-root/iu);
  assert.throws(() => renderPreviewPages({
    model,
    coverage: previewCoverage,
    assets: { ...previewAssets, hero: 'https://example.com/hero.png' },
  }), /package-root.*asset|asset.*package-root/iu);
  assert.throws(() => renderPreviewPages({
    model,
    coverage: previewCoverage,
    assets: { ...previewAssets, variants: '../variants.png' },
  }), /package-root.*asset|asset.*package-root/iu);
});
