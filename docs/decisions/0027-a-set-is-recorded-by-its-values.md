# ADR-0027: A set is recorded by its entered values

- **Status:** Accepted

## Context

The delivered active workout asked for a set twice. The user typed the load and the reps, which auto-saved immediately, and then pressed a confirm button that repeated the same information as a flag. The button also carried its own validation path: pressing it with a value missing produced an error message, and editing any value afterwards silently returned the set to unconfirmed.

The Owner rejected that on 2026-09-05 after using the application. Entering the values is the act of recording the set; a second gesture that adds nothing is friction, and the flag it maintained was a stored duplicate of what the values already say.

## Decision

Explicit set confirmation is removed. Both controls disappear: the tick beside `Set 1` and the confirm button at the end of the row.

A set is **recorded** when it holds everything its mode requires:

| Mode family | Required values |
| --- | --- |
| `weight`, `weight_resistance_band`, `bodyweight_added_weight`, `assistance_weight` | kilograms and reps |
| `bodyweight` | reps |
| `weight_resistance_band`, `bodyweight_resistance_band`, `assistance_band` | band strength and reps |

Recorded sets are what count toward personal records, charts, and workout statistics. A partially entered set is kept exactly as entered, simply does not count, and the finish review names it instead of blocking the finish.

`workout_sets.is_confirmed` is dropped, because no user action sets it any more, and the `update_set` command drops the `isConfirmed` field that carried it. The state becomes derived: `public.workout_set_is_recorded(load_mode, load_kg, band_strength, reps)` is the single definition of the rule in the database, and `isSetRecorded` mirrors it in the domain so the screens derive the same answer without a round trip.

The old confirmation check constraint is removed with the column. The shape check stays and keeps doing its own job: it accepts any partially entered set, including a band mode without a strength, because entry order is the user's choice.

## Consequences

- Set entry is one gesture. Values auto-save exactly as before, and no further action records the set.
- The finish review counts recorded sets and sets left without values, replacing confirmed sets and empty planned sets.
- The exercise card reads `N of M recorded` instead of `N of M confirmed`.
- The last-performance read and its eligibility check use the derived rule, so a previous workout still shows the sets that count.
- `MVP-WRK-003`, `MVP-WRK-004`, and `MVP-WRK-011` are rewritten, and the confirmed-set wording in the History criteria becomes recorded-set wording. `MVP-WRK-001` and `MVP-WRK-012` are unchanged.
- Removing the flag cannot be undone by a UI change alone: any future need to mark a set without values would require a new decision and a new column.

## Related documents

- [`../product/workouts.md`](../product/workouts.md)
- [`../product/history-and-statistics.md`](../product/history-and-statistics.md)
- [`../product/mvp-acceptance-criteria.md`](../product/mvp-acceptance-criteria.md)
- [`../architecture/domain-model.md`](../architecture/domain-model.md)
- [`../architecture/active-workout-durability.md`](../architecture/active-workout-durability.md)
- [`../project/tasks/T-029-record-a-set-by-its-values.md`](../project/tasks/T-029-record-a-set-by-its-values.md)
