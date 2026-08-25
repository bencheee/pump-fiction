# M-001 — Local MVP

- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T15:43:40+02:00`
- **Updated:** `2026-08-25T16:27:49+02:00`
- **Progress:** `1/1 currently registered required Features Done; implementation breakdown incomplete`
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
- Additional implementation Features must be defined after the architecture is accepted; this Milestone is not yet ready for execution as a complete breakdown.

## Dependencies and blockers

- Dependencies: Accepted product specification, MVP criteria, development governance, and project-management workflow
- Blockers: None for `F-001`; full implementation Feature breakdown waits for accepted local architecture

## Related decisions and documents

- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0004](../../decisions/0004-local-first-development.md), [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md)
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/constraints.md`](../../architecture/constraints.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Completion criteria are observable
- [ ] Complete required Feature breakdown is identified
- [x] Dependencies and blockers are understood
- [ ] Owner confirms readiness of the complete Milestone breakdown

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-08-25T15:43:40+02:00` | User / Owner | Created `M-001` in `Now` | Establish the Local MVP delivery outcome and begin architecture definition |
| `2026-08-25T16:27:49+02:00` | User / Owner and Approver | Completed registered `F-001`; Milestone remains incomplete | Local architecture accepted; implementation Feature breakdown still required |
