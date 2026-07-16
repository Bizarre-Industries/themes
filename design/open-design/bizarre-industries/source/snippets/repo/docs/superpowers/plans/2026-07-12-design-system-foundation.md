# Bizarre Industries Design System Foundation Implementation Plan

**Status:** Deferred sibling-repository proposal, not the active implementation plan for this repository. It targets a separate `design-system` repository and must not be mixed into the current dirty `themes` worktree. Resume `themes` work from [`docs/agent-handoff.md`](../../agent-handoff.md) and the [canonical active plan](2026-07-12-open-design-system.md).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the canonical `Bizarre-Industries/design-system` repository with a tested source-evidence boundary, repository governance, a minimal standards-shaped token seed, deterministic package generation, and release-ready verification without changing the downstream `themes` repository.

**Architecture:** Create a new sibling repository at `../design-system`. Canonical source files live under `brand/`, `foundations/`, and `tokens/source/`; small dependency-free Node.js modules validate and build deterministic outputs into `packages/tokens/`. Published evidence is selected by a tracked allowlist, never by enumerating arbitrary untracked working-tree files.

**Tech Stack:** Git, Node.js 22, npm workspaces, ECMAScript modules, `node:test`, JSON Schema 2020-12, Design Tokens Community Group 2025.10 format, GitHub Actions.

## Global Constraints

- Signal Lime `#C6FF24` is the only brand accent.
- `CATCH THE STARS` is the permanent company tagline, without trailing punctuation.
- The current identity may be refined but must not be replaced or made unrecognizable.
- `design-system` is canonical; `themes` is a downstream consumer and remains unchanged in this milestone.
- Source authority flows from approved brand decisions to canonical tokens, generated packages, and conformance tests.
- Use established platform frameworks; do not create a universal replacement UI runtime.
- WCAG 2.2 AA is the minimum web and first-party product target.
- Published evidence is committed or explicitly allowlisted; untracked workspace files are never packaged.
- Generated output must be deterministic and published atomically.
- Void, Paper, and Void Hi-Contrast are required modes. Workshop and Bone remain canonical optional expressions.
- No production package may depend on the current `themes` repository through a developer-local filesystem path.
- This sibling-repository milestone must not modify, stage, commit, or regenerate files in the current `themes` repository other than this plan document.

## Milestone Boundary

This plan establishes the repository and a minimal token seed. It does not refine the logo, select the proportional typeface, implement product components, migrate `themes`, or claim platform certification. Those are separate milestones because each requires its own visual approval, implementation plan, and acceptance gate.

## Planned File Structure

```text
../design-system/
├── .github/
│   └── workflows/
│       └── verify.yml
├── brand/
│   ├── README.md
│   └── identity.json
├── foundations/
│   └── README.md
├── governance/
│   ├── CONTRIBUTING.md
│   ├── RELEASES.md
│   ├── evidence-allowlist.json
│   └── package-contract.json
├── packages/
│   └── tokens/
│       ├── README.md
│       ├── package.json
│       └── generated/
│           ├── manifest.json
│           ├── tokens.json
│           └── tokens.css
├── schemas/
│   ├── evidence-allowlist.schema.json
│   └── identity.schema.json
├── scripts/
│   ├── build-tokens.mjs
│   ├── check-generated.mjs
│   └── lib/
│       ├── canonical-json.mjs
│       ├── evidence.mjs
│       ├── package-writer.mjs
│       └── token-model.mjs
├── test/
│   ├── build-tokens.test.mjs
│   ├── canonical-json.test.mjs
│   ├── evidence.test.mjs
│   ├── identity.test.mjs
│   └── package-writer.test.mjs
├── tokens/
│   └── source/
│       ├── brand.tokens.json
│       └── modes.tokens.json
├── .editorconfig
├── .gitignore
├── CODEOWNERS
├── LICENSE
├── README.md
├── SECURITY.md
└── package.json
```

---

### Task 1: Bootstrap the canonical repository and governance boundary

**Files:**
- Create: `../design-system/package.json`
- Create: `../design-system/.gitignore`
- Create: `../design-system/.editorconfig`
- Create: `../design-system/README.md`
- Create: `../design-system/LICENSE`
- Create: `../design-system/CODEOWNERS`
- Create: `../design-system/SECURITY.md`
- Create: `../design-system/governance/CONTRIBUTING.md`
- Create: `../design-system/governance/RELEASES.md`
- Test: `../design-system/test/repository-contract.test.mjs`

**Interfaces:**
- Consumes: approved design specification at `./docs/superpowers/specs/2026-07-12-bizarre-industries-design-language.md`.
- Produces: npm scripts `test`, `build`, `check:generated`, and `verify`; workspace `packages/*`; repository policy that `themes` is downstream.

- [ ] **Step 1: Create the repository and failing repository-contract test**

Run:

```bash
mkdir -p ../design-system/test
cd ../design-system
git init -b main
```

Create `test/repository-contract.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('repository declares its canonical boundary and required scripts', async () => {
  const pkg = JSON.parse(await read('package.json'));
  const readme = await read('README.md');
  assert.equal(pkg.private, true);
  assert.deepEqual(pkg.workspaces, ['packages/*']);
  assert.equal(pkg.engines.node, '>=22');
  assert.equal(pkg.scripts.verify, 'npm test && npm run build && npm run check:generated');
  assert.match(readme, /canonical Bizarre Industries design language/i);
  assert.match(readme, /themes.*downstream/i);
});

test('repository ignores local runtime state', async () => {
  const ignore = await read('.gitignore');
  for (const entry of ['node_modules/', '.DS_Store', '.superpowers/', '*.log', '*.tmp']) {
    assert.ok(ignore.split(/\r?\n/).includes(entry), `missing ignore rule: ${entry}`);
  }
});
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run:

```bash
cd ../design-system
node --test test/repository-contract.test.mjs
```

Expected: FAIL with `ENOENT` for `package.json`.

- [ ] **Step 3: Create the root package and repository metadata**

Create `package.json`:

```json
{
  "name": "@bizarre/design-system-workspace",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "license": "MIT",
  "workspaces": ["packages/*"],
  "engines": { "node": ">=22" },
  "scripts": {
    "test": "node --test test/*.test.mjs",
    "build": "node scripts/build-tokens.mjs",
    "check:generated": "node scripts/check-generated.mjs",
    "verify": "npm test && npm run build && npm run check:generated"
  }
}
```

Create `.gitignore` with exactly these initial rules:

```gitignore
node_modules/
.DS_Store
.superpowers/
*.log
*.tmp
coverage/
.build/
DerivedData/
```

Create `.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

Create `README.md`:

```md
# Bizarre Industries Design System

Canonical Bizarre Industries design language for software, hardware, graphics, and media.

Signal Lime is the only brand accent. CATCH THE STARS is the permanent tagline.

This repository publishes the official identity, tokens, assets, framework overlays, and conformance contracts. The `Bizarre-Industries/themes` repository is a downstream third-party theme consumer and must pin a released package from this repository.

## Commands

- `npm test` verifies source and build contracts.
- `npm run build` atomically publishes deterministic local package output.
- `npm run check:generated` verifies generated output without writing.
- `npm run verify` runs the complete local gate.
```

After entering `../design-system`, copy the MIT license text from the sibling themes repository at `../themes/LICENSE` into `LICENSE`, preserving the existing Bizarre Industries copyright line.

Create `CODEOWNERS`:

```text
* @Bizarre-Industries/design-system
/brand/ @Bizarre-Industries/brand
/tokens/ @Bizarre-Industries/design-system
/governance/ @Bizarre-Industries/design-system
```

Create `SECURITY.md`:

```md
# Security

Report suspected vulnerabilities privately through the repository security advisory workflow. Do not include credentials, private customer data, signing material, or local machine state in issues, fixtures, source evidence, generated packages, or screenshots.
```

Create `governance/CONTRIBUTING.md`:

```md
# Contributing

Shared visual decisions change through reviewed canonical sources. Platform packages may expose native capabilities but may not silently introduce shared brand primitives. Generated output is never edited directly. Every change includes a failing contract test, the smallest implementation that passes it, regenerated output when applicable, and a changelog classification.
```

Create `governance/RELEASES.md`:

```md
# Releases

Packages use semantic versioning. Removing or reassigning a public semantic token is breaking. Adding an optional token is minor. Correcting generated bytes without changing the public contract is patch. Every release records package versions, source commit, generated-file hashes, dependency/framework compatibility, licenses, and deprecations.
```

- [ ] **Step 4: Run the repository test and verify it passes**

Run:

```bash
node --test test/repository-contract.test.mjs
```

Expected: `2` tests pass and `0` fail.

- [ ] **Step 5: Commit the repository bootstrap**

```bash
git add package.json .gitignore .editorconfig README.md LICENSE CODEOWNERS SECURITY.md governance test/repository-contract.test.mjs
git commit -m "chore: bootstrap canonical design system repository"
```

---

### Task 2: Define the tracked identity contract

**Files:**
- Create: `../design-system/schemas/identity.schema.json`
- Create: `../design-system/brand/identity.json`
- Create: `../design-system/brand/README.md`
- Create: `../design-system/foundations/README.md`
- Test: `../design-system/test/identity.test.mjs`

**Interfaces:**
- Consumes: permanent brand decisions from the approved specification.
- Produces: identity properties `companyName`, `tagline`, `accent.name`, `accent.value`, `expressions`, and `themeOrder`; later token and asset generators consume this exact shape.

- [ ] **Step 1: Write the failing identity contract test**

Create `test/identity.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));

test('identity preserves permanent Bizarre Industries decisions', async () => {
  const identity = await readJson('brand/identity.json');
  assert.equal(identity.schemaVersion, 1);
  assert.equal(identity.companyName, 'Bizarre Industries');
  assert.equal(identity.tagline, 'CATCH THE STARS');
  assert.deepEqual(identity.accent, { name: 'Signal Lime', value: '#C6FF24' });
  assert.equal(identity.expressions.core, 'Precision Signal');
  assert.equal(identity.expressions.editorial, 'Editorial Monument');
  assert.equal(identity.expressions.physical, 'Workshop Stamp');
  assert.deepEqual(identity.themeOrder, ['void', 'paper', 'void-hicontrast', 'workshop', 'bone']);
});

test('identity schema rejects additional properties', async () => {
  const schema = await readJson('schemas/identity.schema.json');
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.required.sort(), ['accent', 'companyName', 'expressions', 'schemaVersion', 'tagline', 'themeOrder'].sort());
});
```

- [ ] **Step 2: Run the identity test and verify it fails**

Run: `node --test test/identity.test.mjs`

Expected: FAIL with `ENOENT` for `brand/identity.json`.

- [ ] **Step 3: Create the identity schema and canonical record**

Create `schemas/identity.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://bizarre.industries/schemas/identity.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion", "companyName", "tagline", "accent", "expressions", "themeOrder"],
  "properties": {
    "schemaVersion": { "const": 1 },
    "companyName": { "const": "Bizarre Industries" },
    "tagline": { "const": "CATCH THE STARS" },
    "accent": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "value"],
      "properties": {
        "name": { "const": "Signal Lime" },
        "value": { "const": "#C6FF24" }
      }
    },
    "expressions": {
      "type": "object",
      "additionalProperties": false,
      "required": ["core", "editorial", "physical"],
      "properties": {
        "core": { "const": "Precision Signal" },
        "editorial": { "const": "Editorial Monument" },
        "physical": { "const": "Workshop Stamp" }
      }
    },
    "themeOrder": {
      "const": ["void", "paper", "void-hicontrast", "workshop", "bone"]
    }
  }
}
```

Create `brand/identity.json`:

```json
{
  "schemaVersion": 1,
  "companyName": "Bizarre Industries",
  "tagline": "CATCH THE STARS",
  "accent": {
    "name": "Signal Lime",
    "value": "#C6FF24"
  },
  "expressions": {
    "core": "Precision Signal",
    "editorial": "Editorial Monument",
    "physical": "Workshop Stamp"
  },
  "themeOrder": ["void", "paper", "void-hicontrast", "workshop", "bone"]
}
```

Create `brand/README.md`:

```md
# Brand

`identity.json` records approved permanent identity decisions. It is not a logo asset or complete guideline. Precision Signal is the canonical expression; Editorial Monument and Workshop Stamp are controlled derivatives. Identity asset refinement is a separate visually approved milestone.
```

Create `foundations/README.md`:

```md
# Foundations

This directory will contain approved color, typography, geometry, iconography, imagery, motion, sonic, accessibility, and production foundations. Platform implementations consume published contracts and use native framework behavior.
```

- [ ] **Step 4: Run the identity tests and verify they pass**

Run: `node --test test/identity.test.mjs`

Expected: `2` tests pass and `0` fail.

- [ ] **Step 5: Commit the identity contract**

```bash
git add brand foundations schemas/identity.schema.json test/identity.test.mjs
git commit -m "feat: define permanent identity contract"
```

---

### Task 3: Enforce an allowlisted evidence boundary

**Files:**
- Create: `../design-system/schemas/evidence-allowlist.schema.json`
- Create: `../design-system/governance/evidence-allowlist.json`
- Create: `../design-system/scripts/lib/evidence.mjs`
- Test: `../design-system/test/evidence.test.mjs`

**Interfaces:**
- Consumes: repository root URL and tracked allowlist paths.
- Produces: `collectEvidence(rootUrl, allowlist): Promise<Array<{path:string, bytes:number, sha256:string}>>` sorted by raw code-unit path order.

- [ ] **Step 1: Write failing allowlist tests**

Create `test/evidence.test.mjs`:

```js
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import test from 'node:test';
import { collectEvidence } from '../scripts/lib/evidence.mjs';

test('collects only explicit allowlist entries in stable order', async () => {
  const root = await mkdtemp(join(tmpdir(), 'bizarre-evidence-'));
  await mkdir(join(root, '.superpowers'), { recursive: true });
  await writeFile(join(root, 'README.md'), 'brand\n');
  await writeFile(join(root, 'LICENSE'), 'license\n');
  await writeFile(join(root, '.superpowers/server.pid'), '123\n');
  const rows = await collectEvidence(pathToFileURL(`${root}/`), ['README.md', 'LICENSE']);
  assert.deepEqual(rows.map(({ path }) => path), ['LICENSE', 'README.md']);
  assert.ok(rows.every(({ sha256 }) => /^[a-f0-9]{64}$/.test(sha256)));
});

test('rejects escaping, absolute, missing, directory, and symlink entries', async () => {
  const root = await mkdtemp(join(tmpdir(), 'bizarre-evidence-invalid-'));
  await assert.rejects(() => collectEvidence(pathToFileURL(`${root}/`), ['../secret']), /canonical relative path/);
  await assert.rejects(() => collectEvidence(pathToFileURL(`${root}/`), ['/tmp/secret']), /canonical relative path/);
  await assert.rejects(() => collectEvidence(pathToFileURL(`${root}/`), ['missing.txt']), /missing allowlisted evidence/);
});
```

- [ ] **Step 2: Run the evidence tests and verify they fail**

Run: `node --test test/evidence.test.mjs`

Expected: FAIL because `scripts/lib/evidence.mjs` does not exist.

- [ ] **Step 3: Implement the allowlist collector**

Create `scripts/lib/evidence.mjs`:

```js
import { createHash } from 'node:crypto';
import { readFile, lstat } from 'node:fs/promises';

const canonical = /^(?!\/)(?!.*(?:^|\/)\.\.?\/)(?!.*\\)[^\0]+$/;

export async function collectEvidence(rootUrl, allowlist) {
  if (!(rootUrl instanceof URL) || rootUrl.protocol !== 'file:') throw new TypeError('rootUrl must be a file URL');
  if (!Array.isArray(allowlist) || new Set(allowlist).size !== allowlist.length) throw new TypeError('allowlist must contain unique paths');
  const paths = [...allowlist].sort();
  const rows = [];
  for (const path of paths) {
    if (typeof path !== 'string' || !canonical.test(path) || path.split('/').includes('..')) {
      throw new Error(`evidence path must be a canonical relative path: ${String(path)}`);
    }
    const url = new URL(path, rootUrl);
    let stat;
    try { stat = await lstat(url); } catch { throw new Error(`missing allowlisted evidence: ${path}`); }
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`allowlisted evidence must be a regular file: ${path}`);
    const content = await readFile(url);
    rows.push({ path, bytes: content.length, sha256: createHash('sha256').update(content).digest('hex') });
  }
  return rows;
}
```

Create `governance/evidence-allowlist.json`:

```json
{
  "schemaVersion": 1,
  "paths": [
    "LICENSE",
    "README.md",
    "brand/README.md",
    "brand/identity.json",
    "foundations/README.md",
    "governance/CONTRIBUTING.md",
    "governance/RELEASES.md"
  ]
}
```

Create `schemas/evidence-allowlist.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://bizarre.industries/schemas/evidence-allowlist.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion", "paths"],
  "properties": {
    "schemaVersion": { "const": 1 },
    "paths": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "pattern": "^(?!/)(?!.*(?:^|/)\\.\\.?/)(?!.*\\\\)[^\\u0000]+$"
      }
    }
  }
}
```

- [ ] **Step 4: Run the evidence tests and complete suite**

Run:

```bash
node --test test/evidence.test.mjs
npm test
```

Expected: evidence tests pass; complete suite passes.

- [ ] **Step 5: Commit the evidence boundary**

```bash
git add governance/evidence-allowlist.json schemas/evidence-allowlist.schema.json scripts/lib/evidence.mjs test/evidence.test.mjs
git commit -m "feat: enforce allowlisted package evidence"
```

---

### Task 4: Seed standards-shaped brand and mode tokens

**Files:**
- Create: `../design-system/tokens/source/brand.tokens.json`
- Create: `../design-system/tokens/source/modes.tokens.json`
- Create: `../design-system/scripts/lib/token-model.mjs`
- Test: `../design-system/test/token-model.test.mjs`

**Interfaces:**
- Consumes: DTCG-shaped JSON token documents and identity contract.
- Produces: `loadTokenModel(rootUrl): Promise<{brand:object,modes:object}>` and `flattenTokens(model): Array<{path:string,type:string,value:unknown}>`.

- [ ] **Step 1: Write failing token-model tests**

Create `test/token-model.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { loadTokenModel, flattenTokens } from '../scripts/lib/token-model.mjs';

const root = new URL('../', import.meta.url);

test('loads Signal Lime as the sole brand accent', async () => {
  const model = await loadTokenModel(root);
  assert.equal(model.brand.brand.accent.signal.$type, 'color');
  assert.deepEqual(model.brand.brand.accent.signal.$value, {
    colorSpace: 'srgb',
    components: [0.7764705882, 1, 0.1411764706],
    alpha: 1,
    hex: '#C6FF24'
  });
  assert.deepEqual(Object.keys(model.brand.brand.accent), ['signal']);
});

test('defines the five canonical modes and required theme order', async () => {
  const model = await loadTokenModel(root);
  assert.deepEqual(model.modes.$extensions['industries.bizarre'].themeOrder, ['void', 'paper', 'void-hicontrast', 'workshop', 'bone']);
  assert.deepEqual(Object.keys(model.modes.modes).sort(), ['bone', 'paper', 'void', 'void-hicontrast', 'workshop'].sort());
});

test('flattens typed tokens in stable path order', async () => {
  const rows = flattenTokens(await loadTokenModel(root));
  assert.ok(rows.length >= 11);
  assert.deepEqual(rows.map(({ path }) => path), rows.map(({ path }) => path).sort());
  assert.ok(rows.every(({ type }) => type === 'color'));
});
```

- [ ] **Step 2: Run the model tests and verify they fail**

Run: `node --test test/token-model.test.mjs`

Expected: FAIL because `token-model.mjs` does not exist.

- [ ] **Step 3: Create the minimal DTCG-shaped source files**

Create `tokens/source/brand.tokens.json` with one `brand.accent.signal` color token using the exact value from the test. Include `$description: "The sole Bizarre Industries brand accent."`.

Create `tokens/source/modes.tokens.json` with `$extensions.industries.bizarre.themeOrder` and five mode groups. Each mode contains typed color tokens for `surface.canvas` and `text.primary` using these approved seed values:

```text
void: surface #0E0E0E, text #E4E4E4
paper: surface #F9F8F2, text #1F1F1F
void-hicontrast: surface #000000, text #F9F8F2
workshop: surface #1A1815, text #E4E2DA
bone: surface #F5F2EA, text #2B2B2B
```

Represent every color as `{ "colorSpace":"srgb", "components":[...], "alpha":1, "hex":"#RRGGBB" }`. Calculate components as channel integer divided by 255 and record ten decimal places at most.

Create `scripts/lib/token-model.mjs` that reads both documents, recursively identifies objects with `$value`, inherits `$type` from the nearest group, rejects untyped tokens, rejects duplicate flattened paths, and returns rows sorted by path.

- [ ] **Step 4: Run the model tests and verify they pass**

Run:

```bash
node --test test/token-model.test.mjs
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit the token seed**

```bash
git add tokens/source scripts/lib/token-model.mjs test/token-model.test.mjs
git commit -m "feat: seed canonical brand and mode tokens"
```

---

### Task 5: Build deterministic token package bytes

**Files:**
- Create: `../design-system/scripts/lib/canonical-json.mjs`
- Create: `../design-system/scripts/build-tokens.mjs`
- Create: `../design-system/scripts/check-generated.mjs`
- Create: `../design-system/packages/tokens/package.json`
- Create: `../design-system/packages/tokens/README.md`
- Test: `../design-system/test/canonical-json.test.mjs`
- Test: `../design-system/test/build-tokens.test.mjs`

**Interfaces:**
- Consumes: `loadTokenModel`, `flattenTokens`, `collectEvidence`.
- Produces: byte map from `buildExpected(rootUrl): Promise<Map<string,Buffer>>`; generated `tokens.json`, `tokens.css`, and `manifest.json`.

- [ ] **Step 1: Write failing canonical JSON and builder tests**

Create `test/canonical-json.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalJson } from '../scripts/lib/canonical-json.mjs';

test('sorts object keys recursively and preserves array order', () => {
  assert.equal(canonicalJson({ z: 1, a: { y: 2, x: 3 }, list: ['b', 'a'] }), '{\n  "a": {\n    "x": 3,\n    "y": 2\n  },\n  "list": [\n    "b",\n    "a"\n  ],\n  "z": 1\n}\n');
});
```

Create `test/build-tokens.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildExpected } from '../scripts/build-tokens.mjs';

const root = new URL('../', import.meta.url);

test('builds exact token package files', async () => {
  const files = await buildExpected(root);
  assert.deepEqual([...files.keys()], ['generated/tokens.css', 'generated/tokens.json', 'generated/manifest.json']);
  const css = files.get('generated/tokens.css').toString('utf8');
  assert.match(css, /--bzr-brand-accent-signal: #C6FF24;/);
  assert.match(css, /\[data-bizarre-theme="paper"\]/);
  const manifest = JSON.parse(files.get('generated/manifest.json'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.package, '@bizarre/tokens');
  assert.ok(manifest.evidence.every(({ path }) => !path.startsWith('.superpowers/')));
});
```

- [ ] **Step 2: Run the builder tests and verify they fail**

Run: `node --test test/canonical-json.test.mjs test/build-tokens.test.mjs`

Expected: FAIL because the imported modules do not exist.

- [ ] **Step 3: Implement canonical serialization and expected-byte generation**

Create `scripts/lib/canonical-json.mjs`:

```js
function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortValue(value[key])]));
  }
  return value;
}

export const canonicalJson = (value) => `${JSON.stringify(sortValue(value), null, 2)}\n`;
```

Create `scripts/build-tokens.mjs` with exported `buildExpected(rootUrl)`. It must:

1. load and flatten source tokens;
2. read `governance/evidence-allowlist.json`;
3. call `collectEvidence` using only its `paths`;
4. emit canonical source data to `generated/tokens.json`;
5. emit `:root` CSS for brand tokens and one `[data-bizarre-theme="id"]` block per mode;
6. emit `manifest.json` containing `schemaVersion`, package name, SHA-256 for the two generated payload files, and the allowlisted evidence records;
7. return a map whose keys are sorted and whose values are Buffers;
8. when executed directly, pass the map to the package writer from Task 6.

Create `scripts/check-generated.mjs` to call `buildExpected`, compare exact bytes against `packages/tokens/`, print sorted missing/modified/obsolete paths, perform no writes, and exit `1` on drift.

Create `packages/tokens/package.json`:

```json
{
  "name": "@bizarre/tokens",
  "version": "0.1.0",
  "type": "module",
  "license": "MIT",
  "files": ["generated", "README.md"],
  "exports": {
    "./tokens.json": "./generated/tokens.json",
    "./tokens.css": "./generated/tokens.css",
    "./manifest.json": "./generated/manifest.json"
  }
}
```

Create `packages/tokens/README.md` documenting that this is an initial foundation package, not a complete semantic or component contract, and that consumers must pin a released version.

- [ ] **Step 4: Run the serialization and builder tests**

Run: `node --test test/canonical-json.test.mjs test/build-tokens.test.mjs`

Expected: all tests pass.

- [ ] **Step 5: Commit deterministic package construction**

```bash
git add scripts/lib/canonical-json.mjs scripts/build-tokens.mjs scripts/check-generated.mjs packages/tokens test/canonical-json.test.mjs test/build-tokens.test.mjs
git commit -m "feat: build deterministic token package bytes"
```

---

### Task 6: Publish generated output atomically

**Files:**
- Create: `../design-system/scripts/lib/package-writer.mjs`
- Test: `../design-system/test/package-writer.test.mjs`
- Modify: `../design-system/scripts/build-tokens.mjs`

**Interfaces:**
- Consumes: `writePackage(packageUrl, expectedFiles): Promise<void>` where `expectedFiles` is `Map<string,Buffer>`.
- Produces: atomic directory replacement with preflight protection against unowned or locally modified output.

- [ ] **Step 1: Write failing atomic-writer tests**

Create `test/package-writer.test.mjs` with separate tests proving:

```js
await writePackage(packageUrl, new Map([
  ['generated/tokens.css', Buffer.from(':root {}\n')],
  ['generated/manifest.json', Buffer.from('{"schemaVersion":1}\n')]
]));
```

must:

1. publish every expected file with exact bytes;
2. write the manifest last;
3. leave the previous package unchanged when staging fails;
4. refuse to overwrite an unowned file;
5. refuse to follow symlink leaves or parents;
6. remove only obsolete files whose prior hashes match the old manifest;
7. clean its own temporary directory after success or failure.

Use `mkdtemp`, temporary package roots, `symlink`, and injected filesystem-operation hooks rather than timing-based tests.

- [ ] **Step 2: Run the writer tests and verify they fail**

Run: `node --test test/package-writer.test.mjs`

Expected: FAIL because `package-writer.mjs` does not exist.

- [ ] **Step 3: Implement staged atomic publication**

Create `scripts/lib/package-writer.mjs` with this contract:

```js
export async function writePackage(packageUrl, expectedFiles, options = {})
```

Implementation requirements:

- validate every expected path as canonical, relative, unique, and non-colliding under case-folding;
- preflight the current manifest and reject invalid ownership data;
- reject symlinks and special files without following them;
- stage the complete expected tree in a sibling temporary directory;
- fsync staged file descriptors and the staged directory;
- validate all staged hashes;
- rename the current generated directory to a rollback name, rename staged output into place, and restore the prior directory if the final rename fails;
- publish `manifest.json` only after payload validation;
- remove only writer-created temporary paths;
- re-read and hash every final output before returning.

Modify direct execution in `scripts/build-tokens.mjs` to call `writePackage(new URL('../packages/tokens/', import.meta.url), await buildExpected(root))`.

- [ ] **Step 4: Run writer tests, build, and drift check**

Run:

```bash
node --test test/package-writer.test.mjs
npm run build
npm run check:generated
npm test
```

Expected: all tests pass; build publishes three generated files; drift check prints `generated token package is current`.

- [ ] **Step 5: Commit the atomic publisher and generated seed**

```bash
git add scripts/lib/package-writer.mjs scripts/build-tokens.mjs test/package-writer.test.mjs packages/tokens/generated
git commit -m "feat: publish token package atomically"
```

---

### Task 7: Add package, provenance, and CI contracts

**Files:**
- Create: `../design-system/governance/package-contract.json`
- Create: `../design-system/test/package-contract.test.mjs`
- Create: `../design-system/.github/workflows/verify.yml`
- Modify: `../design-system/governance/evidence-allowlist.json`

**Interfaces:**
- Consumes: generated token manifest, npm package metadata, GitHub checkout.
- Produces: CI gate on Node 22 and a machine-readable public package contract.

- [ ] **Step 1: Write the failing package-contract test**

Create `test/package-contract.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));

test('package contract identifies the canonical package and downstream boundary', async () => {
  const contract = await readJson('governance/package-contract.json');
  assert.equal(contract.schemaVersion, 1);
  assert.equal(contract.canonicalRepository, 'Bizarre-Industries/design-system');
  assert.deepEqual(contract.packages, ['@bizarre/tokens']);
  assert.equal(contract.downstream.themes.repository, 'Bizarre-Industries/themes');
  assert.equal(contract.downstream.themes.policy, 'pin-released-version');
});

test('CI runs the complete verification gate on Node 22', async () => {
  const workflow = await readFile(new URL('../.github/workflows/verify.yml', import.meta.url), 'utf8');
  assert.match(workflow, /node-version: 22/);
  assert.match(workflow, /run: npm ci/);
  assert.match(workflow, /run: npm run verify/);
});
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run: `node --test test/package-contract.test.mjs`

Expected: FAIL with `ENOENT` for `governance/package-contract.json`.

- [ ] **Step 3: Create package contract and CI workflow**

Create `governance/package-contract.json`:

```json
{
  "schemaVersion": 1,
  "canonicalRepository": "Bizarre-Industries/design-system",
  "packages": ["@bizarre/tokens"],
  "requiredModes": ["void", "paper", "void-hicontrast"],
  "optionalModes": ["workshop", "bone"],
  "downstream": {
    "themes": {
      "repository": "Bizarre-Industries/themes",
      "policy": "pin-released-version"
    }
  }
}
```

Create `.github/workflows/verify.yml`:

```yaml
name: Verify

on:
  push:
  pull_request:

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run verify
```

Add `governance/package-contract.json` to the sorted evidence allowlist. Run `npm run build` so its hash is recorded in the generated manifest.

- [ ] **Step 4: Verify the complete repository gate**

Run:

```bash
npm install --package-lock-only
npm run verify
npm pack --dry-run --workspace @bizarre/tokens
git status --short
```

Expected:

- all tests pass;
- build succeeds;
- drift check reports current output;
- dry-run archive contains only `package.json`, `README.md`, and three `generated/` files;
- status lists only files intended for this task.

- [ ] **Step 5: Commit CI and package contracts**

```bash
git add .github governance/package-contract.json governance/evidence-allowlist.json test/package-contract.test.mjs package-lock.json packages/tokens/generated
git commit -m "ci: verify canonical package and provenance contracts"
```

---

### Task 8: Audit the completed milestone and publish the next-plan inputs

**Files:**
- Create: `../design-system/docs/foundation-audit.md`
- Create: `../design-system/docs/next-milestones.md`
- Test: `../design-system/test/documentation-contract.test.mjs`

**Interfaces:**
- Consumes: completed repository, package manifest, approved master specification.
- Produces: verified milestone report and ordered specifications required before further implementation.

- [ ] **Step 1: Write the failing documentation-contract test**

Create `test/documentation-contract.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('foundation audit reports limits and next milestone order', async () => {
  const audit = await readFile(new URL('../docs/foundation-audit.md', import.meta.url), 'utf8');
  const next = await readFile(new URL('../docs/next-milestones.md', import.meta.url), 'utf8');
  assert.match(audit, /does not claim.*complete design system/i);
  assert.match(audit, /allowlisted evidence/i);
  assert.match(next, /1\. Identity refinement/);
  assert.match(next, /2\. Semantic token architecture/);
  assert.match(next, /3\. Web foundation and Mission Control/);
});
```

- [ ] **Step 2: Run the documentation test and verify it fails**

Run: `node --test test/documentation-contract.test.mjs`

Expected: FAIL because `docs/foundation-audit.md` does not exist.

- [ ] **Step 3: Write the milestone audit and next-plan list**

Create `docs/foundation-audit.md` containing:

- exact verification commands and results;
- repository commit ID;
- package file list and hashes;
- evidence allowlist entries;
- confirmation that transient `.superpowers` state is excluded;
- explicit statement that this milestone does not claim a complete design system, component library, platform certification, or finished identity;
- any discovered blockers, without placeholders.

Create `docs/next-milestones.md` with this order:

```md
# Next Milestones

1. Identity refinement and production asset system.
2. Semantic token architecture and proportional typography selection.
3. Web foundation and Bizarre Mission Control.
4. BizarreUI and Bizarre Field Unit for Apple platforms.
5. Android Compose overlay and Bizarre Field Unit parity.
6. Desktop, Qt, LVGL, embedded, hardware, and Bizarre Instrument.
7. Graphics, motion, sonic, and media identity.
8. Downstream `themes` migration and compatibility release.
9. Cross-platform certification and public v1 release.
```

- [ ] **Step 4: Run final verification and inspect the package**

Run:

```bash
npm run verify
npm pack --dry-run --workspace @bizarre/tokens
git diff --check
git status --short
```

Expected: every command succeeds; no generated drift; only the two documentation files and their test are uncommitted.

- [ ] **Step 5: Commit the verified milestone report**

```bash
git add docs test/documentation-contract.test.mjs
git commit -m "docs: record design system foundation milestone"
```

## Completion Gate

Before declaring this plan complete, independently verify:

```bash
cd ../design-system
npm ci
npm run verify
npm pack --dry-run --workspace @bizarre/tokens
git status --short --branch
```

Required outcome:

- all tests pass from a clean dependency install;
- generated output exactly matches source;
- package dry run contains no local runtime state or unrelated workspace evidence;
- Git working tree is clean;
- repository history contains one focused commit per task;
- the current themes repository has not been changed by sibling-plan execution, except for this plan document.
