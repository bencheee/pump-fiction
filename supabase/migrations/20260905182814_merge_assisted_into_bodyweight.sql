SET local check_function_bodies = off;

ALTER TABLE "public"."exercise_load_modes"
  DROP CONSTRAINT "exercise_load_modes_check";

ALTER TABLE "public"."workout_exercise_load_modes"
  DROP CONSTRAINT "workout_exercise_load_modes_check";

DROP FUNCTION "public"."create_exercise_definition"(text, public.exercise_base_type, text, public.load_mode[]);

DROP FUNCTION "public"."update_exercise_definition"(uuid, text, public.exercise_base_type, text, public.load_mode[]);

-- The composite foreign keys carry the base type into the child tables, so a
-- column-by-column type swap leaves one side on the replaced type and is
-- rejected. Drop both, convert every column, then restore them unchanged.
ALTER TABLE "public"."exercise_load_modes"
  DROP CONSTRAINT "exercise_load_modes_exercise_id_exercise_base_type_fkey";

ALTER TABLE "public"."workout_exercise_load_modes"
  DROP CONSTRAINT "workout_exercise_load_modes_workout_exercise_id_exercise_b_fkey";

ALTER TYPE "public"."exercise_base_type" RENAME TO "exercise_base_type__pgdelta_replaced";

CREATE TYPE "public"."exercise_base_type" AS ENUM (
  'weights',
  'bodyweight'
);

ALTER TABLE "public"."exercise_load_modes"
  ALTER COLUMN "exercise_base_type" TYPE "public"."exercise_base_type" USING "exercise_base_type"::text::"public"."exercise_base_type";

ALTER TABLE "public"."exercises"
  ALTER COLUMN "base_type" TYPE "public"."exercise_base_type" USING "base_type"::text::"public"."exercise_base_type";

ALTER TABLE "public"."workout_exercise_load_modes"
  ALTER COLUMN "exercise_base_type_snapshot" TYPE "public"."exercise_base_type" USING "exercise_base_type_snapshot"::text::"public"."exercise_base_type";

ALTER TABLE "public"."workout_exercises"
  ALTER COLUMN "exercise_base_type_snapshot" TYPE "public"."exercise_base_type" USING "exercise_base_type_snapshot"::text::"public"."exercise_base_type";

DROP TYPE "public"."exercise_base_type__pgdelta_replaced";

-- The recreated type starts without the grant the declarative schema declares.
GRANT USAGE ON TYPE "public"."exercise_base_type" TO "service_role";

ALTER TABLE "public"."exercise_load_modes"
  ADD CONSTRAINT "exercise_load_modes_exercise_id_exercise_base_type_fkey"
  FOREIGN KEY ("exercise_id", "exercise_base_type")
  REFERENCES "public"."exercises" ("id", "base_type")
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."workout_exercise_load_modes"
  ADD CONSTRAINT "workout_exercise_load_modes_workout_exercise_id_exercise_b_fkey"
  FOREIGN KEY ("workout_exercise_id", "exercise_base_type_snapshot")
  REFERENCES "public"."workout_exercises" ("id", "exercise_base_type_snapshot")
  ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.create_exercise_definition (
  p_name            text,
  p_base_type       public.exercise_base_type,
  p_persistent_note text,
  p_load_modes      public.load_mode[]
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  created_exercise_id uuid;
begin
  insert into public.exercises (name, base_type, persistent_note)
  values (btrim(p_name), p_base_type, p_persistent_note)
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

CREATE OR REPLACE FUNCTION public.update_exercise_definition (
  p_exercise_id     uuid,
  p_name            text,
  p_base_type       public.exercise_base_type,
  p_persistent_note text,
  p_load_modes      public.load_mode[]
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

CREATE OR REPLACE FUNCTION public.validate_exercise_load_modes()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  checked_exercise_id uuid;
  checked_base_type public.exercise_base_type;
  checked_modes public.load_mode[];
begin
  if tg_table_name = 'exercises' then
    if tg_op = 'DELETE' then
      checked_exercise_id = old.id;
    else
      checked_exercise_id = new.id;
    end if;
  else
    if tg_op = 'DELETE' then
      checked_exercise_id = old.exercise_id;
    else
      checked_exercise_id = new.exercise_id;
    end if;
  end if;

  select exercise.base_type
  into checked_base_type
  from public.exercises as exercise
  where exercise.id = checked_exercise_id;

  if not found then
    return null;
  end if;

  select array_agg(mode.load_mode order by mode.load_mode::text)
  into checked_modes
  from public.exercise_load_modes as mode
  where mode.exercise_id = checked_exercise_id;

  if checked_modes is null or cardinality(checked_modes) = 0 then
    raise exception using errcode = 'PF003', message = 'Exercise requires at least one load mode';
  end if;

  if checked_base_type = 'weights' then
    if not ('weight'::public.load_mode = any(checked_modes))
      or not (checked_modes <@ array['weight', 'weight_resistance_band']::public.load_mode[])
      or cardinality(checked_modes) > 2
    then
      raise exception using errcode = 'PF003', message = 'Invalid weights exercise load modes';
    end if;
  elsif checked_base_type = 'bodyweight' then
    if not ('bodyweight'::public.load_mode = any(checked_modes))
      or not (
        checked_modes <@ array[
          'bodyweight',
          'bodyweight_added_weight',
          'bodyweight_resistance_band',
          'assistance_weight',
          'assistance_band'
        ]::public.load_mode[]
      )
      or cardinality(checked_modes) > 2
    then
      raise exception using errcode = 'PF003', message = 'Invalid bodyweight exercise load modes';
    end if;
  end if;

  return null;
end;
$function$;

ALTER TABLE "public"."exercise_load_modes"
  ADD CONSTRAINT "exercise_load_modes_check"
    CHECK
    ((((exercise_base_type = 'weights'::public.exercise_base_type) AND (load_mode = ANY (ARRAY['weight'::public.load_mode, 'weight_resistance_band'::public.load_mode]))) OR
    ((exercise_base_type = 'bodyweight'::public.exercise_base_type) AND (load_mode = ANY (ARRAY['bodyweight'::public.load_mode, 'bodyweight_added_weight'::public.load_mode,
    'bodyweight_resistance_band'::public.load_mode, 'assistance_weight'::public.load_mode, 'assistance_band'::public.load_mode])))));

ALTER TABLE "public"."workout_exercise_load_modes"
  ADD CONSTRAINT "workout_exercise_load_modes_check"
    CHECK
    ((((exercise_base_type_snapshot = 'weights'::public.exercise_base_type) AND (load_mode = ANY (ARRAY['weight'::public.load_mode, 'weight_resistance_band'::public.load_mode])))
    OR
    ((exercise_base_type_snapshot = 'bodyweight'::public.exercise_base_type) AND (load_mode = ANY (ARRAY['bodyweight'::public.load_mode,
    'bodyweight_added_weight'::public.load_mode, 'bodyweight_resistance_band'::public.load_mode, 'assistance_weight'::public.load_mode, 'assistance_band'::public.load_mode])))));

REVOKE ALL ON FUNCTION "public"."create_exercise_definition"(text, public.exercise_base_type, text, public.load_mode[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."create_exercise_definition"(text, public.exercise_base_type, text, public.load_mode[]) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."update_exercise_definition"(uuid, text, public.exercise_base_type, text, public.load_mode[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."update_exercise_definition"(uuid, text, public.exercise_base_type, text, public.load_mode[]) TO "postgres", "service_role";
