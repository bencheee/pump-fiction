begin;
select plan(8);

create temporary table increment_fixture as
select
  public.create_exercise_definition('Increment standard fixture', 'weights', '', array['weight']::public.load_mode[]) as standard_id,
  public.create_exercise_definition('Increment dumbbell fixture', 'weights', '', array['weight']::public.load_mode[], 'reps', 2) as dumbbell_id;

select is((select weight_increment from public.exercises where id = (select standard_id from increment_fixture)), 2.5, 'old callers default to 2.5 kg');
select is((select weight_increment from public.exercises where id = (select dumbbell_id from increment_fixture)), 2::numeric, 'custom increment persists');
select lives_ok($$select public.create_exercise_definition('Bodyweight increment fixture', 'bodyweight', '', array['bodyweight', 'bodyweight_added_weight']::public.load_mode[], 'reps', 1)$$, 'bodyweight permits a weight increment');
select throws_ok($$select public.create_exercise_definition('Invalid increment type', 'weights', '', array['weight']::public.load_mode[], 'reps', 0)$$, '23514', null, 'increment values are constrained');

create temporary table increment_workout as
select public.start_workout('one_time', null, 'Increment fixture', array[(select dumbbell_id from increment_fixture)], now()) as id;

select is(public.get_current_workout() #>> '{exercises,0,weightIncrement}', '2', 'starting a workout copies increment');
select public.update_exercise_definition((select dumbbell_id from increment_fixture), 'Increment dumbbell fixture', 'weights', '', array['weight']::public.load_mode[], 'reps', 2.5);
select is(public.get_current_workout() #>> '{exercises,0,weightIncrement}', '2', 'editing a definition preserves the active snapshot');
select public.apply_active_workout_command(gen_random_uuid(), (select id from increment_workout), 0, 'add_exercise', jsonb_build_object('exerciseId', (select standard_id from increment_fixture)), now());
select is(public.get_current_workout() #>> '{exercises,1,weightIncrement}', '2.5', 'adding an exercise copies increment');
select public.apply_active_workout_command(gen_random_uuid(), (select id from increment_workout), 1, 'finish_workout', jsonb_build_object('outcome', 'completed', 'finishedAt', now()), now());
select is(public.get_history_workout((select id from increment_workout)) #>> '{exercises,0,weightIncrement}', '2', 'history retains the increment snapshot');

select * from finish();
rollback;
