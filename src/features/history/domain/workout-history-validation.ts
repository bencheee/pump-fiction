import type {
  BandDirection,
  BandStrength,
} from "@/features/active-workout/domain/active-workout-command";
import {
  exerciseLoadModes,
  type ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";
import type { FieldErrors } from "@/shared/application/operation-result";
import type { HistoryCorrection } from "./workout-history";

export type HistoryCorrectionValidation =
  | Readonly<{ ok: true; value: HistoryCorrection }>
  | Readonly<{ ok: false; fieldErrors: FieldErrors }>;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const localDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const loadModes = new Set<ExerciseLoadMode>(exerciseLoadModes);

/**
 * Validates one historical correction before it reaches the database. The
 * snapshotted allowed modes and the set shape stay database invariants; this
 * checks the transport shape and the rules a field error can explain.
 */
export function validateHistoryCorrection(
  input: unknown,
): HistoryCorrectionValidation {
  if (!isRecord(input))
    return invalid("correction", "Provide a correction object.");

  if (input.kind === "timing") {
    if (!isUuid(input.workoutId))
      return invalid("workoutId", "Choose a saved workout.");
    if (!isLocalDate(input.workoutDate))
      return invalid("workoutDate", "Enter a valid date.");
    if (!isTimestamp(input.startedAt))
      return invalid("startedAt", "Enter a valid start time.");
    if (!isTimestamp(input.finishedAt))
      return invalid("finishedAt", "Enter a valid finish time.");
    if (Date.parse(input.finishedAt) < Date.parse(input.startedAt))
      return invalid("finishedAt", "The finish time is before the start time.");
    return {
      ok: true,
      value: {
        kind: "timing",
        workoutId: input.workoutId,
        workoutDate: input.workoutDate,
        startedAt: input.startedAt,
        finishedAt: input.finishedAt,
      },
    };
  }

  if (input.kind === "exercise_note") {
    if (!isUuid(input.workoutExerciseId))
      return invalid("workoutExerciseId", "Choose a workout exercise.");
    if (typeof input.note !== "string")
      return invalid("note", "Enter note text.");
    return {
      ok: true,
      value: {
        kind: "exercise_note",
        workoutExerciseId: input.workoutExerciseId,
        note: input.note,
      },
    };
  }

  if (input.kind === "update_set") {
    if (!isUuid(input.workoutSetId))
      return invalid("workoutSetId", "Choose a set.");
    if (!(
      input.loadMode === null ||
      (typeof input.loadMode === "string" &&
        loadModes.has(input.loadMode as ExerciseLoadMode))
    ))
      return invalid("loadMode", "Choose an available load mode.");
    if (!isNullablePositiveNumber(input.loadKg))
      return invalid("loadKg", "Enter a value above zero.");
    if (!isBandDirection(input.bandDirection))
      return invalid("bandDirection", "Choose a band direction.");
    if (!isBandStrength(input.bandStrength))
      return invalid("bandStrength", "Choose a band strength.");
    if (!isNullablePositiveInteger(input.reps))
      return invalid("reps", "Enter whole reps above zero.");
    return {
      ok: true,
      value: {
        kind: "update_set",
        workoutSetId: input.workoutSetId,
        loadMode: input.loadMode as ExerciseLoadMode | null,
        loadKg: input.loadKg as number | null,
        bandDirection: input.bandDirection as BandDirection | null,
        bandStrength: input.bandStrength as BandStrength | null,
        reps: input.reps as number | null,
      },
    };
  }

  if (input.kind === "add_set") {
    if (!isUuid(input.workoutExerciseId))
      return invalid("workoutExerciseId", "Choose a workout exercise.");
    return {
      ok: true,
      value: { kind: "add_set", workoutExerciseId: input.workoutExerciseId },
    };
  }

  if (input.kind === "remove_set" || input.kind === "remove_exercise") {
    const key =
      input.kind === "remove_set" ? "workoutSetId" : "workoutExerciseId";
    if (!isUuid(input[key]))
      return invalid(key, "Choose what to remove from the workout.");
    if (typeof input.confirmedPopulatedRemoval !== "boolean")
      return invalid(
        "confirmedPopulatedRemoval",
        "Confirm the removal of recorded data.",
      );
    return {
      ok: true,
      value:
        input.kind === "remove_set"
          ? {
              kind: "remove_set",
              workoutSetId: input.workoutSetId as string,
              confirmedPopulatedRemoval: input.confirmedPopulatedRemoval,
            }
          : {
              kind: "remove_exercise",
              workoutExerciseId: input.workoutExerciseId as string,
              confirmedPopulatedRemoval: input.confirmedPopulatedRemoval,
            },
    };
  }

  if (input.kind === "add_exercise") {
    if (!isUuid(input.workoutId))
      return invalid("workoutId", "Choose a saved workout.");
    if (!isUuid(input.exerciseId))
      return invalid("exerciseId", "Choose a library exercise.");
    return {
      ok: true,
      value: {
        kind: "add_exercise",
        workoutId: input.workoutId,
        exerciseId: input.exerciseId,
      },
    };
  }

  if (input.kind === "reorder_exercises") {
    if (!isUuid(input.workoutId))
      return invalid("workoutId", "Choose a saved workout.");
    if (
      !Array.isArray(input.workoutExerciseIds) ||
      input.workoutExerciseIds.length === 0 ||
      input.workoutExerciseIds.some((id) => !isUuid(id)) ||
      new Set(input.workoutExerciseIds).size !== input.workoutExerciseIds.length
    )
      return invalid(
        "workoutExerciseIds",
        "List every workout exercise exactly once.",
      );
    return {
      ok: true,
      value: {
        kind: "reorder_exercises",
        workoutId: input.workoutId,
        workoutExerciseIds: [...(input.workoutExerciseIds as string[])],
      },
    };
  }

  if (input.kind === "mark_completed" || input.kind === "delete") {
    if (!isUuid(input.workoutId))
      return invalid("workoutId", "Choose a saved workout.");
    return {
      ok: true,
      value: { kind: input.kind, workoutId: input.workoutId },
    };
  }

  return invalid("kind", "Choose a supported correction.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}
function isLocalDate(value: unknown): value is string {
  if (typeof value !== "string" || !localDatePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
function isNullablePositiveNumber(value: unknown): boolean {
  return value === null || (typeof value === "number" && value > 0);
}
function isNullablePositiveInteger(value: unknown): boolean {
  return (
    value === null ||
    (typeof value === "number" && Number.isInteger(value) && value > 0)
  );
}
function isBandDirection(value: unknown): boolean {
  return value === null || value === "resistance" || value === "assistance";
}
function isBandStrength(value: unknown): boolean {
  return (
    value === null ||
    value === "light" ||
    value === "medium" ||
    value === "strong"
  );
}
function invalid(field: string, message: string): HistoryCorrectionValidation {
  return { ok: false, fieldErrors: { [field]: [message] } };
}
