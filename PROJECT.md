# Project dashboard

- **Last updated:** 2026-09-05T23:19:16+02:00
- **Current phase:** Local MVP implementation — `F-008` History and Statistics is the current focus after the Owner released the hold
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-007` and `F-011` through `F-014` complete; `T-031` is `Done` and `T-032` is back in `In Progress` after a second failed verification, as the first of the six `F-008` Tasks
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013`, `F-014`, and `F-012` are `Done` in the order the Owner set on `2026-09-05`; `F-008` is next in that order and started the same day

## Current focus

[`T-032`](docs/project/tasks/T-032-build-workout-history-mobile-experience.md) — Build the History shell and workout History mobile experience — `In Progress`, Executor Claude Code primary agent, last change 2026-09-05T23:19:16+02:00. Unit and component tests passed 99/99 and the browser scenario cleared the correction, confirming the mode fix, before an ambiguous Today assertion in the test itself stopped it. Unit and component tests passed 98/98; the browser scenario then found that an empty historical set showed no load field, because the form read the set's mode column instead of deriving it from the exercise definition. [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) is `Done`: its approved second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` passed pgTAP 112/112, repository 5/5, unit 86/86, matching generated types, and a faithful restore. pgTAP 112/112, unit 86/86, and the type comparison passed; second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` serializes the repository script, which then passed 5/5 when verified from the command line. The authorized verification failed on two prepared pgTAP suites, so the first delivery's approval is invalidated and replacement `b5e4cda609d478453eccd562087d1f18bfec7f54` corrects only test source and one sentence. It is the first of the six [`F-008`](docs/project/features/F-008-history-and-statistics.md) Tasks. On `2026-09-05` the Owner released the hold, gave the go-ahead for the whole Feature, and accepted every recommended readiness answer, including the never-nulled identity snapshot that keeps exercise and split identity after a definition is deleted.

## Immediate next action

Deliver the `T-032` second replacement that disambiguates the Today assertion, then request fresh approval.

## Now

- [`T-032`](docs/project/tasks/T-032-build-workout-history-mobile-experience.md) — Build the History shell and workout History mobile experience — `In Progress` — Claude Code primary agent — 2026-09-05T23:19:16+02:00 — next: deliver the second replacement for fresh approval.

## Next

1. [`T-033`](docs/project/tasks/T-033-build-exercise-statistics-operations.md) — Exercise statistics operations; `Backlog`.
2. [`T-034`](docs/project/tasks/T-034-build-exercise-history-mobile-experience.md) — Exercise History screens; `Backlog`.
3. [`T-035`](docs/project/tasks/T-035-build-split-statistics-operations.md) — Split statistics operations; `Backlog`.
4. [`T-036`](docs/project/tasks/T-036-build-split-history-mobile-experience.md) — Split History screens; `Backlog`.
5. [`T-037`](docs/project/tasks/T-037-repair-stale-browser-specs.md) — Repair the browser specs left stale by the archiving removal; `Backlog`, discovered on `2026-09-05` and awaiting the Owner's confirmation of its parent Feature.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

None.

## Approved — ready for testing

None. The `T-032` replacement approval was invalidated by its failed verification.

## Recently completed Tasks

- [`T-031`](docs/project/tasks/T-031-build-workout-history-operations.md) — completed `2026-09-05T22:46:10+02:00` — approved second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` — snapshot, seeded reset, pgTAP 112/112, repository 5/5, unit 86/86, unchanged types, and a faithful restore.
- [`T-026`](docs/project/tasks/T-026-recover-from-rejected-command.md) — completed `2026-09-05T21:37:13+02:00` — approved delivery `90875783eda308cdb95b33ad43a336bbd6060ccd` — unit 72/72 and component 4/4 passed; no reset was required.
- [`T-029`](docs/project/tasks/T-029-record-a-set-by-its-values.md) — completed `2026-09-05T21:26:21+02:00` — approved replacement `9374b8c23f55882f4c813a3e9a761f26b291e2b5` — seeded reset, pgTAP 65/65, unchanged types, unit 69/69, component 4/4, and repository 4/4 passed.
- [`T-028`](docs/project/tasks/T-028-merge-assisted-into-bodyweight.md) — completed `2026-09-05T21:05:10+02:00` — approved replacement `14fdd0ac8785127e2407584afd9a201aeaeb2cb2` — seeded reset, pgTAP 62/62, unchanged types, unit 69/69, component 4/4, and repository 4/4 passed.
- [`T-030`](docs/project/tasks/T-030-clean-up-command-test-exercise.md) — completed `2026-09-05T20:21:55+02:00` — approved replacement `ae1870380a0657d71846b0c7eb9566c2b979edf7` — seeded reset, repository 4/4, an unchanged 10-row library with no orphan, and a faithful restore.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`11/14 Features Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
