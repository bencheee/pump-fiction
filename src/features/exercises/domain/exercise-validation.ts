import {
  allowedLoadModesByBaseType,
  baseLoadModeByBaseType,
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

  if (allowedLoadModes === null) {
    fieldErrors.allowedLoadModes = ["Select at least one permitted load mode."];
  } else if (baseType !== null) {
    const modeError = loadModeError(baseType, allowedLoadModes);
    if (modeError !== null) fieldErrors.allowedLoadModes = [modeError];
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

function loadModeError(
  baseType: ExerciseBaseType,
  modes: readonly ExerciseLoadMode[],
): string | null {
  const compatibleModes = allowedLoadModesByBaseType[baseType];
  if (!modes.every((mode) => compatibleModes.includes(mode))) {
    return "Select only load modes supported by this exercise type.";
  }

  const baseMode = baseLoadModeByBaseType[baseType];
  if (baseMode !== null && !modes.includes(baseMode)) {
    return baseType === "weights"
      ? "Weights exercises always include the basic weight mode."
      : "Bodyweight exercises always include the bodyweight mode.";
  }

  const optionalModes = modes.filter((mode) => mode !== baseMode);
  if (baseMode === null && optionalModes.length !== 1) {
    return "Choose exactly one assistance mode.";
  }
  if (baseMode !== null && optionalModes.length > 1) {
    return "Choose at most one additional mode.";
  }

  return null;
}

function isExerciseBaseType(value: unknown): value is ExerciseBaseType {
  return exerciseBaseTypes.some((baseType) => baseType === value);
}

function isExerciseLoadMode(value: unknown): value is ExerciseLoadMode {
  return exerciseLoadModes.some((loadMode) => loadMode === value);
}
