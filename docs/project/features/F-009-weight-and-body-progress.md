# F-009 — Weight and Body Progress

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Next`
- **Order:** 2
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-09-06T13:17:52+02:00`
- **Progress:** `1/5 required Tasks Done; T-039 is next`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

The user can record and analyze daily weight and user-defined body measurements with correct validation, lifecycle, calculations, and charts.

## Scope

- Included: primary ownership of `MVP-TOD-004`, `MVP-WGT-001` through `MVP-WGT-004`, and `MVP-BOD-001` through `MVP-BOD-004`; the Weight and Body subsections of History (`S19`–`S24`) replacing the `T-032` placeholder routes; the Today weight prompt and its `S04` sheet; every weight and body calculation.
- Excluded: nutrition and calorie tracking, inferred health recommendations, goals or targets, unit conversion, archiving of measurement types (removed by [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md)), and the History destination shell itself, which `F-008` delivered.

## Acceptance criteria

- Product criteria: `MVP-TOD-004`, `MVP-WGT-001` through `MVP-WGT-004`, and `MVP-BOD-001` through `MVP-BOD-004` pass their eventual approval-gated verification with local-date uniqueness and immediate recalculation.
- Product criteria that must keep passing unchanged: `MVP-TOD-001` through `MVP-TOD-003`, `MVP-HIS-001`, `MVP-REL-002`, and `MVP-UX-001`–`003`.
- Feature-specific criteria: every weekly value and every change is derived from canonical entries at read time with no authoritative aggregate table; an edit or deletion of any entry recalculates every affected value immediately; every chart has a textual summary or an accessible data list beside it; no increase or decrease is labelled good or bad.

## Tasks

Recorded on `2026-09-06` at the Owner's request, without committing or implementing anything. Operations precede the screens that depend on them, as in `F-005` through `F-008`.

| Order | Task | Delivers | Depends on |
| --- | --- | --- | --- |
| 1 | [`T-038`](../tasks/T-038-build-weight-operations.md) — Build weight operations (`Done`; approved replacement `f9edf3a4c3492faf672e12b2dc452d61898a21d7`) | Weight entry validation and writes, Monday–Sunday weekly derivation, chart series, weight queries | `F-004`, `T-033`, and `T-035` Done (schema, chart contract, range helper) |
| 2 | [`T-039`](../tasks/T-039-build-weight-mobile-experience.md) — Build Weight mobile experience | `S19`, `S20`, `O01` with the two-series chart | `T-032`, `T-034`, and `T-036` Done (shell, shared chart); `T-038` |
| 3 | [`T-040`](../tasks/T-040-add-todays-weight-prompt.md) — Add today's weight prompt to Today | The `S01` prompt and `S04` sheet of `MVP-TOD-004` | `T-038`, `T-039` |
| 4 | [`T-041`](../tasks/T-041-build-body-measurement-operations.md) — Build body measurement operations | Type lifecycle, entry validation and writes, change derivation, chart series, body queries | `F-004` Done; `T-038` for shared date rules |
| 5 | [`T-042`](../tasks/T-042-build-body-mobile-experience.md) — Build Body mobile experience | `S21`–`S24`, `O01` with chart | `T-032`, `T-039`, `T-041` |

`T-038` is `Done` and the remaining four are in `Backlog`. The breakdown was locked on `2026-09-06` after `F-008` completed, and the outcomes of `F-008` it absorbed are listed under the local decisions. `T-040` is separate because it changes the Today route, which has its own component tests and browser scenario, and because `MVP-TOD-004` is its own criterion; the Owner may merge it into `T-039` if fewer approval cycles matter more than that separation. `T-041` and `T-042` depend on the weight Tasks only for the shared date-rule and chart plumbing; the Owner may reorder Body before Weight, in which case the shared pieces move to `T-041` and `T-042`.

## Boundary against F-008

Accepted on `2026-09-05` as `F-008` readiness answer 6:

- `F-008` built the History destination shell with all five subsection entries in `T-032` and filled the Exercises and Splits subsections in `T-034` and `T-036`; `/history/weight` and `/history/body` are the last title-only placeholder routes.
- `F-009` replaces those placeholders with `S19`–`S24` and owns every weight and body calculation.
- Today's weight prompt (`MVP-TOD-004`) belongs to `F-009`; `T-015` left the weight surface intentionally absent from Today.

## Readiness answers

The Owner gave the go-ahead for the whole Feature on `2026-09-06` and amended no recommendation, which accepts every recommended answer below. They are decided. The Task named in the last column records each one in canonical documentation as part of its delivery.

| # | Question | Accepted answer | Recorded by |
| --- | --- | --- | --- |
| 1 | [`weight-and-body.md`](../../product/weight-and-body.md) says a measurement type has no archived state and cannot be deleted while it has entries, yet two lines later still says archiving preserves history and permits reactivation. The frozen design package also still carries archived states for `S21`–`S23` and `O05` on `S21`/`S22`. Remove the stale sentence and treat deletion as the only lifecycle action? | Yes. `T-041` removes the sentence; `S21`–`S23` carry no archived state or badge and `O05` does not apply, as `F-008` already decided for the exercise list; `S22` offers **Delete Type** only while the type has no entries and otherwise explains that its entries are the only record of the measurement, exactly what `MVP-BOD-001` states. | `T-041`, `T-042` |
| 2 | The design manifest gives `S22` an edit route, but the product document and `MVP-BOD-001` name only create and delete for a type. May a type be renamed? | Yes. Renaming changes only the name; entries are keyed by the type id and stay attached, and the unit stays `cm`. Record it as a local decision in the product document without changing the locked criterion. | `T-041`, `T-042` |
| 3 | `MVP-TOD-004` says that once today's entry exists the new-entry prompt is no longer shown as though another entry can be created. What does Today show instead: nothing, or today's recorded value? | Show today's recorded value in the same card with a link to `/history/weight` and no create control. The `S04` wireframe says "close or show the saved value on Today", and the link gives an accidental value one correction path through `S20` instead of a second create path. The strict-minimum alternative is to drop the card entirely. | `T-040` |

## Accepted local decisions

Accepted with the same go-ahead. The Executor records each in the canonical documents during the Task that touches it:

- weight and body live in the History feature under `src/features/history`, beside the exercise and split statistics, because they are History subsections under ADR-0003 and the shared chart component, chart contract, and range helper already live there; the entry-date validation and the local-date rules are written once, and the domain-model Progress section names the modules. The earlier `src/features/progress` idea was dropped when `T-034` and `T-036` placed the shared chart in History's `ui` module;
- `ChartRange`, `rangeStart`, and the chart contract of `T-033` and `T-035` are reused, not rewritten: `T-038` generalizes the contract so a point needs no workout id and a series can carry a companion series, and `T-039` teaches `ProgressChart` to draw that companion; the History callers stay unchanged;
- chart ranges are trailing windows ending on the configured local date, and `all` is unbounded, as `F-008` accepted; the weight `week` range is the trailing seven days, while weekly averages always use Monday–Sunday calendar weeks; the weekly-average series carries one point per calendar week intersecting the window with week start and end, average, recorded days, and the provisional flag, so the chart can draw it as a step or a marker without computing anything;
- the configured local date comes from the database read, computed from `app_settings.time_zone` as `get_today` and the future-date trigger already do, and every derivation takes it as an argument;
- entries are shown as entered, with up to two decimals; averages and changes are rounded to one decimal for display only, never in storage or derivation;
- the previous weigh-in and the preceding measurement are determined by date, not by creation time;
- the weight list and each measurement list load every entry newest first without pagination, because the single-user data stays small;
- the measurement type list is ordered alphabetically by name;
- date-keyed routes (`S20` and `S24` edit) validate their `YYYY-MM-DD` parameter with a helper beside `requireUuidRouteParam` and resolve failures through the shared not-found boundary;
- deleting an entry or a type requires `O01` confirmation; the type delete control is unavailable with an explanation while entries exist, and the database's refusal maps to the same message if the two race;
- `S04` creates only today's entry; corrections go through `S20`;
- the baseline seed gains no weight or measurement rows; pgTAP suites create their fixtures inside their transaction, and browser scenarios seed and remove their own rows;
- browser scenarios follow the `T-037` harness: they run against the production server, wait for hydration before the first entry after a navigation, and leave no rows behind;
- verification follows [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md): the Owner approves each Task's first delivery once, and in-scope replacements inherit it.

## Dependencies and blockers

- Dependencies: `F-003`, `F-004`, and `F-011` are `Done`, so the tables, the per-date uniqueness, the future-date trigger, and the unconditional type-name uniqueness exist; `F-008` is `Done` on `2026-09-06`, supplying the History shell, the Weight and Body placeholders, the shared chart component and contract, the range helper, and a runnable browser suite
- Blockers: None; the Owner answered the three readiness questions and gave the go-ahead for the whole Feature on `2026-09-06`

## Related decisions and documents

- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)
- Canonical documents: [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../product/overview.md`](../../product/overview.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified (`T-038` through `T-042`); `T-038` is `In Progress`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner answered the readiness questions and confirmed readiness on `2026-09-06` by giving the go-ahead for the whole Feature

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Created in `Next` | Keep body-progress tracking separate from workout statistics while remaining under History navigation |
| `2026-09-05T20:09:42+02:00` | User / Owner | Moved `Next / 7` to `Next / 4` | Reconfirmed the order `F-013`, `F-014`, `F-012`, `F-008` after `F-013` became the current focus |
| `2026-09-05T20:24:07+02:00` | User / Owner | Moved `Next / 4` to `Next / 3` | `F-014` became the current focus once `F-013` was confirmed |
| `2026-09-05T21:27:54+02:00` | User / Owner | Moved to `Next / 2` | `F-014` was confirmed, so `F-012` becomes the current focus |
| `2026-09-06T00:49:17+02:00` | Claude Code primary agent / Planner | Recorded the five-Task breakdown `T-038`–`T-042` in `Backlog`, three readiness questions with recommended answers, and the proposed local decisions | The Owner asked for the Tasks and directed that nothing is committed or implemented until they say so; `F-009` stays behind `F-008` |
| `2026-09-06T10:14:11+02:00` | User / Owner | Accepted that `T-038` entered git history through the `T-034` delivery `b5772adb87d244bfc2404481e90f58a4046a7767` | That delivery was staged with `git add -A` while this breakdown was held uncommitted; the Owner let the commit stand rather than replace it, so `T-038` is tracked ahead of its siblings |
| `2026-09-06T12:22:31+02:00` | Claude Code primary agent / Planner | Locked the breakdown after `F-008` completed: aligned the five Tasks with ADR-0028, the shared History chart and range helper, and the `T-037` browser harness; recorded the registry, dashboard, milestone, and project state | The Owner asked to fold in any `F-008` outcome that affects the plan and then lock, commit, and push it; the readiness questions stay open for the go-ahead |
| `2026-09-06T12:39:15+02:00` | User / Owner | Accepted every recommended readiness answer and local decision, confirmed Feature readiness, and gave the go-ahead | Replied `potvrda` without amending any recommendation, which decides the archiving sentence, the measurement-type rename, and the Today weight card |
| `2026-09-06T12:39:15+02:00` | Claude Code primary agent / Executor | Moved `T-038` to `Ready` and started it | Operations precede the screens that depend on them; one Task is `In Progress` at a time |
| `2026-09-06T13:15:07+02:00` | Claude Code primary agent / Executor | Delivered `T-038` for review | Exact delivery `94196f3be1f8f7b47b204637a16cc30d0520e916` awaits the Owner's approval before any feature test runs |
| `2026-09-06T13:05:56+02:00` | User / Approver | Approved `T-038` | Authorized the recorded verification against exact delivery `94196f3be1f8f7b47b204637a16cc30d0520e916` |
| `2026-09-06T13:12:11+02:00` | Claude Code primary agent / Tester and Executor | Delivered the `T-038` replacement | The authorized verification found a missing helper grant; `f9edf3a4c3492faf672e12b2dc452d61898a21d7` corrects it and inherits the Task approval |
| `2026-09-06T13:17:52+02:00` | Claude Code primary agent / Tester | Completed `T-038` | The complete plan passed: unit 174/174, pgTAP 157/157, repository 8/8, matching types, and a faithful restore |
