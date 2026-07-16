# Bizarre Industries Open Design System Implementation Plan

**Status:** Canonical active plan. Tasks 1 through 8 are implemented and verified for the repo-owned downstream themes adapter. Official Bizarre Industries brand convergence remains deferred to the canonical `design-system` repository and explicit product decisions recorded in the handoff.

**Resume source:** Read [`docs/agent-handoff.md`](../../agent-handoff.md) before executing this plan. Its current-state ledger overrides historical progress reports. The detailed checkboxes below remain the implementation recipe, not a reliable record of current completion.

## Reconciled Status (2026-07-16T23:31:54+04:00)

| Area | State | Evidence |
|---|---|---|
| Tasks 1-6 | COMPLETE | Repository contracts pass 129/129. Open Design contracts pass 92/92. Generated repository outputs are current. |
| Task 7, package generation and visual QA | COMPLETE | The package owns 515 files, indexes 474 repository evidence files, includes `system/kit.html`, excludes transient brainstorm state and the volatile handoff, and passes package, showcase, and visual checks. |
| Task 8, Open Design migration | COMPLETE | The former catalog entry is preserved in a timestamped backup. Supported local installation produced one repo symlink, activation created project `ds-bizarre-industries`, metadata remained byte-identical, and a fresh MCP bridge passed protocol `2025-11-25` with 18 tools. |
| Release | IN PROGRESS | The user authorized final verification, signed-off commits, a reviewed pull request, merge, and cleanup to one `main` worktree. Release results belong in the authoritative handoff and final task report. |

**First unfinished implementation task:** NONE inside this plan. All authorized Open Design adapter implementation and migration work is complete. Remaining product decisions are explicitly deferred, not silently assumed.

## Current Safety Gate

Resolved: all `.superpowers/brainstorm/` runtime and identity UI is excluded by contract, temporary Git fixture commits disable signing locally, and `docs/agent-handoff.md` is excluded to prevent circular package freshness drift. The approved identity remains in the canonical specifications, not transient brainstorm HTML.

Resolved: generated `metadata.json` contains `ds-bizarre-industries`; the identifier was absent before activation and was created intentionally by Open Design. The active catalog path is the expected repo symlink, and metadata stayed byte-identical through activation.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Generate, verify, and safely install one repo-owned downstream Bizarre Industries themes adapter for Open Design v1 whose default binding is Void, whose previews expose all five CSS modes, and whose evidence layer preserves the complete current repository context.

**Architecture:** `palette.js` remains canonical for the `themes` repository. It is not the company-wide identity authority. Focused CommonJS modules build a pure token model, enumerate and hash repository evidence, render the Open Design package, and publish files atomically behind a stable directory. Open Design receives a published agent-managed local symlink after the existing extracted system is preserved. The official logo, typography, and identity contract remain governed by the sibling `design-system` repository until a reviewed downstream integration exists.

**Tech Stack:** Node.js 22, CommonJS, node:test, PostCSS, existing WCAG helpers, Playwright only for the repository's existing deterministic browser checks, Open Design 0.14.1 v1 package schema, and the installed Open Design stdio MCP bridge.

## Global Constraints

- Repository-local source of truth: `./palette.js`.
- Package root: design/open-design/bizarre-industries.
- Open Design schema: od-design-system-project/v1.
- One Open Design catalog system; Void is the Open Design default.
- Five artifact-level selectors: void, void-hicontrast, workshop, paper, bone.
- Open Design 0.14.1 has no native internal-mode picker; never describe the four non-default selectors as picker modes.
- tokens.css declares only the 56 Open Design TOKEN_SCHEMA names; Bizarre-only roles live in assets/bizarre-tokens.css so Open Design's declared-assets allowlist can serve and pull them.
- Preserve the full README byte-for-byte in source evidence and promote its product rules into DESIGN.md.
- Include every current non-ignored repository file or an explicit, tested exclusion.
- Exclude .git, node_modules except selected fonts/licenses, the package output itself, caches, ignored private files, AGENTS.md, the volatile `docs/agent-handoff.md`, `.superpowers/brainstorm/`, removed Xcode files, and removed native captures.
- Preserve the current static GitHub catalog and future-website boundary.
- metadata.json must set status published, artifactMode agent-managed, and the deterministic collision-checked projectId ds-bizarre-industries.
- Package writes are atomic per file; package-files.json is written last.
- Never modify /Applications/Open Design.app.
- Preserve the backed-up former user:bizarre-industries directory and the separate brand-github-29e67b project. Never reuse that old project for the repo-linked package.
- Release may use a signed-off branch, pull request, review, merge, and cleanup because the user explicitly authorized that workflow on 2026-07-16. Never force-push or discard user work.

---

## File Map

### New implementation modules

- scripts/lib/open-design/model.cjs — pure canonical token and mode model.
- scripts/lib/open-design/evidence.cjs — safe repository enumeration, classification, hashing, and evidence mapping.
- scripts/lib/open-design/package-writer.cjs — package ownership, atomic per-file publication, and read-only check mode.
- scripts/lib/open-design/render-tokens.cjs — tokens.css, assets/bizarre-tokens.css, design-tokens.json, and tailwind-v4.css.
- scripts/lib/open-design/render-docs.cjs — manifest.json, metadata.json, DESIGN.md, USAGE.md, and source reports.
- scripts/lib/open-design/render-components.cjs — components.html, compatible component manifest, and nine preview pages.
- scripts/lib/open-design/fonts.cjs — selected local Monaspace font and license inventory.
- scripts/generate-open-design.cjs — captured orchestration CLI, output publication, and read-only `--check` mode.

### New tests

- test/open-design-model.test.cjs
- test/open-design-evidence.test.cjs
- test/open-design-writer.test.cjs
- test/open-design-renderers.test.cjs
- test/open-design-package.test.cjs

### Modified repository integration

- package.json
- package-lock.json
- .github/workflows/verify.yml
- README.md
- design/README.md
- docs/superpowers/specs/2026-07-12-open-design-system-design.md

### Generated package

- design/open-design/bizarre-industries/**

---

### Task 1: Lock the Canonical Model and Open Design Token Contract

**Task status:** COMPLETE.

**Files:**

- Create: test/open-design-model.test.cjs
- Create: scripts/lib/open-design/model.cjs

**Interfaces:**

- Consumes: palette.js exports brand, fonts, syntax, status, ansi, variants, and variantOrder; showcase/showcase.css text.
- Produces:
  - OD_SCHEMA_TOKENS: frozen array of 56 Open Design token names.
  - buildOpenDesignModel({ palette, showcaseCss }): DesignSystemModel.
  - chooseOnFill(background): contrast-selected #0E0E0E or #F9F8F2.
  - DesignSystemModel.defaultMode: void.
  - DesignSystemModel.modes[id].od: exact 56-token object.
  - DesignSystemModel.modes[id].bizarre: brand, syntax, status, ANSI, and cursor tokens.
  - DesignSystemModel.derived: value plus provenance for structure-only tokens.

- [x] **Step 1: Write the failing model contract**

Create test/open-design-model.test.cjs with assertions equivalent to:

~~~~javascript
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const palette = require('../palette.js');

const root = path.resolve(__dirname, '..');

test('Open Design model exposes the exact schema and five artifact modes', () => {
  const { OD_SCHEMA_TOKENS, buildOpenDesignModel } =
    require('../scripts/lib/open-design/model.cjs');
  const model = buildOpenDesignModel({
    palette,
    showcaseCss: fs.readFileSync(path.join(root, 'showcase/showcase.css'), 'utf8'),
  });

  assert.equal(OD_SCHEMA_TOKENS.length, 56);
  assert.equal(new Set(OD_SCHEMA_TOKENS).size, 56);
  assert.equal(model.defaultMode, 'void');
  assert.deepEqual(Object.keys(model.modes), palette.variantOrder);
  for (const id of palette.variantOrder) {
    assert.deepEqual(Object.keys(model.modes[id].od).sort(), [...OD_SCHEMA_TOKENS].sort());
  }
});

test('Void is the root contract and modes preserve accent semantics', () => {
  const { buildOpenDesignModel } = require('../scripts/lib/open-design/model.cjs');
  const model = buildOpenDesignModel({
    palette,
    showcaseCss: fs.readFileSync(path.join(root, 'showcase/showcase.css'), 'utf8'),
  });

  assert.equal(model.modes.void.od['--bg'], palette.variants.void.bg);
  assert.equal(model.modes.void.od['--accent'], palette.variants.void.accent);
  assert.equal(model.modes.paper.od['--accent'], palette.variants.paper.accent);
  assert.equal(model.modes.paper.bizarre['--bzr-accent-text'], palette.variants.paper.accentText);
  assert.notEqual(model.modes.paper.od['--accent-on'], palette.variants.paper.accentText);
});

test('Open Design fallbacks are replaced by source-backed or explicit neutral values', () => {
  const { buildOpenDesignModel } = require('../scripts/lib/open-design/model.cjs');
  const model = buildOpenDesignModel({
    palette,
    showcaseCss: fs.readFileSync(path.join(root, 'showcase/showcase.css'), 'utf8'),
  });
  const rootTokens = model.modes.void.od;

  assert.equal(rootTokens['--font-body'], palette.fonts.prose);
  assert.equal(rootTokens['--motion-fast'], '0ms');
  assert.equal(rootTokens['--motion-base'], '0ms');
  assert.equal(rootTokens['--ease-standard'], 'linear');
  assert.equal(rootTokens['--radius-pill'], '2px');
  assert.equal(rootTokens['--container-max'], '100%');
  assert.equal(model.derived['--section-y-desktop'].source, 'showcase/showcase.css:.section');
});
~~~~

- [x] **Step 2: Run the focused test and capture RED**

Run:

~~~~bash
node --test test/open-design-model.test.cjs
~~~~

Expected: FAIL with MODULE_NOT_FOUND for scripts/lib/open-design/model.cjs.

- [x] **Step 3: Implement the pure model**

Create scripts/lib/open-design/model.cjs. Define OD_SCHEMA_TOKENS in the exact Open Design 0.14.1 order:

~~~~javascript
const OD_SCHEMA_TOKENS = Object.freeze([
  '--bg', '--surface', '--surface-warm',
  '--fg', '--fg-2', '--muted', '--meta',
  '--border', '--border-soft',
  '--accent', '--accent-on', '--accent-hover', '--accent-active',
  '--success', '--warn', '--danger',
  '--font-display', '--font-body', '--font-mono',
  '--text-xs', '--text-sm', '--text-base', '--text-lg',
  '--text-xl', '--text-2xl', '--text-3xl', '--text-4xl',
  '--leading-body', '--leading-tight', '--tracking-display',
  '--space-1', '--space-2', '--space-3', '--space-4',
  '--space-5', '--space-6', '--space-8', '--space-12',
  '--section-y-desktop', '--section-y-tablet', '--section-y-phone',
  '--radius-sm', '--radius-md', '--radius-lg', '--radius-pill',
  '--elev-flat', '--elev-ring', '--elev-raised', '--focus-ring',
  '--motion-fast', '--motion-base', '--ease-standard',
  '--container-max', '--container-gutter-desktop',
  '--container-gutter-tablet', '--container-gutter-phone',
]);
~~~~

Use WCAG relative luminance for chooseOnFill. Build each mode from the actual palette values. Use these explicit derived values and provenance:

~~~~javascript
const DERIVED = Object.freeze({
  '--text-xs': ['10px', 'showcase/showcase.css:.lime-meta'],
  '--text-sm': ['11px', 'showcase/showcase.css:.eyebrow'],
  '--text-base': ['13px', 'showcase/showcase.css:.code'],
  '--text-lg': ['17px', 'showcase/showcase.css:.lede'],
  '--text-xl': ['18px', 'showcase/showcase.css:.variant-name'],
  '--text-2xl': ['30px', 'showcase/showcase.css:.section-title'],
  '--text-3xl': ['48px', 'showcase/showcase.css:.h1 minimum'],
  '--text-4xl': ['96px', 'showcase/showcase.css:.h1 maximum'],
  '--leading-body': ['1.6', 'showcase/showcase.css:.lede'],
  '--leading-tight': ['0.94', 'showcase/showcase.css:.h1'],
  '--tracking-display': ['0', 'showcase/showcase.css:.h1'],
  '--space-1': ['4px', 'showcase/showcase.css:.mini-ansi gap'],
  '--space-2': ['8px', 'showcase/showcase.css:.ansi-cell padding'],
  '--space-3': ['12px', 'showcase/showcase.css:.eyebrow gap'],
  '--space-4': ['16px', 'showcase/showcase.css:.slogan-strip padding'],
  '--space-5': ['18px', 'showcase/showcase.css:.hero-meta gap'],
  '--space-6': ['24px', 'showcase/showcase.css:.section-head gap'],
  '--space-8': ['32px', 'showcase/showcase.css:.section-head margin'],
  '--space-12': ['56px', 'showcase/showcase.css:.hero-grid gap'],
  '--section-y-desktop': ['88px', 'showcase/showcase.css:.section'],
  '--section-y-tablet': ['88px', 'showcase/showcase.css:.section'],
  '--section-y-phone': ['88px', 'showcase/showcase.css:.section'],
  '--radius-sm': ['2px', 'showcase/showcase.css:.pill'],
  '--radius-md': ['4px', 'showcase/showcase.css:.lime-swatch'],
  '--radius-lg': ['6px', 'showcase/showcase.css:.variant-card'],
  '--radius-pill': ['2px', 'showcase/showcase.css:.pill'],
  '--container-max': ['100%', 'showcase/showcase.css full-width sections'],
  '--container-gutter-desktop': ['64px', 'showcase/showcase.css:.section'],
  '--container-gutter-tablet': ['20px', 'showcase/showcase.css media rule'],
  '--container-gutter-phone': ['20px', 'showcase/showcase.css media rule'],
});
~~~~

Set accent hover/active to the current accent, elevation to none except the hairline ring, general motion to 0ms/linear, and focus to a two-pixel accent ring with derived/accessibility provenance.

- [x] **Step 4: Run model and existing contrast contracts**

Run:

~~~~bash
node --test test/open-design-model.test.cjs test/contrast.test.cjs
~~~~

Expected: all tests PASS.

- [x] **Step 5: Checkpoint without committing**

Run:

~~~~bash
git diff --check -- scripts/lib/open-design/model.cjs test/open-design-model.test.cjs
git status --short
~~~~

Expected: no whitespace errors; only intended files plus the previously audited working tree are present.

---

### Task 2: Build Complete, Safe Repository Evidence

**Task status:** COMPLETE.

**Files:**

- Create: test/open-design-evidence.test.cjs
- Create: scripts/lib/open-design/evidence.cjs

**Interfaces:**

- Consumes: repository root, generated-files.json, package root.
- Produces:
  - DEFAULT_EVIDENCE_LIMITS: `{ perFileBytes: 8388608, aggregateBytes: 67108864 }`.
  - listRepositoryEvidence({ root, packageRoot, limits? }): EvidenceEntry[].
  - copyEvidenceEntry({ root, stageRoot, entry, limits? }): void.
  - renderEvidenceIndex(entries): JSON string.
  - EvidenceEntry fields: sourcePath, packagePath, kind, bytes, sha256, classification, generated.

- [x] **Step 1: Write evidence RED tests**

The temp repository test must initialize Git, create tracked and untracked files, delete one tracked file, add ignored files, add a symlink, add AGENTS.md, and create a package-output directory. Assert:

~~~~javascript
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
~~~~

Also assert the Bizarre badge maps to assets/brand/bizarre-badge.svg, generated ownership is taken from generated-files.json, and source files are sorted by raw code-unit order.

- [x] **Step 2: Run the evidence test and capture RED**

Run:

~~~~bash
node --test test/open-design-evidence.test.cjs
~~~~

Expected: FAIL with MODULE_NOT_FOUND.

- [x] **Step 3: Implement Git-aware enumeration**

Use:

~~~~javascript
spawnSync('git', [
  'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--',
], { cwd: root, encoding: 'buffer' });
~~~~

Rules:

- split NUL-delimited paths;
- raw-sort with left < right rather than localeCompare;
- reject absolute paths, dot segments, NULs, and root escapes;
- lstat every path and include regular files only;
- omit missing tracked deletions;
- reject any symlink rather than following it;
- exclude design/open-design/bizarre-industries and its temporary siblings;
- exclude any segment equal to AGENTS.md case-insensitively;
- map current browser PNGs to assets/showcase;
- map the Bizarre badge to assets/brand;
- map every other file to source/snippets/repo at the same relative path;
- read bytes once, then record size and SHA-256 from those bytes;
- fail if the file changes between stat and copy;
- read generated-files.json only when it is valid version 2.

Apply explicit evidence-ingestion ceilings of 8 MiB per file and 64 MiB aggregate. The final pre-release inventory contains 474 files; its exact aggregate byte count is generated in `source/scanned-files.json` instead of copied into this evidence-bearing plan, avoiding a self-referential freshness claim. The 243,136-byte largest file leaves 34.5x per-file headroom, and aggregate headroom remains greater than 16x. Accept an injectable `{ perFileBytes, aggregateBytes }` object of non-negative safe integers for boundary tests. Enforce the per-file limit from descriptor `fstat` before reading content and recheck it after; preflight and reconcile the aggregate during enumeration before the builder or package writer can create output. Equality passes. Max-plus-one failures must report the exact path, observed bytes, and limit and must never silently omit a source.

Use classification precedence generated ownership > test path > image extension > font extension > documentation extension/name > port/adapter top-level path > canonical fallback. Keep kind as a separate deterministic extension/media label. renderEvidenceIndex returns a pretty-printed JSON array with one trailing newline and no envelope object.

Filesystem threat model: repository and staging roots are trusted, user-owned parents and are not adversarially swapped during generation. Reject every symlink and parent/leaf identity change observable before or after I/O, and test ordinary parent replacement. Do not claim portable descriptor-relative containment against a malicious same-user race because Node does not expose `openat` traversal across supported hosts.

- [x] **Step 4: Run evidence tests**

Run:

~~~~bash
node --test test/open-design-evidence.test.cjs
~~~~

Expected: PASS, including symlink refusal and byte-identical README copying.

- [x] **Step 5: Checkpoint without committing**

Run git diff --check on the two task files and inspect status.

---

### Task 3: Publish Package Files Without Clobbering User Work

**Task status:** COMPLETE.

**Files:**

- Create: test/open-design-writer.test.cjs
- Create: scripts/lib/open-design/package-writer.cjs

**Interfaces:**

- Consumes: Map of package-relative path to Buffer.
- Produces:
  - createPackageWriter({ packageRoot, check }): { add, finish }.
  - add(path, bytes): records one expected regular file.
  - finish(): [] in clean state or sorted dirty paths in check mode.
  - package-files.json version 1 with sorted file and sha256 entries.

- [x] **Step 1: Write writer RED tests**

Cover:

- stable sorted manifest;
- text and binary bytes;
- package-files.json excluded from its own inventory;
- atomic temp-file rename leaves no .tmp files;
- check mode performs no writes;
- missing, modified, and obsolete files are reported;
- modified owned files are preserved and generation fails;
- unowned files in an existing package cause generation to fail;
- previous invalid ownership manifest causes generation to fail;
- symlink leaf and symlink parent are rejected;
- AGENTS.md paths are rejected;
- obsolete unchanged owned files are removed only after all expected bytes validate.

- [x] **Step 2: Run writer tests and capture RED**

Run:

~~~~bash
node --test test/open-design-writer.test.cjs
~~~~

Expected: FAIL with MODULE_NOT_FOUND.

- [x] **Step 3: Implement stable-directory atomic writes**

Implement same-directory temporary files:

~~~~javascript
function atomicWrite(file, bytes) {
  const temp = path.join(
    path.dirname(file),
    '.' + path.basename(file) + '.tmp-' + process.pid + '-' + crypto.randomUUID(),
  );
  const fd = fs.openSync(temp, fs.constants.O_WRONLY | fs.constants.O_CREAT |
    fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW || 0), 0o666);
  try {
    fs.writeFileSync(fd, bytes);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(temp, file);
}
~~~~

Before any write, validate the complete expected map, previous ownership, modified owned files, unowned files, parent directories, and symlinks. Write normal files in sorted order, remove only unchanged obsolete owned files, then publish package-files.json last.

Use two strict phases: complete read-only preflight, then mutation. The canonical manifest is exact version 1 pretty-printed JSON plus one newline, exact keys only, unique safe POSIX-relative paths sorted by raw code-unit order, lowercase 64-hex hashes, and no self-entry. A missing/empty root is bootstrap; a non-empty root without the manifest is unowned and fails. `add()` rejects raw or case-folded collisions, empty/absolute/dot/repeated/trailing/backslash/NUL paths, case-insensitive `package-files.json`, and any case-insensitive AGENTS.md segment, and it copies each Buffer defensively.

Check mode returns unique dirty package-relative paths sorted by raw code unit and never writes. Invalid manifests, unowned paths, symlinks, special files, and observed identity races are hard errors in both modes. Revalidate obsolete files immediately before unlink. Clean a temporary file after every pre-rename failure without masking the original error. Preserve the old manifest after every earlier failure and make its rename the final package-root content mutation.

Treat directories as implicit writer structure only when they prefix a prior-manifest or currently expected file. Arbitrary pre-existing directories are unowned even if empty. After obsolete-file deletion, prune empty prior-owned directories deepest-first only when they are no longer expected prefixes. Never remove an unrelated or nonempty directory. Track whether the current invocation actually created a temporary file before cleanup, and revalidate expected bytes immediately before and after final manifest publication. Treat the resolved packageRoot parent as the trusted boundary: reject a symlink/non-directory packageRoot and every descendant, but do not walk or reject lexical ancestors such as macOS `/var`.

Do not add an automatic transaction journal. Per-file atomicity is the reviewed boundary: a mid-run host I/O failure leaves the old manifest, and a later run fails closed on exact drift for manual inspection rather than guessing that partial output is owned.

- [x] **Step 4: Run writer tests**

Run:

~~~~bash
node --test test/open-design-writer.test.cjs
~~~~

Expected: PASS.

- [x] **Step 5: Checkpoint without committing**

Run git diff --check and inspect status.

---

### Task 4: Render the Normative Open Design Package

**Task status:** COMPLETE for the downstream themes adapter. Official identity remains outside this task's authority.

**Files:**

- Create: test/open-design-renderers.test.cjs
- Create: scripts/lib/open-design/render-tokens.cjs
- Create: scripts/lib/open-design/render-docs.cjs

**Interfaces:**

- Consumes: DesignSystemModel, repository evidence entries, root README bytes.
- Produces:
  - renderTokensCss(model): string.
  - renderBizarreTokensCss(model): string.
  - renderDesignTokensJson(model): string.
  - renderTailwindV4Css(model): string.
  - renderManifest({ model }): string.
  - renderMetadata(): string.
  - renderDesignMd({ model, readme }): string.
  - renderUsageMd(): string.
  - renderEvidenceMd({ entries }): string.
  - renderTokenContractReport(model): string.

- [x] **Step 1: Write renderer RED tests**

Tests must assert:

- manifest has only allowed top-level keys and the exact nested contract from the spec;
- source.type is github, URL is exact, branch is main, commit is the supplied 40-character SHA;
- craft contains applies, suggested, and exemptions arrays;
- 12 existing font entries include family, file, weight, style;
- preview includes dir and all nine pages;
- metadata is published and agent-managed;
- tokens.css root declares exactly OD_SCHEMA_TOKENS and no --bzr names;
- scoped mode blocks only redeclare OD_SCHEMA_TOKENS;
- parsed root values deep-equal model.modes.void.od, and each scoped selector deep-equals its corresponding 56-token mode map;
- every var() reference in the root resolves to another OD_SCHEMA_TOKENS name, matching Open Design validator behavior;
- assets/bizarre-tokens.css carries all brand, syntax/status, ANSI, and cursor tokens;
- DESIGN.md contains CATCH THE STARS, all five variants, static GitHub catalog, future website boundary, install safety, license, and generator governance;
- USAGE.md tells agents to use tokens.css first and assets/bizarre-tokens.css for syntax/ANSI and non-default artifact modes;
- design-tokens.json marks structural values derived/showcase or derived/accessibility;
- Tailwind bindings reference only declared OD schema tokens.
- token-contract.report.json declares TOKEN_SCHEMA, 56 total/declared tokens, zero fallbacks, recommendRebuild false, a successful self-check, and 56 deterministic per-token provenance records including derived/showcase and derived/accessibility sources.

- [x] **Step 2: Run renderer tests and capture RED**

Run:

~~~~bash
node --test test/open-design-renderers.test.cjs
~~~~

Expected: FAIL with missing renderer modules.

- [x] **Step 3: Implement tokens.css**

Render:

~~~~css
:root {
  /* Exactly 56 OD TOKEN_SCHEMA declarations; Void is canonical. */
}

[data-bizarre-theme="void"] { /* same OD declarations as :root */ }
[data-bizarre-theme="void-hicontrast"] { /* OD declarations only */ }
[data-bizarre-theme="workshop"] { /* OD declarations only */ }
[data-bizarre-theme="paper"] { /* OD declarations only */ }
[data-bizarre-theme="bone"] { /* OD declarations only */ }
~~~~

No other custom property name is allowed in this file. Bizarre-only variables use a --bzr- prefix in assets/bizarre-tokens.css.

- [x] **Step 4: Implement the exact manifest, metadata, prose, and reports**

Use the reviewed spec as the normative prose outline. Embed important README claims by source, not by generic Open Design copy. Keep the full README itself in evidence rather than concatenating it into DESIGN.md.

Use this exact metadata shape:

~~~~json
{
  "title": "Bizarre Industries",
  "category": "Developer Tools",
  "surface": "web",
  "status": "published",
  "artifactMode": "agent-managed"
}
~~~~

- [x] **Step 5: Run renderer and model tests**

Run:

~~~~bash
node --test test/open-design-model.test.cjs test/open-design-renderers.test.cjs
~~~~

Expected: PASS.

- [x] **Step 6: Checkpoint without committing**

Run git diff --check on renderer and test files.

---

### Task 5: Render Source-Derived Components and Previews

**Task status:** COMPLETE.

**Files:**

- Modify: test/open-design-renderers.test.cjs
- Create: scripts/lib/open-design/render-components.cjs

**Interfaces:**

- Consumes: DesignSystemModel, coverage records, asset paths.
- Produces:
  - renderComponentsHtml(model): string.
  - renderComponentsManifest({ html, tokensCss }): object.
  - renderPreviewPages({ model, coverage, assets }): Map of nine path/string entries.
  - renderSystemKit({ model, coverage, assets }): string for Open Design's native showcase route.

- [x] **Step 1: Add failing component and preview tests**

Assert:

- components.html contains identity lockup, eyebrow, pill, slogan strip, section heading, variant selector, swatch, ANSI cell, syntax specimen, code pane, terminal pane, config card, status badge, install snippet, link, button, field, tab, and kbd;
- default, hover, active, focus-visible, disabled, selected, and error states exist where meaningful;
- the fixture references tokens.css and assets/bizarre-tokens.css locally;
- inline var references in components.html are a subset of OD_SCHEMA_TOKENS;
- every syntax/status/ANSI utility class used by components.html exists in assets/bizarre-tokens.css, while components.html contains no var(--bzr-*) reference;
- resource-bearing href, src, @import, and url() values are exact package-local paths; protocol, protocol-relative, root-relative, and script-src dependencies are rejected without banning displayed URL text;
- the fixture and all nine previews contain five real labeled button switchers with Void initially aria-pressed, and local script changes only data-bizarre-theme and aria-pressed;
- disabled, field-error/aria-invalid, hover, active, and focus-visible semantics use real HTML/CSS states; tabs have IDs, controls/panels, roving tabindex, click, and ArrowLeft/ArrowRight/Home/End behavior;
- each preview has the exact viewport meta, local stylesheets, exactly one visible h1, real package-local links in navigation, 64px desktop/20px responsive gutters, meaningful grid/pane collapse, landmarks/labels, and actual source-derived content;
- all normal/small text uses fg or fg-2 rather than muted/meta, and dark/light text, focus, and state pairs used by the fixture clear the repository's existing WCAG thresholds;
- renderPreviewPages propagates sentinel coverage `{ id, label, count }` records and package-root asset paths into exactly nine preview/*.html Map entries;
- renderSystemKit reuses the app preview, preserves package-local assets, and links from system/kit.html to preview/overview.html;
- components.manifest.json deep-equals the installed schema shape and recomputed counts/inventories, with declared tokens exactly OD_SCHEMA_TOKENS, undeclaredReferenced empty, all nine exact group records, and exact literal keys.

- [x] **Step 2: Run the focused test and capture RED**

Run:

~~~~bash
node --test test/open-design-renderers.test.cjs
~~~~

Expected: FAIL because component renderer exports are missing.

- [x] **Step 3: Implement the fixture**

Reuse exact visual grammar from showcase/showcase.css:

- 64px lime grid;
- 1px hairlines;
- 2px, 4px, and 6px radii;
- Xenon display, Krypton labels, Neon code, Argon prose;
- 64px desktop and 20px responsive gutters;
- no decorative/color gradients, glass, or generic rounded SaaS cards; the only gradient exception is the existing pair of linear layers used solely for the 64px source grid;
- at most two visible --accent uses per screen;
- syntax/ANSI classes loaded from assets/bizarre-tokens.css;
- all controls use actual elements and visible labels.

The only script is local and self-contained: it sets data-bizarre-theme, keeps five mode buttons' aria-pressed state synchronized, and operates the tab demo with click plus ArrowLeft/ArrowRight/Home/End while updating only local DOM state. It does not modify the repository showcase.

- [x] **Step 4: Implement compatible component-manifest extraction**

Generate schemaVersion 1 with:

- brandId;
- source.componentsHtml and source.tokensCss;
- fixture title, description, styleBlockCount, selectorCount, classCount, elementCount;
- tokens declared, referenced, unusedDeclared, undeclaredReferenced;
- selectors, classes, elements;
- groups buttons, inputs, cards, badges, links, keyboard, icons, typography, layout;
- literals summary.

Match the installed extractor's localeCompare ordering and deterministic counts. This component-manifest cache is an explicit compatibility exception to raw sorting used by repository-owned indexes.

- [x] **Step 5: Run renderer tests**

Run:

~~~~bash
node --test test/open-design-renderers.test.cjs
~~~~

Expected: PASS.

- [x] **Step 6: Checkpoint without committing**

Run git diff --check and inspect status.

---

### Task 6: Orchestrate Fonts, Evidence, Generation, and Check Mode

**Task status:** COMPLETE.

**Files:**

- Modify: scripts/lib/open-design/evidence.cjs
- Modify: test/open-design-evidence.test.cjs
- Create: scripts/lib/open-design/fonts.cjs
- Create: scripts/generate-open-design.cjs
- Create: test/open-design-package.test.cjs
- Modify: scripts/generate.cjs
- Regenerate: generated-files.json
- Modify: .gitignore
- Modify: package.json
- Modify: .github/workflows/verify.yml
- Regenerate: README.md
- Regenerate: design/README.md

**Interfaces:**

- Consumes: all earlier task modules.
- Produces:
  - readEvidenceEntry({ root, entry, limits? }): Buffer.
  - buildOpenDesignPackage({ root, packageRoot }): Map of path/Buffer.
  - generateOpenDesignPackage({ root, packageRoot, check }): string[].
  - CLI flags: --check and optional --output for temp tests.

- [x] **Step 1: Write end-to-end package RED tests**

Use a temporary output root and assert:

- every manifest-declared file exists;
- package-files.json hashes every generated package file except itself;
- metadata.json is present;
- full root README evidence bytes equal fs.readFileSync(root README.md);
- every current non-ignored repository file has one inventory entry or explicit exclusion;
- all current browser screenshots map to assets/showcase and match SHA-256;
- all 12 selected WOFF2 files and four copied license files exist;
- Radon is documented unavailable and no Radon file is invented;
- source/scanned-files.json and source/snippets/INDEX.json are sorted and complete;
- scanned-files.json has `{ schemaVersion: 1, files }`, while the snippet index has `{ schemaVersion: 1, snippets }` and every snippet record exposes its package path as `path`;
- source/tokens.source.json is the exact direct snapshot of all seven palette.js exports;
- coverage counts are derived from the nine specified evidence prefixes and preview rendering receives the exact eight source-backed asset paths;
- source evidence excludes package output and AGENTS.md;
- isolated Git-mirror regressions persistently mutate a local implementation source between bootstrap capture and lazy load, and after load but before evidence enumeration; both fail with the named path and create no package root, while an execution marker proves the pre-load mutation never executes;
- a local implementation module cached before bootstrap is evicted and re-executed from the captured source, while persistent entrypoint drift after the generator is required fails with the named entrypoint path and creates no package root;
- a persistent same-inode implementation edit injected immediately after the final descriptor `fstat` is rejected by the final leaf snapshot check during bootstrap capture;
- every local module reachable from the generator, including the entry point and `palette.js`, has an evidence entry whose SHA-256 matches the loaded-source snapshot;
- check mode returns [] immediately after generation and returns dirty paths after one controlled mutation;
- a second generation produces byte-identical package hashes.

- [x] **Step 2: Run package test and capture RED**

Run:

~~~~bash
node --test test/open-design-package.test.cjs
~~~~

Expected: FAIL with missing orchestration files.

- [x] **Step 3: Implement the safe evidence read and index envelopes**

Factor `readEvidenceEntry({ root, entry, limits? })` out of the existing copy path. Preserve all identity, no-symlink, stable-read, byte-count, SHA, and evidence-size checks; make `copyEvidenceEntry` delegate to it. The shared default limits are 8 MiB per file and 64 MiB aggregate, selected against the measured inventory with more than 16x aggregate and 34.5x per-file headroom. Add exact-boundary, sparse max-plus-one-before-content-read, and aggregate max-plus-one-with-no-output tests using injected low limits. Change the scanned index to `{ schemaVersion: 1, files }` and build the snippet envelope with `path` fields. Add focused mutation, parent-replacement, symlink, sorting, and byte-identity tests.

- [x] **Step 4: Implement font inventory**

Select normal Latin weights 400, 600, and 700 from:

- @fontsource/monaspace-argon
- @fontsource/monaspace-krypton
- @fontsource/monaspace-neon
- @fontsource/monaspace-xenon

Copy each package LICENSE once under assets/licenses with a family-specific filename. Fail with the exact missing dependency path when npm ci has not been run. Inspect every path component below the trusted repository root with `lstat`; reject intermediate or leaf symlinks, non-directory parents, and non-regular leaves. Read through an `O_RDONLY | O_NOFOLLOW` descriptor, then revalidate parent identities plus leaf device, inode, size, modification time, creation/change time, and returned byte length. Persistent parent replacement or same-byte leaf replacement must fail with the named dependency and must never read through an intermediate symlink.

- [x] **Step 5: Implement package orchestration**

Build all expected Buffers in memory first. Add normative files, components/previews, evidence copies, screenshots/assets, fonts/licenses, inventories, and reports to the package writer. Do not mutate the package until every source read and render succeeds.

The builder receives the actual packageRoot for evidence exclusion. Generate the exact direct-palette tokens.source.json shape, derive the nine coverage counts from evidence-entry prefixes, pass the exact eight canonical asset paths to the preview renderer, require the 12 manifest font paths to exist in the Buffer map, and document Radon with the literal `asset-status: unavailable`. `package-files.json` is never part of the builder Map; the package writer alone publishes it last.

Keep the entry point bootstrap built-ins-only. Before requiring repository implementation code, stable-read and hash the generator entry point and its exact local implementation module set. Each stable read revalidates every path-component identity and compares the final leaf `lstat` snapshot to the final descriptor snapshot, including device, inode, size, modification time, and creation/change time. Immediately before execution, stable-revalidate every captured byte count and hash, evict every captured non-entrypoint path from `require.cache`, then lazy-load; persistent drift must fail with the named path before changed module code executes. Compare every bootstrap hash to the first evidence inventory, snapshot `palette.js` immediately before loading it, and at final closure traverse the generator module graph to prove that every loaded local module is captured and has the same path, byte count, and SHA-256 in evidence. Any missing or mismatched path must fail before `createPackageWriter` is called. Preserve the existing exported functions and CLI behavior.

The CLI prints exactly one of:

~~~~text
generated Open Design package: <package-root>
Open Design package is current
Open Design package is stale:
- path
~~~~

For the default output, `<package-root>` is exactly `design/open-design/bizarre-industries`. For `--output`, it is the normalized path string supplied by the caller. Exit 0 for generated/current; exit 1 for stale/check errors.

- [x] **Step 6: Wire generated docs, scripts, ignore rules, and CI**

Set:

~~~~json
{
  "generate:open-design": "node scripts/generate-open-design.cjs",
  "check:open-design": "node scripts/generate-open-design.cjs --check"
}
~~~~

Run check mode directly through the captured generator entrypoint; do not add an uncaptured parent wrapper. Append npm run check:open-design to npm test after check:generated and before validate. Add an explicit GitHub Actions step after npm test so logs name the package check. Do not add native capture commands.

Document the repo-canonical Open Design package, five artifact-level modes, full evidence policy, and local install behavior in the `readme()` and `designReadme()` producer functions in scripts/generate.cjs, then run npm run generate. Do not hand-edit their owned outputs. Add a final `.gitignore` exception for `design/open-design/bizarre-industries/**` and prove representative generated PNG/SVG files are not ignored. Package-lock.json remains unchanged because dependencies do not change.

- [x] **Step 7: Run package tests and clean install**

Run:

~~~~bash
npm ci
node --test test/open-design-*.test.cjs
~~~~

Expected: all Open Design tests PASS; npm reports zero vulnerabilities.

- [x] **Step 8: Checkpoint without committing**

Run git diff --check, npm ls --depth=0, and inspect status.

---

### Task 7: Generate and Verify the Complete Repository Package

**Task status:** COMPLETE.

**Files:**

- Generate: design/open-design/bizarre-industries/**
- Modify if contract failures require it: implementation files from Tasks 1–6 only.

**Interfaces:**

- Consumes: current dirty working tree after the completed remediation.
- Produces: verified package and evidence snapshot.

- [x] **Step 1: Run the generator**

Run:

~~~~bash
npm run generate:open-design
~~~~

Expected: generated Open Design package message and no user-file overwrite.

- [x] **Step 2: Run package check**

Run:

~~~~bash
npm run check:open-design
~~~~

Expected: Open Design package is current.

- [x] **Step 3: Inspect completeness**

Verify:

- root README evidence is byte-identical;
- inventory count equals present included files plus explicit exclusions;
- every generated-files.json entry that exists has generated true;
- 45 showcase PNGs are present;
- 12 fonts and four licenses are present;
- no Xcode, stale native capture, AGENTS.md, node_modules path, or package recursion appears;
- manifest and metadata parse exactly;
- tokens.css has only schema tokens;
- assets/bizarre-tokens.css has every syntax/status/ANSI role.

- [x] **Step 4: Run complete repository verification**

Run:

~~~~bash
npm test
npm run check:showcase
git diff --check HEAD
find . -type d -name __pycache__ -print
~~~~

Expected:

- all 38 non-Open-Design contracts plus 92 Open Design contracts pass, for 130 total;
- generated files and Open Design package are current;
- portable validation passes with the same explicit host-tool skips;
- 45 showcase screenshots and 14 inputs pass;
- no whitespace errors;
- no Python bytecode directories.

- [x] **Step 5: Visual QA in Open Design-compatible surfaces**

Before installation, serve the package root with a read-only local HTTP server and open components.html plus all nine previews in Codex's in-app Browser. Compare each rendered surface beside its repo reference at the same viewport and state. After the confirmed final installation in Task 8, repeat the same checks inside Open Design. Check for:

- typography;
- dark/light token application;
- 2/4/6px radii;
- grid, spacing, and gutters;
- focus visibility;
- overflow and responsive layout;
- local font loading;
- missing images;
- all five artifact modes;
- syntax/ANSI readability.

Correct visible defects, rerun Task 7 checks, and retain no debug artifacts.

- [x] **Step 6: Independent review**

Request review for Critical/Important issues only. Address every verified issue and repeat Steps 2–5.

- [x] **Step 7: Checkpoint without committing**

Record final status; do not stage or commit.

---

### Task 8: Preserve Existing Open Design State and Install the Linked Package

**Task status:** COMPLETE.

**Files / external state:**

- Read: existing Open Design user:bizarre-industries directory.
- Preserve: backing project brand-github-29e67b.
- Install target: Open Design user design-system catalog.
- Backup target after explicit confirmation: a timestamped directory outside the active design-systems catalog.

**Interfaces:**

- Consumes: verified package from Task 7; Open Design 0.14.1 local-install contract; configured open-design MCP when the daemon can run.
- Produces: exactly one active user:bizarre-industries catalog entry backed by the repo symlink.

- [x] **Step 1: Re-audit the existing entry**

The former catalog path was a real directory with 44 files, 3,235,074 bytes, and aggregate inventory SHA-256 `d7240d55b634c8dfc25084cfb03162f60a42d4153855988e52dc1d19714387ba`. Its metadata was published, agent-managed, and linked to project `brand-github-29e67b`.

- [x] **Step 2: Request action-time confirmation**

Show the user:

- exact existing directory;
- file count and size;
- backup destination;
- exact operation: move the existing directory out of the active catalog, then call the supported local install endpoint;
- assurance that brand-github-29e67b is untouched.

The user confirmed the exact backup and linked-install migration. This confirmation does not authorize deletion of the backup, project, repository work, commits, pushes, or pull-request changes.

- [x] **Step 3: Back up after confirmation**

The existing directory was moved by same-volume rename to `design-system-backups/bizarre-industries-20260716T182133Z`. The backup retains the same file count, byte count, and aggregate inventory hash. Project `brand-github-29e67b` remains a separate real directory and database row.

- [x] **Step 4: Install through the exact local-install contract**

Resolve the live daemon port with the packaged Open Design helper status command. POST without a cross-origin Origin header:

~~~~json
{
  "source": "local",
  "path": "/Users/binghzal/Developer/themes/design/open-design/bizarre-industries"
}
~~~~

to `/api/design-systems/install` when the daemon runs.

The supported endpoint completed successfully and created the expected junction-style symlink. Open Design 0.14.1 initially exited before binding because `better-sqlite3` and `blake3-wasm` were packaged under `app/node_modules/.ignored/`; a temporary process loader repaired dependency resolution without modifying the signed app bundle or global MCP configuration. This remains an external packaging defect, not a repository failure.

- [x] **Step 5: Verify catalog and filesystem state**

Assert:

- catalog contains one user:bizarre-industries;
- title is Bizarre Industries;
- category is Developer Tools;
- status is published;
- projectId is ds-bizarre-industries;
- active path is a symlink whose realpath is the repo package;
- backup remains a real directory with matching hashes;
- brand-github-29e67b still exists unchanged;
- manifest, metadata, tokens, components, previews, and evidence are readable.

All assertions passed. The active path resolves to the repo package; the timestamped backup remains a real directory with its original 44 files, 3,235,074 bytes, and matching inventory hash; `brand-github-29e67b` remains separate and unchanged.

- [x] **Step 6: Verify project usability and write-through stability**

The identifier was absent before activation. Activating `user:bizarre-industries` created the deterministic `ds-bizarre-industries` workspace. `metadata.json` remained byte-identical, the system reads as published and agent-managed, and the live Void preview uses `#0E0E0E`, Signal Lime `#C6FF24`, and Monaspace Xenon without fallback blue.

- [x] **Step 7: Verify MCP**

Start a fresh stdio client and run:

- initialize;
- tools/list;
- list_projects;
- get_active_context or get_project for the disposable project;
- get_artifact or get_file for a generated entry.

Result: a fresh explicit stdio bridge initialized Open Design MCP 0.2.0 on protocol `2025-11-25`, exposed 18 tools, listed project `ds-bizarre-industries`, and returned the active generated design system. The preloaded transport remains stale; the fresh bridge requires explicit daemon URL `http://127.0.0.1:7456`.

- [x] **Step 8: Final complete verification**

Rerun:

~~~~bash
npm test
npm run check:showcase
git diff --check HEAD
codex mcp get open-design
~~~~

Result: repository, Open Design, generated-output, showcase, portable-validation, and whitespace checks passed in the implementation checkpoint. Strict validation remains environment-blocked only by missing `emacs`, `fish`, `pwsh`, and `nvim`. The release worker must repeat the full matrix from the final documentation snapshot before staging.

- [x] **Step 9: Final checkpoint without committing**

The pre-release checkpoint recorded package path, catalog state, backup path, MCP evidence, strict-validator environment gap, and Git state before the user authorized the release workflow. The authoritative handoff supersedes this historical no-commit checkpoint.
