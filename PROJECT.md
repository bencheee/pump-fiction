# Project dashboard

- **Last updated:** 2026-09-05T21:35:40+02:00
- **Current phase:** Local MVP implementation — `F-014` confirmed; planning the active-workout command recovery
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007`, `F-011`, `F-013`, and `F-014` complete; `F-012` is the current focus; `F-008` intentionally not started
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013` (`Done`) → `F-014` (`Done`) → `F-012` (command recovery) → `F-008`; set by the Owner on `2026-09-05`

## Current focus

[`F-012`](docs/project/features/F-012-active-workout-command-recovery.md) Active-Workout Command Recovery closes the gap the `T-025` defect exposed: the outbox delivers commands in order, so one permanently rejected command blocks every later one and strands the workout, including its finish. The Owner confirmed the recovery rule unchanged on `2026-09-05`: a rejection is terminal for that command, the client refreshes and replays the rest, and the screen names the lost change.

[`F-014`](docs/project/features/F-014-exercise-and-set-entry-model.md) is `Done` with the Owner's confirmed result on `2026-09-05`: exercises have two types with assistance as a bodyweight option, and a set is recorded by its entered values with no confirmation control anywhere.

## Immediate next action

Owner approves `90875783eda308cdb95b33ad43a336bbd6060ccd`, which unlocks the suites for `T-026` and completes `F-012`. The proposed current-program mechanism in [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) and the per-set control placement in [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) still need Owner confirmation before those Tasks become `Ready`.

## Now

- [`F-012`](docs/project/features/F-012-active-workout-command-recovery.md) — Active-Workout Command Recovery (`0/1 Tasks Done`) — a permanently rejected command must not strand a workout
  - [`T-026`](docs/project/tasks/T-026-recover-from-rejected-command.md) — `In Review` — Claude Code primary agent — `2026-09-05T21:35:40+02:00` — review `90875783eda308cdb95b33ad43a336bbd6060ccd`; the suites need the Owner's approval of that SHA
  - [`T-018`](docs/project/tasks/T-018-return-to-parent-screen-after-saving.md) — `Testing` — Claude Code primary agent — `2026-09-05T12:06:25+02:00` — run authorized tests for `613dae3da605c329e22e07a82a7b9d1439c0320b` (corrections 1 and 4)

## Next

1. [`F-008`](docs/project/features/F-008-history-and-statistics.md) — History and Statistics.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

None.

## Approved — ready for testing

None.

## Recently completed Tasks

- [`T-029`](docs/project/tasks/T-029-record-a-set-by-its-values.md) — completed `2026-09-05T21:26:21+02:00` — approved replacement `9374b8c23f55882f4c813a3e9a761f26b291e2b5` — seeded reset, pgTAP 65/65, unchanged types, unit 69/69, component 4/4, and repository 4/4 passed.
- [`T-028`](docs/project/tasks/T-028-merge-assisted-into-bodyweight.md) — completed `2026-09-05T21:05:10+02:00` — approved replacement `14fdd0ac8785127e2407584afd9a201aeaeb2cb2` — seeded reset, pgTAP 62/62, unchanged types, unit 69/69, component 4/4, and repository 4/4 passed.
- [`T-030`](docs/project/tasks/T-030-clean-up-command-test-exercise.md) — completed `2026-09-05T20:21:55+02:00` — approved replacement `ae1870380a0657d71846b0c7eb9566c2b979edf7` — seeded reset, repository 4/4, an unchanged 10-row library with no orphan, and a faithful restore.
- [`T-027`](docs/project/tasks/T-027-restore-local-data-after-reset.md) — completed `2026-09-05T20:01:16+02:00` — approved delivery `9b8247f73bf9347cdd44f23e5172c16b9b99cfae` — snapshot, seeded reset, pgTAP 59/59, unchanged types, unit and component 67/67 and 4/4, repository 4/4, and a faithful restore including the active workout.
- [`T-025`](docs/project/tasks/T-025-allow-partial-band-set-entry.md) — completed `2026-09-05T19:15:14+02:00` — approved replacement `e0fe573dedfe8803032b89be8a50a11805d09e60` — clean reset, pgTAP 59/59, unit and component 67/67, shared UI 4/4, and repository 4/4 passed.
- [`T-024`](docs/project/tasks/T-024-keep-primary-navigation-during-workout.md) — completed `2026-09-05T13:21:29+02:00` — approved delivery `09a2477e18686ac7aa776b6b52c6c45d35adaad2` — unit and component 67/67 and shared UI 4/4 passed.
- [`T-023`](docs/project/tasks/T-023-correct-active-workout-screen-details.md) — completed `2026-09-05T13:15:59+02:00` — approved delivery `f72e7dde3bcc9cb8f80d98935e42e7411603403f` — unit and component 66/66 and shared UI 4/4 passed.
- [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) — completed `2026-09-05T13:10:43+02:00` — approved replacement `a049287a74a7dccf5ba2146bea09671913dca9d7` — clean reset, pgTAP 57/57, unit and component 66/66, shared UI 4/4, and repository 4/4 passed.
- [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) — completed `2026-09-05T12:39:28+02:00` — approved delivery `c48cbdcaf0bc348888ef2e1eff7193269a6f049c` — unit and component 64/64 and shared UI 4/4 passed.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`8/14 Features Done`)
- [`F-012`](docs/project/features/F-012-active-workout-command-recovery.md) — Active-Workout Command Recovery (`0/1 Tasks Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
