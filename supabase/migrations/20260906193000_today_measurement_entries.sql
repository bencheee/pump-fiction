-- T-053. Today records every measurement the day is missing in one action, so
-- they are written in one transaction: either the day is recorded or nothing
-- is, and a refusal names the measurement it belongs to rather than leaving
-- the user to work out which of several writes failed. Each value still goes
-- through create_measurement_entry, so every rule it enforces holds here.
create or replace function public.create_measurement_entries(
  p_measurement_type_ids uuid[],
  p_entry_date date,
  p_values_cm numeric[]
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  created jsonb := '[]'::jsonb;
  index integer;
begin
  if p_measurement_type_ids is null or pg_catalog.array_length(p_measurement_type_ids, 1) is null then
    raise exception using errcode = 'PF408', message = 'Give at least one measurement';
  end if;

  if pg_catalog.array_length(p_measurement_type_ids, 1)
     <> pg_catalog.array_length(p_values_cm, 1) then
    raise exception using errcode = 'PF408', message = 'Every measurement needs exactly one value';
  end if;

  for index in 1..pg_catalog.array_length(p_measurement_type_ids, 1) loop
    created := created || public.create_measurement_entry(
      p_measurement_type_ids[index],
      p_entry_date,
      p_values_cm[index]
    );
  end loop;

  return created;
end;
$$;

revoke execute on function public.create_measurement_entries(uuid[], date, numeric[]) from public, anon, authenticated;
grant execute on function public.create_measurement_entries(uuid[], date, numeric[]) to service_role;
