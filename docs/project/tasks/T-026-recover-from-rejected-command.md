# T-026 — Recover from a permanently rejected active-workout command

- **Feature:** `F-012`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T19:17:58+02:00`
- **Updated:** `2026-09-05T21:29:41+02:00`
- **Started:** `2026-09-05T21:29:41+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Deliver the terminal-rejection recovery as one reviewable commit.

## Scope

Give the delivery controller an answer for a command the server permanently refuses, so one bad change cannot strand a workout.

Rule confirmed by the Owner on `2026-09-05`, unchanged from the proposal:

- a `rejected` result is terminal for that command; it is removed from the outbox instead of retried;
- the client then refreshes the authoritative workout and replays the remaining pending commands onto it, exactly as it already does after a conflict;
- the screen states plainly that one change could not be saved and was undone, naming the affected set or exercise, and the workout stays fully usable;
- retryable failures and revision conflicts keep their current behavior.

## Out of scope

- The strict ordering guarantee for accepted commands
- The command contract, its validation rules, and any server-side change
- Automatic correction of the refused change

## Acceptance criteria

- [ ] A permanently rejected command is delivered at most once and never blocks a later command.
- [ ] After a rejection the queue behind it is delivered and the workout can be finished.
- [ ] The user sees which change was lost, and the displayed workout matches the server after recovery.
- [ ] Retryable failures still retry, and revision conflicts still refresh and replay.

## Traceability

- MVP criteria: supporting `MVP-WRK-004`, `MVP-WRK-005`, `MVP-WRK-011`
- ADRs: [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md); the recovery rule is recorded either there or as a local decision in the durability document
- Canonical documents: [`../../architecture/active-workout-durability.md`](../../architecture/active-workout-durability.md), [`../../product/workouts.md`](../../product/workouts.md)

## Dependencies and blockers

- Dependencies: None
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: the durability recovery rules, the workout auto-save description, this Task, `F-012`, registry, dashboard, and project state
- Documentation that should remain unchanged: command contract, ordering guarantee, conflict recovery

## Execution checklist

- [ ] Record the accepted recovery rule in canonical documentation.
- [ ] Make a rejection terminal in the delivery controller and drop the command from the outbox.
- [ ] Refresh and replay the remaining commands, reusing the existing conflict recovery path.
- [ ] Surface the lost change in the active-workout cue.
- [ ] Extend the delivery-controller and active-workout tests without running them.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, documentation links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** delivery-controller unit scenarios for a terminal rejection followed by successful delivery of the queued commands, and an active-workout component scenario that finishes a workout after a rejection; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-026: recover from a permanently rejected active-workout command`
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
- [x] Owner confirms the recovery rule and the transition to `Ready`

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
| `2026-09-05T19:17:58+02:00` | User / Owner | None | `Backlog` | Requested after the 2026-09-05 workout was stranded by one refused command |
| `2026-09-05T21:29:41+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed the proposed recovery rule unchanged |
| `2026-09-05T21:29:41+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the terminal-rejection recovery |
