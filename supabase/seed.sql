-- Local baseline seed applied by `supabase db reset`.
--
-- The approval-gated verification gate resets the local database, which deletes
-- every row. This seed makes the reset land on an immediately usable
-- application instead of an empty one. It writes through the canonical mutation
-- functions so the deferred definition constraints stay satisfied, and it
-- creates no workout, so History, statistics, and rotation start empty and the
-- pgTAP suites see exactly the state they saw before.
--
-- Names are chosen to stay clear of every fixture name the pgTAP suites look up
-- by name; do not reuse a test fixture name here.
--
-- The block is a single statement, so it runs in one transaction, and it skips
-- itself when data already exists. Restoring a snapshot with `npm run db:restore`
-- replaces this baseline; the baseline is the fallback when no snapshot exists.

do $$
declare
  bench_press_id uuid;
  cable_row_id uuid;
  push_up_id uuid;
  overhead_press_id uuid;
  lateral_raise_id uuid;
  assisted_dip_id uuid;
  pull_up_id uuid;
  back_squat_id uuid;
  romanian_deadlift_id uuid;
  knee_raise_id uuid;
  program_id uuid;
  first_split_id uuid;
begin
  if exists (select 1 from public.exercises)
    or exists (select 1 from public.programs)
  then
    raise notice 'Seed skipped: the local database already holds exercises or programs.';
    return;
  end if;

  bench_press_id = public.create_exercise_definition(
    'Barbell bench press', 'weights', '', array['weight']::public.load_mode[]
  );
  cable_row_id = public.create_exercise_definition(
    'Seated cable row', 'weights', '', array['weight']::public.load_mode[]
  );
  push_up_id = public.create_exercise_definition(
    'Push-up', 'bodyweight', '',
    array['bodyweight', 'bodyweight_resistance_band']::public.load_mode[]
  );
  overhead_press_id = public.create_exercise_definition(
    'Overhead press', 'weights', '', array['weight']::public.load_mode[]
  );
  lateral_raise_id = public.create_exercise_definition(
    'Dumbbell lateral raise', 'weights', '', array['weight']::public.load_mode[]
  );
  assisted_dip_id = public.create_exercise_definition(
    'Assisted dip', 'bodyweight', '',
    array['bodyweight', 'assistance_weight']::public.load_mode[]
  );
  pull_up_id = public.create_exercise_definition(
    'Pull-up', 'bodyweight', '',
    array['bodyweight', 'bodyweight_added_weight']::public.load_mode[]
  );
  back_squat_id = public.create_exercise_definition(
    'Barbell back squat', 'weights', '', array['weight']::public.load_mode[]
  );
  romanian_deadlift_id = public.create_exercise_definition(
    'Romanian deadlift', 'weights', '', array['weight']::public.load_mode[]
  );
  knee_raise_id = public.create_exercise_definition(
    'Hanging knee raise', 'bodyweight', '',
    array['bodyweight']::public.load_mode[]
  );

  program_id = public.create_program('Baseline program');

  first_split_id = public.create_split_definition(
    program_id,
    'Chest and back',
    array[bench_press_id, cable_row_id, push_up_id],
    array[4, 4, 3],
    array[6, 8, 10],
    array[10, 12, 15]
  );
  perform public.create_split_definition(
    program_id,
    'Shoulders and arms',
    array[overhead_press_id, lateral_raise_id, assisted_dip_id, pull_up_id],
    array[4, 3, 3, 3],
    array[6, 10, 8, 5],
    array[10, 15, 12, 10]
  );
  perform public.create_split_definition(
    program_id,
    'Legs and core',
    array[back_squat_id, romanian_deadlift_id, knee_raise_id],
    array[4, 3, 3],
    array[5, 8, 8],
    array[8, 12, 15]
  );

  perform public.set_current_program(program_id, first_split_id);
end;
$$;
