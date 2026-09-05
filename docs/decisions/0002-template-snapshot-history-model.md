# ADR-0002: Template and workout snapshot model

- **Status:** Accepted

## Context

Exercise definitions, programs, and splits will change over time. Historical workouts must still display exactly what was prescribed and performed, while statistics must recognize the same exercise or split across later renames and edits.

## Decision

Starting a workout creates workout-owned snapshots of relevant names, exercise definitions, notes, prescriptions, and ordering. The snapshot simultaneously retains references to original program, split, and exercise identities.

Edits to templates affect future workouts only. Workout-local changes never mutate the source split. Historical corrections edit the historical record and recalculate derived statistics, but never mutate templates or rotation.

## Consequences

- History remains faithful after template renames, reordering, edits, or deletion; the removal mechanism is deletion, not archiving, as decided in [ADR-0024](0024-deletion-with-preserved-history.md).
- Identity-based exercise and split statistics remain possible.
- Some values intentionally exist both in mutable definitions and historical snapshots.
- Snapshot creation and workout-local additions must be atomic enough to avoid partial historical records.
- Derived statistics must read canonical history rather than stale stored aggregates.

## Related documents

- [`../architecture/domain-model.md`](../architecture/domain-model.md)
- [`../product/workouts.md`](../product/workouts.md)
- [`../product/history-and-statistics.md`](../product/history-and-statistics.md)
