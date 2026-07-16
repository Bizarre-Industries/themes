'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const GENERATED_MANIFEST = 'generated-files.json';
const SHOWCASE_IMAGE_PREFIX = 'showcase/assets/generated/';
const BADGE_SOURCE = 'devtools/github-readme-assets/bizarre-badge.svg';
const CANONICAL_PACKAGE_PATH = 'design/open-design/bizarre-industries';
const SOURCE_IDENTITIES = Symbol('sourceIdentities');
const DEFAULT_EVIDENCE_LIMITS = Object.freeze({
  perFileBytes: 8 * 1024 * 1024,
  aggregateBytes: 64 * 1024 * 1024,
});

const ADAPTER_ROOTS = new Set([
  'apps',
  'design',
  'devtools',
  'docs-sites',
  'editors',
  'prompt',
  'shells',
  'terminals',
  'tools',
  'web',
  'wm',
]);

const IMAGE_EXTENSIONS = new Set([
  '.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp',
]);
const FONT_EXTENSIONS = new Set([
  '.eot', '.otf', '.ttc', '.ttf', '.woff', '.woff2',
]);
const DOCUMENTATION_EXTENSIONS = new Set([
  '.adoc', '.markdown', '.md', '.rst',
]);
const DOCUMENTATION_NAMES = new Set([
  'changelog',
  'code_of_conduct',
  'contributing',
  'copying',
  'licence',
  'license',
  'notice',
  'readme',
  'security',
]);

const MEDIA_KINDS = Object.freeze({
  '.adoc': 'text/asciidoc',
  '.avif': 'image/avif',
  '.bash': 'text/x-shellscript',
  '.cjs': 'text/javascript',
  '.conf': 'text/plain',
  '.css': 'text/css',
  '.eot': 'application/vnd.ms-fontobject',
  '.fish': 'text/x-shellscript',
  '.gif': 'image/gif',
  '.htm': 'text/html',
  '.html': 'text/html',
  '.ini': 'text/plain',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.jsx': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.kdl': 'text/x-kdl',
  '.lua': 'text/x-lua',
  '.markdown': 'text/markdown',
  '.md': 'text/markdown',
  '.mjs': 'text/javascript',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.ps1': 'text/x-powershell',
  '.py': 'text/x-python',
  '.rst': 'text/x-rst',
  '.scss': 'text/x-scss',
  '.sh': 'text/x-shellscript',
  '.svg': 'image/svg+xml',
  '.toml': 'application/toml',
  '.ts': 'text/typescript',
  '.tsx': 'text/typescript',
  '.ttc': 'font/collection',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.yaml': 'application/yaml',
  '.yml': 'application/yaml',
  '.zsh': 'text/x-shellscript',
});

function rawCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function normalizeEvidenceLimits(limits = DEFAULT_EVIDENCE_LIMITS) {
  if (!limits || typeof limits !== 'object' || Array.isArray(limits)) {
    throw new TypeError('Evidence limits must define perFileBytes and aggregateBytes');
  }
  const normalized = {};
  for (const name of ['perFileBytes', 'aggregateBytes']) {
    const value = limits[name];
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new TypeError(`Evidence limit ${name} must be a non-negative safe integer`);
    }
    normalized[name] = value;
  }
  return normalized;
}

function evidenceLimitExceeded(kind, sourcePath, observedBytes, limitBytes) {
  return new Error(
    `Evidence ${kind} byte limit exceeded: ${sourcePath} `
      + `(observed ${observedBytes} bytes, limit ${limitBytes} bytes)`,
  );
}

function enforceEvidenceLimit(kind, sourcePath, observedBytes, limitBytes) {
  const observed = typeof observedBytes === 'bigint' ? observedBytes : BigInt(observedBytes);
  const limit = BigInt(limitBytes);
  if (observed > limit) {
    throw evidenceLimitExceeded(kind, sourcePath, observed.toString(), limit.toString());
  }
}

function safeRelativePath(value, label) {
  if (typeof value !== 'string'
    || value.length === 0
    || value.includes('\0')
    || value.includes('\\')
    || path.posix.isAbsolute(value)
    || path.win32.isAbsolute(value)) {
    throw new TypeError(`${label} must be a safe relative path: ${String(value)}`);
  }

  const segments = value.split('/');
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    throw new TypeError(`${label} must be a safe relative path: ${value}`);
  }
  return value;
}

function resolveInside(base, relativePath, label) {
  const safePath = safeRelativePath(relativePath, label);
  const absoluteBase = path.resolve(base);
  const resolved = path.resolve(absoluteBase, ...safePath.split('/'));
  const relative = path.relative(absoluteBase, resolved);
  if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`)
    || path.isAbsolute(relative)) {
    throw new TypeError(`${label} must be a safe relative path: ${relativePath}`);
  }
  return resolved;
}

function lstatIfPresent(file) {
  try {
    return fs.lstatSync(file, { bigint: true });
  } catch (error) {
    if (error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')) return null;
    throw error;
  }
}

function inspectRepositoryPath(root, sourcePath) {
  const segments = safeRelativePath(sourcePath, 'Evidence source path').split('/');
  let current = path.resolve(root);
  const components = [];
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index]);
    const stat = lstatIfPresent(current);
    if (!stat) return { kind: 'missing', file: current, stat: null, components };
    components.push({ file: current, stat });
    if (stat.isSymbolicLink()) return { kind: 'symlink', file: current, stat, components };
    if (index < segments.length - 1 && !stat.isDirectory()) {
      return { kind: 'non-directory-parent', file: current, stat, components };
    }
    if (index === segments.length - 1) {
      return { kind: stat.isFile() ? 'file' : 'other', file: current, stat, components };
    }
  }
  throw new Error(`Could not inspect evidence source path: ${sourcePath}`);
}

function statKind(stat) {
  if (stat.isFile()) return 'file';
  if (stat.isDirectory()) return 'directory';
  if (stat.isSymbolicLink()) return 'symlink';
  return 'other';
}

function identitySnapshot(file, stat) {
  return Object.freeze({
    file,
    dev: stat.dev,
    ino: stat.ino,
    kind: statKind(stat),
  });
}

function snapshotPathIdentities(inspected) {
  return Object.freeze(inspected.components.map(({ file, stat }) => identitySnapshot(file, stat)));
}

function identityMatches(expected, file, stat) {
  return Boolean(stat)
    && expected.file === file
    && expected.dev === stat.dev
    && expected.ino === stat.ino
    && expected.kind === statKind(stat);
}

function pathIdentitiesMatch(expected, inspected) {
  return Array.isArray(expected)
    && expected.length === inspected.components.length
    && expected.every((identity, index) => {
      const component = inspected.components[index];
      return identityMatches(identity, component.file, component.stat);
    });
}

function sameFile(left, right) {
  return left.dev === right.dev && left.ino === right.ino;
}

function sameSnapshot(left, right) {
  return sameFile(left, right)
    && left.size === right.size
    && left.mtimeNs === right.mtimeNs
    && left.ctimeNs === right.ctimeNs;
}

function changedWhileReading(sourcePath) {
  return new Error(`Evidence file changed while reading: ${sourcePath}`);
}

function readStableRegularFile(root, sourcePath, inspected, limits) {
  const componentIdentities = snapshotPathIdentities(inspected);
  const flags = fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0);
  let descriptor;
  try {
    descriptor = fs.openSync(inspected.file, flags);
  } catch (error) {
    if (error && ['ELOOP', 'ENOENT', 'ENOTDIR'].includes(error.code)) {
      throw changedWhileReading(sourcePath);
    }
    throw error;
  }

  try {
    const before = fs.fstatSync(descriptor, { bigint: true });
    if (!before.isFile() || !sameFile(inspected.stat, before)) {
      throw changedWhileReading(sourcePath);
    }
    enforceEvidenceLimit('per-file', sourcePath, before.size, limits.perFileBytes);
    const bytes = fs.readFileSync(descriptor);
    const after = fs.fstatSync(descriptor, { bigint: true });
    enforceEvidenceLimit('per-file', sourcePath, after.size, limits.perFileBytes);
    enforceEvidenceLimit('per-file', sourcePath, bytes.length, limits.perFileBytes);
    const finalInspection = inspectRepositoryPath(root, sourcePath);
    if (!sameSnapshot(before, after)
      || BigInt(bytes.length) !== after.size
      || finalInspection.kind !== 'file'
      || !pathIdentitiesMatch(componentIdentities, finalInspection)
      || !sameFile(after, finalInspection.stat)) {
      throw changedWhileReading(sourcePath);
    }
    return bytes;
  } finally {
    fs.closeSync(descriptor);
  }
}

function splitGitPaths(stdout) {
  if (!Buffer.isBuffer(stdout)) throw new Error('git ls-files did not return a byte buffer');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const paths = [];
  let start = 0;
  for (let index = 0; index <= stdout.length; index += 1) {
    if (index !== stdout.length && stdout[index] !== 0) continue;
    if (index === start) {
      if (index !== stdout.length) {
        throw new Error('git ls-files returned an empty evidence path');
      }
    } else {
      paths.push(decoder.decode(stdout.subarray(start, index)));
    }
    start = index + 1;
  }
  return paths;
}

function packagePathRelativeToRoot(root, packageRoot) {
  if (typeof packageRoot !== 'string' || packageRoot.length === 0) {
    throw new TypeError('packageRoot must be a non-empty path');
  }
  const absoluteRoot = path.resolve(root);
  const absolutePackage = path.isAbsolute(packageRoot)
    ? path.resolve(packageRoot)
    : path.resolve(absoluteRoot, packageRoot);
  const relative = path.relative(absoluteRoot, absolutePackage);
  if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`)
    || path.isAbsolute(relative)) return null;
  const repositoryPath = relative.split(path.sep).join('/');
  return safeRelativePath(repositoryPath, 'Package output path');
}

function isPackageOutput(sourcePath, outputPath) {
  if (!outputPath) return false;
  if (sourcePath === outputPath || sourcePath.startsWith(`${outputPath}/`)) return true;

  const slash = outputPath.lastIndexOf('/');
  const parent = slash === -1 ? '' : outputPath.slice(0, slash);
  const basename = slash === -1 ? outputPath : outputPath.slice(slash + 1);
  const sourceInParent = parent === ''
    ? sourcePath
    : sourcePath.startsWith(`${parent}/`) ? sourcePath.slice(parent.length + 1) : null;
  if (sourceInParent === null) return false;
  const sibling = sourceInParent.split('/')[0];
  return sibling.startsWith(`${basename}.tmp-`)
    || sibling.startsWith(`${basename}.temp-`)
    || sibling.startsWith(`${basename}.stage-`)
    || sibling.startsWith(`.${basename}.tmp-`)
    || sibling.startsWith(`.${basename}.temp-`)
    || sibling.startsWith(`.${basename}.stage-`);
}

function isExcluded(sourcePath, outputPaths) {
  const segments = sourcePath.split('/');
  if (segments.some((segment) => segment.toLowerCase() === 'agents.md')) return true;
  if (sourcePath === 'docs/agent-handoff.md') return true;
  if (sourcePath.startsWith('.superpowers/brainstorm/')) return true;
  return outputPaths.some((outputPath) => isPackageOutput(sourcePath, outputPath));
}

function parseGeneratedOwners(bytes) {
  if (!bytes) return new Set();
  try {
    const manifest = JSON.parse(bytes.toString('utf8'));
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)
      || manifest.version !== 2 || !Array.isArray(manifest.files)) return new Set();

    const files = manifest.files.map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)
        || Object.keys(entry).sort().join(',') !== 'file,sha256'
        || typeof entry.sha256 !== 'string'
        || !/^[0-9a-f]{64}$/u.test(entry.sha256)) {
        throw new TypeError('Invalid generated-files.json entry');
      }
      return safeRelativePath(entry.file, 'Generated file path');
    });
    const sorted = [...files].sort(rawCompare);
    if (new Set(files).size !== files.length
      || JSON.stringify(files) !== JSON.stringify(sorted)) return new Set();
    return new Set(files);
  } catch {
    return new Set();
  }
}

function readEvidenceRecord(root, sourcePath, limits, inspected = inspectRepositoryPath(root, sourcePath)) {
  if (inspected.kind !== 'file') return null;
  return {
    sourcePath,
    inspected,
    content: readStableRegularFile(root, sourcePath, inspected, limits),
  };
}

function evidencePackagePath(sourcePath) {
  if (sourcePath === BADGE_SOURCE) return 'assets/brand/bizarre-badge.svg';
  if (sourcePath.startsWith(SHOWCASE_IMAGE_PREFIX)
    && sourcePath.endsWith('.png')
    && !sourcePath.slice(SHOWCASE_IMAGE_PREFIX.length).includes('/')) {
    return `assets/showcase/${sourcePath.slice(SHOWCASE_IMAGE_PREFIX.length)}`;
  }
  return `source/snippets/repo/${sourcePath}`;
}

function mediaKind(sourcePath) {
  const basename = path.posix.basename(sourcePath);
  const extension = path.posix.extname(basename).toLowerCase();
  if (MEDIA_KINDS[extension]) return MEDIA_KINDS[extension];
  if (!extension && DOCUMENTATION_NAMES.has(basename.toLowerCase())) return 'text/plain';
  return 'application/octet-stream';
}

function isTestPath(sourcePath) {
  const segments = sourcePath.split('/');
  const basename = segments.at(-1);
  return segments.some((segment) => segment === 'test' || segment === 'tests' || segment === '__tests__')
    || /(?:^|\.)test\.[^.]+$/u.test(basename)
    || /(?:^|\.)spec\.[^.]+$/u.test(basename);
}

function isDocumentation(sourcePath) {
  const basename = path.posix.basename(sourcePath);
  const extension = path.posix.extname(basename).toLowerCase();
  const stem = extension ? basename.slice(0, -extension.length) : basename;
  return DOCUMENTATION_EXTENSIONS.has(extension)
    || DOCUMENTATION_NAMES.has(stem.toLowerCase());
}

function classificationFor(sourcePath, generated) {
  if (generated) return 'generated';
  if (isTestPath(sourcePath)) return 'test';
  const extension = path.posix.extname(sourcePath).toLowerCase();
  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (FONT_EXTENSIONS.has(extension)) return 'font';
  if (isDocumentation(sourcePath)) return 'documentation';
  if (ADAPTER_ROOTS.has(sourcePath.split('/')[0])) return 'adapter';
  return 'canonical';
}

function evidenceEntryFromRecord(record, generatedOwners) {
  const { sourcePath, content, inspected } = record;
  const generated = generatedOwners.has(sourcePath);
  const entry = {
    sourcePath,
    packagePath: evidencePackagePath(sourcePath),
    kind: mediaKind(sourcePath),
    bytes: content.length,
    sha256: sha256(content),
    classification: classificationFor(sourcePath, generated),
    generated,
  };
  Object.defineProperty(entry, SOURCE_IDENTITIES, {
    value: snapshotPathIdentities(inspected),
    enumerable: false,
    configurable: false,
    writable: false,
  });
  return entry;
}

function listRepositoryEvidence({ root, packageRoot, limits = DEFAULT_EVIDENCE_LIMITS }) {
  if (typeof root !== 'string' || root.length === 0) {
    throw new TypeError('listRepositoryEvidence requires a repository root');
  }
  const evidenceLimits = normalizeEvidenceLimits(limits);
  const absoluteRoot = path.resolve(root);
  const result = spawnSync('git', [
    'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--',
  ], { cwd: absoluteRoot, encoding: 'buffer' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = Buffer.isBuffer(result.stderr) ? result.stderr.toString('utf8').trim() : '';
    throw new Error(`git ls-files failed${detail ? `: ${detail}` : ''}`);
  }

  const dynamicOutput = packagePathRelativeToRoot(absoluteRoot, packageRoot);
  const outputPaths = [...new Set([CANONICAL_PACKAGE_PATH, dynamicOutput].filter(Boolean))];
  const sourcePaths = splitGitPaths(result.stdout)
    .map((sourcePath) => safeRelativePath(sourcePath, 'Git evidence path'))
    .filter((sourcePath) => !isExcluded(sourcePath, outputPaths))
    .sort(rawCompare);
  if (new Set(sourcePaths).size !== sourcePaths.length) {
    throw new Error('git ls-files returned duplicate evidence paths');
  }

  const inspectedBySource = new Map();
  let preflightAggregate = 0n;
  for (const sourcePath of sourcePaths) {
    const inspected = inspectRepositoryPath(absoluteRoot, sourcePath);
    inspectedBySource.set(sourcePath, inspected);
    if (inspected.kind !== 'file') continue;
    preflightAggregate += inspected.stat.size;
    enforceEvidenceLimit(
      'aggregate',
      sourcePath,
      preflightAggregate,
      evidenceLimits.aggregateBytes,
    );
  }

  const manifestIsEvidence = sourcePaths.includes(GENERATED_MANIFEST);
  let manifestRecord = readEvidenceRecord(
    absoluteRoot,
    GENERATED_MANIFEST,
    evidenceLimits,
    manifestIsEvidence ? inspectedBySource.get(GENERATED_MANIFEST) : undefined,
  );
  const generatedOwners = parseGeneratedOwners(manifestRecord && manifestRecord.content);
  if (!manifestIsEvidence) manifestRecord = null;

  const entries = [];
  const packagePaths = new Set();
  let aggregateBytes = 0n;
  for (const sourcePath of sourcePaths) {
    const record = sourcePath === GENERATED_MANIFEST
      ? manifestRecord
      : readEvidenceRecord(
        absoluteRoot,
        sourcePath,
        evidenceLimits,
        inspectedBySource.get(sourcePath),
      );
    if (sourcePath === GENERATED_MANIFEST) manifestRecord = null;
    if (!record) continue;

    aggregateBytes += BigInt(record.content.length);
    enforceEvidenceLimit(
      'aggregate',
      sourcePath,
      aggregateBytes,
      evidenceLimits.aggregateBytes,
    );

    const entry = evidenceEntryFromRecord(record, generatedOwners);
    if (packagePaths.has(entry.packagePath)) {
      throw new Error(`Evidence package path collision: ${entry.packagePath}`);
    }
    packagePaths.add(entry.packagePath);
    entries.push(entry);
  }
  return entries;
}

function ensureStageDirectory(stageRoot, packagePath) {
  fs.mkdirSync(stageRoot, { recursive: true });
  const rootStat = lstatIfPresent(stageRoot);
  if (!rootStat || rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw new Error(`Evidence stage root must be a real directory: ${stageRoot}`);
  }

  const parentIdentities = [identitySnapshot(stageRoot, rootStat)];
  const segments = safeRelativePath(packagePath, 'Evidence package path').split('/');
  let current = stageRoot;
  for (const segment of segments.slice(0, -1)) {
    current = path.join(current, segment);
    const stat = lstatIfPresent(current);
    if (stat) {
      if (stat.isSymbolicLink() || !stat.isDirectory()) {
        throw new Error(`Evidence destination parent is not a real directory: ${current}`);
      }
    } else {
      fs.mkdirSync(current);
      const created = lstatIfPresent(current);
      if (!created || created.isSymbolicLink() || !created.isDirectory()) {
        throw new Error(`Could not create evidence destination directory: ${current}`);
      }
      parentIdentities.push(identitySnapshot(current, created));
      continue;
    }
    parentIdentities.push(identitySnapshot(current, stat));
  }
  verifyDestinationParents(parentIdentities);
  return {
    destination: resolveInside(stageRoot, packagePath, 'Evidence package path'),
    parentIdentities,
  };
}

function destinationParentChanged(file) {
  return new Error(`Evidence destination parent changed during copy: ${file}`);
}

function destinationLeafChanged(file) {
  return new Error(`Evidence destination leaf changed during copy: ${file}`);
}

function verifyDestinationParents(parentIdentities) {
  for (const identity of parentIdentities) {
    const stat = lstatIfPresent(identity.file);
    if (!stat || stat.isSymbolicLink() || !stat.isDirectory()
      || !identityMatches(identity, identity.file, stat)) {
      throw destinationParentChanged(identity.file);
    }
  }
}

function writeFileNoFollow(file, bytes, parentIdentities) {
  verifyDestinationParents(parentIdentities);
  const existing = lstatIfPresent(file);
  if (existing && (existing.isSymbolicLink() || !existing.isFile())) {
    throw new Error(`Evidence destination must be a regular file: ${file}`);
  }
  const existingIdentity = existing ? identitySnapshot(file, existing) : null;
  verifyDestinationParents(parentIdentities);
  const flags = fs.constants.O_WRONLY
    | fs.constants.O_CREAT
    | fs.constants.O_TRUNC
    | (fs.constants.O_NOFOLLOW || 0);
  let descriptor;
  try {
    descriptor = fs.openSync(file, flags, 0o666);
  } catch (error) {
    verifyDestinationParents(parentIdentities);
    if (error && ['ELOOP', 'ENOENT', 'ENOTDIR'].includes(error.code)) {
      throw destinationLeafChanged(file);
    }
    throw error;
  }
  try {
    const opened = fs.fstatSync(descriptor, { bigint: true });
    if (!opened.isFile()
      || (existingIdentity && !identityMatches(existingIdentity, file, opened))) {
      throw destinationLeafChanged(file);
    }
    verifyDestinationParents(parentIdentities);
    const pathAfterOpen = lstatIfPresent(file);
    if (!pathAfterOpen || pathAfterOpen.isSymbolicLink() || !pathAfterOpen.isFile()
      || !sameFile(opened, pathAfterOpen)) {
      throw destinationLeafChanged(file);
    }

    fs.writeFileSync(descriptor, bytes);
    const afterWrite = fs.fstatSync(descriptor, { bigint: true });
    verifyDestinationParents(parentIdentities);
    const pathAfterWrite = lstatIfPresent(file);
    if (!afterWrite.isFile() || !sameFile(opened, afterWrite)
      || BigInt(bytes.length) !== afterWrite.size
      || !pathAfterWrite || pathAfterWrite.isSymbolicLink() || !pathAfterWrite.isFile()
      || !sameFile(afterWrite, pathAfterWrite)) {
      throw destinationLeafChanged(file);
    }
  } finally {
    fs.closeSync(descriptor);
  }
}

function readEvidenceEntryForOperation({ root, entry, operation, limits = DEFAULT_EVIDENCE_LIMITS }) {
  const api = operation === 'copy' ? 'copyEvidenceEntry' : 'readEvidenceEntry';
  if (typeof root !== 'string' || root.length === 0) {
    throw new TypeError(`${api} requires a repository root`);
  }
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new TypeError(`${api} requires an evidence entry`);
  }
  const evidenceLimits = normalizeEvidenceLimits(limits);
  const sourcePath = safeRelativePath(entry.sourcePath, 'Evidence source path');
  if (!Number.isSafeInteger(entry.bytes) || entry.bytes < 0
    || typeof entry.sha256 !== 'string' || !/^[0-9a-f]{64}$/u.test(entry.sha256)) {
    throw new TypeError(`Invalid evidence metadata for: ${sourcePath}`);
  }

  const absoluteRoot = path.resolve(root);
  resolveInside(absoluteRoot, sourcePath, 'Evidence source path');
  const inspected = inspectRepositoryPath(absoluteRoot, sourcePath);
  if (inspected.kind === 'symlink') {
    throw new Error(`Evidence source is now a symbolic link: ${sourcePath}`);
  }
  if (inspected.kind !== 'file') {
    throw new Error(`Evidence file changed between enumeration and ${operation}: ${sourcePath}`);
  }
  if (!pathIdentitiesMatch(entry[SOURCE_IDENTITIES], inspected)) {
    throw new Error(`Evidence file changed between enumeration and ${operation}: ${sourcePath}`);
  }
  const content = readStableRegularFile(absoluteRoot, sourcePath, inspected, evidenceLimits);
  if (content.length !== entry.bytes || sha256(content) !== entry.sha256) {
    throw new Error(`Evidence file changed between enumeration and ${operation}: ${sourcePath}`);
  }
  return content;
}

function readEvidenceEntry({ root, entry, limits = DEFAULT_EVIDENCE_LIMITS }) {
  return readEvidenceEntryForOperation({ root, entry, operation: 'read', limits });
}

function copyEvidenceEntry({ root, stageRoot, entry, limits = DEFAULT_EVIDENCE_LIMITS }) {
  if (typeof stageRoot !== 'string' || stageRoot.length === 0) {
    throw new TypeError('copyEvidenceEntry requires a stage root');
  }
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new TypeError('copyEvidenceEntry requires an evidence entry');
  }
  const packagePath = safeRelativePath(entry.packagePath, 'Evidence package path');
  const content = readEvidenceEntryForOperation({ root, entry, operation: 'copy', limits });

  const absoluteStageRoot = path.resolve(stageRoot);
  const { destination, parentIdentities } = ensureStageDirectory(absoluteStageRoot, packagePath);
  writeFileNoFollow(destination, content, parentIdentities);
}

function renderEvidenceIndex(entries) {
  if (!Array.isArray(entries)) throw new TypeError('renderEvidenceIndex requires an entry array');
  const sorted = [...entries].sort((left, right) => rawCompare(left.sourcePath, right.sourcePath));
  return `${JSON.stringify({ schemaVersion: 1, files: sorted }, null, 2)}\n`;
}

function renderSnippetIndex(entries) {
  if (!Array.isArray(entries)) throw new TypeError('renderSnippetIndex requires an entry array');
  const snippets = entries
    .filter((entry) => typeof entry.packagePath === 'string'
      && entry.packagePath.startsWith('source/snippets/'))
    .sort((left, right) => rawCompare(left.sourcePath, right.sourcePath))
    .map((entry) => ({ ...entry, path: entry.packagePath }));
  return `${JSON.stringify({ schemaVersion: 1, snippets }, null, 2)}\n`;
}

module.exports = {
  copyEvidenceEntry,
  DEFAULT_EVIDENCE_LIMITS,
  listRepositoryEvidence,
  readEvidenceEntry,
  renderEvidenceIndex,
  renderSnippetIndex,
};
