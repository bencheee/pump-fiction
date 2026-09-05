# Workouts

## Starting a workout

Starting a split creates a separate workout snapshot. It includes the workout name, an automatic timer, ordered exercises, persistent exercise notes, each exercise's last performance, planned sets and rep ranges, actual set inputs, workout-specific exercise notes, and the actions needed to modify or finish the session.

The snapshot boundary and stored fields are canonical in [`domain-model.md`](../architecture/domain-model.md#workout-snapshots). The source split remains unchanged by all workout-local edits.

Only one workout may be active at a time. Reopening the application must restore it without losing confirmed sets, notes, ordering, or timer state.

## Initial and editable sets

Starting from a split generates exactly its planned number of set rows. A three-set prescription creates Set 1, Set 2, and Set 3.

A one-time workout has no split prescription. Each exercise selected in its builder starts with exactly one empty workout-local starter set row so entry can begin immediately. That row is not a prescribed set and does not count as an empty planned set.

The user may add another set or remove any set. Planned count is the initial state, not a limit. These changes apply only to this workout.

If a removed set or exercise already contains data, the UI requires confirmation.

## Set entry

A set's fields come from the exercise definition rather than from a per-set menu. Every set starts in the mode its type implies, and when the definition permits an addition each set can apply or remove exactly that addition. The complete type rules are in [`exercises.md`](exercises.md#load-modes).

Examples of resulting fields:

- bodyweight: reps;
- bodyweight with its allowed addition: added kg and reps, or resistance-band strength and reps;
- weights: kg, optional resistance-band strength when allowed, and reps;
- bodyweight with assistance: assistance kg and reps, or assistance-band strength and reps, according to the single addition its definition allows.

Weights permit decimal values. Reps are positive integers. Values may be entered in any order, so a set can hold a band mode before its strength is chosen and still auto-save; completeness is required only when the set is confirmed. A confirmed set saves immediately; active-workout auto-save is a functionally important requirement.

The accepted technical durability mechanism is defined in [ADR-0019](../decisions/0019-application-boundaries-and-active-workout-durability.md); this document remains authoritative for user-visible workout behavior.

## Last time

**Last time** finds the latest completed performance of the same persistent exercise, regardless of split or whether it was a one-time workout. It reflects corrections subsequently made in History.

Incomplete workouts do not qualify because they do not contribute to exercise statistics. See [`history-and-statistics.md`](history-and-statistics.md#statistics-eligibility-and-recalculation).

## Two kinds of notes

1. **Exercise note** is persistent guidance from the Exercise Library. Its snapshot is read-only during the workout.
2. **Workout exercise note** applies only to that exercise in this workout. It auto-saves, remains in History, and is not carried into the next workout.

## Workout-local changes

During a workout the user may:

- reorder exercises;
- add an active exercise from the library;
- remove an exercise;
- add or remove a set;
- apply or remove the definition's single permitted addition on a set, and change its values;
- add a workout-specific note.

None of these actions changes the originating split.

## Timer and continuation

The timer measures active workout duration. **Continue Later** pauses it, so time spent away from the workout is excluded. Browsing to another screen during a workout does not pause anything: the workout stays active, the duration keeps growing, and Today offers **Resume Workout** to return.

Persist:

- accumulated active duration;
- the start timestamp of the currently active timer segment, when running.

The exact timestamps retained for completed History are described in [`domain-model.md`](../architecture/domain-model.md#workouts).

## Finishing a workout

The finish review shows active duration, exercise count, confirmed-set count, and any empty planned sets. Its actions stay together in one sticky group:

- **Complete Workout**;
- **Save as Incomplete**;
- **Continue Workout**;
- a separate, confirmed action to discard the workout entirely.

A completed workout enters History and eligible statistics. It advances rotation only if it was the split proposed by the active rotation, according to [`programs-and-splits.md`](programs-and-splits.md#rotation).

An incomplete workout remains in History but does not enter PRs, exercise charts, or split-duration statistics and never advances rotation. It can later be marked completed; this recalculates statistics but does not affect the then-current rotation.
