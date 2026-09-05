# Project dashboard

- **Last updated:** 2026-09-05T12:20:26+02:00
- **Current phase:** Local MVP implementation — correcting delivered behavior under `F-011` before `F-008`
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` complete; `F-011` corrections planned and awaiting Owner readiness; `F-008` intentionally not started
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)

## Current focus

[`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) MVP Experience Corrections records the nine corrections the Owner raised on `2026-09-05` after using the delivered application. The Owner confirmed readiness on `2026-09-05` and directed execution, so `T-018` is `In Progress` and the remaining six Tasks stay in `Backlog` until their turn. `F-008` waits until these corrections are complete.

## Immediate next action

User reviews delivery commit `db5a42026270393d17a11ecded5578e756f6d1e4` for [`T-019`](docs/project/tasks/T-019-simplify-exercise-load-mode-model.md) and decides on approval; the clean reset and pgTAP verification stay blocked until then. The proposed current-program mechanism in [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) and the per-set control placement in [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) still need Owner confirmation before those Tasks become `Ready`.

## Now

- [`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) — MVP Experience Corrections (`1/7 Tasks Done`) — Owner confirmed readiness
  - [`T-018`](docs/project/tasks/T-018-return-to-parent-screen-after-saving.md) — `Testing` — Claude Code primary agent — `2026-09-05T12:06:25+02:00` — run authorized tests for `613dae3da605c329e22e07a82a7b9d1439c0320b` (corrections 1 and 4)
  - [`T-019`](docs/project/tasks/T-019-simplify-exercise-load-mode-model.md) — `In Review` — Claude Code primary agent — `2026-09-05T12:20:26+02:00` — User reviews `db5a42026270393d17a11ecded5578e756f6d1e4` (correction 2)
  - [`T-020`](docs/project/tasks/T-020-derive-per-set-load-from-definition.md) — `Backlog` — Claude Code primary agent — `2026-09-05T11:41:11+02:00` — Owner confirms `Ready` (correction 7)
  - [`T-021`](docs/project/tasks/T-021-replace-archiving-with-deletion-in-data.md) — `Backlog` — Claude Code primary agent — `2026-09-05T11:41:11+02:00` — Owner confirms `Ready` and the current-program mechanism (correction 3)
  - [`T-022`](docs/project/tasks/T-022-replace-archiving-in-mobile-experience.md) — `Backlog` — Claude Code primary agent — `2026-09-05T11:41:11+02:00` — Owner confirms `Ready` (correction 3)
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

None.

## Recently completed Tasks

- [`T-018`](docs/project/tasks/T-018-return-to-parent-screen-after-saving.md) — completed `2026-09-05T12:07:13+02:00` — approved delivery `613dae3da605c329e22e07a82a7b9d1439c0320b` — form component scenarios 11/11 and shared UI 4/4 passed.
- [`T-016`](docs/project/tasks/T-016-build-active-workout-mobile-experience.md) — completed `2026-09-05T10:26:58+02:00` — approved second replacement `441a87046409d2970de72e5c3f9c1448c4423a4d` — unit 9/9, component 11/11, pgTAP 53/53, and serialized Chromium/WebKit scenarios 2/2 passed with structural captures.
- [`T-015`](docs/project/tasks/T-015-build-today-and-workout-start-mobile-experience.md) — completed `2026-09-04T15:00:50+02:00` — approved second replacement `f52c0447db67007fba7cce8d0c790164e8447fe9` — component 3/3 and serialized Chromium/WebKit scenarios 2/2 passed with structural captures.
- [`T-017`](docs/project/tasks/T-017-correct-one-time-workout-starter-sets.md) — completed `2026-09-04T12:46:55+02:00` — approved delivery `8d5779258505bb94383368e13eff97a4346320ca` — clean reset, pgTAP 18/18, and Workout repository integration 1/1 passed.
- [`T-014`](docs/project/tasks/T-014-build-today-and-workout-operations.md) — completed `2026-09-04T08:58:15+02:00` — approved delivery `4f924d51af2e55681f2e5a517a8963bc58048d81` — unit 8/8, clean reset, pgTAP 16/16, repository integration 2/2, and generated types passed.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`7/11 Features Done`)
- [`F-011`](docs/project/features/F-011-mvp-experience-corrections.md) — MVP Experience Corrections (`1/7 Tasks Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
