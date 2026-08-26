# M-001 — Local MVP

- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T15:43:40+02:00`
- **Updated:** `2026-08-26T12:38:44+02:00`
- **Progress:** `2/10 required Features Done`
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
- [`F-003`](../features/F-003-mobile-ui-ux-design-package.md) — Mobile UI/UX Design Package (`Now / 1`; `T-003` in progress)
- [`F-004`](../features/F-004-application-and-data-foundation.md) — Application and Data Foundation (`Next / 2`)
- [`F-005`](../features/F-005-exercise-library.md) — Exercise Library (`Next / 3`)
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
| **Total** |  | **57** |

## Dependencies and blockers

- Dependencies: Accepted product specification, MVP criteria, development governance, and project-management workflow
- Blockers: None for `F-002`; downstream execution waits for its own ready Task and documented dependencies

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
