# ADR-0023: Simplified exercise load-mode model

- **Status:** Accepted

## Context

The delivered Exercise Library asked the user to select every permitted per-set mode explicitly, including modes that are not a real choice. A weights exercise displayed its mandatory `weight` mode as a locked, always-selected row; a bodyweight exercise displayed `bodyweight` as one row among four; and a fourth `band` base type existed although a resistance band on a bodyweight exercise and an assistance band on an assisted exercise already covered every band case.

The Owner rejected that model on 2026-09-05 after using the application: a mode the user cannot change should not be shown, a bodyweight exercise should never combine added weight with a band, an assisted exercise must pick exactly one assistance form, and the standalone `band` type adds nothing.

## Decision

An exercise definition now stores a base mode that is implied by its type plus at most one optional addition.

| Base type | Implied mode, never shown as a choice | Optional choices | Rule |
| --- | --- | --- | --- |
| `weights` | `weight` | `weight_resistance_band` | The resistance band is a single optional addition |
| `bodyweight` | `bodyweight` | `bodyweight_added_weight`, `bodyweight_resistance_band` | At most one of the two |
| `assisted` | none | `assistance_weight`, `assistance_band` | Exactly one of the two |

The `band` base type and the `resistance_band` and `bodyweight_assistance_band` load modes are removed. Assistance bands remain available through the `assisted` type, which is where assistance belongs.

The database keeps the enums, per-row compatibility checks, and the deferred definition trigger as the authority: the trigger requires the implied base mode, rejects an incompatible mode, allows at most two modes for `weights` and `bodyweight`, and requires exactly one for `assisted`. A partial unique index additionally makes a second optional addition impossible for any exercise. "At least one mode" remains enforced by the same deferred trigger.

The Owner accepted a clean local database reset instead of converting existing rows, so the migration removes the retired enum values without data conversion.

## Consequences

- The Exercise Library shows only real choices, so a weights exercise offers one optional addition and a bodyweight exercise offers two mutually exclusive ones.
- `MVP-EXE-001`, `MVP-EXE-003`, and `MVP-EXE-004` are rewritten for this model; `MVP-EXE-002` and `MVP-EXE-005` are unchanged, and band direction and strength stay separate concepts.
- Set entry derives its fields from the definition instead of a per-set mode menu; that user-visible change is delivered separately by `T-020`.
- Workout snapshots keep storing the permitted modes, so historical sets remain readable exactly as performed.
- Any local data that used the retired type or modes is discarded by the reset rather than migrated.

## Related documents

- [`../product/exercises.md`](../product/exercises.md)
- [`../product/workouts.md`](../product/workouts.md)
- [`../product/mvp-acceptance-criteria.md`](../product/mvp-acceptance-criteria.md)
- [`../architecture/domain-model.md`](../architecture/domain-model.md)
- [`../project/tasks/T-019-simplify-exercise-load-mode-model.md`](../project/tasks/T-019-simplify-exercise-load-mode-model.md)
