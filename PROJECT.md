# Project dashboard

- **Last updated:** 2026-09-05T22:44:18+02:00
- **Current phase:** Local MVP implementation — `F-008` History and Statistics is the current focus after the Owner released the hold
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` and `F-011` through `F-014` complete; `T-031` is `Testing` against an approved second replacement, as the first of the six `F-008` Tasks
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013`, `F-014`, and `F-012` are `Done` in the order the Owner set on `2026-09-05`; `F-008` is next in that order and started the same day

## Current focus

[`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) — Build workout History operations — `Testing`, Executor Claude Code primary agent, last change 2026-09-05T22:44:18+02:00. pgTAP 112/112, unit 86/86, and the type comparison passed; second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` serializes the repository script, which then passed 5/5 when verified from the command line. The authorized verification failed on two prepared pgTAP suites, so the first delivery's approval is invalidated and replacement `b5e4cda609d478453eccd562087d1f18bfec7f54` corrects only test source and one sentence. It is the first of the six [`F-008`](docs/project/features/F-008-history-and-statistics.md) Tasks. On `2026-09-05` the Owner released the hold, gave the go-ahead for the whole Feature, and accepted every recommended readiness answer, including the never-nulled identity snapshot that keeps exercise and split identity after a definition is deleted.

## Immediate next action

Run the complete recorded `T-031` plan from the beginning against approved second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf`, then record the result.

## Now

- [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) — Build workout History operations — `Testing` — Claude Code primary agent — 2026-09-05T22:44:18+02:00 — next: record the verification result.

## Next

1. [`T-032`](docs/project/tasks/T-032-build-workout-history-mobile-experience.md) — History shell and workout History screens; `Backlog`, blocked until `T-031` is `Done`.
2. [`T-033`](docs/project/tasks/T-033-build-exercise-statistics-operations.md) — Exercise statistics operations; `Backlog`.
3. [`T-034`](docs/project/tasks/T-034-build-exercise-history-mobile-experience.md) — Exercise History screens; `Backlog`.
4. [`T-035`](docs/project/tasks/T-035-build-split-statistics-operations.md) — Split statistics operations; `Backlog`.
5. [`T-036`](docs/project/tasks/T-036-build-split-history-mobile-experience.md) — Split History screens; `Backlog`.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

None.

## Approved — ready for testing

- [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) — Build workout History operations — approved second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` — Claude Code primary agent — 2026-09-05T22:44:18+02:00 — next required action: the complete recorded plan, restarted from the beginning.

## Recently completed Tasks

- [`T-026`](docs/project/tasks/T-026-recover-from-rejected-command.md) — completed `2026-09-05T21:37:13+02:00` — approved delivery `90875783eda308cdb95b33ad43a336bbd6060ccd` — unit 72/72 and component 4/4 passed; no reset was required.
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

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`11/14 Features Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
