# Agent Handoff

## Handoff metadata

| Field | Value |
|---|---|
| Last verified | `2026-07-17T00:50:20+04:00` |
| Status | `PARTIAL` |
| Repository | `.` |
| Snapshot branch | `agent/themes-design-system-release` |
| Snapshot HEAD | `fb9c460186d70be6b7ac4844f0428cb08f9c141a` |
| Upstream | `origin/agent/themes-design-system-release`, ahead 0, behind 0 |
| Base and merge base | `origin/main` at `905fe6295862d20ddecbc3979cc39c40d39731de` |
| Worktree at snapshot | Dirty only with this documentation reconciliation and its generated evidence refresh; one worktree |
| Canonical active plan | [`docs/superpowers/plans/2026-07-12-open-design-system.md`](superpowers/plans/2026-07-12-open-design-system.md) |
| Related pull requests | PR #11 is the signed-off replacement; PR #10 is superseded because its two inherited commits failed DCO |
| Objective confidence | HIGH |

`PARTIAL` is deliberate. The release snapshot is technically verified, but the tracked-only evidence hardening in Task 9 is not implemented because this is a handoff-only pass. Official-logo, typography, Xcode, showcase-interactivity, and Open Design naming decisions also remain explicitly deferred.

## Resume in 60 seconds

1. Work from repository root `.`.
2. Read ignored local [`AGENTS.md`](../AGENTS.md), this handoff, the [canonical plan](superpowers/plans/2026-07-12-open-design-system.md), and the [Open Design specification](superpowers/specs/2026-07-12-open-design-system-design.md).
3. Compare live state with this pre-merge snapshot:

   ```sh
   git status --porcelain=v2 --branch
   git branch --show-current
   git rev-parse HEAD
   git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'
   git rev-list --left-right --count HEAD...'@{upstream}'
   git worktree list --porcelain
   ```

4. Run the narrow baseline: `node --test test/open-design-evidence.test.cjs`.
5. Current executable action: if PR #11 is not merged, continue only the release transaction in `Exact next actions` steps 1 through 3. If it is merged and local `main` is clean, preserve this pointer and stop.
6. First unfinished implementation task, only after the feature freeze is explicitly lifted: Task 9, `Harden Evidence to Tracked Repository Inputs`.
7. Task 9 resumes at `scripts/lib/open-design/evidence.cjs`, function `listRepositoryEvidence()`, specifically its `git ls-files --cached --others --exclude-standard` `spawnSync` call, with regressions in `test/open-design-evidence.test.cjs`.
8. Task 9 acceptance criterion: tracked canonical sources remain evidence while arbitrary `untracked.md`, `.env`, `credentials.json`, and `secrets.txt` fixtures are absent from every evidence index and copied package path.

## Mission and definition of done

**VERIFIED FACT:** The implemented goal is a deterministic downstream Bizarre Industries themes adapter layered over existing platform frameworks and published as one repo-owned Open Design v1 package. Void is default, five artifact modes remain available, and Signal Lime remains the accent. The approved slogan is `Catch the Stars` without trailing punctuation; current generated theme surfaces still contain the older punctuated form and remain deferred identity drift.

**VERIFIED FACT:** Release completion requires one signed-off reviewed PR, passing repository gates, no secret findings in the release range, merged remote `main`, one clean local `main` worktree, and no local release branches.

**STRONG INFERENCE:** A safe steady-state generator must inventory tracked sources only. The migration-era need to capture untracked implementation no longer exists once this release is committed.

**OPEN UNKNOWN:** Product owners have not resolved official-asset consumption, Xcode restoration, static versus interactive showcase behavior, or Open Design project renaming.

Non-goals for this pass are feature implementation, brand redesign, Open Design application repair, dependency installation, and external-state deletion.

The repository release is done when the requested PR transaction and cleanup complete. The broader design-system objective remains `PARTIAL` until Task 9 and the deferred product decisions are separately authorized and completed.

## Source-of-truth order

1. The user’s feature freeze and handoff-only release instruction.
2. Ignored local [`AGENTS.md`](../AGENTS.md) for the Hermes resume pointer.
3. This handoff for live state, failures, and continuation.
4. The [canonical active plan](superpowers/plans/2026-07-12-open-design-system.md) for task execution and status.
5. The [Open Design specification](superpowers/specs/2026-07-12-open-design-system-design.md) for current package behavior and the tracked-only target.
6. The [Bizarre Industries design-language specification](superpowers/specs/2026-07-12-bizarre-industries-design-language.md) for cross-platform architecture.
7. `../design-system/brand/identity.json`, `../design-system/brand/assets.json`, and `../design-system/packages/assets/logo/` for official identity facts.
8. `palette.js`, `scripts/generate.cjs`, and `scripts/generate-open-design.cjs` for current repository-local behavior.
9. `test/*.test.cjs`, CI, and PR #11 checks for executable evidence.
10. Generated files only as derived evidence. Never hand-edit them as authority.

When official identity and current themes output disagree, `../design-system` governs identity and this repository remains a downstream adapter. When current implementation and the tracked-only target disagree, the current code describes shipped behavior and Task 9 describes required continuation.

## Repository snapshot

Original pre-documentation baseline, captured before handoff edits:

- branch `main`, HEAD `2dab3d9faf2f5115275b779beefd8d61ddfa06d3`;
- `origin/main` at `905fe6295862d20ddecbc3979cc39c40d39731de`, ahead 2, behind 0;
- one worktree, 0 staged paths, 346 modified tracked paths, 548 untracked nonignored paths, and 10 tracked deletions;
- every pre-existing modified and untracked path was treated as user work and preserved.

Release-reconstruction baseline before this correction:

- clean branch `agent/themes-design-system-release` at `fb9c460186d70be6b7ac4844f0428cb08f9c141a`;
- one signed-off commit directly above merge base `905fe6295862d20ddecbc3979cc39c40d39731de`;
- tree identical to the prior `agent/open-design-handoff` branch before the documentation corrections in this pass;
- PR #11 open and mergeable; DCO and both Verify jobs passed;
- committed range contained 892 paths: 546 added, 336 modified, 10 deleted; 91,093 insertions and 3,942 deletions.

This handoff correction modifies only governing documentation and deterministic copies of that documentation inside the generated package.

## Current state summary

- **VERIFIED FACT:** `npm test` passes 130/130 contracts. Focused Open Design tests pass 92/92. Portable validation passes with 21 optional checks skipped.
- **VERIFIED FACT:** The package owns 515 entries plus its ownership manifest, indexes 474 evidence files, contains no symlink, and currently totals 4,128,775 evidence bytes after documentation reconciliation.
- **VERIFIED FACT:** PR #11 uses signed-off history; DCO and both Verify jobs passed before this documentation correction. PR checks must rerun after the correction commit.
- **VERIFIED FACT:** CodeRabbit CLI authentication succeeded, but the security boundary rejected sending the full diff and `AGENTS.md` to the external service. No data was sent. Sourcery could not review 892 files. Two local read-only audits completed.
- **VERIFIED FACT:** Independent implementation review found one security risk: `listRepositoryEvidence()` includes arbitrary nonignored untracked files. Current committed bytes passed Gitleaks; future generation is the risk.
- **STRONG INFERENCE:** Merging the documented checkpoint is acceptable only as the explicitly frozen downstream adapter snapshot. It must not be represented as the final company-wide design system.
- **OPEN UNKNOWN:** Whether Task 9 should use pure tracked-only enumeration or tracked plus a narrow reviewed allowlist. Tracked-only is the recommended default.

## Completed work

| Completed item | File or symbol | Commit or state | Verification | Acceptance evidence |
|---|---|---|---|---|
| Palette and adapter remediation | `palette.js`, `scripts/generate.cjs`, generated adapter directories | release tree at `fb9c460` | `npm test` | 130 contracts pass; generated outputs current |
| Safe generated ownership | `scripts/lib/generated-files.cjs`, `generated-files.json` | release tree | `npm run check:generated` inside `npm test` | check mode detects missing, changed, obsolete, and protected outputs |
| Open Design model and renderers | `buildOpenDesignModel()`, `render*()` modules | Tasks 1, 4, 5 COMPLETE | `node --test test/open-design-*.test.cjs` | 92/92 focused contracts pass |
| Package publication safety | `createPackageWriter()`, `publishGeneration()` | Task 3 COMPLETE | `test/open-design-writer.test.cjs` within focused suite | ownership manifest publishes last; collisions and symlinks fail closed |
| Open Design orchestration | `buildOpenDesignPackage()`, `generateOpenDesignPackage()` | Task 6 COMPLETE | `npm run check:open-design` inside `npm test` | package bytes current and deterministic |
| Showcase | `scripts/render-showcase.cjs`, `showcase/**` | Task 7 COMPLETE | `npm run check:showcase` | 45 screenshots and 14 inputs pass |
| Open Design migration | package symlink, backup, project `ds-bizarre-industries` | Task 8 COMPLETE | fresh MCP bridge and package checks recorded in plan | one active repo link, backup preserved, metadata byte-identical |
| Release history repair | branch `agent/themes-design-system-release`, commit `fb9c460` | one signed-off squash commit above `origin/main` | local tree equality, DCO on PR #11 | no force-push or shared-history rewrite |
| Documentation reconciliation | this handoff, active plan, Open Design spec, deferred foundation plan | current documentation-only pass | link, structure, generated, and diff checks listed below | exact first unfinished task and evidence schema recorded |

## Work in progress

The only active work is the release transaction and this documentation correction. At snapshot time the correction touches governing Markdown plus generator-owned evidence indexes and copied Markdown. It is safe because no production symbol changes, `npm run generate:open-design` completed, and the full suite passes. Remaining release operations are: signed-off documentation commit, push, PR #11 recheck, final read-only review, merge, close superseded PR #10, delete release branches, align local `main`, and verify one clean worktree.

Task 9 is not in progress. The feature freeze remains active.

## Not started

- Task 9, tracked-only repository evidence hardening. Exact test-first steps are in the canonical plan.

No other item is listed here because logo, typography, Xcode, showcase, hardware, embedded, graphics, media, and official package publication are deferred product scope rather than unfinished work authorized in this pass.

## Changed-file ledger

| Path | Pre-edit Git state | Role in the work | Verified current behavior | Remaining work | Evidence | Risk or caution |
|---|---|---|---|---|---|---|
| `palette.js`, `scripts/generate.cjs`, `scripts/validate.cjs`, `scripts/check-generated.cjs`, `scripts/lib/generated-files.cjs` | Pre-existing modified or untracked implementation | Canonical theme model, root generation, validation, ownership | 130 contracts and portable validation pass | None in frozen release | `npm test` | Changes fan out across hundreds of ports |
| `scripts/generate-open-design.cjs`, `scripts/lib/open-design/*.cjs` | Pre-existing untracked implementation, now committed in release branch | Open Design model, evidence, rendering, orchestration, publication | 92 focused contracts pass; deterministic package current | Task 9 changes `listRepositoryEvidence()` later | focused suite; independent review | Current untracked enumeration can package arbitrary local files |
| `test/*.test.cjs` | Mixed pre-existing modified and untracked | 130 executable repository contracts | All pass | Add Task 9 RED regressions later | `npm test` | Existing evidence test intentionally asserts `untracked.md` inclusion |
| `.github/workflows/verify.yml`, `package.json`, `package-lock.json`, `.gitattributes`, `.gitignore`, `LICENSE` | Mixed modified and added | CI, scripts, dependencies, whitespace policy, exclusions, licensing | Verify jobs pass; dependencies resolve; Gitleaks found no release secret | None in frozen release | PR #11 checks; `npm ls --depth=0` | `.gitattributes` is intentionally narrow; `AGENTS.md` remains ignored |
| `apps/**`, `devtools/**`, `docs-sites/**`, `editors/**`, `prompt/**`, `shells/**`, `terminals/**`, `tools/**`, `web/**`, `wm/**` | Hundreds of pre-existing modified, added, and 5 Xcode deletions | Ready-made-framework theme adapters | Generated and portable checks pass | Xcode policy and slogan-punctuation propagation deferred | `npm test`; 10 total deletions include Xcode and showcase cleanup | Generated files must follow producer changes, never manual edits |
| `showcase/**` | Pre-existing modified, added, and 5 stale/native deletions | Static deterministic catalog | 45 screenshots, 14 inputs pass | Interactive-control decision deferred | `npm run check:showcase` | Current static behavior conflicts with broader design-language target |
| `design/open-design/bizarre-industries/**` | Initially untracked, now generator-owned | Published package, fonts, previews, evidence, copied docs | 515 owned entries plus manifest; 474 evidence files; no symlinks | Regenerate after Task 9 | `npm run check:open-design`; package tests | Never hand-edit; current badge and Monaspace are not official identity |
| `README.md`, `design/README.md`, `PALETTE.md`, `PORTS.md` | Pre-existing modified | User setup, catalog, palette, support matrix | Current generator and validation claims match code | None in frozen release | repository contracts and generated check | Root and design READMEs are generator-owned |
| `docs/agent-handoff.md` | Added during documentation pass; excluded from evidence | Canonical live resume state | Required 23 sections and seven-column ledgers present | Update when branch, HEAD, or first action changes | handoff structure/link audit | Snapshot necessarily predates its own commit and later merge |
| `docs/superpowers/plans/2026-07-12-open-design-system.md` | Pre-existing added, reconciled in this pass | Canonical execution plan | Tasks 1-8 COMPLETE; Task 9 NOT STARTED | Task 9 only after reauthorization | 51 completed historical checkboxes plus exact new unchecked steps | Copied into package evidence, so source edits require regeneration |
| `docs/superpowers/specs/2026-07-12-open-design-system-design.md` | Pre-existing added, corrected in this pass | Implemented package specification and tracked-only target | Current gap and future requirement both explicit | Reconcile after Task 9 | source/generated byte check | Must not claim unfinished tracked-only behavior is already shipped |
| `docs/superpowers/plans/2026-07-12-design-system-foundation.md` | Pre-existing added, path/slogan correction in this pass | Deferred sibling-repository plan | Uses repository-relative paths and exact no-period slogan | Entire plan deferred | documentation audit | Not the active themes plan |
| `docs/superpowers/specs/2026-07-12-bizarre-industries-design-language.md` | Pre-existing added, slogan correction in this pass | Broader architecture and official identity target | Canonical no-period slogan now matches approved identity; implementation drift explicit | Product decisions deferred | documentation audit and handoff source-of-truth order | Specification is a target, not proof that generated ports already match |
| Remediation and historical plans | Pre-existing added | Historical rationale and completed recipes | Reviewed; intentional conflicts identified | None in current release | handoff source-of-truth order | Do not treat historical plans as live state |
| ignored `AGENTS.md` | Local-only resume context, not tracked | Hermes startup pointer | Points to this handoff and active plan | Keep while status is PARTIAL | `git check-ignore -v AGENTS.md` | Never stage or package it |

The committed release range accounts for every relevant path through these nonoverlapping functional groups. Generated evidence copies mirror their source rows and are not separate authorities.

## Relevant architecture and data flow

```text
../design-system identity facts (future reviewed dependency)
                  |
                  v
palette.js --> scripts/generate.cjs --> platform adapter outputs
     |
     +--> scripts/generate-open-design.cjs::buildOpenDesignPackage()
             |
             +--> evidence.cjs::listRepositoryEvidence()
             +--> model.cjs::buildOpenDesignModel()
             +--> render-*.cjs
             +--> package-writer.cjs::createPackageWriter()
                              |
                              v
              design/open-design/bizarre-industries/
                              |
                              v
                 Open Design catalog symlink
```

`listRepositoryEvidence()` asks Git for cached plus nonignored untracked paths, validates containment, sizes, identities, symlinks, exclusions, and hashes, then produces `EvidenceEntry[]`. `buildOpenDesignPackage()` captures implementation identity, builds the model, renders outputs, re-enumerates evidence to detect drift, and hands a complete map to `createPackageWriter()`. The writer scans ownership, refuses unowned or unsafe collisions, writes files atomically, and publishes `package-files.json` last. Check mode performs the same comparison without writes.

Task 9 changes only the Git enumeration boundary. It must preserve all later validation, rendering, hashing, and writer behavior.

## Decisions and rationale

- **VERIFIED FACT:** Signal Lime remains `#C6FF24`; contrast-specific text roles refine it without replacing it.
- **VERIFIED FACT:** `Catch the Stars` is canonical without trailing punctuation. Current generated adapters and showcase strings still use `CATCH THE STARS.`; this handoff-only pass records rather than propagates the identity change.
- **VERIFIED FACT:** This repository is a downstream themes adapter, not the official identity authority.
- **VERIFIED FACT:** The Open Design backup and separate `brand-github-29e67b` project were preserved. No external deletion is authorized.
- **VERIFIED FACT:** The DCO-failing PR #10 history was not force-pushed. PR #11 uses a clean signed-off replacement branch.
- **STRONG INFERENCE:** Tracked-only evidence is safer than a filename denylist because secret filenames are unbounded.
- **STRONG INFERENCE:** The migration checkpoint may merge as an explicitly documented frozen snapshot because the current bytes are secret-clean and Task 9 is outside this handoff-only pass.
- **OPEN UNKNOWN:** Whether a narrow reviewed allowlist will ever be needed after tracked-only enumeration. Default to no allowlist until a required tracked-source gap is reproduced.

Rejected approaches: force-pushing PR #10, enabling DCO bypass, repairing generated files manually, modifying the signed Open Design app, inventing replacement logo artwork, and silently choosing between Xcode/showcase policy conflicts.

## Invariants and constraints

- Preserve native platform conventions and ready-made frameworks. Bizarre styling layers on top.
- Preserve public theme names, five variants, Signal Lime, and current package schema unless a reviewed migration says otherwise.
- Official logo files must be approved artwork without `<text>` and include primary, inverse, and transparent variants.
- Generated outputs, package evidence, and showcase images are derived and must never become editable authorities.
- Package publication remains deterministic, collision-safe, symlink-rejecting, byte-bounded, and manifest-last.
- Never package credentials, tokens, PIDs, `.env`, auth state, caches, ignored runtime state, `AGENTS.md`, or `.superpowers/brainstorm/`.
- Never force-push shared history, discard unexplained work, delete the Open Design backup, delete projects, or modify global app/MCP configuration.
- Node.js 22 and current lockfile dependencies govern tests. Optional validators require `emacs`, `fish`, `pwsh`, and `nvim` only for strict parity.
- Documentation paths remain repository-relative. External sibling references use `../design-system`.
- Current feature freeze permits documentation, verification, signed-off release commits, PR review, merge, and branch/worktree cleanup only.

## Documentation impact

| Document | Disposition | Evidence or remaining issue |
|---|---|---|
| `README.md` | Current generated behavior, identity drift deferred | repository contracts and `check:generated` pass; punctuated slogan remains until an authorized generator change |
| `design/README.md` | Already correct and generator-owned | Open Design package commands match scripts |
| `PALETTE.md`, `PORTS.md` | Current generated behavior, identity drift deferred | generated and validation checks pass; `PALETTE.md` retains the older punctuated slogan |
| `docs/agent-handoff.md` | Updated | live release snapshot, seven-column ledgers, Task 9 resume action |
| canonical active plan | Updated | 130 total contracts, PR state, Task 9 exact test-first plan |
| Open Design specification | Updated | current untracked gap and tracked-only target separated |
| Bizarre design-language specification | Updated | canonical slogan punctuation corrected; broader official target remains deferred |
| design-system foundation plan | Updated | personal paths removed; slogan punctuation corrected |
| remediation and historical plans | Reviewed, unchanged | remain historical, not active state |
| generated `DESIGN.md`, `USAGE.md`, evidence indexes, copied governing docs | Regenerated where source-backed | `npm run check:open-design` passes |

## Verification ledger

| Timestamp | Command | Working directory | Result | Exit code | Meaning | Follow-up |
|---|---|---|---|---:|---|---|
| `2026-07-17T00:32:40+04:00` | `git status --porcelain=v2 --branch` plus branch, upstream, merge-base, worktree, log, and diff snapshot commands | `.` | PASS | 0 | Clean signed-off release baseline captured before correction | Preserve as pre-edit baseline |
| `2026-07-17T00:49:48+04:00` | `npm run generate:open-design` | `.` | PASS | 0 | Final governing documentation copied and package manifests refreshed deterministically | Run read-only package check in full suite |
| `2026-07-17T00:36:57+04:00` | `npm test` | `.` | PASS | 0 | 130/130 contracts, generated check, Open Design check, and portable validation pass; 21 optional checks skipped | None for portable gate |
| `2026-07-17T00:37:29+04:00` | `node --test test/open-design-*.test.cjs` | `.` | PASS | 0 | 92/92 focused Open Design contracts pass | Task 9 must add a new RED regression later |
| `2026-07-17T00:37:29+04:00` | `npm run check:showcase` | `.` | PASS | 0 | 45 screenshots and 14 inputs are current | None |
| `2026-07-17T00:37:29+04:00` | `npm run validate:strict` | `.` | FAIL, ENVIRONMENT | 1 | Content checks ran; strict parity lacks `emacs`, `fish`, `pwsh`, and `nvim` | Install only if strict local parity is required |
| `2026-07-17T00:37:29+04:00` | `git diff --check origin/main && npm ls --depth=0` | `.` | PASS | 0 | No release-range whitespace errors; top-level dependency graph resolves | Repeat diff check after final handoff edit |
| `2026-07-17T00:50:14+04:00` | source/generated-copy byte comparisons; handoff and plan schema audit; `git diff --check origin/main`; `npm run check:open-design` | `.` | PASS | 0 | Four governing source/copy pairs match, 23/23 sections and plan fields exist, diff is clean, package current | Repeat diff check after the final factual correction |
| `2026-07-17T00:50:20+04:00` | `npm test` | `.` | PASS | 0 | Final reconciled snapshot passes 130/130 contracts and portable validation | None |
| `2026-07-17T00:50:20+04:00` | `npm run check:showcase`; source and generated documentation Gitleaks directory scans | `.` | PASS | 0 | 45 screenshots, 14 inputs, and zero documentation secret findings | Run full commit-range scan after the signed-off commit |

## Known failures and blockers

### Untracked evidence can copy local secrets

- Symptom: `listRepositoryEvidence()` invokes `git ls-files --cached --others --exclude-standard`; the focused fixture explicitly expects `untracked.md`.
- Reproduction: `git check-ignore --no-index .env credentials.json secrets.txt` returns no matches, so those names are eligible when present and nonignored.
- Output summary: independent review classified this as a high-risk future-generation footgun. The current committed release range passed Gitleaks with zero findings.
- Ownership: `scripts/lib/open-design/evidence.cjs`, `test/open-design-evidence.test.cjs`, Task 9.
- Predates this pass: yes. It was an intentional migration rule while implementation was untracked.
- Evidence needed: a RED fixture proving arbitrary untracked and secret-like paths enter current evidence, followed by tracked-only PASS evidence.
- Next safe diagnostic: on a new authorized branch after release, add only the Task 9 fixture and run `node --test test/open-design-evidence.test.cjs`.

### Strict validation executables absent

- Symptom: `npm run validate:strict` exits 1.
- Reproduction: run the command from `.`.
- Output summary: missing `emacs`, `fish`, `pwsh`, and `nvim`; portable validation passes with 21 skips.
- Ownership: local environment, not repository content.
- Predates this pass: yes.
- Evidence needed: rerun strict validation on a host with all four tools.
- Next safe diagnostic: install nothing during handoff; use CI or a prepared strict-validation host when parity is required.

### External review limits

- Symptom: Sourcery cannot fetch a 892-file diff; CodeRabbit GitHub review previously skipped the equivalent diff; CodeRabbit CLI transmission was rejected by the local security boundary.
- Reproduction: PR review metadata records the file-limit response; CLI attempt returned a policy rejection before transmission.
- Output summary: no external AI review result exists. Two local read-only audits reviewed implementation and handoff separately.
- Ownership: external review limits and local data-egress policy.
- Predates this pass: no.
- Evidence needed: none for this frozen release; Task 9 finding is already concrete and locally reproduced.
- Next safe diagnostic: review canonical sources and generated equivalence locally, not by bypassing the security boundary.

## Environment and prerequisites

- Node.js `v22.22.3`; npm `10.9.8`.
- Installed dependencies must match `package-lock.json`; `npm ls --depth=0` passes.
- Git with Signed-off-by support; do not enable DCO bypass.
- GitHub CLI `2.96.0` is authenticated for PR operations.
- CodeRabbit CLI `0.6.5` is authenticated, but full-diff external transmission is not authorized by the local security boundary.
- Open Design `0.14.1`; fresh MCP bridge uses protocol `2025-11-25`, server `0.2.0`, 18 tools, and explicit daemon URL variable `OPEN_DESIGN_DAEMON_URL`. Never record credential values.
- Optional strict tools: `emacs`, `fish`, `pwsh`, `nvim`.

## Exact next actions

1. **Release transaction, current handoff-only scope.** In `docs/agent-handoff.md` and the canonical plan, review the final documentation diff; constraint: no production-code edits; run `npm test`, `npm run check:showcase`, handoff structure/link checks, Gitleaks, and `git diff --check`; expected result: only intentional docs and generated evidence differ; complete when a signed-off correction commit is pushed to PR #11 and all required checks pass.
2. **PR review and merge.** In PR #11, inspect checks and the two local audit conclusions; constraint: never claim CodeRabbit produced local findings; expected result: DCO and both Verify jobs pass with no undisclosed release blocker; complete when PR #11 merges without force-push.
3. **Cleanup.** Switch to `main`, align it to `origin/main` without discarding unique history, close PR #10, delete remote and local release branches, and prune worktree metadata; constraint: preserve content and never use destructive reset; expected result: exactly one clean `main` worktree and no local release branches.
4. **Task 9, only after explicit implementation authorization.** In `test/open-design-evidence.test.cjs`, extend `enumerates complete Git evidence...` with arbitrary untracked and secret-like fixtures; intended change: establish RED for current behavior; constraint: do not weaken existing symlink, containment, byte-limit, or generated-owner tests; verify with `node --test test/open-design-evidence.test.cjs`; expected result: failure specifically because untracked files are present; complete when RED is captured.
5. **Task 9 implementation.** In `scripts/lib/open-design/evidence.cjs::listRepositoryEvidence()`, remove `--others` and `--exclude-standard` from the Git `spawnSync` call; intended change: tracked-only evidence; verify with the focused test, `npm test`, package regeneration, showcase check, and diff check; acceptance: all tracked canonical sources remain, arbitrary untracked and secret-like fixtures never enter any evidence index or copied path.

## Do not redo

- Do not recreate, move, or delete the Open Design backup.
- Do not reinstall the linked package while its symlink and hashes remain valid.
- Do not reactivate, rename, or delete `brand-github-29e67b` or `ds-bizarre-industries` during repository work.
- Do not retry the rejected CodeRabbit data transmission or bypass the security boundary.
- Do not reopen DCO history repair; PR #11 is the signed-off replacement.
- Do not regenerate unless a source document, generator, or Task 9 behavior changes.
- Do not hand-edit generated package files or approved logo artwork.
- Do not revisit Signal Lime or slogan wording without new product evidence.

## Deferred or out of scope

- Approved primary, inverse, and transparent logo integration from `../design-system`.
- Official Unbounded, Big Shoulders Stencil, Hanken Grotesk, and JetBrains Mono adoption.
- Propagating the approved unpunctuated slogan through generators and every derived adapter and showcase surface.
- Stable canonical `@bizarre/*` package publication and downstream consumption.
- Xcode support decision and static versus interactive showcase decision.
- Open Design project rename from `ds-bizarre-industries`.
- Hallmark pane-chrome, section-heading, and responsive refinements.
- Hardware, embedded, motion, media, graphics, and full cross-platform component kits.
- Open Design application packaging repair and global MCP changes.

These require separate product or implementation authorization and must not be smuggled into Task 9.

## Open questions

1. **Tracked-only versus allowlist.** Evidence checked: all current required sources are committed after release; arbitrary untracked names are unsafe. Recommended default: tracked-only, no allowlist until a concrete missing tracked source is reproduced.
2. **Official asset consumption.** Evidence checked: approved assets and fonts exist in `../design-system`; current badge and Monaspace differ. Recommended default: consume a versioned canonical package, not copied approximations.
3. **Xcode support.** Evidence checked: current remediation and tests remove it; broad design-language spec expects cross-platform coverage. Recommended default: keep removal until one explicit product decision updates spec, plan, tests, and generator together.
4. **Showcase interactivity.** Evidence checked: current deterministic catalog is static; broader language envisions richer interaction. Recommended default: preserve static release output and design interactivity as a separate product surface.
5. **Open Design project name.** Evidence checked: `ds-bizarre-industries` exists and works. Recommended default: do not migrate until downstream consumers require a more specific identifier.

## Recovery and rollback

- If PR #11 checks fail, keep the release branch and inspect the exact failing command. Do not merge, reset, clean, restore, or force-push.
- If generated docs drift, inspect the governing source diff, rerun `npm run generate:open-design`, then rerun package and full checks. Never patch copies manually.
- If release must be undone after merge, use a new signed-off revert commit through a reviewed PR. Do not rewrite shared history.
- If local `main` cannot fast-forward because of its old unique documentation commits, preserve those commits through the already-proven replacement branch or a temporary archival ref before intentionally aligning the local branch pointer. Do not discard unknown content.
- External Open Design rollback requires separate action-time confirmation. The preserved backup and project must remain untouched during normal repository recovery.

## Handoff maintenance protocol

Every future working session must:

1. compare branch, HEAD, upstream divergence, worktrees, and status with this snapshot;
2. update this handoff before coding when those facts differ materially;
3. update plan task status only after current verification proves it;
4. append real timestamps, exact commands, exit codes, outcomes, meaning, and follow-up to the verification ledger;
5. replace the first exact next action before ending;
6. keep ignored `AGENTS.md` concise and linked only to this handoff and the canonical plan;
7. remove or archive the active-work pointer only when the broader goal, including Task 9 or an explicit deferral decision, is fully complete.

Replace stale facts instead of appending contradictory status logs. Preserve the original pre-edit baseline and distinguish documentation-only edits from pre-existing implementation work.
