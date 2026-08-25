# Programs and splits

## Programs

A program has a name, status (`draft`, `active`, or `archived`), an ordered list of splits, and a pointer to the next split. Only one program can be active.

Activating a program requires choosing its first next split. The previously active program becomes archived. Reactivating an archived program again requires the user to choose the next split.

## Splits

A split belongs to one program and has:

- a name unique within that program;
- a position in the rotation;
- an ordered list of exercises;
- `active` or `archived` status.

Each split exercise defines planned sets, minimum reps, and maximum reps. All three values are positive integers and `min reps <= max reps`.

An exercise may appear in multiple programs and splits, but only once within one split. Exercise history combines all performances of the same persistent exercise regardless of split.

## Ordering

The user can reorder splits inside a program and exercises inside a split. The mobile UI provides an explicit drag handle.

Reordering never changes historical or already-started workouts. When splits are reordered, the identity of the currently next split stays the same; only the sequence after it changes.

## Rotation

After a user successfully completes the split currently proposed by the active rotation, the next-split pointer advances to the next active split, wrapping from the last to the first. Starting a workout does not advance it.

| Workout source | Included in split statistics | Advances rotation |
| --- | ---: | ---: |
| Proposed split | Yes | Yes |
| Another split chosen for today | Yes | No |
| One-time workout | No | No |

Exercises in one-time workouts still contribute to exercise history and statistics.

Program editing includes **Set as Next**, which persistently changes the rotation pointer. It is distinct from choosing a different split only for today.

An incomplete workout never advances rotation. Marking it completed later from History still does not change the current rotation. Deleting or editing historical workouts also never rewinds or changes rotation. Completion semantics are canonical in [`workouts.md`](workouts.md#finishing-a-workout).

## Archiving splits

An archived split is removed from rotation and cannot start new workouts, but remains linked to historical workouts.

If the next split is archived, the new next split is the first active split that followed it in the pre-archive order, wrapping as needed.

The last active split in a program cannot be archived. The action is rejected with an explanation that at least one split must remain active.
