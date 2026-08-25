# F-001 — Local Technical Architecture

- **Milestone:** [`M-001`](../milestones/M-001-local-mvp.md)
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T15:43:40+02:00`
- **Updated:** `2026-08-25T16:18:09+02:00`
- **Progress:** `0/1 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

An explicitly accepted and fully documented local technical architecture that can implement the locked MVP while preserving a credible future PostgreSQL/Supabase and Vercel direction.

## Scope

- Included: framework/runtime, repository/application structure, local persistence and data access, active-workout persistence strategy, UI/styling and charts, static checks and future test tooling, local workflow, and the future production migration boundary.
- Excluded: application initialization, dependency installation, database creation/migrations, feature implementation, testing, and deployment.

## Acceptance criteria

- Product criteria: architecture supports the locked [`MVP acceptance criteria`](../../product/mvp-acceptance-criteria.md) without redefining product behavior.
- Feature-specific criteria: every cross-cutting technical choice is user-approved, captured in an ADR, reflected in canonical architecture documentation, mutually consistent, and sufficient to initialize implementation without inventing a missing foundational choice.

## Tasks

- [`T-001`](../tasks/T-001-define-local-technical-architecture.md) — Define and document local technical architecture

## Dependencies and blockers

- Dependencies: Accepted project-management workflow and locked product behavior
- Blockers: None

## Related decisions and documents

- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0004](../../decisions/0004-local-first-development.md), [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md), [ADR-0017](../../decisions/0017-nextjs-app-router-runtime.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0021](../../decisions/0021-delivery-and-evidence-commit-model.md)
- Canonical documents: [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../architecture/constraints.md`](../../architecture/constraints.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../PROJECT_STATE.md`](../../PROJECT_STATE.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified; the first executable work is `Ready`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner confirms readiness

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-08-25T15:43:40+02:00` | User / Owner | Created `F-001` in `Now` and confirmed readiness | Begin technical architecture only after accepting project management |
