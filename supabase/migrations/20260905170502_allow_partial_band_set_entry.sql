ALTER TABLE "public"."workout_sets"
  DROP CONSTRAINT "workout_sets_check1";

ALTER TABLE "public"."workout_sets"
  DROP CONSTRAINT "workout_sets_check";

ALTER TABLE "public"."workout_sets"
  ADD CONSTRAINT "workout_sets_check1" CHECK (((NOT is_confirmed) OR ((load_mode IS NOT NULL) AND (reps IS
    NOT NULL) AND
    (((load_mode = ANY (ARRAY['weight'::public.load_mode, 'weight_resistance_band'::public.load_mode, 'bodyweight_added_weight'::public.load_mode,
    'assistance_weight'::public.load_mode])) AND (load_kg IS
    NOT NULL)) OR
    ((load_mode <> ALL (ARRAY['weight'::public.load_mode, 'weight_resistance_band'::public.load_mode, 'bodyweight_added_weight'::public.load_mode,
    'assistance_weight'::public.load_mode])) AND (load_kg IS NULL))) AND
    ((load_mode <> ALL (ARRAY['weight_resistance_band'::public.load_mode, 'bodyweight_resistance_band'::public.load_mode, 'assistance_band'::public.load_mode])) OR (band_strength
    IS NOT NULL)))));

ALTER TABLE "public"."workout_sets"
  ADD CONSTRAINT "workout_sets_check"
    CHECK
    ((((load_mode IS NULL) AND (load_kg IS NULL) AND (band_direction IS NULL) AND (band_strength IS NULL)) OR ((load_mode = 'weight'::public.load_mode) AND (band_direction IS NULL)
    AND (band_strength IS NULL)) OR ((load_mode = 'weight_resistance_band'::public.load_mode) AND (band_direction = 'resistance'::public.band_direction)) OR
    ((load_mode = 'bodyweight'::public.load_mode) AND (load_kg IS NULL) AND (band_direction IS NULL) AND (band_strength IS NULL)) OR
    ((load_mode = 'bodyweight_added_weight'::public.load_mode) AND (band_direction IS NULL) AND (band_strength IS NULL)) OR
    ((load_mode = 'bodyweight_resistance_band'::public.load_mode) AND (load_kg IS NULL) AND (band_direction = 'resistance'::public.band_direction)) OR
    ((load_mode = 'assistance_weight'::public.load_mode) AND (band_direction IS NULL) AND (band_strength IS NULL)) OR
    ((load_mode = 'assistance_band'::public.load_mode) AND (load_kg IS NULL) AND (band_direction = 'assistance'::public.band_direction))));
