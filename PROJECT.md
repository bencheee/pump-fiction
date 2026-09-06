# Project dashboard

- **Last updated:** 2026-09-06T11:50:42+02:00
- **Current phase:** Local MVP implementation — `F-008` History and Statistics is `Done` with the Owner's confirmation on `2026-09-06`; `F-009` follows in the Owner's order
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-008` and `F-011` through `F-014` complete
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013`, `F-014`, and `F-012` are `Done` in the order the Owner set on `2026-09-05`; `F-008` followed and is `Done` on `2026-09-06`; `F-009` is next
- **Approval rule:** since `2026-09-06`, [ADR-0028](docs/decisions/0028-replacements-inherit-task-approval.md) — the Owner approves a Task's first delivery once; replacements within scope inherit it

## Current focus

`F-008` is `Done`: the Owner confirmed the History and Statistics result on 2026-09-06T11:50:42+02:00. No work item is active. [`F-009`](docs/project/features/F-009-weight-and-body-progress.md) follows in the Owner's order, and nothing of it starts before the Owner's go-ahead.

Every History screen is delivered and verified. [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) through [`T-036`](docs/project/tasks/T-036-build-split-history-mobile-experience.md) are `Done`.

## Immediate next action

The Owner's go-ahead for `F-009`, and the Owner's word on two discovered items without a Task: the finish review's `Confirmed sets` copy, and one rule for the two test-support harnesses.

## Now

None; every `Now` Task is `Done`.

## Next

[`F-009`](docs/project/features/F-009-weight-and-body-progress.md) follows in the Owner's order; nothing of it starts before the Owner's go-ahead.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

None.

## Approved — ready for testing

None.

## Recently completed Tasks

- [`T-037`](docs/project/tasks/T-037-repair-stale-browser-specs.md) — completed `2026-09-06T11:39:47+02:00` — first delivery `d65b0b092e04ab17761c11a4c78dd6648369a8a7`, verified through inherited replacement `060bf92e4f28ef44006e39c75561cbae973ae724` — the whole browser suite 32/32: 26 on the production server across mobile Chromium and WebKit and 6 durability tests on the development server.
- [`T-036`](docs/project/tasks/T-036-build-split-history-mobile-experience.md) — completed `2026-09-06T11:01:09+02:00` — first delivery `e5f9bf82970ca37c213fb84fef554a4d37593a78`, verified through inherited replacement `1c28f61c293ca3845cf2462ecc98ab6af4cde8c6` — unit and component 143/143 and the serialized Chromium and WebKit Split History scenario 2/2 with four structural captures.
- [`T-035`](docs/project/tasks/T-035-build-split-statistics-operations.md) — completed `2026-09-06T10:50:32+02:00` — approved delivery `92b6d10b3472a13282c41712e3e75f939216f647` — unit 137/137, seeded reset, pgTAP 135/135, repository 7/7, unchanged types, and a faithful restore, on the first run.
- [`T-034`](docs/project/tasks/T-034-build-exercise-history-mobile-experience.md) — completed `2026-09-06T10:38:42+02:00` — first delivery `b5772adb87d244bfc2404481e90f58a4046a7767`, verified through inherited third replacement `aed262314e9c332198067bfbdd1211c221ece256` — unit and component 127/127 and the serialized Chromium and WebKit Exercise History scenario 2/2 with four structural captures.
- [`T-033`](docs/project/tasks/T-033-build-exercise-statistics-operations.md) — completed `2026-09-06T00:46:12+02:00` — approved replacement `d1f15d90151d3a7f43786da52dd3c8affc633a11` — unit 118/118, seeded reset, pgTAP 124/124, repository 6/6, unchanged types, and a faithful restore.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`12/14 Features Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
