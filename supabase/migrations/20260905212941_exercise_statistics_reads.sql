SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_exercise_performances (
  p_exercise_identity_id uuid
)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  with occurrences as (
    select
      occurrence.id,
      occurrence.exercise_name_snapshot,
      occurrence.exercise_base_type_snapshot,
      occurrence.workout_note,
      workout.id as workout_id,
      workout.workout_date,
      workout.started_at,
      workout.status,
      workout.source_kind,
      coalesce(workout.split_name_snapshot, workout.one_time_name) as workout_name
    from public.workout_exercises as occurrence
    join public.workouts as workout on workout.id = occurrence.workout_id
    where occurrence.exercise_identity_id = p_exercise_identity_id
      and workout.status in ('completed', 'incomplete')
      -- An occurrence nobody entered anything into is not a performance.
      and exists (
        select 1
        from public.workout_sets as workout_set
        where workout_set.workout_exercise_id = occurrence.id
          and (
            workout_set.load_mode is not null
            or workout_set.load_kg is not null
            or workout_set.band_strength is not null
            or workout_set.reps is not null
          )
      )
  )
  select coalesce((
    select jsonb_build_object(
      'exerciseIdentityId', p_exercise_identity_id,
      'exerciseName', (
        select latest.exercise_name_snapshot from occurrences as latest
        order by latest.workout_date desc, latest.started_at desc limit 1
      ),
      'exerciseBaseType', (
        select latest.exercise_base_type_snapshot from occurrences as latest
        order by latest.workout_date desc, latest.started_at desc limit 1
      ),
      'stillInLibrary', exists (
        select 1 from public.exercises as definition
        where definition.id = p_exercise_identity_id
      ),
      'performances', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'workoutId', occurrence.workout_id,
            'workoutExerciseId', occurrence.id,
            'workoutDate', occurrence.workout_date,
            'workoutName', occurrence.workout_name,
            'status', occurrence.status,
            'sourceKind', occurrence.source_kind,
            'workoutNote', occurrence.workout_note,
            'sets', public.workout_set_snapshots(occurrence.id)
          )
          order by occurrence.workout_date desc, occurrence.started_at desc
        )
        from occurrences as occurrence
      ), '[]'::jsonb)
    )
    where exists (select 1 from occurrences)
  ), 'null'::jsonb);
$function$;

CREATE OR REPLACE FUNCTION public.list_exercise_history()
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  with occurrences as (
    select
      occurrence.id,
      occurrence.exercise_identity_id,
      occurrence.exercise_name_snapshot,
      occurrence.exercise_base_type_snapshot,
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
    where workout.status in ('completed', 'incomplete')
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
        'stillInLibrary', exists (
          select 1 from public.exercises as definition
          where definition.id = identity.exercise_identity_id
        ),
        'latestPerformance', (
          select jsonb_build_object(
            'workoutId', latest.workout_id,
            'workoutExerciseId', latest.id,
            'workoutDate', latest.workout_date,
            'workoutName', latest.workout_name,
            'status', latest.status,
            'sourceKind', latest.source_kind,
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
$function$;

CREATE OR REPLACE FUNCTION public.workout_set_snapshots (
  p_workout_exercise_id uuid
)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  select coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', workout_set.id,
      'position', workout_set.position,
      'loadMode', workout_set.load_mode,
      'loadKg', workout_set.load_kg,
      'bandDirection', workout_set.band_direction,
      'bandStrength', workout_set.band_strength,
      'reps', workout_set.reps
    ) order by workout_set.position)
    from public.workout_sets as workout_set
    where workout_set.workout_exercise_id = p_workout_exercise_id
  ), '[]'::jsonb);
$function$;

REVOKE ALL ON FUNCTION "public"."get_exercise_performances"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."get_exercise_performances"(uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."list_exercise_history"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."list_exercise_history"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."workout_set_snapshots"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."workout_set_snapshots"(uuid) TO "postgres", "service_role";
