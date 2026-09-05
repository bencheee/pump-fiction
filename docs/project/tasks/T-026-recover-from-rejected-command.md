# T-026 — Recover from a permanently rejected active-workout command

- **Feature:** `F-012`
- **Status:** `Testing`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T19:17:58+02:00`
- **Updated:** `2026-09-05T21:36:33+02:00`
- **Started:** `2026-09-05T21:29:41+02:00`
- **Review started:** `2026-09-05T21:35:40+02:00`
- **Approval requested:** `2026-09-05T21:36:33+02:00`
- **Approved:** `2026-09-05T21:36:33+02:00`
- **Testing started:** `2026-09-05T21:36:33+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Run the authorized unit and component suites for `90875783eda308cdb95b33ad43a336bbd6060ccd`.

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

- [x] Record the accepted recovery rule in canonical documentation — the durability result table, the controller contract, the recovery section, and the workout auto-save description.
- [x] Make a rejection terminal in the delivery controller and drop the command from the outbox — it leaves the outbox before the status is reported, so the reported pending count already excludes it.
- [x] Refresh and replay the remaining commands, reusing the existing conflict recovery path — the new `discard_and_replay` status drives the same `recoverFromConflict` the conflict path uses, so the remaining commands are rebased onto the refreshed revision.
- [x] Surface the lost change in the active-workout cue — recovery runs without a gesture, so the loss is reported in a dismissible notice that outlives the transient cue and names the target through the new `describeCommandTarget`; no Retry is offered for a refused command, on either screen.
- [x] Extend the delivery-controller and active-workout tests — two controller scenarios cover the terminal drop with the queue retained and the delivery of that queue with exactly one attempt at the refused command; a component scenario refuses a set update, asserts the named notice and the emptied outbox, and then saves a later change.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, documentation links, and `git diff --check`
- Results: Passed on `2026-09-05T21:35:07+02:00`. `npm run check` passed formatting, ESLint, strict TypeScript, the production build, UI asset checksums, Markdown lint, and internal links; `git diff --check` was clean. This Task changes no schema, migration, or generated type, so the database checks do not apply. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** delivery-controller unit scenarios for a terminal rejection followed by successful delivery of the queued commands, and an active-workout component scenario that finishes a workout after a rejection; must not run before Owner approval of the exact commit
- **Authorized commit:** `90875783eda308cdb95b33ad43a336bbd6060ccd`
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `90875783eda308cdb95b33ad43a336bbd6060ccd`
- **Subject:** `T-026: recover from a permanently rejected active-workout command`
- **Committed scope:** the delivery controller and its test, the new `describe-command-target` domain helper, the active-workout experience and its component test, the finish review, `active-workout-durability.md`, `workouts.md`, and this Task

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-05T21:36:33+02:00`
- **Outcome:** Approved
- **Findings:** None recorded

## Approval

- **Approved commit:** `90875783eda308cdb95b33ad43a336bbd6060ccd`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-05T21:36:33+02:00`
- **Approval note:** Approved the exact delivery commit. This Task changes no schema, so the verification is the unit and component suites; no reset was required or requested

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
| `2026-09-05T21:35:40+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered `90875783eda308cdb95b33ad43a336bbd6060ccd`; static checks passed and no feature test ran |
| `2026-09-05T21:36:33+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved the exact delivery commit |
| `2026-09-05T21:36:33+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Running the authorized unit and component suites against `90875783eda308cdb95b33ad43a336bbd6060ccd` |
