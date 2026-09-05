# T-029 — Record a set by its entered values

- **Feature:** `F-014`
- **Status:** `In Review`
- **Horizon:** `Now`
- **Order:** 2
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T19:28:05+02:00`
- **Updated:** `2026-09-05T21:23:55+02:00`
- **Started:** `2026-09-05T21:07:30+02:00`
- **Review started:** `2026-09-05T21:23:55+02:00`
- **Approval requested:** `2026-09-05T21:19:46+02:00`
- **Approved:** `2026-09-05T21:19:46+02:00`
- **Testing started:** `2026-09-05T21:19:46+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Reviewer checks `9374b8c23f55882f4c813a3e9a761f26b291e2b5`; its run needs the Owner's approval of that SHA and of the clean reset.

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

- [x] Record the ADR with the completeness rule and the removed flag — [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md).
- [x] Drop the confirmation column and its check from the declarative schema, generate the migration, and regenerate types — the rule moves into the immutable `workout_set_is_recorded(load_mode, load_kg, band_strength, reps)`, which `get_current_workout` uses for last-performance eligibility; the generated migration applied and converged unchanged.
- [x] Remove `isConfirmed` from the command contract, its validation, and the optimistic application.
- [x] Remove both confirmation controls and derive the recorded state in the set row and the finish review — `isSetRecorded` mirrors the database rule, and the exercise card reads `N of M recorded`.
- [x] Update the finish-review counts and their copy — `Recorded sets` and `Sets left without values`, which the review names instead of blocking the finish.
- [x] Extend pgTAP, unit, and component assertions — pgTAP `0001` grows from 16 to 19 assertions, replacing the two confirmation-constraint cases with stored-as-entered plus derived-rule checks, and `0004` asserts the rule through the applied command and the one-time starter set. The replacement corrected two component expectations the first delivery had renamed without re-deriving: the Pull-Up card now reads `1 of 2 recorded`, and the finish review names `Pull-Up set 2` while asserting that the recorded `Pull-Up set 1` is absent.
- [x] Synchronize canonical documentation and project-management projections.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, database lint, generated-type consistency, declarative-schema convergence, documentation links, and `git diff --check`
- Results: Passed again for the replacement on `2026-09-05T21:23:26+02:00`, and earlier for the first delivery on `2026-09-05T21:17:55+02:00`. `npm run check` passed formatting, ESLint, strict TypeScript, the production build, UI asset checksums, Markdown lint, and all 852 internal links. The generated migration applied with `migration up` against the local database and needed no correction; a repeated declarative sync against a freshly built shadow database reported no schema changes; `supabase db lint --local` reported no schema errors; regenerated types drop `is_confirmed` and add the new function; and `git diff --check` was clean. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** command and reducer unit tests without the flag, active-workout and finish-review component scenarios for a complete and an incomplete set, repository integration tests, and pgTAP tests for the changed set table; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Failed on `2026-09-05T21:21:57+02:00` for `a64adcc3a1b547ac2af2ec9121c958653323d2f2`, on test expectations rather than on delivered behavior. The clean reset succeeded, pgTAP passed 65/65 — up from 62 by the three added assertions — regenerated types matched the committed file, and the component suite passed 4/4. The unit suite failed 2 of 69, both in `active-workout-mobile.test.tsx`:

  1. it still expected `2 planned × 6–10 reps · 0 of 2 recorded` for Pull-Up. Under the removed flag neither set was confirmed, but set 1 holds added weight and reps, so the derived rule now correctly records it and the card reads `1 of 2 recorded`. The delivery renamed the copy mechanically without re-deriving the count.
  2. it still expected the finish-review label `Empty planned sets`, which the delivery renamed to `Sets left without values`, and it still expected `Pull-Up set 1` in the list of planned sets left without values; that set is now recorded, so `Pull-Up set 2` belongs there instead.

  The repository suite was not reached.

## Delivery commit

- **Delivery commit SHA:** `9374b8c23f55882f4c813a3e9a761f26b291e2b5` — replacement; it supersedes the first delivery `a64adcc3a1b547ac2af2ec9121c958653323d2f2`, whose changes it carries unchanged
- **Subject:** `T-029: record a set by its entered values`
- **Committed scope:** replacement of the superseded first delivery, carrying all of its changes plus the two corrected component expectations; the declarative schema and its new derived-state function, the new migration, generated types, the active-workout command contract and reducer, `set-entry`, `workout`, the active-workout experience and finish review, pgTAP `0001` and `0004`, the domain, application, component and repository suites, ADR-0027 and the decisions index, `workouts.md`, `history-and-statistics.md`, `mvp-acceptance-criteria.md`, `domain-model.md`, `active-workout-durability.md`, `mobile-ui-foundation.md`, `wireframe-decisions.md`, `local-database-workflow.md`, and this Task

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-05T21:19:46+02:00`
- **Outcome:** Approved
- **Findings:** None recorded

## Approval

- **Approved commit:** Approval cleared by the failed run
- **Approved by:** User / Approver
- **Approved at:** `2026-09-05T21:19:46+02:00`
- **Approval note:** Approval of `a64adcc3a1b547ac2af2ec9121c958653323d2f2` was cleared when its authorized run failed on two component expectations the delivery had not updated

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
| `2026-09-05T21:18:30+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered `a64adcc3a1b547ac2af2ec9121c958653323d2f2`; static checks passed and no feature test ran |
| `2026-09-05T21:19:46+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved the exact delivery commit and the clean reset it requires |
| `2026-09-05T21:19:46+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Started the authorized cycle against `a64adcc3a1b547ac2af2ec9121c958653323d2f2` |
| `2026-09-05T21:21:57+02:00` | Claude Code primary agent / Tester | `Testing` | `In Progress` | The authorized run failed 2 of 69 unit tests on stale component expectations, including a set the derived rule now correctly records; approval and test authorization cleared |
| `2026-09-05T21:23:55+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered replacement `9374b8c23f55882f4c813a3e9a761f26b291e2b5` with the re-derived component expectations; static checks passed and no feature test ran |
