# Project dashboard

- **Last updated:** 2026-09-05T13:02:05+02:00
- **Current phase:** Local MVP implementation — correcting delivered behavior under `F-011` before `F-008`
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` complete; `F-011` corrections planned and awaiting Owner readiness; `F-008` intentionally not started
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)

## Current focus

[`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) MVP Experience Corrections records the nine corrections the Owner raised on `2026-09-05` after using the delivered application. The Owner confirmed readiness on `2026-09-05` and directed execution, so `T-018` is `In Progress` and the remaining six Tasks stay in `Backlog` until their turn. `F-008` waits until these corrections are complete.

## Immediate next action

Run and record the authorized clean reset, pgTAP, application, and repository verification for approved [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) commit `dfd6d7a9587740717af43ef23f33e3d545a20c4c`. The proposed current-program mechanism in [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) and the per-set control placement in [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) still need Owner confirmation before those Tasks become `Ready`.

## Now

- [`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) — MVP Experience Corrections (`3/6 Tasks Done`) — Owner confirmed readiness
  - [`T-018`](docs/project/tasks/T-018-return-to-parent-screen-after-saving.md) — `Testing` — Claude Code primary agent — `2026-09-05T12:06:25+02:00` — run authorized tests for `613dae3da605c329e22e07a82a7b9d1439c0320b` (corrections 1 and 4)
  - [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) — `Testing` — Claude Code primary agent — `2026-09-05T12:42:09+02:00` — deliver one reviewable commit (correction 3)
  - [`T-023`](docs/project/tasks/T-023-correct-active-workout-screen-details.md) — `Backlog` — Claude Code primary agent — `2026-09-05T11:41:11+02:00` — Owner confirms `Ready` (corrections 5, 6, 8)
  - [`T-024`](docs/project/tasks/T-024-keep-primary-navigation-during-workout.md) — `Backlog` — Claude Code primary agent — `2026-09-05T11:41:11+02:00` — Owner confirms `Ready` (correction 9)

## Next

- [`F-008`](docs/project/features/F-008-history-and-statistics.md) is the next Feature; it starts after `F-011` is complete.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

None.

## Approved — ready for testing

- [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) — approved commit `dfd6d7a9587740717af43ef23f33e3d545a20c4c`; the complete authorized verification is running.

## Recently completed Tasks

- [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) — completed `2026-09-05T12:39:28+02:00` — approved delivery `c48cbdcaf0bc348888ef2e1eff7193269a6f049c` — unit and component 64/64 and shared UI 4/4 passed.
- [`T-019`](docs/project/tasks/T-019-simplify-exercise-load-mode-model.md) — completed `2026-09-05T12:31:50+02:00` — approved replacement `e265c48f4e376ccbdcc657eef7930830a0573013` — clean reset, pgTAP 56/56, unit and component 63/63, shared UI 4/4, and repository 4/4 passed.
- [`T-018`](docs/project/tasks/T-018-return-to-parent-screen-after-saving.md) — completed `2026-09-05T12:07:13+02:00` — approved delivery `613dae3da605c329e22e07a82a7b9d1439c0320b` — form component scenarios 11/11 and shared UI 4/4 passed.
- [`T-016`](docs/project/tasks/T-016-build-active-workout-mobile-experience.md) — completed `2026-09-05T10:26:58+02:00` — approved second replacement `441a87046409d2970de72e5c3f9c1448c4423a4d` — unit 9/9, component 11/11, pgTAP 53/53, and serialized Chromium/WebKit scenarios 2/2 passed with structural captures.
- [`T-015`](docs/project/tasks/T-015-build-today-and-workout-start-mobile-experience.md) — completed `2026-09-04T15:00:50+02:00` — approved second replacement `f52c0447db67007fba7cce8d0c790164e8447fe9` — component 3/3 and serialized Chromium/WebKit scenarios 2/2 passed with structural captures.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`7/11 Features Done`)
- [`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) — MVP Experience Corrections (`3/6 Tasks Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
