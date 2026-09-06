# Programs and splits

## Programs

A program has a name, an ordered list of splits, and a pointer to the next split. Programs have no lifecycle status; exactly one program can be the **current program**, and Today proposes workouts from it. See [ADR-0024](../decisions/0024-deletion-with-preserved-history.md).

Making a program current requires choosing the split its rotation starts from, and replaces any previously current program. Deleting the current program simply leaves no current program.

## Splits

A split belongs to one program and has:

- a name unique within that program;
- a position in the rotation;
- an ordered list of exercises.

Each split exercise defines planned sets, minimum reps, and maximum reps. All three values are positive integers and `min reps <= max reps`.

An exercise may appear in multiple programs and splits, but only once within one split. Exercise history combines all performances of the same persistent exercise regardless of split.

## Ordering

The user can reorder splits inside a program and exercises inside a split. Every row carries its own named move-up and move-down controls.

Reordering never changes historical or already-started workouts. When splits are reordered, the identity of the currently next split stays the same; only the sequence after it changes.

## Rotation

After a user successfully completes the split currently proposed by the rotation, the next-split pointer advances to the next split, wrapping from the last to the first. Starting a workout does not advance it.

| Workout source | Included in split statistics | Advances rotation |
| --- | ---: | ---: |
| Proposed split | Yes | Yes |
| Another split chosen for today | Yes | No |
| One-time workout | No | No |

Exercises in one-time workouts still contribute to exercise history and statistics.

Program editing includes **Set as Next**, which persistently changes the rotation pointer. It is distinct from choosing a different split only for today.

An incomplete workout never advances rotation. Marking it completed later from History still does not change the current rotation. Deleting or editing historical workouts also never rewinds or changes rotation. Completion semantics are canonical in [`workouts.md`](workouts.md#finishing-a-workout).

## Deleting programs and splits

Deletion is permanent and immediate; nothing is archived. Workouts already recorded keep their program and split name snapshots, so History is unchanged by any deletion.

Deleting a program deletes its split templates with it.

If the deleted split was next, the new next split is the first split that followed it in the pre-deletion order, wrapping as needed.

The last split of the current program cannot be deleted. The action is rejected with an explanation that the current program must keep at least one split.
