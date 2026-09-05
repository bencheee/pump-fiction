# ADR-0024: Deletion with preserved History

- **Status:** Accepted

## Context

The delivered application archived exercises, splits, programs, and measurement types instead of deleting them. The Owner rejected that model on 2026-09-05 after using the application: deleting something must delete it, while History must keep every recorded workout exactly as performed.

Archiving existed to protect History from template changes. That protection does not actually come from the status column: workouts already store their own snapshots of the exercise name, base type, note, permitted modes, prescription, and the program and split names, as accepted in [ADR-0002](0002-template-snapshot-history-model.md). The status column only hid definitions from new selection.

## Decision

Archiving is removed. The `entity_status` and `program_status` enums, the `status` columns on `exercises`, `splits`, `programs`, and `measurement_types`, and every archive and reactivate operation no longer exist. Name uniqueness becomes unconditional instead of partial.

History survives deletion because every reference from a workout to a definition becomes optional:

| Reference | Behavior on deletion |
| --- | --- |
| `workout_exercises.exercise_id` | `on delete set null`; the snapshot keeps name, type, note, modes, and prescription |
| `workouts.source_program_id`, `workouts.source_split_id` | `on delete set null`; the name snapshots keep the workout readable |
| `workouts.rotation_advanced_to_split_id` | `on delete set null`; the recorded advancement timestamp stays |
| `split_exercises.exercise_id` | `on delete cascade`; deleting an exercise removes it from every split that used it |
| `splits.program_id` | `on delete cascade`; deleting a program deletes its split templates |

Program lifecycle statuses are replaced by an explicit selection. `app_settings.current_program_id` names the one current program, `programs.next_split_id` remains its rotation pointer, and a deferred trigger requires the current program to point at one of its splits. Deleting the current program leaves no current program rather than failing.

Deleting the last split of the current program stays rejected, as the Owner confirmed, because Today would otherwise have no proposable workout. Deleting any other split moves the rotation pointer with the existing successor rule.

A measurement type keeps no snapshot layer, because its entries are the only record of that measurement. Deleting a type that still has entries therefore stays rejected by the entry reference; `F-009` owns the final measurement experience.

## Consequences

- Deleting an exercise, split, or program is permanent and immediate, and no screen offers archiving or reactivation.
- Every completed and incomplete workout keeps its sets, notes, duration, and names after any deletion, so History and statistics are unaffected.
- Deleted definitions can no longer be recovered; the Owner accepted that in exchange for a model without hidden state.
- `MVP-EXE-008`, `MVP-PRG-001`, `MVP-PRG-007`, `MVP-BOD-001`, the History wording for deleted exercises, and the release-boundary archiving bullet are rewritten for deletion.
- [ADR-0002](0002-template-snapshot-history-model.md) keeps its snapshot decision; only its archiving language is superseded here.

## Related documents

- [`../product/exercises.md`](../product/exercises.md)
- [`../product/programs-and-splits.md`](../product/programs-and-splits.md)
- [`../product/history-and-statistics.md`](../product/history-and-statistics.md)
- [`../product/weight-and-body.md`](../product/weight-and-body.md)
- [`../architecture/domain-model.md`](../architecture/domain-model.md)
- [`../project/tasks/T-021-replace-archiving-with-deletion-in-data.md`](../project/tasks/T-021-replace-archiving-with-deletion-in-data.md)
