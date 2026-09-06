# Project dashboard

- **Last updated:** 2026-09-06T10:17:05+02:00
- **Current phase:** Local MVP implementation — `F-008` History and Statistics is the current focus
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` and `F-011` through `F-014` complete; `T-031`, `T-032`, and `T-033` of `F-008` are `Done` and `T-034` is `In Review` with a replacement
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013`, `F-014`, and `F-012` are `Done` in the order the Owner set on `2026-09-05`; `F-008` is next in that order and started the same day

## Current focus

[`T-034`](docs/project/tasks/T-034-build-exercise-history-mobile-experience.md) — Build Exercise History mobile experience — `In Review`, Executor Claude Code primary agent, last change 2026-09-06T10:17:05+02:00. Unit and component tests passed 124 of 126; two queries could not tell the two value lists apart. It renders `S15` and `S16` on the `T-033` derivation, with the first chart in the application.

History already has its data, its first screens, and its exercise statistics. [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) delivered the month-grouped reads, the saved-workout detail, and ten transactional corrections. [`T-032`](docs/project/tasks/T-032-build-workout-history-mobile-experience.md) delivered the subsection shell, `S13`, `S14`, and the correction screen. [`T-033`](docs/project/tasks/T-033-build-exercise-statistics-operations.md) delivered the identity-grouped reads and every derivation rule behind them.

## Immediate next action

Review exact `T-034` replacement `b50df7b355bdaf6ab47ad1d763ce537cb0bcbd73` and approve or reject it. Approval restarts the complete recorded plan from the beginning.

## Now

- [`T-034`](docs/project/tasks/T-034-build-exercise-history-mobile-experience.md) — Build Exercise History mobile experience — `In Progress` — Claude Code primary agent — 2026-09-06T10:17:05+02:00 — next: the Owner's decision on the exact replacement.

## Next

1. [`T-035`](docs/project/tasks/T-035-build-split-statistics-operations.md) — Split statistics operations; `Backlog`.
2. [`T-036`](docs/project/tasks/T-036-build-split-history-mobile-experience.md) — Split History screens; `Backlog`.
3. [`T-037`](docs/project/tasks/T-037-repair-stale-browser-specs.md) — Repair the browser specs left stale by the archiving removal; `Backlog`, discovered on `2026-09-05` and awaiting the Owner's confirmation of its parent Feature.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

- [`T-034`](docs/project/tasks/T-034-build-exercise-history-mobile-experience.md) — Build Exercise History mobile experience — exact replacement `b50df7b355bdaf6ab47ad1d763ce537cb0bcbd73` — Claude Code primary agent — 2026-09-06T10:17:05+02:00 — requested action: review and approve or reject it. It names the two value lists and points the assertions at them.

## Approved — ready for testing

None. The `T-034` approval was invalidated by its failed verification.

## Recently completed Tasks

- [`T-033`](docs/project/tasks/T-033-build-exercise-statistics-operations.md) — completed `2026-09-06T00:46:12+02:00` — approved replacement `d1f15d90151d3a7f43786da52dd3c8affc633a11` — unit 118/118, seeded reset, pgTAP 124/124, repository 6/6, unchanged types, and a faithful restore.
- [`T-032`](docs/project/tasks/T-032-build-workout-history-mobile-experience.md) — completed `2026-09-05T23:24:46+02:00` — approved second replacement `35790c78201f76c0c2cec3c76bddaa8415c9727a` — unit and component 99/99 and the serialized Chromium and WebKit History scenario 2/2 with four structural captures.
- [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) — completed `2026-09-05T22:46:10+02:00` — approved second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` — snapshot, seeded reset, pgTAP 112/112, repository 5/5, unit 86/86, unchanged types, and a faithful restore.
- [`T-026`](docs/project/tasks/T-026-recover-from-rejected-command.md) — completed `2026-09-05T21:37:13+02:00` — approved delivery `90875783eda308cdb95b33ad43a336bbd6060ccd` — unit 72/72 and component 4/4 passed; no reset was required.
- [`T-029`](docs/project/tasks/T-029-record-a-set-by-its-values.md) — completed `2026-09-05T21:26:21+02:00` — approved replacement `9374b8c23f55882f4c813a3e9a761f26b291e2b5` — seeded reset, pgTAP 65/65, unchanged types, unit 69/69, component 4/4, and repository 4/4 passed.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`11/14 Features Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
