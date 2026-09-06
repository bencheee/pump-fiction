# Logical domain model

This is a logical model, not the SQL schema. Local persistence is accepted as Supabase PostgreSQL with declarative SQL schemas, versioned migrations, and no initial ORM; see [ADR-0018](../decisions/0018-local-supabase-postgres-and-server-data-access.md). Persisted domain entities use database-generated PostgreSQL `uuid` primary keys; exact remaining columns, constraints, indexes, and repository queries are implementation decisions that must preserve the behavior below.

## Exercises

### `exercises`

Persistent exercise definitions: identity, unique name, base type, and persistent note. There is no status; removal is deletion, per [ADR-0024](../decisions/0024-deletion-with-preserved-history.md).

### `exercise_load_modes`

The allowed per-set modes for an exercise: the mode implied by its base type plus at most one optional addition, as defined by [ADR-0023](../decisions/0023-simplified-exercise-load-mode-model.md) and [ADR-0026](../decisions/0026-two-exercise-types-with-assistance-under-bodyweight.md). The base types are `weights` and `bodyweight`, and assistance is one of the additions a bodyweight definition may carry. A mode distinguishes kilograms, bodyweight, added weight, resistance band, assistance kilograms, and assistance band as applicable. Band direction and strength are separate concepts.

Validation and behavior are canonical in [`exercises.md`](../product/exercises.md).

## Programs

### `programs`

Name and the identity of the next split. Programs have no status; `app_settings.current_program_id` names the single current program.

### `splits`

Persistent identity, parent program, name unique within that program, and rotation position.

### `split_exercises`

Ordered association between one split and one exercise, with planned-set count and minimum/maximum reps. An exercise occurs at most once within a split.

Rotation semantics are canonical in [`programs-and-splits.md`](../product/programs-and-splits.md).

## Workouts

### `workouts`

Stores status (active/paused/completed/incomplete as required by the lifecycle), source kind (proposed split, today-only alternate split, or one-time), source references where applicable, snapshot program/split names, custom one-time name where applicable, local workout date, start and finish timestamps, accumulated active duration, current active-segment start timestamp when running, and enough source context to apply but never retroactively reapply the rotation rule.

Only one workout may be active or paused as the resumable current workout.

The physical schema must enforce that invariant and maintain a workout revision used by the accepted idempotent command flow. Pending browser commands are transport durability records rather than canonical workout entities; see [ADR-0019](../decisions/0019-application-boundaries-and-active-workout-durability.md).

### `workout_exercises`

Ordered exercise performances within a workout. Each retains the original exercise reference plus exercise and prescription snapshots, and its workout-specific note.

It also stores `exercise_identity_id`, a `not null` snapshot of the exercise's id that is never cleared. The reference says whether the definition is still in the library; the identity is what Exercise History groups by, so performances stay combined after the definition is deleted. `workouts` stores `source_program_identity_id` and `source_split_identity_id` the same way for split-sourced workouts. See the identity amendment in [ADR-0024](../decisions/0024-deletion-with-preserved-history.md).

### `workout_sets`

Each set stores position, load mode, a decimal weight/assistance value when applicable, band direction and strength when applicable, and reps. It stores no confirmation flag: a set is *recorded* when it holds everything its mode requires, derived from those values by `workout_set_is_recorded` in the database and `isSetRecorded` in the domain, as defined by [ADR-0027](../decisions/0027-a-set-is-recorded-by-its-values.md). A partially filled set, including a band mode whose strength is not chosen yet, is stored as entered and does not count. Assistance kilograms remain positive; meaning comes from load mode.

Detailed lifecycle behavior is in [`workouts.md`](../product/workouts.md).

## Workout snapshots

Starting a workout copies the then-current display and prescription values into workout history while retaining references to their source entities. Snapshot at least:

- program name;
- split name;
- exercise name;
- exercise base type;
- allowed load modes;
- persistent exercise note;
- planned sets;
- minimum and maximum reps;
- exercise order.

Program and split fields are absent where they do not apply to a one-time workout. Exercises added during an active workout receive the same exercise-definition snapshot at the time they are added; workout-local ordering and prescriptions are then authoritative for that workout.

Each exercise selected when starting a one-time workout receives one empty workout-local starter set row without prescription semantics. Split-sourced workouts instead receive exactly the snapshotted planned set count.

Snapshots make old workouts faithful to what was performed even if a source definition is later renamed, edited, reordered, or deleted. The retained references become null when the definition is deleted; the identity snapshots described under `workout_exercises` are what identity-based statistics group by, so they survive that deletion. This separation is accepted in [ADR-0002](../decisions/0002-template-snapshot-history-model.md).

## Progress

### `weight_entries`

One decimal-kilogram value per local calendar date.

### `measurement_types`

User-defined name and `cm` unit.

### `measurement_entries`

One decimal-centimeter value per measurement type and local calendar date.

Calculation and date rules are canonical in [`weight-and-body.md`](../product/weight-and-body.md).

## Settings

One singleton application-settings record (`id = 1`) holds the configured IANA time zone and measurement units. The initial local value is `Europe/Zagreb`, matching the accepted local environment, and can later be updated without changing dated records. Display/storage units are constrained to kilograms and centimeters.

## Historical correction

A saved `completed` or `incomplete` workout is corrected through the ordinary transactional operations in `0003_workout_history.sql`, never through the active-workout command flow. Every one of them refuses an `active` or `paused` workout, so the two write paths cannot overlap, and none of them writes to a template row or a rotation pointer.

Two rules constrain what a correction may change:

- The recorded active duration stays as measured. Editing the date, start, or finish does not recompute it, because paused wall-clock time cannot be reconstructed afterwards.
- Completion moves only from `incomplete` to `completed`. Returning a completed workout to incomplete would silently withdraw statistics and is not an accepted operation.

Correcting a set applies the same snapshotted allowed modes, shape check, and positive-value checks that constrain a set entered during the workout, so History cannot hold a set the active workout could not have produced.

## Derived statistics

Do not initially create authoritative aggregate tables for weekly weight averages, PRs, or split statistics. Derive them from canonical historical entries so historical edits, deletion, and completion-status changes produce correct results.

`T-033` puts those calculations in the History domain rather than in SQL: eligibility, the comparison category of a set, every personal record, the latest eligible performance, and the chart series are pure functions over the stored performances, so each product rule is testable without a database. The database supplies the raw performances and nothing more. `T-035` follows the same shape for splits: one read returns every saved split-sourced workout with its identity snapshots, its live template names where they still exist, and the names it carries regardless; the counts, the five duration statistics, the program filter, and the duration series are derived in the domain and grouped by identity alone. Chart ranges are trailing windows ending on the configured local date, and `all` is unbounded.

Caching can be considered later only if demonstrated necessary. Calculation eligibility is canonical in [`history-and-statistics.md`](../product/history-and-statistics.md#statistics-eligibility-and-recalculation).
