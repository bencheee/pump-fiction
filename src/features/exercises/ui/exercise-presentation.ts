import type { ExerciseBaseType, ExerciseLoadMode } from "../domain/exercise";

export const exerciseTypeLabels: Readonly<Record<ExerciseBaseType, string>> = {
  weights: "Weights",
  bodyweight: "Bodyweight",
};

export const exerciseModeLabels: Readonly<Record<ExerciseLoadMode, string>> = {
  weight: "Weight",
  weight_resistance_band: "Weight + resistance band",
  bodyweight: "Bodyweight",
  bodyweight_added_weight: "Bodyweight + added weight",
  bodyweight_resistance_band: "Bodyweight + resistance band",
  assistance_weight: "Assistance weight",
  assistance_band: "Assistance band",
};

export const exerciseModeDetails: Readonly<Record<ExerciseLoadMode, string>> = {
  weight: "Kilograms and reps",
  weight_resistance_band: "Kilograms, band strength, and reps",
  bodyweight: "Reps only",
  bodyweight_added_weight: "Added kilograms and reps",
  bodyweight_resistance_band: "Resistance-band strength and reps",
  assistance_weight: "Assistance kilograms and reps",
  assistance_band: "Assistance-band strength and reps",
};

/** Labels for the optional additions offered on the exercise definition. */
export const exerciseOptionalModeLabels: Readonly<
  Record<ExerciseLoadMode, string>
> = {
  weight: "Weight",
  weight_resistance_band: "Add resistance band",
  bodyweight: "Bodyweight",
  bodyweight_added_weight: "Add weight",
  bodyweight_resistance_band: "Add resistance band",
  assistance_weight: "Assist with weight",
  assistance_band: "Assist with band",
};
