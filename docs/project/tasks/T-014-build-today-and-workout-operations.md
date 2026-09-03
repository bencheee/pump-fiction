# T-014 — Build Today and active-workout operations

- **Feature:** `F-007`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-03T12:03:59+02:00`
- **Updated:** `2026-09-03T12:22:54+02:00`
- **Started:** `2026-09-03T12:03:59+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Create the exact delivery commit and hand it to the User for review; feature tests remain prohibited.

## Scope

Implement domain validation, queries, atomic workout start/snapshot creation, current-workout restoration, Last time lookup, and the complete revisioned command set for workout-local exercise/set edits, ordering, timer changes, completion, incomplete saving, and discard. Extend the existing server-only Supabase repository composition and active-workout command transaction rather than adding a parallel write path.

## Out of scope

- Today, one-time builder, active-workout, and finish-review screens
- Today's weight prompt and weight persistence, owned by `F-009`
- History presentation or historical correction operations, owned by `F-008`
- General offline support, desktop/tablet layouts, or post-MVP close protection

## Acceptance criteria

- [x] Today queries return the configured local date, proposed active split, completed-history average when available, eligible alternate splits, and any one current workout without exposing database types.
- [x] Starting proposed, alternate, and one-time workouts atomically enforces the singleton resumable workout and captures all required source identities, names, exercise definitions, allowed modes, notes, prescriptions, ordering, and exact initial set rows.
- [x] Current-workout loading returns canonical order, set state, notes, timer state, duration, save revision, and latest eligible same-exercise performances.
- [x] The existing validated command envelope covers workout-local note, timer, set value/confirmation/add/remove, exercise add/remove/reorder, and finish/discard mutations with command-ID idempotency and optimistic-revision conflict handling.
- [x] Set validation enforces the snapshotted allowed mode and applicable decimal load, band, and positive-integer rep fields before confirmation.
- [x] Complete, incomplete, and discard outcomes are atomic; only completing the still-current proposed split advances rotation exactly once, while alternate, one-time, incomplete, and discard never do.
- [x] Repository failures cross the application boundary through serializable not-found, validation, conflict, retry, or acknowledged outcomes.

## Traceability

- MVP criteria: `MVP-TOD-001`–`003`; `MVP-WRK-001`–`012` application and persistence support
- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../product/overview.md`](../../product/overview.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/active-workout-durability.md`](../../architecture/active-workout-durability.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: `F-003` through `F-006` Done; `T-008`, `T-010`, and `T-012` foundations Done
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: active-workout application/persistence guidance where concrete contracts are added, this Task, parent Feature, registry, dashboard, milestone, and project-state projections
- Documentation that should remain unchanged: accepted product behavior, History UI, weight/body behavior, desktop/post-MVP scope, and deferred production choices

## Execution checklist

- [x] Define Today/current-workout domain views, start inputs, command payloads, validation, repository contracts, and failures.
- [x] Implement Today/current-workout queries and atomic proposed/alternate/one-time snapshot creation.
- [x] Extend the single active-workout transaction and repository for all workout-local and terminal commands, including exact-once proposed rotation.
- [x] Prepare scoped unit, database, and real-repository tests without executing them.
- [x] Update canonical implementation guidance and run only permitted static checks.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, generated-type consistency review, documentation links, declarative-schema convergence review, database lint, and `git diff --check`
- Results: Passed on 2026-09-03 with Node.js `24.20.0`, npm `11.19.0`, Supabase CLI `2.116.0`, and local PostgreSQL `17`: `npm run check` passed Prettier, ESLint boundaries, strict TypeScript, the Next.js production build across 13 routes, 8/8 font and 38/38 icon checksums, Markdown lint across 86 files, and all 643 internal links. Declarative schema sync generated eight ordered migrations required by PostgreSQL enum additions; local application succeeded and a fresh strict convergence comparison found no schema changes. Generated public types were refreshed, database lint reported no errors, and `git diff --check` passed. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit, run scoped Today/workout application unit tests; reset local Supabase and run workout snapshot/constraint/transaction pgTAP coverage plus real repository integration for all three start sources, singleton restoration, latest eligible performance, every command family, duplicate delivery, stale revision, removal safeguards, timer transitions, all terminal outcomes, and exact-once rotation.
- **Authorized commit:** None; approval required before execution
- **Results:** Not run; feature testing is prohibited before exact-commit approval.

## Delivery commit

- **Delivery commit SHA:** Pending
- **Subject:** `T-014: build Today and workout operations`
- **Committed scope:** Pending

## Review

- **Reviewer:** User
- **Reviewed at:** Pending
- **Outcome:** Pending
- **Findings:** Pending

## Approval

- **Approved commit:** Pending
- **Approved by:** Pending
- **Approved at:** Pending
- **Approval note:** Pending

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
| `2026-09-03T12:03:59+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Split `F-007` into independently reviewable operations, Today/start UI, and active-workout UI deliveries |
| `2026-09-03T12:03:59+02:00` | User / Owner | `Backlog` | `Ready` | Directed work to begin on `F-007`; completed dependencies and accepted canonical scope satisfy readiness |
| `2026-09-03T12:03:59+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began Today and active-workout application and persistence delivery |
| `2026-09-03T12:22:54+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Completed scoped operations, migrations/types, canonical guidance, and unexecuted tests; all planned static checks passed |
