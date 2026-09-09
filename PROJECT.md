# Project dashboard

- **Last updated:** 2026-09-09T11:50:00+02:00
- **Current phase:** **Deployed and in use, with workout usability refinements in progress.** `M-001` and `M-002` remain complete; `M-003` refines Today and active-workout density without changing workout semantics.
- **Current Milestone:** [`M-003`](docs/project/milestones/M-003-workout-usability-refinements.md) — Workout Usability Refinements
- **Implementation:** every Feature's required Tasks are `Done`. **All 57 locked criteria carry verification against an approved delivery**, and the release run of 489 checks against one approved tree contradicts none of them
- **Canonical registry:** [`docs/project/INDEX.md`](docs/project/INDEX.md)
- **Working order:** `F-013`, `F-014`, and `F-012` are `Done` in the order the Owner set on `2026-09-05`; `F-008` and `F-009` followed and are `Done` on `2026-09-06`
- **Approval rule:** since `2026-09-06`, [ADR-0028](docs/decisions/0028-replacements-inherit-task-approval.md) — the Owner approves a Task's first delivery once; replacements within scope inherit it
- **Production:** Vercel plus a hosted Supabase project running the same 25 migrations, gated by one shared password under [ADR-0031](docs/decisions/0031-shared-password-protects-the-hosted-application.md). Data is backed up only by running `npm run db:backup`; the free plan takes none on its own

## Current focus

[`F-016`](docs/project/features/F-016-today-preview-and-workout-density.md) — Today Preview and Workout Density. [`T-054`](docs/project/tasks/T-054-refine-today-and-active-workout-density.md) is `In Progress`.

## Immediate next action

Implement `T-054`, update canonical documentation and prepared tests, run static checks only, then deliver the exact commit for review. Feature tests remain approval-gated.

- the unit-test name `apply_active_workout_command.test.ts:131` still says `confirmed sets` while its case checks a malformed payload, the last ADR-0027 leftover, reported by [`T-044`](docs/project/tasks/T-044-close-discovered-release-corrections.md);
- a command queued for a workout that no longer exists is sent and refused rather than discarded on sight, so the user is told about a change that no longer concerns them;
- the production deployment has no written workflow of its own: which environment variables the Vercel project holds, and that a schema change now needs `supabase db push` against the hosted project as well as locally, are recorded only in [ADR-0031](docs/decisions/0031-shared-password-protects-the-hosted-application.md) and [`local-database-workflow.md`](docs/architecture/local-database-workflow.md);
- the ignored `.env.deploy.local` holds the hosted database password and service-role key on the Owner's machine, and nothing decides whether it stays.

## Now

`T-054` — Today split preview and compact, collapsible active-workout cards.

## Next

None.

## Later

No formal Later work items. See the [complete registry](docs/project/INDEX.md).

## Blocked

None.

## Awaiting approval

None.

## Approved — ready for testing

None.

## Recently completed Tasks

- [`T-053`](docs/project/tasks/T-053-add-todays-measurement-entry.md) — completed `2026-09-06T22:32:00+02:00` — approved delivery `c5417723e42e2d04e172fc6f754284fd11ed23df` — unit 241/241, pgTAP 191/191, repository 9/9, and the whole browser suite 52/52, on the first run, with a database identical to its baseline.
- [`T-052`](docs/project/tasks/T-052-build-the-body-destination.md) — completed `2026-09-06T21:04:00+02:00` — first delivery `c7daf2154aa36097bd0a17034ad3a81fed0c7bff`, verified through three inherited replacements ending at `109d2a0d3a1155620b4971ea8767561165e584ec` — the whole browser suite 52/52, unit 237/237, components 4/4, and a database identical to its baseline.
- [`T-048`](docs/project/tasks/T-048-run-release-verification-and-close-local-mvp.md) — completed `2026-09-06T18:52:00+02:00` — approved delivery `9d8648d8dfd2acdc24cf60f8731d57821d6d75fb` — the release run passed 489 checks across five suites against one approved tree on the first attempt, with matching generated types, a database identical to its baseline, and the Owner's confirmed visual comparison.
- [`T-046`](docs/project/tasks/T-046-verify-phone-interaction-and-affordances.md) — completed `2026-09-06T18:06:00+02:00` — first delivery `300db8bed59d9ce62057064a0dea51ed3ae054e0`, verified through inherited replacement `5c07096fb34801166ddb798345e3fd1b9eb3e117` — the sweep 10/10 with no application defect: 29 routes reflowing at four widths, numeric keyboards, named reorder controls, and six confirmed destructive actions; the whole suite 52/52.
- [`T-050`](docs/project/tasks/T-050-correct-the-reorder-and-current-set-language.md) — completed `2026-09-06T17:40:00+02:00` — approved delivery `17b12f4233282af479501fc9d0af50052d9ca39a` — five sentences requiring a drag handle the application never had, and the current-set sentence ADR-0027 left behind; `test_required: no`.
- [`T-045`](docs/project/tasks/T-045-verify-cross-feature-persistence.md) — completed `2026-09-06T17:04:00+02:00` — first delivery `e59d513da9db55f36655bb3ef9ceb5b3438b90f6`, verified through four inherited replacements ending at `a65a504b64482384c022175230176e983af66ce8` — the two release scenarios 4/4, unit 237/237, components 4/4, the whole browser suite 42/42, and a database identical to its baseline.
- [`T-044`](docs/project/tasks/T-044-close-discovered-release-corrections.md) — completed `2026-09-06T16:12:00+02:00` — first delivery `f2a46162b80e747c369e42e4c4e49854ae72cc42`, verified through inherited replacement `1bee438efe2a7fc4f9e3a399ccaf5ff27a465331` — unit 237/237, components 4/4, and the whole browser suite 38/38 on one production server, the durability spec running against a production build for the first time.
- [`T-049`](docs/project/tasks/T-049-correct-two-locked-mvp-criteria.md) — completed `2026-09-06T15:40:00+02:00` — approved delivery `6cffc618d03198b576374b71db47a6156a2a296d` — the `MVP-REL-002` navigation sentence, the `MVP-PRG-007` heading, the architecture document's focused-shell claim, and the ADR-0025 omission; `test_required: no`.
- [`T-043`](docs/project/tasks/T-043-record-release-verification-matrix.md) — completed `2026-09-06T15:24:00+02:00` — approved delivery `d79c08f5bfe3a8e7c796fdd9bb0fe943dea9c601` — the matrix covers 52 of 57 criteria from approved deliveries, names the 5 `F-010` owns as gaps, and found three stale sentences the Owner decided; `test_required: no`.
- [`T-042`](docs/project/tasks/T-042-build-body-mobile-experience.md) — completed `2026-09-06T14:26:11+02:00` — approved delivery `ae55dd3ef85ce31a692577620736b64a9abf7e54` — unit and component 235/235 and the Chromium and WebKit Body scenario 2/2 with eight structural captures, on the first run.
- [`T-040`](docs/project/tasks/T-040-add-todays-weight-prompt.md) — completed `2026-09-06T13:54:26+02:00` — first delivery `4992e617d3d367091332eb178525b2c61e35f0a5`, verified through inherited replacement `88abdad827a907fc93c61fd7851cd5d1736057a6` — unit and component 192/192 and the Chromium and WebKit Today scenario 4/4 with eight structural captures.

## Active work items

None; every Milestone, Feature, and Task is terminal.

Detailed phase state and unresolved product/technical decisions remain in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).
