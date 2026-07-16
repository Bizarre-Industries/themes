'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const {
  copyEvidenceEntry,
  DEFAULT_EVIDENCE_LIMITS,
  listRepositoryEvidence,
  readEvidenceEntry,
  renderEvidenceIndex,
  renderSnippetIndex,
} = require('../scripts/lib/open-design/evidence.cjs');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function write(root, relativePath, content) {
  const file = path.join(root, ...relativePath.split('/'));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function git(root, args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function tempGitRepository(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-evidence-'));
  t.after(() => fs.rmSync(root, { force: true, recursive: true }));
  git(root, ['init', '--quiet']);
  return root;
}

function ignore(root, ...patterns) {
  fs.appendFileSync(path.join(root, '.git/info/exclude'), `${patterns.join('\n')}\n`);
}

function packageRoot(root) {
  return path.join(root, 'design/open-design/bizarre-industries');
}

test('enumerates complete Git evidence while omitting ignored, deleted, agent, handoff, brainstorm, output, and symlink paths', (t) => {
  const root = tempGitRepository(t);
  const readme = Buffer.from('# Repository\n\nByte-identical evidence.\n');
  const hero = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff]);

  write(root, 'README.md', readme);
  write(root, 'palette.js', 'module.exports = {};\n');
  write(root, 'showcase/assets/generated/hero.png', hero);
  write(root, 'deleted.md', 'tracked, then deleted\n');
  git(root, ['add', '--', 'README.md', 'palette.js', 'showcase/assets/generated/hero.png', 'deleted.md']);
  fs.unlinkSync(path.join(root, 'deleted.md'));

  write(root, 'untracked.md', 'visible untracked evidence\n');
  write(root, 'ignored.txt', 'private ignored content\n');
  write(root, 'AGENTS.md', 'never package instructions\n');
  write(root, 'docs/agent-handoff.md', 'volatile operational handoff\n');
  write(root, '.superpowers/brainstorm/.last-token', 'never package runtime credentials\n');
  write(root, '.superpowers/brainstorm/.last-port', '54321\n');
  write(root, '.superpowers/brainstorm/session/state/server.pid', '12345\n');
  write(root, '.superpowers/brainstorm/session/content/identity-decision.html', '<p>temporary brainstorm UI</p>\n');
  write(root, 'design/open-design/bizarre-industries/recursive.txt', 'package output\n');
  write(root, 'design/open-design/bizarre-industries.tmp-123/staged.txt', 'temporary output\n');
  fs.symlinkSync('README.md', path.join(root, 'linked-readme.md'));
  write(root, 'generated-files.json', `${JSON.stringify({
    version: 2,
    files: [{ file: 'palette.js', sha256: 'a'.repeat(64) }],
  }, null, 2)}\n`);
  ignore(root, 'ignored.txt', 'generated-files.json');

  const entries = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });

  assert.deepEqual(entries.map((entry) => entry.sourcePath), [
    'README.md',
    'palette.js',
    'showcase/assets/generated/hero.png',
    'untracked.md',
  ]);
  assert.equal(entries.find((entry) => entry.sourcePath === 'README.md').packagePath,
    'source/snippets/repo/README.md');
  assert.equal(entries.find((entry) => entry.sourcePath.endsWith('hero.png')).packagePath,
    'assets/showcase/hero.png');
  assert.ok(entries.every((entry) => /^[0-9a-f]{64}$/.test(entry.sha256)));
  assert.ok(entries.every((entry) => !/agents\.md/i.test(entry.sourcePath)));
  assert.ok(entries.every((entry) => entry.sourcePath !== 'docs/agent-handoff.md'));
  assert.ok(entries.every((entry) => !entry.sourcePath.startsWith('.superpowers/brainstorm/')));
  assert.ok(entries.every((entry) => !entry.sourcePath.includes('bizarre-industries')));
  assert.ok(entries.every((entry) => entry.sourcePath !== 'linked-readme.md'));

  const readmeEntry = entries.find((entry) => entry.sourcePath === 'README.md');
  const paletteEntry = entries.find((entry) => entry.sourcePath === 'palette.js');
  const heroEntry = entries.find((entry) => entry.sourcePath.endsWith('hero.png'));
  assert.deepEqual(Object.keys(readmeEntry), [
    'sourcePath', 'packagePath', 'kind', 'bytes', 'sha256', 'classification', 'generated',
  ]);
  const identitySymbols = Object.getOwnPropertySymbols(readmeEntry);
  assert.equal(identitySymbols.length, 1);
  assert.equal(Object.getOwnPropertyDescriptor(readmeEntry, identitySymbols[0]).enumerable, false);
  assert.equal(readmeEntry.bytes, readme.length);
  assert.equal(readmeEntry.sha256, sha256(readme));
  assert.equal(readmeEntry.kind, 'text/markdown');
  assert.equal(readmeEntry.classification, 'documentation');
  assert.equal(readmeEntry.generated, false);
  assert.equal(paletteEntry.generated, true);
  assert.equal(paletteEntry.classification, 'generated');
  assert.equal(heroEntry.kind, 'image/png');
  assert.equal(heroEntry.classification, 'image');
});

test('maps the Bizarre badge into brand assets', (t) => {
  const root = tempGitRepository(t);
  write(root, 'devtools/github-readme-assets/bizarre-badge.svg', '<svg></svg>\n');

  const entries = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });

  assert.equal(entries.length, 1);
  assert.equal(entries[0].sourcePath, 'devtools/github-readme-assets/bizarre-badge.svg');
  assert.equal(entries[0].packagePath, 'assets/brand/bizarre-badge.svg');
  assert.equal(entries[0].kind, 'image/svg+xml');
  assert.equal(entries[0].classification, 'image');
});

test('sorts source paths by raw code-unit order', (t) => {
  const root = tempGitRepository(t);
  write(root, 'a-lower.txt', 'a\n');
  write(root, '_punctuation.txt', '_\n');
  write(root, 'Z-upper.txt', 'Z\n');

  const entries = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });

  assert.deepEqual(entries.map(({ sourcePath }) => sourcePath), [
    'Z-upper.txt',
    '_punctuation.txt',
    'a-lower.txt',
  ]);
});

test('uses the fixed classification precedence and deterministic media kinds', (t) => {
  const root = tempGitRepository(t);
  write(root, 'test/generated.png', 'generated test image\n');
  write(root, 'test/plain.png', 'test image\n');
  write(root, 'picture.png', 'image\n');
  write(root, 'fonts/body.woff2', 'font\n');
  write(root, 'GUIDE.md', 'documentation\n');
  write(root, 'editors/example/theme.json', '{}\n');
  write(root, 'palette.js', 'module.exports = {};\n');
  write(root, 'generated-files.json', `${JSON.stringify({
    version: 2,
    files: [{ file: 'test/generated.png', sha256: 'b'.repeat(64) }],
  }, null, 2)}\n`);
  ignore(root, 'generated-files.json');

  const byPath = new Map(listRepositoryEvidence({
    root,
    packageRoot: packageRoot(root),
  }).map((entry) => [entry.sourcePath, entry]));

  assert.deepEqual([
    byPath.get('test/generated.png').classification,
    byPath.get('test/plain.png').classification,
    byPath.get('picture.png').classification,
    byPath.get('fonts/body.woff2').classification,
    byPath.get('GUIDE.md').classification,
    byPath.get('editors/example/theme.json').classification,
    byPath.get('palette.js').classification,
  ], ['generated', 'test', 'image', 'font', 'documentation', 'adapter', 'canonical']);
  assert.deepEqual([
    byPath.get('test/generated.png').kind,
    byPath.get('fonts/body.woff2').kind,
    byPath.get('editors/example/theme.json').kind,
    byPath.get('palette.js').kind,
  ], ['image/png', 'font/woff2', 'application/json', 'text/javascript']);
});

test('ignores generated ownership unless the manifest is valid version 2', (t) => {
  const root = tempGitRepository(t);
  write(root, 'palette.js', 'module.exports = {};\n');
  write(root, 'generated-files.json', `${JSON.stringify({
    version: 1,
    files: [{ file: 'palette.js', sha256: 'c'.repeat(64) }],
  })}\n`);
  ignore(root, 'generated-files.json');

  const [entry] = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });

  assert.equal(entry.sourcePath, 'palette.js');
  assert.equal(entry.generated, false);
  assert.equal(entry.classification, 'canonical');
});

test('accepts an external packageRoot for Task 6 temporary output', (t) => {
  const root = tempGitRepository(t);
  const externalRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-evidence-external-package-'));
  t.after(() => fs.rmSync(externalRoot, { force: true, recursive: true }));
  write(root, 'README.md', 'repository evidence\n');
  write(root, 'design/open-design/bizarre-industries/recursive.txt', 'canonical package output\n');

  const entries = listRepositoryEvidence({
    root,
    packageRoot: path.join(externalRoot, 'bizarre-industries'),
  });

  assert.deepEqual(entries.map(({ sourcePath }) => sourcePath), ['README.md']);
});

test('accepts evidence exactly at the supported per-file and aggregate byte boundaries', (t) => {
  const root = tempGitRepository(t);
  const content = Buffer.alloc(32, 0x61);
  const limits = { perFileBytes: content.length, aggregateBytes: content.length };
  write(root, 'boundary.bin', content);

  assert.deepEqual(DEFAULT_EVIDENCE_LIMITS, {
    perFileBytes: 8 * 1024 * 1024,
    aggregateBytes: 64 * 1024 * 1024,
  });
  const [entry] = listRepositoryEvidence({
    root,
    packageRoot: packageRoot(root),
    limits,
  });

  assert.equal(entry.bytes, content.length);
  assert.deepEqual(readEvidenceEntry({ root, entry, limits }), content);
});

test('rejects a max-plus-one sparse evidence file before descriptor content read', (t) => {
  const root = tempGitRepository(t);
  const sourcePath = 'oversized.bin';
  const file = path.join(root, sourcePath);
  const limit = 32;
  const descriptor = fs.openSync(file, 'w');
  try {
    fs.ftruncateSync(descriptor, limit + 1);
  } finally {
    fs.closeSync(descriptor);
  }

  const originalReadFileSync = fs.readFileSync;
  let descriptorReads = 0;
  fs.readFileSync = function countDescriptorReads(target, ...args) {
    if (typeof target === 'number') descriptorReads += 1;
    return originalReadFileSync(target, ...args);
  };
  try {
    assert.throws(
      () => listRepositoryEvidence({
        root,
        packageRoot: packageRoot(root),
        limits: { perFileBytes: limit, aggregateBytes: limit + 1 },
      }),
      (error) => error instanceof Error
        && error.message === 'Evidence per-file byte limit exceeded: oversized.bin '
          + '(observed 33 bytes, limit 32 bytes)',
    );
  } finally {
    fs.readFileSync = originalReadFileSync;
  }
  assert.equal(descriptorReads, 0);
});

test('rejects aggregate max-plus-one evidence during enumeration without creating output', (t) => {
  const root = tempGitRepository(t);
  const outputRoot = packageRoot(root);
  write(root, 'a.bin', Buffer.alloc(4, 0x61));
  write(root, 'b.bin', Buffer.alloc(5, 0x62));

  assert.throws(
    () => listRepositoryEvidence({
      root,
      packageRoot: outputRoot,
      limits: { perFileBytes: 8, aggregateBytes: 8 },
    }),
    (error) => error instanceof Error
      && error.message === 'Evidence aggregate byte limit exceeded: b.bin '
        + '(observed 9 bytes, limit 8 bytes)',
  );
  assert.equal(fs.existsSync(outputRoot), false);
});

test('reads and copies README evidence byte-for-byte and renders Open Design index envelopes', (t) => {
  const root = tempGitRepository(t);
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-evidence-stage-'));
  t.after(() => fs.rmSync(stageRoot, { force: true, recursive: true }));
  const readme = Buffer.from([0x23, 0x20, 0x52, 0x45, 0x41, 0x44, 0x4d, 0x45, 0x0d, 0x0a, 0x00]);
  write(root, 'README.md', readme);
  write(root, 'z-last.txt', 'last\n');
  const entries = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });
  const readmeEntry = entries.find(({ sourcePath }) => sourcePath === 'README.md');

  assert.deepEqual(readEvidenceEntry({ root, entry: readmeEntry }), readme);
  copyEvidenceEntry({ root, stageRoot, entry: readmeEntry });

  assert.deepEqual(
    fs.readFileSync(path.join(stageRoot, 'source/snippets/repo/README.md')),
    readme,
  );
  const rendered = renderEvidenceIndex([...entries].reverse());
  assert.ok(rendered.endsWith('\n'));
  assert.ok(!rendered.endsWith('\n\n'));
  assert.deepEqual(JSON.parse(rendered), { schemaVersion: 1, files: entries });

  const snippets = JSON.parse(renderSnippetIndex([...entries].reverse()));
  assert.deepEqual(Object.keys(snippets), ['schemaVersion', 'snippets']);
  assert.equal(snippets.schemaVersion, 1);
  assert.deepEqual(snippets.snippets, entries.map((entry) => ({
    ...entry,
    path: entry.packagePath,
  })));
});

test('readEvidenceEntry rejects content mutation, parent replacement, and source symlinks', (t) => {
  const cases = [
    {
      name: 'content mutation',
      mutate(root) {
        write(root, 'nested/README.md', 'changed bytes\n');
      },
    },
    {
      name: 'parent replacement',
      mutate(root) {
        fs.renameSync(path.join(root, 'nested'), path.join(root, 'nested-before-read'));
        write(root, 'nested/README.md', 'original bytes\n');
      },
    },
    {
      name: 'source symlink',
      mutate(root) {
        fs.unlinkSync(path.join(root, 'nested/README.md'));
        fs.symlinkSync(path.join(root, 'outside.md'), path.join(root, 'nested/README.md'));
      },
    },
  ];

  for (const scenario of cases) {
    const root = tempGitRepository(t);
    write(root, 'nested/README.md', 'original bytes\n');
    write(root, 'outside.md', 'original bytes\n');
    const entry = listRepositoryEvidence({
      root,
      packageRoot: packageRoot(root),
    }).find(({ sourcePath }) => sourcePath === 'nested/README.md');
    scenario.mutate(root);

    assert.throws(
      () => readEvidenceEntry({ root, entry }),
      /symbolic link|changed between enumeration and (?:copy|read)/iu,
      scenario.name,
    );
  }
});

test('fails loudly when a source changes between enumeration and copy', (t) => {
  const root = tempGitRepository(t);
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-evidence-stage-'));
  t.after(() => fs.rmSync(stageRoot, { force: true, recursive: true }));
  write(root, 'README.md', 'original\n');
  const [entry] = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });
  write(root, 'README.md', 'changed!\n');

  assert.throws(
    () => copyEvidenceEntry({ root, stageRoot, entry }),
    /changed between enumeration and copy/iu,
  );
  assert.equal(fs.existsSync(path.join(stageRoot, entry.packagePath)), false);
});

test('fails when a source parent is replaced by a different real directory with identical bytes', (t) => {
  const root = tempGitRepository(t);
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-evidence-stage-'));
  t.after(() => fs.rmSync(stageRoot, { force: true, recursive: true }));
  write(root, 'nested/README.md', 'identical\n');
  const [entry] = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });
  fs.renameSync(path.join(root, 'nested'), path.join(root, 'nested-before-copy'));
  write(root, 'nested/README.md', 'identical\n');

  assert.throws(
    () => copyEvidenceEntry({ root, stageRoot, entry }),
    /changed between enumeration and copy/iu,
  );
  assert.equal(fs.existsSync(path.join(stageRoot, entry.packagePath)), false);
});

test('fails when a source leaf is replaced by a different real file with identical bytes', (t) => {
  const root = tempGitRepository(t);
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-evidence-stage-'));
  t.after(() => fs.rmSync(stageRoot, { force: true, recursive: true }));
  write(root, 'README.md', 'identical\n');
  const [entry] = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });
  fs.renameSync(path.join(root, 'README.md'), path.join(root, 'README-before-copy.md'));
  write(root, 'README.md', 'identical\n');

  assert.throws(
    () => copyEvidenceEntry({ root, stageRoot, entry }),
    /changed between enumeration and copy/iu,
  );
  assert.equal(fs.existsSync(path.join(stageRoot, entry.packagePath)), false);
});

test('fails loudly rather than following a source replaced by a symlink', (t) => {
  const root = tempGitRepository(t);
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-evidence-stage-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-evidence-outside-'));
  t.after(() => fs.rmSync(stageRoot, { force: true, recursive: true }));
  t.after(() => fs.rmSync(outside, { force: true, recursive: true }));
  write(root, 'README.md', 'inside\n');
  write(outside, 'outside.md', 'inside\n');
  const [entry] = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });
  fs.unlinkSync(path.join(root, 'README.md'));
  fs.symlinkSync(path.join(outside, 'outside.md'), path.join(root, 'README.md'));

  assert.throws(
    () => copyEvidenceEntry({ root, stageRoot, entry }),
    /symbolic link|changed between enumeration and copy/iu,
  );
  assert.equal(fs.existsSync(path.join(stageRoot, entry.packagePath)), false);
});

test('detects a persistent destination-parent replacement during open', (t) => {
  const root = tempGitRepository(t);
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-evidence-stage-'));
  t.after(() => fs.rmSync(stageRoot, { force: true, recursive: true }));
  write(root, 'README.md', 'destination parent identity\n');
  const [entry] = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });
  const destination = path.join(stageRoot, ...entry.packagePath.split('/'));
  const destinationParent = path.dirname(destination);
  const priorParent = `${destinationParent}-before-open`;
  fs.mkdirSync(destinationParent, { recursive: true });

  const originalOpenSync = fs.openSync;
  let swapped = false;
  fs.openSync = function openWithPersistentParentSwap(file, flags, mode) {
    if (!swapped && file === destination && (flags & fs.constants.O_WRONLY) !== 0) {
      swapped = true;
      fs.renameSync(destinationParent, priorParent);
      fs.mkdirSync(destinationParent);
    }
    return originalOpenSync(file, flags, mode);
  };
  try {
    assert.throws(
      () => copyEvidenceEntry({ root, stageRoot, entry }),
      /destination parent changed during copy/iu,
    );
  } finally {
    fs.openSync = originalOpenSync;
  }
  assert.equal(swapped, true);
});

test('detects a persistent destination-leaf replacement after write', (t) => {
  const root = tempGitRepository(t);
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-evidence-stage-'));
  t.after(() => fs.rmSync(stageRoot, { force: true, recursive: true }));
  write(root, 'README.md', 'destination leaf identity\n');
  const [entry] = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });
  const destination = path.join(stageRoot, ...entry.packagePath.split('/'));
  const priorLeaf = `${destination}-before-replacement`;

  const originalWriteFileSync = fs.writeFileSync;
  let swapped = false;
  fs.writeFileSync = function writeWithPersistentLeafSwap(file, content, ...args) {
    const result = originalWriteFileSync(file, content, ...args);
    if (!swapped && typeof file === 'number') {
      swapped = true;
      fs.renameSync(destination, priorLeaf);
      const replacement = fs.openSync(
        destination,
        fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL,
        0o666,
      );
      try {
        originalWriteFileSync(replacement, content);
      } finally {
        fs.closeSync(replacement);
      }
    }
    return result;
  };
  try {
    assert.throws(
      () => copyEvidenceEntry({ root, stageRoot, entry }),
      /destination leaf changed during copy/iu,
    );
  } finally {
    fs.writeFileSync = originalWriteFileSync;
  }
  assert.equal(swapped, true);
});

test('rejects malformed, absolute, dot-segment, NUL, and escaping copy paths', (t) => {
  const root = tempGitRepository(t);
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-evidence-stage-'));
  t.after(() => fs.rmSync(stageRoot, { force: true, recursive: true }));
  write(root, 'README.md', 'safe\n');
  const [entry] = listRepositoryEvidence({ root, packageRoot: packageRoot(root) });
  const invalidEntries = [
    { ...entry, sourcePath: '/absolute.md' },
    { ...entry, sourcePath: '../outside.md' },
    { ...entry, sourcePath: 'nested/../README.md' },
    { ...entry, sourcePath: 'nested//README.md' },
    { ...entry, sourcePath: 'README\0.md' },
    { ...entry, packagePath: '../outside.md' },
    { ...entry, packagePath: 'source/./README.md' },
  ];

  for (const invalidEntry of invalidEntries) {
    assert.throws(
      () => copyEvidenceEntry({ root, stageRoot, entry: invalidEntry }),
      /safe relative path/iu,
      JSON.stringify(invalidEntry),
    );
  }
});
