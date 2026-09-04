# M-001 — Local MVP

- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T15:43:40+02:00`
- **Updated:** `2026-09-04T14:56:18+02:00`
- **Progress:** `6/10 required Features Done`
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
- [`F-005`](../features/F-005-exercise-library.md) — Exercise Library (`Done`)
- [`F-006`](../features/F-006-programs-and-splits.md) — Programs and Splits (`Done`)
- [`F-007`](../features/F-007-today-and-active-workout.md) — Today and Active Workout (`Now / 1`; `2/4 Tasks Done`)
- [`F-008`](../features/F-008-history-and-statistics.md) — History and Statistics (`Next / 1`)
- [`F-009`](../features/F-009-weight-and-body-progress.md) — Weight and Body Progress (`Next / 2`)
- [`F-010`](../features/F-010-local-mvp-integration.md) — Local MVP Integration (`Next / 3`)

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
- Blockers: None; `F-007` is active with `T-014` and `T-017` complete

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
| `2026-09-02T10:23:15+02:00` | User / Owner | Started `T-011` within `F-005` | Continue with the remaining Exercise Library mobile experience delivery |
| `2026-09-02T10:32:39+02:00` | Codex primary agent / Executor | Completed T-011 implementation and static verification | Prepare its exact delivery commit for User review without running feature tests |
| `2026-09-02T10:35:12+02:00` | Codex primary agent / Executor | Delivered T-011 for review | Exact delivery `bbcccb7961215a39ed3fe080ef1e0ad6edb56afa` awaits User review before any feature testing |
| `2026-09-02T10:41:09+02:00` | User / Reviewer and Approver | Approved exact T-011 delivery for testing | Run only the recorded verification against `bbcccb7961215a39ed3fe080ef1e0ad6edb56afa` |
| `2026-09-02T10:44:18+02:00` | Codex primary agent / Tester | T-011 verification requires a replacement | Component-test matcher/cleanup defects invalidated approval; browser tests did not run |
| `2026-09-02T10:47:53+02:00` | Codex primary agent / Executor | Delivered T-011 replacement for review | Exact test-only replacement `7c8240b7060e6a6a27b02681dbcbd8c3daeee81f` awaits fresh User approval |
| `2026-09-02T13:02:33+02:00` | User / Reviewer and Approver | Approved exact T-011 replacement for testing | Run the complete recorded verification from the beginning against `7c8240b7060e6a6a27b02681dbcbd8c3daeee81f` |
| `2026-09-02T13:04:11+02:00` | Codex primary agent / Tester | Began T-011 replacement verification | Running only the approved component and Chromium/WebKit phone-browser plan |
| `2026-09-02T13:07:55+02:00` | Codex primary agent / Tester | T-011 verification requires a behavioral replacement | Successful-create save feedback is lost after redirect; approval invalidated and remaining lifecycle assertions did not run |
| `2026-09-02T13:11:15+02:00` | Codex primary agent / Executor | Delivered T-011 save-feedback replacement for review | Exact replacement `c700a78421eb2ea5b65e43eee7e7b8c796d311d3` awaits fresh User approval |
| `2026-09-02T13:58:41+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved latest T-011 replacement and began verification | Running the complete recorded plan against exact replacement `c700a78421eb2ea5b65e43eee7e7b8c796d311d3` |
| `2026-09-02T14:02:43+02:00` | Codex primary agent / Tester | Completed `T-011` within `F-005` | Exact replacement passed component tests 3/3 and Chromium/WebKit scenarios 4/4; F-005 has 2/2 Tasks Done and awaits aggregate User confirmation |
| `2026-09-02T14:25:18+02:00` | User / Owner | Completed `F-005`; Milestone remains incomplete | Confirmed the aggregate Exercise Library result; `M-001` advances to 5/10 required Features Done |
| `2026-09-02T14:35:46+02:00` | User / Owner | Started `F-006` through `T-012` | Confirmed the two-Task Programs and Splits breakdown and began its application/persistence delivery |
| `2026-09-02T15:01:52+02:00` | Codex primary agent / Executor | Completed `T-012` implementation scope pending delivery | Programs and Splits operations are statically verified; approval-gated verification remains unexecuted |
| `2026-09-02T15:04:53+02:00` | Codex primary agent / Executor | Delivered `T-012` for review | Exact delivery `08f5e0f415c69f3d3d7f9800fb617d23cf8806bc` awaits User review before any feature testing |
| `2026-09-02T15:07:10+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-012 delivery and began verification | Running the complete recorded T-012 plan against exact approved delivery `08f5e0f415c69f3d3d7f9800fb617d23cf8806bc` |
| `2026-09-02T15:11:26+02:00` | Codex primary agent / Tester | T-012 verification requires a replacement | Repository integration used an already-associated archived exercise for its rejection scenario; approval is invalidated after unit 4/4 and pgTAP 26/26 passed |
| `2026-09-02T15:13:44+02:00` | Codex primary agent / Executor | Corrected T-012 test fixture pending replacement | Static checks passed without rerunning feature tests; fresh delivery approval remains required |
| `2026-09-02T15:14:49+02:00` | Codex primary agent / Executor | Delivered T-012 replacement for review | Exact test-only replacement `5b781802d2bddfc77b55745f12108ae678bd2b76` awaits fresh User approval |
| `2026-09-02T15:29:06+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-012 replacement and began verification | Running the complete recorded plan from the beginning against exact replacement `5b781802d2bddfc77b55745f12108ae678bd2b76` |
| `2026-09-03T10:27:22+02:00` | Codex primary agent / Tester | Completed `T-012` within `F-006` | Exact replacement passed unit 4/4, clean reset, pgTAP 26/26, repository integration 1/1, and generated-type comparison; `T-013` awaits Owner direction |
| `2026-09-03T10:34:57+02:00` | User / Owner | Started `T-013` within `F-006` | Continue with the remaining Programs mobile experience delivery |
| `2026-09-03T10:46:33+02:00` | Codex primary agent / Executor | Completed `T-013` implementation scope pending delivery | S07–S09 mobile flows and approval-gated tests are prepared; all permitted static checks passed without executing feature tests |
| `2026-09-03T10:47:48+02:00` | Codex primary agent / Executor | Delivered `T-013` for review | Exact delivery `5c83acf4e5a2fe74f4ec1b3de76d99e48493bda4` awaits User review; feature tests remain unexecuted |
| `2026-09-03T10:49:36+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-013 delivery and began verification | Running only the recorded component and Chromium/WebKit phone-browser plan against exact delivery `5c83acf4e5a2fe74f4ec1b3de76d99e48493bda4` |
| `2026-09-03T10:52:46+02:00` | Codex primary agent / Tester | T-013 verification requires a replacement | Component 4/4 and malformed routes 2/2 passed; both full browser flows stopped at an ambiguous Add-program matcher, so approval is invalidated and a test-only replacement is required |
| `2026-09-03T10:54:20+02:00` | Codex primary agent / Executor | Corrected T-013 browser matcher pending replacement | The Add-program icon locator now requires an exact accessible name; all static checks passed without rerunning feature tests |
| `2026-09-03T10:55:23+02:00` | Codex primary agent / Executor | Delivered T-013 test-only replacement for review | Exact replacement `85c7b3d5eb8e33989c426e6fbafaf7c642000cf8` awaits fresh User approval |
| `2026-09-03T11:22:58+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-013 replacement and restarted verification | Running the complete recorded plan from the beginning against exact replacement `85c7b3d5eb8e33989c426e6fbafaf7c642000cf8` |
| `2026-09-03T11:26:18+02:00` | Codex primary agent / Tester | T-013 verification requires another replacement | Component 4/4 and browser 3/4 passed, including the full WebKit flow; Chromium exposed a missing redirect wait in test source, so approval is invalidated |
| `2026-09-03T11:27:57+02:00` | Codex primary agent / Executor | Corrected T-013 redirect race pending replacement | The second split save now awaits its edit-route redirect before Back; all static checks passed without rerunning feature tests |
| `2026-09-03T11:28:42+02:00` | Codex primary agent / Executor | Delivered second T-013 test-only replacement | Exact replacement `000a62a70fbf03bb14f32fe7513ce0fb93f528fe` awaits fresh User approval |
| `2026-09-03T11:31:08+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved second T-013 replacement and restarted verification | Running the complete recorded plan from the beginning against exact replacement `000a62a70fbf03bb14f32fe7513ce0fb93f528fe` |
| `2026-09-03T11:35:06+02:00` | Codex primary agent / Tester | Completed `T-013` within `F-006` | Exact replacement passed component 4/4 and isolated Chromium/WebKit browser scenarios 4/4 with two structural captures; `F-006` has 2/2 Tasks Done and awaits aggregate User confirmation |
| `2026-09-03T12:00:56+02:00` | User / Owner | Completed `F-006`; Milestone remains incomplete and paused | Confirmed the aggregate Programs and Splits result, advancing M-001 to 6/10 Features Done, and explicitly directed that `F-007` must not start |
| `2026-09-03T12:03:59+02:00` | User / Owner | Started `F-007` through `T-014` | Confirmed the three-Task Today and Active Workout breakdown and began its application/persistence delivery |
| `2026-09-03T12:22:54+02:00` | Codex primary agent / Executor | Completed `T-014` implementation scope pending delivery | Today and active-workout operations are statically verified; approval-gated verification remains unexecuted |
| `2026-09-03T12:24:31+02:00` | Codex primary agent / Executor | Delivered `T-014` for review | Exact operations delivery awaits User review before any feature testing |
| `2026-09-03T12:31:15+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-014 delivery and began verification | Running the recorded plan against exact approved delivery `4f924d51af2e55681f2e5a517a8963bc58048d81` |
| `2026-09-04T08:58:15+02:00` | Codex primary agent / Tester | Completed `T-014` within `F-007` | Exact approved operations delivery passed its complete verification; User directed continuation with `T-015` |
| `2026-09-04T09:00:13+02:00` | Codex primary agent / Planner | Started required F-007 correction `T-017` | Preserve accepted one-time starter-set behavior before the dependent mobile experience |
| `2026-09-04T09:06:26+02:00` | Codex primary agent / Executor | Delivered required T-017 correction for review | Exact correction awaits User review before regression testing and T-015 |
| `2026-09-04T12:38:07+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-017 and began verification | Running the focused regression tests against the exact approved correction before T-015 |
| `2026-09-04T12:46:55+02:00` | Codex primary agent / Tester | Completed T-017 within F-007 | Exact approved correction passed clean reset, pgTAP 18/18, and Workout repository integration 1/1; T-015 is unblocked |
| `2026-09-04T12:48:59+02:00` | User / Owner and Codex primary agent / Executor | Started T-015 within F-007 | Began the accepted Today and workout-start phone experience after both dependencies completed |
| `2026-09-04T12:58:39+02:00` | Codex primary agent / Executor | Completed T-015 implementation scope pending delivery | Today, alternate-split, and one-time-start UI plus prepared tests are statically verified |
| `2026-09-04T12:59:57+02:00` | Codex primary agent / Executor | Delivered T-015 for review | Exact delivery `c3c9f33795757d455029746ccefe1fec52f071f6` awaits User review before approved verification |
| `2026-09-04T14:13:57+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-015 and began verification | Running the recorded component and serialized Chromium/WebKit tests against the exact approved delivery |
| `2026-09-04T14:15:48+02:00` | Codex primary agent / Tester | Returned T-015 to In Progress | A prepared component assertion failed after 2/3 scenarios; browser verification stopped and a test-only replacement requires fresh approval |
| `2026-09-04T14:17:28+02:00` | Codex primary agent / Executor | Corrected the T-015 test-only assertion pending replacement delivery | Static checks passed and feature tests remain stopped until fresh approval |
| `2026-09-04T14:18:18+02:00` | Codex primary agent / Executor | Delivered the T-015 test-only replacement for review | Exact replacement awaits fresh User approval before complete verification restarts |
| `2026-09-04T14:28:43+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved the T-015 replacement and restarted verification | Running the complete component and serialized Chromium/WebKit plan from the beginning against the exact replacement |
| `2026-09-04T14:48:30+02:00` | Claude Code primary agent / Tester | Returned T-015 to In Progress again | Component 3/3 passed before serialized Chromium verification exposed two test-only singular queries; browser tests stopped and a second test-only replacement requires fresh approval |
| `2026-09-04T14:50:30+02:00` | Claude Code primary agent / Executor | Corrected the T-015 test-only browser queries pending second replacement delivery | Static checks passed and feature tests remain stopped until fresh approval |
| `2026-09-04T14:52:30+02:00` | Claude Code primary agent / Executor | Delivered the T-015 second test-only replacement for review | Exact replacement awaits fresh User approval before complete verification restarts |
| `2026-09-04T14:56:18+02:00` | User / Reviewer and Approver; Claude Code primary agent / Tester | Approved the T-015 second replacement and restarted verification | Running the complete component and serialized Chromium/WebKit plan from the beginning against the exact second replacement |
