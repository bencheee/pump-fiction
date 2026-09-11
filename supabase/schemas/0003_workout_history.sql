-- T-031: workout History reads and corrections.
--
-- History owns saved `completed` workouts. The current
-- `active` or `paused` workout is never corrected from here: it belongs to the
-- revisioned command flow in `0002_workout_operations.sql`. Every function below
-- refuses it, so the two write paths cannot overlap.
--
-- Corrections are ordinary transactional operations with the generic retry
-- contract rather than idempotent commands, as the Owner confirmed on
-- 2026-09-05. None of them touches a template row or a rotation pointer.

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
      ) as performed_exercise_count
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
          'performedExerciseCount', entry.performed_exercise_count
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

create or replace function public.get_history_workout(p_workout_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((
    select jsonb_build_object(
      'id', workout.id,
      'status', workout.status,
      'sourceKind', workout.source_kind,
      'sourceProgramId', workout.source_program_id,
      'sourceSplitId', workout.source_split_id,
      'sourceProgramIdentityId', workout.source_program_identity_id,
      'sourceSplitIdentityId', workout.source_split_identity_id,
      'programName', workout.program_name_snapshot,
      'splitName', workout.split_name_snapshot,
      'name', coalesce(workout.split_name_snapshot, workout.one_time_name),
      'workoutDate', workout.workout_date,
      'startedAt', workout.started_at,
      'finishedAt', workout.finished_at,
      'activeDurationSeconds', workout.accumulated_active_seconds,
      'exercises', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', occurrence.id,
            'exerciseIdentityId', occurrence.exercise_identity_id,
            'exerciseId', occurrence.exercise_id,
            'stillInLibrary', occurrence.exercise_id is not null,
            'position', occurrence.position,
            'exerciseName', occurrence.exercise_name_snapshot,
            'exerciseBaseType', occurrence.exercise_base_type_snapshot,
            'measurementType', occurrence.measurement_type_snapshot,
            'allowedLoadModes', coalesce((
              select jsonb_agg(mode.load_mode order by mode.load_mode)
              from public.workout_exercise_load_modes as mode
              where mode.workout_exercise_id = occurrence.id
            ), '[]'::jsonb),
            'persistentNote', occurrence.persistent_note_snapshot,
            'plannedSets', occurrence.planned_sets_snapshot,
            'minReps', occurrence.min_reps_snapshot,
            'maxReps', occurrence.max_reps_snapshot,
            'workoutNote', occurrence.workout_note,
            'sets', coalesce((
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
              where workout_set.workout_exercise_id = occurrence.id
            ), '[]'::jsonb)
          ) order by occurrence.position
        )
        from public.workout_exercises as occurrence
        where occurrence.workout_id = workout.id
      ), '[]'::jsonb)
    )
    from public.workouts as workout
    where workout.id = p_workout_id
      and workout.status = 'completed'
  ), 'null'::jsonb);
$$;

-- Locks one saved workout and refuses the current one. Every correction starts
-- here, so the History path can never write to an active or paused workout.
create or replace function public.require_history_workout(p_workout_id uuid)
returns public.workouts
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target public.workouts%rowtype;
begin
  select workout.* into target from public.workouts as workout where workout.id = p_workout_id for update;
  if not found then raise exception using errcode = 'PF201', message = 'Workout does not exist'; end if;
  if target.status <> 'completed' then raise exception using errcode = 'PF202', message = 'The current workout is corrected from the active workout, not from History'; end if;
  return target;
end;
$$;

create or replace function public.update_history_workout_timing(
  p_workout_id uuid,
  p_workout_date date,
  p_started_at timestamptz,
  p_finished_at timestamptz
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform public.require_history_workout(p_workout_id);
  if p_workout_date is null or p_started_at is null or p_finished_at is null then raise exception using errcode = 'PF206', message = 'Workout timing is incomplete'; end if;
  if p_finished_at < p_started_at then raise exception using errcode = 'PF206', message = 'A workout cannot finish before it starts'; end if;
  -- Accumulated active duration is the recorded measurement and is deliberately
  -- not recomputed from these timestamps: paused wall-clock time cannot be
  -- reconstructed after the fact.
  update public.workouts
  set workout_date = p_workout_date, started_at = p_started_at, finished_at = p_finished_at
  where id = p_workout_id;
end;
$$;

create or replace function public.set_history_workout_exercise_note(
  p_workout_exercise_id uuid,
  p_note text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  occurrence public.workout_exercises%rowtype;
begin
  select item.* into occurrence from public.workout_exercises as item where item.id = p_workout_exercise_id;
  if not found then raise exception using errcode = 'PF201', message = 'Workout exercise does not exist'; end if;
  perform public.require_history_workout(occurrence.workout_id);
  update public.workout_exercises set workout_note = coalesce(p_note, '') where id = p_workout_exercise_id;
end;
$$;

create or replace function public.update_history_set(
  p_workout_set_id uuid,
  p_values jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_set public.workout_sets%rowtype;
  occurrence public.workout_exercises%rowtype;
begin
  if jsonb_typeof(p_values) is distinct from 'object' then raise exception using errcode = 'PF206', message = 'Set values must be an object'; end if;
  select workout_set.* into target_set from public.workout_sets as workout_set where workout_set.id = p_workout_set_id for update;
  if not found then raise exception using errcode = 'PF201', message = 'Workout set does not exist'; end if;
  select item.* into occurrence from public.workout_exercises as item where item.id = target_set.workout_exercise_id;
  perform public.require_history_workout(occurrence.workout_id);
  -- The snapshotted allowed modes, the shape check, and the positive-value
  -- checks are enforced by the table itself, exactly as they are for a set
  -- entered during the workout. Values arrive as one JSON object because a
  -- cleared field is a real null, which a scalar RPC argument cannot express.
  update public.workout_sets
  set
    load_mode = nullif(p_values ->> 'loadMode', '')::public.load_mode,
    load_kg = nullif(p_values ->> 'loadKg', '')::numeric,
    band_direction = nullif(p_values ->> 'bandDirection', '')::public.band_direction,
    band_strength = nullif(p_values ->> 'bandStrength', '')::public.band_strength,
    reps = nullif(p_values ->> 'reps', '')::integer
  where id = p_workout_set_id;
end;
$$;

create or replace function public.add_history_set(p_workout_exercise_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  occurrence public.workout_exercises%rowtype;
  next_position integer;
  created_id uuid;
begin
  select item.* into occurrence from public.workout_exercises as item where item.id = p_workout_exercise_id for update;
  if not found then raise exception using errcode = 'PF201', message = 'Workout exercise does not exist'; end if;
  perform public.require_history_workout(occurrence.workout_id);
  select coalesce(max(position), 0) + 1 into next_position from public.workout_sets where workout_exercise_id = p_workout_exercise_id;
  insert into public.workout_sets(workout_exercise_id, position) values (p_workout_exercise_id, next_position) returning id into created_id;
  return created_id;
end;
$$;

create or replace function public.remove_history_set(
  p_workout_set_id uuid,
  p_confirmed_populated_removal boolean
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_set public.workout_sets%rowtype;
  occurrence public.workout_exercises%rowtype;
  populated boolean;
  offset_position integer;
begin
  select workout_set.* into target_set from public.workout_sets as workout_set where workout_set.id = p_workout_set_id for update;
  if not found then raise exception using errcode = 'PF201', message = 'Workout set does not exist'; end if;
  select item.* into occurrence from public.workout_exercises as item where item.id = target_set.workout_exercise_id;
  perform public.require_history_workout(occurrence.workout_id);
  populated = target_set.load_mode is not null or target_set.load_kg is not null or target_set.band_direction is not null or target_set.band_strength is not null or target_set.reps is not null;
  if populated and coalesce(p_confirmed_populated_removal, false) is not true then raise exception using errcode = 'PF204', message = 'Populated set removal requires confirmation'; end if;
  delete from public.workout_sets where id = p_workout_set_id;
  select coalesce(max(position), 0) into offset_position from public.workout_sets where workout_exercise_id = target_set.workout_exercise_id;
  update public.workout_sets set position = position + offset_position where workout_exercise_id = target_set.workout_exercise_id;
  with ordered as (select id, row_number() over (order by position)::integer as new_position from public.workout_sets where workout_exercise_id = target_set.workout_exercise_id)
  update public.workout_sets as workout_set set position = ordered.new_position from ordered where workout_set.id = ordered.id;
end;
$$;

create or replace function public.add_history_workout_exercise(
  p_workout_id uuid,
  p_exercise_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  source_exercise public.exercises%rowtype;
  created_occurrence public.workout_exercises%rowtype;
  next_position integer;
begin
  perform public.require_history_workout(p_workout_id);
  select exercise.* into source_exercise from public.exercises as exercise where exercise.id = p_exercise_id;
  if not found then raise exception using errcode = 'PF203', message = 'Exercise is unavailable'; end if;
  select coalesce(max(position), 0) + 1 into next_position from public.workout_exercises where workout_id = p_workout_id;
  -- A corrected workout receives the definition as it stands now, exactly as an
  -- exercise added during a workout does. Existing occurrences keep their own
  -- older snapshots.
  insert into public.workout_exercises(workout_id, exercise_id, exercise_identity_id, position, exercise_name_snapshot, exercise_base_type_snapshot, measurement_type_snapshot, persistent_note_snapshot)
  values (p_workout_id, source_exercise.id, source_exercise.id, next_position, source_exercise.name, source_exercise.base_type, source_exercise.measurement_type, source_exercise.persistent_note)
  returning * into created_occurrence;
  insert into public.workout_exercise_load_modes(workout_exercise_id, exercise_base_type_snapshot, load_mode)
  select created_occurrence.id, source_exercise.base_type, mode.load_mode from public.exercise_load_modes as mode where mode.exercise_id = source_exercise.id;
  insert into public.workout_sets(workout_exercise_id, position) values (created_occurrence.id, 1);
  return created_occurrence.id;
end;
$$;

create or replace function public.remove_history_workout_exercise(
  p_workout_exercise_id uuid,
  p_confirmed_populated_removal boolean
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  occurrence public.workout_exercises%rowtype;
  populated boolean;
  offset_position integer;
begin
  select item.* into occurrence from public.workout_exercises as item where item.id = p_workout_exercise_id for update;
  if not found then raise exception using errcode = 'PF201', message = 'Workout exercise does not exist'; end if;
  perform public.require_history_workout(occurrence.workout_id);
  select btrim(occurrence.workout_note) <> '' or exists (select 1 from public.workout_sets where workout_exercise_id = p_workout_exercise_id and (load_mode is not null or load_kg is not null or band_direction is not null or band_strength is not null or reps is not null)) into populated;
  if populated and coalesce(p_confirmed_populated_removal, false) is not true then raise exception using errcode = 'PF204', message = 'Populated exercise removal requires confirmation'; end if;
  delete from public.workout_exercises where id = p_workout_exercise_id;
  select coalesce(max(position), 0) into offset_position from public.workout_exercises where workout_id = occurrence.workout_id;
  update public.workout_exercises set position = position + offset_position where workout_id = occurrence.workout_id;
  with ordered as (select id, row_number() over (order by position)::integer as new_position from public.workout_exercises where workout_id = occurrence.workout_id)
  update public.workout_exercises as item set position = ordered.new_position from ordered where item.id = ordered.id;
end;
$$;

create or replace function public.reorder_history_workout_exercises(
  p_workout_id uuid,
  p_workout_exercise_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  offset_position integer;
begin
  perform public.require_history_workout(p_workout_id);
  if coalesce(pg_catalog.cardinality(p_workout_exercise_ids), 0) <> (select count(*) from public.workout_exercises where workout_id = p_workout_id)
    or exists (
      select 1
      from pg_catalog.unnest(p_workout_exercise_ids) as selected(id)
      left join public.workout_exercises as occurrence on occurrence.id = selected.id and occurrence.workout_id = p_workout_id
      where occurrence.id is null
    )
  then raise exception using errcode = 'PF205', message = 'Exercise order must contain every occurrence exactly once'; end if;
  select coalesce(max(position), 0) into offset_position from public.workout_exercises where workout_id = p_workout_id;
  update public.workout_exercises set position = position + offset_position where workout_id = p_workout_id;
  update public.workout_exercises as occurrence
  set position = selected.ordinality
  from pg_catalog.unnest(p_workout_exercise_ids) with ordinality as selected(id, ordinality)
  where occurrence.id = selected.id;
end;
$$;

create or replace function public.delete_history_workout(p_workout_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform public.require_history_workout(p_workout_id);
  -- Occurrences, their snapshotted modes, and their sets cascade. Templates and
  -- the rotation pointer are untouched, including a pointer this workout once
  -- advanced.
  delete from public.workouts where id = p_workout_id;
end;
$$;

revoke execute on function public.list_workout_history() from public, anon, authenticated;
revoke execute on function public.get_history_workout(uuid) from public, anon, authenticated;
revoke execute on function public.require_history_workout(uuid) from public, anon, authenticated;
revoke execute on function public.update_history_workout_timing(uuid, date, timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function public.set_history_workout_exercise_note(uuid, text) from public, anon, authenticated;
revoke execute on function public.update_history_set(uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.add_history_set(uuid) from public, anon, authenticated;
revoke execute on function public.remove_history_set(uuid, boolean) from public, anon, authenticated;
revoke execute on function public.add_history_workout_exercise(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.remove_history_workout_exercise(uuid, boolean) from public, anon, authenticated;
revoke execute on function public.reorder_history_workout_exercises(uuid, uuid[]) from public, anon, authenticated;
revoke execute on function public.delete_history_workout(uuid) from public, anon, authenticated;

grant execute on function public.list_workout_history() to service_role;
grant execute on function public.get_history_workout(uuid) to service_role;
grant execute on function public.require_history_workout(uuid) to service_role;
grant execute on function public.update_history_workout_timing(uuid, date, timestamptz, timestamptz) to service_role;
grant execute on function public.set_history_workout_exercise_note(uuid, text) to service_role;
grant execute on function public.update_history_set(uuid, jsonb) to service_role;
grant execute on function public.add_history_set(uuid) to service_role;
grant execute on function public.remove_history_set(uuid, boolean) to service_role;
grant execute on function public.add_history_workout_exercise(uuid, uuid) to service_role;
grant execute on function public.remove_history_workout_exercise(uuid, boolean) to service_role;
grant execute on function public.reorder_history_workout_exercises(uuid, uuid[]) to service_role;
grant execute on function public.delete_history_workout(uuid) to service_role;
