# M-003 — Workout Usability Refinements

- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-09-09T11:50:00+02:00`
- **Updated:** `2026-09-09T12:50:52+02:00`
- **Progress:** `0/1 required Features Done`
- **Blocked children:** `0`
- **Awaiting approval children:** `0`

## Outcome

Today previews the exercises in the workout it is about to start, and the active-workout screen fits substantially more useful set-entry content in each phone viewport.

## Scope

- Included: Today split exercise preview and the active-workout card-density and hierarchy changes requested by the Owner.
- Excluded: workout data-model changes, new exercise or set behavior, desktop layouts, and any nutrition capability.

## Completion criteria

- [ ] Today lists every exercise in the selected planned split beneath its start action.
- [ ] Active-workout exercise cards provide the requested compact, collapsible presentation without removing existing workout operations.
- [ ] All required Features are `Done`.
- [ ] Canonical documentation is current.
- [ ] User confirms the milestone result.

## Features

- [`F-016`](../features/F-016-today-preview-and-workout-density.md) — Today Preview and Workout Density

## Dependencies and blockers

- Dependencies: `M-001` and `M-002` are complete.
- Blockers: None.

## Related decisions and documents

- ADRs: [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md), [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md)
- Canonical documents: [`../../product/overview.md`](../../product/overview.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md)

## Readiness

- [x] Outcome and boundaries are clear.
- [x] Completion criteria are observable.
- [x] Required Features are identified.
- [x] Dependencies and blockers are understood.
- [x] Owner confirmed readiness through the implementation request on `2026-09-09`.

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-09-09T11:50:00+02:00` | User / Owner | Created and released `M-003` | Requested a Today split preview and a denser active-workout UI after asking for a Playwright inspection of the current screens. |
| `2026-09-09T12:05:00+02:00` | Codex primary agent / Executor | Delivered the Milestone's one Task for approval | `T-054` exact delivery `7c29e9a6c147f8f516bdc6a32be9636ad297f847` is awaiting the Owner. |
| `2026-09-09T12:25:00+02:00` | User / Owner | Requested an in-scope replacement | `T-054` returned to implementation for the clarified density and accordion behavior. |
| `2026-09-09T12:37:00+02:00` | Codex primary agent / Executor | Delivered the replacement for approval | `T-054` replacement `5379fd83ac295df9abe1b385854b168338543718` is awaiting the Owner. |
| `2026-09-09T12:50:52+02:00` | User / Owner | Approved the Milestone result | Exact `T-054` replacement `5379fd83ac295df9abe1b385854b168338543718` is authorized for verification and completion. |
