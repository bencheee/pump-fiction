# F-012 — Active-Workout Command Recovery

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-09-05T19:17:58+02:00`
- **Updated:** `2026-09-05T21:40:51+02:00`
- **Progress:** `1/1 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

A single change the server permanently refuses can no longer strand an active workout. The user is told what could not be saved, the workout keeps working, and finishing stays possible without discarding the session.

## Scope

- Included: what the client does with a non-retryable rejection, how the strictly ordered outbox recovers, and what the user sees.
- Excluded: the ordering guarantee itself, the command contract, conflict handling for stale revisions, and any new workout behavior.

## Context

On `2026-09-05` the Owner hit this with a live workout. One `update_set` was rejected because the database forbade a partial band entry, which [`T-025`](../tasks/T-025-allow-partial-band-set-entry.md) fixed. The rejection itself, however, left the workout unusable: the outbox delivers strictly in order, so the three later `add_set` commands and `finish_workout` could never be delivered, the retry loop re-sent the same refused command indefinitely, and the only exits were retrying forever or discarding the workout.

The durability model accepted in [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md) covers retryable failures and revision conflicts. It has no answer for a command the server will never accept.

## Acceptance criteria

- Product criteria: supporting `MVP-WRK-004`, `MVP-WRK-005`, `MVP-WRK-011`; no criterion text is expected to change
- Feature-specific criteria: a permanently rejected command stops being retried, the queue behind it is delivered, the user is told which change was lost, and the workout can still be finished

## Tasks

- `T-026` — Recover from a permanently rejected active-workout command

## Dependencies and blockers

- Dependencies: `T-025` is `Done`, so the known trigger no longer occurs; this Feature removes the class of failure
- Blockers: None

## Related decisions and documents

- ADRs: [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md); whether the recovery rule needs its own ADR or a local decision in the durability document is settled when `T-026` becomes `Ready`
- Canonical documents: [`../../architecture/active-workout-durability.md`](../../architecture/active-workout-durability.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified with a defined recovery rule
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner confirms readiness

## Completion

- [x] All required Tasks are `Done`
- [x] Feature acceptance criteria are satisfied
- [x] Canonical documentation is current
- [x] No required follow-up scope is hidden
- [x] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-09-05T19:17:58+02:00` | User / Owner | Created `F-012` in `Next / 1` | Asked for the stuck-queue defect to be fixed after the 2026-09-05 blocked workout |
| `2026-09-05T20:09:42+02:00` | User / Owner | Moved `Next / 3` to `Next / 2` | Reconfirmed the order `F-013`, `F-014`, `F-012`, `F-008` after `F-013` became the current focus |
| `2026-09-05T20:24:07+02:00` | User / Owner | Moved `Next / 2` to `Next / 1` | `F-014` became the current focus once `F-013` was confirmed |
| `2026-09-05T21:27:54+02:00` | User / Owner | Moved to `Now / 1` | `F-014` was confirmed, so `F-012` becomes the current focus |
| `2026-09-05T21:29:41+02:00` | User / Owner | Confirmed the proposed recovery rule and started `F-012` | A rejection becomes terminal, the client refreshes and replays the rest, and the screen names the lost change |
| `2026-09-05T21:35:40+02:00` | Claude Code primary agent / Executor | `T-026` delivered `90875783eda308cdb95b33ad43a336bbd6060ccd` and entered review | A refused command is now terminal and the workout recovers without a gesture |
| `2026-09-05T21:37:13+02:00` | Claude Code primary agent / Tester | `T-026` verified and `Done` for `90875783eda308cdb95b33ad43a336bbd6060ccd` | A refused command no longer strands a workout; the Feature result awaits the Owner's confirmation |
| `2026-09-05T21:40:51+02:00` | User / Owner | Confirmed the `F-012` result; the Feature is `Done` | A permanently refused command no longer strands a workout, and the screen names the change it undid |
