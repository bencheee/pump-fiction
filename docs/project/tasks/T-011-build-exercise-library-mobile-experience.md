# T-011 — Build Exercise Library mobile experience

- **Feature:** `F-005`
- **Status:** `Testing`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-02T08:59:17+02:00`
- **Updated:** `2026-09-02T13:58:41+02:00`
- **Started:** `2026-09-02T10:23:15+02:00`
- **Review started:** `2026-09-02T10:35:12+02:00`
- **Approval requested:** `2026-09-02T13:58:41+02:00`
- **Approved:** `2026-09-02T13:58:41+02:00`
- **Testing started:** `2026-09-02T10:43:55+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Run the complete recorded T-011 verification from the beginning against exact approved replacement `c700a78421eb2ea5b65e43eee7e7b8c796d311d3` under Node.js 24.20.0/npm 11.19.0.

## Scope

Implement the phone-only `/exercises`, `/exercises/new`, and `/exercises/:id/edit` Exercise Library experience, including search/filter/list states, create/edit validation, type-dependent allowed-mode controls, persistent notes, split-usage and future-only warnings, archive/reactivate flows, save/failure feedback, and accepted S05/S06 visual and accessibility fidelity.

## Out of scope

- Workout set entry or read-only display of snapshotted notes
- Exercise History, PRs, charts, Programs, and split editing
- Desktop/tablet layouts or new visual/product behavior
- Feature tests before exact-commit approval

## Acceptance criteria

- [x] The S05 library lists and searches active definitions, can expose archived definitions for reactivation, and routes by opaque UUID without owning exercise performance statistics.
- [x] The S06 create/edit form exposes only type-compatible allowed modes and presents accepted field/group validation and save/failure states.
- [x] Editing shows split usage and future-workout-only messaging; persistent-note and snapshot consequences match canonical copy.
- [x] Archive/reactivate behavior preserves identity, uses accepted confirmation where shown, and immediately updates new-selection eligibility.
- [x] The complete flow remains usable and accessible throughout the accepted phone-width range and matches the frozen S05/S06 structural references and v0.4 exceptions.

## Traceability

- MVP criteria: `MVP-EXE-001`–`008`; supporting `MVP-UX-001`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../product/exercises.md`](../../product/exercises.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-010` Done
- Blockers: None; `T-010` is Done
- Blocked from status: Not blocked; dependency is planned

## Documentation impact

- Documents to create or update: Exercise Library UI implementation guidance if needed, this Task, parent Feature, registry, dashboard, and project-state projections
- Documentation that should remain unchanged: accepted exercise behavior, workout/history/program behavior, and desktop/post-MVP scope

## Execution checklist

- [x] Implement S05 library query, search/filter, active/archived, empty, and loading presentation.
- [x] Implement S06 create/edit routes and type-dependent accessible form controls.
- [x] Wire ordinary Server Actions, validation, retry, archive/reactivate, and not-found handling.
- [x] Prepare component and Chromium/WebKit phone-browser tests without executing them.
- [x] Run and record only permitted static checks.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, design asset/reference inventory, documentation links, and `git diff --check`
- Results: Passed for the original delivery, test-only replacement, and pending save-feedback replacement on 2026-09-02 with Node.js `24.20.0` and npm `11.19.0`: Prettier formatting, ESLint dependency and accessibility rules, strict TypeScript, Next.js production build, 8/8 font and 38/38 icon asset checksums, Markdown lint across 81 files, all 570 internal links, and `git diff --check`. No feature test ran after the behavior correction.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit, run scoped component tests for S05/S06 validation and accessibility, then Chromium/WebKit phone-browser scenarios for create, duplicate/invalid rejection, edit warning, archive filtering, reactivation, retry/not-found behavior, phone reflow, and approved structural captures.
- **Authorized commit:** `c700a78421eb2ea5b65e43eee7e7b8c796d311d3`
- **Results:** Against exact then-approved replacement `7c8240b7060e6a6a27b02681dbcbd8c3daeee81f` on 2026-09-02 with Node.js `24.20.0`, npm `11.19.0`, Vitest `4.1.11`, and Playwright `1.62.1`: clean `npm ci` installed 653 packages with no vulnerabilities; the corrected component suite passed 2/2. Chromium/WebKit malformed/missing-route scenarios passed 2/2, while both full create/edit lifecycle scenarios failed after successful create because redirect remount reset visible save feedback from `Saved` to `Not saved yet`; remaining lifecycle assertions did not run. The two created `T-011 mobile-*` fixtures and four mode rows were removed. A behavioral replacement and fresh approval are required.

## Delivery commit

- **Delivery commit SHA:** `c700a78421eb2ea5b65e43eee7e7b8c796d311d3` (latest replacement; supersedes `7c8240b7060e6a6a27b02681dbcbd8c3daeee81f`)
- **Subject:** `T-011: preserve create save feedback`
- **Committed scope:** Original S05/S06 delivery and corrected test isolation plus successful-create `Saved` feedback preserved across redirect with the transient URL marker removed after hydration; regression coverage added.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-02T10:41:09+02:00`
- **Outcome:** Latest replacement recommended for approval with no findings
- **Findings:** Browser finding is corrected in replacement `c700a78421eb2ea5b65e43eee7e7b8c796d311d3`.

## Approval

- **Approved commit:** `c700a78421eb2ea5b65e43eee7e7b8c796d311d3`
- **Approved by:** User
- **Approved at:** `2026-09-02T13:58:41+02:00`
- **Approval note:** User explicitly confirmed the exact save-feedback replacement and authorized the complete recorded T-011 verification from the beginning.

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

- [ ] Reviewer recommends approval
- [ ] User approved the exact commit SHA
- [ ] Scope and acceptance criteria are satisfied
- [ ] Canonical documentation and required ADRs are current
- [ ] Authorized feature tests passed
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-02T08:59:17+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Reserve the independently reviewable S05/S06 mobile delivery after exercise operations are complete |
| `2026-09-02T10:10:10+02:00` | Codex primary agent / Planner | `Backlog` | `Backlog` | `T-010` completed and cleared the dependency; explicit Owner direction is still required for `Ready` |
| `2026-09-02T10:23:15+02:00` | User / Owner | `Backlog` | `Ready` | Directed work to continue after T-010; all recorded dependencies and readiness fields are satisfied |
| `2026-09-02T10:23:15+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began the accepted Exercise Library mobile experience scope |
| `2026-09-02T10:32:39+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Completed the scoped S05/S06 implementation and prepared tests; permitted code/build/asset checks passed without executing feature tests |
| `2026-09-02T10:35:12+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created delivery `bbcccb7961215a39ed3fe080ef1e0ad6edb56afa`; all static checks passed and feature tests remain unexecuted |
| `2026-09-02T10:41:09+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact delivery `bbcccb7961215a39ed3fe080ef1e0ad6edb56afa` with no findings and recommended approval |
| `2026-09-02T10:41:09+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly confirmed the exact delivery and authorized only the recorded T-011 tests |
| `2026-09-02T10:43:55+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the recorded component verification in an isolated worktree at exact approved delivery `bbcccb7961215a39ed3fe080ef1e0ad6edb56afa` |
| `2026-09-02T10:44:18+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Component tests failed 0/2 due to test matcher and cleanup defects; browser tests stopped, approval invalidated, and a test-only replacement is required |
| `2026-09-02T10:47:15+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Added explicit Testing Library cleanup and corrected accessible-name matchers; all static checks passed under required Node.js 24.20.0/npm 11.19.0 without rerunning feature tests |
| `2026-09-02T10:47:53+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created test-only replacement `7c8240b7060e6a6a27b02681dbcbd8c3daeee81f`; static checks passed and feature tests remain unexecuted after correction |
| `2026-09-02T13:02:33+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved exact replacement `7c8240b7060e6a6a27b02681dbcbd8c3daeee81f` and authorized the complete recorded T-011 verification from the beginning |
| `2026-09-02T13:04:11+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Restarted the complete recorded verification in isolation at exact replacement `7c8240b7060e6a6a27b02681dbcbd8c3daeee81f` under Node.js 24.20.0/npm 11.19.0 |
| `2026-09-02T13:07:55+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Component tests passed 2/2 and malformed-route browser scenarios passed 2/2, but both full mobile flows exposed lost successful-create save feedback after redirect; approval invalidated and a behavioral replacement is required |
| `2026-09-02T13:10:37+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Preserved successful-create `Saved` feedback across redirect and added regression coverage; all static checks passed without rerunning feature tests |
| `2026-09-02T13:11:15+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created replacement `c700a78421eb2ea5b65e43eee7e7b8c796d311d3`; static checks passed and feature tests remain unexecuted after correction |
| `2026-09-02T13:58:41+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved exact replacement `c700a78421eb2ea5b65e43eee7e7b8c796d311d3` and authorized the complete recorded T-011 verification from the beginning |
| `2026-09-02T13:58:41+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the complete recorded verification in isolation at exact approved replacement under Node.js 24.20.0/npm 11.19.0 |
