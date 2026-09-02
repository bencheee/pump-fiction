# T-010 — Build exercise-library operations

- **Feature:** `F-005`
- **Status:** `Approved`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-02T08:59:17+02:00`
- **Updated:** `2026-09-02T09:43:39+02:00`
- **Started:** `2026-09-02T08:59:17+02:00`
- **Review started:** `2026-09-02T09:24:32+02:00`
- **Approval requested:** `2026-09-02T09:43:39+02:00`
- **Approved:** `2026-09-02T09:43:39+02:00`
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Codex runs only the recorded scoped tests against exact approved delivery `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7` in an isolated worktree.

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
- Results: Passed on 2026-09-02 with Node.js `24.20.0` and npm `11.19.0`: `npm run check` passed Prettier, ESLint dependency boundaries, strict TypeScript, the Next.js production build, 8/8 font and 38/38 icon checksums, Markdown lint across 81 files, and all 572 internal links. Declarative schema convergence with strict coverage reported no schema changes after the reviewed migration, generated database types include both new RPCs, and `git diff --check` passed. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit, run scoped exercise application unit tests; reset local Supabase and run exercise database constraints/functions plus real repository integration covering create, list/detail, edit with split usage, archive, reactivation, duplicate active name, and invalid mode combinations.
- **Authorized commit:** `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7`
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7`
- **Subject:** `T-010: build exercise library operations`
- **Committed scope:** Two-Task `F-005` breakdown; feature-owned exercise domain, allowed-mode validation, repository contract and ordinary operations; transactional definition schema/functions, reviewed migration, generated types, server-only Supabase repository/composition and thin Server Actions; compatibility updates and unexecuted unit/database/repository tests; synchronized canonical and project documentation.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-02T09:43:39+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded

## Approval

- **Approved commit:** `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7`
- **Approved by:** User
- **Approved at:** `2026-09-02T09:43:39+02:00`
- **Approval note:** User explicitly confirmed exact commit `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7`, authorizing only the recorded T-010 test plan.

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
