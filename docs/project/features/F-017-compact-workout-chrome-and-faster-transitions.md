# F-017 — Compact Workout Chrome and Faster Transitions

- **Milestone:** `M-004`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-09-09T13:17:18+02:00`
- **Updated:** `2026-09-09T14:29:18+02:00`
- **Progress:** `0/1 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

Workout recording gives more space to exercise content and removes application-owned network waterfalls from the three transitions the Owner reported as slow.

## Scope

- Included: chevron-free exercise disclosures, a single-row 40-pixel workout header, a round check finish trigger and local review sheet, blocking progress feedback, one-call Today split previews, one-call start hydration, and deferred Add Exercise library loading.
- Excluded: changes to set semantics, workout durability, finish outcomes, rotation, database hosting, or unrelated route performance.

## Acceptance criteria

- Exercise cards expose no disclosure chevron; their title area/card surface remains the disclosure trigger.
- Workout name, Continue Later or Resume, and elapsed active time occupy one header row no taller than 40 CSS pixels beyond the safe-area inset.
- One round check action at the lower-right opens Review & Finish from the current client snapshot without a route/database read.
- A full-viewport progress layer prevents duplicate interaction while start or finish persistence is pending.
- Today receives all current-program split prescriptions in its existing aggregate response rather than issuing per-split reads.
- Start Workout hydrates its returned current workout without a second database request, and the active screen defers the full exercise-library read until Add Exercise opens.

## Tasks

- [`T-055`](../tasks/T-055-compact-and-accelerate-workout-flow.md) — Compact and accelerate the workout flow

## Dependencies and blockers

- Dependencies: completed `F-016`, active-workout durability, and existing Today/start/finish operations.
- Blockers: None.

## Related decisions and documents

- ADRs: [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md)
- Canonical documents: [`../../product/workouts.md`](../../product/workouts.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md)

## Readiness

- [x] Outcome and boundaries are clear.
- [x] Acceptance criteria are observable and linked.
- [x] Required Tasks are identified; `T-055` is `Testing` on an approval-inherited test-source replacement.
- [x] Dependencies and blockers are understood.
- [x] Documentation impact is known.
- [x] Owner confirmed readiness through the implementation request on `2026-09-09`.

## Completion

- [ ] All required Tasks are `Done`.
- [ ] Feature acceptance criteria are satisfied.
- [ ] Canonical documentation is current.
- [ ] No required follow-up scope is hidden.
- [ ] User confirms the feature result.

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-09-09T13:17:18+02:00` | User / Owner | Created, readied, and released `F-017` | Requested the UI refinement and asked whether the reported transition latency can be optimized in the application. |
| `2026-09-09T14:09:02+02:00` | Codex primary agent / Executor | Delivery awaiting approval | `T-055` delivery `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49` passed static review with no finding; feature tests remain locked. |
| `2026-09-09T14:15:19+02:00` | User / Approver | Task approved | Approved exact `T-055` delivery `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49` and unlocked its scoped verification. |
| `2026-09-09T14:29:18+02:00` | Codex primary agent / Tester | Test-source replacement | Component/application, pgTAP, repository, and schema-type checks pass; replacement `68c63e50c2a3b53c82df5ea2efcfd4629258610f` aligns two stale save-status assertions before the serial browser repeat. |
