SET local check_function_bodies = off;

ALTER TABLE "public"."workout_sets"
  DROP CONSTRAINT "workout_sets_check1";

ALTER TABLE "public"."workout_sets"
  DROP COLUMN "is_confirmed";

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
    insert into public.workout_exercises(workout_id, exercise_id, position, exercise_name_snapshot, exercise_base_type_snapshot, persistent_note_snapshot)
    values (p_workout_id, source_exercise.id, next_position, source_exercise.name, source_exercise.base_type, source_exercise.persistent_note) returning * into target_occurrence;
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

CREATE OR REPLACE FUNCTION public.workout_set_is_recorded (
  p_load_mode     public.load_mode,
  p_load_kg       numeric,
  p_band_strength public.band_strength,
  p_reps          integer
)
  RETURNS boolean
  LANGUAGE sql
  IMMUTABLE
  SET search_path TO ''
  AS $function$
  select p_load_mode is not null
    and p_reps is not null
    and (
      (
        p_load_mode in ('weight', 'weight_resistance_band', 'bodyweight_added_weight', 'assistance_weight')
        and p_load_kg is not null
      )
      or (
        p_load_mode not in ('weight', 'weight_resistance_band', 'bodyweight_added_weight', 'assistance_weight')
        and p_load_kg is null
      )
    )
    and (
      p_load_mode not in ('weight_resistance_band', 'bodyweight_resistance_band', 'assistance_band')
      or p_band_strength is not null
    );
$function$;

REVOKE ALL ON FUNCTION "public"."workout_set_is_recorded"(public.load_mode, numeric, public.band_strength, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."workout_set_is_recorded"(public.load_mode, numeric, public.band_strength, integer) TO "postgres", "service_role";
