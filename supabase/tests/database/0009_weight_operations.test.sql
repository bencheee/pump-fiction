begin;

create extension if not exists pgtap with schema extensions;
select plan(22);

-- T-038 fixtures. The dates sit far in the past so they cannot collide with a
-- real weigh-in, and every assertion filters to them rather than counting the
-- whole table. Weekly averages are not tested here: they are product rules and
-- live in the History domain, where the unit suite covers them.
delete from public.weight_entries where entry_date between '2019-07-01' and '2019-09-30';

create temporary table t038 as
select
  public.create_weight_entry('2019-08-26', 82.00) as first_entry,
  public.create_weight_entry('2019-08-28', 83.50) as second_entry,
  public.create_weight_entry('2019-08-30', 84.00) as third_entry;

select is((select first_entry from t038) ->> 'entryDate', '2019-08-26', 'creating a weigh-in returns the date it was stored under');
select is(((select first_entry from t038) ->> 'weightKg')::numeric, 82.00::numeric, 'creating a weigh-in returns its kilograms as a number');
select is((select weight_kg from public.weight_entries where entry_date = '2019-08-28'), 83.50::numeric, 'the value is stored with its two decimals');

select throws_ok(
  $$ select public.create_weight_entry('2019-08-30', 80.00) $$,
  'PF301'::character(5),
  'A weight entry already exists for that date',
  'a second weigh-in on one date is refused'
);
select throws_ok(
  $$ select public.create_weight_entry(current_date + 400, 80.00) $$,
  'PF302'::character(5),
  'A weight entry cannot be dated in the future',
  'a future local date is refused'
);
select throws_ok(
  $$ select public.create_weight_entry('2019-07-01', 0) $$,
  'PF304'::character(5),
  'Weight must be above zero',
  'a zero weight is refused'
);
select throws_ok(
  $$ select public.create_weight_entry('2019-07-01', -5.00) $$,
  'PF304'::character(5),
  'Weight must be above zero',
  'a negative weight is refused'
);

select is(
  public.get_weight_entry('2019-08-28') ->> 'id',
  (select second_entry from t038) ->> 'id',
  'a weigh-in can be read back by its local date'
);
select ok(
  public.get_weight_entry('2019-07-04') is null,
  'a date with no weigh-in reads as null rather than as an error'
);

select is(
  public.get_weight_overview() ->> 'localDate',
  ((pg_catalog.now() at time zone (select time_zone from public.app_settings where id = 1))::date)::text,
  'the overview carries the configured local date the domain derives against'
);
select is(
  (select count(*)::integer from jsonb_array_elements(public.get_weight_overview() -> 'entries') as row
   where row ->> 'entryDate' between '2019-07-01' and '2019-09-30'),
  3,
  'the overview returns every stored weigh-in'
);
select ok(
  (select min(ordinality) from jsonb_array_elements(public.get_weight_overview() -> 'entries') with ordinality as row
   where row.value ->> 'entryDate' = '2019-08-30')
  <
  (select min(ordinality) from jsonb_array_elements(public.get_weight_overview() -> 'entries') with ordinality as row
   where row.value ->> 'entryDate' = '2019-08-26'),
  'the overview lists weigh-ins newest first'
);

create temporary table t038_moved as
select public.update_weight_entry(((select second_entry from t038) ->> 'id')::uuid, '2019-09-02', 81.25) as entry;

select is((select entry from t038_moved) ->> 'entryDate', '2019-09-02', 'a correction moves the weigh-in to its new date');
select is(
  (select weight_kg from public.weight_entries where id = ((select second_entry from t038) ->> 'id')::uuid),
  81.25::numeric,
  'a correction stores the new value under the same identity'
);
select throws_ok(
  $$ select public.update_weight_entry((select ((select third_entry from t038) ->> 'id')::uuid), '2019-09-02', 80.00) $$,
  'PF301'::character(5),
  'A weight entry already exists for that date',
  'moving a weigh-in onto an occupied date is refused'
);
select is(
  (public.update_weight_entry(((select second_entry from t038) ->> 'id')::uuid, '2019-09-02', 80.75) ->> 'weightKg')::numeric,
  80.75::numeric,
  'a weigh-in that keeps its own date is not its own duplicate'
);
select throws_ok(
  $$ select public.update_weight_entry('38000000-0000-4000-8000-00000000dead'::uuid, '2019-09-03', 80.00) $$,
  'PF303'::character(5),
  'Weight entry does not exist',
  'correcting a weigh-in that does not exist is refused'
);
select throws_ok(
  $$ select public.update_weight_entry((select ((select second_entry from t038) ->> 'id')::uuid), current_date + 400, 80.00) $$,
  'PF302'::character(5),
  'A weight entry cannot be dated in the future',
  'correcting a weigh-in into the future is refused'
);

select public.delete_weight_entry(((select first_entry from t038) ->> 'id')::uuid);
select is(
  (select count(*)::integer from public.weight_entries where entry_date = '2019-08-26'),
  0,
  'deleting a weigh-in removes it'
);
select throws_ok(
  $$ select public.delete_weight_entry('38000000-0000-4000-8000-00000000dead'::uuid) $$,
  'PF303'::character(5),
  'Weight entry does not exist',
  'deleting a weigh-in that does not exist is refused'
);

-- The T-006 constraint and trigger remain the last line of defense behind the
-- named errors above.
select throws_ok(
  $$ insert into public.weight_entries (entry_date, weight_kg) values (current_date + 400, 80.00) $$,
  'P0001'::character(5),
  'Future local dates are not allowed',
  'the trigger still refuses a future date written around the operations'
);
select throws_ok(
  $$ insert into public.weight_entries (entry_date, weight_kg) values ('2019-08-30', 80.00) $$,
  '23505'::character(5),
  NULL,
  'the unique index still refuses a second weigh-in on one date'
);

select * from finish();
rollback;
