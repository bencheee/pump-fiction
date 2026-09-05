begin;

create extension if not exists pgtap with schema extensions;

select plan(11);

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
      values ('01000000-0000-4000-8000-000000000004', 'Invalid bodyweight', 'bodyweight');

      insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
      values
        ('01000000-0000-4000-8000-000000000004', 'bodyweight', 'bodyweight'),
        ('01000000-0000-4000-8000-000000000004', 'bodyweight', 'weight');

      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition immediate;
    end
    $block$
  $$,
  '23514'::character(5),
  null,
  'a bodyweight definition cannot accept a weights mode'
);

select throws_ok(
  $$
    insert into public.exercises (id, name, base_type)
    values ('01000000-0000-4000-8000-000000000005', 'Retired band type', 'band')
  $$,
  '22P02'::character(5),
  null,
  'the standalone band base type no longer exists'
);

select throws_ok(
  $$
    insert into public.exercises (id, name, base_type)
    values ('01000000-0000-4000-8000-000000000008', 'Retired assisted type', 'assisted')
  $$,
  '22P02'::character(5),
  null,
  'the assisted base type no longer exists'
);

select lives_ok(
  $$
    with created_exercise as (
      insert into public.exercises (id, name, base_type)
      values ('01000000-0000-4000-8000-000000000009', 'Assisted chin-up', 'bodyweight')
      returning id, base_type
    )
    insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
    select id, base_type, mode
    from created_exercise,
      unnest(array['bodyweight', 'assistance_weight']::public.load_mode[]) as mode
  $$,
  'a bodyweight definition carries assistance as its single optional addition'
);

select throws_ok(
  $$
    do $block$
    begin
      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition deferred;

      insert into public.exercises (id, name, base_type)
      values ('01000000-0000-4000-8000-000000000010', 'Assist and band', 'bodyweight');

      insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
      values
        ('01000000-0000-4000-8000-000000000010', 'bodyweight', 'bodyweight'),
        ('01000000-0000-4000-8000-000000000010', 'bodyweight', 'assistance_weight'),
        ('01000000-0000-4000-8000-000000000010', 'bodyweight', 'assistance_band');

      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition immediate;
    end
    $block$
  $$,
  '23505'::character(5),
  null,
  'a bodyweight definition cannot hold two assistance modes'
);

select throws_ok(
  $$
    do $block$
    begin
      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition deferred;

      insert into public.exercises (id, name, base_type)
      values ('01000000-0000-4000-8000-000000000006', 'Two additions', 'bodyweight');

      insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
      values
        ('01000000-0000-4000-8000-000000000006', 'bodyweight', 'bodyweight'),
        ('01000000-0000-4000-8000-000000000006', 'bodyweight', 'bodyweight_added_weight'),
        ('01000000-0000-4000-8000-000000000006', 'bodyweight', 'bodyweight_resistance_band');

      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition immediate;
    end
    $block$
  $$,
  '23505'::character(5),
  null,
  'an exercise cannot store two optional additions'
);

select throws_ok(
  $$
    do $block$
    begin
      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition deferred;

      insert into public.exercises (id, name, base_type)
      values ('01000000-0000-4000-8000-000000000007', 'No assistance', 'bodyweight');

      insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
      values ('01000000-0000-4000-8000-000000000007', 'bodyweight', 'bodyweight');

      delete from public.exercise_load_modes
      where exercise_id = '01000000-0000-4000-8000-000000000007';

      set constraints exercises_validate_load_modes, exercise_load_modes_validate_definition immediate;
    end
    $block$
  $$,
  'PF003'::character(5),
  'Exercise requires at least one load mode',
  'a definition cannot finish without any load mode'
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
