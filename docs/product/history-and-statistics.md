# History and statistics

## Information architecture

History is the single home for historical records and progress statistics. It has five subsections:

1. Workouts
2. Exercises
3. Splits
4. Weight
5. Body

Weight and Body calculations are canonical in [`weight-and-body.md`](weight-and-body.md). The grouping decision is recorded by [ADR-0003](../decisions/0003-history-information-architecture.md).

## Workout history

Workouts are ordered newest first and grouped by month. Each item shows date, split or one-time-workout name, active duration, performed exercise count, and incomplete status where applicable.

Months group by the workout's local date, which is already stored in the configured time zone. The performed exercise count counts the exercises holding at least one recorded set, so an exercise the user opened but left empty is not counted as performed.

A workout detail renders its saved snapshot:

- start and finish time;
- active duration;
- program and split identity and names, when applicable;
- ordered exercises;
- planned targets;
- actual sets;
- persistent exercise-note snapshots;
- workout-specific notes.

### Historical edits and deletion

The user can edit date, start and finish, exercises and order, sets, load modes, weight or assistance, band data, reps, and workout-specific notes.

The recorded active duration is not among them. It stays as measured, because the paused wall-clock time it already excludes cannot be reconstructed from corrected timestamps.

An incomplete workout can be marked completed, which makes it eligible data. The reverse is not offered: returning a completed workout to incomplete would silently withdraw statistics that already exist.

Any historical edit recalculates all affected derived statistics. It does not update a split template or affect rotation. A workout can be deleted after confirmation; deletion also recalculates affected statistics and does not rewind rotation.

## Exercise history

The exercise list contains every exercise with at least one historical performance, including exercises whose definition was later deleted; the workout snapshot keeps their name and type, and a persistent identity snapshot keeps their performances combined as one exercise. Deletion is therefore visible as a marker on the exercise rather than as a lost record; see the identity amendment in [ADR-0024](../decisions/0024-deletion-with-preserved-history.md). An exercise detail shows:

- latest eligible performance;
- personal records;
- a progress chart;
- all performances across all splits and one-time workouts, including those from incomplete workouts, which are marked as excluded from statistics;
- workout-specific notes;
- links from performances to their workouts.

## Statistics eligibility and recalculation

Only recorded sets in completed workouts contribute to PRs and exercise charts; a set is recorded once it holds everything its mode requires, as defined by [ADR-0027](../decisions/0027-a-set-is-recorded-by-its-values.md). Only completed split-based workouts contribute to that split's duration statistics. One-time workouts contribute to exercise but not split statistics. Incomplete workouts contribute to neither.

Statistics are derived from canonical history rather than stored as authoritative aggregates. Editing, deleting, or changing completion status causes recalculation. See [`domain-model.md`](../architecture/domain-model.md#derived-statistics).

## Personal records

### Weights

Track:

- highest entered weight;
- highest reps at a particular weight;
- highest single-set volume;
- highest total exercise volume within one workout.

`set volume = weight × reps`

`workout exercise volume = sum of volumes of recorded sets`

When a weights exercise uses an optional resistance band, calculate and present comparable records separately for no-band sets and each resistance-band strength. Never treat the band as kilograms.

Highest reps is derived per distinct entered weight, so the whole list is available; the exercise detail leads with the entry for the heaviest weight in that category and keeps the rest in its accessible data list.

### Bodyweight

For pure bodyweight, track highest reps in a set and highest total reps in a workout.

For bodyweight with added weight, track highest added weight, highest reps at the same added weight, and highest total reps in a workout.

### Assisted

For assistance measured in kilograms, track the least assistance in a successfully recorded set and the highest reps at the same assistance amount. Lower assistance is better progress; assistance remains a positive value.

### Bands

Compare band results only within the same direction (`resistance` or `assistance`) and strength (`light`, `medium`, or `strong`). Never convert bands to kilograms or merge assistance and resistance categories.

A band category that carries no kilograms tracks highest reps in a set and highest total reps in a workout, the same two records as pure bodyweight, because reps are the only comparable quantity it holds.

## Exercise charts

Depending on the exercise and selected metric, charts may show highest weight per workout, highest reps, total volume or reps, amount of assistance, or a meaningful band category.

The chart opens on the metric that tells the most about the exercise: the load it moves, whether lifted or assisted, and otherwise reps. Available ranges are week, month, quarter, year, and all where the corresponding wireframe/product flow supports it. Assisted-weight charts visually treat a lower kilogram value as improvement. Exact chart technology remains undecided.

## Split history

The split list shows program, completed-workout count, average duration, and latest-performance date. Splits with the same name in different programs remain separate because statistics use persistent split identity.

A split detail shows completed-workout count, total duration, average duration, shortest and longest duration, latest duration, a duration chart, and its workouts.

One-time and incomplete workouts are excluded from split-duration statistics.
