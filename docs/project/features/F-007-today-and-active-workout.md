# F-007 — Today and Active Workout

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Next`
- **Order:** 5
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-08-25T16:35:55+02:00`
- **Progress:** `0/0 required Tasks Done; Task breakdown pending`
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

- Task breakdown pending before Feature readiness.

## Dependencies and blockers

- Dependencies: `F-003` through `F-006`
- Blockers: No Task is currently ready

## Related decisions and documents

- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../product/overview.md`](../../product/overview.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [ ] Required Tasks are identified; the first executable work is `Ready`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [ ] Owner confirms readiness

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
