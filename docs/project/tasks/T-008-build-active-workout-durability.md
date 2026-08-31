# T-008 — Build active-workout command durability foundation

- **Feature:** `F-004`
- **Status:** `In Review`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-08-31T16:31:42+02:00`
- **Started:** `2026-08-31T16:00:01+02:00`
- **Review started:** `2026-08-31T16:31:42+02:00`
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** User reviews exact delivery `0ed5ebc8c042994c74cc991acc13631ca2ec895f`; feature tests remain locked.

## Scope

Implement the typed active-workout command envelope, dedicated POST Route Handler, PostgreSQL idempotency/revision transaction boundary, narrow IndexedDB pending outbox, FIFO delivery controller, acknowledgement handling, restore/replay, and recoverable conflict contract without completing the workout UI.

## Out of scope

- General offline application support or cross-device synchronization
- Complete workout screens and domain-feature behavior
- Production deployment and multi-user collaboration

## Acceptance criteria

- [x] Pending commands persist transactionally before delivery and leave the outbox only after acknowledgement.
- [x] Server application is transactional, idempotent by command ID, and guarded by expected workout revision.
- [x] Reload/reopen restores authoritative state and replays pending commands in FIFO order without duplication.
- [x] Conflicts stop silent overwrite and expose a recoverable refresh/replay result for later UI integration.

## Traceability

- MVP criteria: foundational support for `MVP-REL-003`, `MVP-REL-004`, `MVP-WRK-005`, `MVP-WRK-006`
- ADRs: [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../product/workouts.md`](../../product/workouts.md)

## Dependencies and blockers

- Dependencies: `T-007` Done
- Blockers: None
- Blocked from status: Not blocked; remains planned in `Backlog`

## Documentation impact

- Documents to create or update: active-workout transport contracts and setup guidance, this Task, and project projections
- Documentation that should remain unchanged: completed workout UX and unrelated feature behavior

## Execution checklist

- [x] Implement typed commands and transactional server application.
- [x] Implement the narrow IndexedDB outbox and FIFO client controller.
- [x] Implement acknowledgement, restore/replay, retry, and conflict result contracts.
- [x] Prepare unit/integration/browser tests without executing before approval.

## Static-check plan and results

- Planned checks: ESLint, strict TypeScript, production build, formatting, documentation links, `git diff --check`
- Results: Passed on 2026-08-31 with Node.js `24.20.0` and npm `11.19.0`: `npm run check` passed Prettier, ESLint and dependency boundaries, strict TypeScript, the Next.js production build without database environment variables, Markdown lint across 78 files, and all 544 internal links; `git diff --check` passed. Declarative sync generated the reviewed migration and committed database types were regenerated from the locally applied migration. No unit, repository integration, database reset/test, Playwright, or manual feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run `npm run test:unit`; reset local Supabase to the exact migration history, export its server environment, and run `npm run test:repository` for concurrent idempotency, revision conflict, transaction, and timer coverage; install the locked Chromium/WebKit binaries and run `npm run test:browser` for IndexedDB persistence, reload/retry, FIFO, acknowledgement, and conflict recovery scenarios.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `0ed5ebc8c042994c74cc991acc13631ca2ec895f`
- **Subject:** `T-008: build active workout durability`
- **Committed scope:** Typed note-autosave and timer command envelopes; dedicated POST transport and specialized acknowledgement/conflict/retry results; advisory-locked transactional PostgreSQL application with command-ID idempotency and workout revisions; generated database types; narrow IndexedDB FIFO outbox, delivery/status controller, and authoritative restore/pending replay API; locked Playwright browser baseline; unexecuted unit, real-repository, and mobile-browser tests; canonical durability/setup guidance and synchronized project records.

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
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and unexecuted test plan are recorded
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
| `2026-08-31T11:43:22+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Isolate the complex active-workout durability mechanism from feature UI delivery |
| `2026-08-31T16:00:01+02:00` | User / Owner | `Backlog` | `Ready` | Directed Codex to start `T-008`; `T-007` is complete and all readiness gates are satisfied |
| `2026-08-31T16:00:01+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began the accepted active-workout durability scope |
| `2026-08-31T16:31:42+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created delivery commit `0ed5ebc8c042994c74cc991acc13631ca2ec895f`; all planned static checks passed and prepared feature tests were not run |
