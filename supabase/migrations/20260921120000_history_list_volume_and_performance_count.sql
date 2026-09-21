SET local check_function_bodies = off;

-- Two values the History list draws and the reads did not produce: the volume
-- a saved workout moved, which the row's trend badge compares against the
-- previous workout of the same name, and the number of eligible performances
-- behind an exercise row. Both are read-only additions to an existing
-- function; no table, constraint, or write path moves.

create or replace function public.list_workout_history()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with entries as (
    select
      workout.id,
      workout.workout_date,
      workout.started_at,
      coalesce(workout.split_name_snapshot, workout.one_time_name) as name,
      workout.program_name_snapshot,
      workout.source_kind,
      workout.status,
      workout.accumulated_active_seconds,
      (
        select count(*)::integer
        from public.workout_exercises as occurrence
        where occurrence.workout_id = workout.id
          and exists (
            select 1
            from public.workout_sets as workout_set
            where workout_set.workout_exercise_id = occurrence.id
              and public.workout_set_is_recorded(
                workout_set.load_mode,
                workout_set.load_kg,
                workout_set.band_strength,
                workout_set.reps
              )
          )
      ) as performed_exercise_count,
      (
        -- The work the workout moved, for the trend a History row carries
        -- against the previous workout of the same name. Assistance
        -- kilograms are not work done and seconds are not repetitions, so
        -- neither counts; a workout holding only those has no volume and
        -- therefore no trend, which is what the design already does with a
        -- bodyweight-only workout.
        select coalesce(sum(workout_set.load_kg * workout_set.reps), 0)::double precision
        from public.workout_exercises as occurrence
        join public.workout_sets as workout_set
          on workout_set.workout_exercise_id = occurrence.id
        where occurrence.workout_id = workout.id
          and occurrence.measurement_type_snapshot = 'reps'
          and workout_set.load_mode not in ('assistance_weight', 'assistance_band')
          and public.workout_set_is_recorded(
            workout_set.load_mode,
            workout_set.load_kg,
            workout_set.band_strength,
            workout_set.reps
          )
      ) as volume_kg_reps
    from public.workouts as workout
    where workout.status = 'completed'
  ), months as (
    select
      pg_catalog.to_char(entry.workout_date, 'YYYY-MM') as month,
      jsonb_agg(
        jsonb_build_object(
          'id', entry.id,
          'workoutDate', entry.workout_date,
          'name', entry.name,
          'programName', entry.program_name_snapshot,
          'sourceKind', entry.source_kind,
          'status', entry.status,
          'activeDurationSeconds', entry.accumulated_active_seconds,
          'performedExerciseCount', entry.performed_exercise_count,
          'volumeKgReps', entry.volume_kg_reps
        )
        order by entry.workout_date desc, entry.started_at desc
      ) as workouts
    from entries as entry
    group by pg_catalog.to_char(entry.workout_date, 'YYYY-MM')
  )
  select coalesce((
    select jsonb_agg(
      jsonb_build_object('month', month.month, 'workouts', month.workouts)
      order by month.month desc
    )
    from months as month
  ), '[]'::jsonb);
$$;

create or replace function public.list_exercise_history()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with occurrences as (
    select
      occurrence.id,
      occurrence.exercise_identity_id,
      occurrence.exercise_name_snapshot,
      occurrence.exercise_base_type_snapshot,
      occurrence.measurement_type_snapshot,
      occurrence.exercise_id,
      occurrence.workout_note,
      workout.id as workout_id,
      workout.workout_date,
      workout.started_at,
      workout.status,
      workout.source_kind,
      coalesce(workout.split_name_snapshot, workout.one_time_name) as workout_name,
      exists (
        select 1
        from public.workout_sets as workout_set
        where workout_set.workout_exercise_id = occurrence.id
          and public.workout_set_is_recorded(
            workout_set.load_mode,
            workout_set.load_kg,
            workout_set.band_strength,
            workout_set.reps
          )
      ) as has_recorded_set
    from public.workout_exercises as occurrence
    join public.workouts as workout on workout.id = occurrence.workout_id
    where workout.status = 'completed'
  ), identities as (
    select
      occurrence.exercise_identity_id,
      (
        select later.exercise_name_snapshot
        from occurrences as later
        where later.exercise_identity_id = occurrence.exercise_identity_id
        order by later.workout_date desc, later.started_at desc
        limit 1
      ) as exercise_name,
      (
        select later.exercise_base_type_snapshot
        from occurrences as later
        where later.exercise_identity_id = occurrence.exercise_identity_id
        order by later.workout_date desc, later.started_at desc
        limit 1
      ) as exercise_base_type
    from occurrences as occurrence
    where occurrence.has_recorded_set
    group by occurrence.exercise_identity_id
  )
  select coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'exerciseIdentityId', identity.exercise_identity_id,
        'exerciseName', identity.exercise_name,
        'exerciseBaseType', identity.exercise_base_type,
        'measurementType', (
          select later.measurement_type_snapshot from occurrences as later
          where later.exercise_identity_id = identity.exercise_identity_id
          order by later.workout_date desc, later.started_at desc limit 1
        ),
        'stillInLibrary', exists (
          select 1 from public.exercises as definition
          where definition.id = identity.exercise_identity_id
        ),
        -- The eligible performances behind the row, which the list names
        -- beside the latest one. It counts what `isEligiblePerformance`
        -- counts: a completed workout holding at least one recorded set.
        'performanceCount', (
          select count(*)::integer
          from occurrences as counted
          where counted.exercise_identity_id = identity.exercise_identity_id
            and counted.status = 'completed'
            and counted.has_recorded_set
        ),
        'latestPerformance', (
          select jsonb_build_object(
            'workoutId', latest.workout_id,
            'workoutExerciseId', latest.id,
            'workoutDate', latest.workout_date,
            'workoutName', latest.workout_name,
            'status', latest.status,
            'sourceKind', latest.source_kind,
            'measurementType', latest.measurement_type_snapshot,
            'workoutNote', latest.workout_note,
            'sets', public.workout_set_snapshots(latest.id)
          )
          from occurrences as latest
          where latest.exercise_identity_id = identity.exercise_identity_id
            and latest.status = 'completed'
            and latest.has_recorded_set
          order by latest.workout_date desc, latest.started_at desc
          limit 1
        )
      )
      order by identity.exercise_name
    )
    from identities as identity
  ), '[]'::jsonb);
$$;
