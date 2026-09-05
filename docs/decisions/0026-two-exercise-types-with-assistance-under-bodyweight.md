# ADR-0026: Two exercise types with assistance under bodyweight

- **Status:** Accepted

## Context

[ADR-0023](0023-simplified-exercise-load-mode-model.md) reduced the exercise definition to an implied base mode plus at most one optional addition, but kept three base types. `assisted` was the odd one: it had no implied mode, so it was the only type that forced a choice before a definition could be saved, and it separated assisted dips and pull-ups from the bodyweight exercises they actually are.

The Owner rejected that split on 2026-09-05 after using the delivered Exercise Library. An assisted pull-up is a pull-up performed with help, not a different kind of exercise, and asking for a third type made the library harder to scan for no gain.

## Decision

The exercise types are `weights` and `bodyweight`. Assistance becomes one of the optional additions a bodyweight exercise may carry.

| Base type | Implied mode, never shown as a choice | Optional choices | Rule |
| --- | --- | --- | --- |
| `weights` | `weight` | `weight_resistance_band` | At most one, unchanged |
| `bodyweight` | `bodyweight` | `bodyweight_added_weight`, `bodyweight_resistance_band`, `assistance_weight`, `assistance_band` | At most one of the four |

This supersedes the type table in ADR-0023; every other decision that ADR records stands, including the implied base mode, the single optional addition, the removal of the standalone `band` type, and the database as the authority.

The `assistance_weight` and `assistance_band` modes keep their identity, their stored values, and their statistics meaning. Assistance stays a positive value that reduces effective load; it is never negative weight, so `MVP-EXE-005` and the History comparison rules are untouched.

Every type now has an implied base mode, so a definition is valid with no optional addition at all: a plain bodyweight exercise is saved by choosing nothing. The deferred definition trigger drops its assisted branch and requires `bodyweight` plus at most one of the four options; the partial unique index that already covers all optional modes continues to make a second addition impossible.

Removing an enum label cannot be done in place, so the migration recreates `exercise_base_type` without `assisted` and rebuilds the objects that depend on it. The committed seed carries an assistance exercise as a bodyweight definition, and no local row used the retired type when the change was delivered, so no data conversion is required.

## Consequences

- The Exercise Library offers two types, and an assisted movement is created as a bodyweight exercise with `Assist with weight` or `Assist with band`.
- A bodyweight exercise offers four mutually exclusive additions instead of two.
- `MVP-EXE-001`, `MVP-EXE-003`, and `MVP-EXE-004` are rewritten for the two-type model; `MVP-EXE-002` and `MVP-EXE-005` are unchanged.
- Set entry is unaffected: an assistance option still produces assistance kilograms and reps, or assistance-band strength and reps.
- Workout snapshots keep their own base-type and mode columns, so sets recorded before this change remain readable exactly as performed.

## Related documents

- [`0023-simplified-exercise-load-mode-model.md`](0023-simplified-exercise-load-mode-model.md)
- [`../product/exercises.md`](../product/exercises.md)
- [`../product/workouts.md`](../product/workouts.md)
- [`../product/mvp-acceptance-criteria.md`](../product/mvp-acceptance-criteria.md)
- [`../architecture/domain-model.md`](../architecture/domain-model.md)
- [`../project/tasks/T-028-merge-assisted-into-bodyweight.md`](../project/tasks/T-028-merge-assisted-into-bodyweight.md)
