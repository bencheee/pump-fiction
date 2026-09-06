SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.list_split_workouts()
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  select coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'workoutId', workout.id,
        'workoutDate', workout.workout_date,
        'status', workout.status,
        'sourceKind', workout.source_kind,
        'activeDurationSeconds', workout.accumulated_active_seconds,
        'splitIdentityId', workout.source_split_identity_id,
        'programIdentityId', workout.source_program_identity_id,
        'splitName', split.name,
        'splitNameSnapshot', workout.split_name_snapshot,
        'programName', program.name,
        'programNameSnapshot', workout.program_name_snapshot
      )
      order by workout.workout_date desc, workout.started_at desc
    )
    from public.workouts as workout
    left join public.splits as split on split.id = workout.source_split_identity_id
    left join public.programs as program on program.id = workout.source_program_identity_id
    where workout.status in ('completed', 'incomplete')
      and workout.source_kind in ('proposed_split', 'alternate_split')
  ), '[]'::jsonb);
$function$;

REVOKE ALL ON FUNCTION "public"."list_split_workouts"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."list_split_workouts"() TO "postgres", "service_role";
