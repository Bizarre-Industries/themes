const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { createGeneratedFiles } = require('../scripts/lib/generated-files.cjs');

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-generated-files-'));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

test('generated output manifest is stable, sorted, and passes check mode', () => {
  const root = tempRoot();
  const writer = createGeneratedFiles({ root, check: false });
  writer.out('z-last.txt', 'last');
  writer.out('a-first.txt', 'first');
  writer.out('Z-upper.txt', 'upper');
  writer.out('_punctuation.txt', 'punctuation');
  writer.finish();

  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'generated-files.json'), 'utf8'));
  assert.deepEqual(manifest, {
    version: 2,
    files: [
      { file: 'Z-upper.txt', sha256: sha256('upper\n') },
      { file: '_punctuation.txt', sha256: sha256('punctuation\n') },
      { file: 'a-first.txt', sha256: sha256('first\n') },
      { file: 'z-last.txt', sha256: sha256('last\n') },
    ],
  });
  assert.equal(fs.readFileSync(path.join(root, 'a-first.txt'), 'utf8'), 'first\n');

  const checker = createGeneratedFiles({ root, check: true });
  checker.out('z-last.txt', 'last');
  checker.out('a-first.txt', 'first');
  checker.out('Z-upper.txt', 'upper');
  checker.out('_punctuation.txt', 'punctuation');
  assert.deepEqual(checker.finish(), []);
});

test('check mode reports modified, missing, and obsolete owned outputs', () => {
  const root = tempRoot();
  const writer = createGeneratedFiles({ root, check: false });
  writer.out('modified.txt', 'fresh');
  writer.out('missing.txt', 'present');
  writer.out('obsolete.txt', 'old');
  writer.finish();

  fs.writeFileSync(path.join(root, 'modified.txt'), 'stale\n');
  fs.unlinkSync(path.join(root, 'missing.txt'));

  const checker = createGeneratedFiles({ root, check: true });
  checker.out('modified.txt', 'fresh');
  checker.out('missing.txt', 'present');
  const dirty = checker.finish();
  assert.deepEqual(dirty, ['generated-files.json', 'missing.txt', 'modified.txt', 'obsolete.txt']);
  assert.equal(fs.existsSync(path.join(root, 'obsolete.txt')), true, 'check mode must not write');
});

test('normal generation removes only obsolete files owned by the previous manifest', () => {
  const root = tempRoot();
  const first = createGeneratedFiles({ root, check: false });
  first.out('owned-old.txt', 'old');
  first.finish();
  fs.writeFileSync(path.join(root, 'user-file.txt'), 'keep me\n');

  const second = createGeneratedFiles({ root, check: false });
  second.out('owned-new.txt', 'new');
  second.finish();

  assert.equal(fs.existsSync(path.join(root, 'owned-old.txt')), false);
  assert.equal(fs.readFileSync(path.join(root, 'user-file.txt'), 'utf8'), 'keep me\n');
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(root, 'generated-files.json'), 'utf8')).files,
    [{ file: 'owned-new.txt', sha256: sha256('new\n') }],
  );
});

test('normal generation preserves a modified obsolete output and drops ownership', () => {
  const root = tempRoot();
  const first = createGeneratedFiles({ root, check: false });
  first.out('owned-old.txt', 'old');
  first.finish();
  fs.writeFileSync(path.join(root, 'owned-old.txt'), 'user changed this\n');

  const second = createGeneratedFiles({ root, check: false });
  second.out('owned-new.txt', 'new');
  second.finish();

  assert.equal(fs.readFileSync(path.join(root, 'owned-old.txt'), 'utf8'), 'user changed this\n');
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(root, 'generated-files.json'), 'utf8')).files,
    [{ file: 'owned-new.txt', sha256: sha256('new\n') }],
  );
});

test('a legacy path-only manifest cannot claim and delete a user file', () => {
  const root = tempRoot();
  fs.writeFileSync(path.join(root, 'notes.txt'), 'user owned\n');
  fs.writeFileSync(path.join(root, 'generated-files.json'), '{"version":1,"files":["notes.txt"]}\n');

  const writer = createGeneratedFiles({ root, check: false });
  writer.out('generated.txt', 'generated');
  writer.finish();

  assert.equal(fs.readFileSync(path.join(root, 'notes.txt'), 'utf8'), 'user owned\n');
});

test('agent instruction files are protected from output and manifest ownership', () => {
  const root = tempRoot();
  const instructions = 'user instructions\n';
  fs.writeFileSync(path.join(root, 'AGENTS.md'), instructions);
  fs.writeFileSync(path.join(root, 'generated-files.json'), `${JSON.stringify({
    version: 2,
    files: [{ file: 'AGENTS.md', sha256: sha256(instructions) }],
  }, null, 2)}\n`);

  const writer = createGeneratedFiles({ root, check: false });
  assert.throws(() => writer.out('nested/agents.md', 'replacement'), /agent instructions/iu);
  writer.out('generated.txt', 'generated');
  writer.finish();

  assert.equal(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8'), instructions);
});

test('generation refuses to follow output symlinks outside the repository', () => {
  const root = tempRoot();
  const outside = tempRoot();
  const outsideFile = path.join(outside, 'keep.txt');
  fs.writeFileSync(outsideFile, 'keep me\n');
  fs.symlinkSync(outsideFile, path.join(root, 'owned.txt'));

  const writer = createGeneratedFiles({ root, check: false });
  assert.throws(() => writer.out('owned.txt', 'replacement'), /symbolic link/iu);
  assert.equal(fs.readFileSync(outsideFile, 'utf8'), 'keep me\n');
});

test('generation refuses to traverse symlinked output directories', () => {
  const root = tempRoot();
  const outside = tempRoot();
  fs.symlinkSync(outside, path.join(root, 'linked'));

  const writer = createGeneratedFiles({ root, check: false });
  assert.throws(() => writer.out('linked/output.txt', 'replacement'), /symbolic link/iu);
  assert.equal(fs.existsSync(path.join(outside, 'output.txt')), false);
});

test('check mode reports a symlinked generated output without reading its target', () => {
  const root = tempRoot();
  const outside = tempRoot();
  const outsideFile = path.join(outside, 'keep.txt');
  fs.writeFileSync(outsideFile, 'expected\n');
  const writer = createGeneratedFiles({ root, check: false });
  writer.out('owned.txt', 'expected');
  writer.finish();
  fs.unlinkSync(path.join(root, 'owned.txt'));
  fs.symlinkSync(outsideFile, path.join(root, 'owned.txt'));

  const checker = createGeneratedFiles({ root, check: true });
  checker.out('owned.txt', 'expected');
  assert.deepEqual(checker.finish(), ['owned.txt']);
  assert.equal(fs.readFileSync(outsideFile, 'utf8'), 'expected\n');
});
