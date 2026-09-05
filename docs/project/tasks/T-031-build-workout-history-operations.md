# T-031 — Build workout History operations

- **Feature:** `F-008`
- **Status:** `In Progress`
- **Horizon:** `Next`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T21:58:22+02:00`
- **Updated:** `2026-09-05T22:02:36+02:00`
- **Started:** `2026-09-05T22:02:36+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Implement the recorded scope, run only the permitted static checks, and create the delivery commit for the Owner's review. No feature test runs before the Owner approves that exact commit.

## Scope

Give History its data: read the saved workouts, and correct or delete them, through the accepted server boundary. Create the History feature module under `src/features/history` with feature-owned domain shapes, validation, a repository contract, and application operations; add the server-only Supabase repository and composition; expose thin Server Actions. Every multi-row write is one transactional PostgreSQL function.

Reads:

- the workout list: every `completed` and `incomplete` workout, newest first by `workout_date` then `started_at`, grouped by month, each with date, split or one-time name snapshot, active duration, performed exercise count, and completion status;
- the workout detail: status, source kind, program and split identity and name snapshots or the one-time name, date, start and finish, active duration, and the ordered exercise occurrences with definition snapshot, allowed modes, prescription, persistent-note snapshot, workout note, and every set with its load mode, values, and derived recorded state.

Corrections, each atomic and each leaving every template row and every rotation pointer untouched:

- date, start, and finish, within the existing `finished_at >= started_at` check, with active duration unchanged (readiness question 3);
- the workout-specific note of an occurrence;
- set values and the per-set addition within the snapshotted allowed modes, and adding or removing sets with the accepted renumbering technique;
- adding an exercise from the current library with a fresh definition snapshot, removing an occurrence, and reordering occurrences;
- marking an `incomplete` workout `completed` without touching rotation (readiness question 4);
- deleting a workout, cascading to its occurrences and sets.

The Owner accepted readiness question 1, so this Task also adds the never-nulled identity snapshot columns on `workout_exercises` and `workouts`, backfills them from the live references, and amends ADR-0024, because every later statistics query reads them.

## Out of scope

- `S13` and `S14`, owned by `T-032`
- Exercise and split statistics derivation and their queries, owned by `T-033` and `T-035`
- Any change to `apply_active_workout_command`, the IndexedDB outbox, or the active-workout screens
- Marking a completed workout incomplete, which readiness answer 4 excludes
- Weight and body data, owned by `F-009`
- Feature tests before exact-commit approval

## Acceptance criteria

- [ ] The list query returns only `completed` and `incomplete` workouts, newest first, grouped by local month, with every `S13` field and no database row type crossing the boundary.
- [ ] The detail query returns the complete saved snapshot for one workout id, and a not-found failure for an unknown, malformed, or current (`active` or `paused`) workout id.
- [ ] Every correction and the deletion is one repository call backed by one transactional function; a failed correction changes nothing.
- [ ] A correction is rejected as a validation failure when it would break the snapshotted allowed modes, the set shape check, positive-integer reps, or `finished_at >= started_at`.
- [ ] After any correction or deletion, `programs.next_split_id`, `split_exercises`, `splits`, and `exercises` are unchanged, and the latest eligible performance read by the active workout reflects the correction (`MVP-WRK-006`).
- [ ] Marking an incomplete workout completed changes only its status and keeps `rotation_advanced_at` null.
- [ ] Deleting a workout removes it with its occurrences and sets and nothing else.
- [ ] Prepared pgTAP, unit, and repository tests cover the above and remain unexecuted.

## Traceability

- MVP criteria: `MVP-HIS-002`, `MVP-HIS-003`, `MVP-HIS-004`; supporting `MVP-HIS-006`, `MVP-WRK-006`, `MVP-PRG-005`, `MVP-PRG-006`, `MVP-REL-004`
- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md) (amended if readiness question 1 is accepted), [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md)
- Canonical documents: [`../../product/history-and-statistics.md`](../../product/history-and-statistics.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: `F-007` and `F-014` Done; the snapshot and recorded-set model this Task reads is theirs
- Blockers: None; the Owner answered readiness questions 1, 3, 4, and 5 and gave the go-ahead on `2026-09-05`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the domain model (historical correction, identity snapshot if accepted), the server boundary document (a `T-031` paragraph and the ordinary-write decision of question 5), the History product document (the local decisions listed in `F-008` that this Task settles), the local database workflow (new pgTAP file and repository test), an ADR-0024 amendment if accepted, this Task, `F-008`, registry, dashboard, and project state
- Documentation that should remain unchanged: active-workout durability, programs and splits, exercises, weight and body, and every UI document

## Execution checklist

- [ ] Define history domain shapes: workout summary, month group, workout detail, correction inputs, validation, the repository contract, and failures under `src/features/history`.
- [ ] Add read functions that return nested JSON for the list and the detail, mapped in the Supabase repository to domain shapes.
- [ ] Add one transactional function per correction family and one for deletion, reusing the set shape constraints, `workout_set_is_recorded`, and the offset renumbering technique.
- [ ] If accepted: add the identity snapshot columns, backfill them from the live references, and amend ADR-0024 and the domain model.
- [ ] Generate and review the migration with `db schema declarative sync --strict-coverage`; regenerate and review the database types.
- [ ] Add server composition and thin Server Actions that return `OperationResult` values.
- [ ] Prepare the pgTAP suite, unit tests for grouping and validation, and a repository integration test; add the integration file to `test:repository`; do not run any of them.
- [ ] Update canonical documents, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, UI asset checksums, Markdown lint, internal links, declarative-schema strict-coverage sync with migration review, regenerated-type diff, database lint, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit: `npm run db:snapshot`; a clean `supabase db reset`; `npm run test:db` including the new history suite (list order and grouping, detail snapshot, every correction family, the rejection cases, template and rotation invariance, completion marking, cascade deletion, identity columns if added); `npm run test:repository` including the new history repository test; `npm run test:unit` for grouping and validation; regenerated types compared with the committed file; then `npm run db:restore`. Must not run before Owner approval of the exact commit.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-031: build workout History operations`
- **Committed scope:** Not created

## Review

- **Reviewer:** User
- **Reviewed at:** Not reviewed
- **Outcome:** Not reviewed
- **Findings:** None recorded

## Approval

- **Approved commit:** Not approved
- **Approved by:** Not approved
- **Approved at:** Not approved
- **Approval note:** Not approved

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
- [ ] Authorized feature tests passed, or approved no-test reason is recorded
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-05T21:58:22+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the first `F-008` delivery at the Owner's request; the Owner directed that implementation must not start |
| `2026-09-05T22:02:36+02:00` | User / Owner | `Backlog` | `Ready` | Gave the go-ahead for the whole `F-008` and accepted every recommended readiness answer |
| `2026-09-05T22:02:36+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the workout History operations, the first delivery of `F-008` |
