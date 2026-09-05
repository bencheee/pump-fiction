# F-011 — MVP Experience Corrections

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-09-05T11:41:11+02:00`
- **Updated:** `2026-09-05T12:39:28+02:00`
- **Progress:** `3/7 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

The delivered Exercise Library, Programs, Today, and Active Workout experiences behave as the Owner requires after using them: saving returns to the originating screen, exercise load modes offer only meaningful choices, deletion replaces archiving without weakening History, and the active workout keeps primary navigation.

## Scope

- Included: the nine Owner corrections recorded on `2026-09-05`, the accepted decisions they change, and every canonical document, MVP criterion, database artifact, and screen they affect.
- Excluded: History and statistics behavior (`F-008`), weight and body progress (`F-009`), integration polish (`F-010`), and any capability not named in the recorded corrections.

## Owner corrections

| # | Correction | Task |
| --- | --- | --- |
| 1 | Saving navigates back to the parent screen with a toast; a failure only shows a toast | `T-018` |
| 2 | Allowed per-set modes offer only real choices; the `band` base type is removed | `T-019` |
| 3 | Archiving is replaced by deletion that never removes History | `T-021`, `T-022` |
| 4 | The save status reports unsaved changes only when the form actually changed | `T-018` |
| 5 | The active workout no longer shows the restored-session banner | `T-023` |
| 6 | The exercise-note heading is only `Exercise note` | `T-023` |
| 7 | A set derives its load fields from the exercise definition instead of a per-set dropdown | `T-020` |
| 8 | Discard belongs to the finish action group, not the scrolling page | `T-023` |
| 9 | Primary navigation stays available during an active workout, with a resume action on Today | `T-024` |

## Accepted Owner decisions

Recorded on `2026-09-05` in answer to the readiness questions for this Feature:

- deleting an exercise also removes it from every split that uses it, after confirmation;
- program `draft`/`active`/`archived` statuses are removed; the current program is derived from an explicit selection;
- deleting the last split of the current program remains blocked;
- the local database is reset instead of converting existing rows to the new load-mode model.

## Acceptance criteria

- Product criteria revised by this Feature: `MVP-EXE-001`, `MVP-EXE-003`, `MVP-EXE-004`, `MVP-EXE-008`, `MVP-PRG-001`, `MVP-PRG-007`, `MVP-WRK-003`, `MVP-BOD-001`, and the archiving bullet in the confirmed release boundary
- Product criteria that must keep passing unchanged: `MVP-EXE-002`, `MVP-EXE-005`–`007`, `MVP-PRG-003`–`006`, `MVP-TOD-001`–`003`, `MVP-WRK-001`–`002`, `MVP-WRK-004`–`012`, `MVP-UX-001`–`003`
- Feature-specific criteria: every row in [Owner corrections](#owner-corrections) is observable in the running application, and no History record is lost by any deletion

## Tasks

- `T-018` — Return to the parent screen after saving (`Done`)
- `T-019` — Simplify the exercise load-mode model (`Done`)
- `T-020` — Derive per-set load from the exercise definition (`Done`)
- `T-021` — Replace archiving with deletion in data and operations
- `T-022` — Replace archiving in the mobile experience
- `T-023` — Correct active-workout screen details
- `T-024` — Keep primary navigation during an active workout

## Dependencies and blockers

- Dependencies: `F-005`, `F-006`, and `F-007` are `Done`; their delivered behavior is what this Feature corrects
- Blockers: None

## Related decisions and documents

- ADRs to create: `ADR-0023` (simplified load-mode model), `ADR-0024` (deletion with preserved History), `ADR-0025` (active workout inside the main shell)
- ADRs affected: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md) keeps snapshot immutability but must state that deletion, not archiving, is the removal mechanism
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../product/exercises.md`](../../product/exercises.md), [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner confirms readiness and the transition of `T-018` to `Ready`

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-09-05T11:41:11+02:00` | Claude Code primary agent / Executor | Created `F-011` in `Now / 1` with seven Tasks in `Backlog` | Record the nine Owner corrections to delivered `F-005`, `F-006`, and `F-007` behavior before `F-008` starts |
| `2026-09-05T11:54:40+02:00` | User / Owner | Confirmed `F-011` readiness and started `T-018` | Directed execution of the recorded corrections before `F-008` |
| `2026-09-05T12:07:13+02:00` | Claude Code primary agent / Executor | Completed `T-018`; `F-011` advances to `1/7` | Owner corrections 1 and 4 are delivered, approved, and verified |
| `2026-09-05T12:31:50+02:00` | Claude Code primary agent / Executor | Completed `T-019`; `F-011` advances to `2/7` | Owner correction 2 is delivered, approved, and verified, and `ADR-0023` is accepted |
| `2026-09-05T12:39:28+02:00` | Claude Code primary agent / Executor | Completed `T-020`; `F-011` advances to `3/7` | Owner correction 7 is delivered, approved, and verified |
