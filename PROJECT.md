# Project dashboard

- **Last updated:** 2026-09-05T13:19:31+02:00
- **Current phase:** Local MVP implementation — correcting delivered behavior under `F-011` before `F-008`
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` complete; `F-011` corrections planned and awaiting Owner readiness; `F-008` intentionally not started
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)

## Current focus

[`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) MVP Experience Corrections records the nine corrections the Owner raised on `2026-09-05` after using the delivered application. The Owner confirmed readiness on `2026-09-05` and directed execution, so `T-018` is `In Progress` and the remaining six Tasks stay in `Backlog` until their turn. `F-008` waits until these corrections are complete.

## Immediate next action

User reviews delivery commit `09a2477e18686ac7aa776b6b52c6c45d35adaad2` for [`T-024`](docs/project/tasks/T-024-keep-primary-navigation-during-workout.md), the final `F-011` Task, and decides on approval. The proposed current-program mechanism in [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) and the per-set control placement in [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) still need Owner confirmation before those Tasks become `Ready`.

## Now

- [`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) — MVP Experience Corrections (`5/6 Tasks Done`) — Owner confirmed readiness
  - [`T-018`](docs/project/tasks/T-018-return-to-parent-screen-after-saving.md) — `Testing` — Claude Code primary agent — `2026-09-05T12:06:25+02:00` — run authorized tests for `613dae3da605c329e22e07a82a7b9d1439c0320b` (corrections 1 and 4)
  - [`T-024`](docs/project/tasks/T-024-keep-primary-navigation-during-workout.md) — `In Review` — Claude Code primary agent — `2026-09-05T13:16:19+02:00` — deliver one reviewable commit (correction 9)

## Next

- [`F-008`](docs/project/features/F-008-history-and-statistics.md) is the next Feature; it starts after `F-011` is complete.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

None.

## Approved — ready for testing

None.

## Recently completed Tasks

- [`T-023`](docs/project/tasks/T-023-correct-active-workout-screen-details.md) — completed `2026-09-05T13:15:59+02:00` — approved delivery `f72e7dde3bcc9cb8f80d98935e42e7411603403f` — unit and component 66/66 and shared UI 4/4 passed.
- [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) — completed `2026-09-05T13:10:43+02:00` — approved replacement `a049287a74a7dccf5ba2146bea09671913dca9d7` — clean reset, pgTAP 57/57, unit and component 66/66, shared UI 4/4, and repository 4/4 passed.
- [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) — completed `2026-09-05T12:39:28+02:00` — approved delivery `c48cbdcaf0bc348888ef2e1eff7193269a6f049c` — unit and component 64/64 and shared UI 4/4 passed.
- [`T-019`](docs/project/tasks/T-019-simplify-exercise-load-mode-model.md) — completed `2026-09-05T12:31:50+02:00` — approved replacement `e265c48f4e376ccbdcc657eef7930830a0573013` — clean reset, pgTAP 56/56, unit and component 63/63, shared UI 4/4, and repository 4/4 passed.
- [`T-018`](docs/project/tasks/T-018-return-to-parent-screen-after-saving.md) — completed `2026-09-05T12:07:13+02:00` — approved delivery `613dae3da605c329e22e07a82a7b9d1439c0320b` — form component scenarios 11/11 and shared UI 4/4 passed.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`7/11 Features Done`)
- [`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) — MVP Experience Corrections (`5/6 Tasks Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
