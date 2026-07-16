'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const MANIFEST_FILE = 'package-files.json';
const MANIFEST_VERSION = 1;

function comparePaths(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function lstatIfPresent(file) {
  try {
    return fs.lstatSync(file);
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    throw error;
  }
}

function sameIdentity(left, right) {
  return Boolean(left && right)
    && left.dev === right.dev
    && left.ino === right.ino
    && left.mode === right.mode;
}

function sameReadState(left, right) {
  return sameIdentity(left, right)
    && left.size === right.size
    && left.mtimeMs === right.mtimeMs
    && left.ctimeMs === right.ctimeMs;
}

function fullPath(root, relativePath) {
  return relativePath === ''
    ? root
    : path.join(root, ...relativePath.split('/'));
}

function parentPaths(relativePath) {
  const segments = relativePath.split('/');
  const parents = [''];
  for (let index = 1; index < segments.length; index += 1) {
    parents.push(segments.slice(0, index).join('/'));
  }
  return parents;
}

function pathPrefixes(relativePath) {
  const segments = relativePath.split('/');
  return segments.map((_, index) => segments.slice(0, index + 1).join('/'));
}

function structuralDirectories(paths) {
  const directories = new Set();
  for (const file of paths) {
    for (const parent of parentPaths(file)) {
      if (parent !== '') directories.add(parent);
    }
  }
  return directories;
}

function caseFoldedAdditions(file, knownPrefixes) {
  const additions = [];
  for (const prefix of pathPrefixes(file)) {
    const folded = prefix.toLowerCase();
    const known = knownPrefixes.get(folded);
    if (known && known !== prefix) {
      throw new TypeError(`Package output has a case-folded path collision: ${known} and ${prefix}`);
    }
    additions.push([folded, prefix]);
  }
  return additions;
}

function validateCaseFoldedPaths(paths) {
  const knownPrefixes = new Map();
  for (const file of paths) {
    for (const [folded, prefix] of caseFoldedAdditions(file, knownPrefixes)) {
      knownPrefixes.set(folded, prefix);
    }
  }
}

function normalizePackagePath(file) {
  if (typeof file !== 'string'
    || file.length === 0
    || file.includes('\0')
    || file.includes('\\')
    || path.posix.isAbsolute(file)
    || path.win32.isAbsolute(file)) {
    throw new TypeError(`Package output must use a non-empty package-relative path: ${String(file)}`);
  }

  const segments = file.split('/');
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    throw new TypeError(`Package output must use a canonical package-relative path: ${file}`);
  }
  if (file.toLowerCase() === MANIFEST_FILE) {
    throw new TypeError(`${MANIFEST_FILE} is managed by the package writer`);
  }
  if (segments.some((segment) => segment.toLowerCase() === 'agents.md')) {
    throw new TypeError(`Package output paths may not inspect or mutate agent instructions: ${file}`);
  }
  return file;
}

function scanPackageTree(root, { rejectProblems }) {
  const rootStat = lstatIfPresent(root);
  if (!rootStat) {
    return {
      rootExists: false,
      directories: new Map(),
      files: new Map(),
      problems: new Map(),
    };
  }
  if (rootStat.isSymbolicLink()) {
    throw new Error(`Package root is a symbolic link: ${root}`);
  }
  if (!rootStat.isDirectory()) {
    throw new Error(`Package root is not a directory: ${root}`);
  }

  const directories = new Map([['', rootStat]]);
  const files = new Map();
  const problems = new Map();

  function recordProblem(relativePath, message) {
    if (rejectProblems) throw new Error(message);
    problems.set(relativePath, message);
  }

  function visit(relativeDirectory) {
    const directory = fullPath(root, relativeDirectory);
    const expectedDirectoryStat = directories.get(relativeDirectory);
    const before = lstatIfPresent(directory);
    if (!before || !before.isDirectory() || !sameReadState(before, expectedDirectoryStat)) {
      throw new Error(`Package path identity changed during validation: ${relativeDirectory || '.'}`);
    }

    const names = fs.readdirSync(directory).sort(comparePaths);
    for (const name of names) {
      const relativePath = relativeDirectory ? `${relativeDirectory}/${name}` : name;
      if (name.toLowerCase() === 'agents.md') {
        throw new Error(`Package paths may not inspect or mutate agent instructions: ${relativePath}`);
      }
      const stat = lstatIfPresent(fullPath(root, relativePath));
      if (!stat) {
        throw new Error(`Package path identity changed during validation: ${relativePath}`);
      }
      if (stat.isSymbolicLink()) {
        recordProblem(relativePath, `Package path contains a symbolic link: ${relativePath}`);
      } else if (stat.isDirectory()) {
        directories.set(relativePath, stat);
        visit(relativePath);
      } else if (stat.isFile()) {
        files.set(relativePath, stat);
      } else {
        recordProblem(relativePath, `Package path is not a regular file or directory: ${relativePath}`);
      }
    }

    const after = lstatIfPresent(directory);
    if (!after || !after.isDirectory() || !sameReadState(after, expectedDirectoryStat)) {
      throw new Error(`Package path identity changed during validation: ${relativeDirectory || '.'}`);
    }
  }

  visit('');
  return { rootExists: true, directories, files, problems };
}

function assertParentIdentities(root, relativePath, directories) {
  for (const parent of parentPaths(relativePath)) {
    const expected = directories.get(parent);
    const actual = lstatIfPresent(fullPath(root, parent));
    if (!expected || !actual || !actual.isDirectory() || !sameIdentity(actual, expected)) {
      throw new Error(`Package parent path identity changed: ${parent || '.'}`);
    }
  }
}

function readRegularFile(root, relativePath, expectedStat, directories) {
  assertParentIdentities(root, relativePath, directories);
  const file = fullPath(root, relativePath);
  const beforePath = lstatIfPresent(file);
  if (!beforePath || !beforePath.isFile() || !sameIdentity(beforePath, expectedStat)) {
    throw new Error(`Package path identity changed during validation: ${relativePath}`);
  }

  const flags = fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0);
  let descriptor;
  try {
    descriptor = fs.openSync(file, flags);
  } catch (error) {
    if (error && (error.code === 'ELOOP' || error.code === 'EMLINK')) {
      throw new Error(`Package path contains a symbolic link: ${relativePath}`, { cause: error });
    }
    throw error;
  }

  let bytes;
  let beforeDescriptor;
  let afterDescriptor;
  try {
    beforeDescriptor = fs.fstatSync(descriptor);
    if (!beforeDescriptor.isFile() || !sameIdentity(beforeDescriptor, expectedStat)) {
      throw new Error(`Package path identity changed during validation: ${relativePath}`);
    }
    bytes = fs.readFileSync(descriptor);
    afterDescriptor = fs.fstatSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }

  assertParentIdentities(root, relativePath, directories);
  const afterPath = lstatIfPresent(file);
  if (!sameReadState(beforeDescriptor, afterDescriptor)
    || !afterPath
    || !afterPath.isFile()
    || !sameReadState(afterPath, afterDescriptor)) {
    throw new Error(`Package path identity changed during validation: ${relativePath}`);
  }
  return bytes;
}

function parseManifest(bytes) {
  try {
    const manifest = JSON.parse(bytes.toString('utf8'));
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
      throw new TypeError('manifest must be an object');
    }
    if (Object.keys(manifest).sort(comparePaths).join(',') !== 'files,version'
      || manifest.version !== MANIFEST_VERSION
      || !Array.isArray(manifest.files)) {
      throw new TypeError(`manifest must contain version ${MANIFEST_VERSION} and a files array`);
    }

    const foldedPrefixes = new Map();
    const files = manifest.files.map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)
        || Object.keys(entry).sort(comparePaths).join(',') !== 'file,sha256') {
        throw new TypeError('manifest entries must contain only file and sha256');
      }
      const file = normalizePackagePath(entry.file);
      if (file !== entry.file || typeof entry.sha256 !== 'string'
        || !/^[0-9a-f]{64}$/u.test(entry.sha256)) {
        throw new TypeError('manifest entries must contain canonical paths and SHA-256 hashes');
      }
      for (const [folded, prefix] of caseFoldedAdditions(file, foldedPrefixes)) {
        foldedPrefixes.set(folded, prefix);
      }
      return { file, sha256: entry.sha256 };
    });

    const sorted = [...files].sort((left, right) => comparePaths(left.file, right.file));
    if (JSON.stringify(files) !== JSON.stringify(sorted)
      || new Set(files.map(({ file }) => file)).size !== files.length) {
      throw new TypeError('manifest paths must be unique and sorted');
    }
    const owned = new Set(files.map(({ file }) => file));
    for (const { file } of files) {
      if (parentPaths(file).some((parent) => parent !== '' && owned.has(parent))) {
        throw new TypeError('manifest file paths may not contain another owned file');
      }
    }
    const canonical = Buffer.from(`${JSON.stringify({ version: MANIFEST_VERSION, files }, null, 2)}\n`);
    if (!bytes.equals(canonical)) {
      throw new TypeError('manifest must use the canonical pretty-printed encoding');
    }
    return files;
  } catch (error) {
    throw new Error(`Invalid package ownership manifest: ${error.message}`, { cause: error });
  }
}

function manifestBytes(expectedEntries) {
  const files = expectedEntries.map(([file, bytes]) => ({ file, sha256: sha256(bytes) }));
  return Buffer.from(`${JSON.stringify({ version: MANIFEST_VERSION, files }, null, 2)}\n`);
}

function readPreviousManifest(root, scan) {
  if (scan.directories.has(MANIFEST_FILE) || scan.problems.has(MANIFEST_FILE)) {
    throw new Error('Invalid package ownership manifest: package-files.json is not a regular file');
  }
  const stat = scan.files.get(MANIFEST_FILE);
  if (!stat) {
    const unownedFile = [...scan.files.keys()].sort(comparePaths)[0];
    if (unownedFile) throw new Error(`Unowned file in existing package: ${unownedFile}`);
    if (scan.rootExists && scan.directories.size > 1) {
      throw new Error('Non-empty package directory without a valid manifest contains unowned state');
    }
    return { files: [], raw: null };
  }

  const raw = readRegularFile(root, MANIFEST_FILE, stat, scan.directories);
  return { files: parseManifest(raw), raw };
}

function pathProblem(scan, relativePath) {
  for (const parent of parentPaths(relativePath)) {
    if (parent !== '' && scan.problems.has(parent)) return scan.problems.get(parent);
    if (parent !== '' && scan.files.has(parent)) {
      return `Package output parent is not a directory: ${relativePath}`;
    }
  }
  if (scan.problems.has(relativePath)) return scan.problems.get(relativePath);
  if (scan.directories.has(relativePath)) return `Package output is not a regular file: ${relativePath}`;
  return null;
}

function validateExpectedLayout(expectedEntries, scan) {
  const expected = new Set(expectedEntries.map(([file]) => file));
  for (const [file] of expectedEntries) {
    const ownedParent = parentPaths(file).find((parent) => parent !== '' && expected.has(parent));
    const problem = ownedParent
      ? `Package output path contains another expected file: ${file}`
      : pathProblem(scan, file);
    if (problem) throw new Error(problem);
  }
}

function validateOwnedFiles(root, scan, previous, { check, dirty, contents }) {
  for (const { file, sha256: expectedHash } of previous.files) {
    const stat = scan.files.get(file);
    if (!stat) {
      if (scan.directories.has(file) || scan.problems.has(file)) {
        throw new Error(`Owned package path is not a regular file: ${file}`);
      }
      if (check) dirty.add(file);
      else throw new Error(`Owned file is missing from package ownership state: ${file}`);
      continue;
    }
    const bytes = readRegularFile(root, file, stat, scan.directories);
    contents.set(file, bytes);
    if (sha256(bytes) !== expectedHash) {
      if (check) dirty.add(file);
      else throw new Error(`Modified owned file would be overwritten or disowned: ${file}`);
    }
  }
}

function validateUnownedFiles(scan, previous) {
  const owned = new Set(previous.files.map(({ file }) => file));
  for (const file of [...scan.files.keys()].sort(comparePaths)) {
    if (file === MANIFEST_FILE || owned.has(file)) continue;
    throw new Error(`Unowned file in existing package: ${file}`);
  }
}

function validateStructuralDirectories(scan, previous, expectedEntries) {
  const allowed = structuralDirectories([
    ...previous.files.map(({ file }) => file),
    ...expectedEntries.map(([file]) => file),
  ]);
  for (const directory of [...scan.directories.keys()].sort(comparePaths)) {
    if (directory !== '' && !allowed.has(directory)) {
      throw new Error(`Unowned directory in existing package: ${directory}`);
    }
  }
}

function atomicWrite(file, bytes, beforeRename) {
  const temp = path.join(
    path.dirname(file),
    `.${path.basename(file)}.tmp-${process.pid}-${crypto.randomUUID()}`,
  );
  const flags = fs.constants.O_WRONLY
    | fs.constants.O_CREAT
    | fs.constants.O_EXCL
    | (fs.constants.O_NOFOLLOW || 0);
  let descriptor;
  let created = false;
  let renamed = false;
  let primaryError;
  try {
    descriptor = fs.openSync(temp, flags, 0o666);
    created = true;
    fs.writeFileSync(descriptor, bytes);
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    beforeRename();
    fs.renameSync(temp, file);
    renamed = true;
  } catch (error) {
    primaryError = error;
  }

  let cleanupError;
  if (descriptor !== undefined) {
    try {
      fs.closeSync(descriptor);
    } catch (error) {
      cleanupError = error;
    }
  }
  if (created && !renamed) {
    try {
      fs.unlinkSync(temp);
    } catch (error) {
      if (error && error.code !== 'ENOENT' && !cleanupError) cleanupError = error;
    }
  }
  if (primaryError) {
    if (cleanupError) {
      try {
        Object.defineProperty(primaryError, 'cleanupError', { value: cleanupError });
      } catch {
        // Preserve the operation failure even if its error object is immutable.
      }
    }
    throw primaryError;
  }
  if (cleanupError) throw cleanupError;
}

function requiredDirectories(expectedEntries) {
  const directories = new Set();
  for (const [file] of expectedEntries) {
    for (const parent of parentPaths(file)) {
      if (parent !== '') directories.add(parent);
    }
  }
  return [...directories].sort((left, right) => {
    const depthDifference = left.split('/').length - right.split('/').length;
    return depthDifference || comparePaths(left, right);
  });
}

function ensureDirectories(root, expectedEntries, state) {
  if (!state.rootExists) {
    if (lstatIfPresent(root)) {
      throw new Error('Package root identity changed after preflight');
    }
    fs.mkdirSync(root, { recursive: true });
    const stat = lstatIfPresent(root);
    if (!stat || stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error('Package root identity changed while it was created');
    }
    state.rootExists = true;
    state.directories.set('', stat);
  } else {
    assertParentIdentities(root, MANIFEST_FILE, state.directories);
  }

  for (const relativeDirectory of requiredDirectories(expectedEntries)) {
    if (state.directories.has(relativeDirectory)) {
      const expected = state.directories.get(relativeDirectory);
      const actual = lstatIfPresent(fullPath(root, relativeDirectory));
      if (!actual || !actual.isDirectory() || !sameIdentity(actual, expected)) {
        throw new Error(`Package parent path identity changed: ${relativeDirectory}`);
      }
      continue;
    }

    assertParentIdentities(root, relativeDirectory, state.directories);
    const directory = fullPath(root, relativeDirectory);
    if (lstatIfPresent(directory)) {
      throw new Error(`Package parent path identity changed: ${relativeDirectory}`);
    }
    fs.mkdirSync(directory);
    const stat = lstatIfPresent(directory);
    if (!stat || stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error(`Package parent path identity changed: ${relativeDirectory}`);
    }
    state.directories.set(relativeDirectory, stat);
  }
}

function assertKnownTree(root, state) {
  const current = scanPackageTree(root, { rejectProblems: true });
  if (!current.rootExists) throw new Error('Package root identity changed during generation');

  for (const [directory, expectedStat] of state.directories) {
    const actual = current.directories.get(directory);
    if (!actual || !sameIdentity(actual, expectedStat)) {
      throw new Error(`Package path identity changed during generation: ${directory || '.'}`);
    }
  }
  for (const directory of current.directories.keys()) {
    if (!state.directories.has(directory)) {
      throw new Error(`Unexpected directory appeared during generation: ${directory}`);
    }
  }
  for (const [file, expectedStat] of state.files) {
    const actual = current.files.get(file);
    if (!actual || !sameIdentity(actual, expectedStat)) {
      throw new Error(`Package path identity changed during generation: ${file}`);
    }
  }
  for (const file of current.files.keys()) {
    if (!state.files.has(file)) {
      throw new Error(`Unowned file appeared during generation: ${file}`);
    }
  }
}

function publishFile(root, relativePath, bytes, state, { validatePrior } = {}) {
  assertParentIdentities(root, relativePath, state.directories);
  const priorStat = state.files.get(relativePath) || null;
  const currentStat = lstatIfPresent(fullPath(root, relativePath));
  if ((priorStat && !sameIdentity(currentStat, priorStat)) || (!priorStat && currentStat)) {
    throw new Error(`Package path identity changed before publication: ${relativePath}`);
  }

  const file = fullPath(root, relativePath);
  atomicWrite(file, bytes, () => {
    assertParentIdentities(root, relativePath, state.directories);
    const beforeRename = lstatIfPresent(file);
    if ((priorStat && !sameIdentity(beforeRename, priorStat)) || (!priorStat && beforeRename)) {
      throw new Error(`Package path identity changed before publication: ${relativePath}`);
    }
    if (validatePrior) validatePrior(priorStat);
  });

  const publishedStat = lstatIfPresent(file);
  if (!publishedStat || !publishedStat.isFile() || publishedStat.isSymbolicLink()) {
    throw new Error(`Expected package file failed post-write validation: ${relativePath}`);
  }
  state.files.set(relativePath, publishedStat);
  assertParentIdentities(root, relativePath, state.directories);
  const publishedBytes = readRegularFile(root, relativePath, publishedStat, state.directories);
  if (!publishedBytes.equals(bytes)) {
    throw new Error(`Expected package file failed post-write validation: ${relativePath}`);
  }
}

function validateExpectedContents(root, expectedEntries, state) {
  for (const [file, expectedBytes] of expectedEntries) {
    const stat = state.files.get(file);
    if (!stat) throw new Error(`Expected package file is missing after publication: ${file}`);
    const actualBytes = readRegularFile(root, file, stat, state.directories);
    if (!actualBytes.equals(expectedBytes)) {
      throw new Error(`Expected package file failed post-write validation: ${file}`);
    }
  }
}

function pruneObsoleteDirectories(root, state, previous, expectedEntries) {
  const previousDirectories = structuralDirectories(previous.files.map(({ file }) => file));
  const expectedDirectories = structuralDirectories(expectedEntries.map(([file]) => file));
  const candidates = [...previousDirectories]
    .filter((directory) => !expectedDirectories.has(directory))
    .sort((left, right) => {
      const depthDifference = right.split('/').length - left.split('/').length;
      return depthDifference || comparePaths(right, left);
    });

  for (const directory of candidates) {
    const expectedStat = state.directories.get(directory);
    if (!expectedStat) continue;
    assertParentIdentities(root, directory, state.directories);
    const target = fullPath(root, directory);
    const before = lstatIfPresent(target);
    if (!before || !before.isDirectory() || !sameIdentity(before, expectedStat)) {
      throw new Error(`Package path identity changed before directory removal: ${directory}`);
    }
    if (fs.readdirSync(target).length !== 0) continue;
    const after = lstatIfPresent(target);
    if (!after || !after.isDirectory() || !sameReadState(before, after)) {
      throw new Error(`Package path identity changed before directory removal: ${directory}`);
    }
    fs.rmdirSync(target);
    if (lstatIfPresent(target)) {
      throw new Error(`Obsolete structural directory remained after removal: ${directory}`);
    }
    state.directories.delete(directory);
    assertParentIdentities(root, directory, state.directories);
  }
}

function publishGeneration(root, expectedEntries, expectedManifest, scan, previous) {
  const state = {
    rootExists: scan.rootExists,
    directories: new Map(scan.directories),
    files: new Map(scan.files),
  };
  const previousByPath = new Map(previous.files.map((entry) => [entry.file, entry]));
  const expectedPaths = new Set(expectedEntries.map(([file]) => file));

  ensureDirectories(root, expectedEntries, state);
  assertKnownTree(root, state);

  for (const [file, bytes] of expectedEntries) {
    const priorStat = state.files.get(file);
    const priorOwnership = previousByPath.get(file);
    if (priorStat && priorOwnership) {
      const currentBytes = readRegularFile(root, file, priorStat, state.directories);
      if (sha256(currentBytes) !== priorOwnership.sha256) {
        throw new Error(`Modified owned file would be overwritten or disowned: ${file}`);
      }
    }
    publishFile(root, file, bytes, state, {
      validatePrior: priorOwnership
        ? (stat) => {
          const currentBytes = readRegularFile(root, file, stat, state.directories);
          if (sha256(currentBytes) !== priorOwnership.sha256) {
            throw new Error(`Modified owned file would be overwritten or disowned: ${file}`);
          }
        }
        : undefined,
    });
  }

  assertKnownTree(root, state);
  validateExpectedContents(root, expectedEntries, state);

  for (const { file, sha256: priorHash } of previous.files) {
    if (expectedPaths.has(file)) continue;
    const stat = state.files.get(file);
    if (!stat) continue;
    const currentBytes = readRegularFile(root, file, stat, state.directories);
    if (sha256(currentBytes) !== priorHash) {
      throw new Error(`Modified owned file would be overwritten or disowned: ${file}`);
    }
    fs.unlinkSync(fullPath(root, file));
    if (lstatIfPresent(fullPath(root, file))) {
      throw new Error(`Obsolete owned file remained after removal: ${file}`);
    }
    assertParentIdentities(root, file, state.directories);
    state.files.delete(file);
  }

  pruneObsoleteDirectories(root, state, previous, expectedEntries);
  assertKnownTree(root, state);
  validateExpectedContents(root, expectedEntries, state);

  const priorManifestStat = state.files.get(MANIFEST_FILE);
  if (priorManifestStat) {
    const currentManifest = readRegularFile(
      root,
      MANIFEST_FILE,
      priorManifestStat,
      state.directories,
    );
    if (!previous.raw || !currentManifest.equals(previous.raw)) {
      throw new Error('Package ownership manifest changed during generation');
    }
  }
  validateExpectedContents(root, expectedEntries, state);
  publishFile(root, MANIFEST_FILE, expectedManifest, state, {
    validatePrior: priorManifestStat
      ? (stat) => {
        const currentManifest = readRegularFile(root, MANIFEST_FILE, stat, state.directories);
        if (!previous.raw || !currentManifest.equals(previous.raw)) {
          throw new Error('Package ownership manifest changed during generation');
        }
      }
      : undefined,
  });
  validateExpectedContents(root, expectedEntries, state);
  assertKnownTree(root, state);
  validateExpectedContents(root, expectedEntries, state);
  const finalManifestStat = state.files.get(MANIFEST_FILE);
  if (!finalManifestStat) {
    throw new Error('Published package ownership manifest is missing during final validation');
  }
  const finalManifest = readRegularFile(
    root,
    MANIFEST_FILE,
    finalManifestStat,
    state.directories,
  );
  if (!finalManifest.equals(expectedManifest)) {
    throw new Error('Published package ownership manifest failed final validation');
  }
  return [];
}

function createPackageWriter({ packageRoot, check = false } = {}) {
  if (typeof packageRoot !== 'string' || packageRoot.length === 0) {
    throw new TypeError('createPackageWriter requires a packageRoot');
  }
  if (typeof check !== 'boolean') throw new TypeError('check must be a boolean');

  const root = path.resolve(packageRoot);
  const expected = new Map();
  const foldedPrefixes = new Map();
  let finished = false;

  function ensureOpen() {
    if (finished) throw new Error('Package writer has already finished');
  }

  function add(file, bytes) {
    ensureOpen();
    const relativePath = normalizePackagePath(file);
    if (!Buffer.isBuffer(bytes)) {
      throw new TypeError(`Package output bytes must be a Buffer: ${relativePath}`);
    }
    if (expected.has(relativePath)) {
      throw new Error(`Package output paths may be added only once; duplicate: ${relativePath}`);
    }
    const additions = caseFoldedAdditions(relativePath, foldedPrefixes);
    for (const [folded, prefix] of additions) foldedPrefixes.set(folded, prefix);
    expected.set(relativePath, Buffer.from(bytes));
  }

  function finish() {
    ensureOpen();
    finished = true;
    const expectedEntries = [...expected.entries()]
      .sort(([left], [right]) => comparePaths(left, right));
    const expectedManifest = manifestBytes(expectedEntries);
    const dirty = new Set();
    const scan = scanPackageTree(root, { rejectProblems: true });
    const previous = readPreviousManifest(root, scan);
    const contents = new Map();

    validateCaseFoldedPaths([
      ...previous.files.map(({ file }) => file),
      ...expectedEntries.map(([file]) => file),
    ]);
    validateExpectedLayout(expectedEntries, scan);
    validateStructuralDirectories(scan, previous, expectedEntries);
    validateOwnedFiles(root, scan, previous, { check, dirty, contents });
    validateUnownedFiles(scan, previous);

    if (check) {
      for (const [file, expectedBytes] of expectedEntries) {
        const stat = scan.files.get(file);
        if (!stat || pathProblem(scan, file)) {
          dirty.add(file);
          continue;
        }
        const actualBytes = contents.has(file)
          ? contents.get(file)
          : readRegularFile(root, file, stat, scan.directories);
        if (!actualBytes.equals(expectedBytes)) dirty.add(file);
      }

      const expectedPaths = new Set(expectedEntries.map(([file]) => file));
      for (const { file } of previous.files) {
        if (!expectedPaths.has(file)
          && (scan.files.has(file) || scan.directories.has(file) || scan.problems.has(file))) {
          dirty.add(file);
        }
      }

      if (!previous.raw || !previous.raw.equals(expectedManifest)) dirty.add(MANIFEST_FILE);
      return [...dirty].sort(comparePaths);
    }

    return publishGeneration(root, expectedEntries, expectedManifest, scan, previous);
  }

  return { add, finish };
}

module.exports = { createPackageWriter };
