SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.assert_weight_entry_values (
  p_entry_date date,
  p_weight_kg  numeric
)
  RETURNS void
  LANGUAGE plpgsql
  STABLE
  SET search_path TO ''
  AS $function$
declare
  local_today date;
begin
  select (pg_catalog.now() at time zone settings.time_zone)::date
  into local_today
  from public.app_settings as settings
  where settings.id = 1;

  if p_entry_date is null or p_entry_date > local_today then
    raise exception using errcode = 'PF302', message = 'A weight entry cannot be dated in the future';
  end if;

  if p_weight_kg is null or p_weight_kg <= 0 then
    raise exception using errcode = 'PF304', message = 'Weight must be above zero';
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.create_weight_entry (
  p_entry_date date,
  p_weight_kg  numeric
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  created public.weight_entries;
begin
  perform public.assert_weight_entry_values(p_entry_date, p_weight_kg);

  if exists (select 1 from public.weight_entries where entry_date = p_entry_date) then
    raise exception using errcode = 'PF301', message = 'A weight entry already exists for that date';
  end if;

  insert into public.weight_entries (entry_date, weight_kg)
  values (p_entry_date, p_weight_kg)
  returning * into created;

  return public.weight_entry_json(created);
end;
$function$;

CREATE OR REPLACE FUNCTION public.delete_weight_entry (
  p_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  delete from public.weight_entries where id = p_id;
  if not found then
    raise exception using errcode = 'PF303', message = 'Weight entry does not exist';
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_weight_entry (
  p_entry_date date
)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  select public.weight_entry_json(entry)
  from public.weight_entries as entry
  where entry.entry_date = p_entry_date;
$function$;

CREATE OR REPLACE FUNCTION public.get_weight_overview()
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  select jsonb_build_object(
    'localDate', (pg_catalog.now() at time zone settings.time_zone)::date,
    'entries', coalesce((
      select jsonb_agg(public.weight_entry_json(entry) order by entry.entry_date desc)
      from public.weight_entries as entry
    ), '[]'::jsonb)
  )
  from public.app_settings as settings
  where settings.id = 1;
$function$;

CREATE OR REPLACE FUNCTION public.update_weight_entry (
  p_id         uuid,
  p_entry_date date,
  p_weight_kg  numeric
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  updated public.weight_entries;
begin
  perform public.assert_weight_entry_values(p_entry_date, p_weight_kg);

  if not exists (select 1 from public.weight_entries where id = p_id) then
    raise exception using errcode = 'PF303', message = 'Weight entry does not exist';
  end if;

  -- Moving an entry onto another date is a duplicate; staying put is not.
  if exists (
    select 1 from public.weight_entries
    where entry_date = p_entry_date and id <> p_id
  ) then
    raise exception using errcode = 'PF301', message = 'A weight entry already exists for that date';
  end if;

  update public.weight_entries
  set entry_date = p_entry_date, weight_kg = p_weight_kg
  where id = p_id
  returning * into updated;

  return public.weight_entry_json(updated);
end;
$function$;

CREATE OR REPLACE FUNCTION public.weight_entry_json (
  entry public.weight_entries
)
  RETURNS jsonb
  LANGUAGE sql
  IMMUTABLE
  SET search_path TO ''
  AS $function$
  select jsonb_build_object(
    'id', entry.id,
    'entryDate', entry.entry_date,
    'weightKg', entry.weight_kg
  );
$function$;

REVOKE ALL ON FUNCTION "public"."assert_weight_entry_values"(date, numeric) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."assert_weight_entry_values"(date, numeric) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."create_weight_entry"(date, numeric) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."create_weight_entry"(date, numeric) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."delete_weight_entry"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."delete_weight_entry"(uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."get_weight_entry"(date) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."get_weight_entry"(date) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."get_weight_overview"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."get_weight_overview"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."update_weight_entry"(uuid, date, numeric) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."update_weight_entry"(uuid, date, numeric) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."weight_entry_json"(public.weight_entries) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."weight_entry_json"(public.weight_entries) TO "postgres", "service_role";
