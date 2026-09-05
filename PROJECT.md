# Project dashboard

- **Last updated:** 2026-09-05T21:07:30+02:00
- **Current phase:** Local MVP implementation — `F-013` confirmed; starting the Owner's exercise and set-entry model corrections
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007`, `F-011`, and `F-013` complete; `T-028` verified under `F-014` and `T-029` awaits readiness; `F-012` queued in `Next`; `F-008` intentionally not started
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013` (seed and snapshot, `Done`) → `F-014` (`T-028`, then `T-029`) → `F-012` (command recovery) → `F-008`; reconfirmed by the Owner on `2026-09-05`

## Current focus

[`F-014`](docs/project/features/F-014-exercise-and-set-entry-model.md) Exercise and Set-Entry Model Corrections carries the Owner's two model corrections. [`T-028`](docs/project/tasks/T-028-merge-assisted-into-bodyweight.md) is `Done`: the verification of `14fdd0ac8785127e2407584afd9a201aeaeb2cb2` seeded the reset, passed pgTAP 62/62 and every application suite, and left the library at exactly its 10 seeded exercises. [`T-029`](docs/project/tasks/T-029-record-a-set-by-its-values.md) records a set by its entered values instead of an explicit confirmation and needs the Owner's confirmation of readiness.

[`F-013`](docs/project/features/F-013-local-verification-data.md) is `Done` with the Owner's confirmed result on `2026-09-05`: a reset now lands on the committed seed baseline, `npm run db:snapshot` and `npm run db:restore` carry the Owner's own data across a verification, and the repository suite no longer pollutes the exercise library.

## Immediate next action

Deliver [`T-029`](docs/project/tasks/T-029-record-a-set-by-its-values.md) as one reviewable commit, which completes `F-014`. The proposed current-program mechanism in [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) and the per-set control placement in [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) still need Owner confirmation before those Tasks become `Ready`.

## Now

- [`F-014`](docs/project/features/F-014-exercise-and-set-entry-model.md) — Exercise and Set-Entry Model Corrections (`1/2 Tasks Done`) — the two-type model is verified; values instead of confirmation remain
  - [`T-029`](docs/project/tasks/T-029-record-a-set-by-its-values.md) — `In Progress` — Claude Code primary agent — `2026-09-05T21:07:30+02:00` — deliver one reviewable commit
  - [`T-018`](docs/project/tasks/T-018-return-to-parent-screen-after-saving.md) — `Testing` — Claude Code primary agent — `2026-09-05T12:06:25+02:00` — run authorized tests for `613dae3da605c329e22e07a82a7b9d1439c0320b` (corrections 1 and 4)

## Next

1. [`F-012`](docs/project/features/F-012-active-workout-command-recovery.md) — a permanently rejected command must not strand a workout (`T-026`).
2. [`F-008`](docs/project/features/F-008-history-and-statistics.md) — History and Statistics.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

None.

## Approved — ready for testing

None.

## Recently completed Tasks

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
- [`F-014`](docs/project/features/F-014-exercise-and-set-entry-model.md) — Exercise and Set-Entry Model Corrections (`1/2 Tasks Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
