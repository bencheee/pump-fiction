begin;

create extension if not exists pgtap with schema extensions;
select plan(9);

insert into public.exercises (id, name, base_type, persistent_note)
values
  ('16000000-0000-4000-8000-000000000001', 'T-016 Squat', 'weights', ''),
  ('16000000-0000-4000-8000-000000000002', 'T-016 Row', 'weights', '');
insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
values
  ('16000000-0000-4000-8000-000000000001', 'weights', 'weight'),
  ('16000000-0000-4000-8000-000000000002', 'weights', 'weight');

select public.create_program('T-016 Plan');
select public.create_split_definition(
  (select id from public.programs where name = 'T-016 Plan'),
  'Full',
  array['16000000-0000-4000-8000-000000000001'::uuid, '16000000-0000-4000-8000-000000000002'::uuid],
  array[3, 2],
  array[8, 5],
  array[12, 8]
);
select public.activate_program(
  (select id from public.programs where name = 'T-016 Plan'),
  (select id from public.splits where name = 'Full')
);
select public.start_workout('proposed_split', (select id from public.splits where name = 'Full'), '', array[]::uuid[], '2026-09-04T15:00:00Z');

-- Removing a set while sibling rows remain must renumber without violating
-- the positive-position check (regression for the negative-position defect).
select is((select kind from public.apply_active_workout_command(
  '16000000-0000-4000-8000-000000000010',
  (select id from public.workouts where status = 'active'), 0, 'remove_set',
  jsonb_build_object(
    'workoutSetId',
    (select workout_set.id from public.workout_sets as workout_set
       join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id
      where occurrence.exercise_name_snapshot = 'T-016 Squat' and workout_set.position = 2),
    'confirmedPopulatedRemoval', false
  ),
  '2026-09-04T15:01:00Z'
)), 'applied', 'a set removal with remaining siblings is applied');
select is(
  (select count(*)::integer from public.workout_sets as workout_set
     join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id
    where occurrence.exercise_name_snapshot = 'T-016 Squat'),
  2, 'the remaining set rows survive the removal'
);
select is(
  (select array_agg(workout_set.position order by workout_set.position) from public.workout_sets as workout_set
     join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id
    where occurrence.exercise_name_snapshot = 'T-016 Squat'),
  array[1, 2], 'set positions are renumbered contiguously from one'
);

-- Reordering exercises must swap positions without violating the check.
select is((select kind from public.apply_active_workout_command(
  '16000000-0000-4000-8000-000000000011',
  (select id from public.workouts where status = 'active'), 1, 'reorder_exercises',
  jsonb_build_object('workoutExerciseIds', jsonb_build_array(
    (select id from public.workout_exercises where exercise_name_snapshot = 'T-016 Row'),
    (select id from public.workout_exercises where exercise_name_snapshot = 'T-016 Squat')
  )),
  '2026-09-04T15:02:00Z'
)), 'applied', 'a full exercise reorder is applied');
select is(
  (select array_agg(exercise_name_snapshot order by position) from public.workout_exercises),
  array['T-016 Row', 'T-016 Squat'], 'the delivered order becomes the stored order'
);
select is(
  (select array_agg(position order by position) from public.workout_exercises),
  array[1, 2], 'exercise positions stay contiguous after reordering'
);

-- Removing an exercise while another remains must renumber the survivor.
select is((select kind from public.apply_active_workout_command(
  '16000000-0000-4000-8000-000000000012',
  (select id from public.workouts where status = 'active'), 2, 'remove_exercise',
  jsonb_build_object(
    'workoutExerciseId',
    (select id from public.workout_exercises where exercise_name_snapshot = 'T-016 Row'),
    'confirmedPopulatedRemoval', false
  ),
  '2026-09-04T15:03:00Z'
)), 'applied', 'an exercise removal with a remaining sibling is applied');
select is(
  (select count(*)::integer from public.workout_exercises), 1,
  'the remaining exercise survives the removal'
);
select is(
  (select position from public.workout_exercises where exercise_name_snapshot = 'T-016 Squat'), 1,
  'the surviving exercise is renumbered to position one'
);

select * from finish();
rollback;
