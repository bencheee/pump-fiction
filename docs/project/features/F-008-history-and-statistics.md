# F-008 — History and Statistics

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Next`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-09-05T22:44:18+02:00`
- **Progress:** `0/6 required Tasks Done; T-031 is Testing`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

History owns reliable workout records, corrections/deletion, exercise PRs and charts, split statistics, and recalculation from eligible snapshot data.

## Scope

- Included: primary ownership of `MVP-HIS-001` through `MVP-HIS-011`; the History destination shell with its five subsection entries; the Workouts, Exercises, and Splits subsections (`S13`–`S18`); support for the release-level `MVP-REL-004` verification owned by `F-010`.
- Excluded: the Weight and Body subsection content (`S19`–`S24`, owned by `F-009`), template mutation from historical actions, unaccepted derived metrics such as estimated 1RM or RIR/RPE, and any change to the active-workout command flow.

## Acceptance criteria

- Product criteria: `MVP-HIS-001` through `MVP-HIS-011` pass their eventual approval-gated verification and preserve persistent identities and eligibility rules.
- Product criteria that must keep passing unchanged: `MVP-WRK-006` (Last time reflects historical corrections), `MVP-WRK-012`, `MVP-PRG-005`, `MVP-PRG-006`, `MVP-EXE-008`, and `MVP-UX-001`–`003`.
- Feature-specific criteria: every statistic is derived from canonical History at read time with no authoritative aggregate table; a historical correction or deletion changes no template row and no rotation pointer; every chart has a textual summary or an accessible data list beside it.

## Tasks

Recorded on `2026-09-05` at the Owner's request, without starting implementation. Operations precede the screens that depend on them, as in `F-005` through `F-007`.

| Order | Task | Delivers | Depends on |
| --- | --- | --- | --- |
| 1 | [`T-031`](../tasks/T-031-build-workout-history-operations.md) — Build workout History operations | Workout list and detail queries, correction and deletion transactions, completion-status change | `F-007` and `F-014` Done |
| 2 | [`T-032`](../tasks/T-032-build-workout-history-mobile-experience.md) — Build the History shell and workout History mobile experience | Subsection navigation, `S13`, `S14`, `O01`, `O06` | `T-031` |
| 3 | [`T-033`](../tasks/T-033-build-exercise-statistics-operations.md) — Build exercise statistics operations | Eligibility, PR derivation, chart series, exercise history queries | `T-031` |
| 4 | [`T-034`](../tasks/T-034-build-exercise-history-mobile-experience.md) — Build Exercise History mobile experience | `S15`, `S16` with chart | `T-032`, `T-033` |
| 5 | [`T-035`](../tasks/T-035-build-split-statistics-operations.md) — Build split statistics operations | Split identity, duration statistics, chart series, split history queries | `T-031` |
| 6 | [`T-036`](../tasks/T-036-build-split-history-mobile-experience.md) — Build Split History mobile experience | `S17`, `S18` with chart | `T-032`, `T-035` |

All six are in `Backlog`. `T-033` and `T-035` depend on `T-031` only for the identity decision in readiness question 1; if the Owner chooses the snapshot-only answer, they depend on nothing beyond `F-007`. The Owner may merge `T-035` and `T-036` into one Task if fewer approval cycles matter more than the operations-before-screens split.

## Boundary against F-009

Accepted on `2026-09-05` with the Owner's go-ahead for the whole Feature:

- `F-008` builds the History destination shell: the subsection navigation with all five entries, on top of the `/history` redirect that already exists. `T-032` delivers it together with `S13`.
- The Weight and Body entries lead to title-only placeholder routes, exactly as `/history/workouts` is a placeholder today. `F-009` replaces them with `S19`–`S24` and owns every weight and body calculation.
- Today's weight prompt (`MVP-TOD-004`) stays with `F-009`.

## Readiness answers

The Owner gave the go-ahead for the whole Feature on `2026-09-05` and amended no recommendation, which accepts every recommended answer below. They are decided. The Task named in the last column records each one in canonical documentation as part of its delivery.

| # | Question | Accepted answer | Recorded by |
| --- | --- | --- | --- |
| 1 | `MVP-HIS-005` combines performances by persistent exercise identity, but [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md) nulls `workout_exercises.exercise_id` when the definition is deleted, so the identity is lost exactly when it is needed. Keep a never-nulled identity snapshot, or group deleted exercises by snapshotted name and type? | Add an `exercise_identity_id` column copied at snapshot time and never nulled, and a matching `source_split_identity_id` on `workouts`; record both as an amendment to ADR-0024 in `T-031`. | `T-031`, `T-033`, `T-035` |
| 2 | Should splits whose template was deleted still appear in Split History under their snapshotted program and split names? | Yes, using the identity snapshot from question 1; `MVP-HIS-011` rests on persistent split identity and History never loses records. | `T-035`, `T-036` |
| 3 | When a historical workout's start and finish are edited, does active duration stay the recorded accumulated value, or is it recomputed from the new timestamps? | It stays the recorded value and is not editable; paused time cannot be reconstructed after the fact, and `history-and-statistics.md` lists only date, start, and finish as editable. | `T-031`, `T-032` |
| 4 | May a completed workout be marked incomplete again, or only incomplete → completed as `workouts.md` states? | Only incomplete → completed; the reverse is unspecified and would silently withdraw statistics. | `T-031`, `T-032` |
| 5 | Historical corrections run as ordinary transactional server actions with the generic retry contract, not through the active-workout command outbox. Confirm? | Confirm, and record it as a local decision in `server-data-boundaries.md` without a new ADR. | `T-031` |
| 6 | The History shell boundary above. | Confirm as proposed. | `T-032`, `F-009` |

## Accepted local decisions

Accepted with the same go-ahead. The Executor records each in the canonical documents during the Task that touches it:

- the performed exercise count on `S13` counts exercise occurrences with at least one recorded set;
- month grouping and latest-performance dates use `workout_date`, which is already stored in the configured local time zone;
- the Exercise History list includes every exercise identity with at least one recorded set in any History workout; performances from incomplete workouts appear in the detail list marked as excluded from statistics and never feed PRs or charts;
- highest reps at each weight is derived per distinct weight value; `S16` shows the entry for the highest weight of the category and the rest in the accessible data list;
- chart ranges are trailing windows ending today in the configured time zone; `all` is unbounded;
- a deleted definition is marked in the exercise list as no longer in the library, replacing the retired archived badge of `O05`;
- searching the exercise list filters client-side on the loaded list, which stays small for one user.

## Dependencies and blockers

- Dependencies: `F-003` through `F-007`, `F-011`, and `F-014` are `Done`; the recorded-set rule of [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md) and the deletion model of [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md) are the model History reads
- Blockers: None; the Owner released the hold and gave the go-ahead for the whole Feature on `2026-09-05`

## Related decisions and documents

- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md)
- ADRs possibly amended: [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), if readiness question 1 adds the identity snapshot
- Canonical documents: [`../../product/history-and-statistics.md`](../../product/history-and-statistics.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified (`T-031` through `T-036`); `T-031` is `In Progress`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner answered the readiness questions and confirmed readiness on `2026-09-05` by giving the go-ahead for the whole Feature

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Created in `Next` | Assign primary ownership for workout, exercise, and split History |
| `2026-09-05T20:09:42+02:00` | User / Owner | Moved `Next / 6` to `Next / 3` | Reconfirmed the order `F-013`, `F-014`, `F-012`, `F-008` after `F-013` became the current focus |
| `2026-09-05T20:24:07+02:00` | User / Owner | Moved `Next / 3` to `Next / 2` | `F-014` became the current focus once `F-013` was confirmed |
| `2026-09-05T21:27:54+02:00` | User / Owner | Moved to `Next / 1` | `F-014` was confirmed, so `F-012` becomes the current focus |
| `2026-09-05T21:58:22+02:00` | Claude Code primary agent / Planner | Recorded the six-Task breakdown `T-031`–`T-036` in `Backlog`, the `F-009` boundary proposal, six readiness questions, and the proposed local decisions | The Owner asked for the Tasks without starting implementation; `F-008` stays held |
| `2026-09-05T22:02:36+02:00` | User / Owner | Released the hold, accepted every recommended readiness answer and local decision, and confirmed Feature readiness | Gave the go-ahead to implement the whole `F-008` without amending any recommendation |
| `2026-09-05T22:02:36+02:00` | Claude Code primary agent / Executor | Moved `T-031` to `Ready` and started it | Operations precede the screens that depend on them; one Task is `In Progress` at a time |
| `2026-09-05T22:22:36+02:00` | Claude Code primary agent / Executor | Delivered `T-031` for review | Exact delivery `95de9212848755c956cb0dc5d50b5cfc8796dc27` awaits the Owner's approval before any feature test runs |
| `2026-09-05T22:25:34+02:00` | User / Approver | Approved `T-031` | Authorized only the recorded verification against the exact delivery |
| `2026-09-05T22:29:27+02:00` | Claude Code primary agent / Tester | Returned `T-031` to `In Progress` | Two prepared pgTAP suites failed on test-source defects; a replacement needs fresh approval |
| `2026-09-05T22:33:33+02:00` | Claude Code primary agent / Executor | Delivered the `T-031` replacement | Exact replacement `b5e4cda609d478453eccd562087d1f18bfec7f54` corrects only test source and one sentence, and awaits fresh approval |
| `2026-09-05T22:35:56+02:00` | User / Approver | Approved the `T-031` replacement | Authorized the complete recorded plan from the beginning against the exact replacement |
| `2026-09-05T22:39:55+02:00` | Claude Code primary agent / Tester | Returned `T-031` to `In Progress` | pgTAP, unit, and type checks passed; the parallel repository script collided on the shared database |
| `2026-09-05T22:41:38+02:00` | Claude Code primary agent / Executor | Delivered the `T-031` second replacement | Exact replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` serializes the repository script and awaits fresh approval |
| `2026-09-05T22:44:18+02:00` | User / Approver | Approved the `T-031` second replacement | Authorized the complete recorded plan from the beginning |
