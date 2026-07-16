# Repository Remediation Implementation Plan

**Status:** Historical implementation plan. Its remediation work is present in the current worktree and covered by current contract, generation, validation, and showcase checks. Resume from [`docs/agent-handoff.md`](../../agent-handoff.md) and the [canonical active plan](2026-07-12-open-design-system.md); do not restart this plan from Task 1.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the repository safe to regenerate and install, internally consistent, accessible at WCAG AA for normal syntax text, honest about its current static GitHub presentation, and verifiable in CI without restoring Xcode support.

**Architecture:** Keep `palette.js` as the canonical design-token source and `scripts/generate.cjs` as the only producer of shipped ports and documentation. Add a small generated-file state module so regeneration owns only files it previously declared. Add contract tests around the canonical inputs and generated outputs, while keeping optional native-tool validators explicit rather than silently treating skips as full validation.

**Tech Stack:** Node.js 22, CommonJS, built-in `node:test`, Playwright Chromium for intentional showcase rendering, and the repository's existing TOML/INI/YAML/PostCSS validators.

## Confirmed product decisions

- Remove Xcode support completely: generator, docs, showcase target, validator references, and the five already-deleted theme files.
- License original Bizarre Themes code and assets under MIT with `Copyright (c) 2026 Bizarre Industries`, matching Catppuccin's project license family.
- Treat the checked-in README images as the current product surface. The local showcase is a static capture source, not an interactive product. Interactive controls belong in a future Bizarre Industries website deployment.
- Preserve the user's existing Xcode deletions and all unrelated local files. Do not create an isolated worktree because the requested baseline includes those uncommitted deletions.

## Task 1: Establish executable repository contracts

**Files:**

- Create: `test/repository-contracts.test.cjs`
- Create: `test/contrast.test.cjs`
- Modify: `package.json`

1. Add `node:test` assertions for the agreed repository invariants:
   - no Xcode generator, docs, validator, showcase target, or shipped directory;
   - an MIT license and matching root/generated VS Code package metadata;
   - the README describes a static catalog and contains no destructive whole-config copy commands for Starship, AeroSpace, or Jujutsu;
   - every showcase target path exists and any explicit variant agrees with the variant slug in its path;
   - Base16 output maps `base0B` to strings, `base0D` to functions, `base0E` to decorators, and `base0F` to types;
   - tmux actually branches on `@bizarre-variant` for all five variants;
   - Sketch exports retain every named semantic token even when hex values repeat;
   - the generated SVG badge is tracked and not swallowed by `.gitignore`;
   - generator source cannot delete `AGENTS.md`.
2. Add WCAG 2.x relative-luminance helpers and assert every normal syntax role clears 4.5:1 on every canonical variant background. Also assert each light variant's `accentText` clears 4.5:1 on `bg` and `bg2`, and `fgFor()`'s selected foreground clears 4.5:1 on Lime Ink.
3. Add a `test:contracts` script and include it at the front of `npm test`.
4. Run `npm run test:contracts` and retain the expected failing output as the RED phase before production changes.

## Task 2: Separate brand fills from accessible text

**Files:**

- Modify: `palette.js`
- Modify: `scripts/generate.cjs`
- Regenerate: palette, editor, terminal, app, web, design, docs, and showcase text outputs

1. Add `brand.limeText = '#4A7409'`. Keep `brand.limeInk = '#5F8A0F'` for cursors, fills, borders, and graphics.
2. Add `accentText` to every variant: dark variants alias Signal Lime; Paper and Bone use Lime Text.
3. Map light `syntax.fn`, `syntax.method`, `syntax.attr`, and `ansi.brGreen` to Lime Text.
4. Adjust the remaining failing syntax colors with conservative same-hue changes and a margin above 4.5:1, then prove the full role matrix with unrounded tests.
5. Replace the gamma-encoded brightness heuristic in `fgFor()` with the WCAG relative-luminance and contrast formula, choosing whichever of the canonical dark/light foreground candidates has greater contrast.
6. Use `accentText` in fields that are explicitly text/foreground and retain `accent` in fills, borders, focus rings, cursor, and graphics. For external schemas with a single ambiguous accent slot, choose the value based on its documented visual use rather than applying a global replacement.
7. Update generated palette documentation and showcase copy so Lime Ink is described as the light graphic/fill accent and Lime Text as the accessible foreground accent.
8. Run `node --test test/contrast.test.cjs` until green.

## Task 3: Make generation ownership safe and complete

**Files:**

- Create: `scripts/lib/generated-files.cjs`
- Create: `test/generated-files.test.cjs`
- Modify: `scripts/generate.cjs`
- Modify: `scripts/check-generated.cjs`
- Create: `generated-files.json`
- Modify: `.gitignore`

1. Test in a temporary directory that the writer:
   - records every generated output in a stable sorted manifest;
   - reports a missing or stale output in check mode;
   - removes only obsolete files named by the previous manifest;
   - never removes an unlisted user file.
2. Run `node --test test/generated-files.test.cjs` and confirm RED because the module does not exist.
3. Implement the writer and route generator `out()` calls through it. Finish the manifest only after all generator functions succeed.
4. Delete `maybeRemoveMemoryAgents()` and its call. The generator must never inspect or mutate ignored user-agent instructions.
5. Make `scripts/check-generated.cjs` surface `spawnSync` errors and exit nonzero when the child has no numeric status.
6. Add `!devtools/github-readme-assets/bizarre-badge.svg` after the global SVG ignore rule so the expected generated badge is committed.
7. Run the focused generated-file tests until green.

## Task 4: Correct cross-port semantic mappings

**Files:**

- Modify: `scripts/generate.cjs`
- Regenerate: `editors/neovim-base16/*.yaml`
- Regenerate: `terminals/tmux/bizarre.conf`
- Regenerate: `design/sketch/*.sketchpalette`

1. Change the documented Bizarre Base16 mapping to:
   - `base03–05 = fgDim` and `base06 = fg`, preserving a monotonic, WCAG-readable neutral ramp in both dark and light schemes rather than emitting sub-AA comment/foreground slots;
   - `base0A = accentSoft` for dark variants and `accentText` for light variants, because light Lime Glow is a fill/display color that fails normal-text contrast;
   - `base0B = syntax.string`;
   - `base0C = syntax.rgx`;
   - `base0D = syntax.fn`;
   - `base0E = syntax.decorator`;
   - `base0F = syntax.type`.
   This keeps the repository's explicitly documented Bizarre interpretation while restoring the fixed Base16 string/function slots and making the generated values agree with the prose.
2. Generate a real tmux parse-time conditional with a default `@bizarre-variant` only when unset, five `%if`/`%elif` branches, and a visible invalid-variant error. Remove the inert "uncomment one" instructions.
3. Stop de-duplicating Sketch entries by hex value. Emit each semantic name once so aliases survive even when colors are identical.
4. Run the Base16, tmux, and Sketch contract tests until green.

## Task 5: Remove Xcode and repair showcase truthfulness

**Files:**

- Modify: `scripts/generate.cjs`
- Delete: `editors/xcode/bizarre-bone.xccolortheme`
- Delete: `editors/xcode/bizarre-paper.xccolortheme`
- Delete: `editors/xcode/bizarre-void-hicontrast.xccolortheme`
- Delete: `editors/xcode/bizarre-void.xccolortheme`
- Delete: `editors/xcode/bizarre-workshop.xccolortheme`
- Regenerate: `README.md`
- Regenerate: `PORTS.md`
- Regenerate: `showcase/index.html`
- Regenerate: `showcase/showcase-main.jsx`
- Regenerate: `showcase/assets/generated/*.png`

1. Remove the Xcode generator function, invocation, validator glob, install instructions, port inventories, and showcase target.
2. Change all showcase target records so the rendered variant matches the named file. Default-only paths render Void; explicit `bizarre-<variant>` paths render that same variant.
3. Rename "backlog" copy for already-shipped ports and remove Xcode from editor lists.
4. Remove the dormant optional tweak-control mounting code from the static showcase entry point. Keep a fixed sample and variant presentation for repeatable README captures; do not build website interaction in this repository.
5. Change README language from "interactive preview" to "static catalog" and explain that tracked images are the GitHub-facing experience.
6. Regenerate and rerun the showcase target and Xcode contract tests.

## Task 6: Make installation guidance non-destructive

**Files:**

- Modify: `scripts/generate.cjs`
- Regenerate: `README.md`
- Regenerate: `tools/README.md`
- Regenerate: editor, prompt, terminal, shell, and tool READMEs produced by the generator

1. Add bootstrap instructions: supported Node range, `npm ci`, and `npx playwright install chromium` only when rendering the showcase.
2. Replace whole-file Starship, AeroSpace, and Jujutsu copy commands with explicit backup-and-merge guidance. State that AeroSpace and Jujutsu files include behavior, routing, defaults, or aliases and must not overwrite an existing config.
3. Add missing parent-directory creation to Neovim instructions.
4. Make tmux source-line installation idempotent.
5. Correct stale version/generator references, including `scripts/generate.cjs` and V0.2 wording.
6. Run the documentation safety contracts until green.

## Task 7: Separate deterministic checks from intentional captures

**Files:**

- Modify: `scripts/render-showcase.cjs`
- Modify: `scripts/render-local-captures.cjs` only if needed for clearer errors
- Modify: `scripts/validate.cjs`
- Modify: `package.json`
- Create: `showcase/assets/generated/manifest.json`

1. Keep `npm run render:showcase` limited to browser-rendered repository showcase images. Keep native application captures behind the explicit `npm run render:local` command.
2. Replace CDN-loaded React, Babel, and Monaspace assets with pinned npm dependencies. Precompile JSX during generation and render Chromium offline so capture reproducibility does not depend on external hosts.
3. Have a successful showcase render write a stable manifest containing the screenshot inventory and SHA-256 fingerprint of all palette/showcase render inputs.
4. Add `--check` mode that performs no writes, verifies the full PNG inventory, and fails when the stored input fingerprint is stale. Add `check:showcase` to package scripts.
5. Add `--strict` to validation: missing optional Emacs, Fish, PowerShell, or Neovim tooling is a failure in strict mode. In normal mode, finish with an explicit skip count instead of claiming an unqualified full pass.
6. Add `validate:strict` and document the distinction between portable CI validation and a fully provisioned local strict run.
7. Render the showcase once after all visual source changes and run `npm run check:showcase`.

## Task 8: Add license metadata and continuous verification

**Files:**

- Create: `LICENSE`
- Modify: `package.json`
- Modify: `scripts/generate.cjs`
- Regenerate: `editors/vscode/package.json`
- Create: `.github/workflows/verify.yml`

1. Add the standard MIT text with `Copyright (c) 2026 Bizarre Industries`.
2. Add `"license": "MIT"` to the root and generated VS Code package metadata.
3. Align `engines.node` with the lockfile's transitive requirement: `^20.17.0 || >=22.9.0`.
4. Add a GitHub Actions workflow on pushes and pull requests using Node 22, `npm ci`, `npm test`, and `npm run check:showcase`.
5. Do not run or require native local-application captures in CI. Publish native screenshots only after a complete current-input recapture; otherwise keep them out of the tracked GitHub catalog.

## Task 9: Regenerate, inspect, and verify the whole repository

**Files:** all generator-owned outputs and the existing Xcode deletions

1. Run `npm ci`.
2. Run `npm run generate` and inspect the manifest's obsolete-file removals.
3. Run `npm run render:showcase` once, without `render:local`.
4. Run `npm test`.
5. Run `npm run check:showcase`.
6. Run `npm run validate:strict` when the local optional tools are available; otherwise report the exact missing tools and rely only on the explicitly partial portable validation result.
7. Run `git diff --check`, `git status --short`, and a focused `rg -ni 'xcode|interactive preview|cp .*starship\.toml .*\.config/starship\.toml|cp .*aerospace\.toml|cp .*jujutsu/config\.toml'` audit.
8. Review representative generated outputs for all five variants, with particular attention to Paper/Bone foreground accents, Base16 mappings, tmux branch syntax, and showcase target labels.
9. Request an independent code review, address every validated issue, and repeat the complete verification commands before claiming completion.

## Out of scope by explicit product decision

- Deploying or wiring a truly interactive Bizarre Industries website.
- Capturing native local applications automatically or in CI.
- Reintroducing Xcode support in any form.
- Committing, pushing, or opening a pull request unless separately requested.
