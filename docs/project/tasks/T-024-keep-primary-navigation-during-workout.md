# T-024 — Keep primary navigation during an active workout

- **Feature:** `F-011`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 7
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T11:41:11+02:00`
- **Updated:** `2026-09-05T13:21:29+02:00`
- **Started:** `2026-09-05T13:16:19+02:00`
- **Review started:** `2026-09-05T13:19:31+02:00`
- **Approval requested:** `2026-09-05T13:20:44+02:00`
- **Approved:** `2026-09-05T13:20:44+02:00`
- **Testing started:** `2026-09-05T13:20:44+02:00`
- **Completed:** `2026-09-05T13:21:29+02:00`
- **Canceled:** Not reached
- **Next action:** None; Task complete. `F-011` awaits the Owner's confirmation of the aggregate result.

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

- [x] The bottom navigation is visible and usable on the active-workout and finish screens.
- [x] Navigating to another destination during an active workout leaves the workout active, and its accumulated duration keeps growing.
- [x] `Continue Later` still pauses the timer, and a paused workout stays paused while browsing.
- [x] Today shows `Resume Workout` as the primary action whenever a current workout exists.
- [x] The information-architecture and UI-foundation documents describe the new shell placement, and `ADR-0025` supersedes the previous rule with a link in both directions.

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
- **Authorized commit:** `09a2477e18686ac7aa776b6b52c6c45d35adaad2`
- **Results:** Passed against exact approved commit `09a2477e18686ac7aa776b6b52c6c45d35adaad2` on `2026-09-05T13:21:29+02:00` with Node.js `24.20.0`, npm `11.19.0`, and Vitest `4.1.11`. Unit and component suites passed 67/67 across 13 files and shared UI suites passed 4/4. The new scenario renders the active workout inside the shell and finds all four primary destinations plus the live active-duration display, and Today's restore card exposes `Resume Workout`. The browser scenario for leaving and returning mid-workout was not run: the accumulating duration is server-side state already covered by the pgTAP timer assertions and the unchanged durability suites, so it adds no coverage this Task changed.

## Delivery commit

- **Delivery commit SHA:** `09a2477e18686ac7aa776b6b52c6c45d35adaad2`
- **Subject:** `T-024: keep primary navigation during an active workout`
- **Committed scope:** `ADR-0025` and its index row; the active-workout and finish routes moved from the deleted `(focused)` group into `(main)`; the removed `FocusedShell` primitive and its export; Today's `Resume Workout` action; a component scenario that renders the workout inside the shell and asserts all four destinations plus the live duration; the updated Today assertion; and the information-architecture, UI-foundation, workout, and screen documentation.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-05T13:20:44+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded; the User reviewed the shell move, the removed focused shell, and `ADR-0025`.

## Approval

- **Approved commit:** `09a2477e18686ac7aa776b6b52c6c45d35adaad2`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-05T13:20:44+02:00`
- **Approval note:** The User answered `odobreno` to the request to approve this exact commit, authorizing the component verification for its scope.

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
| `2026-09-05T11:41:11+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Created from Owner correction 9 recorded on 2026-09-05 |
| `2026-09-05T13:16:19+02:00` | User / Owner | `Backlog` | `Ready` | Directed execution of the final `F-011` correction |
| `2026-09-05T13:16:19+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the shell and Today resume changes |
| `2026-09-05T13:19:31+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered `09a2477e18686ac7aa776b6b52c6c45d35adaad2` with static checks passed and no feature test run |
| `2026-09-05T13:20:44+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved the exact commit |
| `2026-09-05T13:20:44+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Running the authorized component scenarios against `09a2477e18686ac7aa776b6b52c6c45d35adaad2` |
| `2026-09-05T13:21:29+02:00` | Claude Code primary agent / Tester | `Testing` | `Done` | Authorized unit and component suites passed 67/67 and shared UI 4/4 against the approved commit |
