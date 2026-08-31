# T-008 — Build active-workout command durability foundation

- **Feature:** `F-004`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 4
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-08-31T11:43:22+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Wait for the server/application contracts from `T-007`.

## Scope

Implement the typed active-workout command envelope, dedicated POST Route Handler, PostgreSQL idempotency/revision transaction boundary, narrow IndexedDB pending outbox, FIFO delivery controller, acknowledgement handling, restore/replay, and recoverable conflict contract without completing the workout UI.

## Out of scope

- General offline application support or cross-device synchronization
- Complete workout screens and domain-feature behavior
- Production deployment and multi-user collaboration

## Acceptance criteria

- [ ] Pending commands persist transactionally before delivery and leave the outbox only after acknowledgement.
- [ ] Server application is transactional, idempotent by command ID, and guarded by expected workout revision.
- [ ] Reload/reopen restores authoritative state and replays pending commands in FIFO order without duplication.
- [ ] Conflicts stop silent overwrite and expose a recoverable refresh/replay result for later UI integration.

## Traceability

- MVP criteria: foundational support for `MVP-REL-003`, `MVP-REL-004`, `MVP-WRK-005`, `MVP-WRK-006`
- ADRs: [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../product/workouts.md`](../../product/workouts.md)

## Dependencies and blockers

- Dependencies: `T-007` Done
- Blockers: Dependency not complete
- Blocked from status: Not blocked; remains planned in `Backlog`

## Documentation impact

- Documents to create or update: active-workout transport contracts and setup guidance, this Task, and project projections
- Documentation that should remain unchanged: completed workout UX and unrelated feature behavior

## Execution checklist

- [ ] Implement typed commands and transactional server application.
- [ ] Implement the narrow IndexedDB outbox and FIFO client controller.
- [ ] Implement acknowledgement, restore/replay, retry, and conflict result contracts.
- [ ] Prepare unit/integration/browser tests without executing before approval.

## Static-check plan and results

- Planned checks: ESLint, strict TypeScript, production build, formatting, documentation links, `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run command/idempotency/revision integration tests and Playwright IndexedDB reload/retry/conflict scenarios against the exact commit.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-008: build active workout durability`
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
- [x] MVP criteria, ADRs, and canonical documents are linked
- [x] Executor and Reviewer are named
- [ ] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and unexecuted test plan are recorded
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
| `2026-08-31T11:43:22+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Isolate the complex active-workout durability mechanism from feature UI delivery |
