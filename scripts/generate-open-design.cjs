#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { isDeepStrictEqual } = require('node:util');

const IMPLEMENTATION_SOURCE_PATHS = Object.freeze([
  'scripts/generate-open-design.cjs',
  'scripts/lib/open-design/evidence.cjs',
  'scripts/lib/open-design/fonts.cjs',
  'scripts/lib/open-design/model.cjs',
  'scripts/lib/open-design/package-writer.cjs',
  'scripts/lib/open-design/render-components.cjs',
  'scripts/lib/open-design/render-docs.cjs',
  'scripts/lib/open-design/render-tokens.cjs',
]);

const IMPLEMENTATION_ROOT = path.resolve(__dirname, '..');

function sourceKind(stat) {
  if (stat.isFile()) return 'file';
  if (stat.isDirectory()) return 'directory';
  if (stat.isSymbolicLink()) return 'symlink';
  return 'other';
}

function sourceIdentity(file, stat) {
  return Object.freeze({ file, dev: stat.dev, ino: stat.ino, kind: sourceKind(stat) });
}

function sameSourceIdentity(expected, file, stat) {
  return expected.file === file
    && expected.dev === stat.dev
    && expected.ino === stat.ino
    && expected.kind === sourceKind(stat);
}

function sameSourceSnapshot(left, right) {
  return left.dev === right.dev
    && left.ino === right.ino
    && left.size === right.size
    && left.mtimeNs === right.mtimeNs
    && left.ctimeNs === right.ctimeNs;
}

function implementationCaptureChanged(sourcePath) {
  return new Error(`Implementation source changed during bootstrap capture: ${sourcePath}`);
}

function captureImplementationSource(root, sourcePath) {
  const segments = sourcePath.split('/');
  let current = path.resolve(root);
  const identities = [];
  const rootStat = fs.lstatSync(current, { bigint: true });
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw new Error(`Implementation root must be a real directory: ${current}`);
  }
  identities.push(sourceIdentity(current, rootStat));
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index]);
    const stat = fs.lstatSync(current, { bigint: true });
    if (stat.isSymbolicLink()
      || (index < segments.length - 1 && !stat.isDirectory())
      || (index === segments.length - 1 && !stat.isFile())) {
      throw new Error(`Implementation source must be a real file: ${sourcePath}`);
    }
    identities.push(sourceIdentity(current, stat));
  }

  const flags = fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0);
  let descriptor;
  try {
    descriptor = fs.openSync(current, flags);
  } catch (error) {
    if (error && ['ELOOP', 'ENOENT', 'ENOTDIR'].includes(error.code)) {
      throw implementationCaptureChanged(sourcePath);
    }
    throw error;
  }

  try {
    const before = fs.fstatSync(descriptor, { bigint: true });
    if (!before.isFile() || !sameSourceIdentity(identities.at(-1), current, before)) {
      throw implementationCaptureChanged(sourcePath);
    }
    const bytes = fs.readFileSync(descriptor);
    const after = fs.fstatSync(descriptor, { bigint: true });
    if (!sameSourceSnapshot(before, after) || BigInt(bytes.length) !== after.size) {
      throw implementationCaptureChanged(sourcePath);
    }
    let finalLeafStat;
    for (const [index, expected] of identities.entries()) {
      let stat;
      try {
        stat = fs.lstatSync(expected.file, { bigint: true });
      } catch (error) {
        if (error && ['ENOENT', 'ENOTDIR'].includes(error.code)) {
          throw implementationCaptureChanged(sourcePath);
        }
        throw error;
      }
      if (!sameSourceIdentity(expected, expected.file, stat)) {
        throw implementationCaptureChanged(sourcePath);
      }
      if (index === identities.length - 1) finalLeafStat = stat;
    }
    if (!finalLeafStat || !sameSourceSnapshot(after, finalLeafStat)) {
      throw implementationCaptureChanged(sourcePath);
    }
    return Object.freeze({
      bytes: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    });
  } finally {
    fs.closeSync(descriptor);
  }
}

function captureImplementationSources(root, sourcePaths) {
  return new Map(sourcePaths.map((sourcePath) => [
    sourcePath,
    captureImplementationSource(root, sourcePath),
  ]));
}

// This built-ins-only snapshot runs before any repository implementation module
// is required. The main generator is included even though Node has necessarily
// compiled its bootstrap prefix before this line executes.
const BOOTSTRAP_SOURCE_SNAPSHOTS = captureImplementationSources(
  IMPLEMENTATION_ROOT,
  IMPLEMENTATION_SOURCE_PATHS,
);

const DEFAULT_PACKAGE_ROOT = 'design/open-design/bizarre-industries';
const PALETTE_EXPORTS = Object.freeze([
  'brand', 'fonts', 'syntax', 'status', 'ansi', 'variants', 'variantOrder',
]);
const COVERAGE = Object.freeze([
  Object.freeze({ id: 'editors', label: 'Editors', prefix: 'editors/' }),
  Object.freeze({ id: 'terminals', label: 'Terminals', prefix: 'terminals/' }),
  Object.freeze({ id: 'shells', label: 'Shells', prefix: 'shells/' }),
  Object.freeze({ id: 'prompts', label: 'Prompts', prefix: 'prompt/' }),
  Object.freeze({ id: 'tools', label: 'Tools', prefix: 'tools/' }),
  Object.freeze({ id: 'apps', label: 'Apps', prefix: 'apps/' }),
  Object.freeze({ id: 'web', label: 'Web', prefix: 'web/' }),
  Object.freeze({ id: 'docs', label: 'Docs', prefix: 'docs-sites/' }),
  Object.freeze({ id: 'window-managers', label: 'Window managers', prefix: 'wm/' }),
]);
const PREVIEW_ASSETS = Object.freeze({
  badge: 'assets/brand/bizarre-badge.svg',
  hero: 'assets/showcase/hero.png',
  variants: 'assets/showcase/variants.png',
  colors: 'assets/showcase/palette-ansi.png',
  syntax: 'assets/showcase/syntax.png',
  components: 'assets/showcase/vscode-themes.png',
  coverage: 'assets/showcase/tools.png',
  app: 'assets/showcase/shell-banner.png',
});

let implementationModules;

function loadedRepositoryModuleSourcePaths(repositoryRoot = IMPLEMENTATION_ROOT) {
  const moduleRoots = [...new Set([
    fs.realpathSync.native(IMPLEMENTATION_ROOT),
    fs.realpathSync.native(repositoryRoot),
  ])];
  const pending = [module];
  const visited = new Set();
  const sourcePaths = [];
  while (pending.length > 0) {
    const current = pending.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    pending.push(...current.children);
    if (typeof current.filename !== 'string') continue;
    for (const moduleRoot of moduleRoots) {
      const relative = path.relative(moduleRoot, current.filename);
      if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`)
        || path.isAbsolute(relative)) continue;
      if (!relative.split(path.sep).includes('node_modules')) {
        sourcePaths.push(relative.split(path.sep).join('/'));
      }
      break;
    }
  }
  return [...new Set(sourcePaths)].sort();
}

function assertLoadedImplementationWasCaptured() {
  for (const sourcePath of loadedRepositoryModuleSourcePaths()) {
    if (!BOOTSTRAP_SOURCE_SNAPSHOTS.has(sourcePath)) {
      throw new Error(`Loaded local module was not captured before execution: ${sourcePath}`);
    }
  }
}

function evictCapturedImplementationModules() {
  for (const sourcePath of IMPLEMENTATION_SOURCE_PATHS) {
    if (sourcePath === 'scripts/generate-open-design.cjs') continue;
    const absolute = path.join(IMPLEMENTATION_ROOT, ...sourcePath.split('/'));
    let resolved;
    try {
      resolved = require.resolve(absolute);
    } catch (error) {
      throw new Error(`Could not resolve captured implementation source: ${sourcePath}`, {
        cause: error,
      });
    }
    delete require.cache[resolved];
  }
}

function assertImplementationSourcesMatchBootstrap() {
  for (const sourcePath of IMPLEMENTATION_SOURCE_PATHS) {
    const expected = BOOTSTRAP_SOURCE_SNAPSHOTS.get(sourcePath);
    const current = captureImplementationSource(IMPLEMENTATION_ROOT, sourcePath);
    if (current.bytes !== expected.bytes || current.sha256 !== expected.sha256) {
      throw new Error(`Implementation source does not match bootstrap snapshot: ${sourcePath}`);
    }
  }
}

function loadImplementationModules() {
  if (implementationModules) return implementationModules;
  assertImplementationSourcesMatchBootstrap();
  evictCapturedImplementationModules();
  const evidence = require('./lib/open-design/evidence.cjs');
  const fonts = require('./lib/open-design/fonts.cjs');
  const model = require('./lib/open-design/model.cjs');
  const writer = require('./lib/open-design/package-writer.cjs');
  const components = require('./lib/open-design/render-components.cjs');
  const docs = require('./lib/open-design/render-docs.cjs');
  const tokens = require('./lib/open-design/render-tokens.cjs');
  const loaded = Object.freeze({
    ...evidence,
    ...fonts,
    ...model,
    ...writer,
    ...components,
    ...docs,
    ...tokens,
  });
  assertLoadedImplementationWasCaptured();
  implementationModules = loaded;
  return loaded;
}

function assertSnapshotsMatchEvidence(entries, snapshots, sourcePaths = snapshots.keys()) {
  const evidenceBySource = new Map(entries.map((entry) => [entry.sourcePath, entry]));
  for (const sourcePath of sourcePaths) {
    const snapshot = snapshots.get(sourcePath);
    if (!snapshot) {
      throw new Error(`Loaded local module was not captured before execution: ${sourcePath}`);
    }
    const entry = evidenceBySource.get(sourcePath);
    if (!entry) {
      throw new Error(`Loaded implementation source is missing from repository evidence: ${sourcePath}`);
    }
    if (entry.bytes !== snapshot.bytes || entry.sha256 !== snapshot.sha256) {
      throw new Error(`Loaded implementation source does not match repository evidence: ${sourcePath}`);
    }
  }
}

function assertLoadedModulesMatchEvidence(entries, snapshots, repositoryRoot) {
  const loaded = loadedRepositoryModuleSourcePaths(repositoryRoot);
  assertSnapshotsMatchEvidence(entries, snapshots, loaded);
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function repositoryCommand(root, args, label, encoding = 'utf8') {
  const result = spawnSync('git', args, { cwd: root, encoding });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString('utf8').trim()
      : String(result.stderr || '').trim();
    throw new Error(`${label} failed${stderr ? `: ${stderr}` : ''}`);
  }
  return result.stdout;
}

function gitHead(root) {
  const head = repositoryCommand(root, ['rev-parse', 'HEAD'], 'git rev-parse').trim();
  if (!/^[0-9a-f]{40}$/u.test(head)) {
    throw new Error(`git rev-parse returned an invalid HEAD: ${head}`);
  }
  return head;
}

function gitStatus(root) {
  return repositoryCommand(
    root,
    ['status', '--porcelain=v1', '--untracked-files=all', '--'],
    'git status',
    'buffer',
  );
}

function loadPalette(root) {
  const palettePath = path.join(root, 'palette.js');
  let resolved;
  try {
    resolved = require.resolve(palettePath);
  } catch (error) {
    throw new Error(`Could not load canonical palette: ${palettePath}`, { cause: error });
  }
  delete require.cache[resolved];
  const palette = require(resolved);
  if (!palette || typeof palette !== 'object' || Array.isArray(palette)
    || PALETTE_EXPORTS.some((name) => !Object.hasOwn(palette, name))) {
    throw new Error('palette.js must export brand, fonts, syntax, status, ansi, variants, and variantOrder');
  }
  return palette;
}

function deriveCoverage(entries) {
  if (!Array.isArray(entries)) throw new TypeError('deriveCoverage requires evidence entries');
  return COVERAGE.map(({ id, label, prefix }) => ({
    id,
    label,
    count: entries.filter((entry) => entry && typeof entry.sourcePath === 'string'
      && entry.sourcePath.startsWith(prefix)).length,
  }));
}

function directPaletteSnapshot(palette) {
  const exports = {};
  for (const name of PALETTE_EXPORTS) exports[name] = palette[name];
  return json({ schemaVersion: 1, source: 'palette.js', exports });
}

function addOutput(outputs, file, value) {
  if (outputs.has(file)) throw new Error(`Open Design package output collision: ${file}`);
  const bytes = Buffer.isBuffer(value) ? Buffer.from(value) : Buffer.from(value, 'utf8');
  outputs.set(file, bytes);
}

function requireEvidence(entries, bySource, sourcePath) {
  const entry = entries.find((candidate) => candidate.sourcePath === sourcePath);
  if (!entry || !bySource.has(sourcePath)) {
    throw new Error(`Required repository evidence is missing: ${sourcePath}`);
  }
  return bySource.get(sourcePath);
}

function resolvePackageRoot(root, packageRoot) {
  return path.isAbsolute(packageRoot)
    ? path.resolve(packageRoot)
    : path.resolve(root, packageRoot);
}

function publicEvidenceInventory(entries) {
  return entries.map((entry) => Object.fromEntries(Object.entries(entry)));
}

function buildOpenDesignPackage({ root, packageRoot } = {}) {
  if (typeof root !== 'string' || root.length === 0) {
    throw new TypeError('buildOpenDesignPackage requires a repository root');
  }
  if (typeof packageRoot !== 'string' || packageRoot.length === 0) {
    throw new TypeError('buildOpenDesignPackage requires a packageRoot');
  }

  const repositoryRoot = path.resolve(root);
  const outputRoot = resolvePackageRoot(repositoryRoot, packageRoot);
  const {
    buildOpenDesignModel,
    listRepositoryEvidence,
    loadFontAssets,
    readEvidenceEntry,
    renderBizarreTokensCss,
    renderComponentsHtml,
    renderComponentsManifest,
    renderDesignMd,
    renderDesignTokensJson,
    renderEvidenceIndex,
    renderEvidenceMd,
    renderManifest,
    renderMetadata,
    renderPreviewPages,
    renderSystemKit,
    renderSnippetIndex,
    renderTailwindV4Css,
    renderTokenContractReport,
    renderTokensCss,
    renderUsageMd,
  } = loadImplementationModules();
  const head = gitHead(repositoryRoot);
  const status = gitStatus(repositoryRoot);
  const entries = listRepositoryEvidence({ root: repositoryRoot, packageRoot: outputRoot });
  const inventory = publicEvidenceInventory(entries);
  assertSnapshotsMatchEvidence(entries, BOOTSTRAP_SOURCE_SNAPSHOTS);
  const evidenceBytes = new Map();
  for (const entry of entries) {
    evidenceBytes.set(entry.sourcePath, readEvidenceEntry({ root: repositoryRoot, entry }));
  }

  const loadedSourceSnapshots = new Map(BOOTSTRAP_SOURCE_SNAPSHOTS);
  loadedSourceSnapshots.set(
    'palette.js',
    captureImplementationSource(repositoryRoot, 'palette.js'),
  );
  assertSnapshotsMatchEvidence(entries, loadedSourceSnapshots, ['palette.js']);
  const palette = loadPalette(repositoryRoot);
  const model = buildOpenDesignModel({
    palette,
    showcaseCss: requireEvidence(entries, evidenceBytes, 'showcase/showcase.css').toString('utf8'),
  });
  const readme = requireEvidence(entries, evidenceBytes, 'README.md');
  const coverage = deriveCoverage(entries);
  const outputs = new Map();

  const tokensCss = renderTokensCss(model);
  const bizarreTokensCss = renderBizarreTokensCss(model);
  const componentsHtml = renderComponentsHtml(model);
  const manifestText = renderManifest({ model });

  addOutput(outputs, 'manifest.json', manifestText);
  addOutput(outputs, 'metadata.json', renderMetadata());
  addOutput(outputs, 'DESIGN.md', renderDesignMd({ model, readme }));
  addOutput(outputs, 'USAGE.md', renderUsageMd());
  addOutput(outputs, 'tokens.css', tokensCss);
  addOutput(outputs, 'assets/bizarre-tokens.css', bizarreTokensCss);
  addOutput(outputs, 'design-tokens.json', renderDesignTokensJson(model));
  addOutput(outputs, 'tailwind-v4.css', renderTailwindV4Css(model));
  addOutput(outputs, 'components.html', componentsHtml);
  addOutput(outputs, 'components.manifest.json', json(renderComponentsManifest({
    html: componentsHtml,
    tokensCss,
  })));

  const previews = renderPreviewPages({ model, coverage, assets: PREVIEW_ASSETS });
  for (const [file, value] of previews) addOutput(outputs, file, value);
  addOutput(outputs, 'system/kit.html', renderSystemKit({
    model,
    coverage,
    assets: PREVIEW_ASSETS,
  }));

  for (const entry of entries) {
    addOutput(outputs, entry.packagePath, evidenceBytes.get(entry.sourcePath));
  }
  addOutput(outputs, 'source/scanned-files.json', renderEvidenceIndex(entries));
  addOutput(outputs, 'source/snippets/INDEX.json', renderSnippetIndex(entries));
  addOutput(outputs, 'source/evidence.md', renderEvidenceMd({ entries }));
  addOutput(outputs, 'source/tokens.source.json', directPaletteSnapshot(palette));
  addOutput(outputs, 'source/token-contract.report.json', renderTokenContractReport(model));

  for (const [file, bytes] of loadFontAssets({ root: repositoryRoot })) {
    addOutput(outputs, file, bytes);
  }

  const manifest = JSON.parse(manifestText);
  for (const { file } of manifest.fonts) {
    if (!outputs.has(file)) throw new Error(`Manifest font asset is missing from package output: ${file}`);
  }
  for (const [key, file] of Object.entries(PREVIEW_ASSETS)) {
    if (!outputs.has(file)) throw new Error(`Preview asset is missing from repository evidence: ${key} -> ${file}`);
  }
  if (outputs.has('package-files.json')) {
    throw new Error('package-files.json must be published only by the package writer');
  }

  // Close the read/render interval before handing a complete map to the writer.
  // Re-enumeration detects additions, removals, ownership/classification changes,
  // and content metadata drift, including paths that were deleted in only one
  // of the two snapshots. Persistently deleted tracked files remain absent from
  // both inventories and are therefore valid explicit exclusions.
  const finalEntries = listRepositoryEvidence({
    root: repositoryRoot,
    packageRoot: outputRoot,
  });
  if (!isDeepStrictEqual(publicEvidenceInventory(finalEntries), inventory)) {
    throw new Error('Repository evidence inventory changed while building package');
  }

  // Re-read the original identity-bearing entries after the second enumeration
  // so an ordinary mutation in that interval cannot publish mixed-time bytes.
  for (const entry of entries) {
    const current = readEvidenceEntry({ root: repositoryRoot, entry });
    if (!current.equals(evidenceBytes.get(entry.sourcePath))) {
      throw new Error(`Evidence file changed while building package: ${entry.sourcePath}`);
    }
  }
  // HEAD and porcelain status are ephemeral consistency guards only. They are
  // deliberately excluded from generated output because this package is
  // committed alongside its sources; embedding either would self-invalidate
  // the package as soon as those files are committed.
  const finalHead = gitHead(repositoryRoot);
  if (finalHead !== head) throw new Error('Git HEAD changed while building package');
  const finalStatus = gitStatus(repositoryRoot);
  if (!finalStatus.equals(status)) {
    throw new Error('Git working-tree status changed while building package');
  }
  assertLoadedModulesMatchEvidence(finalEntries, loadedSourceSnapshots, repositoryRoot);
  return outputs;
}

function generateOpenDesignPackage({ root, packageRoot, check = false } = {}) {
  if (typeof check !== 'boolean') throw new TypeError('check must be a boolean');
  if (typeof root !== 'string' || root.length === 0) {
    throw new TypeError('generateOpenDesignPackage requires a repository root');
  }
  if (typeof packageRoot !== 'string' || packageRoot.length === 0) {
    throw new TypeError('generateOpenDesignPackage requires a packageRoot');
  }
  const repositoryRoot = path.resolve(root);
  const outputRoot = resolvePackageRoot(repositoryRoot, packageRoot);
  const outputs = buildOpenDesignPackage({ root: repositoryRoot, packageRoot: outputRoot });
  const { createPackageWriter } = loadImplementationModules();
  const writer = createPackageWriter({ packageRoot: outputRoot, check });
  for (const [file, bytes] of outputs) writer.add(file, bytes);
  return writer.finish();
}

function parseArguments(argv, { forceCheck = false } = {}) {
  let check = forceCheck;
  let output;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--check') {
      check = true;
      continue;
    }
    if (argument === '--output') {
      const value = argv[index + 1];
      if (output !== undefined || index + 1 >= argv.length || value.startsWith('--')
        || value.length === 0 || value.includes('\0')) {
        throw new TypeError('--output requires exactly one non-empty path');
      }
      output = path.normalize(value);
      index += 1;
      continue;
    }
    throw new TypeError(`Unknown Open Design generator argument: ${argument}`);
  }
  return { check, output };
}

function runCli(argv = process.argv.slice(2), { forceCheck = false } = {}) {
  const root = path.resolve(__dirname, '..');
  const { check, output } = parseArguments(argv, { forceCheck });
  const displayRoot = output === undefined ? DEFAULT_PACKAGE_ROOT : output;
  const packageRoot = output === undefined
    ? path.join(root, ...DEFAULT_PACKAGE_ROOT.split('/'))
    : path.isAbsolute(output) ? output : path.resolve(process.cwd(), output);
  const dirty = generateOpenDesignPackage({ root, packageRoot, check });
  if (!check) {
    process.stdout.write(`generated Open Design package: ${displayRoot}\n`);
    return 0;
  }
  if (dirty.length === 0) {
    process.stdout.write('Open Design package is current\n');
    return 0;
  }
  process.stdout.write(`Open Design package is stale:\n${dirty.map((file) => `- ${file}`).join('\n')}\n`);
  return 1;
}

if (require.main === module) {
  try {
    process.exitCode = runCli();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  COVERAGE,
  DEFAULT_PACKAGE_ROOT,
  PREVIEW_ASSETS,
  buildOpenDesignPackage,
  deriveCoverage,
  generateOpenDesignPackage,
  runCli,
};
