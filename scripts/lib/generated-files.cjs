const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const MANIFEST_FILE = 'generated-files.json';
const MANIFEST_VERSION = 2;

function lstatIfPresent(file) {
  try {
    return fs.lstatSync(file);
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    throw error;
  }
}

function inspectOwnedPath(root, ownedPath) {
  const segments = ownedPath.split('/');
  let current = root;
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index]);
    const stat = lstatIfPresent(current);
    if (!stat) return { exists: false, fullPath: current, problem: null, stat: null };
    if (stat.isSymbolicLink()) {
      return {
        exists: true,
        fullPath: current,
        problem: `Generated output path contains a symbolic link: ${ownedPath}`,
        stat,
        symlinkAtLeaf: index === segments.length - 1,
      };
    }
    if (index < segments.length - 1 && !stat.isDirectory()) {
      return {
        exists: true,
        fullPath: current,
        problem: `Generated output parent is not a directory: ${ownedPath}`,
        stat,
        symlinkAtLeaf: false,
      };
    }
    if (index === segments.length - 1) {
      return { exists: true, fullPath: current, problem: null, stat, symlinkAtLeaf: false };
    }
  }
  return { exists: false, fullPath: path.join(root, ownedPath), problem: null, stat: null };
}

function writeTextNoFollow(file, content) {
  const flags = fs.constants.O_WRONLY
    | fs.constants.O_CREAT
    | fs.constants.O_TRUNC
    | (fs.constants.O_NOFOLLOW || 0);
  const descriptor = fs.openSync(file, flags, 0o666);
  try {
    fs.writeFileSync(descriptor, content, 'utf8');
  } finally {
    fs.closeSync(descriptor);
  }
}

function normalizeContent(content) {
  return `${String(content).replace(/\s+$/u, '')}\n`;
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function normalizeOwnedPath(file) {
  if (typeof file !== 'string' || file.length === 0 || path.isAbsolute(file)) {
    throw new TypeError(`Generated file path must be a non-empty relative path: ${String(file)}`);
  }

  const normalized = file.replaceAll('\\', '/');
  const segments = normalized.split('/');
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    throw new TypeError(`Generated file path must stay within the repository root: ${file}`);
  }
  if (normalized === MANIFEST_FILE) {
    throw new TypeError(`${MANIFEST_FILE} is managed by the generated-file writer`);
  }
  if (segments.some((segment) => segment.toLowerCase() === 'agents.md')) {
    throw new TypeError(`Generated output paths may not inspect or mutate agent instructions: ${file}`);
  }

  return normalized;
}

function readPreviousManifest(root) {
  const manifestPath = path.join(root, MANIFEST_FILE);
  const manifestStat = lstatIfPresent(manifestPath);
  if (!manifestStat || !manifestStat.isFile()) return { valid: false, files: [] };

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.version !== MANIFEST_VERSION || !Array.isArray(manifest.files)) {
      return { valid: false, files: [] };
    }

    const files = manifest.files.map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new TypeError('invalid manifest entry');
      if (Object.keys(entry).sort().join(',') !== 'file,sha256') throw new TypeError('invalid manifest entry fields');
      const file = normalizeOwnedPath(entry.file);
      if (file !== entry.file || !/^[0-9a-f]{64}$/u.test(entry.sha256)) throw new TypeError('invalid manifest entry value');
      return { file, sha256: entry.sha256 };
    });
    const sorted = [...files].sort((left, right) => (left.file < right.file ? -1 : left.file > right.file ? 1 : 0));
    if (new Set(files.map(({ file }) => file)).size !== files.length
      || JSON.stringify(files) !== JSON.stringify(sorted)) return { valid: false, files: [] };
    return { valid: true, files };
  } catch {
    return { valid: false, files: [] };
  }
}

function manifestContent(files) {
  return `${JSON.stringify({ version: MANIFEST_VERSION, files }, null, 2)}\n`;
}

function createGeneratedFiles({ root, check = false }) {
  if (typeof root !== 'string' || root.length === 0) {
    throw new TypeError('createGeneratedFiles requires a repository root');
  }

  const absoluteRoot = path.resolve(root);
  const previousManifest = readPreviousManifest(absoluteRoot);
  const expectedFiles = new Map();
  const dirty = new Set();
  let finished = false;

  function ensureOpen() {
    if (finished) throw new Error('Generated-file writer has already finished');
  }

  function out(file, content) {
    ensureOpen();
    const ownedPath = normalizeOwnedPath(file);
    const fullPath = path.join(absoluteRoot, ...ownedPath.split('/'));
    const normalized = normalizeContent(content);
    const expectedHash = sha256(normalized);
    const priorExpectedHash = expectedFiles.get(ownedPath);
    if (priorExpectedHash && priorExpectedHash !== expectedHash) {
      throw new Error(`Generated output was declared twice with different content: ${ownedPath}`);
    }
    expectedFiles.set(ownedPath, expectedHash);

    const inspected = inspectOwnedPath(absoluteRoot, ownedPath);

    if (check) {
      if (inspected.problem || (inspected.exists && !inspected.stat.isFile())) {
        dirty.add(ownedPath);
        return;
      }
      const current = inspected.exists ? fs.readFileSync(fullPath, 'utf8') : null;
      if (current !== normalized) dirty.add(ownedPath);
      return;
    }

    if (inspected.problem) throw new Error(inspected.problem);
    if (inspected.exists && !inspected.stat.isFile()) {
      throw new Error(`Generated output is not a regular file: ${ownedPath}`);
    }
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    const afterMkdir = inspectOwnedPath(absoluteRoot, ownedPath);
    if (afterMkdir.problem) throw new Error(afterMkdir.problem);
    writeTextNoFollow(fullPath, normalized);
  }

  function finish() {
    ensureOpen();
    finished = true;

    const files = [...expectedFiles]
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([file, contentHash]) => ({ file, sha256: contentHash }));
    const expectedManifest = manifestContent(files);
    const manifestPath = path.join(absoluteRoot, MANIFEST_FILE);
    const obsoleteFiles = previousManifest.files.filter(({ file }) => !expectedFiles.has(file));

    if (check) {
      for (const { file } of obsoleteFiles) {
        const inspected = inspectOwnedPath(absoluteRoot, file);
        if (inspected.exists || inspected.problem) dirty.add(file);
      }

      const manifestStat = lstatIfPresent(manifestPath);
      const currentManifest = manifestStat && manifestStat.isFile()
        ? fs.readFileSync(manifestPath, 'utf8')
        : null;
      if (currentManifest !== expectedManifest) dirty.add(MANIFEST_FILE);
      return [...dirty].sort();
    }

    for (const { file, sha256: previousHash } of obsoleteFiles) {
      const inspected = inspectOwnedPath(absoluteRoot, file);
      if (!inspected.problem && inspected.exists && inspected.stat.isFile()
        && sha256(fs.readFileSync(path.join(absoluteRoot, ...file.split('/')))) === previousHash) {
        fs.unlinkSync(path.join(absoluteRoot, ...file.split('/')));
      }
    }

    fs.mkdirSync(absoluteRoot, { recursive: true });
    const manifestInspection = inspectOwnedPath(absoluteRoot, MANIFEST_FILE);
    if (manifestInspection.problem) throw new Error(manifestInspection.problem);
    if (manifestInspection.exists && !manifestInspection.stat.isFile()) {
      throw new Error(`${MANIFEST_FILE} is not a regular file`);
    }
    writeTextNoFollow(manifestPath, expectedManifest);
    return [];
  }

  return { out, finish };
}

module.exports = { createGeneratedFiles };
