# F-007 — Today and Active Workout

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-09-04T15:00:50+02:00`
- **Progress:** `3/4 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

Today proposes the correct workout and the user can reliably start, edit, pause, restore, review, complete, save incomplete, or discard one active workout.

## Scope

- Included: primary ownership of `MVP-TOD-001` through `MVP-TOD-003` and `MVP-WRK-001` through `MVP-WRK-012`.
- Excluded: `MVP-TOD-004` weight entry ownership, historical correction/statistics, and post-MVP close protection.

## Acceptance criteria

- All owned criteria pass their eventual approval-gated verification, including snapshot isolation and idempotent immediate persistence.

## Tasks

- [`T-014`](../tasks/T-014-build-today-and-workout-operations.md) — Build Today and active-workout operations (`Done`; approved delivery `4f924d51af2e55681f2e5a517a8963bc58048d81`)
- [`T-017`](../tasks/T-017-correct-one-time-workout-starter-sets.md) — Correct one-time workout starter sets (`Done`; approved delivery `8d5779258505bb94383368e13eff97a4346320ca`)
- [`T-015`](../tasks/T-015-build-today-and-workout-start-mobile-experience.md) — Build Today and workout-start mobile experience (`Done`; approved second replacement `f52c0447db67007fba7cce8d0c790164e8447fe9`)
- [`T-016`](../tasks/T-016-build-active-workout-mobile-experience.md) — Build active-workout mobile experience (`Backlog`; dependencies `T-014`, `T-017`, and `T-015` are Done)

## Dependencies and blockers

- Dependencies: `F-003` through `F-006`
- Blockers: None; `T-016` dependencies are complete

## Related decisions and documents

- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../product/overview.md`](../../product/overview.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified; the first executable work is `In Progress`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner confirms readiness through the 2026-09-03 direction to start `F-007`

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Created in `Next` | Keep the tightly coupled Today and durable active-workout flow in one outcome |
| `2026-09-03T12:03:59+02:00` | User / Owner and Codex primary agent / Planner | Moved Feature to `Now`, accepted the three-Task breakdown, and started `T-014` | Begin Today and Active Workout delivery with operations before the dependent mobile experiences |
| `2026-09-03T12:22:54+02:00` | Codex primary agent / Executor | Completed `T-014` implementation scope pending delivery | Today/workout operations, atomic snapshot lifecycle, prepared tests, and canonical guidance are statically verified |
| `2026-09-03T12:24:31+02:00` | Codex primary agent / Executor | Delivered `T-014` for review | Exact delivery `4f924d51af2e55681f2e5a517a8963bc58048d81` is ready for User review; feature tests remain unexecuted |
| `2026-09-03T12:31:15+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved `T-014` and began verification | Running only the recorded scoped tests against exact delivery `4f924d51af2e55681f2e5a517a8963bc58048d81` |
| `2026-09-04T08:58:15+02:00` | Codex primary agent / Tester | Completed `T-014` within `F-007` | Exact approved delivery passed unit 8/8, clean reset, pgTAP 16/16, repository integration 2/2, and generated-type comparison; User directed continuation with `T-015` |
| `2026-09-04T09:00:13+02:00` | Codex primary agent / Planner | Added and started required `T-017` correction before `T-015` | Accepted OD-001 requires one workout-local starter set per selected one-time exercise, but T-014 and canonical workout documentation omitted it |
| `2026-09-04T09:05:38+02:00` | Codex primary agent / Executor | Completed `T-017` implementation scope pending delivery | One-time starter-row creation, canonical behavior, migration, and prepared regression assertions are statically verified |
| `2026-09-04T09:06:26+02:00` | Codex primary agent / Executor | Delivered `T-017` correction for review | Exact delivery `8d5779258505bb94383368e13eff97a4346320ca` awaits User review before regression testing and T-015 |
| `2026-09-04T12:38:07+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved `T-017` and began verification | Running only the recorded focused regression tests against exact delivery `8d5779258505bb94383368e13eff97a4346320ca` |
| `2026-09-04T12:46:55+02:00` | Codex primary agent / Tester | Completed `T-017` within `F-007` | Exact approved correction passed a fresh isolated install, clean reset, pgTAP 18/18, and real Workout repository integration 1/1; T-015 is unblocked |
| `2026-09-04T12:48:59+02:00` | User / Owner and Codex primary agent / Executor | Started `T-015` | Both dependencies are Done and the prior continuation direction authorizes the accepted Today/workout-start phone delivery |
| `2026-09-04T12:58:39+02:00` | Codex primary agent / Executor | Completed `T-015` implementation scope pending delivery | S01–S03, workout-start wiring, canonical UI guidance, and prepared approval-gated tests are statically verified |
| `2026-09-04T12:59:57+02:00` | Codex primary agent / Executor | Delivered `T-015` for review | Exact delivery `c3c9f33795757d455029746ccefe1fec52f071f6` awaits User review before component/browser verification |
| `2026-09-04T14:13:57+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved `T-015` and began verification | Running only the recorded component and serialized Chromium/WebKit tests against exact delivery `c3c9f33795757d455029746ccefe1fec52f071f6` |
| `2026-09-04T14:15:48+02:00` | Codex primary agent / Tester | Returned `T-015` to `In Progress` | Component verification exposed a test-only singular-query defect after 2/3 scenarios passed; browser tests stopped and original approval is invalidated |
| `2026-09-04T14:17:28+02:00` | Codex primary agent / Executor | Corrected the T-015 prepared assertion pending replacement delivery | Assertion now accepts the intentional inline/sticky validation duplication; all static checks passed without feature tests |
| `2026-09-04T14:18:18+02:00` | Codex primary agent / Executor | Delivered the T-015 test-only replacement for review | Exact replacement `466341380d0f479e2ce04a08c3a34690ff5a5052` awaits fresh User approval before the complete test plan restarts |
| `2026-09-04T14:28:43+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved the T-015 replacement and restarted verification | Running the complete component and serialized Chromium/WebKit plan from the beginning against exact replacement `466341380d0f479e2ce04a08c3a34690ff5a5052` |
| `2026-09-04T14:48:30+02:00` | Claude Code primary agent / Tester | Returned `T-015` to `In Progress` again | Component tests passed 3/3, then serialized Chromium verification exposed two test-only singular queries on intentionally duplicated Today/one-time copy; browser tests stopped and the first-replacement approval is invalidated |
| `2026-09-04T14:50:30+02:00` | Claude Code primary agent / Executor | Corrected the T-015 prepared browser queries pending second replacement delivery | Queries now target the S01 heading role and accept the mirrored inline/sticky validation message; all static checks passed without feature tests |
| `2026-09-04T14:52:30+02:00` | Claude Code primary agent / Executor | Delivered the T-015 second test-only replacement for review | Exact replacement `f52c0447db67007fba7cce8d0c790164e8447fe9` awaits fresh User approval before the complete test plan restarts |
| `2026-09-04T14:56:18+02:00` | User / Reviewer and Approver; Claude Code primary agent / Tester | Approved the T-015 second replacement and restarted verification | Running the complete component and serialized Chromium/WebKit plan from the beginning against exact second replacement `f52c0447db67007fba7cce8d0c790164e8447fe9` |
| `2026-09-04T15:00:50+02:00` | Claude Code primary agent / Tester | Completed `T-015` within `F-007` | Exact approved second replacement passed component 3/3 and serialized Chromium 1/1 plus WebKit 1/1 with structural captures; the User's continuation direction authorizes dependent `T-016` |
