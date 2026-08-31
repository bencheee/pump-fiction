SET local check_function_bodies = off;

CREATE TABLE "public"."active_workout_commands" (
  "command_id"         uuid                     NOT NULL,
  "workout_id"         uuid                     NOT NULL,
  "expected_revision"  bigint                   NOT NULL,
  "resulting_revision" bigint                   NOT NULL,
  "payload"            jsonb                    NOT NULL,
  "client_created_at"  timestamp with time zone NOT NULL,
  "applied_at"         timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "active_workout_commands_check" CHECK ((resulting_revision = (expected_revision + 1))),
  CONSTRAINT "active_workout_commands_expected_revision_check" CHECK ((expected_revision >= 0)),
  CONSTRAINT "active_workout_commands_payload_check" CHECK ((jsonb_typeof(payload) = 'object'::text)),
  CONSTRAINT "active_workout_commands_pkey" PRIMARY KEY (command_id)
);

CREATE TYPE "public"."active_workout_command_operation" AS ENUM (
  'set_workout_exercise_note',
  'pause_timer',
  'resume_timer'
);

ALTER TABLE "public"."active_workout_commands"
  ADD COLUMN "operation" public.active_workout_command_operation NOT NULL;

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
  workout_exercise_id uuid;
  transitioned_at timestamptz;
  next_revision bigint;
begin
  if p_expected_revision < 0 or jsonb_typeof(p_payload) is distinct from 'object' then
    raise exception using errcode = 'PF002', message = 'Invalid active-workout command envelope';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_command_id::text, 0)
  );

  select command.*
  into existing_command
  from public.active_workout_commands as command
  where command.command_id = p_command_id
  for update;

  if found then
    if existing_command.workout_id <> p_workout_id
      or existing_command.expected_revision <> p_expected_revision
      or existing_command.operation <> p_operation
      or existing_command.payload <> p_payload
      or existing_command.client_created_at <> p_client_created_at
    then
      raise exception using errcode = 'PF001', message = 'Command ID was already used for a different command';
    end if;

    return query
    select
      'duplicate'::text,
      existing_command.command_id,
      existing_command.workout_id,
      existing_command.expected_revision,
      existing_command.resulting_revision;
    return;
  end if;

  select workout.*
  into current_workout
  from public.workouts as workout
  where workout.id = p_workout_id
  for update;

  if not found then
    return query
    select 'not_found'::text, p_command_id, p_workout_id, p_expected_revision, null::bigint;
    return;
  end if;

  if current_workout.revision <> p_expected_revision then
    return query
    select 'conflict'::text, p_command_id, p_workout_id, p_expected_revision, current_workout.revision;
    return;
  end if;

  if current_workout.status not in ('active', 'paused') then
    return query
    select 'conflict'::text, p_command_id, p_workout_id, p_expected_revision, current_workout.revision;
    return;
  end if;

  if p_operation = 'set_workout_exercise_note' then
    if not (p_payload ? 'workoutExerciseId' and p_payload ? 'note')
      or p_payload - array['workoutExerciseId', 'note'] <> '{}'::jsonb
      or jsonb_typeof(p_payload -> 'workoutExerciseId') <> 'string'
      or jsonb_typeof(p_payload -> 'note') <> 'string'
    then
      raise exception using errcode = 'PF002', message = 'Invalid workout exercise note payload';
    end if;

    begin
      workout_exercise_id = (p_payload ->> 'workoutExerciseId')::uuid;
    exception when invalid_text_representation then
      raise exception using errcode = 'PF002', message = 'Invalid workout exercise identifier';
    end;

    update public.workout_exercises
    set workout_note = p_payload ->> 'note'
    where id = workout_exercise_id
      and workout_id = p_workout_id;

    if not found then
      raise exception using errcode = 'PF002', message = 'Workout exercise does not belong to the workout';
    end if;
  elsif p_operation in ('pause_timer', 'resume_timer') then
    if not (p_payload ? 'transitionedAt')
      or p_payload - 'transitionedAt' <> '{}'::jsonb
      or jsonb_typeof(p_payload -> 'transitionedAt') <> 'string'
    then
      raise exception using errcode = 'PF002', message = 'Invalid timer transition payload';
    end if;

    begin
      transitioned_at = (p_payload ->> 'transitionedAt')::timestamptz;
    exception when invalid_datetime_format then
      raise exception using errcode = 'PF002', message = 'Invalid timer transition timestamp';
    end;

    if p_operation = 'pause_timer' then
      if current_workout.status <> 'active'
        or current_workout.active_segment_started_at is null
        or transitioned_at < current_workout.active_segment_started_at
      then
        return query
        select 'conflict'::text, p_command_id, p_workout_id, p_expected_revision, current_workout.revision;
        return;
      end if;

      update public.workouts
      set
        status = 'paused',
        accumulated_active_seconds = accumulated_active_seconds
          + floor(extract(epoch from transitioned_at - active_segment_started_at))::integer,
        active_segment_started_at = null
      where id = p_workout_id;
    else
      if current_workout.status <> 'paused' or transitioned_at < current_workout.started_at then
        return query
        select 'conflict'::text, p_command_id, p_workout_id, p_expected_revision, current_workout.revision;
        return;
      end if;

      update public.workouts
      set status = 'active', active_segment_started_at = transitioned_at
      where id = p_workout_id;
    end if;
  else
    raise exception using errcode = 'PF002', message = 'Unsupported active-workout command operation';
  end if;

  next_revision = p_expected_revision + 1;

  update public.workouts
  set revision = next_revision
  where id = p_workout_id;

  insert into public.active_workout_commands (
    command_id,
    workout_id,
    expected_revision,
    resulting_revision,
    operation,
    payload,
    client_created_at
  ) values (
    p_command_id,
    p_workout_id,
    p_expected_revision,
    next_revision,
    p_operation,
    p_payload,
    p_client_created_at
  );

  return query
  select 'applied'::text, p_command_id, p_workout_id, p_expected_revision, next_revision;
end;
$function$;

ALTER TABLE "public"."active_workout_commands"
  ADD CONSTRAINT "active_workout_commands_workout_id_fkey" FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;

CREATE INDEX active_workout_commands_workout_order ON public.active_workout_commands USING btree (workout_id, applied_at, command_id);

REVOKE ALL ON FUNCTION "public"."apply_active_workout_command"(uuid, uuid, bigint, public.active_workout_command_operation, jsonb, timestamp WITH time zone) FROM PUBLIC;

GRANT EXECUTE
  ON FUNCTION "public"."apply_active_workout_command"(uuid, uuid, bigint, public.active_workout_command_operation, jsonb, timestamp WITH time zone)
  TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."active_workout_commands" TO "postgres", "service_role";

GRANT USAGE ON TYPE "public"."active_workout_command_operation" TO "postgres", "service_role";
