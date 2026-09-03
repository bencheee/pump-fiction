# F-007 — Today and Active Workout

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-09-03T12:22:54+02:00`
- **Progress:** `0/3 required Tasks Done`
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

- [`T-014`](../tasks/T-014-build-today-and-workout-operations.md) — Build Today and active-workout operations (`In Progress`)
- [`T-015`](../tasks/T-015-build-today-and-workout-start-mobile-experience.md) — Build Today and workout-start mobile experience (`Backlog`; depends on `T-014`)
- [`T-016`](../tasks/T-016-build-active-workout-mobile-experience.md) — Build active-workout mobile experience (`Backlog`; depends on `T-014` and `T-015`)

## Dependencies and blockers

- Dependencies: `F-003` through `F-006`
- Blockers: None for `T-014`; later Tasks retain planned dependencies

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
