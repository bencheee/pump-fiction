import {
  allowedLoadModesByBaseType,
  exerciseBaseTypes,
  exerciseLoadModes,
  type ExerciseBaseType,
  type ExerciseDefinition,
  type ExerciseLoadMode,
} from "./exercise";

export type ExerciseDefinitionInput = Readonly<{
  name: unknown;
  baseType: unknown;
  allowedLoadModes: unknown;
  persistentNote: unknown;
}>;

export type ExerciseDefinitionValidation =
  | Readonly<{ ok: true; value: ExerciseDefinition }>
  | Readonly<{
      ok: false;
      fieldErrors: Readonly<Record<string, readonly string[]>>;
    }>;

export function validateExerciseDefinition(
  input: ExerciseDefinitionInput,
): ExerciseDefinitionValidation {
  const fieldErrors: Record<string, string[]> = {};
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const baseType = isExerciseBaseType(input.baseType) ? input.baseType : null;
  const persistentNote =
    typeof input.persistentNote === "string" ? input.persistentNote : null;
  const allowedLoadModes = parseLoadModes(input.allowedLoadModes);

  if (name.length === 0) {
    fieldErrors.name = ["Enter a name for this exercise."];
  }

  if (baseType === null) {
    fieldErrors.baseType = ["Choose an exercise type."];
  }

  if (persistentNote === null) {
    fieldErrors.persistentNote = ["Enter a valid exercise note."];
  }

  if (allowedLoadModes === null || allowedLoadModes.length === 0) {
    fieldErrors.allowedLoadModes = ["Select at least one permitted load mode."];
  } else if (baseType !== null && !hasValidModes(baseType, allowedLoadModes)) {
    fieldErrors.allowedLoadModes = [
      "Select only load modes supported by this exercise type.",
    ];
  }

  if (
    baseType === "weights" &&
    allowedLoadModes !== null &&
    !allowedLoadModes.includes("weight")
  ) {
    fieldErrors.allowedLoadModes = [
      "Weights exercises must permit the basic weight mode.",
    ];
  }

  if (
    baseType === "band" &&
    allowedLoadModes !== null &&
    (allowedLoadModes.length !== 1 || allowedLoadModes[0] !== "resistance_band")
  ) {
    fieldErrors.allowedLoadModes = [
      "Band exercises use the resistance-band mode.",
    ];
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    baseType === null ||
    persistentNote === null ||
    allowedLoadModes === null
  ) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    value: {
      name,
      baseType,
      allowedLoadModes,
      persistentNote,
    },
  };
}

function parseLoadModes(value: unknown): ExerciseLoadMode[] | null {
  if (!Array.isArray(value)) return null;

  const modes: ExerciseLoadMode[] = [];

  for (const mode of value) {
    if (!isExerciseLoadMode(mode) || modes.includes(mode)) return null;
    modes.push(mode);
  }

  return modes;
}

function hasValidModes(
  baseType: ExerciseBaseType,
  modes: readonly ExerciseLoadMode[],
): boolean {
  const compatibleModes = allowedLoadModesByBaseType[baseType];
  return modes.every((mode) => compatibleModes.includes(mode));
}

function isExerciseBaseType(value: unknown): value is ExerciseBaseType {
  return exerciseBaseTypes.some((baseType) => baseType === value);
}

function isExerciseLoadMode(value: unknown): value is ExerciseLoadMode {
  return exerciseLoadModes.some((loadMode) => loadMode === value);
}
