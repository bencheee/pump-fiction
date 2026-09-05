# Project dashboard

- **Last updated:** 2026-09-05T19:10:30+02:00
- **Current phase:** Local MVP implementation — correcting a blocking active-workout defect under `F-011` before `F-008`
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` complete; six `F-011` Tasks are `Done` and `T-025` corrects a reported defect; `F-008` intentionally not started
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)

## Current focus

[`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) MVP Experience Corrections records the nine corrections the Owner raised on `2026-09-05` after using the delivered application. All nine recorded corrections are delivered, approved, and verified. The Owner then hit a blocking active-workout defect that predates this Feature, so `T-025` was added and the Feature stays open until it is fixed and confirmed.

## Immediate next action

Run and record the authorized clean reset and pgTAP verification for approved [`T-025`](docs/project/tasks/T-025-allow-partial-band-set-entry.md) commit `75fd3d78d71c599cfcd54026080e51c79fade3af`. The proposed current-program mechanism in [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) and the per-set control placement in [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) still need Owner confirmation before those Tasks become `Ready`.

## Now

- [`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) — MVP Experience Corrections (`6/7 Tasks Done`) — `T-025` corrects a reported blocking defect
  - [`T-025`](docs/project/tasks/T-025-allow-partial-band-set-entry.md) — `Testing` — Claude Code primary agent — `2026-09-05T19:03:35+02:00` — deliver one reviewable commit
  - [`T-018`](docs/project/tasks/T-018-return-to-parent-screen-after-saving.md) — `Testing` — Claude Code primary agent — `2026-09-05T12:06:25+02:00` — run authorized tests for `613dae3da605c329e22e07a82a7b9d1439c0320b` (corrections 1 and 4)

## Next

- [`F-008`](docs/project/features/F-008-history-and-statistics.md) is the next Feature; it starts after `F-011` is complete.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

None.

## Approved — ready for testing

- [`T-025`](docs/project/tasks/T-025-allow-partial-band-set-entry.md) — approved commit `75fd3d78d71c599cfcd54026080e51c79fade3af`; the authorized clean reset and pgTAP are running.

## Recently completed Tasks

- [`T-024`](docs/project/tasks/T-024-keep-primary-navigation-during-workout.md) — completed `2026-09-05T13:21:29+02:00` — approved delivery `09a2477e18686ac7aa776b6b52c6c45d35adaad2` — unit and component 67/67 and shared UI 4/4 passed.
- [`T-023`](docs/project/tasks/T-023-correct-active-workout-screen-details.md) — completed `2026-09-05T13:15:59+02:00` — approved delivery `f72e7dde3bcc9cb8f80d98935e42e7411603403f` — unit and component 66/66 and shared UI 4/4 passed.
- [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) — completed `2026-09-05T13:10:43+02:00` — approved replacement `a049287a74a7dccf5ba2146bea09671913dca9d7` — clean reset, pgTAP 57/57, unit and component 66/66, shared UI 4/4, and repository 4/4 passed.
- [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) — completed `2026-09-05T12:39:28+02:00` — approved delivery `c48cbdcaf0bc348888ef2e1eff7193269a6f049c` — unit and component 64/64 and shared UI 4/4 passed.
- [`T-019`](docs/project/tasks/T-019-simplify-exercise-load-mode-model.md) — completed `2026-09-05T12:31:50+02:00` — approved replacement `e265c48f4e376ccbdcc657eef7930830a0573013` — clean reset, pgTAP 56/56, unit and component 63/63, shared UI 4/4, and repository 4/4 passed.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`7/11 Features Done`)
- [`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) — MVP Experience Corrections (`6/7 Tasks Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
