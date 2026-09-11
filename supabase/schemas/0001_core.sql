create extension if not exists pgcrypto with schema extensions;

create type public.exercise_base_type as enum ('weights', 'bodyweight');
create type public.exercise_measurement_type as enum ('reps', 'seconds');
create type public.load_mode as enum (
  'weight',
  'weight_resistance_band',
  'bodyweight',
  'bodyweight_added_weight',
  'bodyweight_resistance_band',
  'assistance_weight',
  'assistance_band'
);
create type public.band_direction as enum ('resistance', 'assistance');
create type public.band_strength as enum ('light', 'medium', 'strong');
create type public.workout_status as enum ('active', 'paused', 'completed');
create type public.workout_source_kind as enum ('proposed_split', 'alternate_split', 'one_time');
create type public.active_workout_command_operation as enum (
  'set_workout_exercise_note',
  'pause_timer',
  'resume_timer',
  'update_set',
  'add_set',
  'remove_set',
  'add_exercise',
  'remove_exercise',
  'reorder_exercises',
  'finish_workout'
);

create table public.app_settings (
  id smallint primary key default 1 check (id = 1),
  time_zone text not null,
  current_program_id uuid,
  weight_unit text not null default 'kg' check (weight_unit = 'kg'),
  measurement_unit text not null default 'cm' check (measurement_unit = 'cm'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (btrim(time_zone) <> '')
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_type public.exercise_base_type not null,
  measurement_type public.exercise_measurement_type not null default 'reps',
  persistent_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, base_type),
  check (btrim(name) <> '')
);

create unique index exercises_name_unique
  on public.exercises (lower(btrim(name)));

create table public.exercise_load_modes (
  exercise_id uuid not null,
  exercise_base_type public.exercise_base_type not null,
  load_mode public.load_mode not null,
  primary key (exercise_id, load_mode),
  foreign key (exercise_id, exercise_base_type)
    references public.exercises (id, base_type)
    on update cascade
    on delete cascade,
  check (
    (exercise_base_type = 'weights' and load_mode in ('weight', 'weight_resistance_band'))
    or (
      exercise_base_type = 'bodyweight'
      and load_mode in (
        'bodyweight',
        'bodyweight_added_weight',
        'bodyweight_resistance_band',
        'assistance_weight',
        'assistance_band'
      )
    )
  )
);

create unique index exercise_load_modes_single_modifier
  on public.exercise_load_modes (exercise_id)
  where load_mode in (
    'weight_resistance_band',
    'bodyweight_added_weight',
    'bodyweight_resistance_band',
    'assistance_weight',
    'assistance_band'
  );

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  next_split_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (btrim(name) <> '')
);

create table public.splits (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  name text not null,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, id),
  unique (program_id, position),
  check (btrim(name) <> '')
);

create unique index splits_name_per_program_unique
  on public.splits (program_id, lower(btrim(name)));

alter table public.programs
  add constraint programs_next_split_same_program_fk
  foreign key (id, next_split_id)
  references public.splits (program_id, id)
  on delete set null (next_split_id);

alter table public.app_settings
  add constraint app_settings_current_program_fk
  foreign key (current_program_id)
  references public.programs (id)
  on delete set null;

create table public.split_exercises (
  id uuid primary key default gen_random_uuid(),
  split_id uuid not null references public.splits (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  position integer not null check (position > 0),
  planned_sets integer not null check (planned_sets > 0),
  min_reps integer not null check (min_reps > 0),
  max_reps integer not null check (max_reps > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (split_id, exercise_id),
  unique (split_id, position),
  check (min_reps <= max_reps)
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  status public.workout_status not null,
  source_kind public.workout_source_kind not null,
  source_program_id uuid references public.programs (id) on delete set null,
  source_split_id uuid references public.splits (id) on delete set null,
  -- Persistent identity snapshots. The references above become null when a
  -- template is deleted under ADR-0024; these never do, so split History keeps
  -- grouping the same split across renames, edits, and deletion.
  source_program_identity_id uuid,
  source_split_identity_id uuid,
  program_name_snapshot text,
  split_name_snapshot text,
  one_time_name text,
  workout_date date not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  accumulated_active_seconds integer not null default 0 check (accumulated_active_seconds >= 0),
  active_segment_started_at timestamptz,
  revision bigint not null default 0 check (revision >= 0),
  rotation_advanced_at timestamptz,
  rotation_advanced_to_split_id uuid references public.splits (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (
      source_kind = 'one_time'
      and source_program_id is null
      and source_split_id is null
      and program_name_snapshot is null
      and split_name_snapshot is null
      and one_time_name is not null
      and btrim(one_time_name) <> ''
    )
    or (
      source_kind in ('proposed_split', 'alternate_split')
      and program_name_snapshot is not null
      and split_name_snapshot is not null
      and btrim(program_name_snapshot) <> ''
      and btrim(split_name_snapshot) <> ''
      and one_time_name is null
    )
  ),
  check (
    (status = 'active' and active_segment_started_at is not null and finished_at is null)
    or (status = 'paused' and active_segment_started_at is null and finished_at is null)
    or (status = 'completed' and active_segment_started_at is null and finished_at is not null)
  ),
  check (finished_at is null or finished_at >= started_at),
  check (
    rotation_advanced_at is null
    or (source_kind = 'proposed_split' and status = 'completed')
  ),
  check (rotation_advanced_to_split_id is null or rotation_advanced_at is not null),
  check (
    (
      source_kind = 'one_time'
      and source_program_identity_id is null
      and source_split_identity_id is null
    )
    or (
      source_kind in ('proposed_split', 'alternate_split')
      and source_program_identity_id is not null
      and source_split_identity_id is not null
    )
  )
);

create unique index workouts_single_resumable
  on public.workouts ((true))
  where status in ('active', 'paused');

create index workouts_history_order
  on public.workouts (workout_date desc, started_at desc)
  where status = 'completed';

create index workouts_source_split_history
  on public.workouts (source_split_identity_id, workout_date desc)
  where source_split_identity_id is not null;

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid references public.exercises (id) on delete set null,
  -- Persistent identity snapshot. `exercise_id` becomes null when the
  -- definition is deleted under ADR-0024; this never does, so Exercise History
  -- keeps combining performances of the same exercise after deletion.
  exercise_identity_id uuid not null,
  position integer not null check (position > 0),
  exercise_name_snapshot text not null,
  exercise_base_type_snapshot public.exercise_base_type not null,
  measurement_type_snapshot public.exercise_measurement_type not null default 'reps',
  persistent_note_snapshot text not null default '',
  planned_sets_snapshot integer check (planned_sets_snapshot > 0),
  min_reps_snapshot integer check (min_reps_snapshot > 0),
  max_reps_snapshot integer check (max_reps_snapshot > 0),
  workout_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_id, position),
  unique (workout_id, exercise_identity_id),
  unique (id, exercise_base_type_snapshot),
  check (btrim(exercise_name_snapshot) <> ''),
  check (
    (min_reps_snapshot is null and max_reps_snapshot is null)
    or (
      min_reps_snapshot is not null
      and max_reps_snapshot is not null
      and min_reps_snapshot <= max_reps_snapshot
    )
  )
);

alter table public.workouts
  add constraint workouts_source_split_same_program_fk
  foreign key (source_program_id, source_split_id)
  references public.splits (program_id, id)
  on delete set null (source_split_id);

alter table public.workouts
  add constraint workouts_rotation_target_same_program_fk
  foreign key (source_program_id, rotation_advanced_to_split_id)
  references public.splits (program_id, id)
  on delete set null (rotation_advanced_to_split_id);

create index workout_exercises_exercise_history
  on public.workout_exercises (exercise_identity_id, workout_id);

create table public.workout_exercise_load_modes (
  workout_exercise_id uuid not null,
  exercise_base_type_snapshot public.exercise_base_type not null,
  load_mode public.load_mode not null,
  primary key (workout_exercise_id, load_mode),
  foreign key (workout_exercise_id, exercise_base_type_snapshot)
    references public.workout_exercises (id, exercise_base_type_snapshot)
    on delete cascade,
  check (
    (exercise_base_type_snapshot = 'weights' and load_mode in ('weight', 'weight_resistance_band'))
    or (
      exercise_base_type_snapshot = 'bodyweight'
      and load_mode in (
        'bodyweight',
        'bodyweight_added_weight',
        'bodyweight_resistance_band',
        'assistance_weight',
        'assistance_band'
      )
    )
  )
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  position integer not null check (position > 0),
  load_mode public.load_mode,
  load_kg numeric(8, 2),
  band_direction public.band_direction,
  band_strength public.band_strength,
  reps integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_exercise_id, position),
  foreign key (workout_exercise_id, load_mode)
    references public.workout_exercise_load_modes (workout_exercise_id, load_mode)
    on delete restrict,
  check (load_kg is null or load_kg > 0),
  check (reps is null or reps > 0),
  -- Shape only: a partially entered set may still be missing its band strength,
  -- because entry order is the user's choice. Completeness is not a constraint:
  -- `workout_set_is_recorded` derives it from the stored values instead.
  check (
    (load_mode is null and load_kg is null and band_direction is null and band_strength is null)
    or (load_mode = 'weight' and band_direction is null and band_strength is null)
    or (load_mode = 'weight_resistance_band' and band_direction = 'resistance')
    or (load_mode = 'bodyweight' and load_kg is null and band_direction is null and band_strength is null)
    or (
      load_mode = 'bodyweight_added_weight'
      and band_direction is null
      and band_strength is null
    )
    or (
      load_mode = 'bodyweight_resistance_band'
      and load_kg is null
      and band_direction = 'resistance'
    )
    or (load_mode = 'assistance_weight' and band_direction is null and band_strength is null)
    or (
      load_mode = 'assistance_band'
      and load_kg is null
      and band_direction = 'assistance'
    )
  )
);

create table public.active_workout_commands (
  command_id uuid primary key,
  workout_id uuid not null,
  expected_revision bigint not null check (expected_revision >= 0),
  resulting_revision bigint not null check (resulting_revision = expected_revision + 1),
  operation public.active_workout_command_operation not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  client_created_at timestamptz not null,
  applied_at timestamptz not null default now()
);

create index active_workout_commands_workout_order
  on public.active_workout_commands (workout_id, applied_at, command_id);

create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null unique,
  weight_kg numeric(6, 2) not null check (weight_kg > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.measurement_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null default 'cm' check (unit = 'cm'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (btrim(name) <> '')
);

create unique index measurement_types_name_unique
  on public.measurement_types (lower(btrim(name)));

create table public.measurement_entries (
  id uuid primary key default gen_random_uuid(),
  measurement_type_id uuid not null references public.measurement_types (id) on delete restrict,
  entry_date date not null,
  value_cm numeric(7, 2) not null check (value_cm > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (measurement_type_id, entry_date)
);

-- A set is recorded once it holds everything its mode requires. Nothing marks
-- it: the state is derived from the stored values, so History, statistics, and
-- last-performance reads share one definition of what counts.
create or replace function public.workout_set_is_recorded(
  p_load_mode public.load_mode,
  p_load_kg numeric,
  p_band_strength public.band_strength,
  p_reps integer
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_load_mode is not null
    and p_reps is not null
    and (
      (
        p_load_mode in ('weight', 'weight_resistance_band', 'bodyweight_added_weight', 'assistance_weight')
        and p_load_kg is not null
      )
      or (
        p_load_mode not in ('weight', 'weight_resistance_band', 'bodyweight_added_weight', 'assistance_weight')
        and p_load_kg is null
      )
    )
    and (
      p_load_mode not in ('weight_resistance_band', 'bodyweight_resistance_band', 'assistance_band')
      or p_band_strength is not null
    );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.validate_app_time_zone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = new.time_zone
  ) then
    raise exception 'Unknown IANA time zone: %', new.time_zone;
  end if;

  return new;
end;
$$;

create or replace function public.reject_future_local_entry_date()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  configured_time_zone text;
  local_today date;
begin
  select time_zone
  into configured_time_zone
  from public.app_settings
  where id = 1;

  if configured_time_zone is null then
    raise exception 'Application time zone must be configured before dated entries are written';
  end if;

  local_today = (current_timestamp at time zone configured_time_zone)::date;

  if new.entry_date > local_today then
    raise exception 'Future local dates are not allowed';
  end if;

  return new;
end;
$$;

create or replace function public.validate_current_program()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  pointer_split_id uuid;
begin
  if new.current_program_id is null then
    return new;
  end if;

  select next_split_id
  into pointer_split_id
  from public.programs
  where id = new.current_program_id;

  if not found or pointer_split_id is null then
    raise exception 'The current program must point to one of its splits';
  end if;

  return new;
end;
$$;

create or replace function public.validate_split_deletion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.app_settings as settings
    join public.programs as program on program.id = settings.current_program_id
    where program.id = old.program_id
  ) and not exists (
    select 1
    from public.splits
    where program_id = old.program_id
  ) then
    raise exception 'The last split of the current program cannot be deleted';
  end if;

  return null;
end;
$$;

create or replace function public.validate_exercise_load_modes()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  checked_exercise_id uuid;
  checked_base_type public.exercise_base_type;
  checked_modes public.load_mode[];
begin
  if tg_table_name = 'exercises' then
    if tg_op = 'DELETE' then
      checked_exercise_id = old.id;
    else
      checked_exercise_id = new.id;
    end if;
  else
    if tg_op = 'DELETE' then
      checked_exercise_id = old.exercise_id;
    else
      checked_exercise_id = new.exercise_id;
    end if;
  end if;

  select exercise.base_type
  into checked_base_type
  from public.exercises as exercise
  where exercise.id = checked_exercise_id;

  if not found then
    return null;
  end if;

  select array_agg(mode.load_mode order by mode.load_mode::text)
  into checked_modes
  from public.exercise_load_modes as mode
  where mode.exercise_id = checked_exercise_id;

  if checked_modes is null or cardinality(checked_modes) = 0 then
    raise exception using errcode = 'PF003', message = 'Exercise requires at least one load mode';
  end if;

  if checked_base_type = 'weights' then
    if not ('weight'::public.load_mode = any(checked_modes))
      or not (checked_modes <@ array['weight', 'weight_resistance_band']::public.load_mode[])
      or cardinality(checked_modes) > 2
    then
      raise exception using errcode = 'PF003', message = 'Invalid weights exercise load modes';
    end if;
  elsif checked_base_type = 'bodyweight' then
    if not ('bodyweight'::public.load_mode = any(checked_modes))
      or not (
        checked_modes <@ array[
          'bodyweight',
          'bodyweight_added_weight',
          'bodyweight_resistance_band',
          'assistance_weight',
          'assistance_band'
        ]::public.load_mode[]
      )
      or cardinality(checked_modes) > 2
    then
      raise exception using errcode = 'PF003', message = 'Invalid bodyweight exercise load modes';
    end if;
  end if;

  return null;
end;
$$;

create or replace function public.create_exercise_definition(
  p_name text,
  p_base_type public.exercise_base_type,
  p_persistent_note text,
  p_load_modes public.load_mode[],
  p_measurement_type public.exercise_measurement_type default 'reps'
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  created_exercise_id uuid;
begin
  insert into public.exercises (name, base_type, measurement_type, persistent_note)
  values (btrim(p_name), p_base_type, p_measurement_type, p_persistent_note)
  returning id into created_exercise_id;

  insert into public.exercise_load_modes (
    exercise_id,
    exercise_base_type,
    load_mode
  )
  select created_exercise_id, p_base_type, requested_mode
  from unnest(p_load_modes) as requested_mode;

  return created_exercise_id;
end;
$$;

create or replace function public.update_exercise_definition(
  p_exercise_id uuid,
  p_name text,
  p_base_type public.exercise_base_type,
  p_persistent_note text,
  p_load_modes public.load_mode[],
  p_measurement_type public.exercise_measurement_type default 'reps'
)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.exercises as exercise
    where exercise.id = p_exercise_id
  ) then
    raise exception using errcode = 'PF004', message = 'Exercise not found';
  end if;

  delete from public.exercise_load_modes
  where exercise_id = p_exercise_id;

  update public.exercises
  set
    name = btrim(p_name),
    base_type = p_base_type,
    measurement_type = p_measurement_type,
    persistent_note = p_persistent_note
  where id = p_exercise_id;

  insert into public.exercise_load_modes (
    exercise_id,
    exercise_base_type,
    load_mode
  )
  select p_exercise_id, p_base_type, requested_mode
  from unnest(p_load_modes) as requested_mode;

  return p_exercise_id;
end;
$$;

create or replace function public.create_program(p_name text)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  created_program_id uuid;
begin
  insert into public.programs (name)
  values (btrim(p_name))
  returning id into created_program_id;

  return created_program_id;
end;
$$;

create or replace function public.update_program_name(
  p_program_id uuid,
  p_name text
)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
  update public.programs
  set name = btrim(p_name)
  where id = p_program_id;

  if not found then
    raise exception using errcode = 'PF101', message = 'Program not found';
  end if;

  return p_program_id;
end;
$$;

create or replace function public.set_current_program(
  p_program_id uuid,
  p_next_split_id uuid
)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
  perform 1
  from public.programs
  where id = p_program_id
  for update;

  if not found then
    raise exception using errcode = 'PF101', message = 'Program not found';
  end if;

  if not exists (
    select 1
    from public.splits
    where id = p_next_split_id
      and program_id = p_program_id
  ) then
    raise exception using errcode = 'PF102', message = 'Invalid next split';
  end if;

  update public.programs
  set next_split_id = p_next_split_id
  where id = p_program_id;

  update public.app_settings
  set current_program_id = p_program_id
  where id = 1;

  return p_program_id;
end;
$$;

create or replace function public.delete_program(p_program_id uuid)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
  delete from public.programs
  where id = p_program_id;

  if not found then
    raise exception using errcode = 'PF101', message = 'Program not found';
  end if;

  return p_program_id;
end;
$$;

create or replace function public.delete_exercise(p_exercise_id uuid)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
  delete from public.exercises
  where id = p_exercise_id;

  if not found then
    raise exception using errcode = 'PF107', message = 'Exercise not found';
  end if;

  return p_exercise_id;
end;
$$;

create or replace function public.create_split_definition(
  p_program_id uuid,
  p_name text,
  p_exercise_ids uuid[],
  p_planned_sets integer[],
  p_min_reps integer[],
  p_max_reps integer[]
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  created_split_id uuid;
  next_position integer;
begin
  if not exists (select 1 from public.programs where id = p_program_id) then
    raise exception using errcode = 'PF101', message = 'Program not found';
  end if;

  if p_exercise_ids is null
    or p_planned_sets is null
    or p_min_reps is null
    or p_max_reps is null
    or cardinality(p_exercise_ids) is distinct from cardinality(p_planned_sets)
    or cardinality(p_exercise_ids) is distinct from cardinality(p_min_reps)
    or cardinality(p_exercise_ids) is distinct from cardinality(p_max_reps)
  then
    raise exception using errcode = 'PF106', message = 'Invalid split prescription arrays';
  end if;

  if exists (
    select 1
    from unnest(p_exercise_ids) as requested(exercise_id)
    left join public.exercises as exercise on exercise.id = requested.exercise_id
    where exercise.id is null
  ) then
    raise exception using errcode = 'PF103', message = 'Unknown exercise cannot be added';
  end if;

  select coalesce(max(position), 0) + 1
  into next_position
  from public.splits
  where program_id = p_program_id;

  insert into public.splits (program_id, name, position)
  values (p_program_id, btrim(p_name), next_position)
  returning id into created_split_id;

  insert into public.split_exercises (
    split_id,
    exercise_id,
    position,
    planned_sets,
    min_reps,
    max_reps
  )
  select
    created_split_id,
    requested.exercise_id,
    requested.position::integer,
    requested.planned_sets,
    requested.min_reps,
    requested.max_reps
  from unnest(p_exercise_ids, p_planned_sets, p_min_reps, p_max_reps)
    with ordinality as requested(exercise_id, planned_sets, min_reps, max_reps, position);

  return created_split_id;
end;
$$;

create or replace function public.update_split_definition(
  p_split_id uuid,
  p_name text,
  p_exercise_ids uuid[],
  p_planned_sets integer[],
  p_min_reps integer[],
  p_max_reps integer[]
)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
  perform 1
  from public.splits
  where id = p_split_id
  for update;

  if not found then
    raise exception using errcode = 'PF101', message = 'Split not found';
  end if;

  if p_exercise_ids is null
    or p_planned_sets is null
    or p_min_reps is null
    or p_max_reps is null
    or cardinality(p_exercise_ids) is distinct from cardinality(p_planned_sets)
    or cardinality(p_exercise_ids) is distinct from cardinality(p_min_reps)
    or cardinality(p_exercise_ids) is distinct from cardinality(p_max_reps)
  then
    raise exception using errcode = 'PF106', message = 'Invalid split prescription arrays';
  end if;

  if exists (
    select 1
    from unnest(p_exercise_ids) as requested(exercise_id)
    left join public.exercises as exercise on exercise.id = requested.exercise_id
    where exercise.id is null
  ) then
    raise exception using errcode = 'PF103', message = 'Unknown exercise cannot be added';
  end if;

  update public.splits
  set name = btrim(p_name)
  where id = p_split_id;

  delete from public.split_exercises
  where split_id = p_split_id;

  insert into public.split_exercises (
    split_id,
    exercise_id,
    position,
    planned_sets,
    min_reps,
    max_reps
  )
  select
    p_split_id,
    requested.exercise_id,
    requested.position::integer,
    requested.planned_sets,
    requested.min_reps,
    requested.max_reps
  from unnest(p_exercise_ids, p_planned_sets, p_min_reps, p_max_reps)
    with ordinality as requested(exercise_id, planned_sets, min_reps, max_reps, position);

  return p_split_id;
end;
$$;

create or replace function public.reorder_program_splits(
  p_program_id uuid,
  p_split_ids uuid[]
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  split_count integer;
  maximum_position integer;
begin
  perform 1 from public.programs where id = p_program_id for update;
  if not found then
    raise exception using errcode = 'PF101', message = 'Program not found';
  end if;

  select count(*), coalesce(max(position), 0)
  into split_count, maximum_position
  from public.splits
  where program_id = p_program_id;

  if p_split_ids is null
    or cardinality(p_split_ids) <> split_count
    or exists (
      select requested.split_id
      from unnest(p_split_ids) as requested(split_id)
      group by requested.split_id
      having count(*) <> 1
    )
    or exists (
      select 1
      from unnest(p_split_ids) as requested(split_id)
      where not exists (
        select 1 from public.splits
        where id = requested.split_id and program_id = p_program_id
      )
    )
  then
    raise exception using errcode = 'PF105', message = 'Invalid split order';
  end if;

  update public.splits
  set position = position + maximum_position
  where program_id = p_program_id;

  update public.splits as split
  set position = requested.position::integer
  from unnest(p_split_ids) with ordinality as requested(split_id, position)
  where split.id = requested.split_id
    and split.program_id = p_program_id;

  return p_program_id;
end;
$$;

create or replace function public.reorder_split_exercises(
  p_split_id uuid,
  p_exercise_ids uuid[]
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  exercise_count integer;
  maximum_position integer;
begin
  perform 1 from public.splits where id = p_split_id for update;
  if not found then
    raise exception using errcode = 'PF101', message = 'Split not found';
  end if;

  select count(*), coalesce(max(position), 0)
  into exercise_count, maximum_position
  from public.split_exercises
  where split_id = p_split_id;

  if p_exercise_ids is null
    or cardinality(p_exercise_ids) <> exercise_count
    or exists (
      select requested.exercise_id
      from unnest(p_exercise_ids) as requested(exercise_id)
      group by requested.exercise_id
      having count(*) <> 1
    )
    or exists (
      select 1
      from unnest(p_exercise_ids) as requested(exercise_id)
      where not exists (
        select 1 from public.split_exercises
        where split_id = p_split_id and exercise_id = requested.exercise_id
      )
    )
  then
    raise exception using errcode = 'PF105', message = 'Invalid exercise order';
  end if;

  update public.split_exercises
  set position = position + maximum_position
  where split_id = p_split_id;

  update public.split_exercises as split_exercise
  set position = requested.position::integer
  from unnest(p_exercise_ids) with ordinality as requested(exercise_id, position)
  where split_exercise.exercise_id = requested.exercise_id
    and split_exercise.split_id = p_split_id;

  return p_split_id;
end;
$$;

create or replace function public.set_program_next_split(
  p_program_id uuid,
  p_split_id uuid
)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
  update public.programs
  set next_split_id = p_split_id
  where id = p_program_id
    and exists (
      select 1
      from public.splits
      where id = p_split_id
        and program_id = p_program_id
    );

  if not found then
    if not exists (select 1 from public.programs where id = p_program_id) then
      raise exception using errcode = 'PF101', message = 'Program not found';
    end if;
    raise exception using errcode = 'PF102', message = 'Invalid next split';
  end if;

  return p_program_id;
end;
$$;

create or replace function public.delete_split(p_split_id uuid)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  target_split public.splits%rowtype;
  successor_id uuid;
  is_current_program boolean;
begin
  select split.*
  into target_split
  from public.splits as split
  where split.id = p_split_id
  for update;

  if not found then
    raise exception using errcode = 'PF101', message = 'Split not found';
  end if;

  select exists (
    select 1
    from public.app_settings as settings
    where settings.current_program_id = target_split.program_id
  )
  into is_current_program;

  select split.id
  into successor_id
  from public.splits as split
  where split.program_id = target_split.program_id
    and split.id <> p_split_id
  order by
    case when split.position > target_split.position then 0 else 1 end,
    split.position
  limit 1;

  if successor_id is null and is_current_program then
    raise exception using errcode = 'PF104', message = 'Last split of the current program cannot be deleted';
  end if;

  update public.programs
  set next_split_id = successor_id
  where id = target_split.program_id
    and next_split_id = p_split_id;

  delete from public.splits
  where id = p_split_id;

  return p_split_id;
end;
$$;

create or replace function public.advance_program_after_proposed_completion(
  p_program_id uuid,
  p_completed_split_id uuid
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  completed_position integer;
  next_active_split_id uuid;
  current_next_split_id uuid;
begin
  select program.next_split_id
  into current_next_split_id
  from public.programs as program
  join public.app_settings as settings on settings.current_program_id = program.id
  where program.id = p_program_id
  for update of program;

  if not found or current_next_split_id <> p_completed_split_id then
    return current_next_split_id;
  end if;

  select position
  into completed_position
  from public.splits
  where id = p_completed_split_id
    and program_id = p_program_id;

  if not found then
    return current_next_split_id;
  end if;

  select split.id
  into next_active_split_id
  from public.splits as split
  where split.program_id = p_program_id
  order by
    case when split.position > completed_position then 0 else 1 end,
    split.position
  limit 1;

  update public.programs
  set next_split_id = next_active_split_id
  where id = p_program_id;

  return next_active_split_id;
end;
$$;

create or replace function public.apply_active_workout_command(
  p_command_id uuid,
  p_workout_id uuid,
  p_expected_revision bigint,
  p_operation public.active_workout_command_operation,
  p_payload jsonb,
  p_client_created_at timestamptz
)
returns table (
  kind text,
  acknowledged_command_id uuid,
  acknowledged_workout_id uuid,
  expected_revision bigint,
  resulting_revision bigint
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  existing_command public.active_workout_commands%rowtype;
  current_workout public.workouts%rowtype;
  workout_exercise_id uuid;
  transitioned_at timestamptz;
  next_revision bigint;
begin
  if p_expected_revision < 0 or jsonb_typeof(p_payload) is distinct from 'object' then
    raise exception using errcode = 'PF002', message = 'Invalid active-workout command envelope';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_command_id::text, 0)
  );

  select command.*
  into existing_command
  from public.active_workout_commands as command
  where command.command_id = p_command_id
  for update;

  if found then
    if existing_command.workout_id <> p_workout_id
      or existing_command.expected_revision <> p_expected_revision
      or existing_command.operation <> p_operation
      or existing_command.payload <> p_payload
      or existing_command.client_created_at <> p_client_created_at
    then
      raise exception using errcode = 'PF001', message = 'Command ID was already used for a different command';
    end if;

    return query
    select
      'duplicate'::text,
      existing_command.command_id,
      existing_command.workout_id,
      existing_command.expected_revision,
      existing_command.resulting_revision;
    return;
  end if;

  select workout.*
  into current_workout
  from public.workouts as workout
  where workout.id = p_workout_id
  for update;

  if not found then
    return query
    select 'not_found'::text, p_command_id, p_workout_id, p_expected_revision, null::bigint;
    return;
  end if;

  if current_workout.revision <> p_expected_revision then
    return query
    select 'conflict'::text, p_command_id, p_workout_id, p_expected_revision, current_workout.revision;
    return;
  end if;

  if current_workout.status not in ('active', 'paused') then
    return query
    select 'conflict'::text, p_command_id, p_workout_id, p_expected_revision, current_workout.revision;
    return;
  end if;

  if p_operation = 'set_workout_exercise_note' then
    if not (p_payload ? 'workoutExerciseId' and p_payload ? 'note')
      or p_payload - array['workoutExerciseId', 'note'] <> '{}'::jsonb
      or jsonb_typeof(p_payload -> 'workoutExerciseId') <> 'string'
      or jsonb_typeof(p_payload -> 'note') <> 'string'
    then
      raise exception using errcode = 'PF002', message = 'Invalid workout exercise note payload';
    end if;

    begin
      workout_exercise_id = (p_payload ->> 'workoutExerciseId')::uuid;
    exception when invalid_text_representation then
      raise exception using errcode = 'PF002', message = 'Invalid workout exercise identifier';
    end;

    update public.workout_exercises
    set workout_note = p_payload ->> 'note'
    where id = workout_exercise_id
      and workout_id = p_workout_id;

    if not found then
      raise exception using errcode = 'PF002', message = 'Workout exercise does not belong to the workout';
    end if;
  elsif p_operation in ('pause_timer', 'resume_timer') then
    if not (p_payload ? 'transitionedAt')
      or p_payload - 'transitionedAt' <> '{}'::jsonb
      or jsonb_typeof(p_payload -> 'transitionedAt') <> 'string'
    then
      raise exception using errcode = 'PF002', message = 'Invalid timer transition payload';
    end if;

    begin
      transitioned_at = (p_payload ->> 'transitionedAt')::timestamptz;
    exception when invalid_datetime_format then
      raise exception using errcode = 'PF002', message = 'Invalid timer transition timestamp';
    end;

    if p_operation = 'pause_timer' then
      if current_workout.status <> 'active'
        or current_workout.active_segment_started_at is null
        or transitioned_at < current_workout.active_segment_started_at
      then
        return query
        select 'conflict'::text, p_command_id, p_workout_id, p_expected_revision, current_workout.revision;
        return;
      end if;

      update public.workouts
      set
        status = 'paused',
        accumulated_active_seconds = accumulated_active_seconds
          + floor(extract(epoch from transitioned_at - active_segment_started_at))::integer,
        active_segment_started_at = null
      where id = p_workout_id;
    else
      if current_workout.status <> 'paused' or transitioned_at < current_workout.started_at then
        return query
        select 'conflict'::text, p_command_id, p_workout_id, p_expected_revision, current_workout.revision;
        return;
      end if;

      update public.workouts
      set status = 'active', active_segment_started_at = transitioned_at
      where id = p_workout_id;
    end if;
  else
    raise exception using errcode = 'PF002', message = 'Unsupported active-workout command operation';
  end if;

  next_revision = p_expected_revision + 1;

  update public.workouts
  set revision = next_revision
  where id = p_workout_id;

  insert into public.active_workout_commands (
    command_id,
    workout_id,
    expected_revision,
    resulting_revision,
    operation,
    payload,
    client_created_at
  ) values (
    p_command_id,
    p_workout_id,
    p_expected_revision,
    next_revision,
    p_operation,
    p_payload,
    p_client_created_at
  );

  return query
  select 'applied'::text, p_command_id, p_workout_id, p_expected_revision, next_revision;
end;
$$;

create trigger app_settings_validate_time_zone
before insert or update of time_zone on public.app_settings
for each row execute function public.validate_app_time_zone();

create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

create trigger exercises_set_updated_at
before update on public.exercises
for each row execute function public.set_updated_at();

create constraint trigger exercises_validate_load_modes
after insert or update on public.exercises
deferrable initially deferred
for each row execute function public.validate_exercise_load_modes();

create constraint trigger exercise_load_modes_validate_definition
after insert or update or delete on public.exercise_load_modes
deferrable initially deferred
for each row execute function public.validate_exercise_load_modes();

create trigger programs_set_updated_at
before update on public.programs
for each row execute function public.set_updated_at();

create constraint trigger app_settings_validate_current_program
after insert or update of current_program_id on public.app_settings
deferrable initially deferred
for each row execute function public.validate_current_program();

create trigger splits_set_updated_at
before update on public.splits
for each row execute function public.set_updated_at();

create constraint trigger splits_validate_deletion
after delete on public.splits
deferrable initially deferred
for each row execute function public.validate_split_deletion();

create trigger split_exercises_set_updated_at
before update on public.split_exercises
for each row execute function public.set_updated_at();

create trigger workouts_set_updated_at
before update on public.workouts
for each row execute function public.set_updated_at();

create trigger workout_exercises_set_updated_at
before update on public.workout_exercises
for each row execute function public.set_updated_at();

create trigger workout_sets_set_updated_at
before update on public.workout_sets
for each row execute function public.set_updated_at();

create trigger weight_entries_reject_future_date
before insert or update of entry_date on public.weight_entries
for each row execute function public.reject_future_local_entry_date();

create trigger weight_entries_set_updated_at
before update on public.weight_entries
for each row execute function public.set_updated_at();

create trigger measurement_types_set_updated_at
before update on public.measurement_types
for each row execute function public.set_updated_at();

create trigger measurement_entries_reject_future_date
before insert or update of entry_date on public.measurement_entries
for each row execute function public.reject_future_local_entry_date();

create trigger measurement_entries_set_updated_at
before update on public.measurement_entries
for each row execute function public.set_updated_at();

revoke all privileges on table
  public.active_workout_commands,
  public.app_settings,
  public.exercise_load_modes,
  public.exercises,
  public.measurement_entries,
  public.measurement_types,
  public.programs,
  public.split_exercises,
  public.splits,
  public.weight_entries,
  public.workout_exercise_load_modes,
  public.workout_exercises,
  public.workout_sets,
  public.workouts
from anon, authenticated;

grant select, insert, update, delete on table
  public.active_workout_commands,
  public.app_settings,
  public.exercise_load_modes,
  public.exercises,
  public.measurement_entries,
  public.measurement_types,
  public.programs,
  public.split_exercises,
  public.splits,
  public.weight_entries,
  public.workout_exercise_load_modes,
  public.workout_exercises,
  public.workout_sets,
  public.workouts
to service_role;

revoke execute on function public.reject_future_local_entry_date() from public, anon, authenticated;
revoke execute on function public.apply_active_workout_command(uuid, uuid, bigint, public.active_workout_command_operation, jsonb, timestamptz) from public, anon, authenticated;
revoke execute on function public.set_current_program(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.advance_program_after_proposed_completion(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.delete_exercise(uuid) from public, anon, authenticated;
revoke execute on function public.delete_program(uuid) from public, anon, authenticated;
revoke execute on function public.delete_split(uuid) from public, anon, authenticated;
revoke execute on function public.create_program(text) from public, anon, authenticated;
revoke execute on function public.create_split_definition(uuid, text, uuid[], integer[], integer[], integer[]) from public, anon, authenticated;
revoke execute on function public.create_exercise_definition(text, public.exercise_base_type, text, public.load_mode[], public.exercise_measurement_type) from public, anon, authenticated;
revoke execute on function public.reorder_program_splits(uuid, uuid[]) from public, anon, authenticated;
revoke execute on function public.reorder_split_exercises(uuid, uuid[]) from public, anon, authenticated;
revoke execute on function public.set_program_next_split(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.update_program_name(uuid, text) from public, anon, authenticated;
revoke execute on function public.update_split_definition(uuid, text, uuid[], integer[], integer[], integer[]) from public, anon, authenticated;
revoke execute on function public.update_exercise_definition(uuid, text, public.exercise_base_type, text, public.load_mode[], public.exercise_measurement_type) from public, anon, authenticated;
revoke execute on function public.validate_app_time_zone() from public, anon, authenticated;
revoke execute on function public.validate_current_program() from public, anon, authenticated;
revoke execute on function public.validate_exercise_load_modes() from public, anon, authenticated;
revoke execute on function public.validate_split_deletion() from public, anon, authenticated;
revoke execute on function public.workout_set_is_recorded(public.load_mode, numeric, public.band_strength, integer) from public, anon, authenticated;

grant execute on function public.reject_future_local_entry_date() to service_role;
grant execute on function public.apply_active_workout_command(uuid, uuid, bigint, public.active_workout_command_operation, jsonb, timestamptz) to service_role;
grant execute on function public.set_current_program(uuid, uuid) to service_role;
grant execute on function public.advance_program_after_proposed_completion(uuid, uuid) to service_role;
grant execute on function public.delete_exercise(uuid) to service_role;
grant execute on function public.delete_program(uuid) to service_role;
grant execute on function public.delete_split(uuid) to service_role;
grant execute on function public.create_program(text) to service_role;
grant execute on function public.create_split_definition(uuid, text, uuid[], integer[], integer[], integer[]) to service_role;
grant execute on function public.create_exercise_definition(text, public.exercise_base_type, text, public.load_mode[], public.exercise_measurement_type) to service_role;
grant execute on function public.reorder_program_splits(uuid, uuid[]) to service_role;
grant execute on function public.reorder_split_exercises(uuid, uuid[]) to service_role;
grant execute on function public.set_program_next_split(uuid, uuid) to service_role;
grant execute on function public.set_updated_at() to service_role;
grant execute on function public.update_program_name(uuid, text) to service_role;
grant execute on function public.update_split_definition(uuid, text, uuid[], integer[], integer[], integer[]) to service_role;
grant execute on function public.update_exercise_definition(uuid, text, public.exercise_base_type, text, public.load_mode[], public.exercise_measurement_type) to service_role;
grant execute on function public.validate_app_time_zone() to service_role;
grant execute on function public.validate_current_program() to service_role;
grant execute on function public.validate_exercise_load_modes() to service_role;
grant execute on function public.validate_split_deletion() to service_role;
grant execute on function public.workout_set_is_recorded(public.load_mode, numeric, public.band_strength, integer) to service_role;

grant usage on type
  public.active_workout_command_operation,
  public.band_direction,
  public.band_strength,
  public.exercise_base_type,
  public.exercise_measurement_type,
  public.load_mode,
  public.workout_source_kind,
  public.workout_status
to service_role;
