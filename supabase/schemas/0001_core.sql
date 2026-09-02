create extension if not exists pgcrypto with schema extensions;

create type public.entity_status as enum ('active', 'archived');
create type public.exercise_base_type as enum ('weights', 'bodyweight', 'assisted', 'band');
create type public.load_mode as enum (
  'weight',
  'weight_resistance_band',
  'bodyweight',
  'bodyweight_added_weight',
  'bodyweight_resistance_band',
  'bodyweight_assistance_band',
  'assistance_weight',
  'assistance_band',
  'resistance_band'
);
create type public.band_direction as enum ('resistance', 'assistance');
create type public.band_strength as enum ('light', 'medium', 'strong');
create type public.program_status as enum ('draft', 'active', 'archived');
create type public.workout_status as enum ('active', 'paused', 'completed', 'incomplete');
create type public.workout_source_kind as enum ('proposed_split', 'alternate_split', 'one_time');
create type public.active_workout_command_operation as enum (
  'set_workout_exercise_note',
  'pause_timer',
  'resume_timer'
);

create table public.app_settings (
  id smallint primary key default 1 check (id = 1),
  time_zone text not null,
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
  persistent_note text not null default '',
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, base_type),
  check (btrim(name) <> '')
);

create unique index exercises_active_name_unique
  on public.exercises (lower(btrim(name)))
  where status = 'active';

create table public.exercise_load_modes (
  exercise_id uuid not null,
  exercise_base_type public.exercise_base_type not null,
  load_mode public.load_mode not null,
  primary key (exercise_id, load_mode),
  foreign key (exercise_id, exercise_base_type)
    references public.exercises (id, base_type)
    on update cascade
    on delete restrict,
  check (
    (exercise_base_type = 'weights' and load_mode in ('weight', 'weight_resistance_band'))
    or (
      exercise_base_type = 'bodyweight'
      and load_mode in (
        'bodyweight',
        'bodyweight_added_weight',
        'bodyweight_resistance_band',
        'bodyweight_assistance_band'
      )
    )
    or (
      exercise_base_type = 'assisted'
      and load_mode in ('assistance_weight', 'assistance_band')
    )
    or (exercise_base_type = 'band' and load_mode = 'resistance_band')
  )
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status public.program_status not null default 'draft',
  next_split_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (btrim(name) <> ''),
  check ((status = 'active') = (next_split_id is not null))
);

create unique index programs_active_singleton
  on public.programs ((true))
  where status = 'active';

create table public.splits (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete restrict,
  name text not null,
  position integer not null check (position > 0),
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, id),
  unique (program_id, position),
  check (btrim(name) <> '')
);

create unique index splits_active_name_per_program_unique
  on public.splits (program_id, lower(btrim(name)))
  where status = 'active';

alter table public.programs
  add constraint programs_next_split_same_program_fk
  foreign key (id, next_split_id)
  references public.splits (program_id, id)
  on delete restrict;

create table public.split_exercises (
  id uuid primary key default gen_random_uuid(),
  split_id uuid not null references public.splits (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
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
  source_program_id uuid references public.programs (id) on delete restrict,
  source_split_id uuid references public.splits (id) on delete restrict,
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
  rotation_advanced_to_split_id uuid references public.splits (id) on delete restrict,
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
      and source_program_id is not null
      and source_split_id is not null
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
    or (status in ('completed', 'incomplete') and active_segment_started_at is null and finished_at is not null)
  ),
  check (finished_at is null or finished_at >= started_at),
  check (
    (rotation_advanced_at is null and rotation_advanced_to_split_id is null)
    or (
      rotation_advanced_at is not null
      and rotation_advanced_to_split_id is not null
      and source_kind = 'proposed_split'
      and status = 'completed'
    )
  )
);

create unique index workouts_single_resumable
  on public.workouts ((true))
  where status in ('active', 'paused');

create index workouts_history_order
  on public.workouts (workout_date desc, started_at desc)
  where status in ('completed', 'incomplete');

create index workouts_source_split_history
  on public.workouts (source_split_id, workout_date desc)
  where source_split_id is not null;

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position integer not null check (position > 0),
  exercise_name_snapshot text not null,
  exercise_base_type_snapshot public.exercise_base_type not null,
  persistent_note_snapshot text not null default '',
  planned_sets_snapshot integer check (planned_sets_snapshot > 0),
  min_reps_snapshot integer check (min_reps_snapshot > 0),
  max_reps_snapshot integer check (max_reps_snapshot > 0),
  workout_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_id, position),
  unique (workout_id, exercise_id),
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
  on delete restrict;

alter table public.workouts
  add constraint workouts_rotation_target_same_program_fk
  foreign key (source_program_id, rotation_advanced_to_split_id)
  references public.splits (program_id, id)
  on delete restrict;

create index workout_exercises_exercise_history
  on public.workout_exercises (exercise_id, workout_id);

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
        'bodyweight_assistance_band'
      )
    )
    or (
      exercise_base_type_snapshot = 'assisted'
      and load_mode in ('assistance_weight', 'assistance_band')
    )
    or (exercise_base_type_snapshot = 'band' and load_mode = 'resistance_band')
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
  is_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_exercise_id, position),
  foreign key (workout_exercise_id, load_mode)
    references public.workout_exercise_load_modes (workout_exercise_id, load_mode)
    on delete restrict,
  check (load_kg is null or load_kg > 0),
  check (reps is null or reps > 0),
  check (
    (load_mode is null and load_kg is null and band_direction is null and band_strength is null)
    or (load_mode = 'weight' and band_direction is null and band_strength is null)
    or (
      load_mode = 'weight_resistance_band'
      and band_direction = 'resistance'
      and band_strength is not null
    )
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
      and band_strength is not null
    )
    or (
      load_mode = 'bodyweight_assistance_band'
      and load_kg is null
      and band_direction = 'assistance'
      and band_strength is not null
    )
    or (load_mode = 'assistance_weight' and band_direction is null and band_strength is null)
    or (
      load_mode = 'assistance_band'
      and load_kg is null
      and band_direction = 'assistance'
      and band_strength is not null
    )
    or (
      load_mode = 'resistance_band'
      and load_kg is null
      and band_direction = 'resistance'
      and band_strength is not null
    )
  ),
  check (
    not is_confirmed
    or (
      load_mode is not null
      and reps is not null
      and (
        (load_mode in ('weight', 'weight_resistance_band', 'bodyweight_added_weight', 'assistance_weight') and load_kg is not null)
        or (load_mode not in ('weight', 'weight_resistance_band', 'bodyweight_added_weight', 'assistance_weight') and load_kg is null)
      )
    )
  )
);

create table public.active_workout_commands (
  command_id uuid primary key,
  workout_id uuid not null references public.workouts (id) on delete cascade,
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
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (btrim(name) <> '')
);

create unique index measurement_types_active_name_unique
  on public.measurement_types (lower(btrim(name)))
  where status = 'active';

create table public.measurement_entries (
  id uuid primary key default gen_random_uuid(),
  measurement_type_id uuid not null references public.measurement_types (id) on delete restrict,
  entry_date date not null,
  value_cm numeric(7, 2) not null check (value_cm > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (measurement_type_id, entry_date)
);

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

create or replace function public.validate_active_program_next_split()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  selected_split_status public.entity_status;
begin
  if new.status = 'active' then
    select status
    into selected_split_status
    from public.splits
    where id = new.next_split_id
      and program_id = new.id;

    if selected_split_status is distinct from 'active'::public.entity_status then
      raise exception 'An active program must point to one of its active splits';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.validate_split_archival()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'active' and new.status = 'archived' then
    if not exists (
      select 1
      from public.splits
      where program_id = new.program_id
        and id <> new.id
        and status = 'active'
    ) then
      raise exception 'The last active split in a program cannot be archived';
    end if;

    if exists (
      select 1
      from public.programs
      where status = 'active'
        and next_split_id = new.id
    ) then
      raise exception 'Move the program next-split pointer before archiving its current next split';
    end if;
  end if;

  return new;
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
    then
      raise exception using errcode = 'PF003', message = 'Invalid weights exercise load modes';
    end if;
  elsif checked_base_type = 'bodyweight' then
    if not (
      checked_modes <@ array[
        'bodyweight',
        'bodyweight_added_weight',
        'bodyweight_resistance_band',
        'bodyweight_assistance_band'
      ]::public.load_mode[]
    ) then
      raise exception using errcode = 'PF003', message = 'Invalid bodyweight exercise load modes';
    end if;
  elsif checked_base_type = 'assisted' then
    if not (
      checked_modes <@ array['assistance_weight', 'assistance_band']::public.load_mode[]
    ) then
      raise exception using errcode = 'PF003', message = 'Invalid assisted exercise load modes';
    end if;
  elsif checked_base_type = 'band' then
    if cardinality(checked_modes) <> 1
      or checked_modes[1] <> 'resistance_band'::public.load_mode
    then
      raise exception using errcode = 'PF003', message = 'Invalid band exercise load modes';
    end if;
  end if;

  return null;
end;
$$;

create or replace function public.create_exercise_definition(
  p_name text,
  p_base_type public.exercise_base_type,
  p_persistent_note text,
  p_load_modes public.load_mode[]
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  created_exercise_id uuid;
begin
  insert into public.exercises (name, base_type, persistent_note)
  values (btrim(p_name), p_base_type, p_persistent_note)
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
  p_load_modes public.load_mode[]
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

create constraint trigger programs_validate_active_next_split
after insert or update of status, next_split_id on public.programs
deferrable initially deferred
for each row execute function public.validate_active_program_next_split();

create trigger splits_set_updated_at
before update on public.splits
for each row execute function public.set_updated_at();

create constraint trigger splits_validate_archival
after update of status on public.splits
deferrable initially deferred
for each row execute function public.validate_split_archival();

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
revoke execute on function public.create_exercise_definition(text, public.exercise_base_type, text, public.load_mode[]) from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.update_exercise_definition(uuid, text, public.exercise_base_type, text, public.load_mode[]) from public, anon, authenticated;
revoke execute on function public.validate_app_time_zone() from public, anon, authenticated;
revoke execute on function public.validate_active_program_next_split() from public, anon, authenticated;
revoke execute on function public.validate_exercise_load_modes() from public, anon, authenticated;
revoke execute on function public.validate_split_archival() from public, anon, authenticated;

grant execute on function public.reject_future_local_entry_date() to service_role;
grant execute on function public.apply_active_workout_command(uuid, uuid, bigint, public.active_workout_command_operation, jsonb, timestamptz) to service_role;
grant execute on function public.create_exercise_definition(text, public.exercise_base_type, text, public.load_mode[]) to service_role;
grant execute on function public.set_updated_at() to service_role;
grant execute on function public.update_exercise_definition(uuid, text, public.exercise_base_type, text, public.load_mode[]) to service_role;
grant execute on function public.validate_app_time_zone() to service_role;
grant execute on function public.validate_active_program_next_split() to service_role;
grant execute on function public.validate_exercise_load_modes() to service_role;
grant execute on function public.validate_split_archival() to service_role;

grant usage on type
  public.active_workout_command_operation,
  public.band_direction,
  public.band_strength,
  public.entity_status,
  public.exercise_base_type,
  public.load_mode,
  public.program_status,
  public.workout_source_kind,
  public.workout_status
to service_role;
