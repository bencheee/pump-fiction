# Project dashboard

- **Last updated:** 2026-09-05T20:15:12+02:00
- **Current phase:** Local MVP implementation — `T-027` verified; awaiting the Owner's `F-013` confirmation before `F-014`
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` and `F-011` complete; `T-027` verified under `F-013` with `T-030` recorded; `F-012` and `F-014` queued in `Next`; `F-008` intentionally not started
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013` (seed and snapshot) → `F-014` (`T-028`, then `T-029`) → `F-012` (command recovery) → `F-008`; reconfirmed by the Owner on `2026-09-05`

## Current focus

[`F-013`](docs/project/features/F-013-local-verification-data.md) Local Verification Data stops the approval-gated clean reset from costing the Owner their local data. [`T-027`](docs/project/tasks/T-027-restore-local-data-after-reset.md) is `Done`: the verification of `9b8247f73bf9347cdd44f23e5172c16b9b99cfae` seeded the reset, kept pgTAP at 59/59, and returned the Owner's active workout through the snapshot round trip. The run also exposed an orphan exercise the command repository test leaves behind, now recorded as [`T-030`](docs/project/tasks/T-030-clean-up-command-test-exercise.md).

## Immediate next action

Run and record the authorized `T-030` repository run, then ask the Owner to confirm the `F-013` result; `F-014` starts with `T-028` after that. The proposed current-program mechanism in [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) and the per-set control placement in [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) still need Owner confirmation before those Tasks become `Ready`.

## Now

- [`F-013`](docs/project/features/F-013-local-verification-data.md) — Local Verification Data (`1/2 Tasks Done`) — awaiting the Owner's confirmation of the aggregate result
  - [`T-030`](docs/project/tasks/T-030-clean-up-command-test-exercise.md) — `Testing` — Claude Code primary agent — `2026-09-05T20:15:12+02:00` — run the authorized repository suite for `cfb8ee5fa42e8655553809a159bc422502737069`
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

- [`T-027`](docs/project/tasks/T-027-restore-local-data-after-reset.md) — completed `2026-09-05T20:01:16+02:00` — approved delivery `9b8247f73bf9347cdd44f23e5172c16b9b99cfae` — snapshot, seeded reset, pgTAP 59/59, unchanged types, unit and component 67/67 and 4/4, repository 4/4, and a faithful restore including the active workout.
- [`T-025`](docs/project/tasks/T-025-allow-partial-band-set-entry.md) — completed `2026-09-05T19:15:14+02:00` — approved replacement `e0fe573dedfe8803032b89be8a50a11805d09e60` — clean reset, pgTAP 59/59, unit and component 67/67, shared UI 4/4, and repository 4/4 passed.
- [`T-024`](docs/project/tasks/T-024-keep-primary-navigation-during-workout.md) — completed `2026-09-05T13:21:29+02:00` — approved delivery `09a2477e18686ac7aa776b6b52c6c45d35adaad2` — unit and component 67/67 and shared UI 4/4 passed.
- [`T-023`](docs/project/tasks/T-023-correct-active-workout-screen-details.md) — completed `2026-09-05T13:15:59+02:00` — approved delivery `f72e7dde3bcc9cb8f80d98935e42e7411603403f` — unit and component 66/66 and shared UI 4/4 passed.
- [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) — completed `2026-09-05T13:10:43+02:00` — approved replacement `a049287a74a7dccf5ba2146bea09671913dca9d7` — clean reset, pgTAP 57/57, unit and component 66/66, shared UI 4/4, and repository 4/4 passed.
- [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) — completed `2026-09-05T12:39:28+02:00` — approved delivery `c48cbdcaf0bc348888ef2e1eff7193269a6f049c` — unit and component 64/64 and shared UI 4/4 passed.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`8/14 Features Done`)
- [`F-013`](docs/project/features/F-013-local-verification-data.md) — Local Verification Data (`1/2 Tasks Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
