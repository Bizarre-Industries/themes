'use strict';

const fs = require('node:fs');
const path = require('node:path');

const FAMILIES = Object.freeze([
  Object.freeze({ family: 'Monaspace Argon', slug: 'argon' }),
  Object.freeze({ family: 'Monaspace Krypton', slug: 'krypton' }),
  Object.freeze({ family: 'Monaspace Neon', slug: 'neon' }),
  Object.freeze({ family: 'Monaspace Xenon', slug: 'xenon' }),
]);
const WEIGHTS = Object.freeze([400, 600, 700]);

function lstatIfPresent(file) {
  try {
    return fs.lstatSync(file, { bigint: true });
  } catch (error) {
    if (error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')) return null;
    throw error;
  }
}

function kind(stat) {
  if (stat.isDirectory()) return 'directory';
  if (stat.isFile()) return 'file';
  if (stat.isSymbolicLink()) return 'symlink';
  return 'other';
}

function identity(file, stat) {
  return Object.freeze({ file, dev: stat.dev, ino: stat.ino, kind: kind(stat) });
}

function sameIdentity(expected, file, stat) {
  return Boolean(stat)
    && expected.file === file
    && expected.dev === stat.dev
    && expected.ino === stat.ino
    && expected.kind === kind(stat);
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

function dependencyChanged(file) {
  return new Error(`Font dependency changed while reading: ${file}`);
}

function inspectDependencyPath(root, segments) {
  const absoluteRoot = path.resolve(root);
  const file = path.join(absoluteRoot, 'node_modules', '@fontsource', ...segments);
  const relativeSegments = path.relative(absoluteRoot, file).split(path.sep).filter(Boolean);
  const components = [];
  let current = absoluteRoot;

  const rootStat = lstatIfPresent(current);
  if (!rootStat) throw new Error(`Missing font dependency file: ${file}`);
  if (rootStat.isSymbolicLink()) {
    throw new Error(`Font dependency path contains a symbolic link: ${current}`);
  }
  if (!rootStat.isDirectory()) {
    throw new Error(`Font dependency parent must be a real directory: ${current}`);
  }
  components.push(identity(current, rootStat));

  for (let index = 0; index < relativeSegments.length; index += 1) {
    current = path.join(current, relativeSegments[index]);
    const stat = lstatIfPresent(current);
    if (!stat) throw new Error(`Missing font dependency file: ${file}`);
    if (stat.isSymbolicLink()) {
      throw new Error(`Font dependency path contains a symbolic link: ${current}`);
    }
    if (index < relativeSegments.length - 1 && !stat.isDirectory()) {
      throw new Error(`Font dependency parent must be a real directory: ${current}`);
    }
    if (index === relativeSegments.length - 1 && !stat.isFile()) {
      throw new Error(`Font dependency must be a regular file: ${file}`);
    }
    components.push(identity(current, stat));
  }

  return { components, file, leafStat: lstatIfPresent(file) };
}

function componentsMatch(expected, actual) {
  return expected.length === actual.length
    && expected.every((entry, index) => {
      const candidate = actual[index];
      return candidate && sameIdentity(entry, candidate.file, candidate.stat);
    });
}

function inspectComponents(root, file) {
  const absoluteRoot = path.resolve(root);
  const relative = path.relative(
    path.join(absoluteRoot, 'node_modules', '@fontsource'),
    file,
  );
  const segments = relative.split(path.sep).filter(Boolean);
  const inspected = inspectDependencyPath(absoluteRoot, segments);
  return inspected.components.map((entry) => ({
    file: entry.file,
    stat: lstatIfPresent(entry.file),
  }));
}

function readDependencyFile(root, ...segments) {
  const inspected = inspectDependencyPath(root, segments);
  const flags = fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0);
  let descriptor;
  try {
    descriptor = fs.openSync(inspected.file, flags);
  } catch (error) {
    if (error && ['ELOOP', 'ENOENT', 'ENOTDIR'].includes(error.code)) {
      throw dependencyChanged(inspected.file);
    }
    throw error;
  }

  try {
    const before = fs.fstatSync(descriptor, { bigint: true });
    if (!before.isFile() || !inspected.leafStat || !sameFile(inspected.leafStat, before)) {
      throw dependencyChanged(inspected.file);
    }
    const beforeComponents = inspectComponents(root, inspected.file);
    if (!componentsMatch(inspected.components, beforeComponents)) {
      throw dependencyChanged(inspected.file);
    }

    const bytes = fs.readFileSync(descriptor);
    const after = fs.fstatSync(descriptor, { bigint: true });
    const afterComponents = inspectComponents(root, inspected.file);
    const afterComponentLeaf = afterComponents.at(-1)?.stat;
    const finalLeaf = lstatIfPresent(inspected.file);
    if (!sameSnapshot(before, after)
      || BigInt(bytes.length) !== after.size
      || !finalLeaf || finalLeaf.isSymbolicLink() || !finalLeaf.isFile()
      || !afterComponentLeaf || !sameSnapshot(after, afterComponentLeaf)
      || !sameSnapshot(after, finalLeaf)
      || !componentsMatch(inspected.components, afterComponents)) {
      throw dependencyChanged(inspected.file);
    }
    return bytes;
  } finally {
    fs.closeSync(descriptor);
  }
}

function loadFontAssets({ root } = {}) {
  if (typeof root !== 'string' || root.length === 0) {
    throw new TypeError('loadFontAssets requires a repository root');
  }

  const assets = new Map();
  for (const { slug } of FAMILIES) {
    const packageName = `monaspace-${slug}`;
    for (const weight of WEIGHTS) {
      const basename = `${packageName}-latin-${weight}-normal.woff2`;
      assets.set(
        `fonts/${basename}`,
        readDependencyFile(root, packageName, 'files', basename),
      );
    }
    assets.set(
      `assets/licenses/${packageName}-LICENSE`,
      readDependencyFile(root, packageName, 'LICENSE'),
    );
  }
  return assets;
}

module.exports = {
  FAMILIES,
  WEIGHTS,
  loadFontAssets,
};
