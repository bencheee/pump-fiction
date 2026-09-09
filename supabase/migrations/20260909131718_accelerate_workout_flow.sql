CREATE OR REPLACE FUNCTION public.get_today_view()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH settings AS (
    SELECT time_zone FROM public.app_settings WHERE id = 1
  ), active_program AS (
    SELECT program.*
    FROM public.programs AS program
    JOIN public.app_settings AS settings ON settings.current_program_id = program.id
    LIMIT 1
  ), choices AS (
    SELECT
      program.id AS program_id,
      program.name AS program_name,
      split.id AS split_id,
      split.name AS split_name,
      split.position,
      split.id = program.next_split_id AS is_proposed,
      count(workout.id)::integer AS completed_count,
      round(avg(workout.accumulated_active_seconds))::integer AS average_seconds,
      coalesce((
        SELECT jsonb_agg(jsonb_build_object(
          'exerciseId', exercise.id,
          'exerciseName', exercise.name,
          'position', split_item.position,
          'plannedSets', split_item.planned_sets,
          'minReps', split_item.min_reps,
          'maxReps', split_item.max_reps
        ) ORDER BY split_item.position)
        FROM public.split_exercises AS split_item
        JOIN public.exercises AS exercise ON exercise.id = split_item.exercise_id
        WHERE split_item.split_id = split.id
      ), '[]'::jsonb) AS exercises
    FROM active_program AS program
    JOIN public.splits AS split ON split.program_id = program.id
    LEFT JOIN public.workouts AS workout ON workout.source_split_id = split.id AND workout.status = 'completed'
    GROUP BY program.id, program.name, program.next_split_id, split.id, split.name, split.position
  )
  SELECT jsonb_build_object(
    'localDate', (pg_catalog.now() AT TIME ZONE settings.time_zone)::date,
    'proposedSplit', (
      SELECT jsonb_build_object('programId', choice.program_id, 'programName', choice.program_name, 'splitId', choice.split_id, 'splitName', choice.split_name, 'position', choice.position, 'averageDurationSeconds', choice.average_seconds, 'completedWorkoutCount', choice.completed_count, 'exercises', choice.exercises)
      FROM choices AS choice WHERE choice.is_proposed
    ),
    'alternateSplits', coalesce((
      SELECT jsonb_agg(jsonb_build_object('programId', choice.program_id, 'programName', choice.program_name, 'splitId', choice.split_id, 'splitName', choice.split_name, 'position', choice.position, 'averageDurationSeconds', choice.average_seconds, 'completedWorkoutCount', choice.completed_count, 'exercises', choice.exercises) ORDER BY choice.position)
      FROM choices AS choice WHERE NOT choice.is_proposed
    ), '[]'::jsonb),
    'currentWorkout', (
      SELECT jsonb_build_object('id', workout.id, 'name', coalesce(workout.split_name_snapshot, workout.one_time_name), 'status', workout.status, 'accumulatedActiveSeconds', workout.accumulated_active_seconds, 'activeSegmentStartedAt', workout.active_segment_started_at)
      FROM public.workouts AS workout WHERE workout.status IN ('active', 'paused') LIMIT 1
    )
  )
  FROM settings;
$$;

CREATE OR REPLACE FUNCTION public.start_workout_and_get_current(
  p_source_kind public.workout_source_kind,
  p_split_id uuid,
  p_one_time_name text,
  p_exercise_ids uuid[],
  p_started_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.start_workout(p_source_kind, p_split_id, p_one_time_name, p_exercise_ids, p_started_at);
  RETURN public.get_current_workout();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.start_workout_and_get_current(public.workout_source_kind, uuid, text, uuid[], timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_workout_and_get_current(public.workout_source_kind, uuid, text, uuid[], timestamptz) TO service_role;
