# T-023 — Correct active-workout screen details

- **Feature:** `F-011`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 6
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T11:41:11+02:00`
- **Updated:** `2026-09-05T13:11:36+02:00`
- **Started:** `2026-09-05T13:11:36+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Deliver the three screen corrections as one reviewable commit, then request review.

## Scope

Apply three recorded Owner corrections to the active workout and its finish review:

- remove the restored-session banner from the active workout screen; restoring stays silent because the workout itself is the evidence;
- shorten the exercise-note heading to `Exercise note`;
- move `Discard Workout` from the scrolling finish page into the sticky action group with `Complete Workout`, `Save as Incomplete`, and `Continue Workout`, so it stays reachable while scrolling.

## Out of scope

- Set entry, delivered by `T-020`
- Navigation and shell changes, delivered by `T-024`
- Discard semantics, confirmation requirement, and finish outcomes, which stay as accepted

## Acceptance criteria

- [ ] The active workout renders no restored-session banner in any restore path.
- [ ] The exercise note heading reads exactly `Exercise note` and the note stays read-only.
- [ ] `Discard Workout` sits in the finish sticky action group and remains visible without scrolling.
- [ ] Discard still requires its separate confirmation and still records nothing.

## Traceability

- MVP criteria: supporting `MVP-WRK-005`, `MVP-WRK-011`, `MVP-EXE-006`, `MVP-UX-003`; no criterion text changes
- ADRs: [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md)
- Canonical documents: [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../product/workouts.md`](../../product/workouts.md)

## Dependencies and blockers

- Dependencies: None
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: active-workout and finish screen decisions, this Task, `F-011`, registry, dashboard, and project state
- Documentation that should remain unchanged: restore requirement, finish outcomes, note model

## Execution checklist

- [ ] Remove the restored banner and its now-unused state.
- [ ] Correct the exercise-note heading.
- [ ] Move the discard control into the finish sticky action bar.
- [ ] Update active-workout component tests without running them.
- [ ] Synchronize canonical documentation and project-management projections.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, documentation links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** active-workout and finish component scenarios for the absent banner, the heading, and the relocated discard control; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-023: correct active-workout screen details`
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
| `2026-09-05T11:41:11+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Created from Owner corrections 5, 6, and 8 recorded on 2026-09-05 |
| `2026-09-05T13:11:36+02:00` | User / Owner | `Backlog` | `Ready` | Directed execution after `T-021` |
| `2026-09-05T13:11:36+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the active-workout screen corrections |
