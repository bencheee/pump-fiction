# F-004 — Application and Data Foundation

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Next`
- **Order:** 2
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-08-25T16:35:55+02:00`
- **Progress:** `0/0 required Tasks Done; Task breakdown pending`
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

- Task breakdown is deferred until `F-003` exposes accepted visual inputs and `T-002` is complete.

## Dependencies and blockers

- Dependencies: completed `F-002`; relevant accepted output from `F-003` before visual shell implementation
- Blockers: None for future non-visual initialization; no Task is currently ready

## Related decisions and documents

- ADRs: [ADR-0017](../../decisions/0017-nextjs-app-router-runtime.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md)
- Canonical documents: [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md)

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
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Created in `Next` | Establish implementation dependencies without initializing the application |
