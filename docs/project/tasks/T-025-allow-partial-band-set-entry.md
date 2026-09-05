# T-025 — Allow partial band set entry

- **Feature:** `F-011`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 8
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T19:03:35+02:00`
- **Updated:** `2026-09-05T19:03:35+02:00`
- **Started:** `2026-09-05T19:03:35+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Deliver the relaxed set-shape constraint as one reviewable commit, then request review.

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

- [ ] Relax the set-shape check so a band mode may hold a null strength.
- [ ] Require a band strength in the confirmed-set check.
- [ ] Generate the migration, apply it without a reset so the Owner's workout survives, and regenerate types.
- [ ] Extend pgTAP with both the accepted partial state and the rejected confirmed state, without running them.
- [ ] Synchronize canonical documentation and project-management projections.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, database lint, generated-type consistency, declarative-schema convergence, documentation links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** pgTAP assertions for a partial band set and for a confirmed band set without a strength, plus the existing clean-reset suites; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-025: allow partial band set entry`
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
| `2026-09-05T19:03:35+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Created from the Owner's reproduced active-workout failure on 2026-09-05 |
| `2026-09-05T19:03:35+02:00` | User / Owner | `Backlog` | `Ready` | Reported the blocking defect and asked what was happening |
| `2026-09-05T19:03:35+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the constraint correction |
