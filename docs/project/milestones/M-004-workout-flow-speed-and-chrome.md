# M-004 — Workout Flow Speed and Chrome

- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-09-09T13:17:18+02:00`
- **Updated:** `2026-09-09T14:15:19+02:00`
- **Progress:** `0/1 required Features Done`
- **Blocked children:** `0`
- **Awaiting approval children:** `0`

## Outcome

The active workout keeps its controls compact, opens its finish review immediately, and avoids known redundant hosted-database round trips on Today and workout start.

## Scope

- Included: active-workout card/header/finish chrome, blocking transition feedback, Today aggregate hydration, start-workout hydration, and lazy exercise-library loading.
- Excluded: workout semantics, persistence guarantees, rotation, History, non-phone layout work, hosting-plan changes, and broad application performance work.

## Completion criteria

- [ ] The active-workout chrome matches the Owner's compact interaction request.
- [ ] Review opens from current client state and database-backed transitions block duplicate interaction while pending.
- [ ] The identified redundant Today and workout-start reads are removed without changing their results.
- [ ] All required Features are `Done`.
- [ ] Canonical documentation is current.
- [ ] User confirms the milestone result.

## Features

- [`F-017`](../features/F-017-compact-workout-chrome-and-faster-transitions.md) — Compact Workout Chrome and Faster Transitions

## Dependencies and blockers

- Dependencies: `M-003` is complete.
- Blockers: None.

## Related decisions and documents

- ADRs: [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md)
- Canonical documents: [`../../product/workouts.md`](../../product/workouts.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md)

## Readiness

- [x] Outcome and boundaries are clear.
- [x] Completion criteria are observable.
- [x] Required Features are identified.
- [x] Dependencies and blockers are understood.
- [x] Owner confirmed readiness through the implementation request on `2026-09-09`.

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-09-09T13:17:18+02:00` | User / Owner | Created and released `M-004` | Requested compact workout chrome, immediate blocking feedback around finish review, and an explanation and correction of the observed Today/start/review latency. |
| `2026-09-09T14:09:02+02:00` | Codex primary agent / Executor | First Task delivered | `T-055` is awaiting Owner approval before verification. |
| `2026-09-09T14:15:19+02:00` | User / Approver | First Task approved | Exact `T-055` delivery is approved for its scoped verification. |
