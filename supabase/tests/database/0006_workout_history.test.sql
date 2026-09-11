begin;

create extension if not exists pgtap with schema extensions;
select plan(45);

-- T-031 fixtures. Names are prefixed so the unfiltered name lookups in the
-- other suites and the committed seed stay unambiguous.
select public.create_exercise_definition('T-031 Press', 'weights', 'Brace hard', array['weight']::public.load_mode[]);
select public.create_exercise_definition('T-031 Ghost', 'weights', '', array['weight']::public.load_mode[]);
select public.create_program('T-031 Plan');
select public.create_split_definition(
  (select id from public.programs where name = 'T-031 Plan'),
  'T-031 Push',
  array[(select id from public.exercises where name = 'T-031 Press')],
  array[2], array[8], array[12]
);
select public.create_split_definition(
  (select id from public.programs where name = 'T-031 Plan'),
  'T-031 Pull',
  array[(select id from public.exercises where name = 'T-031 Press')],
  array[1], array[6], array[10]
);
select public.set_current_program(
  (select id from public.programs where name = 'T-031 Plan'),
  (select id from public.splits where name = 'T-031 Push')
);

-- A completed August workout with one recorded set of two planned.
select public.start_workout('proposed_split', (select id from public.splits where name = 'T-031 Push'), '', array[]::uuid[], '2026-08-10T10:00:00Z');
select public.apply_active_workout_command(
  '31000000-0000-4000-8000-000000000101',
  (select id from public.workouts where status = 'active'), 0, 'update_set',
  jsonb_build_object(
    'workoutSetId', (select workout_set.id from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'active' order by workout_set.position limit 1),
    'loadMode', 'weight', 'loadKg', 60, 'bandDirection', null, 'bandStrength', null, 'reps', 8
  ),
  '2026-08-10T10:05:00Z'
);
select public.apply_active_workout_command(
  '31000000-0000-4000-8000-000000000102',
  (select id from public.workouts where status = 'active'), 1, 'finish_workout',
  '{"outcome":"completed","finishedAt":"2026-08-10T11:00:00Z"}'::jsonb,
  '2026-08-10T11:00:00Z'
);

-- A completed September alternate with nothing recorded. Empty planned rows do
-- not block completion and the alternate does not move rotation.
select public.start_workout('proposed_split', (select id from public.splits where name = 'T-031 Pull'), '', array[]::uuid[], '2026-09-02T10:00:00Z');
select public.apply_active_workout_command(
  '31000000-0000-4000-8000-000000000103',
  (select id from public.workouts where status = 'active'), 0, 'finish_workout',
  '{"outcome":"completed","finishedAt":"2026-09-02T10:30:00Z"}'::jsonb,
  '2026-09-02T10:30:00Z'
);

-- Reads
select is(jsonb_array_length(public.list_workout_history()), 2, 'saved workouts are grouped by calendar month');
select is(public.list_workout_history() -> 0 ->> 'month', '2026-09', 'the newest month comes first');
select is(public.list_workout_history() -> 0 -> 'workouts' -> 0 ->> 'status', 'completed', 'completion is the only saved workout status');
select is((public.list_workout_history() -> 0 -> 'workouts' -> 0 ->> 'performedExerciseCount')::integer, 0, 'an exercise without a recorded set is not counted as performed');
select is((public.list_workout_history() -> 1 -> 'workouts' -> 0 ->> 'performedExerciseCount')::integer, 1, 'an exercise with a recorded set is counted once');
select is(
  public.get_history_workout((select id from public.workouts where split_name_snapshot = 'T-031 Push' and status = 'completed')) ->> 'name',
  'T-031 Push',
  'the detail renders the saved split-name snapshot'
);
select is(
  public.get_history_workout((select id from public.workouts where split_name_snapshot = 'T-031 Push' and status = 'completed')) -> 'exercises' -> 0 ->> 'exerciseIdentityId',
  (select id::text from public.exercises where name = 'T-031 Press'),
  'the detail exposes the persistent exercise identity'
);
select is(public.get_history_workout('31000000-0000-4000-8000-0000000009ff'), 'null'::jsonb, 'an unknown workout has no History detail');

-- Timing correction
select lives_ok(
  $$ select public.update_history_workout_timing((select id from public.workouts where split_name_snapshot = 'T-031 Push' and status = 'completed'), '2026-08-09', '2026-08-09T09:00:00Z', '2026-08-09T09:45:00Z') $$,
  'the documented timing fields are correctable'
);
select is((select workout_date from public.workouts where split_name_snapshot = 'T-031 Push' and status = 'completed'), '2026-08-09'::date, 'the corrected date is stored');
select is((select accumulated_active_seconds from public.workouts where split_name_snapshot = 'T-031 Push' and status = 'completed'), 3600, 'the recorded active duration is not recomputed from the corrected timestamps');
select throws_ok(
  $$ select public.update_history_workout_timing((select id from public.workouts where split_name_snapshot = 'T-031 Push' and status = 'completed'), '2026-08-09', '2026-08-09T10:00:00Z', '2026-08-09T09:00:00Z') $$,
  'PF206'::character(5),
  'A workout cannot finish before it starts',
  'a finish time before the start time is rejected'
);

-- Notes and sets
select lives_ok(
  $$ select public.set_history_workout_exercise_note((select occurrence.id from public.workout_exercises as occurrence join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push' and occurrence.exercise_name_snapshot = 'T-031 Press'), 'Felt heavy') $$,
  'a workout-specific note is correctable'
);
select is(
  (select occurrence.workout_note from public.workout_exercises as occurrence join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push' and occurrence.exercise_name_snapshot = 'T-031 Press'),
  'Felt heavy',
  'the corrected note is stored with that workout only'
);
select lives_ok(
  $$ select public.update_history_set((select workout_set.id from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push' and workout_set.position = 2), '{"loadMode":"weight","loadKg":65,"bandDirection":null,"bandStrength":null,"reps":6}'::jsonb) $$,
  'a set left without values is correctable afterwards'
);
select is(
  (select count(*)::integer from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push' and public.workout_set_is_recorded(workout_set.load_mode, workout_set.load_kg, workout_set.band_strength, workout_set.reps)),
  2,
  'the corrected set becomes eligible data by its values alone'
);
select throws_ok(
  $$ select public.update_history_set((select workout_set.id from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push' and workout_set.position = 2), '{"loadMode":"assistance_band","loadKg":null,"bandDirection":"assistance","bandStrength":"light","reps":6}'::jsonb) $$,
  '23503'::character(5),
  NULL,
  'a mode outside the snapshotted allowed modes is rejected'
);
select lives_ok(
  $$ select public.add_history_set((select occurrence.id from public.workout_exercises as occurrence join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push' and occurrence.exercise_name_snapshot = 'T-031 Press')) $$,
  'a set can be added to a saved workout'
);
select is(
  (select count(*)::integer from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push'),
  3,
  'the added set joins the saved workout'
);
select throws_ok(
  $$ select public.remove_history_set((select workout_set.id from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push' and workout_set.position = 1), false) $$,
  'PF204'::character(5),
  'Populated set removal requires confirmation',
  'removing a set that holds data requires confirmation'
);
select lives_ok(
  $$ select public.remove_history_set((select workout_set.id from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push' and workout_set.position = 1), true) $$,
  'a confirmed removal of populated data succeeds'
);
select is(
  (select max(workout_set.position)::integer from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push'),
  2,
  'remaining set positions are renumbered contiguously'
);

-- Workout-local exercise changes
select lives_ok(
  $$ select public.add_history_workout_exercise((select id from public.workouts where status = 'completed' and split_name_snapshot = 'T-031 Push'), (select id from public.exercises where name = 'T-031 Ghost')) $$,
  'a library exercise can be added to a saved workout'
);
select is(
  (select count(*)::integer from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id where occurrence.exercise_name_snapshot = 'T-031 Ghost'),
  1,
  'the added exercise receives exactly one empty starter set'
);
select is(
  (select occurrence.exercise_identity_id::text from public.workout_exercises as occurrence where occurrence.exercise_name_snapshot = 'T-031 Ghost'),
  (select id::text from public.exercises where name = 'T-031 Ghost'),
  'the added occurrence snapshots its persistent identity'
);
select throws_ok(
  $$ select public.reorder_history_workout_exercises((select id from public.workouts where status = 'completed' and split_name_snapshot = 'T-031 Push'), array[(select occurrence.id from public.workout_exercises as occurrence where occurrence.exercise_name_snapshot = 'T-031 Ghost')]) $$,
  'PF205'::character(5),
  'Exercise order must contain every occurrence exactly once',
  'a partial order is rejected'
);
select lives_ok(
  $$ select public.reorder_history_workout_exercises(
    (select id from public.workouts where status = 'completed' and split_name_snapshot = 'T-031 Push'),
    array[
      (select occurrence.id from public.workout_exercises as occurrence where occurrence.exercise_name_snapshot = 'T-031 Ghost'),
      (select occurrence.id from public.workout_exercises as occurrence join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push' and occurrence.exercise_name_snapshot = 'T-031 Press')
    ]) $$,
  'a complete order is applied'
);
select is(
  (select occurrence.exercise_name_snapshot from public.workout_exercises as occurrence join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push' and occurrence.position = 1),
  'T-031 Ghost',
  'the corrected order is stored'
);
select throws_ok(
  $$ select public.remove_history_workout_exercise((select occurrence.id from public.workout_exercises as occurrence join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push' and occurrence.exercise_name_snapshot = 'T-031 Press'), false) $$,
  'PF204'::character(5),
  'Populated exercise removal requires confirmation',
  'removing an exercise that holds data requires confirmation'
);

-- Deleting a definition never costs History its identity
select public.delete_exercise((select id from public.exercises where name = 'T-031 Ghost'));
select ok(
  (select occurrence.exercise_id is null from public.workout_exercises as occurrence where occurrence.exercise_name_snapshot = 'T-031 Ghost'),
  'deleting the definition clears the live reference'
);
select ok(
  (select occurrence.exercise_identity_id is not null from public.workout_exercises as occurrence where occurrence.exercise_name_snapshot = 'T-031 Ghost'),
  'the persistent identity survives the deletion'
);
select is(jsonb_array_length(public.list_workout_history()), 2, 'History keeps every workout after a definition is deleted');
select lives_ok(
  $$ select public.remove_history_workout_exercise((select occurrence.id from public.workout_exercises as occurrence where occurrence.exercise_name_snapshot = 'T-031 Ghost'), false) $$,
  'removing an occurrence without data needs no confirmation'
);
select is(
  (select max(occurrence.position)::integer from public.workout_exercises as occurrence join public.workouts as workout on workout.id = occurrence.workout_id where workout.status = 'completed' and workout.split_name_snapshot = 'T-031 Push'),
  1,
  'remaining occurrence positions are renumbered contiguously'
);

-- Templates and rotation are never touched by a correction
select is(
  (select count(*)::integer from public.split_exercises as prescription join public.splits as split on split.id = prescription.split_id where split.name = 'T-031 Push'),
  1,
  'no correction changed the source split template'
);
select is(
  (select next_split_id from public.programs where name = 'T-031 Plan'),
  (select id from public.splits where name = 'T-031 Push'),
  'no correction moved the rotation pointer'
);

-- The current workout is never corrected from History
select lives_ok(
  $$ select public.set_history_workout_exercise_note((select occurrence.id from public.workout_exercises as occurrence join public.workouts as workout on workout.id = occurrence.workout_id where workout.split_name_snapshot = 'T-031 Pull'), 'Knee was sore') $$,
  'the immediately previous workout can retain an exercise note'
);
select public.start_workout('proposed_split', (select id from public.splits where name = 'T-031 Push'), '', array[]::uuid[], '2026-09-06T10:00:00Z');
select is(
  public.get_current_workout() -> 'exercises' -> 0 -> 'previousWorkoutNote' ->> 'note',
  'Knee was sore',
  'the next workout exposes the immediately previous exercise note'
);
select is(public.get_history_workout((select id from public.workouts where status = 'active')), 'null'::jsonb, 'the current workout has no History detail');
select throws_ok(
  $$ select public.delete_history_workout((select id from public.workouts where status = 'active')) $$,
  'PF202'::character(5),
  'The current workout is corrected from the active workout, not from History',
  'History refuses to write to the current workout'
);
select throws_ok(
  $$ select public.delete_history_workout('31000000-0000-4000-8000-0000000009ff') $$,
  'PF201'::character(5),
  'Workout does not exist',
  'an unknown workout is reported as missing'
);

-- Deletion
create temporary table t031_deleted_workout as
select id from public.workouts where split_name_snapshot = 'T-031 Push' and status = 'completed';

select lives_ok(
  $$ select public.delete_history_workout((select id from public.workouts where split_name_snapshot = 'T-031 Push' and status = 'completed')) $$,
  'a saved workout can be deleted'
);
select is(
  (select count(*)::integer from public.workouts where split_name_snapshot = 'T-031 Push' and status = 'completed'),
  0,
  'the deleted workout leaves History'
);
select is(
  (select count(*)::integer from public.workout_sets as workout_set join public.workout_exercises as occurrence on occurrence.id = workout_set.workout_exercise_id where occurrence.workout_id in (select id from t031_deleted_workout)),
  0,
  'its occurrences and sets are deleted with it'
);
select is(
  (select next_split_id from public.programs where name = 'T-031 Plan'),
  (select id from public.splits where name = 'T-031 Push'),
  'deleting a workout never rewinds rotation'
);

select * from finish();
rollback;
