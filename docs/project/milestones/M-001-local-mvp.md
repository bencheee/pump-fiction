# M-001 — Local MVP

- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T15:43:40+02:00`
- **Updated:** `2026-09-02T10:10:10+02:00`
- **Progress:** `4/10 required Features Done`
- **Blocked children:** `0`
- **Awaiting approval children:** `0`

## Outcome

A complete local, single-user, phone-only application that satisfies all locked MVP acceptance criteria and is ready for a later production-preparation phase.

## Scope

- Included: accepted local-MVP behavior in [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), local technical architecture, implementation, approved feature testing, and current documentation.
- Excluded: production deployment, production-access protection, and capabilities explicitly classified as post-MVP.

## Completion criteria

- [ ] All 57 locked MVP acceptance criteria are satisfied
- [ ] All required Features are `Done`
- [ ] Canonical product, architecture, process, and project documentation is current
- [ ] No required implementation or verification work remains hidden
- [ ] User confirms the local-MVP result

## Features

- [`F-001`](../features/F-001-local-technical-architecture.md) — Local Technical Architecture (`Done`)
- [`F-002`](../features/F-002-mvp-delivery-planning.md) — MVP Delivery Planning (`Done`)
- [`F-003`](../features/F-003-mobile-ui-ux-design-package.md) — Mobile UI/UX Design Package (`Done`)
- [`F-004`](../features/F-004-application-and-data-foundation.md) — Application and Data Foundation (`Done`)
- [`F-005`](../features/F-005-exercise-library.md) — Exercise Library (`Now / 1`; `1/2 Tasks Done`)
- [`F-006`](../features/F-006-programs-and-splits.md) — Programs and Splits (`Next / 4`)
- [`F-007`](../features/F-007-today-and-active-workout.md) — Today and Active Workout (`Next / 5`)
- [`F-008`](../features/F-008-history-and-statistics.md) — History and Statistics (`Next / 6`)
- [`F-009`](../features/F-009-weight-and-body-progress.md) — Weight and Body Progress (`Next / 7`)
- [`F-010`](../features/F-010-local-mvp-integration.md) — Local MVP Integration (`Next / 8`)

### Primary MVP-criteria ownership

Each of the 57 locked criteria has exactly one primary implementation owner. Supporting dependencies do not create duplicate ownership.

| Feature | Primary criteria | Count |
| --- | --- | ---: |
| `F-004` | `MVP-REL-001`–`002` | 2 |
| `F-005` | `MVP-EXE-001`–`008` | 8 |
| `F-006` | `MVP-PRG-001`–`007` | 7 |
| `F-007` | `MVP-TOD-001`–`003`; `MVP-WRK-001`–`012` | 15 |
| `F-008` | `MVP-HIS-001`–`011` | 11 |
| `F-009` | `MVP-TOD-004`; `MVP-WGT-001`–`004`; `MVP-BOD-001`–`004` | 9 |
| `F-010` | `MVP-REL-003`–`004`; `MVP-UX-001`–`003` | 5 |
| **Total** | | **57** |

## Dependencies and blockers

- Dependencies: Accepted product specification, MVP criteria, development governance, and project-management workflow
- Blockers: None; `F-005` is active through `T-010`

## Related decisions and documents

- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0004](../../decisions/0004-local-first-development.md), [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md)
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/constraints.md`](../../architecture/constraints.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Completion criteria are observable
- [x] Complete required Feature breakdown is identified
- [x] Dependencies and blockers are understood
- [x] Owner confirms readiness of the complete Milestone breakdown through the 2026-08-25 instruction to proceed

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-08-25T15:43:40+02:00` | User / Owner | Created `M-001` in `Now` | Establish the Local MVP delivery outcome and begin architecture definition |
| `2026-08-25T16:27:49+02:00` | User / Owner and Approver | Completed registered `F-001`; Milestone remains incomplete | Local architecture accepted; implementation Feature breakdown still required |
| `2026-08-25T16:35:55+02:00` | User / Owner | Confirmed complete Feature-planning work and external-design phase | Added `F-002` through `F-010`; Milestone execution remains gated per Task |
| `2026-08-25T16:49:33+02:00` | User / Owner and Approver | Completed `F-002` | Approved the exact planning delivery; `F-003` design-brief refinement is next |
| `2026-08-26T12:30:56+02:00` | User / Owner | Started `F-003` through ready Task `T-003` | Confirmed design inputs; outbound brief package prepared for Owner review |
| `2026-08-26T12:38:44+02:00` | User / Owner | Approved `T-003` outbound prompt content | Authorized creation of the delivery commit; exact-SHA approval remains pending |
| `2026-08-26T12:40:26+02:00` | Codex primary agent / Executor | Created the `T-003` delivery commit | Exact delivery is in review; no tests were run |
| `2026-08-26T12:46:10+02:00` | User / Reviewer and Approver | Completed `T-003` | Approved the exact outbound brief; `F-003` continues with external design and handoff audit |
| `2026-08-31T11:37:41+02:00` | User / Owner | Started final design-handoff audit and implementation preparation | `T-004` is active; `F-004` now has its five-Task delivery breakdown |
| `2026-08-31T11:59:23+02:00` | Codex primary agent / Executor | Delivered `T-004` for review | Exact design-handoff delivery is ready for User review; no feature tests were run |
| `2026-08-31T12:06:31+02:00` | User / Owner and Approver | Completed `F-003` and started `F-004` | Approved exact `T-004` delivery and cleared `T-005` to begin application initialization |
| `2026-08-31T15:26:48+02:00` | Codex primary agent / Tester and Executor | Completed `T-006` and started `T-007` within `F-004` | Approved schema replacement passed all recorded verification; server data and application boundaries are next |
| `2026-08-31T15:49:04+02:00` | Codex primary agent / Tester | Completed `T-007` within `F-004` and paused | Approved unit and local repository verification passed; Owner explicitly directed that `T-008` not start |
| `2026-09-01T17:04:42+02:00` | Codex primary agent / Tester | Completed all required Tasks within `F-004` | Approved latest `T-009` replacement passed its full verification; `F-004` remains incomplete until the User confirms the aggregate feature result |
| `2026-09-02T08:55:13+02:00` | User / Owner | Completed `F-004`; Milestone remains incomplete | Confirmed the aggregate Application and Data Foundation result; `M-001` advances to 4/10 required Features Done |
| `2026-09-02T08:59:17+02:00` | User / Owner | Started `F-005` through `T-010` | Confirmed the two-Task Exercise Library breakdown and began its application/persistence delivery |
| `2026-09-02T09:21:51+02:00` | Codex primary agent / Executor | Completed `T-010` implementation scope pending delivery | Exercise Library operations are statically verified; approval-gated verification remains unexecuted |
| `2026-09-02T09:24:32+02:00` | Codex primary agent / Executor | Delivered `T-010` for review | Exact delivery `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7` awaits User review before any feature testing |
| `2026-09-02T09:43:39+02:00` | User / Reviewer and Approver | Approved exact `T-010` delivery for testing | Authorized only the recorded scoped tests against `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7` |
| `2026-09-02T09:47:00+02:00` | Codex primary agent / Tester | Began T-010 verification | Running only the approved scoped tests against the exact delivery in an isolated worktree |
| `2026-09-02T09:51:21+02:00` | Codex primary agent / Tester | Returned `T-010` to `In Progress` | Exercise pgTAP failed 2/5 due test-fixture constraint-mode leakage; repository verification stopped and approval is invalidated |
| `2026-09-02T09:55:08+02:00` | Codex primary agent / Executor | Corrected T-010 test isolation pending replacement | Every pgTAP fixture now resets deferred mode; static checks passed without feature tests |
| `2026-09-02T09:56:40+02:00` | Codex primary agent / Executor | Delivered T-010 replacement for review | Exact test-only replacement `410c44edd4f8b1698f7de6b792eed0be16a26052` awaits fresh User approval |
| `2026-09-02T10:00:54+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-010 replacement and began verification | Running the complete recorded plan against exact replacement `410c44edd4f8b1698f7de6b792eed0be16a26052` |
| `2026-09-02T10:10:10+02:00` | Codex primary agent / Tester | Completed `T-010` within `F-005` | Exact replacement passed unit 5/5, clean reset, pgTAP 18/18, and Exercise repository integration 1/1; `T-011` awaits Owner direction |
