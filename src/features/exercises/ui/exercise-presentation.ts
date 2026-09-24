import type {
  Exercise,
  ExerciseBaseType,
  ExerciseLoadMode,
} from "../domain/exercise";

export const exerciseTypeLabels: Readonly<Record<ExerciseBaseType, string>> = {
  weights: "Weights",
  bodyweight: "Bodyweight",
};

/**
 * `defDetail` (prototype line 1782): the type, what a set is measured in, and
 * how many load modes the exercise allows — its base mode and the one addition
 * it may carry. The Exercise library's rows and the split editor's Add
 * exercise panel both state it.
 */
export function exerciseDefinitionDetail(exercise: Exercise): string {
  const modes = exercise.allowedLoadModes.length;
  return `${exerciseTypeLabels[exercise.baseType]} · ${exercise.measurementType === "seconds" ? "Seconds" : "Reps"} · ${modes} ${modes === 1 ? "mode" : "modes"}`;
}

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

/*
 * And the labels for taking the same addition off a set again. The prototype's
 * set menu (line 3263) writes two of these itself — "Remove added weight" and
 * "Remove resistance band" — and has no assistance mode to name.
 */
export const exerciseOptionalModeRemoveLabels: Readonly<
  Record<ExerciseLoadMode, string>
> = {
  weight: "Remove weight",
  weight_resistance_band: "Remove resistance band",
  bodyweight: "Remove bodyweight",
  bodyweight_added_weight: "Remove added weight",
  bodyweight_resistance_band: "Remove resistance band",
  assistance_weight: "Remove weight assistance",
  assistance_band: "Remove band assistance",
};
