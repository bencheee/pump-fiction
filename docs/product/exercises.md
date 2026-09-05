# Exercises

## Exercise library

The Exercise Library is the catalog of reusable exercise definitions. Exercise performance and statistics belong to [History](history-and-statistics.md), not to the library.

Each exercise has:

- a persistent identity;
- a unique active name;
- one base type;
- explicitly allowed load or assistance modes;
- a persistent exercise note;
- `active` or `archived` status.

Supported base types are `weights`, `bodyweight`, and `assisted`.

Each type implies the mode every one of its sets always has, and the user chooses at most one optional addition on top of it. A mode the user cannot change is never offered as a choice; see [ADR-0023](../decisions/0023-simplified-exercise-load-mode-model.md).

| Base type | Implied mode | Optional choices | Rule |
| --- | --- | --- | --- |
| `weights` | `weight` | `weight_resistance_band` | The resistance band is a single optional addition |
| `bodyweight` | `bodyweight` | `bodyweight_added_weight`, `bodyweight_resistance_band` | At most one of the two |
| `assisted` | none | `assistance_weight`, `assistance_band` | Exactly one of the two |

Saving trims surrounding whitespace from the name and stores the implied mode together with the chosen addition. Active-name uniqueness ignores case and surrounding whitespace. A definition can never store two optional additions, and an assisted definition can never store zero or two assistance modes.

## Load modes

Load mode and all applicable values are stored per set, not merely per exercise or workout.

### Weights

A basic set stores kilograms and reps, for example `60 kg × 8`. An exercise may optionally permit a resistance band alongside the weight, for example `60 kg + medium resistance band × 8`.

### Bodyweight

A basic bodyweight set stores reps. An exercise may additionally allow either added kilograms or a resistance band, never both:

- `BW × 12`
- `BW + 10 kg × 8`
- `BW + strong resistance band × 10`

One bodyweight set uses at most one modification. Assistance belongs to the `assisted` type rather than to a bodyweight exercise.

### Assisted

An assisted exercise uses exactly one assistance form, expressed either in kilograms or as an assistance band:

- `25 kg assistance × 10`
- `strong band assistance × 8`

More kilograms of assistance means an easier performance. Assistance is stored as a positive value; it is never represented as negative weight.

## Band semantics

A band is not inherently assistance. Its direction (`resistance` or `assistance`) and strength (`light`, `medium`, or `strong`) are stored separately. Bands are never converted to kilograms, and statistics compare assistance and resistance independently.

## Notes

The exercise note belongs to the exercise definition. It contains persistent technique or setup guidance, appears every time the exercise is performed, and is edited only in the Exercise Library. During a workout it is read-only.

A workout-specific note is a different concept; see [`workouts.md`](workouts.md#two-kinds-of-notes).

## Editing and archiving

Changes to an exercise's name, type, permitted load modes, or note affect future workouts only. Workout snapshots preserve historical meaning; see [`domain-model.md`](../architecture/domain-model.md#workout-snapshots).

The edit UI warns when an exercise is used by existing splits. Exercises are archived instead of deleted:

- archived exercises remain available in history and statistics;
- they cannot be added to new splits or workouts;
- they can be reactivated.

Changing an exercise definition does not rewrite existing splits' historical workouts or an already-started workout.
