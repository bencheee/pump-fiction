# T-025 — Allow partial band set entry

- **Feature:** `F-011`
- **Status:** `In Review`
- **Horizon:** `Now`
- **Order:** 8
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T19:03:35+02:00`
- **Updated:** `2026-09-05T19:12:45+02:00`
- **Started:** `2026-09-05T19:03:35+02:00`
- **Review started:** `2026-09-05T19:12:45+02:00`
- **Approval requested:** `2026-09-05T19:10:30+02:00`
- **Approved:** `2026-09-05T19:10:30+02:00`
- **Testing started:** `2026-09-05T19:10:30+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** User reviews the exact replacement commit and decides on fresh approval; the clean reset and pgTAP then restart from the beginning.

## Scope

Let a set hold a band mode before its strength is chosen, and require the strength only when the set is confirmed.

The Owner hit this on `2026-09-05` with a live workout: on an assisted exercise they typed reps before tapping a band strength, so the auto-save sent `loadMode: assistance_band` with `bandStrength: null`. `workout_sets_check` requires a non-null strength for every band mode, so the row was rejected, the command came back as a validation rejection, and the strictly ordered outbox blocked every later command. Adding a set and finishing the workout became impossible while the poisoned command retried forever.

The set-entry model already treats an unconfirmed set as incomplete and validates completeness at confirmation, so the database must accept the same partial states:

- an unconfirmed set may hold a band mode with no strength yet, while the mode's other rules stay enforced;
- a confirmed set must still be complete, which now explicitly includes a band strength for every band mode.

## Out of scope

- The outbox behavior that makes one permanently rejected command block every later one; that is a separate defect and gets its own Task.
- Client-side set validation, which already reports `Enter band strength and reps to confirm this set.`
- Any other constraint, command, or screen.

## Acceptance criteria

- [ ] Entering reps on a band set before choosing a strength saves, and the set stays unconfirmed.
- [ ] Confirming a band set without a strength is rejected by the database, not only by the UI.
- [ ] Every other set shape keeps its accepted rules: a band mode still carries its direction, band-only modes still reject kilograms, and non-band modes still reject a strength.
- [ ] The Owner's stuck command applies once the constraint is corrected, so the pending queue drains without discarding the workout.

## Traceability

- MVP criteria: supporting `MVP-WRK-003`, `MVP-WRK-004`, `MVP-EXE-005`; no criterion text changes
- ADRs: [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0023](../../decisions/0023-simplified-exercise-load-mode-model.md)
- Canonical documents: [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md), [`../../product/workouts.md`](../../product/workouts.md)

## Dependencies and blockers

- Dependencies: none; the defect predates `F-011` and exists in the `T-006` constraint against the `T-016` set-entry behavior
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: the partial-entry rule in the domain model, the workout set-entry description, the database workflow note, this Task, `F-011`, registry, dashboard, and project state
- Documentation that should remain unchanged: load-mode model, band identity, confirmation validation copy

## Execution checklist

- [x] Relax the set-shape check so a band mode may hold a null strength.
- [x] Require a band strength in the confirmed-set check.
- [x] Generate the migration, apply it without a reset so the Owner's workout survives, and regenerate types.
- [x] Extend pgTAP with both the accepted partial state and the rejected confirmed state, without running them.
- [x] Synchronize canonical documentation and project-management projections.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, database lint, generated-type consistency, declarative-schema convergence, documentation links, and `git diff --check`
- Results: Re-run for the test-only replacement on `2026-09-05T19:12:45+02:00` and passed again; originally passed on `2026-09-05T19:07:32+02:00` with Node.js `24.20.0`, npm `11.19.0`, and Supabase CLI `2.116.0` against local PostgreSQL `17`. `npm run check` passed Prettier, ESLint, strict TypeScript, the production build, UI asset checksums, Markdown lint, and all 758 internal links. The migration applied to the local database with `migration up`, deliberately without a reset, so the Owner's blocked workout survived; a repeated declarative sync reported no schema changes against a freshly rebuilt shadow database; `supabase db lint` reported no schema errors; generated types were unchanged because only check constraints moved; and `git diff --check` passed.

Diagnosis evidence, all inside transactions that were rolled back: the Owner's exact rejected command replayed against the pre-fix constraint failed with `new row for relation "workout_sets" violates check constraint "workout_sets_check"` on a row holding `assistance_band` with a null strength; after the fix the same command reports `applied`, while the same command with `isConfirmed: true` is still rejected by `workout_sets_check1`. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** pgTAP assertions for a partial band set and for a confirmed band set without a strength, plus the existing clean-reset suites; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized; the failed verification cleared it
- **Results:** Failed on `2026-09-05T19:12:24+02:00` against exact approved commit `75fd3d78d71c599cfcd54026080e51c79fade3af` with Node.js `24.20.0`, npm `11.19.0`, and Supabase CLI `2.116.0`. The authorized clean `supabase db reset` applied the complete migration history, and four of the five pgTAP files passed, but `0001_core_constraints` aborted at the new fixture with `Exercise requires at least one load mode`. The cause is test-only: the file runs with `set constraints all immediate`, so the deferred definition trigger fires at the end of each statement, and the new fixture inserted the exercise and its load mode as two statements instead of the single statement the file's existing fixtures use. The corrected constraints themselves were not reached by the failing file; the other 43 assertions across the remaining files passed.

## Delivery commit

- **Delivery commit SHA:** `e0fe573dedfe8803032b89be8a50a11805d09e60` (test-only replacement; supersedes `75fd3d78d71c599cfcd54026080e51c79fade3af`)
- **Subject:** `T-025: allow partial band set entry`
- **Committed scope:** The replacement changes only the new fixture in `0001_core_constraints.test.sql`, inserting the assisted definition in one statement. The superseded delivery contained: the `workout_sets` shape check without the band-strength requirement, the confirmation check with it, the generated migration, extended pgTAP coverage for the accepted partial band set and the rejected incomplete confirmation, and the workout, domain-model, and database-workflow documentation.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-05T19:10:30+02:00`
- **Outcome:** Recommended for approval for the superseded delivery; the replacement awaits review
- **Findings:** None recorded; the User reviewed the reproduced cause and the corrected constraints.

## Approval

- **Approved commit:** Void; approval of `75fd3d78d71c599cfcd54026080e51c79fade3af` was cleared by the failed verification below
- **Approved by:** Cleared
- **Approved at:** `2026-09-05T19:10:30+02:00`
- **Approval note:** The User answered `odobreno` to the request to approve this exact commit and then chose `Resetiraj odmah` when told that the pgTAP gate requires a clean reset that destroys the live workout and every other local row.

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
| `2026-09-05T19:03:35+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Created from the Owner's reproduced active-workout failure on 2026-09-05 |
| `2026-09-05T19:03:35+02:00` | User / Owner | `Backlog` | `Ready` | Reported the blocking defect and asked what was happening |
| `2026-09-05T19:03:35+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the constraint correction |
| `2026-09-05T19:07:51+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered `75fd3d78d71c599cfcd54026080e51c79fade3af` with static checks passed and no feature test run |
| `2026-09-05T19:10:30+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved the exact commit and the destructive clean reset the pgTAP gate requires |
| `2026-09-05T19:10:30+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Running the clean reset and pgTAP against `75fd3d78d71c599cfcd54026080e51c79fade3af` |
| `2026-09-05T19:12:24+02:00` | Claude Code primary agent / Tester | `Testing` | `In Progress` | pgTAP aborted on a test-only fixture that split a definition insert into two statements; approval and test authorization cleared |
| `2026-09-05T19:12:45+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered test-only replacement `e0fe573dedfe8803032b89be8a50a11805d09e60`; static checks passed and no feature test ran |
