# Bizarre Industries Open Design System

**Status:** Implemented and verified as the downstream `themes` Open Design adapter
**Date:** 2026-07-16
**Repository:** `https://github.com/Bizarre-Industries/themes`
**Local source:** repository root (`.`)
**Open Design:** 0.14.1, package schema `od-design-system-project/v1`

## Purpose

Create one complete, repo-owned Bizarre Industries themes adapter and install it into Open Design as a local linked package. The package must preserve the repository's complete working-tree context, especially the full root README, while keeping `palette.js` and the generator authoritative inside this repository.

The result is a reusable visual contract for future Bizarre Industries work. It is not a replacement theme generator, a second editable palette source, or the future interactive website.

This package is not the company-wide identity authority. The sibling `design-system` repository remains canonical for the approved logo, typography, and official brand identity. Until a reviewed integration exists, this repository must describe its package as a downstream themes adapter and must not claim its current badge or Monaspace stack is the official identity system.

## Confirmed Decisions

- Keep `palette.js` as the canonical color, type, syntax, ANSI, status, and variant source.
- Represent Bizarre Industries as one Open Design system whose default Open Design binding is Void and whose fixtures/previews expose five artifact-level CSS modes. Open Design 0.14.1 has no native per-system mode picker.
- Use Bizarre Void as the default mode.
- Preserve Bizarre Void Hi-Contrast, Workshop, Paper, and Bone as named mode overrides.
- Feed Open Design the complete current repository context, with the full root README treated as primary product context rather than a short excerpt.
- Distinguish normative design-system contracts from source evidence and generated adapter examples.
- Install the valid local package verbatim through Open Design's local design-system install flow. Do not use the generic local-project importer, which would cap CSS token extraction and truncate README context.
- Keep the checked-in showcase static and deterministic. Website interactivity remains a future Bizarre Industries website concern.
- Keep Xcode removed.
- Use the repository's MIT license and preserve third-party font license material.
- Do not modify the signed Open Design application bundle.
- Release actions require separate user authorization. That authorization was granted on 2026-07-16 and is tracked in the handoff, not inferred from this specification.

## Rejected Structures

### Whole-repository generic import

Rejected because Open Design's generic importer scans only the first 80 stylesheet files and retains at most 80 CSS custom properties. This repository currently contains 71 stylesheets and 1,273 CSS custom-property declarations, so a generic import could elevate arbitrary adapter variables over the canonical palette. It also keeps only a short README excerpt.

### Five independent design systems

Rejected because it would duplicate identity, typography, syntax, ANSI, components, evidence, and governance five times. Independent systems would drift and obscure the intended relationship between variants.

### Open Design as the editable source of truth

Rejected because it would create a second palette authority and require error-prone reverse synchronization into `palette.js` and 383 generated outputs.

## System Boundary

```text
palette.js + repository sources
             |
             v
scripts/generate-open-design.cjs
             |
             v
design/open-design/bizarre-industries/
             |
             | local install creates one Open Design-owned symlink
             v
Open Design design-system catalog
```

Open Design reads the repo-owned package. Regeneration updates files atomically inside the stable package directory, and the installed symlink sees those updates without copying files into the signed application bundle.

The linked package is marked published and `agent-managed`, but Open Design still exposes editing controls for user systems. Editing or revision controls are unsupported for this repo-owned system because they write through the symlink. The checker detects such drift, and regeneration refuses to overwrite it silently. Open Design never receives authority to modify `palette.js`, generated port files, or the package generator. Any future reverse-sync capability requires a separate design and approval.

## Existing Open Design State

The migration is complete. The former published, user-owned `user:bizarre-industries` directory was audited as 44 files and 3,235,074 bytes, then moved by same-volume rename to the timestamped backup `design-system-backups/bizarre-industries-20260716T182133Z` after explicit confirmation. Its inventory hash remained unchanged. The backing extraction project `brand-github-29e67b` remains a separate real directory and database row.

The supported local-install endpoint created exactly one active `user:bizarre-industries` catalog symlink whose realpath is this repository's generated package. Activation intentionally created workspace `ds-bizarre-industries`. Repository `metadata.json` remained byte-identical through activation. Fresh MCP verification negotiated protocol `2025-11-25`, exposed 18 tools, and read the active project and package successfully.

Open Design 0.14.1 has an external packaging defect: `better-sqlite3` and `blake3-wasm` are shipped under the application's `.ignored` dependency directory, so the daemon needed temporary process-level dependency resolution. The signed application bundle and global MCP configuration were not changed. A fresh bridge works when passed explicit daemon URL `http://127.0.0.1:7456`; the preloaded transport remains stale.

## Package Location and Shape

The package lives at:

```text
design/open-design/bizarre-industries/
```

Its contract is:

```text
bizarre-industries/
├── manifest.json
├── metadata.json
├── DESIGN.md
├── USAGE.md
├── tokens.css
├── design-tokens.json
├── tailwind-v4.css
├── components.html
├── components.manifest.json
├── package-files.json
├── assets/
│   ├── bizarre-tokens.css
│   ├── brand/
│   ├── showcase/
│   └── licenses/
├── fonts/
├── system/
│   └── kit.html
├── preview/
│   ├── overview.html
│   ├── variants.html
│   ├── colors.html
│   ├── syntax-ansi.html
│   ├── typography.html
│   ├── spacing.html
│   ├── components.html
│   ├── coverage.html
│   └── app.html
└── source/
    ├── scanned-files.json
    ├── evidence.md
    ├── tokens.source.json
    ├── token-contract.report.json
    └── snippets/
        ├── INDEX.json
        └── repo/...
```

All package contents are regular files. The only symlink is the one Open Design creates from its user design-system directory to the package root.

## Manifest Contract

`manifest.json` uses only Open Design's supported v1 keys and exact nested shapes. Its source locator is stable and deliberately omits a commit SHA. Because the generated package is committed alongside its sources, embedding `git rev-parse HEAD` would make the package invalidate itself on every commit. Per-file SHA-256 evidence provides snapshot identity instead:

```json
{
  "schemaVersion": "od-design-system-project/v1",
  "id": "bizarre-industries",
  "name": "Bizarre Industries",
  "category": "Developer Tools",
  "description": "One generated theme system for editors, terminals, shells, prompts, tools, and future Bizarre Industries product surfaces.",
  "source": {
    "type": "github",
    "url": "https://github.com/Bizarre-Industries/themes",
    "branch": "main"
  },
  "files": {
    "design": "DESIGN.md",
    "tokens": "tokens.css",
    "designTokens": "design-tokens.json",
    "tailwind": "tailwind-v4.css",
    "components": "components.html"
  },
  "assetsDir": "assets",
  "previewDir": "preview",
  "usage": "USAGE.md",
  "componentsManifest": "components.manifest.json",
  "importMode": "hybrid",
  "craft": {
    "applies": ["color", "type"],
    "suggested": [],
    "exemptions": []
  },
  "fonts": [
    { "family": "Monaspace Argon", "file": "fonts/monaspace-argon-latin-400-normal.woff2", "weight": 400, "style": "normal" },
    { "family": "Monaspace Argon", "file": "fonts/monaspace-argon-latin-600-normal.woff2", "weight": 600, "style": "normal" },
    { "family": "Monaspace Argon", "file": "fonts/monaspace-argon-latin-700-normal.woff2", "weight": 700, "style": "normal" },
    { "family": "Monaspace Krypton", "file": "fonts/monaspace-krypton-latin-400-normal.woff2", "weight": 400, "style": "normal" },
    { "family": "Monaspace Krypton", "file": "fonts/monaspace-krypton-latin-600-normal.woff2", "weight": 600, "style": "normal" },
    { "family": "Monaspace Krypton", "file": "fonts/monaspace-krypton-latin-700-normal.woff2", "weight": 700, "style": "normal" },
    { "family": "Monaspace Neon", "file": "fonts/monaspace-neon-latin-400-normal.woff2", "weight": 400, "style": "normal" },
    { "family": "Monaspace Neon", "file": "fonts/monaspace-neon-latin-600-normal.woff2", "weight": 600, "style": "normal" },
    { "family": "Monaspace Neon", "file": "fonts/monaspace-neon-latin-700-normal.woff2", "weight": 700, "style": "normal" },
    { "family": "Monaspace Xenon", "file": "fonts/monaspace-xenon-latin-400-normal.woff2", "weight": 400, "style": "normal" },
    { "family": "Monaspace Xenon", "file": "fonts/monaspace-xenon-latin-600-normal.woff2", "weight": 600, "style": "normal" },
    { "family": "Monaspace Xenon", "file": "fonts/monaspace-xenon-latin-700-normal.woff2", "weight": 700, "style": "normal" }
  ],
  "preview": {
    "dir": "preview",
    "pages": [
      { "path": "preview/overview.html", "role": "overview", "title": "Overview" },
      { "path": "preview/variants.html", "role": "variants", "title": "Variants" },
      { "path": "preview/colors.html", "role": "colors", "title": "Colors" },
      { "path": "preview/syntax-ansi.html", "role": "syntax-ansi", "title": "Syntax and ANSI" },
      { "path": "preview/typography.html", "role": "typography", "title": "Typography" },
      { "path": "preview/spacing.html", "role": "spacing", "title": "Spacing" },
      { "path": "preview/components.html", "role": "components", "title": "Components" },
      { "path": "preview/coverage.html", "role": "coverage", "title": "Coverage" },
      { "path": "preview/app.html", "role": "app", "title": "App Preview" }
    ]
  },
  "sourceFiles": {
    "scanned": "source/scanned-files.json",
    "evidence": "source/evidence.md",
    "tokens": "source/tokens.source.json",
    "report": "source/token-contract.report.json",
    "snippets": "source/snippets/INDEX.json"
  }
}
```

Git HEAD and porcelain status are sampled before and after a build only as in-memory race guards. Neither is emitted into `manifest.json` or `source/evidence.md`, so committing an otherwise-current package does not create circular provenance drift. The evidence inventory's repository-relative paths, byte counts, and per-file SHA-256 values are the durable snapshot record.

`metadata.json` is also deterministic and repo-owned:

```json
{
  "title": "Bizarre Industries",
  "category": "Developer Tools",
  "surface": "web",
  "status": "published",
  "artifactMode": "agent-managed",
  "projectId": "ds-bizarre-industries"
}
```

Published status makes the linked system selectable by Open Design projects. `agent-managed` prevents Open Design from synthesizing fallback package files; it does not make the symlink read-only.

`projectId` uses Open Design's own deterministic workspace fallback for `user:bizarre-industries`. Open Design links a user design system to a workspace on first activation by rewriting `metadata.json` through the catalog symlink. Keeping `ds-bizarre-industries` as the final deterministic key makes that rewrite byte-identical and prevents package freshness drift. Before first activation, both the Open Design project database and projects directory must be checked for an existing `ds-bizarre-industries`; a collision is a hard stop because Open Design reuses an existing project row.

Every path declared by the manifest must exist, stay within the package, and be covered by package verification.

## Source-of-Truth Layers

### Normative

The following files tell Open Design what to use when generating new work:

1. `DESIGN.md`
2. `tokens.css`
3. `design-tokens.json`
4. `components.manifest.json`
5. `components.html`
6. the preview pages

Normative color and typography values must come directly from `palette.js`. Component proportions and layout values may come from the existing showcase, but must be labeled as derived rather than silently promoted into palette canon.

### Evidence

The `source/` tree explains how the normative contract was produced. Generated editor, terminal, shell, tool, app, web, documentation, and window-manager ports are translation evidence. They do not become independent token definitions or new component APIs.

If normative files and evidence ever disagree, generation fails. Open Design must not guess which side wins.

## Complete Repository Ingestion

The discovery snapshot contained 454 visible repository files before this specification was added, including 383 generator-owned outputs, 24 README files, 27 Markdown documents, and 45 current browser showcase PNGs. These are observational counts, not hard-coded limits; regeneration recalculates them from the working tree and includes this specification.

The package must include every tracked repository source needed to reconstruct the themes adapter:

- the full root `README.md` verbatim at `source/snippets/repo/README.md`;
- every other repository README verbatim at its original relative path below `source/snippets/repo/`;
- `PALETTE.md`, `PORTS.md`, `LICENSE`, `package.json`, `generated-files.json`, and all repository documentation;
- `palette.js`, the relevant generator and validation sources, and design exports;
- showcase JSX, CSS, samples, static entry point, and capture manifests;
- repository tests and accessibility contracts;
- all current text-based generated adapters as source evidence;
- all 45 current browser showcase images under `assets/showcase/` with original bytes;
- the generated Bizarre badge and other repository-owned brand assets;
- a deterministic inventory entry for every included file.

`source/scanned-files.json` uses the Open Design-compatible envelope
`{ "schemaVersion": 1, "files": [...] }`. The exhaustive inventory records:

- repository-relative path;
- package-relative evidence path;
- file kind;
- byte size;
- SHA-256;
- canonical, generated, documentation, test, image, font, or adapter classification;
- generator ownership when applicable.

Classification uses one deterministic precedence: generated ownership, test path, image extension, font extension, documentation extension or name, port/adapter top-level path, then canonical source fallback. File kind is a separate deterministic media/extension label. The evidence envelope is pretty-printed JSON with one trailing newline; its `files` array is stable and code-unit sorted. It makes omission detectable rather than relying on Open Design's scanner heuristics.

`source/snippets/INDEX.json` uses the Open Design-compatible envelope
`{ "schemaVersion": 1, "snippets": [...] }`. It contains every inventory entry whose package path begins with `source/snippets/`, adds `path` equal to that package path, and keeps the same code-unit ordering. This is required so Open Design can allow pull access to the copied repository evidence instead of exposing only the index file.

The following are excluded because they are not current repository design context:

- `.git/` internals;
- `node_modules/` except explicitly selected font files and their licenses;
- the generated `design/open-design/bizarre-industries/` package itself, preventing recursive snapshots;
- temporary files, caches, logs, OS metadata, and Python bytecode;
- `docs/agent-handoff.md`, whose live verification and resume state changes after package generation and would otherwise create circular freshness drift;
- `.superpowers/brainstorm/`, which is transient tool UI and runtime state and may contain session credentials, ports, and process identifiers;
- removed Xcode files;
- removed stale native captures;
- ignored private files and user-agent instruction files.

The migration checkpoint implementation invokes `git ls-files --cached --others --exclude-standard`, so a nonignored untracked file is currently eligible for evidence. That behavior was necessary while most implementation sources were untracked, but it is not an acceptable steady-state security boundary: secret filenames are unbounded and `.env`, `credentials.json`, or another local export may not be ignored. The current release commit passed a Gitleaks commit scan with zero findings. Task 9 in the canonical plan must change future enumeration to tracked files only and add explicit untracked-secret regressions before another package publication. Until then, do not claim that arbitrary nonignored untracked files are safely excluded.

## README Treatment

The root README has two roles:

1. It is preserved verbatim in source evidence.
2. Its important product claims are promoted into the normative `DESIGN.md` so Open Design agents do not need to discover them through the pull layer.

`DESIGN.md` must represent:

- the Bizarre Industries identity and `CATCH THE STARS` motto;
- version and snapshot language without changing `MAY 2026` metadata by assumption;
- one palette and five generated variants;
- the static GitHub catalog as the current public experience;
- future interactivity being reserved for the Bizarre Industries website;
- optional native captures and their freshness rules;
- generated port coverage;
- safe installation and merge guidance;
- generator and validation workflows;
- MIT licensing;
- Node and local rendering requirements when relevant to implementers.

The Void preview contract is repeated as parser-readable `Label: #hex` lines for page background, foreground, primary brand, muted, border, and surface roles. Display, body, and mono use parser-readable full font-stack lines. These values are generated from the Void model, not independently maintained, so Open Design's generic preview cannot fall back to blue or system typography.

All other README files contribute tool-specific usage and coverage evidence. Repetition is allowed in evidence but removed from normative guidance.

## Token Architecture

### Primitive layer

- six brand anchors from `palette.js`;
- the declared Monaspace font roles and family names;
- dark and light syntax maps;
- dark and light status maps;
- dark and light ANSI maps;
- five variant surface and foreground definitions.

### Semantic layer

The package provides Open Design's normalized semantic aliases, bound to Bizarre Void in `:root`:

- background and raised surfaces;
- primary and muted foregrounds;
- structural, subtle, and strong borders;
- graphic accent, foreground accent, and text-on-accent;
- selection and focus;
- success, warning, danger, information, and hint;
- display, body/prose, mono/code, and label typography.

`tokens.css` declares exactly the 56 Open Design `TOKEN_SCHEMA` names in its unscoped `:root`. It may repeat those same schema names in the five scoped variant selectors, but it declares no Bizarre-only names. This keeps Open Design's token validator and prompt binding contract valid.

`assets/bizarre-tokens.css` carries Bizarre-only brand primitives, information/hint roles, all syntax/status roles, ANSI colors, the cursor-blink token, and local `@font-face` rules. It lives below the manifest-declared `assetsDir` because Open Design's v1 static and pull-file allowlists recursively expose declared assets but do not expose arbitrary root extras. Its font URLs resolve from `assets/` back to the manifest-declared `fonts/` files. Components and previews link this file, while `components.html` keeps its inline `var(...)` references limited to names declared by `tokens.css` so Open Design's component-contract validation remains clean.

The tested distinctions remain explicit:

- Signal Lime is the dark-surface hero accent.
- Lime Ink is the light-surface graphic and fill accent.
- Lime Text is the readable light-surface foreground accent.
- text-on-accent is contrast-selected for the accent fill and is not an alias for Lime Text.

### Artifact-level mode layer

The public selector is:

```css
[data-bizarre-theme="void"]
[data-bizarre-theme="void-hicontrast"]
[data-bizarre-theme="workshop"]
[data-bizarre-theme="paper"]
[data-bizarre-theme="bone"]
```

`:root` and an absent attribute resolve to Void. Open Design 0.14.1 selects the design system as a whole and has no manifest field or project control for an internal mode. The four non-default modes are therefore CSS selectors for generated artifacts and the package preview switcher, not entries in Open Design's design-system picker.

Dark syntax, status, and ANSI primitives are shared by Void, Void Hi-Contrast, and Workshop. Light primitives are shared by Paper and Bone. Each mode overrides only its actual surface ramp, foreground ramp, selection, border, accent aliases, and documented exceptions. This avoids duplicating full syntax and ANSI tables five times while preserving every effective value.

### Syntax and terminal layer

All 34 effective syntax/status roles and all 16 ANSI colors are exposed with stable names. Preview pages show their value and contrast on every applicable background. Tokens retain source role names so future editor and terminal ports can map without reverse engineering.

### Layout and motion provenance

The repository has no palette-level spacing, type-scale, radius, elevation, container, focus-width, or general motion contract. Open Design still needs usable structural values, so the package derives them only from current `showcase.css` evidence and labels them `derived/showcase` in `design-tokens.json` and `source/token-contract.report.json`.

No derived value is written back into `palette.js` or described as brand canon. A future promotion requires a separate decision.

The only current motion signature is the 1.1-second stepped terminal cursor blink. The package does not invent a general animation system.

Open Design's standard token contract is resolved without accepting its generic fallback values:

- type scale: `10px`, `11px`, `13px`, `17px`, `18px`, `30px`, `48px`, and `96px`, all observed in the showcase;
- body and tight leading: `1.6` and `0.94`;
- spacing: `4px`, `8px`, `12px`, `16px`, `18px`, `24px`, `32px`, and `56px`, all observed gaps or padding values;
- section vertical rhythm: `88px` at every breakpoint because the current responsive rule changes horizontal gutters, not vertical section spacing;
- radii: `2px`, `4px`, and `6px`; the Open Design `--radius-pill` compatibility alias remains `2px` because Bizarre pills are squared labels, not capsules;
- container width: `100%`; gutters: `64px` desktop and `20px` tablet/phone;
- flat and raised elevation: `none`; the hairline ring uses the current border token;
- accent hover and active: alias the unchanged accent rather than inventing unapproved color mixing;
- general motion durations: `0ms`; standard easing: `linear`;
- focus ring: a two-pixel accent outline derived solely to satisfy keyboard accessibility, marked `derived/accessibility`;
- cursor blink: a separate Bizarre token set to the observed `1.1s steps(1)` behavior.

These values satisfy Open Design's required schema while preventing its Inter, blue, rounded-card, shadow, and animation fallbacks from becoming accidental Bizarre canon.

Renderer verification parses every declaration value, not only its name: `:root` must deep-equal the Void Open Design map and every scoped selector must deep-equal its corresponding 56-token mode map. Every `var()` reference in the root must resolve to another declared Open Design schema token. `source/token-contract.report.json` follows Open Design's installed report shape and is deterministic and non-triggering: contract `TOKEN_SCHEMA`; 56 total, declared, and source-backed tokens; 26/26 source-backed A1 tokens; zero fallback or alias tokens; score 100; grade `excellent`; `summary.recommendRebuild: false`; A1-identity/A1-structure/A2/B-slot counts of 8/18/26/4; successful self-check with no errors; and one `{ name, layer, value, confidence, reason, sources }` record for every token, including `derived/showcase` and `derived/accessibility` sources. It omits a current-time `generatedAt` so package output stays deterministic.

## Typography and Font Assets

The normative roles are:

- Display: Monaspace Xenon
- Mono/code: Monaspace Neon
- Prose: Monaspace Argon
- Label/eyebrow: Monaspace Krypton
- Hand/annotation: Monaspace Radon with the source fallback stack

The repository currently installs Argon, Krypton, Neon, and Xenon but not Radon. The package therefore ships only font files already available in the repository dependency set. The hand role remains documented and falls back exactly as `palette.js` specifies; it is marked `asset-status: unavailable` rather than downloading or inventing a font dependency.

Selected font and license inputs use descriptor-based stable reads. Every path component below the trusted repository root is inspected with `lstat`; symbolic links, non-directory parents, and non-regular leaves are rejected before target bytes are read. The leaf is opened with `O_RDONLY | O_NOFOLLOW`, the path and descriptor identities are matched, and device, inode, size, modification time, creation/change time, returned byte length, and every parent identity are revalidated after the descriptor read. Missing dependencies retain the exact expected source path in the error.

Selected WOFF2 files and their applicable licenses are copied into `fonts/` and `assets/licenses/`. Previews use only local package assets and make no CDN requests.

## Visual Grammar

The design system preserves the showcase's industrial, editorial, code-first language:

- 64-pixel background grid where a full showcase canvas warrants it;
- thin hairline structure;
- compact uppercase Krypton labels with wide tracking;
- Xenon slab display headings;
- Neon code and terminal content;
- dense but ordered information layouts;
- restrained radii observed in the showcase;
- Signal Lime used as a directional marker rather than decoration everywhere;
- light variants using Lime Text for foreground emphasis and Lime Ink for fills;
- no decorative/color gradients, glass effects, soft consumer-app ornament, or invented illustration language. The sole gradient exception is the existing pair of linear layers that draws the source-derived 64px background grid.

## Component Reference Set

Components are source-derived reference patterns, not a claim that this theme repository already exposes a production UI library.

The package includes:

- identity lockup;
- eyebrow and metadata pills;
- slogan strip;
- section heading;
- variant card and variant selector;
- color swatch and ANSI cell;
- syntax-role specimen;
- code editor pane;
- terminal pane and prompt segment;
- configuration/coverage card;
- status badge;
- install snippet;
- link, button, field, tab, keyboard hint, and focus treatment derived from the same shape and type grammar for future Open Design artifacts.

Every interactive reference includes default, hover, active, focus-visible, disabled, selected, and error states where that state is meaningful. Each is shown in at least one dark and one light mode. Normal and small text uses the contrast-safe `--fg` or `--fg-2` tiers rather than the intentionally faint `--muted`/`--meta` evidence tiers. Focus and every rendered text/status pair must use the existing contrast helpers and clear the repository's WCAG thresholds.

The component fixture has no runtime dependency and no network dependency. One small inline script may switch the five local preview modes and operate the self-contained tab reference with click plus ArrowLeft/ArrowRight/Home/End behavior. It may update only local DOM state and must not imply that the repository's GitHub showcase is now interactive. Every generated page has one visible `h1`, and any landmark labeled as navigation contains real package-local links.

`assets/bizarre-tokens.css` also generates source-role utility classes for syntax and status foregrounds plus ANSI foreground/background cells. The fixture uses these external classes rather than referencing `--bzr-*` variables inline, keeping Open Design's fixture token check limited to the 56 standard tokens.

`components.manifest.json` is generated from the fixture and treated as a cache. It reproduces Open Design's installed schema exactly: source paths; fixture counts; declared/referenced/unused/undeclared token arrays; selector, class, and element inventories; all nine standard group records; and literal counts. It does not invent component IDs that the installed schema lacks. Component-manifest inventories use Open Design's `localeCompare` ordering as an explicit compatibility exception to repository raw sorting. The HTML fixture and tokens remain authoritative.

## Preview Set

- `overview.html`: identity, motto, purpose, governance, and source provenance
- `variants.html`: five complete modes and their relationship
- `colors.html`: brand, surfaces, foregrounds, borders, status, and contrast intent
- `syntax-ansi.html`: syntax roles, statuses, and all ANSI colors
- `typography.html`: installed families, roles, weights, and fallback behavior
- `spacing.html`: showcase-derived spacing, radius, grid, and container evidence
- `components.html`: the component reference set and interaction states
- `coverage.html`: editor, terminal, shell, prompt, tool, app, web, docs, and window-manager coverage
- `app.html`: a cohesive Bizarre Industries design-system explorer composed from the reference patterns

Each preview is responsive, self-contained, and uses local assets. Rendering consumes explicit `{ model, coverage, assets }` input: coverage records use `{ id, label, count }`; asset values are package-root-relative paths; and output keys are the nine `preview/*.html` paths above. The existing 45 repository screenshots remain source evidence; the new previews are Open Design package views, not replacements for the GitHub README catalog.

`system/kit.html` is Open Design's native showcase entry. It reuses the source-derived app preview with stylesheet and asset paths valid from `system/`, and rewrites the overview link to `preview/overview.html`. It contains no independent tokens or styling.

Coverage counts are repository-evidence record counts, not marketing totals. They are derived at generation time from these fixed source prefixes, in this order: `editors/`, `terminals/`, `shells/`, `prompt/`, `tools/`, `apps/`, `web/`, `docs-sites/`, and `wm/`. Their ids and labels are respectively `editors`/Editors, `terminals`/Terminals, `shells`/Shells, `prompts`/Prompts, `tools`/Tools, `apps`/Apps, `web`/Web, `docs`/Docs, and `window-managers`/Window managers. Design exports and devtools remain fully ingested evidence but are not silently folded into another preview count.

The preview asset map is exact and source-backed: badge `assets/brand/bizarre-badge.svg`, hero `assets/showcase/hero.png`, variants `assets/showcase/variants.png`, colors `assets/showcase/palette-ansi.png`, syntax `assets/showcase/syntax.png`, components `assets/showcase/vscode-themes.png`, coverage `assets/showcase/tools.png`, and app `assets/showcase/shell-banner.png`.

## Generation and Ownership

The implementation introduces one captured deterministic generator with generation and read-only check modes:

- `scripts/generate-open-design.cjs`
- `npm run generate:open-design`
- `npm run check:open-design`

Both npm commands execute the same captured generator entrypoint; check mode passes `--check`, avoiding any uncaptured parent wrapper that could execute repository code before bootstrap verification.

The generator:

- reads `palette.js` and current repository sources;
- never follows repository symlinks;
- excludes its own output tree;
- preserves stable ordering and normalized newlines for generated text;
- copies evidence bytes without transforming them;
- records hashes only after every output succeeds;
- renders every expected byte in memory before writing, verifies ownership up front, writes each file through a same-directory temporary file plus atomic rename, and publishes `package-files.json` last as the consistency boundary;
- refuses to overwrite a path not owned by its package manifest;
- never reads, copies, or deletes `AGENTS.md` or equivalent user instruction files;
- reads selected local font and license inputs only through the no-symlink, descriptor-stable path contract;
- stable-captures its own implementation sources through descriptors and compares the final leaf `lstat` snapshot to the final descriptor snapshot, closing persistent same-inode edits after the last `fstat`;
- reports source files that exceed supported evidence limits instead of silently omitting them.

The supported repository-evidence ceilings are 8,388,608 bytes (8 MiB) per file and 67,108,864 bytes (64 MiB) in aggregate. The final pre-release inventory contains 474 files and its largest file, `scripts/generate.cjs`, is 243,136 bytes. The exact aggregate byte count is generated in `source/scanned-files.json` rather than copied into this evidence-bearing specification, which avoids a self-referential freshness claim. The defaults retain more than 16x aggregate headroom and 34.5x per-file headroom while bounding the generator's in-memory evidence ingestion. Tests may inject lower non-negative safe-integer limits through the same APIs; production defaults do not depend on test-only branches.

Enumeration preflights the aggregate against the inspected regular-file sizes before any package builder or writer exists, then reconciles the limit against the bytes actually read. Each source is opened without following its leaf, checked against the per-file limit from descriptor `fstat` before content read, and checked again from the descriptor and returned byte length after the read. Equality at either ceiling is supported. A max-plus-one result is a hard error that names the exact repository-relative path, observed byte count, and configured limit; no over-limit file is omitted or partially published.

Repository evidence is read through one `readEvidenceEntry({ root, entry, limits? })` API that reuses the enumeration identity, no-symlink, stable-read, byte-count, SHA-256, and size-limit checks. `listRepositoryEvidence({ root, packageRoot, limits? })` and the existing stage-copy API use the same limit object, with `DEFAULT_EVIDENCE_LIMITS` when none is supplied. The stage-copy API delegates to the same read path. `buildOpenDesignPackage({ root, packageRoot })` returns the complete path/Buffer map before the package writer is created, and receives the actual output path so temporary `--output` tests cannot ingest themselves.

The generator entry point has a built-ins-only bootstrap before it executes any repository implementation module. It stable-reads and SHA-256 snapshots the entry point itself plus every `scripts/lib/open-design/*.cjs` implementation dependency, then lazy-loads those modules. Immediately before loading, the same built-ins-only reader revalidates every bootstrap byte count and hash, then evicts every captured non-entrypoint implementation path from `require.cache`; persistent drift is rejected before changed module code executes, and a module preloaded by another caller cannot bypass the captured bytes. The initial evidence enumeration must contain the same byte count and hash for every bootstrap source. `palette.js` is stable-read and snapshotted immediately before its cache-cleared load. At final closure, the generator traverses its loaded local-module graph and requires every loaded repository module path to have a captured snapshot and a matching evidence entry. A mismatch names the repository-relative path and fails before the package writer is created or called, so neither check nor generation mode can mutate the package. Including the entry point closes persistent drift after its bootstrap snapshot; Node necessarily compiles the small built-ins-only prefix before that in-process snapshot, and the exact interval between final revalidation and Node's module read remains within the trusted-root race limitation stated below.

`source/tokens.source.json` is a direct, deterministic palette snapshot with exact top-level shape `{ "schemaVersion": 1, "source": "palette.js", "exports": { ... } }`. `exports` contains, in order, the exact `brand`, `fonts`, `syntax`, `status`, `ansi`, `variants`, and `variantOrder` exports from `palette.js`. It does not invent another flattened token vocabulary.

The root README and `design/README.md` are existing generator-owned outputs. Open Design documentation is added to their producer functions in `scripts/generate.cjs`, then published through `npm run generate`; the package is generated only after those final bytes exist. The repository `.gitignore` explicitly re-includes `design/open-design/bizarre-industries/**` after global image rules so package PNG/SVG evidence is present in a fresh checkout.

The generator's filesystem threat model is a trusted, user-owned repository root and staging root. For the package writer, the resolved `packageRoot` parent is the trusted boundary; the writer rejects a symlink/non-directory package root and every observed descendant but does not reject lexical filesystem ancestors such as macOS `/var`. It rejects every symlink or path-identity change observed before or after a read/write and fails ordinary concurrent-edit races. Portable Node filesystem APIs do not expose descriptor-relative `openat` traversal on all supported hosts, so the package does not claim containment against a malicious same-user process that swaps and restores a parent directory during the exact validation/open interval. Open Design and other external processes are never given authority to mutate those roots during generation.

`package-files.json` is the package's stable, hash-based ownership manifest. Its canonical encoding is pretty-printed JSON plus one trailing newline with exact shape `{ "version": 1, "files": [{ "file": "package/relative/path", "sha256": "64 lowercase hex" }] }`; entries are unique and code-unit sorted. It covers generated package files but excludes itself from its own hash inventory and is implicitly writer-owned metadata. A missing or empty package directory is bootstrap state; any non-empty directory without a valid manifest contains unowned state and generation stops.

Writer execution has a complete read-only preflight followed by mutation. `add()` accepts each safe POSIX-relative path once, rejects raw or case-folded collisions, rejects `package-files.json`, any `AGENTS.md` segment, unsafe separators or dot segments, and defensively copies Buffer bytes. Check mode never mutates and returns deduplicated dirty package paths in code-unit order. Invalid manifests, unowned paths, symlinks, special files, or identity races are hard errors in both modes. Directories are implicit writer structure only when they prefix a prior-owned or currently expected file; arbitrary directories are unowned even when empty. After obsolete-file deletion, now-empty prior-owned directories that are not expected prefixes are pruned deepest-first, while unrelated or nonempty directories are preserved by failing. Generation writes expected files first, validates them, removes only immediately revalidated unchanged obsolete owned files, and renames `package-files.json` last. Temporary files are cleaned after any pre-rename failure only when this invocation created them, without masking the original error.

Per-file atomicity is deliberate; the package is not a multi-file transaction. If a host I/O failure occurs after an ordinary rename but before final manifest publication, the old manifest remains as a fail-closed consistency boundary. The next check/generation stops on the exact drift for inspection rather than guessing ownership or automatically rolling forward. A transaction journal is outside this design and would require a separate reviewed recovery protocol.

A separate package manifest is required because including the evidence snapshot in the repository-wide generated-file manifest would create circular hashes. The root generator may invoke the Open Design generator only after this boundary is tested.

## Open Design Installation

Installation normally uses Open Design's supported local design-system endpoint or equivalent app flow with:

```json
{
  "source": "local",
  "path": "design/open-design/bizarre-industries"
}
```

Resolve the repository-relative `path` to an absolute path at invocation time. Never commit the resolved developer-local path.

Open Design validates that `DESIGN.md` exists and creates a junction-style symlink inside its user design-system directory. It does not copy or normalize the valid package. The repo-owned `metadata.json` makes the catalog entry published and `agent-managed` immediately; no PATCH/publish call is allowed because that call would write through the symlink.

If the installed daemon cannot start because of a verified Open Design packaging defect, the exact local-install fallback may be reproduced without modifying the signed app: resolve and validate the absolute package directory, reject blocked system roots, require a regular `DESIGN.md`, require the catalog basename to be absent, then create the same junction-style symlink. The local endpoint performs no database write. This fallback must be recorded with the daemon failure, catalog path, package realpath, and backup inventory evidence.

Before installation:

- the package checker passes;
- no existing `bizarre-industries` system is present;
- the target resolves to the repo-owned package;
- no package file escapes the package root.

After installation:

- Open Design lists exactly one editable Bizarre Industries system;
- the installed catalog entry resolves through the expected symlink;
- `DESIGN.md`, `tokens.css`, the component manifest, fixture, previews, assets, and evidence are readable;
- all five artifact-level modes render in fixtures and previews, while Open Design binds Void by default;
- Open Design projects can select the system;
- the MCP server can list projects and retrieve active artifacts.

If a correct symlink is already installed, regeneration updates the linked package in place. If a conflicting real directory or a link to another target exists, implementation stops and asks before removing anything.

## Error Handling

- Missing canonical source: fail generation and name the path.
- Invalid palette value or unsupported theme id: fail before writing output.
- Missing evidence file between inventory and copy: fail as a changing-input race.
- Source changes during generation: discard the temporary package and rerun.
- Hash or count mismatch: fail verification.
- Missing font asset: document the unavailable role; never fetch implicitly.
- Invalid manifest or escaping path: fail verification.
- Open Design not running: leave the valid package intact and report installation as pending.
- Duplicate installed id: inspect the existing target and stop before mutation.
- Open Design API or MCP error: keep repo output intact and report the exact failing boundary.

## Verification

Repository tests must prove:

- manifest schema and every declared path;
- exact five-mode inventory and default Void behavior;
- primitive and semantic colors match `palette.js`;
- graphic accent, foreground accent, and text-on-accent remain distinct;
- every normal syntax role and required foreground clears the existing WCAG thresholds;
- all ANSI mappings match the canonical dark/light maps;
- full root README evidence is byte-identical to the repository source;
- every tracked repository file is either included or covered by an explicit exclusion rule, after the tracked-only Task 9 hardening is complete;
- every evidence and asset hash matches its source;
- no deleted Xcode or stale native-capture path appears;
- all 45 current showcase images are included and match their hashes;
- generated HTML parses and references only package-local resources;
- every selector, class, and element inventoried by `components.manifest.json` exists in the fixture from which the cache was derived;
- derived layout tokens cite `showcase.css` provenance;
- font manifests declare only files actually copied;
- regeneration is deterministic;
- check mode is read-only;
- repository generation and all 38 non-Open-Design plus 92 Open Design contracts remain green;
- `npm run check:showcase` remains green;
- `git diff --check` remains clean.

Open Design verification must prove:

- local installation succeeds without modifying `/Applications/Open Design.app`;
- the design-system catalog exposes Bizarre Industries once;
- all normative files and representative evidence can be read;
- the preview explorer renders without missing assets;
- switching each preview/artifact mode changes the complete scoped token contract;
- a small test project can use the system without Open Design fallback colors replacing Bizarre tokens;
- MCP initialize, tool discovery, and a read-only catalog/project call succeed.

## Non-Goals

- Building or deploying the Bizarre Industries website.
- Turning the static GitHub showcase into an interactive product.
- Reintroducing Xcode.
- Creating native screenshots automatically.
- Replacing `palette.js` with Open Design state.
- Adding Radon or any other dependency without a separate decision.
- Redesigning the established Bizarre visual language.
- Treating generated port adapters as independent design authorities.
- Treating release authorization as permission to redesign, discard unrelated work, or force-update shared history.

## Acceptance Criteria

The work is complete when:

1. A deterministic repo-owned v1 Open Design package exists at the approved path.
2. It contains the complete current repository context under a verified evidence/index boundary.
3. The full README is preserved verbatim and its product rules are represented normatively.
4. One Open Design system binds Void by default and exposes all five Bizarre artifact-level CSS modes without token duplication or drift.
5. Components and previews visibly match the existing showcase language.
6. All package, repository, accessibility, and showcase checks pass.
7. Open Design installs the local package verbatim through a safe symlink.
8. The system is selectable and readable inside Open Design.
9. The Open Design MCP connection remains enabled and passes a live read-only call.
10. No signed app files, user configs, unrelated repository files, commits, or remote branches are changed outside the explicitly approved scope.

The adapter meets these criteria. This does not resolve the official-logo and typography mismatch with the sibling `design-system` repository, the future tracked-or-allowlisted evidence policy, or the conflicting Xcode and interactive-showcase policies. Those are deliberate handoff items, not hidden acceptance exceptions.
