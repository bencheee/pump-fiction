# Project dashboard

- **Last updated:** 2026-09-06T19:50:00+02:00
- **Current phase:** **Local MVP complete.** The Owner confirmed the result on `2026-09-06`: 14/14 Features `Done`, all 57 locked criteria verified against approved deliveries, and a release run of 489 checks against one approved tree
- **Current Milestone:** [`M-002 — Post-MVP Product Changes`](docs/project/milestones/M-002-post-mvp-product-changes.md); [`M-001`](docs/project/milestones/M-001-local-mvp.md) is `Done`
- **Implementation:** every Feature's required Tasks are `Done`. **All 57 locked criteria carry verification against an approved delivery**, and the release run of 489 checks against one approved tree contradicts none of them
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013`, `F-014`, and `F-012` are `Done` in the order the Owner set on `2026-09-05`; `F-008` and `F-009` followed and are `Done` on `2026-09-06`
- **Approval rule:** since `2026-09-06`, [ADR-0028](docs/decisions/0028-replacements-inherit-task-approval.md) — the Owner approves a Task's first delivery once; replacements within scope inherit it

## Current focus

[`F-015`](docs/project/features/F-015-body-destination-and-today-entry.md) Body Destination and Today Entry, the first Feature of [`M-002`](docs/project/milestones/M-002-post-mvp-product-changes.md). Weight and body measurements become their own bottom-navigation destination that reads and corrects but never creates, and everything for today is entered on Today.

It revises three locked criteria and part of ADR-0003, which is why it is not in `M-001`: that Milestone is measured against the criteria this Feature changes. `M-001` is `Done` on what it delivered.

The release run passed 489 checks across five suites against exact approved delivery `9d8648d8dfd2acdc24cf60f8731d57821d6d75fb`: unit 237/237, components 4/4, pgTAP 187/187, repository 9/9, and the browser suite 52/52 on both phones. The Owner confirmed the visual comparison against the accepted references on 2026-09-06 and reported no deviation. Three documentation findings — `R1`, `R2`, and `R3` — were raised by the release reading, decided by the Owner, and closed by `T-049` and `T-050`.

## Immediate next action

Approve or reject exact `T-051` delivery `4108680d6e411544190d7c3a8e4cb2752c694c42`; `T-052` builds the destination against it.

## Now

1. [`T-046`](docs/project/tasks/T-046-verify-phone-interaction-and-affordances.md) — `Backlog`, Claude Code primary agent, `2026-09-06T17:04:00+02:00`; next action: move to `Ready` and write the sweep.

## Next

1. [`T-052`](docs/project/tasks/T-052-build-the-body-destination.md) — the fifth destination, the moved routes, and every spec the move invalidates.
2. [`T-053`](docs/project/tasks/T-053-add-todays-measurement-entry.md) — the `Body measurements` card and sheet on Today.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

- [`T-051`](docs/project/tasks/T-051-accept-the-body-destination.md) — exact delivery `4108680d6e411544190d7c3a8e4cb2752c694c42` — `ADR-0030`, five revised criteria, and the new `MVP-TOD-005`, `test_required: no`. Requested action: approve the exact commit.

## Approved — ready for testing

None.

## Recently completed Tasks

- [`T-048`](docs/project/tasks/T-048-run-release-verification-and-close-local-mvp.md) — completed `2026-09-06T18:52:00+02:00` — approved delivery `9d8648d8dfd2acdc24cf60f8731d57821d6d75fb` — the release run passed 489 checks across five suites against one approved tree on the first attempt, with matching generated types, a database identical to its baseline, and the Owner's confirmed visual comparison.
- [`T-046`](docs/project/tasks/T-046-verify-phone-interaction-and-affordances.md) — completed `2026-09-06T18:06:00+02:00` — first delivery `300db8bed59d9ce62057064a0dea51ed3ae054e0`, verified through inherited replacement `5c07096fb34801166ddb798345e3fd1b9eb3e117` — the sweep 10/10 with no application defect: 29 routes reflowing at four widths, numeric keyboards, named reorder controls, and six confirmed destructive actions; the whole suite 52/52.
- [`T-050`](docs/project/tasks/T-050-correct-the-reorder-and-current-set-language.md) — completed `2026-09-06T17:40:00+02:00` — approved delivery `17b12f4233282af479501fc9d0af50052d9ca39a` — five sentences requiring a drag handle the application never had, and the current-set sentence ADR-0027 left behind; `test_required: no`.
- [`T-045`](docs/project/tasks/T-045-verify-cross-feature-persistence.md) — completed `2026-09-06T17:04:00+02:00` — first delivery `e59d513da9db55f36655bb3ef9ceb5b3438b90f6`, verified through four inherited replacements ending at `a65a504b64482384c022175230176e983af66ce8` — the two release scenarios 4/4, unit 237/237, components 4/4, the whole browser suite 42/42, and a database identical to its baseline.
- [`T-044`](docs/project/tasks/T-044-close-discovered-release-corrections.md) — completed `2026-09-06T16:12:00+02:00` — first delivery `f2a46162b80e747c369e42e4c4e49854ae72cc42`, verified through inherited replacement `1bee438efe2a7fc4f9e3a399ccaf5ff27a465331` — unit 237/237, components 4/4, and the whole browser suite 38/38 on one production server, the durability spec running against a production build for the first time.
- [`T-049`](docs/project/tasks/T-049-correct-two-locked-mvp-criteria.md) — completed `2026-09-06T15:40:00+02:00` — approved delivery `6cffc618d03198b576374b71db47a6156a2a296d` — the `MVP-REL-002` navigation sentence, the `MVP-PRG-007` heading, the architecture document's focused-shell claim, and the ADR-0025 omission; `test_required: no`.
- [`T-043`](docs/project/tasks/T-043-record-release-verification-matrix.md) — completed `2026-09-06T15:24:00+02:00` — approved delivery `d79c08f5bfe3a8e7c796fdd9bb0fe943dea9c601` — the matrix covers 52 of 57 criteria from approved deliveries, names the 5 `F-010` owns as gaps, and found three stale sentences the Owner decided; `test_required: no`.
- [`T-042`](docs/project/tasks/T-042-build-body-mobile-experience.md) — completed `2026-09-06T14:26:11+02:00` — approved delivery `ae55dd3ef85ce31a692577620736b64a9abf7e54` — unit and component 235/235 and the Chromium and WebKit Body scenario 2/2 with eight structural captures, on the first run.
- [`T-040`](docs/project/tasks/T-040-add-todays-weight-prompt.md) — completed `2026-09-06T13:54:26+02:00` — first delivery `4992e617d3d367091332eb178525b2c61e35f0a5`, verified through inherited replacement `88abdad827a907fc93c61fd7851cd5d1736057a6` — unit and component 192/192 and the Chromium and WebKit Today scenario 4/4 with eight structural captures.
- [`T-039`](docs/project/tasks/T-039-build-weight-mobile-experience.md) — completed `2026-09-06T13:39:20+02:00` — first delivery `37cf5ee592bb6a4851050980c9f6c65a6a73ce0e`, verified through inherited replacement `d164327f20e2437d2662d8e0b73d38b519b76613` — unit and component 188/188 and the serialized Chromium and WebKit Weight scenario 2/2 with eight structural captures.

## Active work items

- [`M-002`](docs/project/milestones/M-002-post-mvp-product-changes.md) — Post-MVP Product Changes (`0/1 Features Done`)
- [`F-015`](docs/project/features/F-015-body-destination-and-today-entry.md) — Body Destination and Today Entry (`0/3 Tasks Done`)

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
