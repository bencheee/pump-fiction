# Project dashboard

- **Last updated:** 2026-09-05T23:42:19+02:00
- **Current phase:** Local MVP implementation — `F-008` History and Statistics is the current focus
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` and `F-011` through `F-014` complete; `T-031` and `T-032` of `F-008` are `Done` and `T-033` is back in `In Progress` after a failed verification
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013`, `F-014`, and `F-012` are `Done` in the order the Owner set on `2026-09-05`; `F-008` is next in that order and started the same day

## Current focus

[`T-033`](docs/project/tasks/T-033-build-exercise-statistics-operations.md) — Build exercise statistics operations — `In Progress`, Executor Claude Code primary agent, last change 2026-09-05T23:42:19+02:00. pgTAP 124/124, repository 6/6, and the type comparison passed; two arithmetic expectations in the new unit suite were wrong about the trailing week boundary. It derives the personal records, eligibility, and chart series behind `S15` and `S16`.

History already has its data and its first screens. [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) delivered the month-grouped reads, the saved-workout detail, and ten transactional corrections, verified through approved second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf`. [`T-032`](docs/project/tasks/T-032-build-workout-history-mobile-experience.md) delivered the subsection shell, `S13`, `S14`, and the correction screen, verified through approved second replacement `35790c78201f76c0c2cec3c76bddaa8415c9727a`.

## Immediate next action

Deliver the `T-033` replacement that corrects two range expectations, then request fresh approval.

## Now

- [`T-033`](docs/project/tasks/T-033-build-exercise-statistics-operations.md) — Build exercise statistics operations — `In Progress` — Claude Code primary agent — 2026-09-05T23:42:19+02:00 — next: deliver the replacement for fresh approval.

## Next

1. [`T-034`](docs/project/tasks/T-034-build-exercise-history-mobile-experience.md) — Exercise History screens; `Backlog`.
2. [`T-035`](docs/project/tasks/T-035-build-split-statistics-operations.md) — Split statistics operations; `Backlog`.
3. [`T-036`](docs/project/tasks/T-036-build-split-history-mobile-experience.md) — Split History screens; `Backlog`.
4. [`T-037`](docs/project/tasks/T-037-repair-stale-browser-specs.md) — Repair the browser specs left stale by the archiving removal; `Backlog`, discovered on `2026-09-05` and awaiting the Owner's confirmation of its parent Feature.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

None.

## Approved — ready for testing

None. The `T-033` approval was invalidated by its failed verification.

## Recently completed Tasks

- [`T-032`](docs/project/tasks/T-032-build-workout-history-mobile-experience.md) — completed `2026-09-05T23:24:46+02:00` — approved second replacement `35790c78201f76c0c2cec3c76bddaa8415c9727a` — unit and component 99/99 and the serialized Chromium and WebKit History scenario 2/2 with four structural captures.
- [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) — completed `2026-09-05T22:46:10+02:00` — approved second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` — snapshot, seeded reset, pgTAP 112/112, repository 5/5, unit 86/86, unchanged types, and a faithful restore.
- [`T-026`](docs/project/tasks/T-026-recover-from-rejected-command.md) — completed `2026-09-05T21:37:13+02:00` — approved delivery `90875783eda308cdb95b33ad43a336bbd6060ccd` — unit 72/72 and component 4/4 passed; no reset was required.
- [`T-029`](docs/project/tasks/T-029-record-a-set-by-its-values.md) — completed `2026-09-05T21:26:21+02:00` — approved replacement `9374b8c23f55882f4c813a3e9a761f26b291e2b5` — seeded reset, pgTAP 65/65, unchanged types, unit 69/69, component 4/4, and repository 4/4 passed.
- [`T-028`](docs/project/tasks/T-028-merge-assisted-into-bodyweight.md) — completed `2026-09-05T21:05:10+02:00` — approved replacement `14fdd0ac8785127e2407584afd9a201aeaeb2cb2` — seeded reset, pgTAP 62/62, unchanged types, unit 69/69, component 4/4, and repository 4/4 passed.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`11/14 Features Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
