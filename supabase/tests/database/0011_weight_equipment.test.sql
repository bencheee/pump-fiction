begin;
select plan(8);

create temporary table equipment_fixture as
select
  public.create_exercise_definition('Equipment standard fixture', 'weights', '', array['weight']::public.load_mode[]) as standard_id,
  public.create_exercise_definition('Equipment dumbbell fixture', 'weights', '', array['weight']::public.load_mode[], 'reps', 'dumbbells') as dumbbell_id;

select is((select weight_equipment from public.exercises where id = (select standard_id from equipment_fixture)), 'standard', 'old callers default to standard equipment');
select is((select weight_equipment from public.exercises where id = (select dumbbell_id from equipment_fixture)), 'dumbbells', 'dumbbell equipment persists');
select throws_ok($$select public.create_exercise_definition('Invalid equipment bodyweight', 'bodyweight', '', array['bodyweight']::public.load_mode[], 'reps', 'dumbbells')$$, '23514', null, 'bodyweight refuses dumbbell equipment');
select throws_ok($$select public.create_exercise_definition('Invalid equipment type', 'weights', '', array['weight']::public.load_mode[], 'reps', 'other')$$, '23514', null, 'equipment values are constrained');

create temporary table equipment_workout as
select public.start_workout('one_time', null, 'Equipment fixture', array[(select dumbbell_id from equipment_fixture)], now()) as id;

select is(public.get_current_workout() #>> '{exercises,0,weightEquipment}', 'dumbbells', 'starting a workout copies equipment');
select public.update_exercise_definition((select dumbbell_id from equipment_fixture), 'Equipment dumbbell fixture', 'weights', '', array['weight']::public.load_mode[], 'reps', 'standard');
select is(public.get_current_workout() #>> '{exercises,0,weightEquipment}', 'dumbbells', 'editing a definition preserves the active snapshot');
select public.apply_active_workout_command(gen_random_uuid(), (select id from equipment_workout), 0, 'add_exercise', jsonb_build_object('exerciseId', (select standard_id from equipment_fixture)), now());
select is(public.get_current_workout() #>> '{exercises,1,weightEquipment}', 'standard', 'adding an exercise copies equipment');
select public.apply_active_workout_command(gen_random_uuid(), (select id from equipment_workout), 1, 'finish_workout', jsonb_build_object('outcome', 'completed', 'finishedAt', now()), now());
select is(public.get_history_workout((select id from equipment_workout)) #>> '{exercises,0,weightEquipment}', 'dumbbells', 'history retains the equipment snapshot');

select * from finish();
rollback;
