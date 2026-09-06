begin;

create extension if not exists pgtap with schema extensions;
select plan(30);

-- T-041 fixtures, prefixed so the seed and the other suites stay unambiguous.
-- Weekly and total changes are product rules and live in the History domain,
-- where the unit suite covers them; this suite covers storage and refusals.
delete from public.measurement_entries
where measurement_type_id in (select id from public.measurement_types where name like 'T-041 %');
delete from public.measurement_types where name like 'T-041 %';

create temporary table t041 as
select
  public.create_measurement_type('T-041 Waist') as waist,
  public.create_measurement_type('T-041 Left arm') as arm,
  public.create_measurement_type('T-041 Spare') as spare;

select is((select waist from t041) ->> 'name', 'T-041 Waist', 'creating a measurement type returns its name');
select is((select waist from t041) ->> 'unit', 'cm', 'a measurement type is always in centimetres');
select is(
  (select count(*)::integer from public.measurement_types where name like 'T-041 %'),
  3,
  'each created type is stored once'
);

select throws_ok(
  $$ select public.create_measurement_type('  t-041 waist  ') $$,
  'PF401'::character(5),
  'A measurement type already uses that name',
  'a name that differs only in case or spacing is refused'
);
select throws_ok(
  $$ select public.create_measurement_type('   ') $$,
  'PF402'::character(5),
  'A measurement type needs a name',
  'a blank name is refused'
);

-- Renaming keeps the identity, which is what keeps the entries attached.
select is(
  public.rename_measurement_type(((select waist from t041) ->> 'id')::uuid, 'T-041 Waist at navel') ->> 'id',
  (select waist from t041) ->> 'id',
  'renaming a measurement type keeps its identity'
);
select is(
  (select name from public.measurement_types where id = ((select waist from t041) ->> 'id')::uuid),
  'T-041 Waist at navel',
  'the new name is stored'
);
select throws_ok(
  $$ select public.rename_measurement_type((select ((select arm from t041) ->> 'id')::uuid), 'T-041 Waist at navel') $$,
  'PF401'::character(5),
  'A measurement type already uses that name',
  'renaming onto an occupied name is refused'
);
select is(
  public.rename_measurement_type(((select waist from t041) ->> 'id')::uuid, 'T-041 Waist at navel') ->> 'name',
  'T-041 Waist at navel',
  'a type that keeps its own name is not its own duplicate'
);
select throws_ok(
  $$ select public.rename_measurement_type('41000000-0000-4000-8000-00000000dead'::uuid, 'T-041 Ghost') $$,
  'PF403'::character(5),
  'Measurement type does not exist',
  'renaming a type that does not exist is refused'
);

-- Entries.
create temporary table t041_entries as
select
  public.create_measurement_entry(((select waist from t041) ->> 'id')::uuid, '2019-06-01', 85.00) as first_entry,
  public.create_measurement_entry(((select waist from t041) ->> 'id')::uuid, '2019-07-01', 84.50) as second_entry;

select is((select first_entry from t041_entries) ->> 'entryDate', '2019-06-01', 'creating a measurement returns the date it was stored under');
select is(((select first_entry from t041_entries) ->> 'valueCm')::numeric, 85.00::numeric, 'creating a measurement returns its centimetres as a number');

select throws_ok(
  $$ select public.create_measurement_entry((select ((select waist from t041) ->> 'id')::uuid), '2019-06-01', 80.00) $$,
  'PF407'::character(5),
  'That measurement already has an entry on that date',
  'a second measurement of one type on one date is refused'
);
select lives_ok(
  $$ select public.create_measurement_entry((select ((select arm from t041) ->> 'id')::uuid), '2019-06-01', 36.50) $$,
  'another type may be measured on the same date'
);
select throws_ok(
  $$ select public.create_measurement_entry((select ((select waist from t041) ->> 'id')::uuid), current_date + 400, 80.00) $$,
  'PF405'::character(5),
  'A measurement cannot be dated in the future',
  'a future local date is refused'
);
select throws_ok(
  $$ select public.create_measurement_entry((select ((select waist from t041) ->> 'id')::uuid), '2019-05-01', 0) $$,
  'PF406'::character(5),
  'A measurement must be above zero',
  'a zero measurement is refused'
);
select throws_ok(
  $$ select public.create_measurement_entry('41000000-0000-4000-8000-00000000dead'::uuid, '2019-05-01', 80.00) $$,
  'PF403'::character(5),
  'Measurement type does not exist',
  'measuring a type that does not exist is refused'
);

-- MVP-BOD-001: the entries are the only record of that measurement.
select throws_ok(
  $$ select public.delete_measurement_type((select ((select waist from t041) ->> 'id')::uuid)) $$,
  'PF404'::character(5),
  'A measurement type with entries cannot be deleted',
  'a measurement type with entries cannot be deleted'
);
select lives_ok(
  $$ select public.delete_measurement_type((select ((select spare from t041) ->> 'id')::uuid)) $$,
  'a measurement type without entries can be deleted'
);
select throws_ok(
  $$ select public.delete_measurement_type('41000000-0000-4000-8000-00000000dead'::uuid) $$,
  'PF403'::character(5),
  'Measurement type does not exist',
  'deleting a type that does not exist is refused'
);

-- Reads.
select is(
  public.get_measurement_entry(((select waist from t041) ->> 'id')::uuid, '2019-07-01') ->> 'id',
  (select second_entry from t041_entries) ->> 'id',
  'a measurement can be read back by its type and local date'
);
select ok(
  public.get_measurement_entry(((select waist from t041) ->> 'id')::uuid, '2019-05-04') is null,
  'a date with no measurement reads as null rather than as an error'
);
select is(
  public.list_body_measurements() ->> 'localDate',
  ((pg_catalog.now() at time zone (select time_zone from public.app_settings where id = 1))::date)::text,
  'the list carries the configured local date the domain derives against'
);
select is(
  (select jsonb_array_length(row -> 'entries')
   from jsonb_array_elements(public.list_body_measurements() -> 'types') as row
   where (row ->> 'id')::uuid = ((select waist from t041) ->> 'id')::uuid),
  2,
  'each type carries its own measurements'
);
select ok(
  (select min(ordinality) from jsonb_array_elements(public.list_body_measurements() -> 'types') with ordinality as row
   where row.value ->> 'name' = 'T-041 Left arm')
  <
  (select min(ordinality) from jsonb_array_elements(public.list_body_measurements() -> 'types') with ordinality as row
   where row.value ->> 'name' = 'T-041 Waist at navel'),
  'types come back ordered by name'
);

-- Corrections.
select is(
  public.update_measurement_entry(((select second_entry from t041_entries) ->> 'id')::uuid, '2019-08-01', 84.25) ->> 'entryDate',
  '2019-08-01',
  'a correction moves the measurement to its new date'
);
select throws_ok(
  $$ select public.update_measurement_entry((select ((select first_entry from t041_entries) ->> 'id')::uuid), '2019-08-01', 80.00) $$,
  'PF407'::character(5),
  'That measurement already has an entry on that date',
  'moving a measurement onto an occupied date of the same type is refused'
);
select throws_ok(
  $$ select public.update_measurement_entry('41000000-0000-4000-8000-00000000dead'::uuid, '2019-08-02', 80.00) $$,
  'PF408'::character(5),
  'Measurement entry does not exist',
  'correcting a measurement that does not exist is refused'
);

select public.delete_measurement_entry(((select second_entry from t041_entries) ->> 'id')::uuid);
select is(
  (select count(*)::integer from public.measurement_entries where id = ((select second_entry from t041_entries) ->> 'id')::uuid),
  0,
  'deleting a measurement removes it'
);
select throws_ok(
  $$ select public.delete_measurement_entry('41000000-0000-4000-8000-00000000dead'::uuid) $$,
  'PF408'::character(5),
  'Measurement entry does not exist',
  'deleting a measurement that does not exist is refused'
);

select * from finish();
rollback;
