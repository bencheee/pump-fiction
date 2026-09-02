# T-010 — Build exercise-library operations

- **Feature:** `F-005`
- **Status:** `Testing`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-02T08:59:17+02:00`
- **Updated:** `2026-09-02T10:00:54+02:00`
- **Started:** `2026-09-02T08:59:17+02:00`
- **Review started:** `2026-09-02T09:56:40+02:00` for replacement
- **Approval requested:** `2026-09-02T10:00:54+02:00` for replacement
- **Approved:** `2026-09-02T10:00:54+02:00` for replacement
- **Testing started:** `2026-09-02T10:00:54+02:00` for replacement
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Run the complete recorded T-010 verification from the beginning against exact approved replacement `410c44edd4f8b1698f7de6b792eed0be16a26052` in a fresh isolated worktree.

## Scope

Implement the feature-owned exercise models and validation, atomic create/edit/archive/reactivate operations, active-and-archived queries, split-usage count, server-only Supabase repository/composition, thin Server Action adapters, and prepared approval-gated verification required by the later Exercise Library UI.

## Out of scope

- Exercise Library screens and browser interaction
- Workout set entry, snapshots, History, and statistics UI
- Programs or split mutation behavior
- New exercise types, modes, band strengths, or product behavior

## Acceptance criteria

- [x] Exercise queries return stable UUID identity, name, base type, explicit allowed modes, persistent note, status, and split-usage count without exposing database types.
- [x] Create and edit reject blank or duplicate active names, missing or incompatible load modes, and unsupported values through field-shaped application errors.
- [x] Exercise definition and load-mode writes are atomic; edits affect definitions only and do not mutate split membership or workout snapshots.
- [x] Archive and reactivate preserve identity and related data; reactivation rejects an active-name conflict.
- [x] Repository failures cross the application boundary only through the accepted serializable failure contract.

## Traceability

- MVP criteria: `MVP-EXE-001`–`008` persistence and validation support
- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../product/exercises.md`](../../product/exercises.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: `F-003` Done; `F-004` Done
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: exercise application/persistence implementation guidance if a local decision is required, this Task, parent Feature, registry, dashboard, and project-state projections
- Documentation that should remain unchanged: accepted product behavior, mobile visual design, workout/history/program behavior, and deferred production choices

## Execution checklist

- [x] Define exercise domain types, allowed-mode matrix, input validation, and repository contract.
- [x] Implement queries and ordinary operations with stable application failures.
- [x] Add transactional database functions, reviewed migration, generated database types, and server-only repository composition.
- [x] Add thin Server Action adapters and prepare unit, database, and repository tests without executing them.
- [x] Run and record only permitted static checks.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, generated-type consistency review, documentation links, and `git diff --check`
- Results: Passed for the original delivery and pending test-only replacement on 2026-09-02 with Node.js `24.20.0` and npm `11.19.0`: `npm run check` passed Prettier, ESLint dependency boundaries, strict TypeScript, the Next.js production build, 8/8 font and 38/38 icon checksums, Markdown lint across 81 files, and all internal links; the replacement's final link run passed all 572 links. Declarative schema convergence with strict coverage reported no schema changes after the reviewed migration, generated database types include both new RPCs, and `git diff --check` passed. No feature test ran after the correction.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit, run scoped exercise application unit tests; reset local Supabase and run exercise database constraints/functions plus real repository integration covering create, list/detail, edit with split usage, archive, reactivation, duplicate active name, and invalid mode combinations.
- **Authorized commit:** `410c44edd4f8b1698f7de6b792eed0be16a26052`
- **Results:** Against exact then-approved delivery `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7` on 2026-09-02 with Node.js `24.20.0`, npm `11.19.0`, Vitest `4.1.11`, Supabase CLI `2.116.0`, and local PostgreSQL `17`: clean `npm ci` installed 653 packages with no vulnerabilities; scoped exercise unit tests passed 5/5; clean database reset applied all three migrations; existing core pgTAP passed 13/13; new exercise-library pgTAP failed 2/5 because `SET CONSTRAINTS ... IMMEDIATE` persisted between subtests and made later fixture inserts validate before their mode rows existed. Repository integration was not run. The required test-fixture correction invalidates approval; no further test may run before replacement approval.

## Delivery commit

- **Delivery commit SHA:** `410c44edd4f8b1698f7de6b792eed0be16a26052` (replaces `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7`)
- **Subject:** `T-010: isolate exercise database tests`
- **Committed scope:** Preserve the original exercise-library operations delivery while resetting the two deferred constraint triggers at the start of every pgTAP fixture so one scenario's immediate mode cannot leak into the next; synchronize lifecycle documentation.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-02T10:00:54+02:00` for replacement
- **Outcome:** Recommended replacement for approval
- **Findings:** Original finding corrected; no additional findings recorded.

## Approval

- **Approved commit:** `410c44edd4f8b1698f7de6b792eed0be16a26052`
- **Approved by:** User
- **Approved at:** `2026-09-02T10:00:54+02:00`
- **Approval note:** User explicitly confirmed exact replacement `410c44edd4f8b1698f7de6b792eed0be16a26052`, authorizing the complete recorded T-010 test plan from the beginning.

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
| `2026-09-02T08:59:17+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Split `F-005` into independently reviewable application/persistence and mobile-UI deliveries |
| `2026-09-02T08:59:17+02:00` | User / Owner | `Backlog` | `Ready` | Directed work to begin on `F-005`; completed dependencies and the accepted canonical scope satisfy readiness |
| `2026-09-02T08:59:17+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began the exercise-library application and persistence delivery |
| `2026-09-02T09:21:51+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Completed the scoped operations, transactional schema/migration, generated types, canonical guidance, and unexecuted tests; all planned static checks passed |
| `2026-09-02T09:24:32+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created delivery `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7`; all static checks passed and feature tests remain unexecuted |
| `2026-09-02T09:43:39+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact delivery `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7` with no findings and recommended approval |
| `2026-09-02T09:43:39+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly confirmed the exact delivery and authorized only the recorded T-010 tests |
| `2026-09-02T09:47:00+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began only the recorded scoped verification in an isolated worktree at exact approved delivery `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7` using Node.js `24.20.0` and npm `11.19.0` |
| `2026-09-02T09:51:21+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Unit tests passed 5/5, clean reset and core pgTAP 13/13 passed, but exercise pgTAP failed 2/5 because constraint-mode state leaked between fixtures; repository tests stopped and replacement approval is required |
| `2026-09-02T09:55:08+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Reset each pgTAP fixture to deferred constraint mode before setup and passed all static checks without rerunning feature tests |
| `2026-09-02T09:56:40+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created test-only replacement `410c44edd4f8b1698f7de6b792eed0be16a26052`; static checks passed and corrected feature tests remain unexecuted |
| `2026-09-02T10:00:54+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact replacement `410c44edd4f8b1698f7de6b792eed0be16a26052` with no additional findings and recommended approval |
| `2026-09-02T10:00:54+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly confirmed the exact replacement and authorized the complete recorded T-010 test plan from the beginning |
| `2026-09-02T10:00:54+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the complete recorded verification in a fresh isolated worktree at exact approved replacement `410c44edd4f8b1698f7de6b792eed0be16a26052` |
