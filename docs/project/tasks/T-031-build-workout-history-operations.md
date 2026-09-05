# T-031 — Build workout History operations

- **Feature:** `F-008`
- **Status:** `Done`
- **Horizon:** `Next`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T21:58:22+02:00`
- **Updated:** `2026-09-05T22:46:10+02:00`
- **Started:** `2026-09-05T22:02:36+02:00`
- **Review started:** `2026-09-05T22:41:38+02:00` for the second replacement
- **Approval requested:** `2026-09-05T22:44:18+02:00` for the second replacement
- **Approved:** `2026-09-05T22:44:18+02:00` for the second replacement
- **Testing started:** `2026-09-05T22:44:18+02:00` for the second replacement
- **Completed:** `2026-09-05T22:46:10+02:00`
- **Canceled:** Not reached
- **Next action:** None; `T-031` is `Done`. `F-008` continues with `T-032`.

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

- [x] The list query returns only `completed` and `incomplete` workouts, newest first, grouped by local month, with every `S13` field and no database row type crossing the boundary.
- [x] The detail query returns the complete saved snapshot for one workout id, and a not-found failure for an unknown, malformed, or current (`active` or `paused`) workout id.
- [x] Every correction and the deletion is one repository call backed by one transactional function; a failed correction changes nothing.
- [x] A correction is rejected as a validation failure when it would break the snapshotted allowed modes, the set shape check, positive-integer reps, or `finished_at >= started_at`.
- [x] After any correction or deletion, `programs.next_split_id`, `split_exercises`, `splits`, and `exercises` are unchanged, and the latest eligible performance read by the active workout reflects the correction (`MVP-WRK-006`).
- [x] Marking an incomplete workout completed changes only its status and keeps `rotation_advanced_at` null.
- [x] Deleting a workout removes it with its occurrences and sets and nothing else.
- [x] The pgTAP, unit, and repository tests covering the above passed against the approved second replacement.

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

- [x] Define history domain shapes: workout summary, month group, workout detail, correction inputs, validation, the repository contract, and failures under `src/features/history`. Corrections are one discriminated union so a single Server Action and a single validator cover every family.
- [x] Add read functions that return nested JSON for the list and the detail, mapped in the Supabase repository to domain shapes. `get_history_workout` returns JSON null for an unknown id and for the current workout, so History cannot open it.
- [x] Add one transactional function per correction family and one for deletion, reusing the set shape constraints, `workout_set_is_recorded`, and the offset renumbering technique. `require_history_workout` locks the target and refuses an `active` or `paused` workout, so the two write paths cannot overlap.
- [x] Add the identity snapshot columns, backfill them from the live references, and amend ADR-0024 and the domain model. The migration also backfills occurrences already orphaned by an earlier deletion, grouped by their snapshotted name and base type.
- [x] Generate and review the migration with `db schema declarative sync --strict-coverage`; regenerate and review the database types. The review changed `update_history_set` to take one `jsonb` value object, because a generated scalar RPC argument type cannot express a cleared field as null.
- [x] Add server composition and thin Server Actions that return `OperationResult` values.
- [x] Prepare the pgTAP suite, unit tests, and a repository integration test; add the integration file to `test:repository`; do not run any of them. Month grouping is a database-side read shape, so the pgTAP suite covers it and the unit suite covers correction validation and the failure contract.
- [x] Update canonical documents, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, UI asset checksums, Markdown lint, internal links, declarative-schema strict-coverage sync with migration review, regenerated-type diff, database lint, and `git diff --check`
- Results: Passed on `2026-09-05T22:21:33+02:00` with Node.js `24.20.0`, npm `11.19.0`, Supabase CLI `2.116.0`, and local PostgreSQL `17`. `npm run check` passed Prettier, ESLint boundaries, strict TypeScript, the Next.js `16.3.3` production build across 18 routes, 8 font and 38 icon checksums with their licenses, Markdown lint across 115 files, and all 949 internal links. The declarative sync produced one migration under `--strict-coverage`; the complete migration chain then applied cleanly to a throwaway database created and dropped for the check, producing all 13 History functions and the identity column. Regenerated types matched the committed file on a second run, `supabase db lint --level error` reported no schema errors, and `git diff --check` was clean. No feature test ran: the pgTAP, unit, and repository suites are prepared and unexecuted. Re-run for the replacement on `2026-09-05T22:33:00+02:00`: `npm run check` passed every step again, and `git diff --check` was clean. The replacement changes no schema, migration, or generated type, so the declarative sync and database checks did not need to run again. No feature test ran after the corrections. Re-run for the second replacement on `2026-09-05T22:41:30+02:00`: `npm run check` passed every step again and `git diff --check` was clean. That replacement changes only the `test:repository` script and the workflow document, so no schema, migration, or type check applied. No feature test ran after the change.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit: `npm run db:snapshot`; a clean `supabase db reset`; `npm run test:db` including the new history suite (list order and grouping, detail snapshot, every correction family, the rejection cases, template and rotation invariance, completion marking, cascade deletion, identity columns if added); `npm run test:repository` including the new history repository test; `npm run test:unit` for grouping and validation; regenerated types compared with the committed file; then `npm run db:restore`. Must not run before Owner approval of the exact commit.
- **Authorized commit:** `c00c6e92072c98aec5e0e449797bb154bf314ccf`; the approvals of `95de9212848755c956cb0dc5d50b5cfc8796dc27` and `b5e4cda609d478453eccd562087d1f18bfec7f54` were invalidated by the failed verifications recorded below
- **Results:** Failed on `2026-09-05T22:29:27+02:00` against exact approved delivery `95de9212848755c956cb0dc5d50b5cfc8796dc27` in a fresh isolated worktree with Node.js `24.20.0`, npm `11.19.0`, and Supabase CLI `2.116.0`. `npm ci` installed 653 packages with no vulnerabilities, `npm run db:snapshot` saved the local data, and `supabase db reset` applied all 20 migrations and the seed. `npm run test:db` then failed two suites and passed the other four. `0001_core_constraints` ran 10 of its 19 assertions before its two direct `workout_exercises` inserts hit the new `exercise_identity_id not null` column, which this delivery added without updating that suite. `0006_workout_history` ran 0 of 47: its second fixture workout starts `T-031 Pull` as an `alternate_split`, but completing the first workout advanced rotation onto that split, so `start_workout` correctly refused the mismatch. Both defects are in test source; no delivered behavior is implicated. Testing stopped there, so the unit, repository, and generated-type steps did not run.

  Second verification, against exact approved replacement `b5e4cda609d478453eccd562087d1f18bfec7f54` on `2026-09-05T22:39:55+02:00` in a fresh isolated worktree: `npm ci` installed 653 packages with no vulnerabilities, `npm run db:snapshot` saved the local data, and `supabase db reset` applied all 20 migrations and the seed. `npm run test:db` passed **112/112 across all six suites**, including the new `0006_workout_history` 47/47. `npm run test:unit` passed **86/86 across 14 files**, up from 72 by the new correction-validation suite. Regenerated types matched the committed file. `npm run test:repository` **failed**: the script runs its files in parallel against one shared database, and this Task added a third file that starts a workout, so `workouts_single_resumable` and the shared rotation state made them collide. Running the same five files with `--no-file-parallelism` passed 5/5, and the new file alone passed 1/1, which isolates the cause to the script rather than to any test or to delivered behavior. The approval is invalidated and `npm run db:restore` did not run.

  Third verification, against exact approved second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` on `2026-09-05T22:46:10+02:00` in a fresh isolated worktree with Node.js `24.20.0`, npm `11.19.0`, Vitest `4.1.11`, Supabase CLI `2.116.0`, and local PostgreSQL `17`: **the complete plan passed**. `npm ci` installed 653 packages with no vulnerabilities; `npm run db:snapshot` saved the local data; `supabase db reset` applied all 20 migrations and the seed; `npm run test:db` passed **112/112 across six suites**, including the new `0006_workout_history` 47/47 covering the month-grouped reads, the detail snapshot, every correction family, the rejection cases, template and rotation invariance, identity survival after a definition is deleted, and cascade deletion; the now-serial `npm run test:repository` passed **5/5**; `npm run test:unit` passed **86/86 across 14 files**; regenerated types matched the committed file; and `npm run db:restore` reloaded the snapshot faithfully, leaving the local application usable.

## Delivery commit

- **Delivery commit SHA:** `c00c6e92072c98aec5e0e449797bb154bf314ccf` (second replacement; supersedes `b5e4cda609d478453eccd562087d1f18bfec7f54` and `95de9212848755c956cb0dc5d50b5cfc8796dc27`)
- **Subject:** `T-031: serialize the repository integration suite`
- **Second replacement scope:** the `test:repository` script and the workflow document that explains why it must stay serial; no schema, migration, generated type, runtime code, or test file changed
- **First replacement scope:** the two prepared pgTAP suites plus one sentence of the server-boundary document and its matching doc comment
- **Committed scope:** the `0003_workout_history.sql` declarative schema and the identity snapshot columns in `0001_core.sql` and `0002_workout_operations.sql`; the generated migration with its backfill; regenerated database types; the `src/features/history` domain, validation, repository contract, and operations; the Supabase repository, server composition, and Server Actions; the prepared `0006_workout_history` pgTAP suite, unit suite, and repository integration test with its `test:repository` registration; the ADR-0024 identity amendment; and the domain-model, server-boundary, History product, and local-database-workflow documents

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-05T22:41:38+02:00` for the second replacement
- **Outcome:** Second replacement recommended for approval
- **Findings:** The authorized verification found two prepared-test defects, recorded above

## Approval

- **Approved commit:** `c00c6e92072c98aec5e0e449797bb154bf314ccf`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-05T22:44:18+02:00`
- **Approval note:** The Owner replied `potvrda` a third time on `2026-09-05`, binding fresh approval to exact second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` and authorizing the complete recorded plan from the beginning. The approvals of the two superseded commits do not carry over.

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
| `2026-09-05T21:58:22+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the first `F-008` delivery at the Owner's request; the Owner directed that implementation must not start |
| `2026-09-05T22:02:36+02:00` | User / Owner | `Backlog` | `Ready` | Gave the go-ahead for the whole `F-008` and accepted every recommended readiness answer |
| `2026-09-05T22:02:36+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the workout History operations, the first delivery of `F-008` |
| `2026-09-05T22:21:33+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Progress` | Completed the reads, the ten corrections, the identity snapshots, and the prepared suites; all permitted static checks passed |
| `2026-09-05T22:22:36+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created exact delivery `95de9212848755c956cb0dc5d50b5cfc8796dc27`; static checks passed and every prepared feature test remains unexecuted |
| `2026-09-05T22:25:34+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact delivery with no findings |
| `2026-09-05T22:25:34+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved exact delivery `95de9212848755c956cb0dc5d50b5cfc8796dc27` with `potvrda` |
| `2026-09-05T22:25:34+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Began only the recorded verification against the exact approved delivery |
| `2026-09-05T22:29:27+02:00` | Claude Code primary agent / Tester | `Testing` | `In Progress` | Reset and seed succeeded and four pgTAP suites passed, before `0001_core_constraints` hit the new not-null identity column and `0006_workout_history` refused its own rotation-invalid fixture; remaining steps stopped and the approval is invalidated |
| `2026-09-05T22:33:00+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Progress` | Corrected both prepared suites and the inaccurate return-value sentence; all permitted static checks passed without running a feature test |
| `2026-09-05T22:33:33+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created exact replacement `b5e4cda609d478453eccd562087d1f18bfec7f54`; it awaits fresh approval before the complete recorded plan restarts |
| `2026-09-05T22:35:56+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact replacement with no further findings |
| `2026-09-05T22:35:56+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved exact replacement `b5e4cda609d478453eccd562087d1f18bfec7f54` with `potvrda` |
| `2026-09-05T22:35:56+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Restarted the complete recorded plan from the beginning against the exact approved replacement |
| `2026-09-05T22:39:55+02:00` | Claude Code primary agent / Tester | `Testing` | `In Progress` | pgTAP 112/112, unit 86/86, and the type comparison passed, before the parallel repository script collided on the single-resumable-workout invariant this Task added a third writer to; the approval is invalidated |
| `2026-09-05T22:41:30+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Progress` | Serialized the repository script and recorded the reason in the workflow document; all permitted static checks passed |
| `2026-09-05T22:41:38+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created exact second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf`; it awaits fresh approval before the complete recorded plan restarts |
| `2026-09-05T22:44:18+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact second replacement with no further findings |
| `2026-09-05T22:44:18+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved exact second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` with `potvrda` |
| `2026-09-05T22:44:18+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Restarted the complete recorded plan from the beginning against the exact approved second replacement |
| `2026-09-05T22:46:10+02:00` | Claude Code primary agent / Tester | `Testing` | `Done` | The complete plan passed: pgTAP 112/112, repository 5/5, unit 86/86, matching generated types, and a faithful restore |
