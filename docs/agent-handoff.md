# Agent Handoff

## Handoff metadata

| Field | Value |
|---|---|
| Status | PARTIAL |
| Captured | 2026-07-17T00:03:32+04:00 |
| Repository | `/Users/binghzal/Developer/themes` |
| Branch at capture | `main` |
| HEAD at capture | `2dab3d9faf2f5115275b779beefd8d61ddfa06d3` |
| Upstream | `origin/main` at `905fe6295862d20ddecbc3979cc39c40d39731de` |
| Ahead / behind | 2 / 0 |
| Active worktrees | 1 |
| Handoff owner | Next Hermes or repository maintainer |

PARTIAL means the repo-owned themes adapter and Open Design migration are technically complete, but the broader official Bizarre Industries identity is not converged. The approved logo and type system, evidence governance, Xcode policy, and showcase-interactivity policy remain explicit follow-up work. No further implementation was performed after the user froze feature work.

## Resume in 60 seconds

1. Run `git status --short --branch` and `git worktree list --porcelain` from the repository root.
2. Read this file, then read the [canonical implementation plan](superpowers/plans/2026-07-12-open-design-system.md).
3. Confirm the checked-out branch and HEAD against the release result. This handoff snapshot was written before the final commit and pull-request transaction.
4. Do not resume feature work. If release is complete and `main` is clean, stop until the deferred identity work is explicitly reauthorized.
5. If release is incomplete, continue only the verification, commit, pull-request review, merge, and cleanup transaction authorized on 2026-07-16.

First resume command:

```sh
git status --short --branch && git worktree list --porcelain && cat docs/agent-handoff.md
```

## Mission and definition of done

The current repository mission was to build a deterministic Bizarre Industries themes layer on top of ready-made platform frameworks, then expose it as a repo-owned Open Design v1 package. The adapter preserves native behavior while adding Bizarre personality, with Signal Lime retained as the accent and “Catch the Stars” retained as the slogan.

The current mission is done when:

1. repository, generated-output, showcase, Open Design, and portable validation pass from one final snapshot;
2. no secret, token, PID, or transient brainstorm state is staged or packaged;
3. the entire intended worktree is committed with sign-off on a release branch;
4. a ready pull request is created, independently reviewed, and merged without force-pushing;
5. the local repository returns to clean `main`, with only the primary worktree and no release branch left behind;
6. unresolved official-brand work stays recorded rather than guessed.

The first five criteria are release work. Criterion 6 is why this handoff remains PARTIAL for the broader product objective.

## Source-of-truth order

Use this order when sources disagree:

1. The user’s latest instruction, including the feature freeze and release authorization.
2. The sibling `/Users/binghzal/Developer/design-system/brand/identity.json`, `brand/assets.json`, and approved asset package for official logo, slogan, and typography facts.
3. The [Bizarre Industries design-language specification](superpowers/specs/2026-07-12-bizarre-industries-design-language.md) for cross-platform architecture and the rule that themes sit downstream of the official design system.
4. The [Open Design adapter specification](superpowers/specs/2026-07-12-open-design-system-design.md) for this repository’s implemented package boundary.
5. The [canonical implementation plan](superpowers/plans/2026-07-12-open-design-system.md) for completed task evidence.
6. [`palette.js`](../palette.js) and its generators for current repository-local theme values.
7. Generated files as evidence only. Never hand-edit them as a new authority.

For the current adapter, the specific Open Design plan governs implemented behavior. For official identity, the sibling `design-system` repository governs. This prevents the current Monaspace and badge output from being misrepresented as the official brand system.

## Repository snapshot

Original pre-edit baseline, preserved before documentation or implementation reconciliation:

- branch `main`, HEAD `2dab3d9faf2f5115275b779beefd8d61ddfa06d3`;
- upstream `origin/main`, 2 ahead and 0 behind;
- 1 worktree;
- 0 staged paths;
- 346 modified tracked paths;
- 548 untracked, non-ignored files;
- 360 condensed status rows.

Pre-release snapshot at 2026-07-16T23:30:14+04:00:

- 0 staged paths;
- 347 modified tracked paths;
- 542 untracked, non-ignored files;
- 361 condensed status rows;
- 10 tracked deletions;
- tracked diff: 347 files, 3,479 insertions, 3,942 deletions;
- one worktree at `/Users/binghzal/Developer/themes`.

Most untracked files are intentional tests, generation modules, documentation, and the generated Open Design package. Untracked never meant disposable.

## Current state summary

- The core repository remediation and Open Design adapter implementation are complete.
- The final repository pipeline passes 130/130 contracts. Open Design contracts pass 92/92.
- The generated package owns 515 files and indexes 474 repository evidence files totaling 4,115,580 bytes.
- The package contains `system/kit.html`, nine previews, all five artifact-level modes, deterministic source evidence, and local Monaspace fonts.
- `.superpowers/brainstorm/`, `AGENTS.md`, and this volatile handoff are excluded from package evidence.
- Open Design has exactly one active `user:bizarre-industries` catalog entry linked to this repository.
- The old extracted system is preserved at `design-system-backups/bizarre-industries-20260716T182133Z`.
- Project `brand-github-29e67b` is preserved. Workspace `ds-bizarre-industries` was created intentionally by activation.
- Fresh MCP verification passes through an explicit daemon URL. The preloaded MCP transport remains stale.
- Feature work is frozen. Only release and handoff work remains authorized.

## Completed work

1. Corrected palette contrast and propagated deterministic theme outputs across supported adapters.
2. Added safe generated-file ownership, checks, CI entrypoints, and repository contracts.
3. Rebuilt the static showcase with 45 deterministic screenshots and 14 source inputs.
4. Removed stale native captures, the interactive tweak panel, and Xcode outputs under the active remediation plan.
5. Added MIT metadata and preserved third-party font licenses.
6. Implemented the Open Design model, evidence inventory, writer, renderers, orchestration, check mode, and 92 focused contracts.
7. Added `projectId: ds-bizarre-industries` and `system/kit.html` contracts.
8. Excluded transient brainstorm state and the volatile handoff from generated evidence.
9. Regenerated the complete Open Design package.
10. Preserved the former Open Design catalog entry and installed the repo package through the supported local endpoint.
11. Activated and visually verified the package. Void uses `#0E0E0E`, Signal Lime uses `#C6FF24`, Monaspace Xenon loads, and fallback blue is absent.
12. Verified a fresh Open Design MCP bridge: protocol `2025-11-25`, server 0.2.0, 18 tools, 511 readable package files, and byte-identical repository, workspace, and MCP `DESIGN.md`.

## Work in progress

Only the release transaction:

1. refresh the complete verification matrix after this documentation reconciliation;
2. create a signed-off release commit on `agent/open-design-handoff`;
3. push and open a ready pull request;
4. run CodeRabbit and repository review checks;
5. merge without force-pushing;
6. return locally to clean `main` and remove only extra release worktrees and branches.

No feature or design implementation is in progress.

## Not started

- Replacing the generated text badge with the approved primary, inverse, and transparent logo marks.
- Adopting the official Unbounded, Big Shoulders Stencil, Hanken Grotesk, and JetBrains Mono typography contract in the themes adapter.
- Publishing or consuming a stable canonical `@bizarre/*` design-system package.
- Moving evidence policy from all non-ignored working-tree files to tracked or explicitly allowlisted files.
- Resolving whether Xcode support should be restored.
- Resolving whether the static showcase should regain interactive controls.
- Renaming the downstream Open Design project from the generic `ds-bizarre-industries` identifier.
- Addressing the Hallmark design-audit observations for pane chrome, section headings, and responsive guardrails.

## Changed-file ledger

| Area | Paths | Purpose and risk |
|---|---|---|
| Canonical theme model | `palette.js`, `PALETTE.md`, `PORTS.md` | Signal Lime, accessible roles, five variants, and port inventory. Wrong changes fan out across every adapter. |
| Generation and validation | `scripts/generate.cjs`, `scripts/check-generated.cjs`, `scripts/validate.cjs`, `scripts/lib/generated-files.cjs`, `generated-files.json` | Deterministic ownership and validation. Generated outputs must follow producer changes. |
| Open Design implementation | `scripts/generate-open-design.cjs`, `scripts/lib/open-design/*.cjs` | Model, evidence, fonts, renderers, safe writer, and package publication. |
| Open Design contracts | `test/open-design-*.test.cjs` | 92 focused tests, including project metadata, system kit, exclusions, collisions, and read-only check mode. |
| Repository contracts | `test/*.test.cjs`, `.github/workflows/verify.yml`, `package.json`, `package-lock.json` | Full 129-test repository boundary and CI command surface. |
| Generated Open Design package | `design/open-design/bizarre-industries/**` | 515 owned package files. Never hand-edit. Current badge and typography are provisional adapter output, not official identity. |
| Showcase | `showcase/**`, including 45 generated PNGs | Deterministic static catalog. Interactive panel and four local native captures are deleted. |
| Generated adapters | `apps/**`, `devtools/**`, `docs-sites/**`, `editors/**`, `prompt/**`, `shells/**`, `terminals/**`, `tools/**`, `web/**`, `wm/**` | Theme ports generated from repository-local palette. Xcode deletions are an unresolved policy conflict. |
| Identity and catalog assets | `devtools/github-readme-assets/bizarre-badge.svg`, `LICENSE` | Current generated badge contains text and is not the approved logo. License is intentional. |
| Documentation | `README.md`, `design/README.md`, this handoff, the active plan, Open Design spec, remediation plan, and foundation plan | Generated usage plus source-of-truth reconciliation. Root and design READMEs are generator-owned. |
| Safety boundary | `.gitignore`, `scripts/lib/open-design/evidence.cjs`, `test/open-design-evidence.test.cjs` | Prevent transient brainstorm state and volatile handoff content from entering the package. |
| Git whitespace policy | `.gitattributes` | Ignores whitespace diagnostics only for byte-preserved third-party licenses and repository evidence copies. Source documentation remains checked normally. |
| Local resume context | ignored `AGENTS.md` | Points Hermes to this handoff and plan. It must remain unstaged. |

Implementation files altered after the user froze feature work: NONE. This final pass changes documentation, then refreshes only generator-owned evidence required to keep the package truthful.

## Relevant architecture and data flow

```text
Official identity facts
/Users/binghzal/Developer/design-system
             |
             | future reviewed downstream integration
             v
themes/palette.js + repository sources
             |
             +--> scripts/generate.cjs --> generated app/editor/tool/theme ports
             |
             +--> scripts/generate-open-design.cjs
                         |
                         +--> design/open-design/bizarre-industries
                                      |
                                      +--> Open Design catalog symlink
                                                   |
                                                   +--> workspace ds-bizarre-industries
```

Open Design is a consumer, not an editable palette authority. Platform adapters should layer Bizarre tokens and components over native frameworks. For SwiftUI, native controls and behavior remain primary while Bizarre styling supplies personality.

## Decisions and rationale

- Signal Lime remains the accent. The palette was refined for contrast, not replaced.
- “Catch the Stars” is the correct slogan. Canonical identity stores it without trailing punctuation.
- The current package is a downstream themes adapter. Calling it the official or normative company-wide identity would contradict the sibling design-system source.
- The existing Open Design system was backed up, not deleted. This made installation reversible.
- The supported local endpoint was used. The signed Open Design application was not modified.
- The package currently inventories non-ignored tracked and untracked files because essential implementation was untracked during generation. This is accepted only for this checkpoint.
- Xcode removal and static showcase behavior remain as implemented because changing them during handoff would violate the feature freeze. Their governing specs disagree, so the conflict is explicit.
- The generic `ds-bizarre-industries` project ID remains because changing it after activation is external-state migration, not a documentation fix.

## Invariants and constraints

- Preserve native platform conventions and ready-made frameworks. The Bizarre layer sits on top.
- Never change Signal Lime wholesale without a separate brand decision.
- Approved logos must be exact approved artwork, contain no `<text>`, and include primary, inverse, and transparent variants.
- Never claim the current generated badge is the approved logo.
- Never treat Open Design, generated ports, or showcase screenshots as editable sources of truth.
- Never package `.superpowers/brainstorm/`, credentials, tokens, PID files, local auth state, caches, or ignored runtime state.
- Never force-push shared history or discard uncommitted user work.
- Never delete the Open Design backup or either project without separate action-time confirmation.
- Never modify `/Applications/Open Design.app` or global MCP configuration as a repository fix.
- Root `README.md`, `design/README.md`, package files, and screenshots are generator-owned.

## Documentation impact

- This file is the one authoritative resume document.
- The active plan now marks Tasks 1 through 8 complete and records exact migration evidence.
- The Open Design specification now describes the post-migration state and downstream adapter scope.
- The broader design-language specification remains the architectural target and records requirements that conflict with current Xcode and showcase behavior.
- The foundation plan remains deferred to the sibling design-system repository.
- Ignored `AGENTS.md` points only to this handoff and the canonical plan.

## Verification ledger

| Command or check | Status | Result |
|---|---|---|
| Original Git snapshot | PASS | Branch, HEAD, upstream, divergence, worktree, staged, tracked, untracked, and deletion counts captured before edits. |
| `npm test` | PASS | 130/130 repository contracts passed, then generated output, Open Design package, and portable validation passed. Fixture commit signing is disabled only inside tests. |
| `node --test test/open-design-*.test.cjs` | PASS | 92/92 focused Open Design tests passed. |
| `npm run check:generated` | PASS | Root generated outputs are current after final documentation reconciliation. |
| `npm run check:showcase` | PASS | 45 screenshots and 14 inputs are current. |
| `npm run check:open-design` | PASS | Package ownership, evidence, metadata, and generated bytes are current after final plan/spec regeneration. |
| `npm run validate` | PASS | Portable validation passed with 21 optional checks skipped. |
| `npm run validate:strict` | FAIL, ENVIRONMENT | Missing `emacs`, `fish`, `pwsh`, and `nvim`; no content defect identified. |
| `git diff --check HEAD` | PASS | No whitespace errors in the full worktree diff. |
| `npm ls --depth=0` | PASS | Installed top-level dependencies match the lockfile graph; no dependency error reported. |
| `codex mcp get open-design` | PASS | Open Design remains enabled as a stdio MCP configuration. Sensitive environment values were masked. |
| Fresh Open Design MCP bridge | PASS | Protocol `2025-11-25`, server 0.2.0, 18 tools, project and package reads succeeded. |
| Handoff structure and local Markdown-link audit | PASS | Exact title, all 23 required sections, and every local link in the six governing documents passed. No stale placeholders remain. |
| Redacted release-scope and secret scan | PASS | All 891 staged paths passed Gitleaks with 0 findings. No credential pattern or secret-like filename matched. Ignored runtime state remains outside staging and package ownership. |
| `git diff --cached --check` | PASS | The complete staged snapshot passes. `.gitattributes` suppresses diagnostics only for byte-preserved third-party licenses and repository evidence copies. |
| Final post-handoff release matrix at 2026-07-17T00:03:32+04:00 | PASS WITH ENVIRONMENT LIMIT | Regeneration, 130/130 repository contracts, 92/92 focused Open Design contracts, package checks, showcase checks, portable validation, dependency checks, staged secret checks, and staged whitespace checks passed. Only strict validation remains unavailable because four optional executables are absent. |

Environment: Node `v22.22.3`, npm `10.9.8`, Open Design `0.14.1`, GitHub CLI `2.96.0`, CodeRabbit CLI `0.6.5`.

## Known failures and blockers

1. **Official identity convergence:** current package uses a generated text badge and Monaspace. Approved marks and official fonts live in the sibling design-system repository. Immediate next action after reauthorization: vendor or consume the approved assets with provenance and exact hash tests, then regenerate.
2. **Evidence governance:** current evidence includes every non-ignored tracked and untracked file. Immediate next action after commit: change the contract to tracked files plus an explicit reviewed allowlist.
3. **Xcode and showcase policy conflict:** the broad design-language spec says preserve Xcode and interactive controls; the remediation plan and current tests remove them. Immediate next action: obtain one explicit product decision, then update the governing spec, plan, tests, and generator together.
4. **Project naming:** `ds-bizarre-industries` works but may be too generic for a downstream adapter. Immediate next action: decide whether to migrate to `ds-bizarre-industries-themes` before other products depend on it.
5. **Open Design runtime:** the packaged daemon has misplaced native dependencies and the preloaded MCP transport is stale. Immediate next diagnostic: start a fresh bridge with explicit daemon URL and verify protocol before blaming repository content.
6. **Strict validation environment:** `emacs`, `fish`, `pwsh`, and `nvim` are absent. Immediate next action: install them only if strict local parity is required, then rerun `npm run validate:strict`.
7. **Release authentication:** GitHub CLI token and CodeRabbit agent authentication were invalid or absent at the pre-release snapshot. Immediate next action: use the configured GitHub connector where possible; otherwise authenticate the narrow CLI before PR review or merge.

## Environment and prerequisites

- Node.js 22 and npm 10.
- Repository dependencies from `npm ci` or the existing verified lockfile installation.
- Git with commit sign-off. Fixture tests disable inherited cryptographic signing locally and do not change user config.
- Browser dependencies already used by the deterministic showcase checks.
- Open Design 0.14.1 only for live catalog/MCP verification. Repository checks do not require mutating the app.
- Fresh MCP bridge command must include `--daemon-url http://127.0.0.1:7456` while the preloaded transport remains stale.
- GitHub and CodeRabbit authentication are required for the requested remote release transaction.

## Exact next actions

1. Run the final verification matrix listed below without staging anything first.
2. Confirm no ignored runtime state, secret-like file, or private auth file would enter `git add -A`.
3. Create and switch to `agent/open-design-handoff`.
4. Stage the entire intended repository change, excluding ignored `AGENTS.md` and runtime state.
5. Review the staged summary and secret scan, then commit with sign-off using `complete themes design system handoff`.
6. Push the branch, create a ready pull request, run CodeRabbit plus repository checks, and resolve only release-blocking findings within the frozen scope.
7. Merge without force-pushing.
8. Switch to `main`, fast-forward from `origin/main`, delete the local release branch, prune stale worktree metadata, and verify exactly one clean `main` worktree remains.

Final verification matrix:

```sh
npm test
node --test test/open-design-*.test.cjs
npm run check:generated
npm run check:showcase
npm run check:open-design
npm run validate
npm run validate:strict
git diff --check HEAD
npm ls --depth=0
```

## Do not redo

- Do not recreate or move the Open Design backup.
- Do not reinstall the linked package if the current symlink resolves correctly.
- Do not reactivate or delete `brand-github-29e67b` or `ds-bizarre-industries`.
- Do not regenerate before a source document or generator changes.
- Do not re-investigate the Open Design 0.14.1 native-dependency defect as a themes bug.
- Do not replace the official marks with newly drawn approximations.
- Do not re-open the Signal Lime choice or slogan wording.
- Do not restore Xcode or interactivity without resolving the specification conflict first.

## Deferred or out of scope

- Full official brand package publication from the sibling repository.
- Hardware, embedded, motion, media, graphics, and cross-platform component kits beyond the current themes adapter.
- A new interactive marketing or documentation website.
- Open Design application repair or repackaging.
- Deleting backups, projects, or external runtime state.
- Redesigning the visual language during release.

## Open questions

1. Should the downstream adapter consume a versioned official package, or temporarily vendor exact approved logo/font bytes with hashes?
2. Should Xcode support be restored, or should the broader design-language specification be amended to make removal permanent?
3. Should the showcase remain static, or should interactive controls return outside generated evidence?
4. Should the Open Design project migrate to `ds-bizarre-industries-themes`?
5. After this commit, should evidence become tracked-only or tracked plus a narrow explicit allowlist?

## Recovery and rollback

- Repository generation is deterministic. If generated outputs drift, inspect the producer diff, then rerun the matching generator. Never repair generated files manually.
- Package writer ownership is recorded in `design/open-design/bizarre-industries/package-files.json`. It refuses unowned collisions and publishes the ownership manifest last.
- If the release branch fails before merge, keep it and report the exact failure. Do not reset or delete unmerged work.
- If a merged release must be reverted, use a normal signed-off revert commit through a new reviewed pull request. Never rewrite shared history.
- The Open Design catalog migration is reversible only after explicit confirmation: remove or move the active symlink, restore the timestamped backup to the catalog, then verify hashes and projects. Do not perform this during ordinary repository rollback.
- The temporary Open Design daemon loader is outside the repository. Restart with a fresh explicit bridge when needed; do not patch the signed app.

## Handoff maintenance protocol

Update this file whenever branch, HEAD, verification, external Open Design state, blocker status, or first next action changes. Keep one authoritative handoff and one canonical plan. Replace stale claims instead of appending contradictory status logs. Every update must include an ISO-8601 timestamp, exact command evidence, changed-file attribution, and any new risk. If implementation resumes, update the active plan in the same commit. If only release state changes, update this handoff or the final task report without inventing new implementation work.
