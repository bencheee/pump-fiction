# T-008 — Build active-workout command durability foundation

- **Feature:** `F-004`
- **Status:** `Approved`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-09-01T09:09:42+02:00`
- **Started:** `2026-08-31T16:00:01+02:00`
- **Review started:** `2026-09-01T09:06:20+02:00` for latest replacement
- **Approval requested:** `2026-09-01T09:09:42+02:00` for latest replacement
- **Approved:** `2026-09-01T09:09:42+02:00` for latest replacement
- **Testing started:** `2026-09-01T09:00:57+02:00` for latest approved replacement
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Run the complete recorded test plan from the beginning against exact approved replacement `b21a7e0631a27f5b633513899fa42aa2d50e5243` in a fresh isolated worktree.

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
- Blocked from status: Not blocked

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
- Results: Passed for the next replacement on 2026-09-01 with Node.js `24.20.0` and npm `11.19.0`: `npm run check` passed Prettier, ESLint and dependency boundaries, strict TypeScript, the Next.js production build without database environment variables, Markdown lint across 78 files, and all 544 internal links; `git diff --check` passed. Static path checks confirmed both explicit integration-test files exist. Feature tests were not rerun after the script correction.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run `npm run test:unit`; reset local Supabase to the exact migration history, export its server environment, and run `npm run test:repository` for concurrent idempotency, revision conflict, transaction, and timer coverage; install the locked Chromium/WebKit binaries and run `npm run test:browser` for IndexedDB persistence, reload/retry, FIFO, acknowledgement, and conflict recovery scenarios.
- **Authorized commit:** `b21a7e0631a27f5b633513899fa42aa2d50e5243`
- **Results:** Prior superseded failures remain recorded in transition history. Against exact approved replacement `9dab09e2520be061a1c8832526bfa2bdb19efec3` on 2026-09-01 with Node.js `24.20.0`, Vitest `4.1.11`, Supabase CLI `2.116.0`, and local PostgreSQL `17`, a fresh `npm ci` installed the expected CLI, unit tests passed 9/9 across 3/3 files, and a clean database reset applied both migrations. `npm run test:repository` then passed its quoted glob literally to Vitest, which found no files and exited with code 1 before executing an integration test. Chromium/WebKit tests did not run. A test-script-only replacement with explicit repository test paths and new approval are required; the complete plan will rerun from the beginning.

## Delivery commit

- **Delivery commit SHA:** `b21a7e0631a27f5b633513899fa42aa2d50e5243` (replaces `9dab09e2520be061a1c8832526bfa2bdb19efec3` and its earlier predecessors)
- **Subject:** `T-008: correct repository test selection`
- **Committed scope:** Replace the quoted repository glob with both explicit integration-test paths, record the failed selection, and clear approval; application and test behavior remain unchanged.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-01T09:09:42+02:00`
- **Outcome:** Recommended latest replacement for approval
- **Findings:** Prior findings are corrected. The repository script quoted a glob that Vitest treated literally, so no integration files were selected.

## Approval

- **Approved commit:** `b21a7e0631a27f5b633513899fa42aa2d50e5243`
- **Approved by:** User
- **Approved at:** `2026-09-01T09:09:42+02:00`
- **Approval note:** User explicitly confirmed the exact test-script-only replacement, authorizing the complete recorded test plan from the beginning.

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

- [x] Reviewer recommends approval
- [x] User approved the exact commit SHA
- [x] Scope and acceptance criteria are satisfied
- [x] Canonical documentation and required ADRs are current
- [ ] Authorized feature tests passed
- [x] Static checks and all evidence are recorded
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
| `2026-08-31T16:35:14+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact delivery `0ed5ebc8c042994c74cc991acc13631ca2ec895f` with no findings and recommended approval |
| `2026-08-31T16:35:14+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Approved the exact delivery and authorized only its recorded tests |
| `2026-08-31T16:38:30+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the recorded unit verification in an isolated worktree at exact delivery `0ed5ebc8c042994c74cc991acc13631ca2ec895f` |
| `2026-08-31T16:38:30+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Unit verification passed 8/9 assertions but exposed incorrect Playwright discovery and one over-broad instrumentation assertion; remaining database and browser tests were not run, and replacement approval is required |
| `2026-08-31T16:43:18+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created replacement delivery `3c5ada6590feab5ce2d5ccd0b6732113f3f7f4e6`; static checks passed and corrected feature tests were not run |
| `2026-08-31T16:45:34+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact replacement delivery `3c5ada6590feab5ce2d5ccd0b6732113f3f7f4e6` with no additional findings and recommended approval |
| `2026-08-31T16:45:34+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Approved the exact replacement and authorized the complete recorded test plan from the beginning |
| `2026-09-01T08:48:42+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the complete recorded verification from the beginning in a fresh isolated worktree at exact replacement `3c5ada6590feab5ce2d5ccd0b6732113f3f7f4e6` |
| `2026-09-01T08:50:04+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Unit tests passed 9/9, but incorrect optional-package platform metadata caused the clean installation to omit the Supabase CLI binary; the database stack never started and remaining tests did not run |
| `2026-09-01T08:53:52+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created lockfile-only replacement `9dab09e2520be061a1c8832526bfa2bdb19efec3`; a fresh install exposes Supabase CLI `2.116.0`, static checks passed, and feature tests were not rerun |
| `2026-09-01T08:59:19+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact lockfile-only replacement `9dab09e2520be061a1c8832526bfa2bdb19efec3` with no additional findings and recommended approval |
| `2026-09-01T08:59:19+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Approved the exact latest replacement and authorized the complete recorded test plan from the beginning |
| `2026-09-01T09:00:57+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the complete recorded verification from the beginning in a fresh isolated worktree at exact replacement `9dab09e2520be061a1c8832526bfa2bdb19efec3` |
| `2026-09-01T09:03:53+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Clean install, CLI check, unit tests 9/9, and clean database reset passed, but a quoted glob selected no repository tests; browser tests did not run and another replacement approval is required |
| `2026-09-01T09:06:20+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created test-script-only replacement `b21a7e0631a27f5b633513899fa42aa2d50e5243`; static checks passed and feature tests were not rerun |
| `2026-09-01T09:09:42+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact test-script-only replacement `b21a7e0631a27f5b633513899fa42aa2d50e5243` with no additional findings and recommended approval |
| `2026-09-01T09:09:42+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Confirmed the exact latest replacement and authorized the complete recorded test plan from the beginning |
