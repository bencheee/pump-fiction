SET local check_function_bodies = off;

REVOKE ALL ON TABLE "public"."active_workout_commands" FROM "anon";

REVOKE ALL ON TABLE "public"."active_workout_commands" FROM "authenticated";

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
    then
      raise exception using errcode = 'PF003', message = 'Invalid weights exercise load modes';
    end if;
  elsif checked_base_type = 'bodyweight' then
    if not (
      checked_modes <@ array[
        'bodyweight',
        'bodyweight_added_weight',
        'bodyweight_resistance_band',
        'bodyweight_assistance_band'
      ]::public.load_mode[]
    ) then
      raise exception using errcode = 'PF003', message = 'Invalid bodyweight exercise load modes';
    end if;
  elsif checked_base_type = 'assisted' then
    if not (
      checked_modes <@ array['assistance_weight', 'assistance_band']::public.load_mode[]
    ) then
      raise exception using errcode = 'PF003', message = 'Invalid assisted exercise load modes';
    end if;
  elsif checked_base_type = 'band' then
    if cardinality(checked_modes) <> 1
      or checked_modes[1] <> 'resistance_band'::public.load_mode
    then
      raise exception using errcode = 'PF003', message = 'Invalid band exercise load modes';
    end if;
  end if;

  return null;
end;
$function$;

CREATE CONSTRAINT TRIGGER exercise_load_modes_validate_definition
  AFTER INSERT OR DELETE OR UPDATE ON public.exercise_load_modes DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_exercise_load_modes();

CREATE CONSTRAINT TRIGGER exercises_validate_load_modes
  AFTER INSERT OR UPDATE ON public.exercises DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_exercise_load_modes();

REVOKE ALL ON FUNCTION "public"."create_exercise_definition"(text, public.exercise_base_type, text, public.load_mode[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."create_exercise_definition"(text, public.exercise_base_type, text, public.load_mode[]) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."update_exercise_definition"(uuid, text, public.exercise_base_type, text, public.load_mode[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."update_exercise_definition"(uuid, text, public.exercise_base_type, text, public.load_mode[]) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."validate_exercise_load_modes"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."validate_exercise_load_modes"() TO "postgres", "service_role";
