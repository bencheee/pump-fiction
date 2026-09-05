# T-030 — Delete the exercise the command repository test creates

- **Feature:** `F-013`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T20:01:16+02:00`
- **Updated:** `2026-09-05T20:17:59+02:00`
- **Started:** `2026-09-05T20:09:42+02:00`
- **Review started:** `2026-09-05T20:12:12+02:00`
- **Approval requested:** `2026-09-05T20:15:12+02:00`
- **Approved:** `2026-09-05T20:15:12+02:00`
- **Testing started:** `2026-09-05T20:15:12+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Record the replacement SHA through an evidence commit and request fresh approval for it and for the reset its run needs.

## Scope

`src/server/repositories/supabase-active-workout-command-repository.integration.test.ts` creates an exercise through `create_exercise_definition` and its `finally` block deletes only the workout, so every authorized repository run leaves one orphan `T-008 exercise <uuid>` in the Owner's exercise library. The `T-027` verification on `2026-09-05` found one such row already present from an earlier run.

Delete the created exercise in the same `finally` block, in the order the foreign keys require.

The failed run on `2026-09-05` added one item: the repository suite needs a database without a resumable workout, exactly as pgTAP does, and no document said so. Record that precondition in the local database workflow next to the verification gate.

## Out of scope

- Any schema, migration, product, or screen change
- The other repository integration tests, whose fixtures already clean up
- Weakening the approval-gated verification rule

## Acceptance criteria

- [ ] After an authorized `npm run test:repository` run the exercise library holds exactly the rows it held before.
- [ ] The suite still passes unchanged.
- [x] The database workflow records that the repository suite needs a database without a resumable workout.

## Traceability

- MVP criteria: none; this Task changes the development workflow
- ADRs: [ADR-0006](../../decisions/0006-approval-gated-feature-testing.md)
- Canonical documents: [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: `T-027` is `Done`
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: the local database workflow with the repository-suite precondition, this Task, `F-013`, registry, dashboard, and project state
- Documentation that should remain unchanged: the verification gate, the seed and snapshot sections, and the schema guidance

## Execution checklist

- [x] Delete the created exercise in the test's `finally` block — after the workout deletion, so the cascading `workout_exercises` rows are gone before the `on delete set null` reference is removed.
- [x] Document the no-resumable-workout precondition for the repository suite — in the verification-gate section of the database workflow and in the README's approval-gated test section.
- [x] Run only permitted static checks and deliver one reviewable replacement commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, documentation links, and `git diff --check`
- Results: `npm run check` passed again for the replacement on `2026-09-05T20:17:59+02:00`, and earlier for the first delivery on `2026-09-05T20:11:38+02:00`, covering formatting, ESLint, strict TypeScript, the production build, the UI asset manifest, Markdown lint, and internal links; `git diff --check` reported no whitespace errors. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** a snapshot, a clean reset so no resumable workout exists, an authorized `npm run test:repository` run with the exercise-library row count compared before and after, then a restore; must not run before Owner approval of the exact commit and of the reset
- **Authorized commit:** Not authorized
- **Results:** Failed on `2026-09-05T20:16:37+02:00` for a precondition, not for the delivered change. `npm run db:snapshot` ran first, then `npm run test:repository` against the Owner's restored data reported 2 failed and 2 passed: both suites that start their own workout hit `duplicate key value violates unique constraint "workouts_single_resumable"`, because the Owner's restored workout is still active and the schema allows one resumable workout. The repository suite therefore shares the pgTAP precondition of a database without a resumable workout, which no document recorded. The delivered change still behaved correctly under the failure: every table held exactly its pre-run count afterwards, including one exercise, so the failing run left no new orphan where the old code would have left one.

## Delivery commit

- **Delivery commit SHA:** `cfb8ee5fa42e8655553809a159bc422502737069`
- **Subject:** `T-030: delete the exercise the command repository test creates`
- **Committed scope:** `src/server/repositories/supabase-active-workout-command-repository.integration.test.ts`, `docs/architecture/local-database-workflow.md`, `README.md`, and this Task

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-05T20:15:12+02:00`
- **Outcome:** Approved
- **Findings:** None recorded

## Approval

- **Approved commit:** Approval cleared by the failed run
- **Approved by:** User / Approver
- **Approved at:** `2026-09-05T20:15:12+02:00`
- **Approval note:** Approval of `cfb8ee5fa42e8655553809a159bc422502737069` was cleared when the authorized run failed on a precondition the Task had not recorded

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked or explicitly not applicable
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [x] Owner confirms the transition to `Ready`

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
| `2026-09-05T20:01:16+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Found during the authorized `T-027` verification: the command repository test leaves its exercise behind |
| `2026-09-05T20:09:42+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed the fix before `F-014`, keeping `F-013` first in the working order |
| `2026-09-05T20:09:42+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the test cleanup |
| `2026-09-05T20:12:12+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered `cfb8ee5fa42e8655553809a159bc422502737069`; static checks passed and no feature test ran |
| `2026-09-05T20:15:12+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved the exact delivery commit |
| `2026-09-05T20:15:12+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Snapshotted first, then started the authorized repository run against `cfb8ee5fa42e8655553809a159bc422502737069` |
| `2026-09-05T20:16:37+02:00` | Claude Code primary agent / Tester | `Testing` | `In Progress` | The authorized run failed on the singleton resumable-workout constraint because the Owner's workout is active; approval and test authorization cleared |
| `2026-09-05T20:17:59+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered a replacement that keeps the test cleanup and records the repository suite's no-resumable-workout precondition; static checks passed and no feature test ran |
