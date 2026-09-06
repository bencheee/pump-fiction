# Project dashboard

- **Last updated:** 2026-09-06T11:11:32+02:00
- **Current phase:** Local MVP implementation — `F-008` History and Statistics is the current focus; every History screen is delivered
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` and `F-011` through `F-014` complete; `T-031` through `T-036` of `F-008` are `Done` and `T-037` is `In Review`
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013`, `F-014`, and `F-012` are `Done` in the order the Owner set on `2026-09-05`; `F-008` is next in that order and started the same day
- **Approval rule:** since `2026-09-06`, [ADR-0028](docs/decisions/0028-replacements-inherit-task-approval.md) — the Owner approves a Task's first delivery once; replacements within scope inherit it

## Current focus

[`T-037`](docs/project/tasks/T-037-repair-stale-browser-specs.md) — Repair the browser specs left stale by the archiving removal — `In Review`, Executor Claude Code primary agent, last change 2026-09-06T11:11:32+02:00. It is the last `F-008` Task: two older specs still call the archiving artifacts `T-021` removed, so `npm run test:browser` cannot run as a whole until they are repaired.

Every History screen is delivered and verified. [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) through [`T-036`](docs/project/tasks/T-036-build-split-history-mobile-experience.md) are `Done`.

## Immediate next action

Review exact `T-037` delivery `d65b0b092e04ab17761c11a4c78dd6648369a8a7` and approve or reject it. Under ADR-0028 this is the one approval the Task needs; its verification runs the whole browser suite.

## Now

- [`T-037`](docs/project/tasks/T-037-repair-stale-browser-specs.md) — Repair the browser specs left stale by the archiving removal — `In Review` — Claude Code primary agent — 2026-09-06T11:11:32+02:00 — next: the Owner's decision on the exact delivery.

## Next

None within `F-008`. [`F-009`](docs/project/features/F-009-weight-and-body-progress.md) follows in the Owner's order once `F-008` is confirmed.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

- [`T-037`](docs/project/tasks/T-037-repair-stale-browser-specs.md) — Repair the browser specs left stale by the archiving removal — exact delivery `d65b0b092e04ab17761c11a4c78dd6648369a8a7` — Claude Code primary agent — 2026-09-06T11:11:32+02:00 — requested action: review and approve or reject the exact commit. It touches test source and one workflow note only.

## Approved — ready for testing

None.

## Recently completed Tasks

- [`T-036`](docs/project/tasks/T-036-build-split-history-mobile-experience.md) — completed `2026-09-06T11:01:09+02:00` — first delivery `e5f9bf82970ca37c213fb84fef554a4d37593a78`, verified through inherited replacement `1c28f61c293ca3845cf2462ecc98ab6af4cde8c6` — unit and component 143/143 and the serialized Chromium and WebKit Split History scenario 2/2 with four structural captures.
- [`T-035`](docs/project/tasks/T-035-build-split-statistics-operations.md) — completed `2026-09-06T10:50:32+02:00` — approved delivery `92b6d10b3472a13282c41712e3e75f939216f647` — unit 137/137, seeded reset, pgTAP 135/135, repository 7/7, unchanged types, and a faithful restore, on the first run.
- [`T-034`](docs/project/tasks/T-034-build-exercise-history-mobile-experience.md) — completed `2026-09-06T10:38:42+02:00` — first delivery `b5772adb87d244bfc2404481e90f58a4046a7767`, verified through inherited third replacement `aed262314e9c332198067bfbdd1211c221ece256` — unit and component 127/127 and the serialized Chromium and WebKit Exercise History scenario 2/2 with four structural captures.
- [`T-033`](docs/project/tasks/T-033-build-exercise-statistics-operations.md) — completed `2026-09-06T00:46:12+02:00` — approved replacement `d1f15d90151d3a7f43786da52dd3c8affc633a11` — unit 118/118, seeded reset, pgTAP 124/124, repository 6/6, unchanged types, and a faithful restore.
- [`T-032`](docs/project/tasks/T-032-build-workout-history-mobile-experience.md) — completed `2026-09-05T23:24:46+02:00` — approved second replacement `35790c78201f76c0c2cec3c76bddaa8415c9727a` — unit and component 99/99 and the serialized Chromium and WebKit History scenario 2/2 with four structural captures.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`11/14 Features Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
