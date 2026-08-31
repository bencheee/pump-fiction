# F-004 — Application and Data Foundation

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-08-31T14:19:48+02:00`
- **Progress:** `1/5 required Tasks Done`
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

- [`T-005`](../tasks/T-005-initialize-application-and-static-quality.md) — Initialize application and static-quality baseline
- [`T-006`](../tasks/T-006-establish-local-database-schema.md) — Establish local database schema and generated types
- [`T-007`](../tasks/T-007-build-server-data-boundaries.md) — Build server data and application boundaries
- [`T-008`](../tasks/T-008-build-active-workout-durability.md) — Build active-workout command durability foundation
- [`T-009`](../tasks/T-009-build-mobile-shell-and-ui-foundation.md) — Build mobile shell and shared UI foundation

## Dependencies and blockers

- Dependencies: completed `F-002`; accepted `T-004` output before any implementation Task starts
- Blockers: None; `T-006` is `In Progress`

## Related decisions and documents

- ADRs: [ADR-0017](../../decisions/0017-nextjs-app-router-runtime.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md)
- Canonical documents: [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified; the first executable work is `In Progress`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner confirms the Feature breakdown and implementation direction

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
| `2026-08-31T11:37:41+02:00` | User / Owner | Confirmed implementation preparation and required Task breakdown | Move into implementation as soon as the frozen design handoff receives exact-commit approval |
| `2026-08-31T12:06:31+02:00` | User / Owner | Moved Feature to `Now` and started `T-005` | Approved the frozen design delivery and cleared the implementation dependency |
| `2026-08-31T12:22:39+02:00` | Codex primary agent / Executor | Completed `T-005` implementation scope pending delivery commit | Locked the runtime and dependencies, initialized source boundaries, and passed the static-only quality baseline |
| `2026-08-31T12:26:36+02:00` | Codex primary agent / Executor | Delivered `T-005` for review | Commit `f8781b22a3e9abd7bf31afef9a74d9a0f55d429e` establishes the application and static-quality baseline |
| `2026-08-31T14:19:48+02:00` | User / Reviewer and Approver | Completed `T-005` and started `T-006` | Approved exact initialization delivery and cleared the local-schema Task to begin |
