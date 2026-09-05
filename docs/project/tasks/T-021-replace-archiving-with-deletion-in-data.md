# T-021 — Replace archiving with deletion in data and operations

- **Feature:** `F-011`
- **Status:** `Backlog`
- **Horizon:** `Now`
- **Order:** 4
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T11:41:11+02:00`
- **Updated:** `2026-09-05T12:41:51+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Owner confirms `Ready` after `T-020` is approved.

## Scope

Remove archiving from the data model, the application boundary, and the screens, and replace it with real deletion that never removes History. The Owner confirmed on `2026-09-05` that this Task absorbs the canceled `T-022`, because removing the status fields from the domain types cannot leave the screens compiling in a separate commit. `ADR-0024` records the decision, the History-preservation mechanism, and the criteria it changes.

Accepted mechanism:

- Workout snapshots already store the exercise name, base type, note, permitted modes, prescription, and program/split names, so History stays readable without the definition. Every reference from History to a definition becomes nullable with `on delete set null`: `workout_exercises.exercise_id`, `workouts.source_program_id`, `workouts.source_split_id`, and `workouts.rotation_advanced_to_split_id`.
- Deleting an exercise also removes it from every split that uses it, as the Owner accepted on `2026-09-05`.
- The `entity_status` and `program_status` enums, the `status` columns on `exercises`, `splits`, `programs`, and `measurement_types`, and the partial active-name unique indexes are removed; name uniqueness becomes unconditional.
- Program `draft`/`active`/`archived` statuses disappear. The current program becomes an explicit selection stored as `app_settings.current_program_id`, nullable, with `on delete set null`, while `programs.next_split_id` remains the rotation pointer. This is the Executor's proposed mechanism for the Owner's accepted decision to remove statuses and derive activity from selection; the Owner confirms it at `Ready`.
- Deleting the last split of the current program stays blocked, as the Owner accepted. Deleting any other split of the current program moves the rotation pointer using the existing next-split rule.

Screen changes absorbed from `T-022`:

- Exercise edit offers `Delete Exercise` with a confirmation naming how many splits lose the exercise; the archived banner and `Reactivate Exercise` disappear.
- The Exercises list has no archived section, filter, or badge.
- Program edit offers `Delete Program` and an explicit control that makes a program current; `draft`, `active`, and `archived` labels disappear.
- Split edit offers `Delete Split`, with the blocked last-split case explained in place.
- Every exercise picker lists all exercises, since none is hidden any more.

## Out of scope

- Deleting historical workouts, which `F-008` owns
- Measurement-type screens, which `F-009` owns; only its criterion text and product document change here

## Acceptance criteria

- [ ] No status enum, status column, or reactivation operation for exercises, splits, programs, or measurement types remains.
- [ ] Deleting an exercise removes it and its split rows, and every completed and incomplete workout that used it keeps its snapshot, sets, notes, and duration.
- [ ] Deleting a split or a program keeps every workout that came from it in History with its name snapshots intact.
- [ ] Deleting the last split of the current program is rejected with an explanatory failure that the split screen explains in place.
- [ ] Deleting a non-last split of the current program leaves a valid rotation pointer.
- [ ] Exactly one program can be current, and deleting it leaves no current program instead of failing.
- [ ] `MVP-EXE-008`, `MVP-PRG-001`, `MVP-PRG-007`, `MVP-BOD-001`, and the release-boundary archiving bullet describe deletion.
- [ ] No screen offers archiving or reactivation, and deletion returns to the parent screen with a toast.
- [ ] A program becomes current through an explicit control, and at most one program is current.

## Traceability

- MVP criteria: revises `MVP-EXE-008`, `MVP-PRG-001`, `MVP-PRG-007`, `MVP-BOD-001`; must not weaken `MVP-PRG-003`–`006`, `MVP-WRK-001`, `MVP-HIS-005`
- ADRs: creates `ADR-0024`; amends the archiving language of [ADR-0002](../../decisions/0002-template-snapshot-history-model.md); respects [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md)
- Canonical documents: [`../../product/exercises.md`](../../product/exercises.md), [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md), [`../../product/history-and-statistics.md`](../../product/history-and-statistics.md), [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md)

## Dependencies and blockers

- Dependencies: `T-019` and `T-020` for delivery order; both change the same schema and operations area
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create: `ADR-0024`
- Documents to update: exercise, program/split, History, and weight/body product behavior, revised MVP criteria, domain model, server boundaries, decisions index, this Task, `F-011`, registry, dashboard, and project state
- Documentation that should remain unchanged: snapshot immutability, rotation rules other than the deletion case, durability model

## Execution checklist

- [ ] Record `ADR-0024` including the History-preservation mechanism and the current-program selection.
- [ ] Update the declarative schema and generate the migration and database types.
- [ ] Replace archive and reactivate operations with delete operations and their failures.
- [ ] Add the current-program selection to app settings and program operations.
- [ ] Replace archive and reactivate controls with delete controls and confirmations, and program status UI with the current-program selection.
- [ ] Extend pgTAP, component, and repository integration assertions, including History survival after each deletion, without running them.
- [ ] Synchronize canonical documentation and project-management projections.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, database lint, generated-type consistency, declarative-schema convergence, documentation links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** unit tests for delete operations and failures, repository integration tests for exercise, split, and program deletion with surviving History, and pgTAP tests for the nullable snapshot references and the last-split rule; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-021: replace archiving with deletion in data and operations`
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
- [x] MVP criteria, ADRs, and canonical documents are linked or explicitly not applicable
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [ ] Owner confirms transition to `Ready`, including the proposed current-program mechanism

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
| `2026-09-05T11:41:11+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Created from Owner correction 3 recorded on 2026-09-05 |
| `2026-09-05T12:41:51+02:00` | User / Owner | `Backlog` | `Backlog` | Absorbed the canceled `T-022` screen scope into this Task |
