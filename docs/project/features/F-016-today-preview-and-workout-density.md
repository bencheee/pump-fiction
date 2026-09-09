# F-016 — Today Preview and Workout Density

- **Milestone:** `M-003`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-09-09T11:50:00+02:00`
- **Updated:** `2026-09-09T12:25:00+02:00`
- **Progress:** `0/1 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

The next workout is visible before it starts, and recording it requires materially less vertical scrolling while preserving every existing workout-local action.

## Scope

- Included: ordered exercises under Today's Start Workout action; compact exercise-card header actions; a single-open exercise accordion collapsed by default; compact Last time, notes, one-row sets, and Add Set treatment.
- Excluded: persistence and command semantics, exercise definitions, split editing, the finish flow, and non-phone layouts.

## Acceptance criteria

- Today shows all exercises from whichever split is selected for today, in split order and directly below Start Workout.
- Exercise cards start collapsed; opening one closes the previous card and positions the newly opened card at the top of the workout content viewport.
- Exercise reorder/remove controls use small icons in the card's upper-right title row and no drag handle is shown.
- Last time places its date in the heading and renders one performance set per line in reps-first notation.
- Each set uses one horizontal row for its number, applicable inputs, compact optional-addition action, and icon-only removal; row controls are 32 px high and Add Set is right-aligned green text without a border.
- Persistent exercise notes use the warning-yellow text token.

## Tasks

- [`T-054`](../tasks/T-054-refine-today-and-active-workout-density.md) — Refine Today and active-workout density

## Dependencies and blockers

- Dependencies: completed `F-007`, `F-011`, and `F-014` behavior.
- Blockers: None.

## Related decisions and documents

- ADRs: [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md), [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md)
- Canonical documents: [`../../product/overview.md`](../../product/overview.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md)

## Readiness

- [x] Outcome and boundaries are clear.
- [x] Acceptance criteria are observable and linked.
- [x] Required Tasks are identified; `T-054` is `In Progress`.
- [x] Dependencies and blockers are understood.
- [x] Documentation impact is known.
- [x] Owner confirmed readiness through the implementation request on `2026-09-09`.

## Completion

- [ ] All required Tasks are `Done`.
- [ ] Feature acceptance criteria are satisfied.
- [ ] Canonical documentation is current.
- [ ] No required follow-up scope is hidden.
- [ ] User confirms the feature result.

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-09-09T11:50:00+02:00` | User / Owner | Created, readied, and released `F-016` | Requested the complete UI refinement as one cohesive outcome. |
| `2026-09-09T12:05:00+02:00` | Codex primary agent / Executor | Delivered `T-054` for approval | Exact delivery `7c29e9a6c147f8f516bdc6a32be9636ad297f847` implements the full Feature scope; feature tests remain approval-gated. |
| `2026-09-09T12:25:00+02:00` | User / Owner | Returned `T-054` to implementation | Requested a denser one-row set presentation and clarified the exercise cards as a single-open accordion that starts closed. |
