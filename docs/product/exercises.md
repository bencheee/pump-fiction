# Exercises

## Exercise library

The Exercise Library is the catalog of reusable exercise definitions. Exercise performance and statistics belong to [History](history-and-statistics.md), not to the library.

Each exercise has:

- a persistent identity;
- a unique active name;
- one base type;
- a weight increment in kilograms;
- one set measurement, `reps` or `seconds`;
- explicitly allowed load or assistance modes;
- a persistent exercise note.

Supported base types are `weights` and `bodyweight`.

Set measurement defaults to `reps`. The Owner can override an exercise to
`seconds` for timed movements such as Side plank. The measurement is part of
the workout snapshot, so changing it affects future workouts only and never
relabels unrelated historical performances.

Each type implies the mode every one of its sets always has, and the user chooses at most one optional addition on top of it. A mode the user cannot change is never offered as a choice; see [ADR-0023](../decisions/0023-simplified-exercise-load-mode-model.md) and [ADR-0026](../decisions/0026-two-exercise-types-with-assistance-under-bodyweight.md), which moves assistance under `bodyweight`.

| Base type | Implied mode | Optional choices | Rule |
| --- | --- | --- | --- |
| `weights` | `weight` | `weight_resistance_band` | The resistance band is a single optional addition |
| `bodyweight` | `bodyweight` | `bodyweight_added_weight`, `bodyweight_resistance_band`, `assistance_weight`, `assistance_band` | At most one of the four |

Saving trims surrounding whitespace from the name and stores the implied mode together with the chosen addition. Active-name uniqueness ignores case and surrounding whitespace. A definition can never store two optional additions, and every definition is valid with none: a plain bodyweight exercise chooses nothing.

## Load modes

Load mode and all applicable values are stored per set, not merely per exercise or workout.

### Weights

A basic set stores kilograms and the exercise's repetition count or timed duration, for example `60 kg × 8` or `60 kg · 30 sec`. An exercise may optionally permit a resistance band alongside the weight. **Weight increment (kg)** is an editable number that controls the value-wheel steps, for example 1, 2, 2.5, 5, or 10 kg. It accepts positive values from 0.01 to 200 kg with at most two decimal places. New definitions default to 2.5 kg; existing Standard definitions retain 2.5 kg and existing Dumbbells definitions retain 2 kg after migration. The wheel runs from its empty zero position to 200 kg and retains any stored or suggested off-grid value. Increment changes affect future workouts only; started and historical workouts keep their snapshot. This changes the picker, not how kilograms are stored or counted in statistics.

### Bodyweight

A basic bodyweight set stores reps or seconds according to the definition. An exercise may additionally allow one of added kilograms, a resistance band, assistance kilograms, or an assistance band, never more than one:

- `BW × 12`
- `BW + 10 kg × 8`
- `BW + strong resistance band × 10`
- `25 kg assistance × 10`
- `strong band assistance × 8`

**Weight increment (kg)** is also shown when the selected addition uses kilograms (added weight or assistance weight), and controls that load wheel with the same rules as weights exercises. A plain bodyweight or band-only definition does not show the field.

An assisted movement is therefore a bodyweight exercise whose optional addition is assistance. More kilograms of assistance means an easier performance. Assistance is stored as a positive value; it is never represented as negative weight.

## Band semantics

A band is not inherently assistance. Its direction (`resistance` or `assistance`) and strength (`light`, `medium`, or `strong`) are stored separately. Bands are never converted to kilograms, and statistics compare assistance and resistance independently.

## Notes

The exercise note belongs to the exercise definition. It contains persistent technique or setup guidance, appears every time the exercise is performed, and is edited only in the Exercise Library. During a workout it is read-only.

A workout-specific note is a different concept; see [`workouts.md`](workouts.md#two-kinds-of-notes).

## Editing and deleting

Changes to an exercise's name, type, permitted load modes, or note affect future workouts only. Workout snapshots preserve historical meaning; see [`domain-model.md`](../architecture/domain-model.md#workout-snapshots).

The edit UI states how many splits use the exercise. Deleting it is permanent and immediate, and nothing is archived; see [ADR-0024](../decisions/0024-deletion-with-preserved-history.md):

- the exercise is removed from every split that used it, after a confirmation naming that count;
- every recorded workout keeps its performances, because the workout stores its own snapshot;
- a deleted exercise cannot be restored.

Changing or deleting an exercise definition does not rewrite existing splits' historical workouts or an already-started workout.
