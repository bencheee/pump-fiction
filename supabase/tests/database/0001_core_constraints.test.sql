begin;

create extension if not exists pgtap with schema extensions;

select plan(13);

set constraints all immediate;

select results_eq(
  $$select time_zone from public.app_settings where id = 1$$,
  array['Europe/Zagreb'::text],
  'the singleton settings row establishes the accepted local time zone'
);

select lives_ok(
  $$
    with created_exercise as (
      insert into public.exercises (id, name, base_type)
      values ('00000000-0000-0000-0000-000000000001', 'Bench press', 'weights')
      returning id, base_type
    )
    insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
    select id, base_type, 'weight'::public.load_mode
    from created_exercise
  $$,
  'a complete exercise definition with a compatible load mode is accepted'
);

select throws_ok(
  $$
    insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
    values ('00000000-0000-0000-0000-000000000001', 'weights', 'assistance_band')
  $$,
  '23514'::character(5),
  null,
  'a load mode invalid for the exercise base type is rejected'
);

select throws_ok(
  $$
    insert into public.exercises (name, base_type)
    values ('  bench PRESS  ', 'weights')
  $$,
  '23505'::character(5),
  null,
  'active exercise names are unique after trimming and case folding'
);

insert into public.programs (id, name)
values
  ('10000000-0000-0000-0000-000000000001', 'Primary program'),
  ('10000000-0000-0000-0000-000000000002', 'Secondary program'),
  ('10000000-0000-0000-0000-000000000003', 'Invalid pointer program');

insert into public.splits (id, program_id, name, position, status)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Upper', 1, 'active'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Lower', 2, 'active'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Only split', 1, 'active'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Available', 1, 'active'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Archived', 2, 'archived');

update public.programs
set status = 'active', next_split_id = '20000000-0000-0000-0000-000000000001'
where id = '10000000-0000-0000-0000-000000000001';

select throws_ok(
  $$
    update public.programs
    set status = 'active', next_split_id = '20000000-0000-0000-0000-000000000003'
    where id = '10000000-0000-0000-0000-000000000002'
  $$,
  '23505'::character(5),
  null,
  'at most one program can be active'
);

select throws_ok(
  $$
    update public.splits
    set status = 'archived'
    where id = '20000000-0000-0000-0000-000000000003'
  $$,
  'P0001'::character(5),
  'The last active split in a program cannot be archived',
  'the last active split in a program cannot be archived'
);

update public.programs
set status = 'draft', next_split_id = null
where id = '10000000-0000-0000-0000-000000000001';

select throws_ok(
  $$
    update public.programs
    set status = 'active', next_split_id = '20000000-0000-0000-0000-000000000005'
    where id = '10000000-0000-0000-0000-000000000003'
  $$,
  'P0001'::character(5),
  'An active program must point to one of its active splits',
  'an active program cannot point to an archived split'
);

select throws_ok(
  $$
    insert into public.split_exercises (split_id, exercise_id, position, planned_sets, min_reps, max_reps)
    values (
      '20000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000001',
      1,
      3,
      12,
      8
    )
  $$,
  '23514'::character(5),
  null,
  'split prescriptions reject a minimum above the maximum'
);

insert into public.workouts (
  id,
  status,
  source_kind,
  one_time_name,
  workout_date,
  started_at,
  active_segment_started_at
)
values (
  '30000000-0000-0000-0000-000000000001',
  'active',
  'one_time',
  'Current workout',
  (current_timestamp at time zone 'Europe/Zagreb')::date,
  current_timestamp,
  current_timestamp
);

select throws_ok(
  $$
    insert into public.workouts (
      status,
      source_kind,
      one_time_name,
      workout_date,
      started_at,
      active_segment_started_at
    )
    values (
      'active',
      'one_time',
      'Second current workout',
      (current_timestamp at time zone 'Europe/Zagreb')::date,
      current_timestamp,
      current_timestamp
    )
  $$,
  '23505'::character(5),
  null,
  'only one active or paused workout can exist'
);

insert into public.workout_exercises (
  id,
  workout_id,
  exercise_id,
  position,
  exercise_name_snapshot,
  exercise_base_type_snapshot
)
values (
  '40000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  1,
  'Bench press',
  'weights'
);

insert into public.workout_exercise_load_modes (
  workout_exercise_id,
  exercise_base_type_snapshot,
  load_mode
)
values ('40000000-0000-0000-0000-000000000001', 'weights', 'weight');

select throws_ok(
  $$
    insert into public.workout_sets (
      workout_exercise_id,
      position,
      load_mode,
      reps,
      is_confirmed
    )
    values ('40000000-0000-0000-0000-000000000001', 1, 'weight', 8, true)
  $$,
  '23514'::character(5),
  null,
  'a confirmed weight set requires a positive kilogram value'
);

select throws_ok(
  $$
    insert into public.weight_entries (entry_date, weight_kg)
    values (((current_timestamp at time zone 'Europe/Zagreb')::date + 1), 80)
  $$,
  'P0001'::character(5),
  'Future local dates are not allowed',
  'future weight dates are rejected in the configured local time zone'
);

insert into public.weight_entries (entry_date, weight_kg)
values ((current_timestamp at time zone 'Europe/Zagreb')::date, 80);

select throws_ok(
  $$
    insert into public.weight_entries (entry_date, weight_kg)
    values ((current_timestamp at time zone 'Europe/Zagreb')::date, 81)
  $$,
  '23505'::character(5),
  null,
  'only one weight entry is allowed per local date'
);

insert into public.measurement_types (id, name)
values ('50000000-0000-0000-0000-000000000001', 'Waist');

insert into public.measurement_entries (measurement_type_id, entry_date, value_cm)
values (
  '50000000-0000-0000-0000-000000000001',
  (current_timestamp at time zone 'Europe/Zagreb')::date,
  90
);

select throws_ok(
  $$
    insert into public.measurement_entries (measurement_type_id, entry_date, value_cm)
    values (
      '50000000-0000-0000-0000-000000000001',
      (current_timestamp at time zone 'Europe/Zagreb')::date,
      91
    )
  $$,
  '23505'::character(5),
  null,
  'only one measurement entry is allowed per type and local date'
);

select * from finish();

rollback;
