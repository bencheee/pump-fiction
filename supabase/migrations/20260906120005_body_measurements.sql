SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.assert_measurement_entry_values (
  p_entry_date date,
  p_value_cm   numeric
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
    raise exception using errcode = 'PF405', message = 'A measurement cannot be dated in the future';
  end if;

  if p_value_cm is null or p_value_cm <= 0 then
    raise exception using errcode = 'PF406', message = 'A measurement must be above zero';
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.create_measurement_entry (
  p_measurement_type_id uuid,
  p_entry_date          date,
  p_value_cm            numeric
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  created public.measurement_entries;
begin
  perform public.assert_measurement_entry_values(p_entry_date, p_value_cm);

  if not exists (select 1 from public.measurement_types where id = p_measurement_type_id) then
    raise exception using errcode = 'PF403', message = 'Measurement type does not exist';
  end if;

  if exists (
    select 1 from public.measurement_entries
    where measurement_type_id = p_measurement_type_id and entry_date = p_entry_date
  ) then
    raise exception using errcode = 'PF407', message = 'That measurement already has an entry on that date';
  end if;

  insert into public.measurement_entries (measurement_type_id, entry_date, value_cm)
  values (p_measurement_type_id, p_entry_date, p_value_cm)
  returning * into created;

  return public.measurement_entry_json(created);
end;
$function$;

CREATE OR REPLACE FUNCTION public.create_measurement_type (
  p_name text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  created public.measurement_types;
begin
  if p_name is null or pg_catalog.btrim(p_name) = '' then
    raise exception using errcode = 'PF402', message = 'A measurement type needs a name';
  end if;

  if exists (
    select 1 from public.measurement_types
    where lower(pg_catalog.btrim(name)) = lower(pg_catalog.btrim(p_name))
  ) then
    raise exception using errcode = 'PF401', message = 'A measurement type already uses that name';
  end if;

  insert into public.measurement_types (name)
  values (pg_catalog.btrim(p_name))
  returning * into created;

  return jsonb_build_object('id', created.id, 'name', created.name, 'unit', created.unit);
end;
$function$;

CREATE OR REPLACE FUNCTION public.delete_measurement_entry (
  p_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  delete from public.measurement_entries where id = p_id;
  if not found then
    raise exception using errcode = 'PF408', message = 'Measurement entry does not exist';
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.delete_measurement_type (
  p_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if not exists (select 1 from public.measurement_types where id = p_id) then
    raise exception using errcode = 'PF403', message = 'Measurement type does not exist';
  end if;

  -- MVP-BOD-001: its entries are the only record of that measurement.
  if exists (select 1 from public.measurement_entries where measurement_type_id = p_id) then
    raise exception using errcode = 'PF404', message = 'A measurement type with entries cannot be deleted';
  end if;

  delete from public.measurement_types where id = p_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_measurement_entry (
  p_measurement_type_id uuid,
  p_entry_date          date
)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  select public.measurement_entry_json(entry)
  from public.measurement_entries as entry
  where entry.measurement_type_id = p_measurement_type_id
    and entry.entry_date = p_entry_date;
$function$;

CREATE OR REPLACE FUNCTION public.list_body_measurements()
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  select jsonb_build_object(
    'localDate', (pg_catalog.now() at time zone settings.time_zone)::date,
    'types', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', measurement_type.id,
          'name', measurement_type.name,
          'unit', measurement_type.unit,
          'entries', coalesce((
            select jsonb_agg(public.measurement_entry_json(entry) order by entry.entry_date desc)
            from public.measurement_entries as entry
            where entry.measurement_type_id = measurement_type.id
          ), '[]'::jsonb)
        )
        order by lower(pg_catalog.btrim(measurement_type.name))
      )
      from public.measurement_types as measurement_type
    ), '[]'::jsonb)
  )
  from public.app_settings as settings
  where settings.id = 1;
$function$;

CREATE OR REPLACE FUNCTION public.measurement_entry_json (
  entry public.measurement_entries
)
  RETURNS jsonb
  LANGUAGE sql
  IMMUTABLE
  SET search_path TO ''
  AS $function$
  select jsonb_build_object(
    'id', entry.id,
    'entryDate', entry.entry_date,
    'valueCm', entry.value_cm
  );
$function$;

CREATE OR REPLACE FUNCTION public.rename_measurement_type (
  p_id   uuid,
  p_name text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  renamed public.measurement_types;
begin
  if p_name is null or pg_catalog.btrim(p_name) = '' then
    raise exception using errcode = 'PF402', message = 'A measurement type needs a name';
  end if;

  if not exists (select 1 from public.measurement_types where id = p_id) then
    raise exception using errcode = 'PF403', message = 'Measurement type does not exist';
  end if;

  if exists (
    select 1 from public.measurement_types
    where lower(pg_catalog.btrim(name)) = lower(pg_catalog.btrim(p_name))
      and id <> p_id
  ) then
    raise exception using errcode = 'PF401', message = 'A measurement type already uses that name';
  end if;

  update public.measurement_types
  set name = pg_catalog.btrim(p_name)
  where id = p_id
  returning * into renamed;

  return jsonb_build_object('id', renamed.id, 'name', renamed.name, 'unit', renamed.unit);
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_measurement_entry (
  p_id         uuid,
  p_entry_date date,
  p_value_cm   numeric
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  target public.measurement_entries;
  updated public.measurement_entries;
begin
  perform public.assert_measurement_entry_values(p_entry_date, p_value_cm);

  select * into target from public.measurement_entries where id = p_id;
  if not found then
    raise exception using errcode = 'PF408', message = 'Measurement entry does not exist';
  end if;

  -- Moving an entry onto another occupied date of the same type is a duplicate;
  -- staying put is not.
  if exists (
    select 1 from public.measurement_entries
    where measurement_type_id = target.measurement_type_id
      and entry_date = p_entry_date
      and id <> p_id
  ) then
    raise exception using errcode = 'PF407', message = 'That measurement already has an entry on that date';
  end if;

  update public.measurement_entries
  set entry_date = p_entry_date, value_cm = p_value_cm
  where id = p_id
  returning * into updated;

  return public.measurement_entry_json(updated);
end;
$function$;

REVOKE ALL ON FUNCTION "public"."assert_measurement_entry_values"(date, numeric) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."assert_measurement_entry_values"(date, numeric) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."create_measurement_entry"(uuid, date, numeric) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."create_measurement_entry"(uuid, date, numeric) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."create_measurement_type"(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."create_measurement_type"(text) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."delete_measurement_entry"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."delete_measurement_entry"(uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."delete_measurement_type"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."delete_measurement_type"(uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."get_measurement_entry"(uuid, date) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."get_measurement_entry"(uuid, date) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."list_body_measurements"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."list_body_measurements"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."measurement_entry_json"(public.measurement_entries) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."measurement_entry_json"(public.measurement_entries) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."rename_measurement_type"(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."rename_measurement_type"(uuid, text) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."update_measurement_entry"(uuid, date, numeric) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."update_measurement_entry"(uuid, date, numeric) TO "postgres", "service_role";
