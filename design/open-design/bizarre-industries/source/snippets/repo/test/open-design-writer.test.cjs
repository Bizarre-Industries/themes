'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const { createPackageWriter } = require('../scripts/lib/open-design/package-writer.cjs');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function tempPackage(t) {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-package-writer-'));
  t.after(() => fs.rmSync(sandbox, { force: true, recursive: true }));
  return path.join(sandbox, 'package');
}

function write(file, bytes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
}

function treeSnapshot(root) {
  if (!fs.existsSync(root)) return null;
  const entries = [];

  function visit(directory, prefix = '') {
    for (const name of fs.readdirSync(directory).sort()) {
      const relativePath = prefix ? `${prefix}/${name}` : name;
      const file = path.join(directory, name);
      const stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) {
        entries.push({ path: relativePath, type: 'symlink', target: fs.readlinkSync(file) });
      } else if (stat.isDirectory()) {
        entries.push({ path: relativePath, type: 'directory' });
        visit(file, relativePath);
      } else if (stat.isFile()) {
        entries.push({ path: relativePath, type: 'file', bytes: fs.readFileSync(file) });
      } else {
        entries.push({ path: relativePath, type: 'other' });
      }
    }
  }

  visit(root);
  return entries;
}

function allRelativePaths(root) {
  return (treeSnapshot(root) || []).map((entry) => entry.path);
}

test('publishes exact text and binary bytes with a stable sorted manifest written last', (t) => {
  const packageRoot = tempPackage(t);
  const binary = Buffer.from([0x00, 0xff, 0x0a, 0x80]);
  const text = Buffer.from('first\r\nno normalization\n');
  const renames = [];
  const originalRenameSync = fs.renameSync;
  fs.renameSync = function recordedRename(source, destination) {
    renames.push({ source, destination });
    return originalRenameSync.call(fs, source, destination);
  };

  try {
    const writer = createPackageWriter({ packageRoot, check: false });
    writer.add('z-last.txt', Buffer.from('last\n'));
    writer.add('binary/payload.bin', binary);
    writer.add('a-first.txt', text);
    assert.deepEqual(writer.finish(), []);
  } finally {
    fs.renameSync = originalRenameSync;
  }

  assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'a-first.txt')), text);
  assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'binary/payload.bin')), binary);
  assert.deepEqual(
    renames.map(({ destination }) => path.relative(packageRoot, destination).replaceAll('\\', '/')),
    ['a-first.txt', 'binary/payload.bin', 'z-last.txt', 'package-files.json'],
  );
  for (const { source, destination } of renames) {
    assert.equal(path.dirname(source), path.dirname(destination));
    assert.match(path.basename(source), /^\..+\.tmp-\d+-/u);
  }

  const expectedManifest = {
    version: 1,
    files: [
      { file: 'a-first.txt', sha256: sha256(text) },
      { file: 'binary/payload.bin', sha256: sha256(binary) },
      { file: 'z-last.txt', sha256: sha256(Buffer.from('last\n')) },
    ],
  };
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(packageRoot, 'package-files.json'), 'utf8')),
    expectedManifest,
  );
  assert.equal(expectedManifest.files.some(({ file }) => file === 'package-files.json'), false);
  assert.equal(allRelativePaths(packageRoot).some((file) => file.includes('.tmp-')), false);

  const checker = createPackageWriter({ packageRoot, check: true });
  checker.add('binary/payload.bin', binary);
  checker.add('z-last.txt', Buffer.from('last\n'));
  checker.add('a-first.txt', text);
  assert.deepEqual(checker.finish(), []);
});

test('check mode reports sorted missing, modified, obsolete, and manifest paths without writes', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('modified.txt', Buffer.from('fresh\n'));
  first.add('missing.txt', Buffer.from('present\n'));
  first.add('obsolete.txt', Buffer.from('old\n'));
  first.finish();

  fs.writeFileSync(path.join(packageRoot, 'modified.txt'), 'user changed this\n');
  fs.unlinkSync(path.join(packageRoot, 'missing.txt'));
  const before = treeSnapshot(packageRoot);

  const checker = createPackageWriter({ packageRoot, check: true });
  checker.add('new.txt', Buffer.from('new\n'));
  checker.add('missing.txt', Buffer.from('present\n'));
  checker.add('modified.txt', Buffer.from('fresh\n'));
  assert.deepEqual(checker.finish(), [
    'missing.txt',
    'modified.txt',
    'new.txt',
    'obsolete.txt',
    'package-files.json',
  ]);
  assert.deepEqual(treeSnapshot(packageRoot), before);
});

test('check mode does not create an absent package directory', (t) => {
  const packageRoot = tempPackage(t);
  const checker = createPackageWriter({ packageRoot, check: true });
  checker.add('missing.bin', Buffer.from([0xde, 0xad]));

  assert.deepEqual(checker.finish(), ['missing.bin', 'package-files.json']);
  assert.equal(fs.existsSync(packageRoot), false);
});

test('generation preserves a modified owned file and preflights before any mutation', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('z-modified.txt', Buffer.from('owned\n'));
  first.finish();
  fs.writeFileSync(path.join(packageRoot, 'z-modified.txt'), 'user work\n');
  const manifestBefore = fs.readFileSync(path.join(packageRoot, 'package-files.json'));

  const second = createPackageWriter({ packageRoot, check: false });
  second.add('a-new.txt', Buffer.from('must not appear\n'));
  second.add('z-modified.txt', Buffer.from('replacement\n'));
  assert.throws(() => second.finish(), /modified owned file/iu);

  assert.equal(fs.readFileSync(path.join(packageRoot, 'z-modified.txt'), 'utf8'), 'user work\n');
  assert.equal(fs.existsSync(path.join(packageRoot, 'a-new.txt')), false);
  assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'package-files.json')), manifestBefore);
});

test('generation revalidates an owned target after temp fsync and before rename', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('owned.txt', Buffer.from('old\n'));
  first.finish();
  const manifestBefore = fs.readFileSync(path.join(packageRoot, 'package-files.json'));
  const ownedFile = path.join(packageRoot, 'owned.txt');
  const originalFsyncSync = fs.fsyncSync;
  let edited = false;
  fs.fsyncSync = function editOwnedAfterTempFsync(descriptor) {
    const result = originalFsyncSync.call(fs, descriptor);
    if (!edited) {
      edited = true;
      fs.writeFileSync(ownedFile, 'user edit during temp creation\n');
    }
    return result;
  };

  try {
    const writer = createPackageWriter({ packageRoot, check: false });
    writer.add('owned.txt', Buffer.from('new\n'));
    assert.throws(() => writer.finish(), /modified owned file/iu);
  } finally {
    fs.fsyncSync = originalFsyncSync;
  }

  assert.equal(edited, true);
  assert.equal(fs.readFileSync(ownedFile, 'utf8'), 'user edit during temp creation\n');
  assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'package-files.json')), manifestBefore);
  assert.equal(allRelativePaths(packageRoot).some((file) => file.includes('.tmp-')), false);
});

test('generation preserves an unowned package file and preflights before any mutation', (t) => {
  const packageRoot = tempPackage(t);
  write(path.join(packageRoot, 'z-user-notes.txt'), Buffer.from('keep this\n'));

  const writer = createPackageWriter({ packageRoot, check: false });
  writer.add('a-new.txt', Buffer.from('must not appear\n'));
  assert.throws(() => writer.finish(), /unowned file/iu);

  assert.equal(fs.readFileSync(path.join(packageRoot, 'z-user-notes.txt'), 'utf8'), 'keep this\n');
  assert.equal(fs.existsSync(path.join(packageRoot, 'a-new.txt')), false);
  assert.equal(fs.existsSync(path.join(packageRoot, 'package-files.json')), false);
});

test('generation rejects invalid previous ownership manifests without mutation', (t) => {
  const invalidManifests = [
    ['invalid JSON', Buffer.from('{')],
    ['wrong version', Buffer.from('{"version":2,"files":[]}\n')],
    ['non-canonical encoding', Buffer.from('{"version":1,"files":[]}\n')],
    ['invalid entries', Buffer.from('{"version":1,"files":[{"file":"owned.txt","sha256":"bad"}]}\n')],
    ['unsorted entries', Buffer.from(`${JSON.stringify({
      version: 1,
      files: [
        { file: 'z.txt', sha256: 'a'.repeat(64) },
        { file: 'a.txt', sha256: 'b'.repeat(64) },
      ],
    })}\n`)],
  ];

  for (const [label, manifest] of invalidManifests) {
    const packageRoot = tempPackage(t);
    write(path.join(packageRoot, 'package-files.json'), manifest);
    const writer = createPackageWriter({ packageRoot, check: false });
    writer.add('a-new.txt', Buffer.from('must not appear\n'));
    assert.throws(() => writer.finish(), /invalid package ownership manifest/iu, label);
    assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'package-files.json')), manifest, label);
    assert.equal(fs.existsSync(path.join(packageRoot, 'a-new.txt')), false, label);
  }
});

test('check mode hard-errors on an invalid ownership manifest', (t) => {
  const packageRoot = tempPackage(t);
  write(path.join(packageRoot, 'package-files.json'), Buffer.from('{"version":1,"files":[]}\n'));
  const checker = createPackageWriter({ packageRoot, check: true });

  assert.throws(() => checker.finish(), /invalid package ownership manifest/iu);
});

test('a non-empty directory without a manifest is not bootstrap state in generation', (t) => {
  const packageRoot = tempPackage(t);
  fs.mkdirSync(path.join(packageRoot, 'empty-user-directory'), { recursive: true });
  const writer = createPackageWriter({ packageRoot, check: false });
  writer.add('a-new.txt', Buffer.from('must not appear\n'));

  assert.throws(() => writer.finish(), /non-empty package.*manifest|unowned state/iu);
  assert.equal(fs.existsSync(path.join(packageRoot, 'a-new.txt')), false);
  assert.equal(fs.existsSync(path.join(packageRoot, 'package-files.json')), false);
});

test('a non-empty directory without a manifest hard-errors in check mode', (t) => {
  const packageRoot = tempPackage(t);
  fs.mkdirSync(path.join(packageRoot, 'empty-user-directory'), { recursive: true });
  const before = treeSnapshot(packageRoot);
  const checker = createPackageWriter({ packageRoot, check: true });
  checker.add('a-new.txt', Buffer.from('expected\n'));

  assert.throws(() => checker.finish(), /non-empty package.*manifest|unowned state/iu);
  assert.deepEqual(treeSnapshot(packageRoot), before);
});

test('arbitrary empty directories are unowned even when the manifest is valid', (t) => {
  for (const check of [true, false]) {
    const packageRoot = tempPackage(t);
    fs.mkdirSync(path.join(packageRoot, 'user-directory'), { recursive: true });
    write(path.join(packageRoot, 'package-files.json'), Buffer.from(`${JSON.stringify({
      version: 1,
      files: [],
    }, null, 2)}\n`));
    const before = treeSnapshot(packageRoot);
    const writer = createPackageWriter({ packageRoot, check });

    assert.throws(() => writer.finish(), /unowned directory/iu);
    assert.deepEqual(treeSnapshot(packageRoot), before);
  }
});

test('check mode hard-errors on unowned files', (t) => {
  const packageRoot = tempPackage(t);
  write(path.join(packageRoot, 'user-notes.txt'), Buffer.from('keep this\n'));
  const before = treeSnapshot(packageRoot);
  const checker = createPackageWriter({ packageRoot, check: true });

  assert.throws(() => checker.finish(), /unowned file/iu);
  assert.deepEqual(treeSnapshot(packageRoot), before);
});

test('check mode hard-errors on symlinks without following them', (t) => {
  const packageRoot = tempPackage(t);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-package-check-symlink-'));
  t.after(() => fs.rmSync(outside, { force: true, recursive: true }));
  const outsideFile = path.join(outside, 'keep.txt');
  write(outsideFile, Buffer.from('keep me\n'));
  fs.mkdirSync(packageRoot, { recursive: true });
  fs.symlinkSync(outsideFile, path.join(packageRoot, 'linked.txt'));
  const checker = createPackageWriter({ packageRoot, check: true });
  checker.add('linked.txt', Buffer.from('replacement\n'));

  assert.throws(() => checker.finish(), /symbolic link/iu);
  assert.equal(fs.readFileSync(outsideFile, 'utf8'), 'keep me\n');
});

test('rejects an AGENTS.md directory before traversing its contents', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.finish();
  const protectedDirectory = path.join(packageRoot, 'AgEnTs.Md');
  write(path.join(protectedDirectory, 'must-not-be-inspected.txt'), Buffer.from('private\n'));
  const originalReaddirSync = fs.readdirSync;
  let traversed = false;
  fs.readdirSync = function rejectProtectedTraversal(directory, ...args) {
    if (path.resolve(String(directory)) === protectedDirectory) {
      traversed = true;
      throw new Error('protected directory contents were traversed');
    }
    return originalReaddirSync.call(fs, directory, ...args);
  };

  try {
    const checker = createPackageWriter({ packageRoot, check: true });
    assert.throws(() => checker.finish(), /agent instructions/iu);
  } finally {
    fs.readdirSync = originalReaddirSync;
  }

  assert.equal(traversed, false);
});

test('check mode rejects a directory entry inserted after its snapshot readdir', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.finish();
  const insertedFile = path.join(packageRoot, 'inserted-after-readdir.txt');
  const originalLstatSync = fs.lstatSync;
  let rootLstats = 0;
  let inserted = false;
  fs.lstatSync = function insertBeforeClosingDirectoryStat(file, ...args) {
    if (path.resolve(String(file)) === packageRoot) {
      rootLstats += 1;
      if (rootLstats === 3) {
        inserted = true;
        fs.writeFileSync(insertedFile, 'concurrent insertion\n');
      }
    }
    return originalLstatSync.call(fs, file, ...args);
  };

  try {
    const checker = createPackageWriter({ packageRoot, check: true });
    assert.throws(() => checker.finish(), /identity changed/iu);
  } finally {
    fs.lstatSync = originalLstatSync;
  }

  assert.equal(inserted, true);
  assert.equal(fs.readFileSync(insertedFile, 'utf8'), 'concurrent insertion\n');
});

test('check mode rejects a same-inode edit after descriptor validation but before final lstat', (t) => {
  const packageRoot = tempPackage(t);
  const ownedBytes = Buffer.from('owned sentinel\n');
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('owned.txt', ownedBytes);
  first.finish();
  const ownedFile = path.join(packageRoot, 'owned.txt');
  const originalLstatSync = fs.lstatSync;
  let ownedLstats = 0;
  let edited = false;
  fs.lstatSync = function editBeforeFinalLeafStat(file, ...args) {
    if (path.resolve(String(file)) === ownedFile) {
      ownedLstats += 1;
      if (ownedLstats === 3) {
        edited = true;
        fs.writeFileSync(ownedFile, 'same inode, changed bytes\n');
      }
    }
    return originalLstatSync.call(fs, file, ...args);
  };

  try {
    const checker = createPackageWriter({ packageRoot, check: true });
    checker.add('owned.txt', ownedBytes);
    assert.throws(() => checker.finish(), /identity changed/iu);
  } finally {
    fs.lstatSync = originalLstatSync;
  }

  assert.equal(edited, true);
  assert.equal(fs.readFileSync(ownedFile, 'utf8'), 'same inode, changed bytes\n');
});

test('special package entries hard-error in generation and check mode', (t) => {
  for (const check of [false, true]) {
    const packageRoot = tempPackage(t);
    fs.mkdirSync(packageRoot, { recursive: true });
    const fifo = path.join(packageRoot, 'user-pipe');
    const created = spawnSync('mkfifo', [fifo], { encoding: 'utf8' });
    assert.equal(created.status, 0, created.stderr);
    const writer = createPackageWriter({ packageRoot, check });
    assert.throws(() => writer.finish(), /not a regular file or directory/iu);
  }
});

test('check mode hard-errors when an expected regular-file path is a directory', (t) => {
  const packageRoot = tempPackage(t);
  fs.mkdirSync(path.join(packageRoot, 'expected.txt'), { recursive: true });
  write(path.join(packageRoot, 'package-files.json'), Buffer.from(`${JSON.stringify({
    version: 1,
    files: [],
  }, null, 2)}\n`));
  const checker = createPackageWriter({ packageRoot, check: true });
  checker.add('expected.txt', Buffer.from('expected\n'));

  assert.throws(() => checker.finish(), /not a regular file/iu);
});

test('conflicting expected file paths hard-error in check mode', (t) => {
  const packageRoot = tempPackage(t);
  const checker = createPackageWriter({ packageRoot, check: true });
  checker.add('parent', Buffer.from('parent\n'));
  checker.add('parent/child.txt', Buffer.from('child\n'));

  assert.throws(() => checker.finish(), /contains another expected file/iu);
  assert.equal(fs.existsSync(packageRoot), false);
});

test('generation rejects symlink leaves and parents without following them', (t) => {
  const leafRoot = tempPackage(t);
  const leafOutside = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-package-outside-leaf-'));
  t.after(() => fs.rmSync(leafOutside, { force: true, recursive: true }));
  const outsideFile = path.join(leafOutside, 'keep.txt');
  write(outsideFile, Buffer.from('keep me\n'));
  fs.mkdirSync(leafRoot, { recursive: true });
  fs.symlinkSync(outsideFile, path.join(leafRoot, 'z-linked.txt'));

  const leafWriter = createPackageWriter({ packageRoot: leafRoot, check: false });
  leafWriter.add('a-new.txt', Buffer.from('must not appear\n'));
  leafWriter.add('z-linked.txt', Buffer.from('replacement\n'));
  assert.throws(() => leafWriter.finish(), /symbolic link/iu);
  assert.equal(fs.readFileSync(outsideFile, 'utf8'), 'keep me\n');
  assert.equal(fs.existsSync(path.join(leafRoot, 'a-new.txt')), false);

  const parentRoot = tempPackage(t);
  const parentOutside = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-package-outside-parent-'));
  t.after(() => fs.rmSync(parentOutside, { force: true, recursive: true }));
  fs.mkdirSync(parentRoot, { recursive: true });
  fs.symlinkSync(parentOutside, path.join(parentRoot, 'z-linked'));

  const parentWriter = createPackageWriter({ packageRoot: parentRoot, check: false });
  parentWriter.add('a-new.txt', Buffer.from('must not appear\n'));
  parentWriter.add('z-linked/output.txt', Buffer.from('replacement\n'));
  assert.throws(() => parentWriter.finish(), /symbolic link/iu);
  assert.equal(fs.existsSync(path.join(parentOutside, 'output.txt')), false);
  assert.equal(fs.existsSync(path.join(parentRoot, 'a-new.txt')), false);
});

test('rejects protected, non-canonical, and non-Buffer additions', (t) => {
  const packageRoot = tempPackage(t);
  const writer = createPackageWriter({ packageRoot, check: false });

  assert.throws(() => writer.add('nested/AgEnTs.Md', Buffer.from('no\n')), /agent instructions/iu);
  assert.throws(() => writer.add('package-files.json', Buffer.from('{}\n')), /managed by the package writer/iu);
  assert.throws(() => writer.add('PACKAGE-FILES.JSON', Buffer.from('{}\n')), /managed by the package writer/iu);
  for (const unsafePath of [
    '',
    '/absolute.txt',
    '.',
    './relative.txt',
    '../outside.txt',
    'nested/../outside.txt',
    'repeated//segment.txt',
    'trailing/slash/',
    'backslash\\segment.txt',
    'nul\0segment.txt',
  ]) {
    assert.throws(
      () => writer.add(unsafePath, Buffer.from('no\n')),
      /package-relative path/iu,
      unsafePath,
    );
  }
  assert.throws(() => writer.add('not-bytes.txt', 'no\n'), /Buffer/iu);
  assert.equal(fs.existsSync(packageRoot), false);
});

test('add rejects case-folded leaf and parent-prefix collisions on every host', (t) => {
  const packageRoot = tempPackage(t);
  const writer = createPackageWriter({ packageRoot, check: false });
  writer.add('Folder/one.txt', Buffer.from('one\n'));

  assert.throws(() => writer.add('folder/two.txt', Buffer.from('two\n')), /case-folded path collision/iu);
  assert.throws(() => writer.add('Folder/ONE.TXT', Buffer.from('one again\n')), /case-folded path collision/iu);
  assert.equal(fs.existsSync(packageRoot), false);
});

test('add accepts each path once and defensively copies its Buffer', (t) => {
  const packageRoot = tempPackage(t);
  const bytes = Buffer.from('original\n');
  const writer = createPackageWriter({ packageRoot, check: false });
  writer.add('owned.txt', bytes);

  assert.throws(() => writer.add('owned.txt', Buffer.from('original\n')), /once|duplicate/iu);
  bytes.fill(0x78);
  writer.finish();
  assert.equal(fs.readFileSync(path.join(packageRoot, 'owned.txt'), 'utf8'), 'original\n');
});

test('a pre-rename failure removes its temporary file and preserves the old manifest', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('owned.txt', Buffer.from('old\n'));
  first.finish();
  const manifestBefore = fs.readFileSync(path.join(packageRoot, 'package-files.json'));
  const renameFailure = new Error('injected rename failure');
  const originalRenameSync = fs.renameSync;
  fs.renameSync = function failOwnedRename(source, destination) {
    if (path.basename(destination) === 'owned.txt') throw renameFailure;
    return originalRenameSync.call(fs, source, destination);
  };

  try {
    const second = createPackageWriter({ packageRoot, check: false });
    second.add('owned.txt', Buffer.from('new\n'));
    assert.throws(() => second.finish(), (error) => error === renameFailure);
  } finally {
    fs.renameSync = originalRenameSync;
  }

  assert.equal(allRelativePaths(packageRoot).some((file) => file.includes('.tmp-')), false);
  assert.equal(fs.readFileSync(path.join(packageRoot, 'owned.txt'), 'utf8'), 'old\n');
  assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'package-files.json')), manifestBefore);
});

test('temporary cleanup failure does not mask the original pre-rename failure', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('owned.txt', Buffer.from('old\n'));
  first.finish();
  const renameFailure = new Error('original rename failure');
  const cleanupFailure = new Error('secondary cleanup failure');
  const originalRenameSync = fs.renameSync;
  const originalUnlinkSync = fs.unlinkSync;
  fs.renameSync = function failOwnedRename(source, destination) {
    if (path.basename(destination) === 'owned.txt') throw renameFailure;
    return originalRenameSync.call(fs, source, destination);
  };
  fs.unlinkSync = function failTempCleanup(file) {
    if (path.basename(file).includes('.tmp-')) throw cleanupFailure;
    return originalUnlinkSync.call(fs, file);
  };

  try {
    const second = createPackageWriter({ packageRoot, check: false });
    second.add('owned.txt', Buffer.from('new\n'));
    assert.throws(() => second.finish(), (error) => error === renameFailure);
  } finally {
    fs.renameSync = originalRenameSync;
    fs.unlinkSync = originalUnlinkSync;
  }
});

test('an EEXIST temp-open failure never deletes the temp path this invocation did not create', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('owned.txt', Buffer.from('old\n'));
  first.finish();
  const originalOpenSync = fs.openSync;
  let injectedTemp;
  fs.openSync = function collideWithTemp(file, flags, mode) {
    if (!injectedTemp && path.basename(file).startsWith('.owned.txt.tmp-')) {
      injectedTemp = file;
      const injected = originalOpenSync.call(
        fs,
        file,
        fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL,
        mode,
      );
      fs.writeSync(injected, Buffer.from('not created by this writer\n'));
      fs.closeSync(injected);
    }
    return originalOpenSync.call(fs, file, flags, mode);
  };

  try {
    const writer = createPackageWriter({ packageRoot, check: false });
    writer.add('owned.txt', Buffer.from('new\n'));
    assert.throws(() => writer.finish(), (error) => error && error.code === 'EEXIST');
  } finally {
    fs.openSync = originalOpenSync;
  }

  assert.ok(injectedTemp);
  assert.equal(fs.readFileSync(injectedTemp, 'utf8'), 'not created by this writer\n');
  assert.equal(fs.readFileSync(path.join(packageRoot, 'owned.txt'), 'utf8'), 'old\n');
});

test('removes unchanged obsolete files only after every expected output validates', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('obsolete.txt', Buffer.from('old\n'));
  first.add('stable.txt', Buffer.from('stable\n'));
  first.finish();
  const manifestBefore = fs.readFileSync(path.join(packageRoot, 'package-files.json'));

  const originalRenameSync = fs.renameSync;
  fs.renameSync = function corruptAfterRename(source, destination) {
    const result = originalRenameSync.call(fs, source, destination);
    if (path.basename(destination) === 'new.txt') {
      fs.writeFileSync(destination, 'corrupt after rename\n');
    }
    return result;
  };
  try {
    const failing = createPackageWriter({ packageRoot, check: false });
    failing.add('new.txt', Buffer.from('new\n'));
    failing.add('stable.txt', Buffer.from('stable\n'));
    assert.throws(() => failing.finish(), /failed post-write validation/iu);
  } finally {
    fs.renameSync = originalRenameSync;
  }

  assert.equal(fs.readFileSync(path.join(packageRoot, 'obsolete.txt'), 'utf8'), 'old\n');
  assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'package-files.json')), manifestBefore);

  const failedGeneration = createPackageWriter({ packageRoot, check: false });
  failedGeneration.add('new.txt', Buffer.from('new\n'));
  failedGeneration.add('stable.txt', Buffer.from('stable\n'));
  assert.throws(() => failedGeneration.finish(), /unowned file/iu);
  const failedCheck = createPackageWriter({ packageRoot, check: true });
  failedCheck.add('new.txt', Buffer.from('new\n'));
  failedCheck.add('stable.txt', Buffer.from('stable\n'));
  assert.throws(() => failedCheck.finish(), /unowned file/iu);

  fs.unlinkSync(path.join(packageRoot, 'new.txt'));
  const mutationEvents = [];
  const recordRenameSync = fs.renameSync;
  const recordUnlinkSync = fs.unlinkSync;
  fs.renameSync = function recordRename(source, destination) {
    mutationEvents.push(`rename:${path.relative(packageRoot, destination).replaceAll('\\', '/')}`);
    return recordRenameSync.call(fs, source, destination);
  };
  fs.unlinkSync = function recordUnlink(file) {
    mutationEvents.push(`unlink:${path.relative(packageRoot, file).replaceAll('\\', '/')}`);
    return recordUnlinkSync.call(fs, file);
  };
  try {
    const succeeding = createPackageWriter({ packageRoot, check: false });
    succeeding.add('new.txt', Buffer.from('new\n'));
    succeeding.add('stable.txt', Buffer.from('stable\n'));
    assert.deepEqual(succeeding.finish(), []);
  } finally {
    fs.renameSync = recordRenameSync;
    fs.unlinkSync = recordUnlinkSync;
  }
  assert.equal(fs.existsSync(path.join(packageRoot, 'obsolete.txt')), false);
  assert.equal(fs.readFileSync(path.join(packageRoot, 'new.txt'), 'utf8'), 'new\n');
  assert.equal(mutationEvents.at(-1), 'rename:package-files.json');
});

test('revalidates an obsolete file immediately before unlink and preserves concurrent user work', (t) => {
  const packageRoot = tempPackage(t);
  const obsoleteBytes = Buffer.from('obsolete sentinel\n');
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('obsolete.txt', obsoleteBytes);
  first.add('stable.txt', Buffer.from('stable\n'));
  first.finish();
  const manifestBefore = fs.readFileSync(path.join(packageRoot, 'package-files.json'));

  const obsoleteFile = path.join(packageRoot, 'obsolete.txt');
  const originalReadFileSync = fs.readFileSync;
  let obsoleteReads = 0;
  fs.readFileSync = function editObsoleteAfterSecondRead(file, ...args) {
    const value = originalReadFileSync.call(fs, file, ...args);
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    if (bytes.equals(obsoleteBytes)) {
      obsoleteReads += 1;
      if (obsoleteReads === 2) fs.writeFileSync(obsoleteFile, 'concurrent user work\n');
    }
    return value;
  };

  try {
    const writer = createPackageWriter({ packageRoot, check: false });
    writer.add('stable.txt', Buffer.from('stable\n'));
    assert.throws(() => writer.finish(), /identity changed|modified owned file/iu);
  } finally {
    fs.readFileSync = originalReadFileSync;
  }

  assert.equal(obsoleteReads, 2);
  assert.equal(fs.readFileSync(obsoleteFile, 'utf8'), 'concurrent user work\n');
  assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'package-files.json')), manifestBefore);
});

test('an obsolete edit during final parent validation is not deleted', (t) => {
  const packageRoot = tempPackage(t);
  const obsoleteBytes = Buffer.from('late obsolete sentinel\n');
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('obsolete.txt', obsoleteBytes);
  first.add('stable.txt', Buffer.from('stable\n'));
  first.finish();
  const manifestBefore = fs.readFileSync(path.join(packageRoot, 'package-files.json'));
  const obsoleteFile = path.join(packageRoot, 'obsolete.txt');
  const originalReadFileSync = fs.readFileSync;
  const originalLstatSync = fs.lstatSync;
  let obsoleteReads = 0;
  let editOnParentValidation = false;
  let edited = false;
  fs.readFileSync = function flagAfterFinalObsoleteRead(file, ...args) {
    const value = originalReadFileSync.call(fs, file, ...args);
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    if (bytes.equals(obsoleteBytes)) {
      obsoleteReads += 1;
      if (obsoleteReads === 2) editOnParentValidation = true;
    }
    return value;
  };
  fs.lstatSync = function editDuringParentValidation(file, ...args) {
    if (editOnParentValidation && path.resolve(String(file)) === packageRoot) {
      editOnParentValidation = false;
      edited = true;
      fs.writeFileSync(obsoleteFile, 'late concurrent user work\n');
    }
    return originalLstatSync.call(fs, file, ...args);
  };

  try {
    const writer = createPackageWriter({ packageRoot, check: false });
    writer.add('stable.txt', Buffer.from('stable\n'));
    assert.throws(() => writer.finish(), /identity changed|modified owned file/iu);
  } finally {
    fs.readFileSync = originalReadFileSync;
    fs.lstatSync = originalLstatSync;
  }

  assert.equal(obsoleteReads, 2);
  assert.equal(edited, true);
  assert.equal(fs.readFileSync(obsoleteFile, 'utf8'), 'late concurrent user work\n');
  assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'package-files.json')), manifestBefore);
});

test('prunes only now-empty obsolete structural directories, deepest first', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('remove/deep/obsolete.txt', Buffer.from('obsolete\n'));
  first.add('stay/keep.txt', Buffer.from('keep\n'));
  first.finish();

  const second = createPackageWriter({ packageRoot, check: false });
  second.add('stay/keep.txt', Buffer.from('keep\n'));
  second.finish();

  assert.equal(fs.existsSync(path.join(packageRoot, 'remove/deep')), false);
  assert.equal(fs.existsSync(path.join(packageRoot, 'remove')), false);
  assert.equal(fs.readFileSync(path.join(packageRoot, 'stay/keep.txt'), 'utf8'), 'keep\n');
  assert.equal(fs.statSync(path.join(packageRoot, 'stay')).isDirectory(), true);
});

test('a failed final manifest rename leaves missing-owned drift that blocks automatic roll-forward', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('obsolete.txt', Buffer.from('old\n'));
  first.add('stable.txt', Buffer.from('stable\n'));
  first.finish();
  const manifestBefore = fs.readFileSync(path.join(packageRoot, 'package-files.json'));

  const manifestRenameFailure = new Error('injected final manifest rename failure');
  const originalRenameSync = fs.renameSync;
  fs.renameSync = function failManifestRename(source, destination) {
    if (path.basename(destination) === 'package-files.json') throw manifestRenameFailure;
    return originalRenameSync.call(fs, source, destination);
  };
  try {
    const interrupted = createPackageWriter({ packageRoot, check: false });
    interrupted.add('stable.txt', Buffer.from('stable\n'));
    assert.throws(() => interrupted.finish(), (error) => error === manifestRenameFailure);
  } finally {
    fs.renameSync = originalRenameSync;
  }

  assert.equal(fs.existsSync(path.join(packageRoot, 'obsolete.txt')), false);
  assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'package-files.json')), manifestBefore);
  const retry = createPackageWriter({ packageRoot, check: false });
  retry.add('stable.txt', Buffer.from('stable\n'));
  assert.throws(() => retry.finish(), /owned file is missing|ownership drift/iu);
  assert.deepEqual(fs.readFileSync(path.join(packageRoot, 'package-files.json')), manifestBefore);
});

test('expected bytes changed during the final manifest rename fail post-publication validation', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('owned.txt', Buffer.from('old\n'));
  first.finish();
  const ownedFile = path.join(packageRoot, 'owned.txt');
  const originalRenameSync = fs.renameSync;
  let edited = false;
  fs.renameSync = function editExpectedDuringManifestRename(source, destination) {
    const result = originalRenameSync.call(fs, source, destination);
    if (!edited && path.basename(destination) === 'package-files.json') {
      edited = true;
      fs.writeFileSync(ownedFile, 'changed during manifest publication\n');
    }
    return result;
  };

  try {
    const writer = createPackageWriter({ packageRoot, check: false });
    writer.add('owned.txt', Buffer.from('new\n'));
    assert.throws(() => writer.finish(), /post-write validation/iu);
  } finally {
    fs.renameSync = originalRenameSync;
  }

  assert.equal(edited, true);
  assert.equal(fs.readFileSync(ownedFile, 'utf8'), 'changed during manifest publication\n');
  const retry = createPackageWriter({ packageRoot, check: false });
  retry.add('owned.txt', Buffer.from('new\n'));
  assert.throws(() => retry.finish(), /modified owned file/iu);
});

test('final consistency validation rejects a same-inode manifest edit after publication', (t) => {
  const packageRoot = tempPackage(t);
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('owned.txt', Buffer.from('old\n'));
  first.finish();
  const expectedBytes = Buffer.from('post-publish ordinary sentinel\n');
  const manifestFile = path.join(packageRoot, 'package-files.json');
  const mutatedManifest = Buffer.from('post-publish manifest mutation\n');
  const originalRenameSync = fs.renameSync;
  const originalReadFileSync = fs.readFileSync;
  let manifestPublished = false;
  let mutated = false;
  fs.renameSync = function trackManifestPublication(source, destination) {
    const result = originalRenameSync.call(fs, source, destination);
    if (path.basename(destination) === 'package-files.json') manifestPublished = true;
    return result;
  };
  fs.readFileSync = function mutateAfterLaterOrdinaryRead(file, ...args) {
    const value = originalReadFileSync.call(fs, file, ...args);
    if (manifestPublished && !mutated && Buffer.isBuffer(value) && value.equals(expectedBytes)) {
      mutated = true;
      fs.writeFileSync(manifestFile, mutatedManifest);
    }
    return value;
  };

  try {
    const writer = createPackageWriter({ packageRoot, check: false });
    writer.add('owned.txt', expectedBytes);
    assert.throws(() => writer.finish(), /manifest.*final validation|final consistency/iu);
  } finally {
    fs.renameSync = originalRenameSync;
    fs.readFileSync = originalReadFileSync;
  }

  assert.equal(mutated, true);
  assert.deepEqual(fs.readFileSync(manifestFile), mutatedManifest);
});

test('generation rejects an owned leaf identity change observed during validation', (t) => {
  const packageRoot = tempPackage(t);
  const originalBytes = Buffer.from('identity sentinel\n');
  const first = createPackageWriter({ packageRoot, check: false });
  first.add('z-owned.txt', originalBytes);
  first.finish();

  const movedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-package-moved-leaf-'));
  t.after(() => fs.rmSync(movedRoot, { force: true, recursive: true }));
  const ownedFile = path.join(packageRoot, 'z-owned.txt');
  const movedFile = path.join(movedRoot, 'original.txt');
  const originalReadFileSync = fs.readFileSync;
  let replaced = false;
  fs.readFileSync = function replaceAfterRead(file, ...args) {
    const value = originalReadFileSync.call(fs, file, ...args);
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    if (!replaced && bytes.equals(originalBytes)) {
      replaced = true;
      fs.renameSync(ownedFile, movedFile);
      fs.writeFileSync(ownedFile, originalBytes);
    }
    return value;
  };

  try {
    const writer = createPackageWriter({ packageRoot, check: false });
    writer.add('a-new.txt', Buffer.from('must not appear\n'));
    writer.add('z-owned.txt', Buffer.from('replacement\n'));
    assert.throws(() => writer.finish(), /path identity changed/iu);
  } finally {
    fs.readFileSync = originalReadFileSync;
  }

  assert.equal(replaced, true);
  assert.deepEqual(fs.readFileSync(ownedFile), originalBytes);
  assert.equal(fs.existsSync(path.join(packageRoot, 'a-new.txt')), false);
});
