SET local check_function_bodies = off;

-- Copy the current picker grids before retiring the equipment columns.
ALTER TABLE public.exercises ADD COLUMN weight_increment numeric NOT NULL DEFAULT 2.5;
ALTER TABLE public.workout_exercises ADD COLUMN weight_increment_snapshot numeric NOT NULL DEFAULT 2.5;
UPDATE public.exercises SET weight_increment = CASE weight_equipment WHEN 'dumbbells' THEN 2 ELSE 2.5 END;
UPDATE public.workout_exercises SET weight_increment_snapshot = CASE weight_equipment_snapshot WHEN 'dumbbells' THEN 2 ELSE 2.5 END;
-- Complete deferred definition checks before altering these tables.
SET CONSTRAINTS ALL IMMEDIATE;
SET CONSTRAINTS ALL DEFERRED;


ALTER TABLE "public"."exercises"
  DROP CONSTRAINT "exercises_weight_equipment_check";

ALTER TABLE "public"."exercises"
  DROP CONSTRAINT "exercises_weight_equipment_type";

ALTER TABLE "public"."workout_exercises"
  DROP CONSTRAINT "workout_exercises_weight_equipment_snapshot_check";

ALTER TABLE "public"."workout_exercises"
  DROP CONSTRAINT "workout_exercises_weight_equipment_type";

DROP FUNCTION "public"."create_exercise_definition"(text, public.exercise_base_type, text, public.load_mode[], public.exercise_measurement_type, text);

DROP FUNCTION "public"."update_exercise_definition"(uuid, text, public.exercise_base_type, text, public.load_mode[], public.exercise_measurement_type, text);

ALTER TABLE "public"."exercises"
  DROP COLUMN "weight_equipment";

ALTER TABLE "public"."workout_exercises"
  DROP COLUMN "weight_equipment_snapshot";



CREATE OR REPLACE FUNCTION public.add_history_workout_exercise (
  p_workout_id  uuid,
  p_exercise_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
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
  insert into public.workout_exercises(workout_id, exercise_id, exercise_identity_id, position, exercise_name_snapshot, exercise_base_type_snapshot, measurement_type_snapshot, weight_increment_snapshot, persistent_note_snapshot)
  values (p_workout_id, source_exercise.id, source_exercise.id, next_position, source_exercise.name, source_exercise.base_type, source_exercise.measurement_type, source_exercise.weight_increment, source_exercise.persistent_note)
  returning * into created_occurrence;
  insert into public.workout_exercise_load_modes(workout_exercise_id, exercise_base_type_snapshot, load_mode)
  select created_occurrence.id, source_exercise.base_type, mode.load_mode from public.exercise_load_modes as mode where mode.exercise_id = source_exercise.id;
  insert into public.workout_sets(workout_exercise_id, position) values (created_occurrence.id, 1);
  return created_occurrence.id;
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
      reps = nullif(p_payload ->> 'reps', '')::integer
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
    populated = target_set.load_mode is not null or target_set.load_kg is not null or target_set.band_direction is not null or target_set.band_strength is not null or target_set.reps is not null;
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
    insert into public.workout_exercises(workout_id, exercise_id, exercise_identity_id, position, exercise_name_snapshot, exercise_base_type_snapshot, measurement_type_snapshot, weight_increment_snapshot, persistent_note_snapshot)
    values (p_workout_id, source_exercise.id, source_exercise.id, next_position, source_exercise.name, source_exercise.base_type, source_exercise.measurement_type, source_exercise.weight_increment, source_exercise.persistent_note) returning * into target_occurrence;
    insert into public.workout_exercise_load_modes(workout_exercise_id, exercise_base_type_snapshot, load_mode)
    select target_occurrence.id, source_exercise.base_type, mode.load_mode from public.exercise_load_modes as mode where mode.exercise_id = source_exercise.id;
  elsif p_operation = 'remove_exercise' then
    target_id = (p_payload ->> 'workoutExerciseId')::uuid;
    select occurrence.* into target_occurrence from public.workout_exercises as occurrence where occurrence.id = target_id and occurrence.workout_id = p_workout_id for update;
    if not found then raise exception using errcode = 'PF002', message = 'Workout exercise does not belong to workout'; end if;
    select btrim(target_occurrence.workout_note) <> '' or exists (select 1 from public.workout_sets where workout_exercise_id = target_id and (load_mode is not null or load_kg is not null or band_direction is not null or band_strength is not null or reps is not null)) into populated;
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
    if finish_outcome not in ('completed', 'discarded') or transitioned_at < current_workout.started_at or (current_workout.status = 'active' and transitioned_at < current_workout.active_segment_started_at) then raise exception using errcode = 'PF206', message = 'Invalid finish outcome'; end if;
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

CREATE OR REPLACE FUNCTION public.create_exercise_definition (
  p_name             text,
  p_base_type        public.exercise_base_type,
  p_persistent_note  text,
  p_load_modes       public.load_mode[],
  p_measurement_type public.exercise_measurement_type DEFAULT 'reps'::public.exercise_measurement_type,
  p_weight_increment numeric                          DEFAULT 2.5
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  created_exercise_id uuid;
begin
  insert into public.exercises (name, base_type, measurement_type, weight_increment, persistent_note)
  values (btrim(p_name), p_base_type, p_measurement_type, p_weight_increment, p_persistent_note)
  returning id into created_exercise_id;

  insert into public.exercise_load_modes (
    exercise_id,
    exercise_base_type,
    load_mode
  )
  select created_exercise_id, p_base_type, requested_mode
  from unnest(p_load_modes) as requested_mode;

  return created_exercise_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_workout()
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  select coalesce((
    select jsonb_build_object(
      'id', workout.id,
      'status', workout.status,
      'sourceKind', workout.source_kind,
      'sourceProgramId', workout.source_program_id,
      'sourceSplitId', workout.source_split_id,
      'name', coalesce(workout.split_name_snapshot, workout.one_time_name),
      'workoutDate', workout.workout_date,
      'startedAt', workout.started_at,
      'accumulatedActiveSeconds', workout.accumulated_active_seconds,
      'activeSegmentStartedAt', workout.active_segment_started_at,
      'revision', workout.revision,
      'exercises', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', occurrence.id,
            'exerciseId', occurrence.exercise_id,
            'position', occurrence.position,
            'exerciseName', occurrence.exercise_name_snapshot,
            'exerciseBaseType', occurrence.exercise_base_type_snapshot,
            'measurementType', occurrence.measurement_type_snapshot,
            'weightIncrement', occurrence.weight_increment_snapshot,
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
            ), '[]'::jsonb),
            'lastPerformance', (
              select jsonb_build_object(
                'workoutId', previous_workout.id,
                'workoutDate', previous_workout.workout_date,
                'measurementType', previous_occurrence.measurement_type_snapshot,
                'sets', coalesce((
                  select jsonb_agg(jsonb_build_object(
                    'id', previous_set.id,
                    'position', previous_set.position,
                    'loadMode', previous_set.load_mode,
                    'loadKg', previous_set.load_kg,
                    'bandDirection', previous_set.band_direction,
                    'bandStrength', previous_set.band_strength,
                    'reps', previous_set.reps
                  ) order by previous_set.position)
                  from public.workout_sets as previous_set
                  where previous_set.workout_exercise_id = previous_occurrence.id
                    and public.workout_set_is_recorded(
                      previous_set.load_mode,
                      previous_set.load_kg,
                      previous_set.band_strength,
                      previous_set.reps
                    )
                ), '[]'::jsonb)
              )
              from public.workout_exercises as previous_occurrence
              join public.workouts as previous_workout on previous_workout.id = previous_occurrence.workout_id
              where previous_occurrence.exercise_id = occurrence.exercise_id
                and previous_workout.status = 'completed'
                and exists (
                  select 1 from public.workout_sets as eligible_set
                  where eligible_set.workout_exercise_id = previous_occurrence.id
                    and public.workout_set_is_recorded(
                      eligible_set.load_mode,
                      eligible_set.load_kg,
                      eligible_set.band_strength,
                      eligible_set.reps
                    )
                )
              order by previous_workout.workout_date desc, previous_workout.finished_at desc
              limit 1
            )
            , 'previousWorkoutNote', (
              select jsonb_build_object(
                'workoutDate', previous_workout.workout_date,
                'note', previous_occurrence.workout_note
              )
              from public.workout_exercises as previous_occurrence
              join public.workouts as previous_workout on previous_workout.id = previous_occurrence.workout_id
              where previous_occurrence.exercise_identity_id = occurrence.exercise_identity_id
                and previous_workout.status = 'completed'
                and btrim(previous_occurrence.workout_note) <> ''
                and not exists (
                  select 1
                  from public.workout_exercises as later_occurrence
                  join public.workouts as later_workout on later_workout.id = later_occurrence.workout_id
                  where later_occurrence.exercise_identity_id = occurrence.exercise_identity_id
                    and later_workout.status = 'completed'
                    and (later_workout.workout_date, later_workout.finished_at) >
                        (previous_workout.workout_date, previous_workout.finished_at)
                )
              order by previous_workout.workout_date desc, previous_workout.finished_at desc
              limit 1
            )
          ) order by occurrence.position
        )
        from public.workout_exercises as occurrence
        where occurrence.workout_id = workout.id
      ), '[]'::jsonb)
    )
    from public.workouts as workout
    where workout.status in ('active', 'paused')
    limit 1
  ), 'null'::jsonb);
$function$;

CREATE OR REPLACE FUNCTION public.get_history_workout (
  p_workout_id uuid
)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
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
            'weightIncrement', occurrence.weight_increment_snapshot,
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

    insert into public.workouts(status, source_kind, source_program_id, source_split_id, source_program_identity_id, source_split_identity_id, program_name_snapshot, split_name_snapshot, workout_date, started_at, active_segment_started_at)
    values ('active', p_source_kind, selected_program.id, selected_split.id, selected_program.id, selected_split.id, selected_program.name, selected_split.name, (p_started_at at time zone configured_time_zone)::date, p_started_at, p_started_at)
    returning id into created_workout_id;

    for item in
      select split_item.position, split_item.planned_sets, split_item.min_reps, split_item.max_reps, exercise.*
      from public.split_exercises as split_item join public.exercises as exercise on exercise.id = split_item.exercise_id
      where split_item.split_id = selected_split.id order by split_item.position
    loop
      insert into public.workout_exercises(workout_id, exercise_id, exercise_identity_id, position, exercise_name_snapshot, exercise_base_type_snapshot, measurement_type_snapshot, weight_increment_snapshot, persistent_note_snapshot, planned_sets_snapshot, min_reps_snapshot, max_reps_snapshot)
      values (created_workout_id, item.id, item.id, item.position, item.name, item.base_type, item.measurement_type, item.weight_increment, item.persistent_note, item.planned_sets, item.min_reps, item.max_reps)
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
      insert into public.workout_exercises(workout_id, exercise_id, exercise_identity_id, position, exercise_name_snapshot, exercise_base_type_snapshot, measurement_type_snapshot, weight_increment_snapshot, persistent_note_snapshot)
      values (created_workout_id, item.id, item.id, item.position, item.name, item.base_type, item.measurement_type, item.weight_increment, item.persistent_note) returning id into created_occurrence_id;
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

CREATE OR REPLACE FUNCTION public.update_exercise_definition (
  p_exercise_id      uuid,
  p_name             text,
  p_base_type        public.exercise_base_type,
  p_persistent_note  text,
  p_load_modes       public.load_mode[],
  p_measurement_type public.exercise_measurement_type DEFAULT 'reps'::public.exercise_measurement_type,
  p_weight_increment numeric                          DEFAULT 2.5
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if not exists (
    select 1
    from public.exercises as exercise
    where exercise.id = p_exercise_id
  ) then
    raise exception using errcode = 'PF004', message = 'Exercise not found';
  end if;

  delete from public.exercise_load_modes
  where exercise_id = p_exercise_id;

  update public.exercises
  set
    name = btrim(p_name),
    base_type = p_base_type,
    measurement_type = p_measurement_type,
    weight_increment = p_weight_increment,
    persistent_note = p_persistent_note
  where id = p_exercise_id;

  insert into public.exercise_load_modes (
    exercise_id,
    exercise_base_type,
    load_mode
  )
  select p_exercise_id, p_base_type, requested_mode
  from unnest(p_load_modes) as requested_mode;

  return p_exercise_id;
end;
$function$;

ALTER TABLE "public"."exercises"
  ADD CONSTRAINT "exercises_weight_increment_check"
    CHECK (((weight_increment > (0)::numeric) AND (weight_increment <= (200)::numeric) AND (weight_increment = round(weight_increment, 2))));

ALTER TABLE "public"."workout_exercises"
  ADD CONSTRAINT "workout_exercises_weight_increment_snapshot_check"
    CHECK (((weight_increment_snapshot > (0)::numeric) AND (weight_increment_snapshot <= (200)::numeric) AND (weight_increment_snapshot = round(weight_increment_snapshot, 2))));

REVOKE ALL ON FUNCTION "public"."create_exercise_definition"(text, public.exercise_base_type, text, public.load_mode[], public.exercise_measurement_type, numeric) FROM PUBLIC;

GRANT EXECUTE
  ON FUNCTION "public"."create_exercise_definition"(text, public.exercise_base_type, text, public.load_mode[], public.exercise_measurement_type, numeric)
  TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."update_exercise_definition"(uuid, text, public.exercise_base_type, text, public.load_mode[], public.exercise_measurement_type, numeric) FROM PUBLIC;

GRANT EXECUTE
  ON FUNCTION "public"."update_exercise_definition"(uuid, text, public.exercise_base_type, text, public.load_mode[], public.exercise_measurement_type, numeric)
  TO "postgres", "service_role";
