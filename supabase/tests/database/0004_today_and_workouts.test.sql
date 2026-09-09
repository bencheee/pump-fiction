begin;

create extension if not exists pgtap with schema extensions;
select plan(19);

insert into public.exercises (id, name, base_type, persistent_note)
values ('14000000-0000-4000-8000-000000000001', 'T-014 Press', 'weights', 'Brace hard');
insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
values ('14000000-0000-4000-8000-000000000001', 'weights', 'weight');

select public.create_program('T-014 Plan');
select public.create_split_definition((select id from public.programs where name = 'T-014 Plan'), 'Push', array['14000000-0000-4000-8000-000000000001'::uuid], array[3], array[8], array[12]);
select public.create_split_definition((select id from public.programs where name = 'T-014 Plan'), 'Next', array['14000000-0000-4000-8000-000000000001'::uuid], array[2], array[5], array[8]);
select public.set_current_program((select id from public.programs where name = 'T-014 Plan'), (select id from public.splits where name = 'Push'));

select is(public.get_today_view() #>> '{proposedSplit,exercises,0,exerciseName}', 'T-014 Press', 'Today includes the proposed split exercise preview in its aggregate');

select is(
  (select public.start_workout_and_get_current('proposed_split', (select id from public.splits where name = 'Push'), '', array[]::uuid[], '2026-09-03T10:00:00Z') #>> '{name}'),
  'Push',
  'a proposed workout starts atomically and returns its hydrated snapshot'
);
select is((select status::text from public.workouts where status in ('active', 'paused')), 'active', 'the new workout is active');
select is((select split_name_snapshot from public.workouts where status = 'active'), 'Push', 'the split name is snapshotted');
select is((select count(*)::integer from public.workout_exercises), 1, 'the prescribed exercise is snapshotted');
select is((select count(*)::integer from public.workout_sets), 3, 'exactly the planned set rows are created');
select is(public.get_today_view() #>> '{currentWorkout,name}', 'Push', 'Today exposes the current workout instead of a second start');

select is((select kind from public.apply_active_workout_command(
  '14000000-0000-4000-8000-000000000010',
  (select id from public.workouts where status = 'active'), 0, 'update_set',
  jsonb_build_object('workoutSetId', (select id from public.workout_sets order by position limit 1), 'loadMode', 'weight', 'loadKg', 42.5, 'bandDirection', null, 'bandStrength', null, 'reps', 8),
  '2026-09-03T10:01:00Z'
)), 'applied', 'a valid set update is applied');
select ok(
  (select public.workout_set_is_recorded(load_mode, load_kg, band_strength, reps) from public.workout_sets order by position limit 1),
  'the complete set is recorded by its values alone'
);

select is((select kind from public.apply_active_workout_command(
  '14000000-0000-4000-8000-000000000011',
  (select id from public.workouts where status = 'active'), 1, 'finish_workout',
  '{"outcome":"completed","finishedAt":"2026-09-03T10:30:00Z"}'::jsonb,
  '2026-09-03T10:30:00Z'
)), 'applied', 'completion is applied');
select is((select status::text from public.workouts order by created_at desc limit 1), 'completed', 'completion creates eligible History state');
select is((select next_split_id from public.programs where name = 'T-014 Plan'), (select id from public.splits where name = 'Next'), 'proposed completion advances rotation');
select is((select kind from public.apply_active_workout_command(
  '14000000-0000-4000-8000-000000000011',
  (select id from public.workouts where status = 'completed'), 1, 'finish_workout',
  '{"outcome":"completed","finishedAt":"2026-09-03T10:30:00Z"}'::jsonb,
  '2026-09-03T10:30:00Z'
)), 'duplicate', 'completion retry is idempotent');

select lives_ok(
  $$ select public.start_workout('one_time', '00000000-0000-0000-0000-000000000000', 'Hotel', array['14000000-0000-4000-8000-000000000001'::uuid], '2026-09-03T11:00:00Z') $$,
  'a named one-time workout starts with library exercises'
);
select is((select source_kind::text from public.workouts where status = 'active'), 'one_time', 'one-time source is retained');
select is((select count(*)::integer from public.workout_sets), 4, 'the one-time exercise adds exactly one starter set alongside retained History sets');
select ok(
  (select load_mode is null and reps is null and not public.workout_set_is_recorded(load_mode, load_kg, band_strength, reps) from public.workout_sets order by created_at desc limit 1),
  'the one-time starter set is empty and not recorded'
);
select is((select kind from public.apply_active_workout_command(
  '14000000-0000-4000-8000-000000000012',
  (select id from public.workouts where status = 'active'), 0, 'finish_workout',
  '{"outcome":"discarded","finishedAt":"2026-09-03T11:01:00Z"}'::jsonb,
  '2026-09-03T11:01:00Z'
)), 'applied', 'discard removes the current workout');
select is(public.get_current_workout(), 'null'::jsonb, 'discard leaves no current or historical workout');

select * from finish();
rollback;
