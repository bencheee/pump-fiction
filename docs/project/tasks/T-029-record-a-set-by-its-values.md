# T-029 — Record a set by its entered values

- **Feature:** `F-014`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 2
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T19:28:05+02:00`
- **Updated:** `2026-09-05T21:07:30+02:00`
- **Started:** `2026-09-05T21:07:30+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Deliver the recorded-by-values model as one reviewable commit.

## Scope

Remove explicit set confirmation. Entering values is the record, and completeness decides what counts.

- Both confirmation controls disappear: the tick beside `Set 1`, `Set 2` and the confirm button at the end of the row.
- Values keep auto-saving as they are entered, exactly as today.
- A set counts toward personal records, charts, and the workout's statistics when it holds everything its mode requires, as the Owner accepted on `2026-09-05`: kilograms and reps for weighted modes, reps for plain bodyweight, band strength and reps for band modes.
- A partially entered set is kept as entered and simply does not count; the finish review reports it instead of blocking.
- `workout_sets.is_confirmed` disappears, because no user action sets it any more, and the recorded state becomes a derived property of the stored values. The `update_set` command drops its `isConfirmed` field with it.

The finish review keeps its counts but renames them for the new model: recorded sets, and sets left without values.

## Out of scope

- Exercise types and options, delivered by `T-028`
- History and statistics screens, which `F-008` owns; this Task only fixes the rule they will read
- The set-entry inputs themselves, and the inline validation message that names missing values

## Acceptance criteria

- [ ] No screen shows a confirmation control or a per-set tick.
- [ ] Entering a value saves it immediately, and a complete set is recorded without any further action.
- [ ] An incomplete set is kept, is not counted, and is named in the finish review.
- [ ] The stored model no longer carries a confirmation flag, and no command sends one.
- [ ] `MVP-WRK-003`, `MVP-WRK-004`, `MVP-WRK-011`, and the confirmed-set wording in the History criteria describe the recorded-by-values model.

## Traceability

- MVP criteria: revises `MVP-WRK-003`, `MVP-WRK-004`, `MVP-WRK-011` and the confirmed-set wording in the History criteria; must not weaken `MVP-WRK-001`, `MVP-WRK-012`
- ADRs: creates one for the recorded-set model; respects [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0002](../../decisions/0002-template-snapshot-history-model.md)
- Canonical documents: [`../../product/workouts.md`](../../product/workouts.md), [`../../product/history-and-statistics.md`](../../product/history-and-statistics.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/active-workout-durability.md`](../../architecture/active-workout-durability.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md)

## Dependencies and blockers

- Dependencies: `T-028` delivers first, because both change the same set-entry surface
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create: the recorded-set ADR
- Documents to update: workout set entry and finish review, History eligibility wording, revised MVP criteria, domain model, durability command contract, screen decisions, decisions index, this Task, `F-014`, registry, dashboard, and project state
- Documentation that should remain unchanged: snapshot model, rotation, timer behavior

## Execution checklist

- [ ] Record the ADR with the completeness rule and the removed flag.
- [ ] Drop the confirmation column and its check from the declarative schema, generate the migration, and regenerate types.
- [ ] Remove `isConfirmed` from the command contract, its validation, and the optimistic application.
- [ ] Remove both confirmation controls and derive the recorded state in the set row and the finish review.
- [ ] Update the finish-review counts and their copy.
- [ ] Extend pgTAP, unit, and component assertions without running them.
- [ ] Synchronize canonical documentation and project-management projections.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, database lint, generated-type consistency, declarative-schema convergence, documentation links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** command and reducer unit tests without the flag, active-workout and finish-review component scenarios for a complete and an incomplete set, repository integration tests, and pgTAP tests for the changed set table; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-029: record a set by its entered values`
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
| `2026-09-05T19:28:05+02:00` | User / Owner | None | `Backlog` | Requested that entered values replace the confirmation controls |
| `2026-09-05T21:07:30+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed readiness once `T-028` was verified and `Done` |
| `2026-09-05T21:07:30+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started removing explicit set confirmation |
