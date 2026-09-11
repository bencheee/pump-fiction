-- T-035: the raw split-sourced workouts behind S17 and S18.
--
-- One read, no derivation. Counts, durations, filters, and chart series are
-- product rules and live in the History domain, as for exercises in T-033.
--
-- Rows carry both the live template names, null once the template is deleted
-- under ADR-0024, and the snapshots every workout keeps. Grouping uses the
-- identity snapshots, never either name.

create or replace function public.list_split_workouts()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
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
    where workout.status = 'completed'
      and workout.source_kind in ('proposed_split', 'alternate_split')
  ), '[]'::jsonb);
$$;

revoke execute on function public.list_split_workouts() from public, anon, authenticated;
grant execute on function public.list_split_workouts() to service_role;
