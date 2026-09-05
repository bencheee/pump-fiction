begin;

create extension if not exists pgtap with schema extensions;
select plan(12);

-- T-033 fixtures, prefixed so the other suites and the seed stay unambiguous.
select public.create_exercise_definition('T-033 Press', 'weights', 'Brace hard', array['weight']::public.load_mode[]);
select public.create_exercise_definition('T-033 Ghost', 'weights', '', array['weight']::public.load_mode[]);
select public.create_program('T-033 Plan');
select public.create_split_definition(
  (select id from public.programs where name = 'T-033 Plan'),
  'T-033 A',
  array[(select id from public.exercises where name = 'T-033 Press')],
  array[2], array[8], array[12]
);
select public.create_split_definition(
  (select id from public.programs where name = 'T-033 Plan'),
  'T-033 B',
  array[(select id from public.exercises where name = 'T-033 Press')],
  array[1], array[6], array[10]
);
select public.set_current_program(
  (select id from public.programs where name = 'T-033 Plan'),
  (select id from public.splits where name = 'T-033 A')
);

-- A completed August workout with both sets recorded.
select public.start_workout('proposed_split', (select id from public.splits where name = 'T-033 A'), '', array[]::uuid[], '2026-08-10T10:00:00Z');
select public.apply_active_workout_command(
  '33000000-0000-4000-8000-000000000101',
  (select id from public.workouts where status = 'active'), 0, 'update_set',
  jsonb_build_object('workoutSetId', (select workout_set.id from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'active' and workout_set.position = 1),
    'loadMode', 'weight', 'loadKg', 60, 'bandDirection', null, 'bandStrength', null, 'reps', 8),
  '2026-08-10T10:05:00Z'
);
select public.apply_active_workout_command(
  '33000000-0000-4000-8000-000000000102',
  (select id from public.workouts where status = 'active'), 1, 'update_set',
  jsonb_build_object('workoutSetId', (select workout_set.id from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'active' and workout_set.position = 2),
    'loadMode', 'weight', 'loadKg', 80, 'bandDirection', null, 'bandStrength', null, 'reps', 3),
  '2026-08-10T10:15:00Z'
);
select public.apply_active_workout_command(
  '33000000-0000-4000-8000-000000000103',
  (select id from public.workouts where status = 'active'), 2, 'finish_workout',
  '{"outcome":"completed","finishedAt":"2026-08-10T11:00:00Z"}'::jsonb,
  '2026-08-10T11:00:00Z'
);

-- An incomplete September workout that still holds a recorded set. Completing
-- the first workout advanced rotation onto T-033 B, so it starts as proposed.
select public.start_workout('proposed_split', (select id from public.splits where name = 'T-033 B'), '', array[]::uuid[], '2026-09-02T10:00:00Z');
select public.apply_active_workout_command(
  '33000000-0000-4000-8000-000000000104',
  (select id from public.workouts where status = 'active'), 0, 'update_set',
  jsonb_build_object('workoutSetId', (select workout_set.id from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'active' limit 1),
    'loadMode', 'weight', 'loadKg', 200, 'bandDirection', null, 'bandStrength', null, 'reps', 20),
  '2026-09-02T10:05:00Z'
);
select public.apply_active_workout_command(
  '33000000-0000-4000-8000-000000000105',
  (select id from public.workouts where status = 'active'), 1, 'finish_workout',
  '{"outcome":"incomplete","finishedAt":"2026-09-02T10:30:00Z"}'::jsonb,
  '2026-09-02T10:30:00Z'
);

-- A second exercise whose definition is then deleted.
select public.add_history_workout_exercise(
  (select id from public.workouts where split_name_snapshot = 'T-033 A'),
  (select id from public.exercises where name = 'T-033 Ghost')
);
select public.update_history_set(
  (select workout_set.id from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id where occurrence.exercise_name_snapshot = 'T-033 Ghost'),
  '{"loadMode":"weight","loadKg":40,"bandDirection":null,"bandStrength":null,"reps":10}'::jsonb
);
select public.delete_exercise((select id from public.exercises where name = 'T-033 Ghost'));

-- The list
select is(jsonb_array_length(public.list_exercise_history()), 2, 'every identity with a recorded set is listed');
select is(public.list_exercise_history() -> 0 ->> 'exerciseName', 'T-033 Ghost', 'the list is ordered by the latest name snapshot');
select is((public.list_exercise_history() -> 0 ->> 'stillInLibrary')::boolean, false, 'a deleted definition is marked as no longer in the library');
select is((public.list_exercise_history() -> 1 ->> 'stillInLibrary')::boolean, true, 'a surviving definition is not');
select is(
  public.list_exercise_history() -> 1 -> 'latestPerformance' ->> 'workoutId',
  (select id::text from public.workouts where split_name_snapshot = 'T-033 A'),
  'the latest performance skips the newer incomplete workout'
);

-- One identity's performances
select is(
  jsonb_array_length(public.get_exercise_performances((select id from public.exercises where name = 'T-033 Press')) -> 'performances'),
  2,
  'both the completed and the incomplete performance are returned'
);
select is(
  public.get_exercise_performances((select id from public.exercises where name = 'T-033 Press')) -> 'performances' -> 0 ->> 'status',
  'incomplete',
  'performances come back newest first, incomplete included and marked'
);
select is(
  jsonb_array_length(public.get_exercise_performances((select id from public.exercises where name = 'T-033 Press')) -> 'performances' -> 1 -> 'sets'),
  2,
  'each performance carries its stored sets'
);
select is(
  public.get_exercise_performances((select id from public.exercises where name = 'T-033 Press')) -> 'performances' -> 1 -> 'sets' -> 0 ->> 'loadKg',
  '60.00',
  'set values are returned as stored'
);
select is(
  (public.get_exercise_performances((select occurrence.exercise_identity_id from public.workout_exercises as occurrence where occurrence.exercise_name_snapshot = 'T-033 Ghost')) ->> 'stillInLibrary')::boolean,
  false,
  'a deleted definition keeps its performances under its persistent identity'
);
select is(
  public.get_exercise_performances((select occurrence.exercise_identity_id from public.workout_exercises as occurrence where occurrence.exercise_name_snapshot = 'T-033 Ghost')) ->> 'exerciseName',
  'T-033 Ghost',
  'the snapshotted name survives the deletion'
);
select is(
  public.get_exercise_performances('33000000-0000-4000-8000-0000000009ff'),
  'null'::jsonb,
  'an identity with no history has no detail'
);

select * from finish();
rollback;
