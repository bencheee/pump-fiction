# Project dashboard

- **Last updated:** 2026-09-06T18:24:00+02:00
- **Current phase:** Local MVP integration — every domain Feature is `Done`; `F-010` Local MVP Integration is the last Feature and its breakdown is recorded
- **Current Milestone:** [`M-001 — Local MVP`](docs/project/milestones/M-001-local-mvp.md)
- **Implementation:** `F-004` through `F-009` and `F-011` through `F-014` complete; `F-010` holds `T-043` through `T-050`, of which six of seven are `Done` and `T-047` is `Canceled`. **All 57 locked criteria now carry verification against an approved delivery**
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013`, `F-014`, and `F-012` are `Done` in the order the Owner set on `2026-09-05`; `F-008` and `F-009` followed and are `Done` on `2026-09-06`
- **Approval rule:** since `2026-09-06`, [ADR-0028](docs/decisions/0028-replacements-inherit-task-approval.md) — the Owner approves a Task's first delivery once; replacements within scope inherit it

## Current focus

[`F-010`](docs/project/features/F-010-local-mvp-integration.md) Local MVP Integration, the last Feature of the Milestone. Its breakdown `T-043` through `T-048` is recorded and the Owner confirmed it on 2026-09-06: the record precedes the verification and the verification precedes the close. `T-047` is `Canceled`, because the Owner makes the accepted-reference visual comparison themselves and `T-048` records what they report.

Both items that had no Task now have one: the finish review's `Confirmed sets` copy and the one visibility rule for the two test-support harnesses are `T-044`.

## Immediate next action

Approve or reject exact `T-048` delivery `9d8648d8dfd2acdc24cf60f8731d57821d6d75fb`, which authorizes the release run against one approved tree.

## Now

1. [`T-046`](docs/project/tasks/T-046-verify-phone-interaction-and-affordances.md) — `Backlog`, Claude Code primary agent, `2026-09-06T17:04:00+02:00`; next action: move to `Ready` and write the sweep.

## Next

None; `T-048` is the last Task of the Milestone and is in `Now`.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

- [`T-048`](docs/project/tasks/T-048-run-release-verification-and-close-local-mvp.md) — exact delivery `9d8648d8dfd2acdc24cf60f8731d57821d6d75fb` — the release documentation sweep, `test_required: yes`. Requested action: approve the exact commit, which authorizes the complete suite to run against it.

## Approved — ready for testing

None.

## Recently completed Tasks

- [`T-046`](docs/project/tasks/T-046-verify-phone-interaction-and-affordances.md) — completed `2026-09-06T18:06:00+02:00` — first delivery `300db8bed59d9ce62057064a0dea51ed3ae054e0`, verified through inherited replacement `5c07096fb34801166ddb798345e3fd1b9eb3e117` — the sweep 10/10 with no application defect: 29 routes reflowing at four widths, numeric keyboards, named reorder controls, and six confirmed destructive actions; the whole suite 52/52.
- [`T-050`](docs/project/tasks/T-050-correct-the-reorder-and-current-set-language.md) — completed `2026-09-06T17:40:00+02:00` — approved delivery `17b12f4233282af479501fc9d0af50052d9ca39a` — five sentences requiring a drag handle the application never had, and the current-set sentence ADR-0027 left behind; `test_required: no`.
- [`T-045`](docs/project/tasks/T-045-verify-cross-feature-persistence.md) — completed `2026-09-06T17:04:00+02:00` — first delivery `e59d513da9db55f36655bb3ef9ceb5b3438b90f6`, verified through four inherited replacements ending at `a65a504b64482384c022175230176e983af66ce8` — the two release scenarios 4/4, unit 237/237, components 4/4, the whole browser suite 42/42, and a database identical to its baseline.
- [`T-044`](docs/project/tasks/T-044-close-discovered-release-corrections.md) — completed `2026-09-06T16:12:00+02:00` — first delivery `f2a46162b80e747c369e42e4c4e49854ae72cc42`, verified through inherited replacement `1bee438efe2a7fc4f9e3a399ccaf5ff27a465331` — unit 237/237, components 4/4, and the whole browser suite 38/38 on one production server, the durability spec running against a production build for the first time.
- [`T-049`](docs/project/tasks/T-049-correct-two-locked-mvp-criteria.md) — completed `2026-09-06T15:40:00+02:00` — approved delivery `6cffc618d03198b576374b71db47a6156a2a296d` — the `MVP-REL-002` navigation sentence, the `MVP-PRG-007` heading, the architecture document's focused-shell claim, and the ADR-0025 omission; `test_required: no`.
- [`T-043`](docs/project/tasks/T-043-record-release-verification-matrix.md) — completed `2026-09-06T15:24:00+02:00` — approved delivery `d79c08f5bfe3a8e7c796fdd9bb0fe943dea9c601` — the matrix covers 52 of 57 criteria from approved deliveries, names the 5 `F-010` owns as gaps, and found three stale sentences the Owner decided; `test_required: no`.
- [`T-042`](docs/project/tasks/T-042-build-body-mobile-experience.md) — completed `2026-09-06T14:26:11+02:00` — approved delivery `ae55dd3ef85ce31a692577620736b64a9abf7e54` — unit and component 235/235 and the Chromium and WebKit Body scenario 2/2 with eight structural captures, on the first run.
- [`T-041`](docs/project/tasks/T-041-build-body-measurement-operations.md) — completed `2026-09-06T14:12:40+02:00` — approved delivery `cde56f00dbc7d98c28cca1c7843dd37000250bab` — unit 218/218, seeded reset, pgTAP 187/187, repository 9/9, unchanged types, and a faithful restore, on the first run.
- [`T-040`](docs/project/tasks/T-040-add-todays-weight-prompt.md) — completed `2026-09-06T13:54:26+02:00` — first delivery `4992e617d3d367091332eb178525b2c61e35f0a5`, verified through inherited replacement `88abdad827a907fc93c61fd7851cd5d1736057a6` — unit and component 192/192 and the Chromium and WebKit Today scenario 4/4 with eight structural captures.
- [`T-039`](docs/project/tasks/T-039-build-weight-mobile-experience.md) — completed `2026-09-06T13:39:20+02:00` — first delivery `37cf5ee592bb6a4851050980c9f6c65a6a73ce0e`, verified through inherited replacement `d164327f20e2437d2662d8e0b73d38b519b76613` — unit and component 188/188 and the serialized Chromium and WebKit Weight scenario 2/2 with eight structural captures.

## Active work items

- [`M-001`](docs/project/milestones/M-001-local-mvp.md) — Local MVP (`13/14 Features Done`)
- [`F-010`](docs/project/features/F-010-local-mvp-integration.md) — Local MVP Integration (`6/7 Tasks Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
