# Project dashboard

- **Last updated:** 2026-09-05T19:51:11+02:00
- **Current phase:** Local MVP implementation — protecting local data around the approval-gated database verification
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` and `F-011` complete; `F-013` in progress; `F-012` and `F-014` queued in `Next`; `F-008` intentionally not started
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)

## Current focus

[`F-013`](docs/project/features/F-013-local-verification-data.md) Local Verification Data stops the approval-gated clean reset from costing the Owner their local data. The Owner confirmed the approach on `2026-09-05`: a committed seed that every reset applies, a snapshot and restore pair for the Owner's own data, and the seed as the fallback when no snapshot exists. `F-014` follows.

## Immediate next action

Owner reviews and approves `9b8247f73bf9347cdd44f23e5172c16b9b99cfae`, which unlocks the reset, pgTAP, and snapshot round trip for `T-027`; `F-014` follows. The proposed current-program mechanism in [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) and the per-set control placement in [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) still need Owner confirmation before those Tasks become `Ready`.

## Now

- [`F-013`](docs/project/features/F-013-local-verification-data.md) — Local Verification Data (`0/1 Tasks Done`) — seed and snapshot so verification stops destroying local data
  - [`T-027`](docs/project/tasks/T-027-restore-local-data-after-reset.md) — `In Review` — Claude Code primary agent — `2026-09-05T19:51:11+02:00` — review `9b8247f73bf9347cdd44f23e5172c16b9b99cfae`; the reset, pgTAP, and snapshot round trip need the Owner's approval of that SHA
  - [`T-018`](docs/project/tasks/T-018-return-to-parent-screen-after-saving.md) — `Testing` — Claude Code primary agent — `2026-09-05T12:06:25+02:00` — run authorized tests for `613dae3da605c329e22e07a82a7b9d1439c0320b` (corrections 1 and 4)

## Next

1. [`F-014`](docs/project/features/F-014-exercise-and-set-entry-model.md) — two exercise types with assistance under bodyweight (`T-028`), then values instead of confirmation (`T-029`).
2. [`F-012`](docs/project/features/F-012-active-workout-command-recovery.md) — a permanently rejected command must not strand a workout (`T-026`).
3. [`F-008`](docs/project/features/F-008-history-and-statistics.md) — History and Statistics.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

None.

## Approved — ready for testing

None.

## Recently completed Tasks

- [`T-025`](docs/project/tasks/T-025-allow-partial-band-set-entry.md) — completed `2026-09-05T19:15:14+02:00` — approved replacement `e0fe573dedfe8803032b89be8a50a11805d09e60` — clean reset, pgTAP 59/59, unit and component 67/67, shared UI 4/4, and repository 4/4 passed.
- [`T-024`](docs/project/tasks/T-024-keep-primary-navigation-during-workout.md) — completed `2026-09-05T13:21:29+02:00` — approved delivery `09a2477e18686ac7aa776b6b52c6c45d35adaad2` — unit and component 67/67 and shared UI 4/4 passed.
- [`T-023`](docs/project/tasks/T-023-correct-active-workout-screen-details.md) — completed `2026-09-05T13:15:59+02:00` — approved delivery `f72e7dde3bcc9cb8f80d98935e42e7411603403f` — unit and component 66/66 and shared UI 4/4 passed.
- [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) — completed `2026-09-05T13:10:43+02:00` — approved replacement `a049287a74a7dccf5ba2146bea09671913dca9d7` — clean reset, pgTAP 57/57, unit and component 66/66, shared UI 4/4, and repository 4/4 passed.
- [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) — completed `2026-09-05T12:39:28+02:00` — approved delivery `c48cbdcaf0bc348888ef2e1eff7193269a6f049c` — unit and component 64/64 and shared UI 4/4 passed.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`8/14 Features Done`)
- [`F-013`](docs/project/features/F-013-local-verification-data.md) — Local Verification Data (`0/1 Tasks Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
