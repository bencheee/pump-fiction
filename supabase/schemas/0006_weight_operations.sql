-- T-038: weight entries and the reads behind S19, S20, and the Today prompt.
--
-- No derivation here. Weekly averages, the provisional rule, the individual
-- change, and the chart series are product rules and live in the History
-- domain, as for exercises in T-033 and splits in T-035. This file stores one
-- weigh-in per local calendar date, returns them with the configured local
-- date, and refuses what the product forbids.
--
-- The `weight_entries_entry_date_key` unique index and the
-- `reject_future_local_entry_date` trigger from T-006 stay the last line of
-- defense. Each write checks the same rules first so the caller receives a
-- named error it can attach to a field, rather than a raw constraint failure.

create or replace function public.weight_entry_json(entry public.weight_entries)
returns jsonb
language sql
immutable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'id', entry.id,
    'entryDate', entry.entry_date,
    'weightKg', entry.weight_kg
  );
$$;

-- The shared value rules of MVP-WGT-001, raised as named errors the server
-- boundary turns into field errors.
create or replace function public.assert_weight_entry_values(
  p_entry_date date,
  p_weight_kg numeric
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
    raise exception using errcode = 'PF302', message = 'A weight entry cannot be dated in the future';
  end if;

  if p_weight_kg is null or p_weight_kg <= 0 then
    raise exception using errcode = 'PF304', message = 'Weight must be above zero';
  end if;
end;
$$;

create or replace function public.get_weight_overview()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'localDate', (pg_catalog.now() at time zone settings.time_zone)::date,
    'entries', coalesce((
      select jsonb_agg(public.weight_entry_json(entry) order by entry.entry_date desc)
      from public.weight_entries as entry
    ), '[]'::jsonb)
  )
  from public.app_settings as settings
  where settings.id = 1;
$$;

create or replace function public.get_weight_entry(p_entry_date date)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select public.weight_entry_json(entry)
  from public.weight_entries as entry
  where entry.entry_date = p_entry_date;
$$;

create or replace function public.create_weight_entry(
  p_entry_date date,
  p_weight_kg numeric
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
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
$$;

create or replace function public.update_weight_entry(
  p_id uuid,
  p_entry_date date,
  p_weight_kg numeric
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
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
$$;

create or replace function public.delete_weight_entry(p_id uuid)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $$
begin
  delete from public.weight_entries where id = p_id;
  if not found then
    raise exception using errcode = 'PF303', message = 'Weight entry does not exist';
  end if;
end;
$$;

revoke execute on function public.weight_entry_json(public.weight_entries) from public, anon, authenticated;
revoke execute on function public.assert_weight_entry_values(date, numeric) from public, anon, authenticated;
revoke execute on function public.get_weight_overview() from public, anon, authenticated;
revoke execute on function public.get_weight_entry(date) from public, anon, authenticated;
revoke execute on function public.create_weight_entry(date, numeric) from public, anon, authenticated;
revoke execute on function public.update_weight_entry(uuid, date, numeric) from public, anon, authenticated;
revoke execute on function public.delete_weight_entry(uuid) from public, anon, authenticated;

-- Both helpers are `security invoker`, so the caller runs them: the five
-- functions above are useless to `service_role` unless it may execute these
-- two as well. Every internal helper in `0001_core.sql` is granted the same way.
grant execute on function public.weight_entry_json(public.weight_entries) to service_role;
grant execute on function public.assert_weight_entry_values(date, numeric) to service_role;
grant execute on function public.get_weight_overview() to service_role;
grant execute on function public.get_weight_entry(date) to service_role;
grant execute on function public.create_weight_entry(date, numeric) to service_role;
grant execute on function public.update_weight_entry(uuid, date, numeric) to service_role;
grant execute on function public.delete_weight_entry(uuid) to service_role;
