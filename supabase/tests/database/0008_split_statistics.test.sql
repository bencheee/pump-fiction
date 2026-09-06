begin;

create extension if not exists pgtap with schema extensions;
select plan(11);

-- T-035 fixtures, prefixed so the other suites and the seed stay unambiguous.
select public.create_exercise_definition('T-035 Press', 'weights', '', array['weight']::public.load_mode[]);
select public.create_program('T-035 Plan A');
select public.create_program('T-035 Plan B');
select public.create_split_definition((select id from public.programs where name = 'T-035 Plan A'), 'T-035 X', array[(select id from public.exercises where name = 'T-035 Press')], array[1], array[8], array[12]);
select public.create_split_definition((select id from public.programs where name = 'T-035 Plan A'), 'T-035 Y', array[(select id from public.exercises where name = 'T-035 Press')], array[1], array[8], array[12]);
select public.create_split_definition((select id from public.programs where name = 'T-035 Plan B'), 'T-035 X', array[(select id from public.exercises where name = 'T-035 Press')], array[1], array[8], array[12]);

create temporary table t035 as
select
  (select id from public.programs where name = 'T-035 Plan A') as plan_a,
  (select id from public.programs where name = 'T-035 Plan B') as plan_b,
  (select split.id from public.splits as split join public.programs as program on program.id = split.program_id where split.name = 'T-035 X' and program.name = 'T-035 Plan A') as x_a,
  (select id from public.splits where name = 'T-035 Y') as y_a,
  (select split.id from public.splits as split join public.programs as program on program.id = split.program_id where split.name = 'T-035 X' and program.name = 'T-035 Plan B') as x_b;

select public.set_current_program((select plan_a from t035), (select x_a from t035));

-- Completed proposed X in Plan A; rotation moves to Y.
select public.start_workout('proposed_split', (select x_a from t035), '', array[]::uuid[], '2026-08-10T10:00:00Z');
select public.apply_active_workout_command('35000000-0000-4000-8000-000000000101', (select id from public.workouts where status = 'active'), 0, 'finish_workout', '{"outcome":"completed","finishedAt":"2026-08-10T11:00:00Z"}'::jsonb, '2026-08-10T11:00:00Z');
-- Incomplete proposed Y: excluded, and rotation stays on Y.
select public.start_workout('proposed_split', (select y_a from t035), '', array[]::uuid[], '2026-08-12T10:00:00Z');
select public.apply_active_workout_command('35000000-0000-4000-8000-000000000102', (select id from public.workouts where status = 'active'), 0, 'finish_workout', '{"outcome":"incomplete","finishedAt":"2026-08-12T10:20:00Z"}'::jsonb, '2026-08-12T10:20:00Z');
-- Completed alternate X in Plan A: counts for X, rotation untouched.
select public.start_workout('alternate_split', (select x_a from t035), '', array[]::uuid[], '2026-08-14T10:00:00Z');
select public.apply_active_workout_command('35000000-0000-4000-8000-000000000103', (select id from public.workouts where status = 'active'), 0, 'finish_workout', '{"outcome":"completed","finishedAt":"2026-08-14T10:30:00Z"}'::jsonb, '2026-08-14T10:30:00Z');
-- A completed one-time workout: never a split statistic.
select public.start_workout('one_time', '00000000-0000-0000-0000-000000000000', 'T-035 Hotel', array[(select id from public.exercises where name = 'T-035 Press')], '2026-08-15T10:00:00Z');
select public.apply_active_workout_command('35000000-0000-4000-8000-000000000104', (select id from public.workouts where status = 'active'), 0, 'finish_workout', '{"outcome":"completed","finishedAt":"2026-08-15T10:45:00Z"}'::jsonb, '2026-08-15T10:45:00Z');
-- Completed proposed X in Plan B, a different identity with the same name.
select public.set_current_program((select plan_b from t035), (select x_b from t035));
select public.start_workout('proposed_split', (select x_b from t035), '', array[]::uuid[], '2026-08-16T10:00:00Z');
select public.apply_active_workout_command('35000000-0000-4000-8000-000000000105', (select id from public.workouts where status = 'active'), 0, 'finish_workout', '{"outcome":"completed","finishedAt":"2026-08-16T10:50:00Z"}'::jsonb, '2026-08-16T10:50:00Z');

select is(jsonb_array_length(public.list_split_workouts()), 4, 'every saved split-sourced workout is returned and the one-time workout is not');
select is((select count(*)::integer from jsonb_array_elements(public.list_split_workouts()) as row where row ->> 'status' = 'incomplete'), 1, 'the incomplete workout is returned with its status so the domain can exclude it');
select is((select count(*)::integer from jsonb_array_elements(public.list_split_workouts()) as row where row ->> 'sourceKind' = 'alternate_split'), 1, 'the alternate workout is returned for its split');
select is(public.list_split_workouts() -> 0 ->> 'workoutDate', '2026-08-16', 'rows come back newest first');
select is(
  (select count(distinct row ->> 'splitIdentityId')::integer from jsonb_array_elements(public.list_split_workouts()) as row where row ->> 'splitNameSnapshot' = 'T-035 X'),
  2,
  'same-named splits in different programs carry different identities'
);
select is(public.list_split_workouts() -> 0 ->> 'programName', 'T-035 Plan B', 'the live program name accompanies each row');
select is((select accumulated_active_seconds from public.workouts where id = (public.list_split_workouts() -> 0 ->> 'workoutId')::uuid), 3000, 'the duration is the recorded active duration');

-- Renaming follows the live name; deleting keeps the snapshot and the identity.
select public.update_split_definition((select x_a from t035), 'T-035 Upper', array[(select id from public.exercises where name = 'T-035 Press')], array[1], array[8], array[12]);
select is(
  (select row ->> 'splitName' from jsonb_array_elements(public.list_split_workouts()) as row where (row ->> 'splitIdentityId')::uuid = (select x_a from t035) limit 1),
  'T-035 Upper',
  'a renamed split reports its live name'
);
select is(
  (select row ->> 'splitNameSnapshot' from jsonb_array_elements(public.list_split_workouts()) as row where (row ->> 'splitIdentityId')::uuid = (select x_a from t035) limit 1),
  'T-035 X',
  'the snapshot still says what the workout was called'
);
select public.delete_split((select x_a from t035));
select is(
  (select count(*)::integer from jsonb_array_elements(public.list_split_workouts()) as row where (row ->> 'splitIdentityId')::uuid = (select x_a from t035)),
  2,
  'a deleted split keeps its workouts under its persistent identity'
);
select ok(
  (select row ->> 'splitName' is null and row ->> 'splitNameSnapshot' = 'T-035 X' from jsonb_array_elements(public.list_split_workouts()) as row where (row ->> 'splitIdentityId')::uuid = (select x_a from t035) limit 1),
  'after deletion the live name is null and the snapshot names the split'
);

select * from finish();
rollback;
