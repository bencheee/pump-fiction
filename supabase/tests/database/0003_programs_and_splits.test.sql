begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

insert into public.exercises (id, name, base_type)
values
  ('12000000-0000-4000-8000-000000000001', 'T-012 Press', 'weights'),
  ('12000000-0000-4000-8000-000000000002', 'T-012 Row', 'weights');

insert into public.exercise_load_modes (exercise_id, exercise_base_type, load_mode)
values
  ('12000000-0000-4000-8000-000000000001', 'weights', 'weight'),
  ('12000000-0000-4000-8000-000000000002', 'weights', 'weight');

select lives_ok(
  $$
    do $block$
    declare
      program_id uuid;
    begin
      program_id = public.create_program('T-012 Plan');
      perform public.create_split_definition(
        program_id,
        'Push',
        array['12000000-0000-4000-8000-000000000001'::uuid],
        array[3], array[8], array[12]
      );
    end
    $block$
  $$,
  'a draft program and valid split prescription are created atomically'
);

select throws_ok(
  $$
    select public.create_split_definition(
      (select id from public.programs where name = 'T-012 Plan'),
      'Invalid range',
      array['12000000-0000-4000-8000-000000000002'::uuid],
      array[3], array[12], array[8]
    )
  $$,
  '23514'::character(5),
  null,
  'minimum reps cannot exceed maximum reps'
);

select lives_ok(
  $$
    select public.set_current_program(
      (select id from public.programs where name = 'T-012 Plan'),
      (select id from public.splits where name = 'Push')
    )
  $$,
  'the current program selects one of its splits'
);

select throws_ok(
  $$ select public.delete_split((select id from public.splits where name = 'Push')) $$,
  'PF104'::character(5),
  'Last split of the current program cannot be deleted',
  'the last split of the current program cannot be deleted'
);

select is(
  public.advance_program_after_proposed_completion(
    (select id from public.programs where name = 'T-012 Plan'),
    (select id from public.splits where name = 'Push')
  ),
  (select id from public.splits where name = 'Push'),
  'a single-split rotation wraps to itself'
);

select is(
  public.advance_program_after_proposed_completion(
    (select id from public.programs where name = 'T-012 Plan'),
    '12000000-0000-4000-8000-000000000099'::uuid
  ),
  (select id from public.splits where name = 'Push'),
  'a non-proposed completion leaves rotation unchanged'
);

select function_privs_are(
  'public',
  'set_current_program',
  array['uuid', 'uuid'],
  'service_role',
  array['EXECUTE'],
  'only the server service role can select the current program'
);

select function_privs_are(
  'public',
  'delete_split',
  array['uuid'],
  'service_role',
  array['EXECUTE'],
  'only the server service role can execute split deletion'
);

select * from finish();

rollback;
