export const exerciseBaseTypes = [
  "weights",
  "bodyweight",
  "assisted",
  "band",
] as const;

export type ExerciseBaseType = (typeof exerciseBaseTypes)[number];

export const exerciseLoadModes = [
  "weight",
  "weight_resistance_band",
  "bodyweight",
  "bodyweight_added_weight",
  "bodyweight_resistance_band",
  "bodyweight_assistance_band",
  "assistance_weight",
  "assistance_band",
  "resistance_band",
] as const;

export type ExerciseLoadMode = (typeof exerciseLoadModes)[number];
export type ExerciseStatus = "active" | "archived";

export type Exercise = Readonly<{
  id: string;
  name: string;
  baseType: ExerciseBaseType;
  allowedLoadModes: readonly ExerciseLoadMode[];
  persistentNote: string;
  status: ExerciseStatus;
  splitUsageCount: number;
}>;

export type ExerciseDefinition = Readonly<{
  name: string;
  baseType: ExerciseBaseType;
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
    "bodyweight_assistance_band",
  ],
  assisted: ["assistance_weight", "assistance_band"],
  band: ["resistance_band"],
};

export const defaultLoadModesByBaseType: Readonly<
  Record<ExerciseBaseType, readonly ExerciseLoadMode[]>
> = {
  weights: ["weight"],
  bodyweight: ["bodyweight"],
  assisted: ["assistance_weight"],
  band: ["resistance_band"],
};
