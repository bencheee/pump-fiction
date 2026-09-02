SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.activate_program (
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
      and status = 'active'
  ) then
    raise exception using errcode = 'PF102', message = 'Invalid next split';
  end if;

  update public.programs
  set status = 'archived', next_split_id = null
  where status = 'active'
    and id <> p_program_id;

  update public.programs
  set status = 'active', next_split_id = p_next_split_id
  where id = p_program_id;

  return p_program_id;
end;
$function$;

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
  where program.id = p_program_id
    and program.status = 'active'
  for update;

  if not found or current_next_split_id <> p_completed_split_id then
    return current_next_split_id;
  end if;

  select position
  into completed_position
  from public.splits
  where id = p_completed_split_id
    and program_id = p_program_id
    and status = 'active';

  if not found then
    return current_next_split_id;
  end if;

  select split.id
  into next_active_split_id
  from public.splits as split
  where split.program_id = p_program_id
    and split.status = 'active'
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

CREATE OR REPLACE FUNCTION public.archive_program (
  p_program_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  update public.programs
  set status = 'archived', next_split_id = null
  where id = p_program_id;

  if not found then
    raise exception using errcode = 'PF101', message = 'Program not found';
  end if;

  return p_program_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.archive_split (
  p_split_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  target_split public.splits%rowtype;
  successor_id uuid;
begin
  select split.*
  into target_split
  from public.splits as split
  where split.id = p_split_id
  for update;

  if not found then
    raise exception using errcode = 'PF101', message = 'Split not found';
  end if;

  if target_split.status = 'archived' then
    return p_split_id;
  end if;

  select split.id
  into successor_id
  from public.splits as split
  where split.program_id = target_split.program_id
    and split.id <> p_split_id
    and split.status = 'active'
  order by
    case when split.position > target_split.position then 0 else 1 end,
    split.position
  limit 1;

  if successor_id is null then
    raise exception using errcode = 'PF104', message = 'Last active split cannot be archived';
  end if;

  update public.programs
  set next_split_id = successor_id
  where id = target_split.program_id
    and status = 'active'
    and next_split_id = p_split_id;

  update public.splits
  set status = 'archived'
  where id = p_split_id;

  return p_split_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.create_program (
  p_name text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  created_program_id uuid;
begin
  insert into public.programs (name)
  values (btrim(p_name))
  returning id into created_program_id;

  return created_program_id;
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
    where exercise.status is distinct from 'active'::public.entity_status
  ) then
    raise exception using errcode = 'PF103', message = 'Inactive exercise cannot be added';
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

CREATE OR REPLACE FUNCTION public.reorder_program_splits (
  p_program_id uuid,
  p_split_ids  uuid[]
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  split_count integer;
  maximum_position integer;
begin
  perform 1 from public.programs where id = p_program_id for update;
  if not found then
    raise exception using errcode = 'PF101', message = 'Program not found';
  end if;

  select count(*), coalesce(max(position), 0)
  into split_count, maximum_position
  from public.splits
  where program_id = p_program_id;

  if p_split_ids is null
    or cardinality(p_split_ids) <> split_count
    or exists (
      select requested.split_id
      from unnest(p_split_ids) as requested(split_id)
      group by requested.split_id
      having count(*) <> 1
    )
    or exists (
      select 1
      from unnest(p_split_ids) as requested(split_id)
      where not exists (
        select 1 from public.splits
        where id = requested.split_id and program_id = p_program_id
      )
    )
  then
    raise exception using errcode = 'PF105', message = 'Invalid split order';
  end if;

  update public.splits
  set position = position + maximum_position
  where program_id = p_program_id;

  update public.splits as split
  set position = requested.position::integer
  from unnest(p_split_ids) with ordinality as requested(split_id, position)
  where split.id = requested.split_id
    and split.program_id = p_program_id;

  return p_program_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.reorder_split_exercises (
  p_split_id     uuid,
  p_exercise_ids uuid[]
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  exercise_count integer;
  maximum_position integer;
begin
  perform 1 from public.splits where id = p_split_id for update;
  if not found then
    raise exception using errcode = 'PF101', message = 'Split not found';
  end if;

  select count(*), coalesce(max(position), 0)
  into exercise_count, maximum_position
  from public.split_exercises
  where split_id = p_split_id;

  if p_exercise_ids is null
    or cardinality(p_exercise_ids) <> exercise_count
    or exists (
      select requested.exercise_id
      from unnest(p_exercise_ids) as requested(exercise_id)
      group by requested.exercise_id
      having count(*) <> 1
    )
    or exists (
      select 1
      from unnest(p_exercise_ids) as requested(exercise_id)
      where not exists (
        select 1 from public.split_exercises
        where split_id = p_split_id and exercise_id = requested.exercise_id
      )
    )
  then
    raise exception using errcode = 'PF105', message = 'Invalid exercise order';
  end if;

  update public.split_exercises
  set position = position + maximum_position
  where split_id = p_split_id;

  update public.split_exercises as split_exercise
  set position = requested.position::integer
  from unnest(p_exercise_ids) with ordinality as requested(exercise_id, position)
  where split_exercise.exercise_id = requested.exercise_id
    and split_exercise.split_id = p_split_id;

  return p_split_id;
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
    and status = 'active'
    and exists (
      select 1
      from public.splits
      where id = p_split_id
        and program_id = p_program_id
        and status = 'active'
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

CREATE OR REPLACE FUNCTION public.update_program_name (
  p_program_id uuid,
  p_name       text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  update public.programs
  set name = btrim(p_name)
  where id = p_program_id;

  if not found then
    raise exception using errcode = 'PF101', message = 'Program not found';
  end if;

  return p_program_id;
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
    where exercise.status is distinct from 'active'::public.entity_status
      and not exists (
        select 1
        from public.split_exercises as existing
        where existing.split_id = p_split_id
          and existing.exercise_id = requested.exercise_id
      )
  ) then
    raise exception using errcode = 'PF103', message = 'Inactive exercise cannot be added';
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

REVOKE ALL ON FUNCTION "public"."activate_program"(uuid, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."activate_program"(uuid, uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."advance_program_after_proposed_completion"(uuid, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."advance_program_after_proposed_completion"(uuid, uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."archive_program"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."archive_program"(uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."archive_split"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."archive_split"(uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."create_program"(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."create_program"(text) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."create_split_definition"(uuid, text, uuid[], integer[], integer[], integer[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."create_split_definition"(uuid, text, uuid[], integer[], integer[], integer[]) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."reorder_program_splits"(uuid, uuid[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."reorder_program_splits"(uuid, uuid[]) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."reorder_split_exercises"(uuid, uuid[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."reorder_split_exercises"(uuid, uuid[]) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."set_program_next_split"(uuid, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."set_program_next_split"(uuid, uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."update_program_name"(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."update_program_name"(uuid, text) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."update_split_definition"(uuid, text, uuid[], integer[], integer[], integer[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."update_split_definition"(uuid, text, uuid[], integer[], integer[], integer[]) TO "postgres", "service_role";
