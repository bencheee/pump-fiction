begin;

create extension if not exists pgtap with schema extensions;

select plan(5);

select lives_ok(
  $$
    do $block$
    begin
      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition deferred;

      insert into public.exercises (id, name, base_type)
      values ('01000000-0000-4000-8000-000000000001', 'Valid weight', 'weights');

      insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
      values ('01000000-0000-4000-8000-000000000001', 'weights', 'weight');

      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition immediate;
    end
    $block$
  $$,
  'a complete weights definition satisfies the deferred invariant'
);

select throws_ok(
  $$
    do $block$
    begin
      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition deferred;

      insert into public.exercises (id, name, base_type)
      values ('01000000-0000-4000-8000-000000000002', 'Missing mode', 'weights');

      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition immediate;
    end
    $block$
  $$,
  'PF003'::character(5),
  'Exercise requires at least one load mode',
  'a definition cannot finish without an explicit load mode'
);

select throws_ok(
  $$
    do $block$
    begin
      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition deferred;

      insert into public.exercises (id, name, base_type)
      values ('01000000-0000-4000-8000-000000000003', 'Invalid weight', 'weights');

      insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
      values ('01000000-0000-4000-8000-000000000003', 'weights', 'weight_resistance_band');

      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition immediate;
    end
    $block$
  $$,
  'PF003'::character(5),
  'Invalid weights exercise load modes',
  'a weights definition retains its basic weight mode'
);

select throws_ok(
  $$
    do $block$
    begin
      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition deferred;

      insert into public.exercises (id, name, base_type)
      values ('01000000-0000-4000-8000-000000000004', 'Invalid band', 'band');

      insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
      values
        ('01000000-0000-4000-8000-000000000004', 'band', 'resistance_band'),
        ('01000000-0000-4000-8000-000000000004', 'band', 'weight');

      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition immediate;
    end
    $block$
  $$,
  '23514'::character(5),
  null,
  'a standalone band cannot accept a non-band mode'
);

select function_privs_are(
  'public',
  'create_exercise_definition',
  array['text', 'exercise_base_type', 'text', 'load_mode[]'],
  'service_role',
  array['EXECUTE'],
  'only the server service role can execute the exercise create operation'
);

select * from finish();

rollback;
