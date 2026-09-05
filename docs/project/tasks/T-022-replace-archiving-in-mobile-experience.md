# T-022 — Replace archiving in the mobile experience

- **Feature:** `F-011`
- **Status:** `Backlog`
- **Horizon:** `Now`
- **Order:** 5
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T11:41:11+02:00`
- **Updated:** `2026-09-05T11:41:11+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Owner confirms `Ready` after `T-021` is approved.

## Scope

Replace every archiving affordance in the Exercise Library, Programs, and Splits screens with deletion built on the operations delivered by `T-021`, and replace program status controls with the current-program selection.

Screen changes:

- Exercise edit: `Delete Exercise` with a confirmation that names how many splits will lose the exercise and states that History is preserved; the archived banner and `Reactivate Exercise` disappear.
- Exercises list: no archived section, filter, or badge.
- Program edit: `Delete Program` and an explicit `Set as Current Program` control; `draft`, `active`, and `archived` labels disappear.
- Split edit: `Delete Split`, with the blocked case for the last split of the current program explained in place.
- Split builder and one-time builder: the exercise picker lists every exercise, since no exercise is hidden any more.

## Out of scope

- Data model and operations, delivered by `T-021`
- History screens, which `F-008` owns
- Measurement-type screens, which `F-009` owns

## Acceptance criteria

- [ ] No screen offers archiving or reactivation, and no archived state is rendered.
- [ ] Deleting an exercise requires confirmation that names the affected split count, then returns to the parent screen with a toast.
- [ ] Deleting a program or split requires confirmation and returns to its parent screen with a toast.
- [ ] Attempting to delete the last split of the current program explains why it is rejected without leaving the screen.
- [ ] A program becomes current through an explicit control, and at most one program is current.
- [ ] Deletions never remove a workout from History.

## Traceability

- MVP criteria: implements revised `MVP-EXE-008`, `MVP-PRG-001`, `MVP-PRG-007`; supporting `MVP-UX-003`
- ADRs: `ADR-0024` from `T-021`
- Canonical documents: [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../product/exercises.md`](../../product/exercises.md), [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md)

## Dependencies and blockers

- Dependencies: `T-021` must be `Done`; deletion toasts and parent navigation reuse `T-018`
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: screen decisions for Exercises, Programs, and Splits, the affected product documents, this Task, `F-011`, registry, dashboard, and project state
- Documentation that should remain unchanged: History behavior, workout behavior, durability

## Execution checklist

- [ ] Replace archive and reactivate controls with delete controls and confirmations.
- [ ] Replace program status UI with the current-program selection.
- [ ] Remove archived filtering from every exercise and split picker.
- [ ] Update component tests without running them.
- [ ] Synchronize canonical documentation and project-management projections.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, documentation links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** exercise, program, and split component scenarios for deletion, confirmation copy, the blocked last-split case, and current-program selection; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-022: replace archiving in the mobile experience`
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
- [ ] Owner confirms transition to `Ready`

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
