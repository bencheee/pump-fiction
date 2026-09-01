# F-004 — Application and Data Foundation

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-09-01T17:01:55+02:00`
- **Progress:** `4/5 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

The accepted Next.js and local Supabase foundations provide the phone-only shell, typed persistence boundaries, schema/migration workflow, and shared UI/chart primitives required by later Features.

## Scope

- Included: repository initialization, static quality commands, environment/configuration, local database baseline, shared server/data boundaries, app shell/navigation, tokens/primitives, and persistence foundation.
- Excluded: domain-feature completion, production deployment/security, and unaccepted visual invention.

## Acceptance criteria

- Primary MVP ownership: `MVP-REL-001`, `MVP-REL-002`, and foundational persistence support for `MVP-REL-003`.
- Foundation conforms to ADR-0017 through ADR-0020 and can support the accepted design package without bypassing canonical boundaries.

## Tasks

- [`T-005`](../tasks/T-005-initialize-application-and-static-quality.md) — Initialize application and static-quality baseline
- [`T-006`](../tasks/T-006-establish-local-database-schema.md) — Establish local database schema and generated types
- [`T-007`](../tasks/T-007-build-server-data-boundaries.md) — Build server data and application boundaries
- [`T-008`](../tasks/T-008-build-active-workout-durability.md) — Build active-workout command durability foundation
- [`T-009`](../tasks/T-009-build-mobile-shell-and-ui-foundation.md) — Build mobile shell and shared UI foundation

## Dependencies and blockers

- Dependencies: completed `F-002`; accepted `T-004` output before any implementation Task starts
- Blockers: None; `T-009` is in progress

## Related decisions and documents

- ADRs: [ADR-0017](../../decisions/0017-nextjs-app-router-runtime.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md)
- Canonical documents: [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified; the first executable work is `In Progress`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner confirms the Feature breakdown and implementation direction

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Created in `Next` | Establish implementation dependencies without initializing the application |
| `2026-08-31T11:37:41+02:00` | User / Owner | Confirmed implementation preparation and required Task breakdown | Move into implementation as soon as the frozen design handoff receives exact-commit approval |
| `2026-08-31T12:06:31+02:00` | User / Owner | Moved Feature to `Now` and started `T-005` | Approved the frozen design delivery and cleared the implementation dependency |
| `2026-08-31T12:22:39+02:00` | Codex primary agent / Executor | Completed `T-005` implementation scope pending delivery commit | Locked the runtime and dependencies, initialized source boundaries, and passed the static-only quality baseline |
| `2026-08-31T12:26:36+02:00` | Codex primary agent / Executor | Delivered `T-005` for review | Commit `f8781b22a3e9abd7bf31afef9a74d9a0f55d429e` establishes the application and static-quality baseline |
| `2026-08-31T14:19:48+02:00` | User / Reviewer and Approver | Completed `T-005` and started `T-006` | Approved exact initialization delivery and cleared the local-schema Task to begin |
| `2026-08-31T14:51:13+02:00` | Codex primary agent / Executor | Completed `T-006` implementation scope pending delivery commit | Declarative schema, baseline migration, generated types, workflow documentation, and unexecuted pgTAP tests are ready |
| `2026-08-31T14:56:59+02:00` | Codex primary agent / Executor | Delivered `T-006` for review | Commit `e9251ed73d0976378f2fe71e68aed3045ee10fdf` establishes the local database schema baseline |
| `2026-08-31T15:01:41+02:00` | User / Reviewer and Approver | Approved exact `T-006` delivery for testing | Commit `e9251ed73d0976378f2fe71e68aed3045ee10fdf` may run only its recorded local database verification |
| `2026-08-31T15:09:44+02:00` | Codex primary agent / Tester | Returned `T-006` to `In Progress` | Clean schema reset and generated types passed, but 11 pgTAP assertions used incorrect exception expectations and require replacement delivery |
| `2026-08-31T15:12:56+02:00` | Codex primary agent / Executor | Corrected `T-006` test source pending replacement delivery | Exception-code assertions now use pgTAP's explicit four-argument signature, and the archived-next-split setup reaches its intended trigger; static checks passed without rerunning feature tests |
| `2026-08-31T15:14:02+02:00` | Codex primary agent / Executor | Delivered corrected `T-006` for review | Replacement commit `a5cf25925aabcdebd74cd0c4b0fbe286010eaff7` changes only test assertions, setup, and lifecycle evidence; corrected feature tests remain unexecuted |
| `2026-08-31T15:22:46+02:00` | User / Reviewer and Approver | Approved corrected `T-006` replacement delivery | Exact commit `a5cf25925aabcdebd74cd0c4b0fbe286010eaff7` may run only its recorded local database verification |
| `2026-08-31T15:26:48+02:00` | Codex primary agent / Tester and Executor | Completed `T-006` and started `T-007` | Exact replacement delivery passed clean reset, 13/13 pgTAP assertions, and generated-type comparison; the accepted server-boundary Task is now active |
| `2026-08-31T15:39:04+02:00` | Codex primary agent / Executor | Completed `T-007` implementation scope pending delivery | Server-only client and imports, domain-shaped repository/application flow, generic retry errors, one app-settings vertical slice, canonical guidance, and unexecuted tests are statically verified |
| `2026-08-31T15:40:58+02:00` | Codex primary agent / Executor | Delivered `T-007` for review | Commit `14d97227734c812d8b0cd875c372b1ffa0ebdea0` establishes the server data/application boundary foundation; tests remain unexecuted |
| `2026-08-31T15:43:23+02:00` | User / Reviewer and Approver | Approved exact `T-007` delivery for testing | Commit `14d97227734c812d8b0cd875c372b1ffa0ebdea0` may run only its recorded tests; `T-008` must not start |
| `2026-08-31T15:49:04+02:00` | Codex primary agent / Tester | Completed `T-007` and paused before `T-008` | Unit tests passed 3/3 and real local repository integration passed 1/1 after a clean reset; Owner direction leaves `T-008` in `Backlog` |
| `2026-08-31T16:00:01+02:00` | User / Owner and Codex primary agent / Executor | Started `T-008` | Owner direction cleared the pause and the ready active-workout durability Task moved into execution |
| `2026-08-31T16:29:29+02:00` | Codex primary agent / Executor | Completed `T-008` implementation scope pending delivery | Transactional idempotent command application, route contract, IndexedDB FIFO delivery, restore/replay recovery, canonical guidance, and unexecuted tests are statically verified |
| `2026-08-31T16:31:42+02:00` | Codex primary agent / Executor | Delivered `T-008` for review | Commit `0ed5ebc8c042994c74cc991acc13631ca2ec895f` establishes the active-workout durability foundation; tests remain unexecuted |
| `2026-08-31T16:35:14+02:00` | User / Reviewer and Approver | Approved exact `T-008` delivery for testing | Commit `0ed5ebc8c042994c74cc991acc13631ca2ec895f` may run only its recorded unit, local repository, and mobile-browser verification |
| `2026-08-31T16:38:30+02:00` | Codex primary agent / Tester | Returned `T-008` to `In Progress` | Unit verification exposed Playwright discovery by Vitest and one over-broad instrumentation assertion; remaining tests stopped and replacement approval is required |
| `2026-08-31T16:41:47+02:00` | Codex primary agent / Executor | Corrected `T-008` test source pending replacement delivery | Vitest unit discovery is limited to `src`, the assertion checks only delivery-order events, and static checks passed without rerunning feature tests |
| `2026-08-31T16:43:18+02:00` | Codex primary agent / Executor | Delivered corrected `T-008` for review | Replacement commit `3c5ada6590feab5ce2d5ccd0b6732113f3f7f4e6` changes only test discovery, one assertion, and lifecycle evidence; corrected feature tests remain unexecuted |
| `2026-08-31T16:45:34+02:00` | User / Reviewer and Approver | Approved corrected `T-008` replacement delivery | Exact replacement `3c5ada6590feab5ce2d5ccd0b6732113f3f7f4e6` may run the complete recorded test plan from the beginning |
| `2026-09-01T08:50:04+02:00` | Codex primary agent / Tester | Returned `T-008` replacement to `In Progress` | Unit tests passed 9/9, but incorrect lockfile platform metadata omitted the Supabase CLI binary before database startup; remaining tests stopped and another replacement approval is required |
| `2026-09-01T08:53:05+02:00` | Codex primary agent / Executor | Corrected `T-008` lockfile pending replacement delivery | Platform metadata now matches the canonical Node 24/npm 11 lock graph, a fresh install exposes Supabase CLI `2.116.0`, and static checks passed without rerunning feature tests |
| `2026-09-01T08:53:52+02:00` | Codex primary agent / Executor | Delivered latest corrected `T-008` for review | Lockfile-only replacement `9dab09e2520be061a1c8832526bfa2bdb19efec3` restores platform metadata; application and test behavior are unchanged and feature tests remain unexecuted after the correction |
| `2026-09-01T08:59:19+02:00` | User / Reviewer and Approver | Approved latest `T-008` replacement delivery | Exact lockfile-only replacement `9dab09e2520be061a1c8832526bfa2bdb19efec3` may run the complete recorded test plan from the beginning |
| `2026-09-01T09:03:53+02:00` | Codex primary agent / Tester | Returned latest `T-008` replacement to `In Progress` | Clean install, unit tests 9/9, and clean reset passed, but a quoted glob selected no repository tests; browser tests stopped and another replacement approval is required |
| `2026-09-01T09:05:32+02:00` | Codex primary agent / Executor | Corrected `T-008` repository test selection pending replacement delivery | The script names both integration tests explicitly and static checks passed without rerunning feature tests |
| `2026-09-01T09:06:20+02:00` | Codex primary agent / Executor | Delivered latest corrected `T-008` for review | Test-script-only replacement `b21a7e0631a27f5b633513899fa42aa2d50e5243` names both repository tests explicitly; application and test behavior remain unchanged |
| `2026-09-01T09:09:42+02:00` | User / Reviewer and Approver | Approved latest `T-008` replacement delivery | Exact test-script-only replacement `b21a7e0631a27f5b633513899fa42aa2d50e5243` may run the complete recorded test plan from the beginning |
| `2026-09-01T09:15:05+02:00` | Codex primary agent / Tester | Completed `T-008` and paused before `T-009` | Exact replacement passed clean install/CLI verification, unit tests 9/9, clean reset, repository integration 2/2, and Chromium/WebKit scenarios 6/6; `T-009` remains in `Backlog` pending Owner direction |
| `2026-09-01T09:18:25+02:00` | User / Owner and Codex primary agent / Executor | Started `T-009` | Owner direction cleared the pause and the ready mobile shell and shared UI foundation Task moved into execution |
| `2026-09-01T09:37:39+02:00` | Codex primary agent / Executor | Completed `T-009` implementation scope pending delivery | Frozen local assets/tokens, phone shells, route and overlay foundations, demonstrated shared primitives, canonical guidance, and unexecuted UI tests are statically verified |
| `2026-09-01T09:39:10+02:00` | Codex primary agent / Executor | Delivered `T-009` for review | Commit `027b8fb4020f4f1353f38fb005d16d0391e959d8` establishes the mobile shell and shared UI foundation; feature tests remain unexecuted |
| `2026-09-01T09:40:50+02:00` | User / Reviewer and Approver | Approved exact `T-009` delivery for testing | Commit `027b8fb4020f4f1353f38fb005d16d0391e959d8` may run only its recorded component and mobile-browser verification |
| `2026-09-01T09:42:09+02:00` | Codex primary agent / Tester | Began `T-009` verification | Running only the recorded component and mobile-browser plan in an isolated worktree at exact approved delivery |
| `2026-09-01T09:45:35+02:00` | Codex primary agent / Tester | Returned `T-009` to `In Progress` | Component tests passed 4/4 and automated browser scenarios passed 8/8, but all four structural captures contained the Next.js development indicator; production-server capture needs a replacement delivery and new approval |
| `2026-09-01T09:48:03+02:00` | Codex primary agent / Executor | Corrected `T-009` visual test fidelity pending replacement delivery | Production build/start, retained HTML attachments, and explicit 3x capture assertions are statically verified without rerunning feature tests |
| `2026-09-01T09:48:54+02:00` | Codex primary agent / Executor | Delivered corrected `T-009` for review | Replacement commit `746985808e7e587b1aa4366d00b133f121d6cd73` corrects production-server, report-retention, and 3x capture fidelity; corrected tests remain unexecuted |
| `2026-09-01T09:54:46+02:00` | User / Reviewer and Approver | Approved exact `T-009` replacement for testing | Commit `746985808e7e587b1aa4366d00b133f121d6cd73` may run the complete recorded T-009 test plan from the beginning |
| `2026-09-01T09:55:52+02:00` | Codex primary agent / Tester | Began replacement `T-009` verification | Repeating the complete recorded plan in an isolated worktree at exact approved replacement |
| `2026-09-01T09:59:46+02:00` | Codex primary agent / Tester | Returned replacement `T-009` to `In Progress` | Clean install and component tests 4/4 passed, but the production-hidden T-008 readiness URL prevented all browser scenarios from starting; another replacement and approval are required |
| `2026-09-01T16:04:54+02:00` | Codex primary agent / Executor | Corrected `T-009` production readiness pending replacement delivery | Playwright now polls `/today`; the correction is statically verified without rerunning feature tests |
| `2026-09-01T16:05:41+02:00` | Codex primary agent / Executor | Delivered latest corrected `T-009` for review | Replacement `ded6f9f73e5952eafe645d07142ab456808783b9` changes readiness to `/today`; corrected feature tests remain unexecuted |
| `2026-09-01T17:01:55+02:00` | User / Reviewer and Approver and Codex primary agent / Tester | Approved and began latest `T-009` replacement verification | Exact replacement `ded6f9f73e5952eafe645d07142ab456808783b9` is running the complete recorded plan from the beginning in an isolated worktree |
