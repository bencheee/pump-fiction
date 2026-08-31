SET local check_function_bodies = off;

CREATE TABLE "public"."app_settings" (
  "id"               smallint                 NOT NULL DEFAULT 1,
  "time_zone"        text                     NOT NULL,
  "weight_unit"      text                     NOT NULL DEFAULT 'kg'::text,
  "measurement_unit" text                     NOT NULL DEFAULT 'cm'::text,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "app_settings_id_check" CHECK ((id = 1)),
  CONSTRAINT "app_settings_measurement_unit_check" CHECK ((measurement_unit = 'cm'::text)),
  CONSTRAINT "app_settings_pkey" PRIMARY KEY (id),
  CONSTRAINT "app_settings_time_zone_check" CHECK ((btrim(time_zone) <> ''::text)),
  CONSTRAINT "app_settings_weight_unit_check" CHECK ((weight_unit = 'kg'::text))
);

CREATE TABLE "public"."exercise_load_modes" (
  "exercise_id" uuid NOT NULL
);

CREATE TABLE "public"."exercises" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"            text                     NOT NULL,
  "persistent_note" text                     NOT NULL DEFAULT ''::text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "exercises_name_check" CHECK ((btrim(name) <> ''::text)),
  CONSTRAINT "exercises_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."measurement_entries" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "measurement_type_id" uuid                     NOT NULL,
  "entry_date"          date                     NOT NULL,
  "value_cm"            numeric(7,2)             NOT NULL,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "measurement_entries_measurement_type_id_entry_date_key" UNIQUE (measurement_type_id, entry_date),
  CONSTRAINT "measurement_entries_pkey" PRIMARY KEY (id),
  CONSTRAINT "measurement_entries_value_cm_check" CHECK ((value_cm > (0)::numeric))
);

CREATE TABLE "public"."measurement_types" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       text                     NOT NULL,
  "unit"       text                     NOT NULL DEFAULT 'cm'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "measurement_types_name_check" CHECK ((btrim(name) <> ''::text)),
  CONSTRAINT "measurement_types_pkey" PRIMARY KEY (id),
  CONSTRAINT "measurement_types_unit_check" CHECK ((unit = 'cm'::text))
);

CREATE TABLE "public"."programs" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"          text                     NOT NULL,
  "next_split_id" uuid,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "programs_name_check" CHECK ((btrim(name) <> ''::text)),
  CONSTRAINT "programs_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."split_exercises" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "split_id"     uuid                     NOT NULL,
  "exercise_id"  uuid                     NOT NULL,
  "position"     integer                  NOT NULL,
  "planned_sets" integer                  NOT NULL,
  "min_reps"     integer                  NOT NULL,
  "max_reps"     integer                  NOT NULL,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "split_exercises_check" CHECK ((min_reps <= max_reps)),
  CONSTRAINT "split_exercises_max_reps_check" CHECK ((max_reps > 0)),
  CONSTRAINT "split_exercises_min_reps_check" CHECK ((min_reps > 0)),
  CONSTRAINT "split_exercises_pkey" PRIMARY KEY (id),
  CONSTRAINT "split_exercises_planned_sets_check" CHECK ((planned_sets > 0)),
  CONSTRAINT "split_exercises_position_check" CHECK (("position" > 0)),
  CONSTRAINT "split_exercises_split_id_exercise_id_key" UNIQUE (split_id, exercise_id),
  CONSTRAINT "split_exercises_split_id_position_key" UNIQUE (split_id, "position")
);

CREATE TABLE "public"."splits" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "program_id" uuid                     NOT NULL,
  "name"       text                     NOT NULL,
  "position"   integer                  NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "splits_name_check" CHECK ((btrim(name) <> ''::text)),
  CONSTRAINT "splits_pkey" PRIMARY KEY (id),
  CONSTRAINT "splits_position_check" CHECK (("position" > 0)),
  CONSTRAINT "splits_program_id_id_key" UNIQUE (program_id, id),
  CONSTRAINT "splits_program_id_position_key" UNIQUE (program_id, "position")
);

CREATE TABLE "public"."weight_entries" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "entry_date" date                     NOT NULL,
  "weight_kg"  numeric(6,2)             NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "weight_entries_entry_date_key" UNIQUE (entry_date),
  CONSTRAINT "weight_entries_pkey" PRIMARY KEY (id),
  CONSTRAINT "weight_entries_weight_kg_check" CHECK ((weight_kg > (0)::numeric))
);

CREATE TABLE "public"."workout_exercise_load_modes" (
  "workout_exercise_id" uuid NOT NULL
);

CREATE TABLE "public"."workout_exercises" (
  "id"                       uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "workout_id"               uuid                     NOT NULL,
  "exercise_id"              uuid                     NOT NULL,
  "position"                 integer                  NOT NULL,
  "exercise_name_snapshot"   text                     NOT NULL,
  "persistent_note_snapshot" text                     NOT NULL DEFAULT ''::text,
  "planned_sets_snapshot"    integer,
  "min_reps_snapshot"        integer,
  "max_reps_snapshot"        integer,
  "workout_note"             text                     NOT NULL DEFAULT ''::text,
  "created_at"               timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"               timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "workout_exercises_check" CHECK ((((min_reps_snapshot IS NULL) AND (max_reps_snapshot IS NULL)) OR ((min_reps_snapshot IS NOT NULL) AND (max_reps_snapshot IS
    NOT NULL) AND (min_reps_snapshot <= max_reps_snapshot)))),
  CONSTRAINT "workout_exercises_exercise_name_snapshot_check" CHECK ((btrim(exercise_name_snapshot) <> ''::text)),
  CONSTRAINT "workout_exercises_max_reps_snapshot_check" CHECK ((max_reps_snapshot > 0)),
  CONSTRAINT "workout_exercises_min_reps_snapshot_check" CHECK ((min_reps_snapshot > 0)),
  CONSTRAINT "workout_exercises_pkey" PRIMARY KEY (id),
  CONSTRAINT "workout_exercises_planned_sets_snapshot_check" CHECK ((planned_sets_snapshot > 0)),
  CONSTRAINT "workout_exercises_position_check" CHECK (("position" > 0)),
  CONSTRAINT "workout_exercises_workout_id_exercise_id_key" UNIQUE (workout_id, exercise_id),
  CONSTRAINT "workout_exercises_workout_id_position_key" UNIQUE (workout_id, "position")
);

CREATE TABLE "public"."workout_sets" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "workout_exercise_id" uuid                     NOT NULL,
  "position"            integer                  NOT NULL,
  "load_kg"             numeric(8,2),
  "reps"                integer,
  "is_confirmed"        boolean                  NOT NULL DEFAULT false,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "workout_sets_load_kg_check" CHECK (((load_kg IS NULL) OR (load_kg > (0)::numeric))),
  CONSTRAINT "workout_sets_pkey" PRIMARY KEY (id),
  CONSTRAINT "workout_sets_position_check" CHECK (("position" > 0)),
  CONSTRAINT "workout_sets_reps_check" CHECK (((reps IS NULL) OR (reps > 0))),
  CONSTRAINT "workout_sets_workout_exercise_id_position_key" UNIQUE (workout_exercise_id, "position")
);

CREATE TABLE "public"."workouts" (
  "id"                            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "source_program_id"             uuid,
  "source_split_id"               uuid,
  "program_name_snapshot"         text,
  "split_name_snapshot"           text,
  "one_time_name"                 text,
  "workout_date"                  date                     NOT NULL,
  "started_at"                    timestamp with time zone NOT NULL,
  "finished_at"                   timestamp with time zone,
  "accumulated_active_seconds"    integer                  NOT NULL DEFAULT 0,
  "active_segment_started_at"     timestamp with time zone,
  "revision"                      bigint                   NOT NULL DEFAULT 0,
  "rotation_advanced_at"          timestamp with time zone,
  "rotation_advanced_to_split_id" uuid,
  "created_at"                    timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"                    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "workouts_accumulated_active_seconds_check" CHECK ((accumulated_active_seconds >= 0)),
  CONSTRAINT "workouts_check2" CHECK (((finished_at IS NULL) OR (finished_at >= started_at))),
  CONSTRAINT "workouts_pkey" PRIMARY KEY (id),
  CONSTRAINT "workouts_revision_check" CHECK ((revision >= 0))
);

CREATE TYPE "public"."band_direction" AS ENUM (
  'resistance',
  'assistance'
);

ALTER TABLE "public"."workout_sets"
  ADD COLUMN "band_direction" public.band_direction;

CREATE TYPE "public"."band_strength" AS ENUM (
  'light',
  'medium',
  'strong'
);

ALTER TABLE "public"."workout_sets"
  ADD COLUMN "band_strength" public.band_strength;

CREATE TYPE "public"."entity_status" AS ENUM (
  'active',
  'archived'
);

ALTER TABLE "public"."exercises"
  ADD COLUMN "status" public.entity_status NOT NULL DEFAULT 'active'::public.entity_status;

ALTER TABLE "public"."measurement_types"
  ADD COLUMN "status" public.entity_status NOT NULL DEFAULT 'active'::public.entity_status;

ALTER TABLE "public"."splits"
  ADD COLUMN "status" public.entity_status NOT NULL DEFAULT 'active'::public.entity_status;

CREATE TYPE "public"."exercise_base_type" AS ENUM (
  'weights',
  'bodyweight',
  'assisted',
  'band'
);

ALTER TABLE "public"."exercise_load_modes"
  ADD COLUMN "exercise_base_type" public.exercise_base_type NOT NULL;

ALTER TABLE "public"."exercises"
  ADD COLUMN "base_type" public.exercise_base_type NOT NULL;

ALTER TABLE "public"."workout_exercise_load_modes"
  ADD COLUMN "exercise_base_type_snapshot" public.exercise_base_type NOT NULL;

ALTER TABLE "public"."workout_exercises"
  ADD COLUMN "exercise_base_type_snapshot" public.exercise_base_type NOT NULL;

CREATE TYPE "public"."load_mode" AS ENUM (
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

ALTER TABLE "public"."exercise_load_modes"
  ADD COLUMN "load_mode" public.load_mode NOT NULL;

ALTER TABLE "public"."workout_exercise_load_modes"
  ADD COLUMN "load_mode" public.load_mode NOT NULL;

ALTER TABLE "public"."workout_sets"
  ADD COLUMN "load_mode" public.load_mode;

CREATE TYPE "public"."program_status" AS ENUM (
  'draft',
  'active',
  'archived'
);

ALTER TABLE "public"."programs"
  ADD COLUMN "status" public.program_status NOT NULL DEFAULT 'draft'::public.program_status;

CREATE TYPE "public"."workout_source_kind" AS ENUM (
  'proposed_split',
  'alternate_split',
  'one_time'
);

ALTER TABLE "public"."workouts"
  ADD COLUMN "source_kind" public.workout_source_kind NOT NULL;

CREATE TYPE "public"."workout_status" AS ENUM (
  'active',
  'paused',
  'completed',
  'incomplete'
);

ALTER TABLE "public"."workouts"
  ADD COLUMN "status" public.workout_status NOT NULL;

CREATE OR REPLACE FUNCTION public.reject_future_local_entry_date()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.validate_active_program_next_split()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.validate_app_time_zone()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.validate_split_archival()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
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
$function$;

ALTER TABLE "public"."exercise_load_modes"
  ADD CONSTRAINT "exercise_load_modes_check"
    CHECK
    ((((exercise_base_type = 'weights'::public.exercise_base_type) AND (load_mode = ANY (ARRAY['weight'::public.load_mode, 'weight_resistance_band'::public.load_mode]))) OR
    ((exercise_base_type = 'bodyweight'::public.exercise_base_type) AND (load_mode = ANY (ARRAY['bodyweight'::public.load_mode, 'bodyweight_added_weight'::public.load_mode,
    'bodyweight_resistance_band'::public.load_mode,
    'bodyweight_assistance_band'::public.load_mode]))) OR
    ((exercise_base_type = 'assisted'::public.exercise_base_type) AND (load_mode = ANY (ARRAY['assistance_weight'::public.load_mode, 'assistance_band'::public.load_mode]))) OR
    ((exercise_base_type = 'band'::public.exercise_base_type) AND (load_mode = 'resistance_band'::public.load_mode))));

ALTER TABLE "public"."exercise_load_modes"
  ADD CONSTRAINT "exercise_load_modes_pkey" PRIMARY KEY (exercise_id, load_mode);

ALTER TABLE "public"."exercises"
  ADD CONSTRAINT "exercises_id_base_type_key" UNIQUE (id, base_type);

ALTER TABLE "public"."exercise_load_modes"
  ADD CONSTRAINT "exercise_load_modes_exercise_id_exercise_base_type_fkey" FOREIGN KEY (exercise_id, exercise_base_type) REFERENCES public.exercises(id, base_type)
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "public"."measurement_entries"
  ADD CONSTRAINT "measurement_entries_measurement_type_id_fkey" FOREIGN KEY (measurement_type_id) REFERENCES public.measurement_types(id) ON DELETE RESTRICT;

ALTER TABLE "public"."programs"
  ADD CONSTRAINT "programs_check" CHECK (((status = 'active'::public.program_status) = (next_split_id IS NOT NULL)));

ALTER TABLE "public"."split_exercises"
  ADD CONSTRAINT "split_exercises_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE RESTRICT;

ALTER TABLE "public"."split_exercises"
  ADD CONSTRAINT "split_exercises_split_id_fkey" FOREIGN KEY (split_id) REFERENCES public.splits(id) ON DELETE CASCADE;

ALTER TABLE "public"."splits"
  ADD CONSTRAINT "splits_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE RESTRICT;

ALTER TABLE "public"."programs"
  ADD CONSTRAINT "programs_next_split_same_program_fk" FOREIGN KEY (id, next_split_id) REFERENCES public.splits(program_id, id) ON DELETE RESTRICT;

ALTER TABLE "public"."workout_exercise_load_modes"
  ADD CONSTRAINT "workout_exercise_load_modes_check"
    CHECK
    ((((exercise_base_type_snapshot = 'weights'::public.exercise_base_type) AND (load_mode = ANY (ARRAY['weight'::public.load_mode, 'weight_resistance_band'::public.load_mode])))
    OR
    ((exercise_base_type_snapshot = 'bodyweight'::public.exercise_base_type) AND (load_mode = ANY (ARRAY['bodyweight'::public.load_mode,
    'bodyweight_added_weight'::public.load_mode,
    'bodyweight_resistance_band'::public.load_mode,
    'bodyweight_assistance_band'::public.load_mode]))) OR
    ((exercise_base_type_snapshot = 'assisted'::public.exercise_base_type) AND (load_mode = ANY (ARRAY['assistance_weight'::public.load_mode,
    'assistance_band'::public.load_mode]))) OR ((exercise_base_type_snapshot = 'band'::public.exercise_base_type) AND (load_mode = 'resistance_band'::public.load_mode))));

ALTER TABLE "public"."workout_exercise_load_modes"
  ADD CONSTRAINT "workout_exercise_load_modes_pkey" PRIMARY KEY (workout_exercise_id, load_mode);

ALTER TABLE "public"."workout_exercises"
  ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE RESTRICT;

ALTER TABLE "public"."workout_exercises"
  ADD CONSTRAINT "workout_exercises_id_exercise_base_type_snapshot_key" UNIQUE (id, exercise_base_type_snapshot);

ALTER TABLE "public"."workout_exercise_load_modes"
  ADD CONSTRAINT "workout_exercise_load_modes_workout_exercise_id_exercise_b_fkey" FOREIGN KEY (workout_exercise_id, exercise_base_type_snapshot)
    REFERENCES public.workout_exercises(id, exercise_base_type_snapshot) ON DELETE CASCADE;

ALTER TABLE "public"."workout_sets"
  ADD CONSTRAINT "workout_sets_check1" CHECK (((NOT is_confirmed) OR ((load_mode IS NOT NULL) AND (reps IS
    NOT NULL) AND
    (((load_mode = ANY (ARRAY['weight'::public.load_mode, 'weight_resistance_band'::public.load_mode, 'bodyweight_added_weight'::public.load_mode,
    'assistance_weight'::public.load_mode])) AND (load_kg IS
    NOT NULL)) OR
    ((load_mode <> ALL (ARRAY['weight'::public.load_mode, 'weight_resistance_band'::public.load_mode, 'bodyweight_added_weight'::public.load_mode,
    'assistance_weight'::public.load_mode])) AND (load_kg IS NULL))))));

ALTER TABLE "public"."workout_sets"
  ADD CONSTRAINT "workout_sets_check"
    CHECK
    ((((load_mode IS NULL) AND (load_kg IS NULL) AND (band_direction IS NULL) AND (band_strength IS NULL)) OR ((load_mode = 'weight'::public.load_mode) AND (band_direction IS NULL)
    AND (band_strength IS NULL)) OR ((load_mode = 'weight_resistance_band'::public.load_mode) AND (band_direction = 'resistance'::public.band_direction) AND (band_strength IS
    NOT NULL)) OR ((load_mode = 'bodyweight'::public.load_mode) AND (load_kg IS NULL) AND (band_direction IS NULL) AND (band_strength IS NULL)) OR
    ((load_mode = 'bodyweight_added_weight'::public.load_mode) AND (band_direction IS NULL) AND (band_strength IS NULL)) OR
    ((load_mode = 'bodyweight_resistance_band'::public.load_mode) AND (load_kg IS NULL) AND (band_direction = 'resistance'::public.band_direction) AND (band_strength IS
    NOT NULL)) OR
    ((load_mode = 'bodyweight_assistance_band'::public.load_mode) AND (load_kg IS NULL) AND (band_direction = 'assistance'::public.band_direction) AND (band_strength IS
    NOT NULL)) OR ((load_mode = 'assistance_weight'::public.load_mode) AND (band_direction IS NULL) AND (band_strength IS NULL)) OR
    ((load_mode = 'assistance_band'::public.load_mode) AND (load_kg IS NULL) AND (band_direction = 'assistance'::public.band_direction) AND (band_strength IS
    NOT NULL)) OR ((load_mode = 'resistance_band'::public.load_mode) AND (load_kg IS NULL) AND (band_direction = 'resistance'::public.band_direction) AND (band_strength IS
    NOT NULL))));

ALTER TABLE "public"."workout_sets"
  ADD CONSTRAINT "workout_sets_workout_exercise_id_fkey" FOREIGN KEY (workout_exercise_id) REFERENCES public.workout_exercises(id) ON DELETE CASCADE;

ALTER TABLE "public"."workout_sets"
  ADD CONSTRAINT "workout_sets_workout_exercise_id_load_mode_fkey" FOREIGN KEY (workout_exercise_id, load_mode)
    REFERENCES public.workout_exercise_load_modes(workout_exercise_id, load_mode) ON DELETE RESTRICT;

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_check1" CHECK ((((status = 'active'::public.workout_status) AND (active_segment_started_at IS
    NOT NULL) AND (finished_at IS NULL)) OR ((status = 'paused'::public.workout_status) AND (active_segment_started_at IS NULL) AND (finished_at IS NULL)) OR
    ((status = ANY (ARRAY['completed'::public.workout_status, 'incomplete'::public.workout_status])) AND (active_segment_started_at IS NULL) AND (finished_at IS NOT NULL))));

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_check3" CHECK ((((rotation_advanced_at IS NULL) AND (rotation_advanced_to_split_id IS NULL)) OR ((rotation_advanced_at IS
    NOT NULL) AND (rotation_advanced_to_split_id IS NOT NULL) AND (source_kind = 'proposed_split'::public.workout_source_kind) AND (status = 'completed'::public.workout_status))));

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_check"
    CHECK
    ((((source_kind = 'one_time'::public.workout_source_kind) AND (source_program_id IS NULL) AND (source_split_id IS NULL) AND (program_name_snapshot IS NULL) AND
    (split_name_snapshot IS NULL) AND (one_time_name IS
    NOT NULL) AND (btrim(one_time_name) <> ''::text)) OR
    ((source_kind = ANY (ARRAY['proposed_split'::public.workout_source_kind, 'alternate_split'::public.workout_source_kind])) AND (source_program_id IS
    NOT NULL) AND (source_split_id IS NOT NULL) AND (program_name_snapshot IS NOT NULL) AND (split_name_snapshot IS
    NOT NULL) AND (btrim(program_name_snapshot) <> ''::text) AND (btrim(split_name_snapshot) <> ''::text) AND (one_time_name IS NULL))));

ALTER TABLE "public"."workout_exercises"
  ADD CONSTRAINT "workout_exercises_workout_id_fkey" FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_rotation_advanced_to_split_id_fkey" FOREIGN KEY (rotation_advanced_to_split_id) REFERENCES public.splits(id) ON DELETE RESTRICT;

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_rotation_target_same_program_fk" FOREIGN KEY (source_program_id, rotation_advanced_to_split_id) REFERENCES public.splits(program_id, id)
    ON DELETE RESTRICT;

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_source_program_id_fkey" FOREIGN KEY (source_program_id) REFERENCES public.programs(id) ON DELETE RESTRICT;

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_source_split_id_fkey" FOREIGN KEY (source_split_id) REFERENCES public.splits(id) ON DELETE RESTRICT;

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_source_split_same_program_fk" FOREIGN KEY (source_program_id, source_split_id) REFERENCES public.splits(program_id, id) ON DELETE RESTRICT;

CREATE UNIQUE INDEX exercises_active_name_unique ON public.exercises USING btree (lower(btrim(name)))
  WHERE (status = 'active'::public.entity_status);

CREATE UNIQUE INDEX measurement_types_active_name_unique ON public.measurement_types USING btree (lower(btrim(name)))
  WHERE (status = 'active'::public.entity_status);

CREATE UNIQUE INDEX programs_active_singleton ON public.programs USING btree ((true))
  WHERE (status = 'active'::public.program_status);

CREATE UNIQUE INDEX splits_active_name_per_program_unique ON public.splits USING btree (program_id, lower(btrim(name)))
  WHERE (status = 'active'::public.entity_status);

CREATE INDEX workout_exercises_exercise_history ON public.workout_exercises USING btree (exercise_id, workout_id);

CREATE INDEX workouts_history_order ON public.workouts USING btree (workout_date DESC, started_at DESC)
  WHERE (status = ANY (ARRAY['completed'::public.workout_status, 'incomplete'::public.workout_status]));

CREATE UNIQUE INDEX workouts_single_resumable ON public.workouts USING btree ((true))
  WHERE (status = ANY (ARRAY['active'::public.workout_status, 'paused'::public.workout_status]));

CREATE INDEX workouts_source_split_history ON public.workouts USING btree (source_split_id, workout_date DESC)
  WHERE (source_split_id IS NOT NULL);

CREATE TRIGGER app_settings_set_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER app_settings_validate_time_zone
  BEFORE INSERT OR UPDATE OF time_zone ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_app_time_zone();

CREATE TRIGGER exercises_set_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER measurement_entries_reject_future_date
  BEFORE INSERT OR UPDATE OF entry_date ON public.measurement_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.reject_future_local_entry_date();

CREATE TRIGGER measurement_entries_set_updated_at
  BEFORE UPDATE ON public.measurement_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER measurement_types_set_updated_at
  BEFORE UPDATE ON public.measurement_types
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER programs_set_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE CONSTRAINT TRIGGER programs_validate_active_next_split
  AFTER INSERT OR UPDATE OF status, next_split_id ON public.programs DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_active_program_next_split();

CREATE TRIGGER split_exercises_set_updated_at
  BEFORE UPDATE ON public.split_exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER splits_set_updated_at
  BEFORE UPDATE ON public.splits
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE CONSTRAINT TRIGGER splits_validate_archival
  AFTER UPDATE OF status ON public.splits DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_split_archival();

CREATE TRIGGER weight_entries_reject_future_date
  BEFORE INSERT OR UPDATE OF entry_date ON public.weight_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.reject_future_local_entry_date();

CREATE TRIGGER weight_entries_set_updated_at
  BEFORE UPDATE ON public.weight_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER workout_exercises_set_updated_at
  BEFORE UPDATE ON public.workout_exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER workout_sets_set_updated_at
  BEFORE UPDATE ON public.workout_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER workouts_set_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

REVOKE ALL ON FUNCTION "public"."reject_future_local_entry_date"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."reject_future_local_entry_date"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."set_updated_at"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."validate_active_program_next_split"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."validate_active_program_next_split"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."validate_app_time_zone"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."validate_app_time_zone"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."validate_split_archival"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."validate_split_archival"() TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."app_settings" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."exercise_load_modes" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."exercises" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."measurement_entries" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."measurement_types" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."programs" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."split_exercises" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."splits" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."weight_entries" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workout_exercise_load_modes" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workout_exercises" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workout_sets" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workouts" TO "postgres", "service_role";

GRANT USAGE ON TYPE "public"."band_direction" TO "postgres", "service_role";

GRANT USAGE ON TYPE "public"."band_strength" TO "postgres", "service_role";

GRANT USAGE ON TYPE "public"."entity_status" TO "postgres", "service_role";

GRANT USAGE ON TYPE "public"."exercise_base_type" TO "postgres", "service_role";

GRANT USAGE ON TYPE "public"."load_mode" TO "postgres", "service_role";

GRANT USAGE ON TYPE "public"."program_status" TO "postgres", "service_role";

GRANT USAGE ON TYPE "public"."workout_source_kind" TO "postgres", "service_role";

GRANT USAGE ON TYPE "public"."workout_status" TO "postgres", "service_role";

REVOKE ALL PRIVILEGES ON TABLE
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
FROM anon, authenticated;

-- DML is intentionally maintained in the reviewed migration because declarative
-- schema diffing covers database structure, not required singleton data.
INSERT INTO public.app_settings (id, time_zone)
VALUES (1, 'Europe/Zagreb')
ON CONFLICT (id) DO NOTHING;
