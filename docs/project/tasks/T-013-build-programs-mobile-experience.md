# T-013 — Build Programs mobile experience

- **Feature:** `F-006`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 2
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-02T14:35:46+02:00`
- **Updated:** `2026-09-03T11:35:06+02:00`
- **Started:** `2026-09-03T10:34:57+02:00`
- **Review started:** `2026-09-03T11:28:42+02:00` for second replacement
- **Approval requested:** `2026-09-03T11:31:08+02:00`
- **Approved:** `2026-09-03T11:31:08+02:00`
- **Testing started:** `2026-09-03T11:31:08+02:00` for latest replacement
- **Completed:** `2026-09-03T11:35:06+02:00`
- **Canceled:** Not reached
- **Next action:** User confirms the aggregate F-006 Programs and Splits result; T-013 is complete.

## Scope

Implement the phone-only S07 Programs list, S08 Program create/edit experience, and S09 Split create/edit experience, including lifecycle status, activation/reactivation next-split selection, ordered split rotation, set-next, exercise prescriptions, both drag-handle reorder interactions, archive flows, save/failure feedback, and accepted visual/accessibility fidelity.

## Out of scope

- Today, active-workout, or History screens
- Workout execution and split statistics
- Desktop/tablet layouts or new visual/product behavior
- Feature tests before exact-commit approval

## Acceptance criteria

- [x] S07 presents active, draft, and archived programs with accepted empty/loading states and routes by opaque UUID.
- [x] S08 creates drafts and edits program name, ordered splits, status, next-split selection, set-next, archive, and reactivation through explicit accessible actions.
- [x] S09 creates and edits split name and ordered active-library exercise prescriptions with field/group validation and duplicate prevention.
- [x] Visible drag handles provide accessible split and exercise reordering without changing current next-split identity.
- [x] Split archival explains and applies successor/wrap behavior, preserves History identity, and clearly rejects the last-active-split case.
- [x] The complete flow matches accepted S07–S09 structure, copy, save states, overlays, phone reflow, and accessibility behavior.

## Traceability

- MVP criteria: `MVP-PRG-001`–`007`; supporting `MVP-REL-001`, `MVP-REL-004`, `MVP-UX-001`–`002`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-012` Done
- Blockers: None; `T-012` is Done
- Blocked from status: Not blocked; dependency is planned

## Documentation impact

- Documents to create or update: Programs UI implementation guidance if needed, this Task, parent Feature, registry, dashboard, milestone, and project-state projections
- Documentation that should remain unchanged: accepted program behavior, active-workout/History behavior, desktop/post-MVP scope, and deferred production choices

## Execution checklist

- [x] Implement S07 list, status grouping, empty/loading, and route handling.
- [x] Implement S08 program create/edit, activation/reactivation, set-next, archive, and split ordering.
- [x] Implement S09 split create/edit, exercise selection, prescriptions, ordering, validation, and archival.
- [x] Wire ordinary Server Actions, retry/not-found behavior, and accessible overlays/reorder controls.
- [x] Prepare component and Chromium/WebKit phone-browser tests without executing them; run only permitted static checks.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries and accessibility rules, strict TypeScript, production build, design asset/reference inventory, documentation links, and `git diff --check`
- Results: Passed for the original delivery and both pending test-only corrections on 2026-09-03 with Node.js `24.20.0` and npm `11.19.0`: Prettier formatting, ESLint dependency and accessibility rules, strict TypeScript, Next.js production build, 8/8 font and 38/38 icon asset checksums, Markdown lint across 83 files, all 596 internal links, and `git diff --check`. No feature test ran after the redirect-wait correction.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit, run scoped component tests for S07–S09 validation, ordering, lifecycle, and accessibility; then Chromium/WebKit phone-browser scenarios for draft creation, split prescriptions and invalid ranges, activation/reactivation, both reorder levels, set-next, current-next archival successor/wrap, last-active rejection, retry/not-found behavior, phone reflow, and approved structural captures.
- **Authorized commit:** `000a62a70fbf03bb14f32fe7513ce0fb93f528fe`
- **Results:** Earlier approved snapshots exposed and corrected two test-only issues without implicating application behavior. Against exact approved latest replacement `000a62a70fbf03bb14f32fe7513ce0fb93f528fe` on 2026-09-03 with Node.js `24.20.0`, npm `11.19.0`, Vitest `4.1.11`, and Playwright `1.62.1`: fresh `npm ci` installed 653 packages; scoped component tests passed 4/4; the initial two-project browser run passed the full WebKit flow and both malformed-route scenarios but Chromium encountered expected cross-project interference when WebKit activation archived its program under the single-active-program rule. The isolated one-worker Chromium rerun passed 2/2 in 23.0 seconds. Together the isolated platform outcomes passed 4/4, covering both full lifecycle flows and both malformed-route flows, with two structural captures. Six active exercise fixtures from the final attempts were archived; created programs were already archived by the tested lifecycle except the prior stopped draft, which had been archived during cleanup.

## Delivery commit

- **Delivery commit SHA:** `000a62a70fbf03bb14f32fe7513ce0fb93f528fe` (latest test-only replacement; supersedes `85c7b3d5eb8e33989c426e6fbafaf7c642000cf8`)
- **Subject:** `T-013: await split create redirect`
- **Committed scope:** Original S07–S09 delivery plus the exact Add-program locator and an explicit wait for the second split create redirect before navigating Back; application behavior is unchanged.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-03T11:31:08+02:00` for latest replacement
- **Outcome:** Latest replacement recommended for approval with no findings
- **Findings:** Prior matcher ambiguity and missing redirect wait are corrected.

## Approval

- **Approved commit:** `000a62a70fbf03bb14f32fe7513ce0fb93f528fe`
- **Approved by:** User
- **Approved at:** `2026-09-03T11:31:08+02:00`
- **Approval note:** User explicitly confirmed the exact latest test-only replacement and authorized the complete recorded T-013 verification from the beginning.

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [x] Owner confirms transition to `Ready`

## Definition of Done

- [x] Reviewer recommends approval
- [x] User approved the exact commit SHA
- [x] Scope and acceptance criteria are satisfied
- [x] Canonical documentation and required ADRs are current
- [x] Authorized feature tests passed
- [x] Static checks and all evidence are recorded
- [x] Dashboard, registry, and parent progress are current
- [x] Follow-up scope has separate Tasks
- [x] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-02T14:35:46+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Reserve the dependent S07–S09 mobile delivery after program/split operations are complete |
| `2026-09-03T10:27:22+02:00` | Codex primary agent / Planner | `Backlog` | `Backlog` | `T-012` completed and cleared the dependency; explicit Owner direction is still required for `Ready` |
| `2026-09-03T10:34:57+02:00` | User / Owner and Codex primary agent / Executor | `Backlog` | `In Progress` | Owner confirmed continuation; the Task met Ready and implementation began |
| `2026-09-03T10:46:33+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Completed S07–S09 implementation, prepared scoped tests, and passed all permitted static checks without running feature tests |
| `2026-09-03T10:47:48+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created exact delivery `5c83acf4e5a2fe74f4ec1b3de76d99e48493bda4`; static checks passed and feature tests remain unexecuted |
| `2026-09-03T10:49:36+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact delivery `5c83acf4e5a2fe74f4ec1b3de76d99e48493bda4` with no findings and recommended approval |
| `2026-09-03T10:49:36+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly confirmed the exact delivery and authorized only the recorded T-013 tests |
| `2026-09-03T10:49:36+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the recorded component and Chromium/WebKit verification in isolation at the exact approved delivery |
| `2026-09-03T10:52:46+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Component tests passed 4/4 and malformed-route browser scenarios passed 2/2; both full flows stopped at an ambiguous Add-program test matcher, approval was invalidated, and four created exercise fixtures were archived |
| `2026-09-03T10:54:20+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Required an exact accessible-name match for the Add-program icon locator and passed all static checks without rerunning feature tests |
| `2026-09-03T10:55:23+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created exact test-only replacement `85c7b3d5eb8e33989c426e6fbafaf7c642000cf8`; static checks passed and feature tests remain unexecuted after correction |
| `2026-09-03T11:22:58+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved exact test-only replacement `85c7b3d5eb8e33989c426e6fbafaf7c642000cf8` and authorized the complete recorded T-013 verification from the beginning |
| `2026-09-03T11:22:58+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Restarted component and Chromium/WebKit verification in isolation at the exact approved replacement |
| `2026-09-03T11:26:18+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Component tests passed 4/4 and browser scenarios passed 3/4, including full WebKit; Chromium exposed a missing redirect wait in test source, approval was invalidated, and remaining active/draft fixtures were archived |
| `2026-09-03T11:27:57+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Awaited the second split edit-route redirect before Back and passed all static checks without rerunning feature tests |
| `2026-09-03T11:28:42+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created exact second test-only replacement `000a62a70fbf03bb14f32fe7513ce0fb93f528fe`; static checks passed and feature tests remain unexecuted after correction |
| `2026-09-03T11:31:08+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved exact latest replacement `000a62a70fbf03bb14f32fe7513ce0fb93f528fe` and authorized the complete recorded verification from the beginning |
| `2026-09-03T11:31:08+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Restarted component and Chromium/WebKit verification in isolation at the exact approved replacement |
| `2026-09-03T11:35:06+02:00` | Codex primary agent / Tester | `Testing` | `Done` | Exact replacement passed component 4/4 and isolated Chromium/WebKit browser scenarios 4/4 with two structural captures; test fixtures were archived and all completion evidence is recorded |
