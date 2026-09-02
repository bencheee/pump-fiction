import type { ExerciseBaseType, ExerciseLoadMode } from "../domain/exercise";

export const exerciseTypeLabels: Readonly<Record<ExerciseBaseType, string>> = {
  weights: "Weights",
  bodyweight: "Bodyweight",
  assisted: "Assisted",
  band: "Band",
};

export const exerciseModeLabels: Readonly<Record<ExerciseLoadMode, string>> = {
  weight: "Weight",
  weight_resistance_band: "Weight + resistance band",
  bodyweight: "Bodyweight",
  bodyweight_added_weight: "Bodyweight + added weight",
  bodyweight_resistance_band: "Bodyweight + resistance band",
  bodyweight_assistance_band: "Bodyweight + assistance band",
  assistance_weight: "Assistance weight",
  assistance_band: "Assistance band",
  resistance_band: "Resistance band",
};

export const exerciseModeDetails: Readonly<Record<ExerciseLoadMode, string>> = {
  weight: "Kilograms and reps",
  weight_resistance_band: "Kilograms, band strength, and reps",
  bodyweight: "Reps only",
  bodyweight_added_weight: "Added kilograms and reps",
  bodyweight_resistance_band: "Resistance-band strength and reps",
  bodyweight_assistance_band: "Assistance-band strength and reps",
  assistance_weight: "Assistance kilograms and reps",
  assistance_band: "Assistance-band strength and reps",
  resistance_band: "Resistance-band strength and reps",
};
