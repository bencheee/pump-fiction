# T-024 — Keep primary navigation during an active workout

- **Feature:** `F-011`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 7
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T11:41:11+02:00`
- **Updated:** `2026-09-05T13:19:14+02:00`
- **Started:** `2026-09-05T13:16:19+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Record the delivery commit SHA through an evidence commit and request review.

## Scope

Make the active workout part of the normally navigable application instead of a focused screen without navigation. `ADR-0025` records the decision that supersedes the accepted focused-shell rule in [`mobile-information-architecture.md`](../../ux/mobile-information-architecture.md) and [`mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md).

- The active-workout and finish routes move into the shell that renders the four-destination bottom navigation, so Today, History, Programs, and Exercises stay reachable during a workout.
- The timer keeps accumulating while the user browses elsewhere, because the running segment is already persisted server-side and only an explicit `Continue Later` pauses it. This Task verifies that behavior rather than changing it.
- Today's return affordance is named `Resume Workout` and stays the primary action while a workout is active or paused.

## Out of scope

- Timer, pause, and durability semantics, which stay as accepted
- Active-workout content changes, delivered by `T-020` and `T-023`
- Any protection against leaving a workout, which the release boundary classifies as post-MVP

## Acceptance criteria

- [ ] The bottom navigation is visible and usable on the active-workout and finish screens.
- [ ] Navigating to another destination during an active workout leaves the workout active, and its accumulated duration keeps growing.
- [ ] `Continue Later` still pauses the timer, and a paused workout stays paused while browsing.
- [ ] Today shows `Resume Workout` as the primary action whenever a current workout exists.
- [ ] The information-architecture and UI-foundation documents describe the new shell placement, and `ADR-0025` supersedes the previous rule with a link in both directions.

## Traceability

- MVP criteria: supporting `MVP-WRK-005`, `MVP-WRK-010`, `MVP-TOD-001`, `MVP-UX-001`; no criterion text changes
- ADRs: creates `ADR-0025`; respects [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md)
- Canonical documents: [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../product/workouts.md`](../../product/workouts.md)

## Dependencies and blockers

- Dependencies: `T-023` for delivery order, since both change the same screens
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create: `ADR-0025`
- Documents to update: information architecture, UI foundation routing and shells, screen decisions, workout continuation behavior, decisions index, this Task, `F-011`, registry, dashboard, and project state
- Documentation that should remain unchanged: durability model, timer semantics, finish outcomes

## Execution checklist

- [x] Record `ADR-0025` and mark the superseded focused-shell rule in both canonical documents.
- [x] Move the active-workout and finish routes into the navigable shell, keeping their top bar and sticky actions correct with the bottom navigation present.
- [x] Rename Today's return affordance to `Resume Workout`.
- [x] Remove the focused shell, because no route needs it any more.
- [x] Update component tests without running them.
- [x] Synchronize canonical documentation and project-management projections.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, documentation links, and `git diff --check`
- Results: Passed on `2026-09-05T13:19:14+02:00` with Node.js `24.20.0` and npm `11.19.0`. `npm run check` passed Prettier, ESLint, strict TypeScript, the production build with `/workout/current` and `/workout/current/finish` now served from the single shell, UI asset checksums, Markdown lint, and all 751 internal links. `git diff --check` passed. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** component scenarios for navigation presence during a workout and for Today's resume action, plus a browser scenario that leaves and returns to a running workout and checks the duration kept accumulating; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Recorded by the following evidence commit
- **Subject:** `T-024: keep primary navigation during an active workout`
- **Committed scope:** `ADR-0025` and its index row; the active-workout and finish routes moved from the deleted `(focused)` group into `(main)`; the removed `FocusedShell` primitive and its export; Today's `Resume Workout` action; a component scenario that renders the workout inside the shell and asserts all four destinations plus the live duration; the updated Today assertion; and the information-architecture, UI-foundation, workout, and screen documentation.

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
| `2026-09-05T11:41:11+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Created from Owner correction 9 recorded on 2026-09-05 |
| `2026-09-05T13:16:19+02:00` | User / Owner | `Backlog` | `Ready` | Directed execution of the final `F-011` correction |
| `2026-09-05T13:16:19+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the shell and Today resume changes |
