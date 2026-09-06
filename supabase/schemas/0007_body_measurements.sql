-- T-041: body measurement types, their entries, and the read behind S21 to S24.
--
-- No derivation here. The latest value, the change from the previous
-- measurement, the total change, and the chart series are product rules and
-- live in the History domain, as for weight in T-038. One read returns every
-- type with everything recorded for it, and the domain shapes both the list and
-- one detail from it.
--
-- Under ADR-0024 a type has no archived state. It is deleted only while it has
-- no entry, because those entries are the only record of that measurement; the
-- `on delete restrict` reference from T-006 stays the last line of defense
-- behind the named error below.

create or replace function public.measurement_entry_json(entry public.measurement_entries)
returns jsonb
language sql
immutable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'id', entry.id,
    'entryDate', entry.entry_date,
    'valueCm', entry.value_cm
  );
$$;

-- The shared value rules of MVP-BOD-002, raised as named errors the server
-- boundary turns into field errors.
create or replace function public.assert_measurement_entry_values(
  p_entry_date date,
  p_value_cm numeric
)
returns void
language plpgsql
stable
security invoker
set search_path = ''
as $$
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
$$;

create or replace function public.list_body_measurements()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
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
$$;

create or replace function public.get_measurement_entry(
  p_measurement_type_id uuid,
  p_entry_date date
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select public.measurement_entry_json(entry)
  from public.measurement_entries as entry
  where entry.measurement_type_id = p_measurement_type_id
    and entry.entry_date = p_entry_date;
$$;

create or replace function public.create_measurement_type(p_name text)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
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
$$;

-- Renaming keeps the identity, so every entry stays attached and the unit stays
-- centimetres. Accepted as F-009 readiness answer 2.
create or replace function public.rename_measurement_type(p_id uuid, p_name text)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
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
$$;

create or replace function public.delete_measurement_type(p_id uuid)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $$
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
$$;

create or replace function public.create_measurement_entry(
  p_measurement_type_id uuid,
  p_entry_date date,
  p_value_cm numeric
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
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
$$;

create or replace function public.update_measurement_entry(
  p_id uuid,
  p_entry_date date,
  p_value_cm numeric
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
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
$$;

create or replace function public.delete_measurement_entry(p_id uuid)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $$
begin
  delete from public.measurement_entries where id = p_id;
  if not found then
    raise exception using errcode = 'PF408', message = 'Measurement entry does not exist';
  end if;
end;
$$;

revoke execute on function public.measurement_entry_json(public.measurement_entries) from public, anon, authenticated;
revoke execute on function public.assert_measurement_entry_values(date, numeric) from public, anon, authenticated;
revoke execute on function public.list_body_measurements() from public, anon, authenticated;
revoke execute on function public.get_measurement_entry(uuid, date) from public, anon, authenticated;
revoke execute on function public.create_measurement_type(text) from public, anon, authenticated;
revoke execute on function public.rename_measurement_type(uuid, text) from public, anon, authenticated;
revoke execute on function public.delete_measurement_type(uuid) from public, anon, authenticated;
revoke execute on function public.create_measurement_entry(uuid, date, numeric) from public, anon, authenticated;
revoke execute on function public.update_measurement_entry(uuid, date, numeric) from public, anon, authenticated;
revoke execute on function public.delete_measurement_entry(uuid) from public, anon, authenticated;

-- Both helpers are `security invoker`, so the caller runs them: the functions
-- above are useless to `service_role` unless it may execute these two as well.
-- T-038 learned this the hard way; every internal helper carries the grant.
grant execute on function public.measurement_entry_json(public.measurement_entries) to service_role;
grant execute on function public.assert_measurement_entry_values(date, numeric) to service_role;
grant execute on function public.list_body_measurements() to service_role;
grant execute on function public.get_measurement_entry(uuid, date) to service_role;
grant execute on function public.create_measurement_type(text) to service_role;
grant execute on function public.rename_measurement_type(uuid, text) to service_role;
grant execute on function public.delete_measurement_type(uuid) to service_role;
grant execute on function public.create_measurement_entry(uuid, date, numeric) to service_role;
grant execute on function public.update_measurement_entry(uuid, date, numeric) to service_role;
grant execute on function public.delete_measurement_entry(uuid) to service_role;
