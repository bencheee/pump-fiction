SET local check_function_bodies = off;

DROP TRIGGER "programs_validate_active_next_split" ON "public"."programs";

DROP TRIGGER "splits_validate_archival" ON "public"."splits";

DROP INDEX "public"."exercises_active_name_unique";

DROP INDEX "public"."measurement_types_active_name_unique";

DROP INDEX "public"."programs_active_singleton";

DROP INDEX "public"."splits_active_name_per_program_unique";

ALTER TABLE "public"."exercise_load_modes"
  DROP CONSTRAINT "exercise_load_modes_exercise_id_exercise_base_type_fkey";

ALTER TABLE "public"."programs"
  DROP CONSTRAINT "programs_check";

ALTER TABLE "public"."programs"
  DROP CONSTRAINT "programs_next_split_same_program_fk";

ALTER TABLE "public"."split_exercises"
  DROP CONSTRAINT "split_exercises_exercise_id_fkey";

ALTER TABLE "public"."splits"
  DROP CONSTRAINT "splits_program_id_fkey";

ALTER TABLE "public"."workout_exercises"
  DROP CONSTRAINT "workout_exercises_exercise_id_fkey";

ALTER TABLE "public"."workouts"
  DROP CONSTRAINT "workouts_check3";

ALTER TABLE "public"."workouts"
  DROP CONSTRAINT "workouts_check";

ALTER TABLE "public"."workouts"
  DROP CONSTRAINT "workouts_rotation_advanced_to_split_id_fkey";

ALTER TABLE "public"."workouts"
  DROP CONSTRAINT "workouts_rotation_target_same_program_fk";

ALTER TABLE "public"."workouts"
  DROP CONSTRAINT "workouts_source_program_id_fkey";

ALTER TABLE "public"."workouts"
  DROP CONSTRAINT "workouts_source_split_id_fkey";

ALTER TABLE "public"."workouts"
  DROP CONSTRAINT "workouts_source_split_same_program_fk";

DROP FUNCTION "public"."activate_program"(uuid, uuid);

DROP FUNCTION "public"."archive_program"(uuid);

DROP FUNCTION "public"."archive_split"(uuid);

DROP FUNCTION "public"."validate_active_program_next_split"();

DROP FUNCTION "public"."validate_split_archival"();

ALTER TABLE "public"."exercises"
  DROP COLUMN "status";

ALTER TABLE "public"."measurement_types"
  DROP COLUMN "status";

ALTER TABLE "public"."programs"
  DROP COLUMN "status";

DROP TYPE "public"."program_status";

ALTER TABLE "public"."splits"
  DROP COLUMN "status";

DROP TYPE "public"."entity_status";

ALTER TABLE "public"."app_settings"
  ADD COLUMN "current_program_id" uuid;

ALTER TABLE "public"."workout_exercises"
  ALTER COLUMN "exercise_id" DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.advance_program_after_proposed_completion (
  p_program_id         uuid,
  p_completed_split_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  completed_position integer;
  next_active_split_id uuid;
  current_next_split_id uuid;
begin
  select program.next_split_id
  into current_next_split_id
  from public.programs as program
  join public.app_settings as settings on settings.current_program_id = program.id
  where program.id = p_program_id
  for update of program;

  if not found or current_next_split_id <> p_completed_split_id then
    return current_next_split_id;
  end if;

  select position
  into completed_position
  from public.splits
  where id = p_completed_split_id
    and program_id = p_program_id;

  if not found then
    return current_next_split_id;
  end if;

  select split.id
  into next_active_split_id
  from public.splits as split
  where split.program_id = p_program_id
  order by
    case when split.position > completed_position then 0 else 1 end,
    split.position
  limit 1;

  update public.programs
  set next_split_id = next_active_split_id
  where id = p_program_id;

  return next_active_split_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.apply_active_workout_command (
  p_command_id        uuid,
  p_workout_id        uuid,
  p_expected_revision bigint,
  p_operation         public.active_workout_command_operation,
  p_payload           jsonb,
  p_client_created_at timestamp with time zone
)
  RETURNS TABLE (
    kind                    text,
    acknowledged_command_id uuid,
    acknowledged_workout_id uuid,
    expected_revision       bigint,
    resulting_revision      bigint
  )
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  existing_command public.active_workout_commands%rowtype;
  current_workout public.workouts%rowtype;
  target_occurrence public.workout_exercises%rowtype;
  target_set public.workout_sets%rowtype;
  source_exercise public.exercises%rowtype;
  target_id uuid;
  transitioned_at timestamptz;
  next_revision bigint;
  next_position integer;
  order_ids uuid[];
  finish_outcome text;
  populated boolean;
  prior_next_split_id uuid;
  advanced_to_split_id uuid;
begin
  if p_expected_revision < 0 or jsonb_typeof(p_payload) is distinct from 'object' then raise exception using errcode = 'PF002', message = 'Invalid active-workout command envelope'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_command_id::text, 0));
  select command.* into existing_command from public.active_workout_commands as command where command.command_id = p_command_id for update;
  if found then
    if existing_command.workout_id <> p_workout_id or existing_command.expected_revision <> p_expected_revision or existing_command.operation <> p_operation or existing_command.payload <> p_payload or existing_command.client_created_at <> p_client_created_at then raise exception using errcode = 'PF001', message = 'Command ID was already used for a different command'; end if;
    return query select 'duplicate'::text, existing_command.command_id, existing_command.workout_id, existing_command.expected_revision, existing_command.resulting_revision;
    return;
  end if;
  select workout.* into current_workout from public.workouts as workout where workout.id = p_workout_id for update;
  if not found then return query select 'not_found'::text, p_command_id, p_workout_id, p_expected_revision, null::bigint; return; end if;
  if current_workout.revision <> p_expected_revision or current_workout.status not in ('active', 'paused') then return query select 'conflict'::text, p_command_id, p_workout_id, p_expected_revision, current_workout.revision; return; end if;

  if p_operation = 'set_workout_exercise_note' then
    target_id = (p_payload ->> 'workoutExerciseId')::uuid;
    update public.workout_exercises set workout_note = coalesce(p_payload ->> 'note', '') where id = target_id and workout_id = p_workout_id;
    if not found then raise exception using errcode = 'PF002', message = 'Workout exercise does not belong to workout'; end if;
  elsif p_operation in ('pause_timer', 'resume_timer') then
    transitioned_at = (p_payload ->> 'transitionedAt')::timestamptz;
    if p_operation = 'pause_timer' then
      if current_workout.status <> 'active' or transitioned_at < current_workout.active_segment_started_at then return query select 'conflict'::text, p_command_id, p_workout_id, p_expected_revision, current_workout.revision; return; end if;
      update public.workouts set status = 'paused', accumulated_active_seconds = accumulated_active_seconds + floor(extract(epoch from transitioned_at - active_segment_started_at))::integer, active_segment_started_at = null where id = p_workout_id;
    else
      if current_workout.status <> 'paused' or transitioned_at < current_workout.started_at then return query select 'conflict'::text, p_command_id, p_workout_id, p_expected_revision, current_workout.revision; return; end if;
      update public.workouts set status = 'active', active_segment_started_at = transitioned_at where id = p_workout_id;
    end if;
  elsif p_operation = 'update_set' then
    target_id = (p_payload ->> 'workoutSetId')::uuid;
    update public.workout_sets as workout_set set
      load_mode = nullif(p_payload ->> 'loadMode', '')::public.load_mode,
      load_kg = nullif(p_payload ->> 'loadKg', '')::numeric,
      band_direction = nullif(p_payload ->> 'bandDirection', '')::public.band_direction,
      band_strength = nullif(p_payload ->> 'bandStrength', '')::public.band_strength,
      reps = nullif(p_payload ->> 'reps', '')::integer,
      is_confirmed = (p_payload ->> 'isConfirmed')::boolean
    from public.workout_exercises as occurrence
    where workout_set.id = target_id and occurrence.id = workout_set.workout_exercise_id and occurrence.workout_id = p_workout_id;
    if not found then raise exception using errcode = 'PF002', message = 'Workout set does not belong to workout'; end if;
  elsif p_operation = 'add_set' then
    target_id = (p_payload ->> 'workoutExerciseId')::uuid;
    select occurrence.* into target_occurrence from public.workout_exercises as occurrence where occurrence.id = target_id and occurrence.workout_id = p_workout_id for update;
    if not found then raise exception using errcode = 'PF002', message = 'Workout exercise does not belong to workout'; end if;
    select coalesce(max(position), 0) + 1 into next_position from public.workout_sets where workout_exercise_id = target_id;
    insert into public.workout_sets(workout_exercise_id, position) values (target_id, next_position);
  elsif p_operation = 'remove_set' then
    target_id = (p_payload ->> 'workoutSetId')::uuid;
    select workout_set.* into target_set from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id where workout_set.id = target_id and occurrence.workout_id = p_workout_id for update of workout_set;
    if not found then raise exception using errcode = 'PF002', message = 'Workout set does not belong to workout'; end if;
    populated = target_set.load_mode is not null or target_set.load_kg is not null or target_set.band_direction is not null or target_set.band_strength is not null or target_set.reps is not null or target_set.is_confirmed;
    if populated and coalesce((p_payload ->> 'confirmedPopulatedRemoval')::boolean, false) is not true then raise exception using errcode = 'PF204', message = 'Populated set removal requires confirmation'; end if;
    delete from public.workout_sets where id = target_id;
    select coalesce(max(position), 0) into next_position from public.workout_sets where workout_exercise_id = target_set.workout_exercise_id;
    update public.workout_sets set position = position + next_position where workout_exercise_id = target_set.workout_exercise_id;
    with ordered as (select id, row_number() over (order by position)::integer as new_position from public.workout_sets where workout_exercise_id = target_set.workout_exercise_id)
    update public.workout_sets as workout_set set position = ordered.new_position from ordered where workout_set.id = ordered.id;
  elsif p_operation = 'add_exercise' then
    target_id = (p_payload ->> 'exerciseId')::uuid;
    select exercise.* into source_exercise from public.exercises as exercise where exercise.id = target_id;
    if not found then raise exception using errcode = 'PF203', message = 'Exercise is unavailable'; end if;
    select coalesce(max(position), 0) + 1 into next_position from public.workout_exercises where workout_id = p_workout_id;
    insert into public.workout_exercises(workout_id, exercise_id, position, exercise_name_snapshot, exercise_base_type_snapshot, persistent_note_snapshot)
    values (p_workout_id, source_exercise.id, next_position, source_exercise.name, source_exercise.base_type, source_exercise.persistent_note) returning * into target_occurrence;
    insert into public.workout_exercise_load_modes(workout_exercise_id, exercise_base_type_snapshot, load_mode)
    select target_occurrence.id, source_exercise.base_type, mode.load_mode from public.exercise_load_modes as mode where mode.exercise_id = source_exercise.id;
  elsif p_operation = 'remove_exercise' then
    target_id = (p_payload ->> 'workoutExerciseId')::uuid;
    select occurrence.* into target_occurrence from public.workout_exercises as occurrence where occurrence.id = target_id and occurrence.workout_id = p_workout_id for update;
    if not found then raise exception using errcode = 'PF002', message = 'Workout exercise does not belong to workout'; end if;
    select btrim(target_occurrence.workout_note) <> '' or exists (select 1 from public.workout_sets where workout_exercise_id = target_id and (load_mode is not null or load_kg is not null or band_direction is not null or band_strength is not null or reps is not null or is_confirmed)) into populated;
    if populated and coalesce((p_payload ->> 'confirmedPopulatedRemoval')::boolean, false) is not true then raise exception using errcode = 'PF204', message = 'Populated exercise removal requires confirmation'; end if;
    delete from public.workout_exercises where id = target_id;
    select coalesce(max(position), 0) into next_position from public.workout_exercises where workout_id = p_workout_id;
    update public.workout_exercises set position = position + next_position where workout_id = p_workout_id;
    with ordered as (select id, row_number() over (order by position)::integer as new_position from public.workout_exercises where workout_id = p_workout_id)
    update public.workout_exercises as occurrence set position = ordered.new_position from ordered where occurrence.id = ordered.id;
  elsif p_operation = 'reorder_exercises' then
    select coalesce(array_agg(value::uuid order by ordinality), array[]::uuid[]) into order_ids from jsonb_array_elements_text(p_payload -> 'workoutExerciseIds') with ordinality;
    if cardinality(order_ids) <> (select count(*) from public.workout_exercises where workout_id = p_workout_id) or exists (select 1 from pg_catalog.unnest(order_ids) as selected(id) left join public.workout_exercises as occurrence on occurrence.id = selected.id and occurrence.workout_id = p_workout_id where occurrence.id is null) then raise exception using errcode = 'PF205', message = 'Exercise order must contain every occurrence exactly once'; end if;
    select coalesce(max(position), 0) into next_position from public.workout_exercises where workout_id = p_workout_id;
    update public.workout_exercises set position = position + next_position where workout_id = p_workout_id;
    update public.workout_exercises as occurrence set position = selected.ordinality from pg_catalog.unnest(order_ids) with ordinality as selected(id, ordinality) where occurrence.id = selected.id;
  elsif p_operation = 'finish_workout' then
    finish_outcome = p_payload ->> 'outcome';
    transitioned_at = (p_payload ->> 'finishedAt')::timestamptz;
    if finish_outcome not in ('completed', 'incomplete', 'discarded') or transitioned_at < current_workout.started_at or (current_workout.status = 'active' and transitioned_at < current_workout.active_segment_started_at) then raise exception using errcode = 'PF206', message = 'Invalid finish outcome'; end if;
    if current_workout.source_kind = 'proposed_split' and finish_outcome = 'completed' then
      select next_split_id into prior_next_split_id from public.programs where id = current_workout.source_program_id for update;
      if prior_next_split_id = current_workout.source_split_id then advanced_to_split_id = public.advance_program_after_proposed_completion(current_workout.source_program_id, current_workout.source_split_id); end if;
    end if;
    if finish_outcome <> 'discarded' then
      update public.workouts set status = finish_outcome::public.workout_status, finished_at = transitioned_at, accumulated_active_seconds = accumulated_active_seconds + case when status = 'active' then floor(extract(epoch from transitioned_at - active_segment_started_at))::integer else 0 end, active_segment_started_at = null, rotation_advanced_at = case when advanced_to_split_id is not null then transitioned_at else null end, rotation_advanced_to_split_id = advanced_to_split_id where id = p_workout_id;
    end if;
  else
    raise exception using errcode = 'PF002', message = 'Unsupported active-workout command operation';
  end if;

  next_revision = p_expected_revision + 1;
  if not (p_operation = 'finish_workout' and finish_outcome = 'discarded') then update public.workouts set revision = next_revision where id = p_workout_id; end if;
  insert into public.active_workout_commands(command_id, workout_id, expected_revision, resulting_revision, operation, payload, client_created_at) values (p_command_id, p_workout_id, p_expected_revision, next_revision, p_operation, p_payload, p_client_created_at);
  if p_operation = 'finish_workout' and finish_outcome = 'discarded' then delete from public.workouts where id = p_workout_id; end if;
  return query select 'applied'::text, p_command_id, p_workout_id, p_expected_revision, next_revision;
end;
$function$;

CREATE OR REPLACE FUNCTION public.create_split_definition (
  p_program_id   uuid,
  p_name         text,
  p_exercise_ids uuid[],
  p_planned_sets integer[],
  p_min_reps     integer[],
  p_max_reps     integer[]
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  created_split_id uuid;
  next_position integer;
begin
  if not exists (select 1 from public.programs where id = p_program_id) then
    raise exception using errcode = 'PF101', message = 'Program not found';
  end if;

  if p_exercise_ids is null
    or p_planned_sets is null
    or p_min_reps is null
    or p_max_reps is null
    or cardinality(p_exercise_ids) is distinct from cardinality(p_planned_sets)
    or cardinality(p_exercise_ids) is distinct from cardinality(p_min_reps)
    or cardinality(p_exercise_ids) is distinct from cardinality(p_max_reps)
  then
    raise exception using errcode = 'PF106', message = 'Invalid split prescription arrays';
  end if;

  if exists (
    select 1
    from unnest(p_exercise_ids) as requested(exercise_id)
    left join public.exercises as exercise on exercise.id = requested.exercise_id
    where exercise.id is null
  ) then
    raise exception using errcode = 'PF103', message = 'Unknown exercise cannot be added';
  end if;

  select coalesce(max(position), 0) + 1
  into next_position
  from public.splits
  where program_id = p_program_id;

  insert into public.splits (program_id, name, position)
  values (p_program_id, btrim(p_name), next_position)
  returning id into created_split_id;

  insert into public.split_exercises (
    split_id,
    exercise_id,
    position,
    planned_sets,
    min_reps,
    max_reps
  )
  select
    created_split_id,
    requested.exercise_id,
    requested.position::integer,
    requested.planned_sets,
    requested.min_reps,
    requested.max_reps
  from unnest(p_exercise_ids, p_planned_sets, p_min_reps, p_max_reps)
    with ordinality as requested(exercise_id, planned_sets, min_reps, max_reps, position);

  return created_split_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.delete_exercise (
  p_exercise_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  delete from public.exercises
  where id = p_exercise_id;

  if not found then
    raise exception using errcode = 'PF107', message = 'Exercise not found';
  end if;

  return p_exercise_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.delete_program (
  p_program_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  delete from public.programs
  where id = p_program_id;

  if not found then
    raise exception using errcode = 'PF101', message = 'Program not found';
  end if;

  return p_program_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.delete_split (
  p_split_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  target_split public.splits%rowtype;
  successor_id uuid;
  is_current_program boolean;
begin
  select split.*
  into target_split
  from public.splits as split
  where split.id = p_split_id
  for update;

  if not found then
    raise exception using errcode = 'PF101', message = 'Split not found';
  end if;

  select exists (
    select 1
    from public.app_settings as settings
    where settings.current_program_id = target_split.program_id
  )
  into is_current_program;

  select split.id
  into successor_id
  from public.splits as split
  where split.program_id = target_split.program_id
    and split.id <> p_split_id
  order by
    case when split.position > target_split.position then 0 else 1 end,
    split.position
  limit 1;

  if successor_id is null and is_current_program then
    raise exception using errcode = 'PF104', message = 'Last split of the current program cannot be deleted';
  end if;

  update public.programs
  set next_split_id = successor_id
  where id = target_split.program_id
    and next_split_id = p_split_id;

  delete from public.splits
  where id = p_split_id;

  return p_split_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_today_view()
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  with settings as (
    select time_zone from public.app_settings where id = 1
  ), active_program as (
    select program.*
    from public.programs as program
    join public.app_settings as settings on settings.current_program_id = program.id
    limit 1
  ), choices as (
    select
      program.id as program_id,
      program.name as program_name,
      split.id as split_id,
      split.name as split_name,
      split.position,
      split.id = program.next_split_id as is_proposed,
      count(workout.id)::integer as completed_count,
      round(avg(workout.accumulated_active_seconds))::integer as average_seconds
    from active_program as program
    join public.splits as split on split.program_id = program.id
    left join public.workouts as workout on workout.source_split_id = split.id and workout.status = 'completed'
    group by program.id, program.name, program.next_split_id, split.id, split.name, split.position
  )
  select jsonb_build_object(
    'localDate', (pg_catalog.now() at time zone settings.time_zone)::date,
    'proposedSplit', (
      select jsonb_build_object('programId', choice.program_id, 'programName', choice.program_name, 'splitId', choice.split_id, 'splitName', choice.split_name, 'position', choice.position, 'averageDurationSeconds', choice.average_seconds, 'completedWorkoutCount', choice.completed_count)
      from choices as choice where choice.is_proposed
    ),
    'alternateSplits', coalesce((
      select jsonb_agg(jsonb_build_object('programId', choice.program_id, 'programName', choice.program_name, 'splitId', choice.split_id, 'splitName', choice.split_name, 'position', choice.position, 'averageDurationSeconds', choice.average_seconds, 'completedWorkoutCount', choice.completed_count) order by choice.position)
      from choices as choice where not choice.is_proposed
    ), '[]'::jsonb),
    'currentWorkout', (
      select jsonb_build_object('id', workout.id, 'name', coalesce(workout.split_name_snapshot, workout.one_time_name), 'status', workout.status, 'accumulatedActiveSeconds', workout.accumulated_active_seconds, 'activeSegmentStartedAt', workout.active_segment_started_at)
      from public.workouts as workout where workout.status in ('active', 'paused') limit 1
    )
  )
  from settings;
$function$;

CREATE OR REPLACE FUNCTION public.set_current_program (
  p_program_id    uuid,
  p_next_split_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  perform 1
  from public.programs
  where id = p_program_id
  for update;

  if not found then
    raise exception using errcode = 'PF101', message = 'Program not found';
  end if;

  if not exists (
    select 1
    from public.splits
    where id = p_next_split_id
      and program_id = p_program_id
  ) then
    raise exception using errcode = 'PF102', message = 'Invalid next split';
  end if;

  update public.programs
  set next_split_id = p_next_split_id
  where id = p_program_id;

  update public.app_settings
  set current_program_id = p_program_id
  where id = 1;

  return p_program_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_program_next_split (
  p_program_id uuid,
  p_split_id   uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  update public.programs
  set next_split_id = p_split_id
  where id = p_program_id
    and exists (
      select 1
      from public.splits
      where id = p_split_id
        and program_id = p_program_id
    );

  if not found then
    if not exists (select 1 from public.programs where id = p_program_id) then
      raise exception using errcode = 'PF101', message = 'Program not found';
    end if;
    raise exception using errcode = 'PF102', message = 'Invalid next split';
  end if;

  return p_program_id;
end;
$function$;

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
    select program.* into selected_program from public.programs as program join public.app_settings as settings on settings.current_program_id = program.id for update of program;
    if not found then raise exception using errcode = 'PF201', message = 'No current program exists'; end if;
    select split.* into selected_split from public.splits as split where split.id = p_split_id and split.program_id = selected_program.id;
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
    if exists (select 1 from pg_catalog.unnest(p_exercise_ids) as selected(id) left join public.exercises as exercise on exercise.id = selected.id where exercise.id is null) then raise exception using errcode = 'PF203', message = 'Exercise is unavailable'; end if;
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

CREATE OR REPLACE FUNCTION public.update_split_definition (
  p_split_id     uuid,
  p_name         text,
  p_exercise_ids uuid[],
  p_planned_sets integer[],
  p_min_reps     integer[],
  p_max_reps     integer[]
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  perform 1
  from public.splits
  where id = p_split_id
  for update;

  if not found then
    raise exception using errcode = 'PF101', message = 'Split not found';
  end if;

  if p_exercise_ids is null
    or p_planned_sets is null
    or p_min_reps is null
    or p_max_reps is null
    or cardinality(p_exercise_ids) is distinct from cardinality(p_planned_sets)
    or cardinality(p_exercise_ids) is distinct from cardinality(p_min_reps)
    or cardinality(p_exercise_ids) is distinct from cardinality(p_max_reps)
  then
    raise exception using errcode = 'PF106', message = 'Invalid split prescription arrays';
  end if;

  if exists (
    select 1
    from unnest(p_exercise_ids) as requested(exercise_id)
    left join public.exercises as exercise on exercise.id = requested.exercise_id
    where exercise.id is null
  ) then
    raise exception using errcode = 'PF103', message = 'Unknown exercise cannot be added';
  end if;

  update public.splits
  set name = btrim(p_name)
  where id = p_split_id;

  delete from public.split_exercises
  where split_id = p_split_id;

  insert into public.split_exercises (
    split_id,
    exercise_id,
    position,
    planned_sets,
    min_reps,
    max_reps
  )
  select
    p_split_id,
    requested.exercise_id,
    requested.position::integer,
    requested.planned_sets,
    requested.min_reps,
    requested.max_reps
  from unnest(p_exercise_ids, p_planned_sets, p_min_reps, p_max_reps)
    with ordinality as requested(exercise_id, planned_sets, min_reps, max_reps, position);

  return p_split_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.validate_current_program()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  pointer_split_id uuid;
begin
  if new.current_program_id is null then
    return new;
  end if;

  select next_split_id
  into pointer_split_id
  from public.programs
  where id = new.current_program_id;

  if not found or pointer_split_id is null then
    raise exception 'The current program must point to one of its splits';
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.validate_split_deletion()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if exists (
    select 1
    from public.app_settings as settings
    join public.programs as program on program.id = settings.current_program_id
    where program.id = old.program_id
  ) and not exists (
    select 1
    from public.splits
    where program_id = old.program_id
  ) then
    raise exception 'The last split of the current program cannot be deleted';
  end if;

  return null;
end;
$function$;

ALTER TABLE "public"."app_settings"
  ADD CONSTRAINT "app_settings_current_program_fk" FOREIGN KEY (current_program_id) REFERENCES public.programs(id) ON DELETE SET NULL;

ALTER TABLE "public"."exercise_load_modes"
  ADD CONSTRAINT "exercise_load_modes_exercise_id_exercise_base_type_fkey" FOREIGN KEY (exercise_id, exercise_base_type) REFERENCES public.exercises(id, base_type)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."programs"
  ADD CONSTRAINT "programs_next_split_same_program_fk" FOREIGN KEY (id, next_split_id) REFERENCES public.splits(program_id, id) ON DELETE SET NULL (next_split_id);

ALTER TABLE "public"."split_exercises"
  ADD CONSTRAINT "split_exercises_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;

ALTER TABLE "public"."splits"
  ADD CONSTRAINT "splits_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE CASCADE;

ALTER TABLE "public"."workout_exercises"
  ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE SET NULL;

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_check3"
    CHECK (((rotation_advanced_at IS NULL) OR ((source_kind = 'proposed_split'::public.workout_source_kind) AND (status = 'completed'::public.workout_status))));

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_check4" CHECK (((rotation_advanced_to_split_id IS NULL) OR (rotation_advanced_at IS NOT NULL)));

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_check"
    CHECK
    ((((source_kind = 'one_time'::public.workout_source_kind) AND (source_program_id IS NULL) AND (source_split_id IS NULL) AND (program_name_snapshot IS NULL) AND
    (split_name_snapshot IS NULL) AND (one_time_name IS
    NOT NULL) AND (btrim(one_time_name) <> ''::text)) OR
    ((source_kind = ANY (ARRAY['proposed_split'::public.workout_source_kind, 'alternate_split'::public.workout_source_kind])) AND (program_name_snapshot IS
    NOT NULL) AND (split_name_snapshot IS NOT NULL) AND (btrim(program_name_snapshot) <> ''::text) AND (btrim(split_name_snapshot) <> ''::text) AND (one_time_name IS NULL))));

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_rotation_advanced_to_split_id_fkey" FOREIGN KEY (rotation_advanced_to_split_id) REFERENCES public.splits(id) ON DELETE SET NULL;

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_rotation_target_same_program_fk" FOREIGN KEY (source_program_id, rotation_advanced_to_split_id) REFERENCES public.splits(program_id, id) ON DELETE
    SET NULL (rotation_advanced_to_split_id);

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_source_program_id_fkey" FOREIGN KEY (source_program_id) REFERENCES public.programs(id) ON DELETE SET NULL;

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_source_split_id_fkey" FOREIGN KEY (source_split_id) REFERENCES public.splits(id) ON DELETE SET NULL;

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_source_split_same_program_fk" FOREIGN KEY (source_program_id, source_split_id) REFERENCES public.splits(program_id, id) ON DELETE
    SET NULL (source_split_id);

CREATE UNIQUE INDEX exercises_name_unique ON public.exercises USING btree (lower(btrim(name)));

CREATE UNIQUE INDEX measurement_types_name_unique ON public.measurement_types USING btree (lower(btrim(name)));

CREATE UNIQUE INDEX splits_name_per_program_unique ON public.splits USING btree (program_id, lower(btrim(name)));

CREATE CONSTRAINT TRIGGER app_settings_validate_current_program
  AFTER INSERT OR UPDATE OF current_program_id ON public.app_settings DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_current_program();

CREATE CONSTRAINT TRIGGER splits_validate_deletion
  AFTER DELETE ON public.splits DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_split_deletion();

REVOKE ALL ON FUNCTION "public"."delete_exercise"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."delete_exercise"(uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."delete_program"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."delete_program"(uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."delete_split"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."delete_split"(uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."set_current_program"(uuid, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."set_current_program"(uuid, uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."validate_current_program"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."validate_current_program"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."validate_split_deletion"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."validate_split_deletion"() TO "postgres", "service_role";
