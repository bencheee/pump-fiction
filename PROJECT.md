# Project dashboard

- **Last updated:** 2026-09-06T15:16:00+02:00
- **Current phase:** Local MVP integration — every domain Feature is `Done`; `F-010` Local MVP Integration is the last Feature and its breakdown is recorded
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-009` and `F-011` through `F-014` complete; `F-010` holds `T-043` through `T-048`, of which five are required and `T-047` is `Canceled`
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013`, `F-014`, and `F-012` are `Done` in the order the Owner set on `2026-09-05`; `F-008` and `F-009` followed and are `Done` on `2026-09-06`
- **Approval rule:** since `2026-09-06`, [ADR-0028](docs/decisions/0028-replacements-inherit-task-approval.md) — the Owner approves a Task's first delivery once; replacements within scope inherit it

## Current focus

[`F-010`](docs/project/features/F-010-local-mvp-integration.md) Local MVP Integration, the last Feature of the Milestone. Its breakdown `T-043` through `T-048` is recorded and the Owner confirmed it on 2026-09-06: the record precedes the verification and the verification precedes the close. `T-047` is `Canceled`, because the Owner makes the accepted-reference visual comparison themselves and `T-048` records what they report.

Both items that had no Task now have one: the finish review's `Confirmed sets` copy and the one visibility rule for the two test-support harnesses are `T-044`.

## Immediate next action

Approve or reject exact `T-043` delivery `d79c08f5bfe3a8e7c796fdd9bb0fe943dea9c601`, and decide the two findings it records: `R1`, where `MVP-REL-002` contradicts ADR-0025, and `R2`, the stale `MVP-PRG-007` heading.

## Now

1. [`T-043`](docs/project/tasks/T-043-record-release-verification-matrix.md) — `Awaiting Approval`, Claude Code primary agent, `2026-09-06T15:16:00+02:00`; next action: the Owner's decision on delivery `d79c08f5bfe3a8e7c796fdd9bb0fe943dea9c601`.

## Next

1. [`T-044`](docs/project/tasks/T-044-close-discovered-release-corrections.md) — the finish-review copy and one test-support visibility rule, recorded as `ADR-0029`.
2. [`T-045`](docs/project/tasks/T-045-verify-cross-feature-persistence.md) — release evidence for `MVP-REL-003` and `MVP-REL-004`.
3. [`T-046`](docs/project/tasks/T-046-verify-phone-interaction-and-affordances.md) — release evidence for `MVP-UX-001` through `MVP-UX-003`.
4. [`T-048`](docs/project/tasks/T-048-run-release-verification-and-close-local-mvp.md) — the release run, the filled matrix, and the `F-010` and `M-001` close.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

- [`T-043`](docs/project/tasks/T-043-record-release-verification-matrix.md) — exact delivery `d79c08f5bfe3a8e7c796fdd9bb0fe943dea9c601` — the release verification matrix, `test_required: no`. Requested action: approve the exact commit, and decide findings `R1` and `R2`.

## Approved — ready for testing

None.

## Recently completed Tasks

- [`T-042`](docs/project/tasks/T-042-build-body-mobile-experience.md) — completed `2026-09-06T14:26:11+02:00` — approved delivery `ae55dd3ef85ce31a692577620736b64a9abf7e54` — unit and component 235/235 and the Chromium and WebKit Body scenario 2/2 with eight structural captures, on the first run.
- [`T-041`](docs/project/tasks/T-041-build-body-measurement-operations.md) — completed `2026-09-06T14:12:40+02:00` — approved delivery `cde56f00dbc7d98c28cca1c7843dd37000250bab` — unit 218/218, seeded reset, pgTAP 187/187, repository 9/9, unchanged types, and a faithful restore, on the first run.
- [`T-040`](docs/project/tasks/T-040-add-todays-weight-prompt.md) — completed `2026-09-06T13:54:26+02:00` — first delivery `4992e617d3d367091332eb178525b2c61e35f0a5`, verified through inherited replacement `88abdad827a907fc93c61fd7851cd5d1736057a6` — unit and component 192/192 and the Chromium and WebKit Today scenario 4/4 with eight structural captures.
- [`T-039`](docs/project/tasks/T-039-build-weight-mobile-experience.md) — completed `2026-09-06T13:39:20+02:00` — first delivery `37cf5ee592bb6a4851050980c9f6c65a6a73ce0e`, verified through inherited replacement `d164327f20e2437d2662d8e0b73d38b519b76613` — unit and component 188/188 and the serialized Chromium and WebKit Weight scenario 2/2 with eight structural captures.
- [`T-038`](docs/project/tasks/T-038-build-weight-operations.md) — completed `2026-09-06T13:17:52+02:00` — first delivery `94196f3be1f8f7b47b204637a16cc30d0520e916`, verified through inherited replacement `f9edf3a4c3492faf672e12b2dc452d61898a21d7` — unit 174/174, seeded reset, pgTAP 157/157, repository 8/8, unchanged types, and a faithful restore.
- [`T-037`](docs/project/tasks/T-037-repair-stale-browser-specs.md) — completed `2026-09-06T11:39:47+02:00` — first delivery `d65b0b092e04ab17761c11a4c78dd6648369a8a7`, verified through inherited replacement `060bf92e4f28ef44006e39c75561cbae973ae724` — the whole browser suite 32/32: 26 on the production server across mobile Chromium and WebKit and 6 durability tests on the development server.
- [`T-036`](docs/project/tasks/T-036-build-split-history-mobile-experience.md) — completed `2026-09-06T11:01:09+02:00` — first delivery `e5f9bf82970ca37c213fb84fef554a4d37593a78`, verified through inherited replacement `1c28f61c293ca3845cf2462ecc98ab6af4cde8c6` — unit and component 143/143 and the serialized Chromium and WebKit Split History scenario 2/2 with four structural captures.
- [`T-035`](docs/project/tasks/T-035-build-split-statistics-operations.md) — completed `2026-09-06T10:50:32+02:00` — approved delivery `92b6d10b3472a13282c41712e3e75f939216f647` — unit 137/137, seeded reset, pgTAP 135/135, repository 7/7, unchanged types, and a faithful restore, on the first run.
- [`T-034`](docs/project/tasks/T-034-build-exercise-history-mobile-experience.md) — completed `2026-09-06T10:38:42+02:00` — first delivery `b5772adb87d244bfc2404481e90f58a4046a7767`, verified through inherited third replacement `aed262314e9c332198067bfbdd1211c221ece256` — unit and component 127/127 and the serialized Chromium and WebKit Exercise History scenario 2/2 with four structural captures.
- [`T-033`](docs/project/tasks/T-033-build-exercise-statistics-operations.md) — completed `2026-09-06T00:46:12+02:00` — approved replacement `d1f15d90151d3a7f43786da52dd3c8affc633a11` — unit 118/118, seeded reset, pgTAP 124/124, repository 6/6, unchanged types, and a faithful restore.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`13/14 Features Done`)
- [`F-010`](docs/project/features/F-010-local-mvp-integration.md) — Local MVP Integration (`0/5 Tasks Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
