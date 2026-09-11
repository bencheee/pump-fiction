export const exerciseBaseTypes = ["weights", "bodyweight"] as const;

export type ExerciseBaseType = (typeof exerciseBaseTypes)[number];

export const exerciseMeasurementTypes = ["reps", "seconds"] as const;

export type ExerciseMeasurementType = (typeof exerciseMeasurementTypes)[number];

export const exerciseLoadModes = [
  "weight",
  "weight_resistance_band",
  "bodyweight",
  "bodyweight_added_weight",
  "bodyweight_resistance_band",
  "assistance_weight",
  "assistance_band",
] as const;

export type ExerciseLoadMode = (typeof exerciseLoadModes)[number];

export type Exercise = Readonly<{
  id: string;
  name: string;
  baseType: ExerciseBaseType;
  measurementType?: ExerciseMeasurementType;
  allowedLoadModes: readonly ExerciseLoadMode[];
  persistentNote: string;
  splitUsageCount: number;
}>;

export type ExerciseDefinition = Readonly<{
  name: string;
  baseType: ExerciseBaseType;
  measurementType?: ExerciseMeasurementType;
  allowedLoadModes: readonly ExerciseLoadMode[];
  persistentNote: string;
}>;

export const allowedLoadModesByBaseType: Readonly<
  Record<ExerciseBaseType, readonly ExerciseLoadMode[]>
> = {
  weights: ["weight", "weight_resistance_band"],
  bodyweight: [
    "bodyweight",
    "bodyweight_added_weight",
    "bodyweight_resistance_band",
    "assistance_weight",
    "assistance_band",
  ],
};

/** The mode every set of this type always has; it is never a user choice. */
export const baseLoadModeByBaseType: Readonly<
  Record<ExerciseBaseType, ExerciseLoadMode>
> = {
  weights: "weight",
  bodyweight: "bodyweight",
};

/** The optional additions the user chooses from, at most one per exercise. */
export const optionalLoadModesByBaseType: Readonly<
  Record<ExerciseBaseType, readonly ExerciseLoadMode[]>
> = {
  weights: ["weight_resistance_band"],
  bodyweight: [
    "bodyweight_added_weight",
    "bodyweight_resistance_band",
    "assistance_weight",
    "assistance_band",
  ],
};

export const defaultLoadModesByBaseType: Readonly<
  Record<ExerciseBaseType, readonly ExerciseLoadMode[]>
> = {
  weights: ["weight"],
  bodyweight: ["bodyweight"],
};
