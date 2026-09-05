# F-009 — Weight and Body Progress

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Next`
- **Order:** 2
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-09-05T21:27:54+02:00`
- **Progress:** `0/0 required Tasks Done; Task breakdown pending`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

The user can record and analyze daily weight and user-defined body measurements with correct validation, lifecycle, calculations, and charts.

## Scope

- Included: primary ownership of `MVP-TOD-004`, `MVP-WGT-001` through `MVP-WGT-004`, and `MVP-BOD-001` through `MVP-BOD-004`.
- Excluded: nutrition/calorie tracking and inferred health recommendations.

## Acceptance criteria

- All owned criteria pass their eventual approval-gated verification with local-date uniqueness and immediate recalculation.

## Tasks

- Task breakdown pending before Feature readiness.

## Dependencies and blockers

- Dependencies: `F-003`, `F-004`
- Blockers: No Task is currently ready

## Related decisions and documents

- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md)
- Canonical documents: [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../product/overview.md`](../../product/overview.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md)

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
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Created in `Next` | Keep body-progress tracking separate from workout statistics while remaining under History navigation |
| `2026-09-05T20:09:42+02:00` | User / Owner | Moved `Next / 7` to `Next / 4` | Reconfirmed the order `F-013`, `F-014`, `F-012`, `F-008` after `F-013` became the current focus |
| `2026-09-05T20:24:07+02:00` | User / Owner | Moved `Next / 4` to `Next / 3` | `F-014` became the current focus once `F-013` was confirmed |
| `2026-09-05T21:27:54+02:00` | User / Owner | Moved to `Next / 2` | `F-014` was confirmed, so `F-012` becomes the current focus |
