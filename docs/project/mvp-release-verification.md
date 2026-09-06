# MVP release verification

- **Status:** Living record, opened by [`T-043`](tasks/T-043-record-release-verification-matrix.md) on `2026-09-06` and completed for `M-001` by [`T-048`](tasks/T-048-run-release-verification-and-close-local-mvp.md). `M-002` revises some of these criteria; the section below says which.
- **Purpose:** show, for each of the 57 locked criteria in [`../product/mvp-acceptance-criteria.md`](../product/mvp-acceptance-criteria.md), which approved delivery already verified it and what release-level work remains.

This is a verification record, not product specification. The locked criteria document remains canonical for what each criterion means, and the Task files remain canonical for what their verification found. This document adds no behavior and restates no result.

## How to read it

- **Owner** is the Feature holding primary ownership, as [`milestones/M-001-local-mvp.md`](milestones/M-001-local-mvp.md) assigns it.
- **Delivered by** names the Tasks that built the criterion, and the later Task that revised it where an accepted decision changed its behavior.
- **Approved delivery** is the exact commit the Owner approved, which is what authorized the verification recorded in that Task. Where an in-scope replacement carried the verification under [ADR-0028](../decisions/0028-replacements-inherit-task-approval.md), the approval stands on this commit and the Task record names the replacement; this table does not duplicate that chain, so it cannot drift from it.
- **Release status** is either `covered`, with the release-level re-check that still touches it, or `gap`, naming the `F-010` Task that closes it.

## What the release run is

`T-048` runs the complete suite once, against one exact approved tree, after a clean reset and with the Owner's data snapshotted and restored: `npm run test:unit`, `npm run test:components`, `npm run test:db`, `npm run test:repository`, and `npm run test:browser`.

Each criterion already passed an authorized verification against its own approved delivery, and those records are durable. The release run proves the one thing no earlier run could: that the Features hold together on a single tree. It does not re-derive per-criterion evidence, and it never runs before the Owner approves the `T-048` delivery.

## What the fidelity comparison is

The accepted-reference visual comparison is the Owner's own. `F-010` allocates no Task for it — [`T-047`](tasks/T-047-compare-against-accepted-visual-references.md) is `Canceled` — and `T-048` records what the Owner reports: the date, what it covered, the outcome, and any deviation they accept. The repository claims no comparison it did not run. The constraints that comparison works under are recorded in [`features/F-010-local-mvp-integration.md`](features/F-010-local-mvp-integration.md).

## Findings for the Owner

Reading all 57 criteria against the delivered application surfaced two disagreements between the locked document and accepted decisions. The Owner decided both on `2026-09-06`, the same day, and [`T-049`](tasks/T-049-correct-two-locked-mvp-criteria.md) delivered the corrections — in both cases the application stood and the document moved.

- **R1 — `MVP-REL-002` contradicts ADR-0025.** Its second sentence still reads `An active workout uses a focused screen without that bottom navigation.` [ADR-0025](../decisions/0025-active-workout-in-the-main-shell.md), accepted on `2026-09-05` after the Owner used the application, moved the active workout into the main shell so the four destinations stay reachable throughout a workout, and [`T-024`](tasks/T-024-keep-primary-navigation-during-workout.md) delivered exactly that. The ADR lists the criteria that keep their text — `MVP-WRK-005`, `MVP-WRK-010`, `MVP-TOD-001`, `MVP-UX-001` — but does not mention `MVP-REL-002`, whose second sentence it supersedes. The delivered behavior is the accepted one; the criterion text was never updated. It was the only place where a locked criterion stated the opposite of what the application does. **Resolved** by `T-049`: the Owner decided `donja navigacija se uvijek mora vidjeti`, so the criterion now states that the navigation stays visible during a workout, ADR-0025 names the criterion it superseded, and the architecture document's surviving `focused shells` claim is corrected with it.
- **R3 — `MVP-UX-002` and `MVP-PRG-003` require an affordance that has never existed, and one sentence ADR-0027 left behind.** Five sentences across four documents required a visible drag handle for reordering; every reorderable list in the application offers a pair of named 44 by 44 arrow buttons instead, and always has. `MVP-UX-002` also opened with `The current set is visibly distinct.`, a concept [ADR-0027](../decisions/0027-a-set-is-recorded-by-its-values.md) removed along with set confirmation. Found by [`T-046`](tasks/T-046-verify-phone-interaction-and-affordances.md) while reading the application for those affordances, before it wrote a line of its sweep. **Resolved** by [`T-050`](tasks/T-050-correct-the-reorder-and-current-set-language.md): the Owner decided on `2026-09-06` that the named controls are correct and the current-set sentence is a leftover, so all five sentences describe what the application does and ADR-0027 names the criterion it affected.
- **R2 — `MVP-PRG-007` keeps an archiving heading.** The heading still reads `Archive a split` while its body correctly describes deletion under [ADR-0024](../decisions/0024-deletion-with-preserved-history.md), which [`T-021`](tasks/T-021-replace-archiving-with-deletion-in-data.md) delivered. Cosmetic, and it misdescribed nothing in the body. **Resolved** by `T-049`: the Owner decided `nema arhiviranja`, so the heading reads `Delete a split` and the body is unchanged.

All three are closed, so `T-048` inherits no known disagreement from this reading; its own documentation sweep still has to confirm that nothing new appeared.

## Criteria revised after M-001

`M-001` closed on `2026-09-06` with all 57 criteria verified. [ADR-0030](../decisions/0030-body-is-its-own-destination.md) then revised five of them and added a sixth, delivered by [`T-051`](tasks/T-051-accept-the-body-destination.md).

The evidence in the table below is **not discarded**: it remains true of the behavior it verified, which is what `M-001` delivered and what the application still does until `F-015` changes it. What the table no longer claims is that this evidence covers the revised text. Re-verification against the new text belongs to [`T-052`](tasks/T-052-build-the-body-destination.md) and [`T-053`](tasks/T-053-add-todays-measurement-entry.md).

| Criterion | Revised to | Re-verified by |
| --- | --- | --- |
| `MVP-REL-002` | Five destinations, Body among them | `T-052` |
| `MVP-HIS-001` | History contains Workouts, Exercises, and Splits | `T-052` |
| `MVP-WGT-001` | Today creates; Body edits and deletes; no retrospective creation | `T-052`, `T-053` |
| `MVP-BOD-001` | The unit is a label, not a field | `T-052` |
| `MVP-BOD-002` | The same move as `MVP-WGT-001` | `T-052`, `T-053` |
| `MVP-TOD-005` | New: Today's measurement prompt | `T-053` |

## Criteria

| Criterion | Owner | Delivered by | Approved delivery | Release status |
| --- | --- | --- | --- | --- |
| `MVP-REL-001` | `F-004` | [`T-006`](tasks/T-006-establish-local-database-schema.md), [`T-009`](tasks/T-009-build-mobile-shell-and-ui-foundation.md) | `a5cf25925aab` | covered; `T-046` re-checks the phone-only boundary across every route |
| `MVP-REL-002` | `F-004` | [`T-009`](tasks/T-009-build-mobile-shell-and-ui-foundation.md), revised by [`T-024`](tasks/T-024-keep-primary-navigation-during-workout.md) under ADR-0025, text corrected by [`T-049`](tasks/T-049-correct-two-locked-mvp-criteria.md) | `ded6f9f73e59` | covered; finding `R1` resolved, and `T-046` re-checks the corrected navigation rule |
| `MVP-REL-003` | `F-010` | persistence foundation [`T-008`](tasks/T-008-build-active-workout-durability.md); release evidence by [`T-045`](tasks/T-045-verify-cross-feature-persistence.md) | `e59d513da9db55f36655bb3ef9ceb5b3438b90f6` | covered; one dataset touching every category read back after a reload and from a freshly opened context |
| `MVP-REL-004` | `F-010` | snapshot model [`T-014`](tasks/T-014-build-today-and-workout-operations.md); release evidence by [`T-045`](tasks/T-045-verify-cross-feature-persistence.md) | `e59d513da9db55f36655bb3ef9ceb5b3438b90f6` | covered; definition edit, definition deletion, split deletion, and a historical correction all leave the saved snapshots standing |
| `MVP-TOD-001` | `F-007` | [`T-014`](tasks/T-014-build-today-and-workout-operations.md), [`T-015`](tasks/T-015-build-today-and-workout-start-mobile-experience.md) | `f52c0447db67` | covered |
| `MVP-TOD-002` | `F-007` | [`T-014`](tasks/T-014-build-today-and-workout-operations.md), [`T-015`](tasks/T-015-build-today-and-workout-start-mobile-experience.md) | `f52c0447db67` | covered |
| `MVP-TOD-003` | `F-007` | [`T-015`](tasks/T-015-build-today-and-workout-start-mobile-experience.md), corrected by [`T-017`](tasks/T-017-correct-one-time-workout-starter-sets.md) | `8d5779258505` | covered |
| `MVP-TOD-004` | `F-009` | [`T-038`](tasks/T-038-build-weight-operations.md), [`T-040`](tasks/T-040-add-todays-weight-prompt.md) | `4992e617d3d3` | covered |
| `MVP-EXE-001` | `F-005` | [`T-010`](tasks/T-010-build-exercise-library-operations.md), [`T-011`](tasks/T-011-build-exercise-library-mobile-experience.md), revised by [`T-019`](tasks/T-019-simplify-exercise-load-mode-model.md) and [`T-028`](tasks/T-028-merge-assisted-into-bodyweight.md) | `14fdd0ac8785` | covered |
| `MVP-EXE-002` | `F-005` | [`T-010`](tasks/T-010-build-exercise-library-operations.md), [`T-011`](tasks/T-011-build-exercise-library-mobile-experience.md), [`T-025`](tasks/T-025-allow-partial-band-set-entry.md) | `e0fe573dedfe` | covered |
| `MVP-EXE-003` | `F-005` | [`T-011`](tasks/T-011-build-exercise-library-mobile-experience.md), revised by [`T-019`](tasks/T-019-simplify-exercise-load-mode-model.md) and [`T-028`](tasks/T-028-merge-assisted-into-bodyweight.md) | `14fdd0ac8785` | covered |
| `MVP-EXE-004` | `F-005` | [`T-011`](tasks/T-011-build-exercise-library-mobile-experience.md), revised by [`T-019`](tasks/T-019-simplify-exercise-load-mode-model.md) and [`T-028`](tasks/T-028-merge-assisted-into-bodyweight.md) | `14fdd0ac8785` | covered |
| `MVP-EXE-005` | `F-005` | [`T-010`](tasks/T-010-build-exercise-library-operations.md), [`T-025`](tasks/T-025-allow-partial-band-set-entry.md), [`T-033`](tasks/T-033-build-exercise-statistics-operations.md) | `d1f15d90151d` | covered |
| `MVP-EXE-006` | `F-005` | [`T-010`](tasks/T-010-build-exercise-library-operations.md), [`T-011`](tasks/T-011-build-exercise-library-mobile-experience.md), [`T-023`](tasks/T-023-correct-active-workout-screen-details.md) | `f72e7dde3bcc` | covered; `T-045` re-checks that a library edit leaves the snapshot note alone |
| `MVP-EXE-007` | `F-005` | [`T-011`](tasks/T-011-build-exercise-library-mobile-experience.md) | `c700a78421eb` | covered |
| `MVP-EXE-008` | `F-005` | [`T-011`](tasks/T-011-build-exercise-library-mobile-experience.md), replaced by [`T-021`](tasks/T-021-replace-archiving-with-deletion-in-data.md) under ADR-0024 | `a049287a74a7` | covered; `T-045` re-checks that deletion leaves every snapshot and statistic intact |
| `MVP-PRG-001` | `F-006` | [`T-012`](tasks/T-012-build-program-and-split-operations.md), [`T-013`](tasks/T-013-build-programs-mobile-experience.md), revised by [`T-021`](tasks/T-021-replace-archiving-with-deletion-in-data.md) | `a049287a74a7` | covered |
| `MVP-PRG-002` | `F-006` | [`T-012`](tasks/T-012-build-program-and-split-operations.md), [`T-013`](tasks/T-013-build-programs-mobile-experience.md) | `000a62a70fbf` | covered |
| `MVP-PRG-003` | `F-006` | [`T-013`](tasks/T-013-build-programs-mobile-experience.md), affordance text corrected by [`T-050`](tasks/T-050-correct-the-reorder-and-current-set-language.md) | `000a62a70fbf` | covered; finding `R3` resolved, and `T-046` re-checks the named controls and the auto-saved order |
| `MVP-PRG-004` | `F-006` | [`T-012`](tasks/T-012-build-program-and-split-operations.md), [`T-013`](tasks/T-013-build-programs-mobile-experience.md) | `000a62a70fbf` | covered |
| `MVP-PRG-005` | `F-006` | [`T-012`](tasks/T-012-build-program-and-split-operations.md), [`T-014`](tasks/T-014-build-today-and-workout-operations.md), [`T-031`](tasks/T-031-build-workout-history-operations.md) | `c00c6e92072c` | covered; `T-045` re-checks that a historical change never moves rotation |
| `MVP-PRG-006` | `F-006` | [`T-012`](tasks/T-012-build-program-and-split-operations.md), [`T-014`](tasks/T-014-build-today-and-workout-operations.md), [`T-031`](tasks/T-031-build-workout-history-operations.md) | `c00c6e92072c` | covered |
| `MVP-PRG-007` | `F-006` | [`T-013`](tasks/T-013-build-programs-mobile-experience.md), replaced by [`T-021`](tasks/T-021-replace-archiving-with-deletion-in-data.md) under ADR-0024, heading corrected by [`T-049`](tasks/T-049-correct-two-locked-mvp-criteria.md) | `a049287a74a7` | covered; finding `R2` resolved |
| `MVP-WRK-001` | `F-007` | [`T-014`](tasks/T-014-build-today-and-workout-operations.md), [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md) | `441a87046409` | covered; `T-045` re-checks snapshot stability against definition edits |
| `MVP-WRK-002` | `F-007` | [`T-014`](tasks/T-014-build-today-and-workout-operations.md), [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md), corrected by [`T-017`](tasks/T-017-correct-one-time-workout-starter-sets.md) | `8d5779258505` | covered |
| `MVP-WRK-003` | `F-007` | [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md), revised by [`T-020`](tasks/T-020-derive-per-set-load-from-definition.md), [`T-025`](tasks/T-025-allow-partial-band-set-entry.md), and [`T-029`](tasks/T-029-record-a-set-by-its-values.md) | `9374b8c23f55` | covered |
| `MVP-WRK-004` | `F-007` | [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md), revised by [`T-029`](tasks/T-029-record-a-set-by-its-values.md), hardened by [`T-026`](tasks/T-026-recover-from-rejected-command.md) | `9374b8c23f55` | covered |
| `MVP-WRK-005` | `F-007` | [`T-008`](tasks/T-008-build-active-workout-durability.md), [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md), [`T-023`](tasks/T-023-correct-active-workout-screen-details.md), [`T-024`](tasks/T-024-keep-primary-navigation-during-workout.md) | `441a87046409` | covered; `T-045` re-checks the restore across a reload and a reopen |
| `MVP-WRK-006` | `F-007` | [`T-014`](tasks/T-014-build-today-and-workout-operations.md), [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md), [`T-031`](tasks/T-031-build-workout-history-operations.md) | `441a87046409` | covered; `T-045` re-checks **Last time** after a historical correction |
| `MVP-WRK-007` | `F-007` | [`T-014`](tasks/T-014-build-today-and-workout-operations.md), [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md) | `441a87046409` | covered |
| `MVP-WRK-008` | `F-007` | [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md) | `441a87046409` | covered |
| `MVP-WRK-009` | `F-007` | [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md) | `441a87046409` | covered; `T-046` re-checks the populated-data confirmation |
| `MVP-WRK-010` | `F-007` | [`T-014`](tasks/T-014-build-today-and-workout-operations.md), [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md), [`T-024`](tasks/T-024-keep-primary-navigation-during-workout.md) | `441a87046409` | covered |
| `MVP-WRK-011` | `F-007` | [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md), [`T-023`](tasks/T-023-correct-active-workout-screen-details.md), revised by [`T-029`](tasks/T-029-record-a-set-by-its-values.md) | `9374b8c23f55` | covered; [`T-044`](tasks/T-044-close-discovered-release-corrections.md) corrects the review's stale `Confirmed sets` sentence |
| `MVP-WRK-012` | `F-007` | [`T-014`](tasks/T-014-build-today-and-workout-operations.md), [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md) | `441a87046409` | covered |
| `MVP-HIS-001` | `F-008` | [`T-032`](tasks/T-032-build-workout-history-mobile-experience.md); the five subsections completed by [`T-039`](tasks/T-039-build-weight-mobile-experience.md) and [`T-042`](tasks/T-042-build-body-mobile-experience.md) | `ae55dd3ef85c` | covered |
| `MVP-HIS-002` | `F-008` | [`T-031`](tasks/T-031-build-workout-history-operations.md), [`T-032`](tasks/T-032-build-workout-history-mobile-experience.md) | `35790c78201f` | covered |
| `MVP-HIS-003` | `F-008` | [`T-031`](tasks/T-031-build-workout-history-operations.md), [`T-032`](tasks/T-032-build-workout-history-mobile-experience.md) | `35790c78201f` | covered; `T-045` re-checks that a correction moves no template |
| `MVP-HIS-004` | `F-008` | [`T-031`](tasks/T-031-build-workout-history-operations.md), [`T-032`](tasks/T-032-build-workout-history-mobile-experience.md) | `35790c78201f` | covered; `T-045` re-checks the recalculation after a deletion |
| `MVP-HIS-005` | `F-008` | [`T-033`](tasks/T-033-build-exercise-statistics-operations.md), [`T-034`](tasks/T-034-build-exercise-history-mobile-experience.md) | `b5772adb87d2` | covered; `T-045` re-checks identity after a definition deletion |
| `MVP-HIS-006` | `F-008` | [`T-031`](tasks/T-031-build-workout-history-operations.md), [`T-033`](tasks/T-033-build-exercise-statistics-operations.md), [`T-035`](tasks/T-035-build-split-statistics-operations.md) | `92b6d10b3472` | covered |
| `MVP-HIS-007` | `F-008` | [`T-033`](tasks/T-033-build-exercise-statistics-operations.md), [`T-034`](tasks/T-034-build-exercise-history-mobile-experience.md) | `b5772adb87d2` | covered |
| `MVP-HIS-008` | `F-008` | [`T-033`](tasks/T-033-build-exercise-statistics-operations.md), [`T-034`](tasks/T-034-build-exercise-history-mobile-experience.md) | `b5772adb87d2` | covered |
| `MVP-HIS-009` | `F-008` | [`T-033`](tasks/T-033-build-exercise-statistics-operations.md), [`T-034`](tasks/T-034-build-exercise-history-mobile-experience.md) | `b5772adb87d2` | covered |
| `MVP-HIS-010` | `F-008` | [`T-033`](tasks/T-033-build-exercise-statistics-operations.md), [`T-034`](tasks/T-034-build-exercise-history-mobile-experience.md) | `b5772adb87d2` | covered |
| `MVP-HIS-011` | `F-008` | [`T-035`](tasks/T-035-build-split-statistics-operations.md), [`T-036`](tasks/T-036-build-split-history-mobile-experience.md) | `e5f9bf82970c` | covered |
| `MVP-WGT-001` | `F-009` | [`T-038`](tasks/T-038-build-weight-operations.md), [`T-039`](tasks/T-039-build-weight-mobile-experience.md) | `37cf5ee592bb` | covered |
| `MVP-WGT-002` | `F-009` | [`T-038`](tasks/T-038-build-weight-operations.md), [`T-039`](tasks/T-039-build-weight-mobile-experience.md) | `37cf5ee592bb` | covered |
| `MVP-WGT-003` | `F-009` | [`T-038`](tasks/T-038-build-weight-operations.md), [`T-039`](tasks/T-039-build-weight-mobile-experience.md) | `37cf5ee592bb` | covered |
| `MVP-WGT-004` | `F-009` | [`T-038`](tasks/T-038-build-weight-operations.md), [`T-039`](tasks/T-039-build-weight-mobile-experience.md) | `37cf5ee592bb` | covered; `T-045` re-checks recalculation after a reopen |
| `MVP-BOD-001` | `F-009` | [`T-041`](tasks/T-041-build-body-measurement-operations.md), [`T-042`](tasks/T-042-build-body-mobile-experience.md) | `ae55dd3ef85c` | covered |
| `MVP-BOD-002` | `F-009` | [`T-041`](tasks/T-041-build-body-measurement-operations.md), [`T-042`](tasks/T-042-build-body-mobile-experience.md) | `ae55dd3ef85c` | covered |
| `MVP-BOD-003` | `F-009` | [`T-041`](tasks/T-041-build-body-measurement-operations.md), [`T-042`](tasks/T-042-build-body-mobile-experience.md) | `ae55dd3ef85c` | covered |
| `MVP-BOD-004` | `F-009` | [`T-041`](tasks/T-041-build-body-measurement-operations.md), [`T-042`](tasks/T-042-build-body-mobile-experience.md) | `ae55dd3ef85c` | covered; `T-045` re-checks recalculation after a reopen |
| `MVP-UX-001` | `F-010` | foundation [`T-009`](tasks/T-009-build-mobile-shell-and-ui-foundation.md); release evidence by [`T-046`](tasks/T-046-verify-phone-interaction-and-affordances.md) | `300db8bed59d9ce62057064a0dea51ed3ae054e0` | covered; all 29 routes reflow at 320, 360, 390, and 430 px and every numeric field requests its keyboard |
| `MVP-UX-002` | `F-010` | [`T-013`](tasks/T-013-build-programs-mobile-experience.md), [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md), text corrected by [`T-050`](tasks/T-050-correct-the-reorder-and-current-set-language.md), release evidence by [`T-046`](tasks/T-046-verify-phone-interaction-and-affordances.md) | `300db8bed59d9ce62057064a0dea51ed3ae054e0` | covered; four reorderable lists carry named controls unavailable at the ends, and a reorder survives a reload with no save control |
| `MVP-UX-003` | `F-010` | [`T-016`](tasks/T-016-build-active-workout-mobile-experience.md), [`T-021`](tasks/T-021-replace-archiving-with-deletion-in-data.md), [`T-032`](tasks/T-032-build-workout-history-mobile-experience.md), [`T-039`](tasks/T-039-build-weight-mobile-experience.md), [`T-042`](tasks/T-042-build-body-mobile-experience.md); release evidence by [`T-046`](tasks/T-046-verify-phone-interaction-and-affordances.md) | `300db8bed59d9ce62057064a0dea51ed3ae054e0` | covered; six destructive actions each gate behind `O01`, and Cancel leaves the screen where it was |

**All 57 criteria are covered** by an approved delivery's authorized verification, as of `2026-09-06`: `T-045` closed `MVP-REL-003` and `MVP-REL-004`, and `T-046` closed `MVP-UX-001` through `MVP-UX-003`. Where a Task's verification ran against an inherited replacement, its own record names it. What remains for `T-048` is the release run itself — one complete suite against one approved tree — and the Owner's own visual comparison.

## Release run record

The release run passed in full on `2026-09-06`, on the first attempt, against exact approved delivery `9d8648d8dfd2acdc24cf60f8731d57821d6d75fb` in a fresh isolated worktree after a clean `supabase db reset`.

| Suite | Command | Result |
| --- | --- | --- |
| Unit | `npm run test:unit` | 237/237 across 26 files |
| Component | `npm run test:components` | 4/4 across 2 files |
| Database | `npm run test:db` | 187/187 across 10 pgTAP files |
| Repository | `npm run test:repository` | 9/9 across 9 files |
| Browser | `npm run test:browser -- --workers=1` | 52/52, 26 on mobile Chromium and 26 on mobile WebKit |

489 checks, all against the same tree. The generated database types matched the migrated schema exactly, and the database afterwards was identical to a fresh seed, so every scenario removed what it created. The run contradicts no criterion: each row above stands beside the per-criterion evidence this document already cites, and none of it disagrees.

## Visual comparison record

- **Performed by:** the Owner, themselves, outside the managed Task flow. [`T-047`](tasks/T-047-compare-against-accepted-visual-references.md) records why no Task owns it.
- **Reported on:** `2026-09-06`
- **Coverage:** the application as a whole against the accepted references, reviewed by eye. The Owner did not report a per-frame record, and this document does not imply one: it is their judgment of the delivered application, which is exactly what they took on when they cancelled `T-047`.
- **Outcome:** confirmed. `vizualno sve izgleda ok. potvrdi cijeli vizualni test.`
- **Accepted deviations:** none reported. The Owner stated that anything they notice later they will correct themselves, so a later visual change is their own work and not hidden residual scope of this Milestone.

The constraints that comparison works under — the `OD-015` limitation, the 19 frames whose states accepted decisions removed, and the engine match — are in [`features/F-010-local-mvp-integration.md`](features/F-010-local-mvp-integration.md) and were recorded before it was made.
