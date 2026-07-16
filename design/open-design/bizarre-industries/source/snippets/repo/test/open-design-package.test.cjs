'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const Module = require('node:module');
const test = require('node:test');

const palette = require('../palette.js');
const {
  PREVIEW_ASSETS,
  buildOpenDesignPackage,
  deriveCoverage,
  generateOpenDesignPackage,
} = require('../scripts/generate-open-design.cjs');
const {
  listRepositoryEvidence,
} = require('../scripts/lib/open-design/evidence.cjs');
const {
  loadFontAssets,
} = require('../scripts/lib/open-design/fonts.cjs');

const root = path.resolve(__dirname, '..');
const rawCompare = (left, right) => left < right ? -1 : left > right ? 1 : 0;
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function filesBelow(directory, relative = '') {
  const result = [];
  for (const name of fs.readdirSync(path.join(directory, relative), { withFileTypes: true })) {
    const child = relative ? `${relative}/${name.name}` : name.name;
    if (name.isDirectory()) result.push(...filesBelow(directory, child));
    else if (name.isFile()) result.push(child);
    else throw new Error(`Unexpected package entry: ${child}`);
  }
  return result.sort(rawCompare);
}

function readJson(packageRoot, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(packageRoot, relativePath), 'utf8'));
}

function assertDeclaredPathsExist(packageRoot, manifest) {
  const paths = [
    manifest.files.design,
    manifest.files.tokens,
    manifest.files.designTokens,
    manifest.files.tailwind,
    manifest.files.components,
    manifest.usage,
    manifest.componentsManifest,
    manifest.sourceFiles.scanned,
    manifest.sourceFiles.evidence,
    manifest.sourceFiles.tokens,
    manifest.sourceFiles.report,
    manifest.sourceFiles.snippets,
    ...manifest.fonts.map(({ file }) => file),
    ...manifest.preview.pages.map(({ path: pagePath }) => pagePath),
  ];
  for (const declared of paths) {
    assert.equal(fs.statSync(path.join(packageRoot, declared)).isFile(), true, declared);
  }
}

function gitVisiblePaths() {
  const result = spawnSync('git', [
    'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--',
  ], { cwd: root, encoding: 'buffer' });
  assert.equal(result.status, 0, Buffer.from(result.stderr || '').toString('utf8'));
  return result.stdout.toString('utf8').split('\0').filter(Boolean).sort(rawCompare);
}

function isCurrentRegularRepositoryFile(sourcePath) {
  const segments = sourcePath.split('/');
  let current = root;
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index]);
    let stat;
    try {
      stat = fs.lstatSync(current);
    } catch (error) {
      if (error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')) return false;
      throw error;
    }
    if (stat.isSymbolicLink()) return false;
    if (index < segments.length - 1 && !stat.isDirectory()) return false;
    if (index === segments.length - 1) return stat.isFile();
  }
  return false;
}

function loadedGeneratorRepositoryModules() {
  const generatorPath = require.resolve('../scripts/generate-open-design.cjs');
  const generatorModule = require.cache[generatorPath];
  assert.ok(generatorModule, 'generator module must be loaded');
  const pending = [generatorModule];
  const visited = new Set();
  const sourcePaths = [];
  while (pending.length > 0) {
    const current = pending.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    pending.push(...current.children);
    const relative = path.relative(root, current.filename);
    if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`)
      || path.isAbsolute(relative) || relative.split(path.sep).includes('node_modules')) continue;
    sourcePaths.push(relative.split(path.sep).join('/'));
  }
  return [...new Set(sourcePaths)].sort(rawCompare);
}

function runFixtureGit(fixtureRoot, args, label) {
  const result = spawnSync('git', args, { cwd: fixtureRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, `${label}: ${result.stderr}`);
}

function makeBootstrapRepositoryFixture(t, label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `bizarre-open-design-${label}-`));
  t.after(() => fs.rmSync(fixtureRoot, {
    force: true,
    maxRetries: 10,
    recursive: true,
    retryDelay: 100,
  }));

  for (const sourcePath of gitVisiblePaths()) {
    if (sourcePath === 'design/open-design/bizarre-industries'
      || sourcePath.startsWith('design/open-design/bizarre-industries/')) continue;
    const source = path.join(root, ...sourcePath.split('/'));
    let stat;
    try {
      stat = fs.lstatSync(source);
    } catch (error) {
      if (error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')) continue;
      throw error;
    }
    if (!stat.isFile()) continue;
    const destination = path.join(fixtureRoot, ...sourcePath.split('/'));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }

  runFixtureGit(fixtureRoot, ['init', '-q'], 'git init');
  runFixtureGit(fixtureRoot, ['config', 'gc.auto', '0'], 'disable fixture git gc');
  runFixtureGit(
    fixtureRoot,
    ['config', 'maintenance.auto', 'false'],
    'disable fixture git maintenance',
  );
  runFixtureGit(fixtureRoot, ['add', '-f', '-A'], 'git add');
  runFixtureGit(fixtureRoot, [
    '-c', 'commit.gpgsign=false',
    '-c', 'user.name=Open Design Test',
    '-c', 'user.email=open-design-test@example.invalid',
    'commit', '-qm', 'fixture',
  ], 'git commit');

  for (const family of ['argon', 'krypton', 'neon', 'xenon']) {
    const packageRoot = path.join(
      fixtureRoot,
      'node_modules',
      '@fontsource',
      `monaspace-${family}`,
    );
    fs.mkdirSync(path.join(packageRoot, 'files'), { recursive: true });
    for (const weight of [400, 600, 700]) {
      const basename = `monaspace-${family}-latin-${weight}-normal.woff2`;
      fs.copyFileSync(
        path.join(root, 'node_modules', '@fontsource', `monaspace-${family}`, 'files', basename),
        path.join(packageRoot, 'files', basename),
      );
    }
    fs.copyFileSync(
      path.join(root, 'node_modules', '@fontsource', `monaspace-${family}`, 'LICENSE'),
      path.join(packageRoot, 'LICENSE'),
    );
  }
  return fixtureRoot;
}

test('generated repository docs describe the repo-canonical Open Design boundary', () => {
  for (const file of ['README.md', 'design/README.md']) {
    const markdown = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(markdown, /design\/open-design\/bizarre-industries/iu, file);
    assert.match(markdown, /five artifact-level (?:CSS )?modes/iu, file);
    assert.match(markdown, /full (?:repository )?evidence/iu, file);
    assert.match(markdown, /local install/iu, file);
  }
});

test('builds and publishes the complete deterministic Open Design package in a temporary root', (t) => {
  const packageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-open-design-package-'));
  fs.rmdirSync(packageRoot);
  t.after(() => fs.rmSync(packageRoot, { force: true, recursive: true }));

  const evidence = listRepositoryEvidence({ root, packageRoot });
  const expectedCoverage = deriveCoverage(evidence);
  assert.deepEqual(expectedCoverage, [
    { id: 'editors', label: 'Editors', count: evidence.filter(({ sourcePath }) => sourcePath.startsWith('editors/')).length },
    { id: 'terminals', label: 'Terminals', count: evidence.filter(({ sourcePath }) => sourcePath.startsWith('terminals/')).length },
    { id: 'shells', label: 'Shells', count: evidence.filter(({ sourcePath }) => sourcePath.startsWith('shells/')).length },
    { id: 'prompts', label: 'Prompts', count: evidence.filter(({ sourcePath }) => sourcePath.startsWith('prompt/')).length },
    { id: 'tools', label: 'Tools', count: evidence.filter(({ sourcePath }) => sourcePath.startsWith('tools/')).length },
    { id: 'apps', label: 'Apps', count: evidence.filter(({ sourcePath }) => sourcePath.startsWith('apps/')).length },
    { id: 'web', label: 'Web', count: evidence.filter(({ sourcePath }) => sourcePath.startsWith('web/')).length },
    { id: 'docs', label: 'Docs', count: evidence.filter(({ sourcePath }) => sourcePath.startsWith('docs-sites/')).length },
    { id: 'window-managers', label: 'Window managers', count: evidence.filter(({ sourcePath }) => sourcePath.startsWith('wm/')).length },
  ]);
  assert.deepEqual(PREVIEW_ASSETS, {
    badge: 'assets/brand/bizarre-badge.svg',
    hero: 'assets/showcase/hero.png',
    variants: 'assets/showcase/variants.png',
    colors: 'assets/showcase/palette-ansi.png',
    syntax: 'assets/showcase/syntax.png',
    components: 'assets/showcase/vscode-themes.png',
    coverage: 'assets/showcase/tools.png',
    app: 'assets/showcase/shell-banner.png',
  });

  const built = buildOpenDesignPackage({ root, packageRoot });
  assert.ok(built instanceof Map);
  assert.equal(built.has('package-files.json'), false);
  assert.equal(built.has('assets/bizarre-tokens.css'), true);
  assert.equal(built.has('system/kit.html'), true);
  assert.equal(built.has('bizarre-tokens.css'), false);
  const builtEvidence = JSON.parse(built.get('source/scanned-files.json').toString('utf8'));
  const builtEvidenceBySource = new Map(
    builtEvidence.files.map((entry) => [entry.sourcePath, entry]),
  );
  const loadedLocalModules = loadedGeneratorRepositoryModules();
  assert.deepEqual(loadedLocalModules, [
    'palette.js',
    'scripts/generate-open-design.cjs',
    'scripts/lib/open-design/evidence.cjs',
    'scripts/lib/open-design/fonts.cjs',
    'scripts/lib/open-design/model.cjs',
    'scripts/lib/open-design/package-writer.cjs',
    'scripts/lib/open-design/render-components.cjs',
    'scripts/lib/open-design/render-docs.cjs',
    'scripts/lib/open-design/render-tokens.cjs',
  ]);
  for (const sourcePath of loadedLocalModules) {
    const entry = builtEvidenceBySource.get(sourcePath);
    assert.ok(entry, `loaded local module is missing from evidence: ${sourcePath}`);
    assert.equal(
      entry.sha256,
      sha256(fs.readFileSync(path.join(root, ...sourcePath.split('/')))),
      `loaded local module hash differs from evidence: ${sourcePath}`,
    );
  }
  assert.deepEqual(generateOpenDesignPackage({ root, packageRoot, check: false }), []);

  const manifest = readJson(packageRoot, 'manifest.json');
  const metadata = readJson(packageRoot, 'metadata.json');
  assertDeclaredPathsExist(packageRoot, manifest);
  assert.deepEqual(metadata, {
    title: 'Bizarre Industries',
    category: 'Developer Tools',
    surface: 'web',
    status: 'published',
    artifactMode: 'agent-managed',
    projectId: 'ds-bizarre-industries',
  });

  const actualFiles = filesBelow(packageRoot);
  const ownership = readJson(packageRoot, 'package-files.json');
  assert.equal(ownership.version, 1);
  assert.deepEqual(
    ownership.files.map(({ file }) => file),
    actualFiles.filter((file) => file !== 'package-files.json'),
  );
  for (const record of ownership.files) {
    assert.equal(record.sha256, sha256(fs.readFileSync(path.join(packageRoot, record.file))), record.file);
  }

  assert.deepEqual(
    fs.readFileSync(path.join(packageRoot, 'source/snippets/repo/README.md')),
    fs.readFileSync(path.join(root, 'README.md')),
  );

  const scanned = readJson(packageRoot, 'source/scanned-files.json');
  assert.deepEqual(Object.keys(scanned), ['schemaVersion', 'files']);
  assert.equal(scanned.schemaVersion, 1);
  assert.deepEqual(scanned.files.map(({ sourcePath }) => sourcePath), evidence.map(({ sourcePath }) => sourcePath));
  assert.deepEqual(
    scanned.files.map(({ sourcePath }) => sourcePath),
    [...scanned.files.map(({ sourcePath }) => sourcePath)].sort(rawCompare),
  );
  assert.ok(scanned.files.every(({ sourcePath }) => !/agents\.md/iu.test(sourcePath)));
  assert.ok(scanned.files.every(({ sourcePath }) => sourcePath !== 'docs/agent-handoff.md'));
  assert.ok(scanned.files.every(({ sourcePath }) => !sourcePath.startsWith('design/open-design/bizarre-industries/')));
  const scannedPaths = new Set(scanned.files.map(({ sourcePath }) => sourcePath));
  const explicitExclusions = [];
  for (const sourcePath of gitVisiblePaths()) {
    const packageOutput = sourcePath === 'design/open-design/bizarre-industries'
      || sourcePath.startsWith('design/open-design/bizarre-industries/')
      || /^design\/open-design\/(?:\.)?bizarre-industries\.(?:tmp|temp|stage)-/u.test(sourcePath);
    const agentInstruction = sourcePath.split('/').some((segment) => segment.toLowerCase() === 'agents.md');
    const volatileHandoff = sourcePath === 'docs/agent-handoff.md';
    if (!isCurrentRegularRepositoryFile(sourcePath) || packageOutput || agentInstruction || volatileHandoff) {
      explicitExclusions.push(sourcePath);
    } else {
      assert.equal(scannedPaths.has(sourcePath), true, `uncovered current repository file: ${sourcePath}`);
    }
  }
  assert.equal(scanned.files.length + explicitExclusions.length, gitVisiblePaths().length);
  for (const entry of scanned.files) {
    const packaged = fs.readFileSync(path.join(packageRoot, ...entry.packagePath.split('/')));
    const source = fs.readFileSync(path.join(root, ...entry.sourcePath.split('/')));
    assert.equal(packaged.length, entry.bytes, entry.sourcePath);
    assert.equal(sha256(packaged), entry.sha256, entry.sourcePath);
    assert.deepEqual(packaged, source, entry.sourcePath);
  }

  const snippets = readJson(packageRoot, 'source/snippets/INDEX.json');
  assert.deepEqual(Object.keys(snippets), ['schemaVersion', 'snippets']);
  assert.equal(snippets.schemaVersion, 1);
  const expectedSnippets = scanned.files.filter(({ packagePath }) => packagePath.startsWith('source/snippets/'));
  assert.deepEqual(snippets.snippets.map(({ sourcePath }) => sourcePath), expectedSnippets.map(({ sourcePath }) => sourcePath));
  assert.ok(snippets.snippets.every((entry) => entry.path === entry.packagePath));

  const screenshotEntries = evidence.filter(({ sourcePath }) => sourcePath.startsWith('showcase/assets/generated/')
    && sourcePath.endsWith('.png'));
  assert.ok(screenshotEntries.length > 0);
  for (const entry of screenshotEntries) {
    assert.equal(
      entry.packagePath,
      `assets/showcase/${path.posix.basename(entry.sourcePath)}`,
      entry.sourcePath,
    );
    assert.equal(
      sha256(fs.readFileSync(path.join(packageRoot, entry.packagePath))),
      entry.sha256,
      entry.sourcePath,
    );
  }

  assert.equal(manifest.fonts.length, 12);
  assert.equal(manifest.fonts.every(({ file }) => actualFiles.includes(file)), true);
  assert.deepEqual(
    actualFiles.filter((file) => file.startsWith('assets/licenses/')),
    ['assets/licenses/monaspace-argon-LICENSE', 'assets/licenses/monaspace-krypton-LICENSE', 'assets/licenses/monaspace-neon-LICENSE', 'assets/licenses/monaspace-xenon-LICENSE'],
  );
  assert.equal(actualFiles.some((file) => /radon/iu.test(file)), false);
  assert.match(fs.readFileSync(path.join(packageRoot, 'DESIGN.md'), 'utf8'), /Radon[\s\S]*asset-status: unavailable/iu);
  for (const family of ['argon', 'krypton', 'neon', 'xenon']) {
    for (const weight of [400, 600, 700]) {
      const relative = `monaspace-${family}-latin-${weight}-normal.woff2`;
      assert.deepEqual(
        fs.readFileSync(path.join(packageRoot, 'fonts', relative)),
        fs.readFileSync(path.join(root, 'node_modules', '@fontsource', `monaspace-${family}`, 'files', relative)),
        relative,
      );
    }
    assert.deepEqual(
      fs.readFileSync(path.join(packageRoot, 'assets/licenses', `monaspace-${family}-LICENSE`)),
      fs.readFileSync(path.join(root, 'node_modules', '@fontsource', `monaspace-${family}`, 'LICENSE')),
      `${family} license`,
    );
  }

  const tokensSource = readJson(packageRoot, 'source/tokens.source.json');
  assert.deepEqual(Object.keys(tokensSource), ['schemaVersion', 'source', 'exports']);
  assert.equal(tokensSource.schemaVersion, 1);
  assert.equal(tokensSource.source, 'palette.js');
  assert.deepEqual(Object.keys(tokensSource.exports), ['brand', 'fonts', 'syntax', 'status', 'ansi', 'variants', 'variantOrder']);
  assert.deepEqual(tokensSource.exports, {
    brand: palette.brand,
    fonts: palette.fonts,
    syntax: palette.syntax,
    status: palette.status,
    ansi: palette.ansi,
    variants: palette.variants,
    variantOrder: palette.variantOrder,
  });

  const coverageHtml = fs.readFileSync(path.join(packageRoot, 'preview/coverage.html'), 'utf8');
  for (const record of expectedCoverage) {
    assert.match(coverageHtml, new RegExp(`>${record.count}<`, 'u'), record.id);
  }
  const previewHtml = manifest.preview.pages.map(({ path: pagePath }) => fs.readFileSync(path.join(packageRoot, pagePath), 'utf8')).join('\n');
  for (const assetPath of Object.values(PREVIEW_ASSETS)) {
    assert.match(previewHtml, new RegExp(assetPath.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'), assetPath);
  }

  const firstManifest = fs.readFileSync(path.join(packageRoot, 'package-files.json'));
  assert.deepEqual(generateOpenDesignPackage({ root, packageRoot, check: true }), []);
  const mutationPath = path.join(packageRoot, 'metadata.json');
  const originalMetadata = fs.readFileSync(mutationPath);
  fs.appendFileSync(mutationPath, '\n');
  assert.deepEqual(generateOpenDesignPackage({ root, packageRoot, check: true }), ['metadata.json']);
  fs.writeFileSync(mutationPath, originalMetadata);
  assert.deepEqual(generateOpenDesignPackage({ root, packageRoot, check: true }), []);
  assert.deepEqual(generateOpenDesignPackage({ root, packageRoot, check: false }), []);
  assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'package-files.json')), firstManifest);

  for (const representative of [
    'design/open-design/bizarre-industries/assets/showcase/hero.png',
    'design/open-design/bizarre-industries/assets/brand/bizarre-badge.svg',
  ]) {
    const ignored = spawnSync('git', ['check-ignore', '--no-index', '-q', '--', representative], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.equal(ignored.status, 1, `${representative} must be explicitly re-included`);
  }
});

test('font inventory reports the exact missing dependency path', (t) => {
  const missingRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-open-design-missing-fonts-'));
  t.after(() => fs.rmSync(missingRoot, { force: true, recursive: true }));
  const missing = path.join(
    missingRoot,
    'node_modules/@fontsource/monaspace-argon/files/monaspace-argon-latin-400-normal.woff2',
  );
  assert.throws(
    () => loadFontAssets({ root: missingRoot }),
    (error) => error instanceof Error && error.message.includes(missing),
  );
});

test('font inventory rejects symlinks and persistent identity changes across dependency paths', (t) => {
  const families = ['argon', 'krypton', 'neon', 'xenon'];
  const weights = [400, 600, 700];
  const makeFontRoot = (name) => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `bizarre-open-design-font-${name}-`));
    t.after(() => fs.rmSync(fixtureRoot, { force: true, recursive: true }));
    for (const family of families) {
      const packageRoot = path.join(
        fixtureRoot,
        'node_modules',
        '@fontsource',
        `monaspace-${family}`,
      );
      for (const weight of weights) {
        const basename = `monaspace-${family}-latin-${weight}-normal.woff2`;
        fs.mkdirSync(path.join(packageRoot, 'files'), { recursive: true });
        fs.writeFileSync(path.join(packageRoot, 'files', basename), `${family}-${weight}\n`);
      }
      fs.writeFileSync(path.join(packageRoot, 'LICENSE'), `${family} license\n`);
    }
    return fixtureRoot;
  };

  const stableRoot = makeFontRoot('stable');
  const stable = loadFontAssets({ root: stableRoot });
  assert.equal(stable.size, 16);
  assert.deepEqual(
    stable.get('fonts/monaspace-argon-latin-400-normal.woff2'),
    Buffer.from('argon-400\n'),
  );

  const parentLinkRoot = makeFontRoot('parent-link');
  const realPackage = path.join(parentLinkRoot, 'real-argon-package');
  const linkedPackage = path.join(
    parentLinkRoot,
    'node_modules',
    '@fontsource',
    'monaspace-argon',
  );
  fs.renameSync(linkedPackage, realPackage);
  fs.symlinkSync(realPackage, linkedPackage);
  const originalReadFileSync = fs.readFileSync;
  let parentLinkReads = 0;
  fs.readFileSync = function countParentLinkReads(file, ...args) {
    parentLinkReads += 1;
    return originalReadFileSync(file, ...args);
  };
  try {
    assert.throws(
      () => loadFontAssets({ root: parentLinkRoot }),
      /symbolic link.*monaspace-argon/iu,
    );
  } finally {
    fs.readFileSync = originalReadFileSync;
  }
  assert.equal(parentLinkReads, 0);

  const leafLinkRoot = makeFontRoot('leaf-link');
  const linkedLeaf = path.join(
    leafLinkRoot,
    'node_modules',
    '@fontsource',
    'monaspace-argon',
    'files',
    'monaspace-argon-latin-400-normal.woff2',
  );
  const realLeaf = `${linkedLeaf}.real`;
  fs.renameSync(linkedLeaf, realLeaf);
  fs.symlinkSync(realLeaf, linkedLeaf);
  assert.throws(
    () => loadFontAssets({ root: leafLinkRoot }),
    /symbolic link.*monaspace-argon-latin-400-normal\.woff2/iu,
  );

  const parentSwapRoot = makeFontRoot('parent-swap');
  const parentSwapLeaf = path.join(
    parentSwapRoot,
    'node_modules',
    '@fontsource',
    'monaspace-argon',
    'files',
    'monaspace-argon-latin-400-normal.woff2',
  );
  const parentSwapDir = path.dirname(parentSwapLeaf);
  const parentSwapBefore = `${parentSwapDir}.before`;
  let parentSwapped = false;
  fs.readFileSync = function swapFontParentAfterRead(file, ...args) {
    const bytes = originalReadFileSync(file, ...args);
    if (!parentSwapped && typeof file === 'number') {
      parentSwapped = true;
      fs.renameSync(parentSwapDir, parentSwapBefore);
      fs.mkdirSync(parentSwapDir);
      fs.writeFileSync(parentSwapLeaf, bytes);
    }
    return bytes;
  };
  try {
    assert.throws(
      () => loadFontAssets({ root: parentSwapRoot }),
      /changed while reading.*monaspace-argon-latin-400-normal\.woff2/iu,
    );
  } finally {
    fs.readFileSync = originalReadFileSync;
  }
  assert.equal(parentSwapped, true);

  const leafSwapRoot = makeFontRoot('leaf-swap');
  const leafSwapPath = path.join(
    leafSwapRoot,
    'node_modules',
    '@fontsource',
    'monaspace-argon',
    'files',
    'monaspace-argon-latin-400-normal.woff2',
  );
  const leafSwapBefore = `${leafSwapPath}.before`;
  let leafSwapped = false;
  fs.readFileSync = function swapFontLeafAfterRead(file, ...args) {
    const bytes = originalReadFileSync(file, ...args);
    if (!leafSwapped && typeof file === 'number') {
      leafSwapped = true;
      fs.renameSync(leafSwapPath, leafSwapBefore);
      fs.writeFileSync(leafSwapPath, bytes);
    }
    return bytes;
  };
  try {
    assert.throws(
      () => loadFontAssets({ root: leafSwapRoot }),
      /changed while reading.*monaspace-argon-latin-400-normal\.woff2/iu,
    );
  } finally {
    fs.readFileSync = originalReadFileSync;
  }
  assert.equal(leafSwapped, true);

  const postFstatRoot = makeFontRoot('post-fstat-edit');
  const postFstatPath = path.join(
    postFstatRoot,
    'node_modules',
    '@fontsource',
    'monaspace-argon',
    'files',
    'monaspace-argon-latin-400-normal.woff2',
  );
  const originalOpenSync = fs.openSync;
  const originalFstatSync = fs.fstatSync;
  let watchedDescriptor;
  let watchedFstats = 0;
  let editedAfterFinalDescriptorStat = false;
  fs.openSync = function watchFontDescriptor(file, ...args) {
    const descriptor = originalOpenSync(file, ...args);
    if (path.resolve(String(file)) === postFstatPath) watchedDescriptor = descriptor;
    return descriptor;
  };
  fs.fstatSync = function editAfterSecondFontFstat(descriptor, ...args) {
    const stat = originalFstatSync(descriptor, ...args);
    if (descriptor === watchedDescriptor && ++watchedFstats === 2) {
      editedAfterFinalDescriptorStat = true;
      fs.appendFileSync(postFstatPath, 'persistent same-inode edit\n');
    }
    return stat;
  };
  try {
    assert.throws(
      () => loadFontAssets({ root: postFstatRoot }),
      /changed while reading.*monaspace-argon-latin-400-normal\.woff2/iu,
    );
  } finally {
    fs.openSync = originalOpenSync;
    fs.fstatSync = originalFstatSync;
  }
  assert.equal(editedAfterFinalDescriptorStat, true);
});

test('generator rejects implementation drift between bootstrap capture and lazy module load before writing', (t) => {
  const fixtureRoot = makeBootstrapRepositoryFixture(t, 'bootstrap-before-load');
  const packageRoot = path.join(os.tmpdir(), `bizarre-open-design-bootstrap-before-load-${process.pid}`);
  const generatorPath = path.join(fixtureRoot, 'scripts/generate-open-design.cjs');
  const targetPath = path.join(fixtureRoot, 'scripts/lib/open-design/evidence.cjs');
  const executionMarker = path.join(os.tmpdir(), `bizarre-open-design-bootstrap-executed-${process.pid}`);
  t.after(() => fs.rmSync(packageRoot, { force: true, recursive: true }));
  t.after(() => fs.rmSync(executionMarker, { force: true }));

  const generator = require(generatorPath);
  assert.equal(require.cache[require.resolve(targetPath)], undefined);
  fs.appendFileSync(
    targetPath,
    `\nrequire('node:fs').writeFileSync(${JSON.stringify(executionMarker)}, 'executed\\n');\n`,
  );

  assert.throws(
    () => generator.generateOpenDesignPackage({
      root: fixtureRoot,
      packageRoot,
      check: false,
    }),
    (error) => error instanceof Error
      && error.message === 'Implementation source does not match bootstrap snapshot: scripts/lib/open-design/evidence.cjs',
  );
  assert.equal(require.cache[require.resolve(targetPath)], undefined);
  assert.equal(fs.existsSync(executionMarker), false);
  assert.equal(fs.existsSync(packageRoot), false);
});

test('generator rejects a persistent same-inode implementation edit after its final descriptor stat', (t) => {
  const fixtureRoot = makeBootstrapRepositoryFixture(t, 'bootstrap-post-fstat-edit');
  const generatorPath = path.join(fixtureRoot, 'scripts/generate-open-design.cjs');
  const targetPath = path.join(fixtureRoot, 'scripts/lib/open-design/evidence.cjs');
  const targetRealPath = fs.realpathSync.native(targetPath);
  const resolvedGeneratorPath = require.resolve(generatorPath);
  const originalOpenSync = fs.openSync;
  const originalFstatSync = fs.fstatSync;
  let watchedDescriptor;
  let watchedFstats = 0;
  let editedAfterFinalDescriptorStat = false;

  fs.openSync = function watchImplementationDescriptor(file, ...args) {
    const descriptor = originalOpenSync(file, ...args);
    if (watchedDescriptor === undefined
      && fs.realpathSync.native(String(file)) === targetRealPath) {
      watchedDescriptor = descriptor;
    }
    return descriptor;
  };
  fs.fstatSync = function editAfterSecondImplementationFstat(descriptor, ...args) {
    const stat = originalFstatSync(descriptor, ...args);
    if (descriptor === watchedDescriptor && ++watchedFstats === 2) {
      editedAfterFinalDescriptorStat = true;
      fs.appendFileSync(targetPath, '\n// persistent same-inode edit after descriptor stat\n');
    }
    return stat;
  };

  try {
    assert.throws(
      () => require(generatorPath),
      (error) => error instanceof Error
        && error.message === 'Implementation source changed during bootstrap capture: scripts/lib/open-design/evidence.cjs',
    );
  } finally {
    fs.openSync = originalOpenSync;
    fs.fstatSync = originalFstatSync;
    delete require.cache[resolvedGeneratorPath];
  }
  assert.equal(editedAfterFinalDescriptorStat, true);
});

test('generator rejects implementation drift after module load and before evidence enumeration without writing', (t) => {
  const fixtureRoot = makeBootstrapRepositoryFixture(t, 'bootstrap-after-load');
  const packageRoot = path.join(os.tmpdir(), `bizarre-open-design-bootstrap-after-load-${process.pid}`);
  const generatorPath = path.join(fixtureRoot, 'scripts/generate-open-design.cjs');
  const targetPath = path.join(fixtureRoot, 'scripts/lib/open-design/evidence.cjs');
  const targetRealPath = fs.realpathSync.native(targetPath);
  t.after(() => fs.rmSync(packageRoot, { force: true, recursive: true }));

  const originalLoad = Module._load;
  let mutated = false;
  Module._load = function mutateImplementationAfterLoad(request, parent, isMain) {
    const resolved = Module._resolveFilename(request, parent, isMain);
    const loaded = originalLoad.call(this, request, parent, isMain);
    if (!mutated && path.isAbsolute(resolved)
      && fs.realpathSync.native(resolved) === targetRealPath) {
      mutated = true;
      fs.appendFileSync(targetPath, '\n// persistent drift after module load\n');
    }
    return loaded;
  };
  try {
    const generator = require(generatorPath);
    assert.throws(
      () => generator.generateOpenDesignPackage({
        root: fixtureRoot,
        packageRoot,
        check: false,
      }),
      (error) => error instanceof Error
        && error.message === 'Loaded implementation source does not match repository evidence: scripts/lib/open-design/evidence.cjs',
    );
  } finally {
    Module._load = originalLoad;
  }
  assert.equal(mutated, true);
  assert.equal(fs.existsSync(packageRoot), false);
});

test('generator reloads a captured implementation module that was cached before bootstrap', (t) => {
  const fixtureRoot = makeBootstrapRepositoryFixture(t, 'bootstrap-preloaded-cache');
  const packageRoot = path.join(os.tmpdir(), `bizarre-open-design-bootstrap-preloaded-cache-${process.pid}`);
  const generatorPath = path.join(fixtureRoot, 'scripts/generate-open-design.cjs');
  const targetPath = path.join(fixtureRoot, 'scripts/lib/open-design/evidence.cjs');
  t.after(() => fs.rmSync(packageRoot, { force: true, recursive: true }));

  const preloaded = require(targetPath);
  fs.appendFileSync(
    targetPath,
    "\nmodule.exports.bootstrapReloadSentinel = 'reloaded';\n",
  );
  const generator = require(generatorPath);
  const built = generator.buildOpenDesignPackage({ root: fixtureRoot, packageRoot });
  const reloaded = require(targetPath);

  assert.ok(built instanceof Map);
  assert.notStrictEqual(reloaded, preloaded);
  assert.equal(reloaded.bootstrapReloadSentinel, 'reloaded');
  assert.equal(fs.existsSync(packageRoot), false);
});

test('generator rejects its own persistent drift after bootstrap capture without writing', (t) => {
  const fixtureRoot = makeBootstrapRepositoryFixture(t, 'bootstrap-entrypoint-drift');
  const packageRoot = path.join(os.tmpdir(), `bizarre-open-design-bootstrap-entrypoint-drift-${process.pid}`);
  const generatorPath = path.join(fixtureRoot, 'scripts/generate-open-design.cjs');
  t.after(() => fs.rmSync(packageRoot, { force: true, recursive: true }));

  const generator = require(generatorPath);
  fs.appendFileSync(generatorPath, '\n// persistent entrypoint drift after bootstrap capture\n');
  assert.throws(
    () => generator.generateOpenDesignPackage({
      root: fixtureRoot,
      packageRoot,
      check: false,
    }),
    (error) => error instanceof Error
      && error.message === 'Implementation source does not match bootstrap snapshot: scripts/generate-open-design.cjs',
  );
  assert.equal(fs.existsSync(packageRoot), false);
});

test('builder revalidates all repository evidence after rendering and font reads', (t) => {
  const packageRoot = path.join(os.tmpdir(), `bizarre-open-design-race-output-${process.pid}`);
  const fixtureName = `.open-design-evidence-race-${process.pid}.txt`;
  const fixture = path.join(root, fixtureName);
  const trigger = path.join(
    root,
    'node_modules/@fontsource/monaspace-xenon/LICENSE',
  );
  fs.writeFileSync(fixture, 'before render\n');
  t.after(() => {
    fs.rmSync(fixture, { force: true });
    fs.rmSync(packageRoot, { force: true, recursive: true });
  });

  const originalOpenSync = fs.openSync;
  let mutated = false;
  fs.openSync = function mutateEvidenceAfterFontOpen(file, ...args) {
    const descriptor = originalOpenSync(file, ...args);
    if (!mutated && path.resolve(String(file)) === trigger) {
      mutated = true;
      fs.writeFileSync(fixture, 'after render\n');
    }
    return descriptor;
  };
  try {
    assert.throws(
      () => buildOpenDesignPackage({ root, packageRoot }),
      /repository evidence inventory changed while building package/iu,
    );
  } finally {
    fs.openSync = originalOpenSync;
  }
  assert.equal(mutated, true);
  assert.equal(fs.existsSync(packageRoot), false);
});

test('builder rejects late additions and removals from the Git-visible evidence path set', (t) => {
  const trigger = path.join(root, 'node_modules/@fontsource/monaspace-xenon/LICENSE');
  const scenarios = [
    {
      name: 'late addition',
      fixture: path.join(root, `.open-design-late-add-${process.pid}.txt`),
      prepare() {},
      mutate(fixture) { fs.writeFileSync(fixture, 'added after rendering\n'); },
    },
    {
      name: 'late removal',
      fixture: path.join(root, `.open-design-late-remove-${process.pid}.txt`),
      prepare(fixture) { fs.writeFileSync(fixture, 'present before rendering\n'); },
      mutate(fixture) { fs.unlinkSync(fixture); },
    },
  ];

  for (const scenario of scenarios) {
    const packageRoot = path.join(
      os.tmpdir(),
      `bizarre-open-design-${scenario.name.replace(' ', '-')}-${process.pid}`,
    );
    scenario.prepare(scenario.fixture);
    const originalOpenSync = fs.openSync;
    let mutated = false;
    fs.openSync = function mutatePathSetAfterFontOpen(file, ...args) {
      const descriptor = originalOpenSync(file, ...args);
      if (!mutated && path.resolve(String(file)) === trigger) {
        mutated = true;
        scenario.mutate(scenario.fixture);
      }
      return descriptor;
    };
    try {
      assert.throws(
        () => buildOpenDesignPackage({ root, packageRoot }),
        /repository evidence inventory changed while building package/iu,
        scenario.name,
      );
    } finally {
      fs.openSync = originalOpenSync;
      fs.rmSync(scenario.fixture, { force: true });
      fs.rmSync(packageRoot, { force: true, recursive: true });
    }
    assert.equal(mutated, true, scenario.name);
    assert.equal(fs.existsSync(packageRoot), false, scenario.name);
  }
});

test('builder rejects a late Git status change even when the evidence inventory is excluded', (t) => {
  const packageRoot = path.join(os.tmpdir(), `bizarre-open-design-status-race-${process.pid}`);
  const openDesignParent = path.join(root, 'design/open-design');
  const parentExisted = fs.existsSync(openDesignParent);
  const excludedRoot = path.join(
    openDesignParent,
    `bizarre-industries.tmp-status-race-${process.pid}`,
  );
  const fixture = path.join(excludedRoot, 'status.txt');
  const trigger = path.join(root, 'node_modules/@fontsource/monaspace-xenon/LICENSE');
  t.after(() => {
    fs.rmSync(excludedRoot, { force: true, recursive: true });
    fs.rmSync(packageRoot, { force: true, recursive: true });
    if (!parentExisted) {
      try { fs.rmdirSync(openDesignParent); } catch (error) {
        if (!error || !['ENOENT', 'ENOTEMPTY'].includes(error.code)) throw error;
      }
    }
  });

  const originalOpenSync = fs.openSync;
  let mutated = false;
  fs.openSync = function mutateStatusAfterFontOpen(file, ...args) {
    const descriptor = originalOpenSync(file, ...args);
    if (!mutated && path.resolve(String(file)) === trigger) {
      mutated = true;
      fs.mkdirSync(excludedRoot, { recursive: true });
      fs.writeFileSync(fixture, 'excluded evidence, visible Git status\n');
    }
    return descriptor;
  };
  try {
    assert.throws(
      () => buildOpenDesignPackage({ root, packageRoot }),
      /Git working-tree status changed while building package/iu,
    );
  } finally {
    fs.openSync = originalOpenSync;
  }
  assert.equal(mutated, true);
  assert.equal(fs.existsSync(packageRoot), false);
});

test('Open Design package check runs through the captured generator entrypoint', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(
    packageJson.scripts['check:open-design'],
    'node scripts/generate-open-design.cjs --check',
  );
  assert.equal(fs.existsSync(path.join(root, 'scripts/check-open-design.cjs')), false);
});

test('CLI check mode prints the exact current and stale contracts for --output', (t) => {
  const packageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-open-design-cli-'));
  fs.rmdirSync(packageRoot);
  t.after(() => fs.rmSync(packageRoot, { force: true, recursive: true }));

  const generated = spawnSync(process.execPath, [
    path.join(root, 'scripts/generate-open-design.cjs'),
    '--output', packageRoot,
  ], { cwd: root, encoding: 'utf8' });
  assert.equal(generated.status, 0, generated.stderr);
  assert.equal(generated.stdout, `generated Open Design package: ${path.normalize(packageRoot)}\n`);

  const current = spawnSync(process.execPath, [
    path.join(root, 'scripts/generate-open-design.cjs'),
    '--check',
    '--output', packageRoot,
  ], { cwd: root, encoding: 'utf8' });
  assert.equal(current.status, 0, current.stderr);
  assert.equal(current.stdout, 'Open Design package is current\n');

  fs.appendFileSync(path.join(packageRoot, 'metadata.json'), '\n');
  const stale = spawnSync(process.execPath, [
    path.join(root, 'scripts/generate-open-design.cjs'),
    '--check',
    '--output', packageRoot,
  ], { cwd: root, encoding: 'utf8' });
  assert.equal(stale.status, 1, stale.stderr);
  assert.equal(stale.stdout, 'Open Design package is stale:\n- metadata.json\n');

  const emptyOutput = spawnSync(process.execPath, [
    path.join(root, 'scripts/generate-open-design.cjs'),
    '--check',
    '--output', '',
  ], { cwd: root, encoding: 'utf8' });
  assert.equal(emptyOutput.status, 1);
  assert.equal(emptyOutput.stdout, '');
  assert.match(emptyOutput.stderr, /--output requires exactly one non-empty path/iu);
});
