SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.start_workout (
  p_source_kind   public.workout_source_kind,
  p_split_id      uuid,
  p_one_time_name text,
  p_exercise_ids  uuid[],
  p_started_at    timestamp with time zone
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  selected_program public.programs%rowtype;
  selected_split public.splits%rowtype;
  created_workout_id uuid;
  created_occurrence_id uuid;
  item record;
  configured_time_zone text;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('public.workouts.resumable'));
  if exists (select 1 from public.workouts where status in ('active', 'paused')) then
    raise exception using errcode = 'PF202', message = 'A current workout already exists';
  end if;
  select time_zone into configured_time_zone from public.app_settings where id = 1;
  if p_started_at is null then raise exception using errcode = 'PF206', message = 'A start timestamp is required'; end if;

  if p_source_kind in ('proposed_split', 'alternate_split') then
    select program.* into selected_program from public.programs as program where program.status = 'active' for update;
    if not found then raise exception using errcode = 'PF201', message = 'No active program exists'; end if;
    select split.* into selected_split from public.splits as split where split.id = p_split_id and split.program_id = selected_program.id and split.status = 'active';
    if not found then raise exception using errcode = 'PF201', message = 'Split is unavailable'; end if;
    if (p_source_kind = 'proposed_split') <> (selected_program.next_split_id = selected_split.id) then raise exception using errcode = 'PF206', message = 'Split does not match requested source kind'; end if;

    insert into public.workouts(status, source_kind, source_program_id, source_split_id, program_name_snapshot, split_name_snapshot, workout_date, started_at, active_segment_started_at)
    values ('active', p_source_kind, selected_program.id, selected_split.id, selected_program.name, selected_split.name, (p_started_at at time zone configured_time_zone)::date, p_started_at, p_started_at)
    returning id into created_workout_id;

    for item in
      select split_item.position, split_item.planned_sets, split_item.min_reps, split_item.max_reps, exercise.*
      from public.split_exercises as split_item join public.exercises as exercise on exercise.id = split_item.exercise_id
      where split_item.split_id = selected_split.id order by split_item.position
    loop
      insert into public.workout_exercises(workout_id, exercise_id, position, exercise_name_snapshot, exercise_base_type_snapshot, persistent_note_snapshot, planned_sets_snapshot, min_reps_snapshot, max_reps_snapshot)
      values (created_workout_id, item.id, item.position, item.name, item.base_type, item.persistent_note, item.planned_sets, item.min_reps, item.max_reps)
      returning id into created_occurrence_id;
      insert into public.workout_exercise_load_modes(workout_exercise_id, exercise_base_type_snapshot, load_mode)
      select created_occurrence_id, item.base_type, mode.load_mode from public.exercise_load_modes as mode where mode.exercise_id = item.id;
      insert into public.workout_sets(workout_exercise_id, position)
      select created_occurrence_id, series.position from pg_catalog.generate_series(1, item.planned_sets) as series(position);
    end loop;
  elsif p_source_kind = 'one_time' then
    if btrim(coalesce(p_one_time_name, '')) = '' or coalesce(pg_catalog.array_length(p_exercise_ids, 1), 0) = 0 or (select count(distinct id) from pg_catalog.unnest(p_exercise_ids) as id) <> pg_catalog.array_length(p_exercise_ids, 1) then raise exception using errcode = 'PF206', message = 'One-time workout details are invalid'; end if;
    if exists (select 1 from pg_catalog.unnest(p_exercise_ids) as selected(id) left join public.exercises as exercise on exercise.id = selected.id and exercise.status = 'active' where exercise.id is null) then raise exception using errcode = 'PF203', message = 'Exercise is unavailable'; end if;
    insert into public.workouts(status, source_kind, one_time_name, workout_date, started_at, active_segment_started_at)
    values ('active', 'one_time', btrim(p_one_time_name), (p_started_at at time zone configured_time_zone)::date, p_started_at, p_started_at)
    returning id into created_workout_id;
    for item in select exercise.*, selected.ordinality::integer as position from pg_catalog.unnest(p_exercise_ids) with ordinality as selected(id, ordinality) join public.exercises as exercise on exercise.id = selected.id order by selected.ordinality loop
      insert into public.workout_exercises(workout_id, exercise_id, position, exercise_name_snapshot, exercise_base_type_snapshot, persistent_note_snapshot)
      values (created_workout_id, item.id, item.position, item.name, item.base_type, item.persistent_note) returning id into created_occurrence_id;
      insert into public.workout_exercise_load_modes(workout_exercise_id, exercise_base_type_snapshot, load_mode)
      select created_occurrence_id, item.base_type, mode.load_mode from public.exercise_load_modes as mode where mode.exercise_id = item.id;
      insert into public.workout_sets(workout_exercise_id, position)
      values (created_occurrence_id, 1);
    end loop;
  else
    raise exception using errcode = 'PF206', message = 'Workout source kind is invalid';
  end if;
  return created_workout_id;
end;
$function$;
