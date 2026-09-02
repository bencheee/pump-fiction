import type {
  ProgramDefinition,
  SplitDefinition,
  SplitPrescriptionDefinition,
} from "./program";

export type ProgramDefinitionInput = Readonly<{ name: unknown }>;

export type SplitDefinitionInput = Readonly<{
  name: unknown;
  exercises: unknown;
}>;

export type DefinitionValidation<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{
      ok: false;
      fieldErrors: Readonly<Record<string, readonly string[]>>;
    }>;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateProgramDefinition(
  input: ProgramDefinitionInput,
): DefinitionValidation<ProgramDefinition> {
  const name = typeof input.name === "string" ? input.name.trim() : "";

  if (name.length === 0) {
    return {
      ok: false,
      fieldErrors: { name: ["Enter a name for this program."] },
    };
  }

  return { ok: true, value: { name } };
}

export function validateSplitDefinition(
  input: SplitDefinitionInput,
): DefinitionValidation<SplitDefinition> {
  const fieldErrors: Record<string, string[]> = {};
  const name = typeof input.name === "string" ? input.name.trim() : "";

  if (name.length === 0) {
    fieldErrors.name = ["Enter a name for this split."];
  }

  const exercises = parsePrescriptions(input.exercises, fieldErrors);

  if (Object.keys(fieldErrors).length > 0 || exercises === null) {
    return { ok: false, fieldErrors };
  }

  return { ok: true, value: { name, exercises } };
}

export function parseUuid(value: unknown): string | null {
  return typeof value === "string" && uuidPattern.test(value) ? value : null;
}

export function parseUuidOrder(value: unknown): readonly string[] | null {
  if (!Array.isArray(value)) return null;

  const ids: string[] = [];
  for (const candidate of value) {
    const id = parseUuid(candidate);
    if (id === null || ids.includes(id)) return null;
    ids.push(id);
  }
  return ids;
}

function parsePrescriptions(
  value: unknown,
  fieldErrors: Record<string, string[]>,
): SplitPrescriptionDefinition[] | null {
  if (!Array.isArray(value)) {
    fieldErrors.exercises = ["Provide an ordered exercise list."];
    return null;
  }

  const prescriptions: SplitPrescriptionDefinition[] = [];
  const seenExerciseIds = new Set<string>();

  value.forEach((candidate, index) => {
    const path = `exercises.${index}`;
    if (!isRecord(candidate)) {
      fieldErrors[path] = ["Provide a valid exercise prescription."];
      return;
    }

    const exerciseId = parseUuid(candidate.exerciseId);
    if (exerciseId === null) {
      fieldErrors[`${path}.exerciseId`] = ["Choose an exercise."];
    } else if (seenExerciseIds.has(exerciseId)) {
      fieldErrors[`${path}.exerciseId`] = [
        "An exercise can appear only once in a split.",
      ];
    } else {
      seenExerciseIds.add(exerciseId);
    }

    const plannedSets = parsePositiveInteger(candidate.plannedSets);
    const minReps = parsePositiveInteger(candidate.minReps);
    const maxReps = parsePositiveInteger(candidate.maxReps);

    if (plannedSets === null) {
      fieldErrors[`${path}.plannedSets`] = [
        "Planned sets must be a positive whole number.",
      ];
    }
    if (minReps === null) {
      fieldErrors[`${path}.minReps`] = [
        "Minimum reps must be a positive whole number.",
      ];
    }
    if (maxReps === null) {
      fieldErrors[`${path}.maxReps`] = [
        "Maximum reps must be a positive whole number.",
      ];
    }
    if (minReps !== null && maxReps !== null && minReps > maxReps) {
      fieldErrors[`${path}.maxReps`] = [
        "Maximum reps must be at least the minimum reps.",
      ];
    }

    if (
      exerciseId !== null &&
      plannedSets !== null &&
      minReps !== null &&
      maxReps !== null
    ) {
      prescriptions.push({ exerciseId, plannedSets, minReps, maxReps });
    }
  });

  return prescriptions;
}

function parsePositiveInteger(value: unknown): number | null {
  return Number.isSafeInteger(value) && (value as number) > 0
    ? (value as number)
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
