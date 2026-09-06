# Project dashboard

- **Last updated:** 2026-09-06T10:45:28+02:00
- **Current phase:** Local MVP implementation — `F-008` History and Statistics is the current focus
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` and `F-011` through `F-014` complete; `T-031` through `T-034` of `F-008` are `Done` and `T-035` is `In Review`
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013`, `F-014`, and `F-012` are `Done` in the order the Owner set on `2026-09-05`; `F-008` is next in that order and started the same day
- **Approval rule:** since `2026-09-06`, [ADR-0028](docs/decisions/0028-replacements-inherit-task-approval.md) — the Owner approves a Task's first delivery once; replacements within scope inherit it

## Current focus

[`T-035`](docs/project/tasks/T-035-build-split-statistics-operations.md) — Build split statistics operations — `In Review`, Executor Claude Code primary agent, last change 2026-09-06T10:45:28+02:00. It derives the split duration statistics behind `S17` and `S18`.

History has its data, its shell, the Workouts subsection, and the Exercises subsection with the first chart. [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md), [`T-032`](docs/project/tasks/T-032-build-workout-history-mobile-experience.md), [`T-033`](docs/project/tasks/T-033-build-exercise-statistics-operations.md), and [`T-034`](docs/project/tasks/T-034-build-exercise-history-mobile-experience.md) are `Done`.

## Immediate next action

Review exact `T-035` delivery `92b6d10b3472a13282c41712e3e75f939216f647` and approve or reject it. Under ADR-0028 this is the one approval the Task needs.

## Now

- [`T-035`](docs/project/tasks/T-035-build-split-statistics-operations.md) — Build split statistics operations — `In Review` — Claude Code primary agent — 2026-09-06T10:45:28+02:00 — next: the Owner's decision on the exact delivery.

## Next

1. [`T-036`](docs/project/tasks/T-036-build-split-history-mobile-experience.md) — Split History screens; `Backlog`.
2. [`T-037`](docs/project/tasks/T-037-repair-stale-browser-specs.md) — Repair the browser specs left stale by the archiving removal; `Backlog`, discovered on `2026-09-05` and awaiting the Owner's confirmation of its parent Feature.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

- [`T-035`](docs/project/tasks/T-035-build-split-statistics-operations.md) — Build split statistics operations — exact delivery `92b6d10b3472a13282c41712e3e75f939216f647` — Claude Code primary agent — 2026-09-06T10:45:28+02:00 — requested action: review and approve or reject the exact commit.

## Approved — ready for testing

None.

## Recently completed Tasks

- [`T-034`](docs/project/tasks/T-034-build-exercise-history-mobile-experience.md) — completed `2026-09-06T10:38:42+02:00` — first delivery `b5772adb87d244bfc2404481e90f58a4046a7767`, verified through inherited third replacement `aed262314e9c332198067bfbdd1211c221ece256` — unit and component 127/127 and the serialized Chromium and WebKit Exercise History scenario 2/2 with four structural captures.
- [`T-033`](docs/project/tasks/T-033-build-exercise-statistics-operations.md) — completed `2026-09-06T00:46:12+02:00` — approved replacement `d1f15d90151d3a7f43786da52dd3c8affc633a11` — unit 118/118, seeded reset, pgTAP 124/124, repository 6/6, unchanged types, and a faithful restore.
- [`T-032`](docs/project/tasks/T-032-build-workout-history-mobile-experience.md) — completed `2026-09-05T23:24:46+02:00` — approved second replacement `35790c78201f76c0c2cec3c76bddaa8415c9727a` — unit and component 99/99 and the serialized Chromium and WebKit History scenario 2/2 with four structural captures.
- [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) — completed `2026-09-05T22:46:10+02:00` — approved second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` — snapshot, seeded reset, pgTAP 112/112, repository 5/5, unit 86/86, unchanged types, and a faithful restore.
- [`T-026`](docs/project/tasks/T-026-recover-from-rejected-command.md) — completed `2026-09-05T21:37:13+02:00` — approved delivery `90875783eda308cdb95b33ad43a336bbd6060ccd` — unit 72/72 and component 4/4 passed; no reset was required.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`11/14 Features Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
