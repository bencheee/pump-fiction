# T-012 — Build program and split operations

- **Feature:** `F-006`
- **Status:** `In Review`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-02T14:35:46+02:00`
- **Updated:** `2026-09-02T15:14:49+02:00`
- **Started:** `2026-09-02T14:35:46+02:00`
- **Review started:** `2026-09-02T15:14:49+02:00` for replacement
- **Approval requested:** Not reached for replacement
- **Approved:** Not reached for replacement
- **Testing started:** `2026-09-02T15:07:10+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** User reviews exact replacement `5b781802d2bddfc77b55745f12108ae678bd2b76`; corrected feature tests remain unexecuted and unauthorized.

## Scope

Implement feature-owned program and split models, validation, queries, and atomic create/edit/program-activation/program-reactivation/archive/reorder/set-next operations, including split-prescription writes and the reusable rotation transition required by later workout completion. Add server-only Supabase repository composition, thin Server Action adapters, and prepared approval-gated verification for the later Programs mobile experience and active-workout integration.

## Out of scope

- Programs and Split editor screens or browser interaction
- Starting, editing, finishing, or restoring an active workout
- History and split statistics presentation
- New program, split, or rotation behavior outside the locked MVP

## Acceptance criteria

- [x] Program queries return stable identity, lifecycle status, ordered splits, and the persistent next-split identity without exposing database types.
- [x] Program lifecycle writes atomically preserve the single-active-program rule; activation and reactivation require an active next split and archive the previously active program.
- [x] Split writes enforce unique active names per program, unique exercises, positive prescriptions, `min reps <= max reps`, stable identity, and deterministic contiguous ordering.
- [x] Split and exercise reordering preserves the current next-split identity and cannot mutate historical or active-workout snapshots.
- [x] Set-next and split archival apply the accepted pointer rules atomically, including successor wrap and rejection of last-active-split archival.
- [x] The reusable proposed-completion rotation transition compares the active program's current pointer before advancing/wrapping and remains server-only for future exact-once workout-finish orchestration.
- [x] Repository failures cross the application boundary only through the accepted serializable failure contract.

## Traceability

- MVP criteria: `MVP-PRG-001`–`007` persistence, validation, and rotation support
- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: `F-003` Done; `F-004` Done; `F-005` Done
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: program/split application and persistence guidance where local decisions are required, this Task, parent Feature, registry, dashboard, milestone, and project-state projections
- Documentation that should remain unchanged: accepted product behavior, mobile visual design, active-workout UI, History, and deferred production choices

## Execution checklist

- [x] Define program/split domain types, inputs, validation, repository contract, and application failures.
- [x] Implement queries and atomic lifecycle, ordering, prescription, pointer, and rotation operations.
- [x] Add reviewed database functions/constraints, generated types, server-only repository composition, and thin Server Actions.
- [x] Prepare scoped unit, database, and real-repository tests without executing them.
- [x] Update canonical implementation guidance and run only permitted static checks.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, generated-type consistency review, documentation links, declarative-schema convergence review, and `git diff --check`
- Results: Passed for the original delivery and pending test-only replacement on 2026-09-02 with Node.js `24.20.0`, npm `11.19.0`, Supabase CLI `2.116.0`, and local PostgreSQL `17`: `npm run check` passed Prettier, ESLint dependency boundaries, strict TypeScript, the Next.js production build across 13 routes, 8/8 font and 38/38 icon checksums, Markdown lint across 83 files, and all internal links. Declarative schema sync generated the reviewed migration with strict coverage and a subsequent convergence check reported no schema changes; generated public database types match local introspection; `supabase db lint --local --level warning` reported no schema errors; and `git diff --check` passed. No feature test ran after the fixture correction.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit, run scoped program/split application unit tests; reset local Supabase and run program/split constraints and transactional functions plus real repository integration covering lifecycle replacement, validation, both reorder levels, set-next, current-next archival successor/wrap, last-active rejection, reactivation, proposed-completion advancement, and retry no-op.
- **Authorized commit:** Not authorized; original approval invalidated after the failed test fixture
- **Results:** Against then-approved delivery `08f5e0f415c69f3d3d7f9800fb617d23cf8806bc` on 2026-09-02 with Node.js `24.20.0`, npm `11.19.0`, Vitest `4.1.11`, Supabase CLI `2.116.0`, and local PostgreSQL `17`: scoped unit tests passed 4/4; clean reset applied all four migrations; all three pgTAP files passed 26/26 total; repository integration failed 0/1 because its inactive-exercise scenario attempted to add an archived exercise to a split that already contained it, which the accepted retained-membership rule correctly permits. Verification stopped and a corrected test-only replacement requires fresh approval. An initial isolated `npm ci` used system Node.js `22.21.0`/npm `10.9.4`; no test ran under it, the install was discarded by a fresh `npm ci` under the required versions, and 653 packages installed with no vulnerabilities.

## Delivery commit

- **Delivery commit SHA:** `5b781802d2bddfc77b55745f12108ae678bd2b76` (test-only replacement; supersedes original delivery)
- **Subject:** `T-012: correct archived exercise fixture`
- **Committed scope:** Preserve the original program/split operations delivery while correcting the repository integration's inactive-exercise rejection fixture to use a split without prior membership; synchronize lifecycle documentation.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-02T15:07:10+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded

## Approval

- **Approved commit:** Not approved for replacement; original `08f5e0f415c69f3d3d7f9800fb617d23cf8806bc` approval invalidated
- **Approved by:** Not approved for replacement
- **Approved at:** Not approved for replacement
- **Approval note:** User approved the original delivery at `2026-09-02T15:07:10+02:00`; repository verification exposed a test-fixture defect, so a replacement requires fresh approval.

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
| `2026-09-02T14:35:46+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Split `F-006` into independently reviewable operations and dependent mobile-experience deliveries |
| `2026-09-02T14:35:46+02:00` | User / Owner | `Backlog` | `Ready` | Directed work to begin on `F-006`; completed dependencies and accepted canonical scope satisfy readiness |
| `2026-09-02T14:35:46+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began the program/split application and persistence delivery |
| `2026-09-02T15:01:52+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Completed the scoped operations, generated migration/types, canonical guidance, and unexecuted tests; all planned static checks passed |
| `2026-09-02T15:04:53+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created exact delivery `08f5e0f415c69f3d3d7f9800fb617d23cf8806bc`; all static checks passed and feature tests remain unexecuted |
| `2026-09-02T15:07:10+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact delivery `08f5e0f415c69f3d3d7f9800fb617d23cf8806bc` with no findings and recommended approval |
| `2026-09-02T15:07:10+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly confirmed the exact delivery and authorized only the recorded T-012 tests |
| `2026-09-02T15:07:10+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the recorded verification in an isolated worktree at the exact approved delivery |
| `2026-09-02T15:11:26+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Unit 4/4, clean reset, and pgTAP 26/26 passed, but repository integration failed because the inactive-exercise fixture used an already-associated exercise; approval is invalidated and a corrected test-only replacement is required |
| `2026-09-02T15:13:44+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Corrected the repository fixture to add the archived exercise to a split that did not already contain it; all static checks passed without rerunning feature tests |
| `2026-09-02T15:14:49+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created test-only replacement `5b781802d2bddfc77b55745f12108ae678bd2b76`; static checks passed and corrected feature tests remain unexecuted |
