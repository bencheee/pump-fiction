import {
  exerciseLoadModes,
  type ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";

export type BandDirection = "resistance" | "assistance";
export type BandStrength = "light" | "medium" | "strong";
type Envelope<O extends string, P> = Readonly<{
  commandId: string;
  workoutId: string;
  expectedRevision: number;
  operation: O;
  payload: Readonly<P>;
  clientCreatedAt: string;
}>;

export type ActiveWorkoutCommand =
  | Envelope<
      "set_workout_exercise_note",
      { workoutExerciseId: string; note: string }
    >
  | Envelope<"pause_timer" | "resume_timer", { transitionedAt: string }>
  | Envelope<
      "update_set",
      {
        workoutSetId: string;
        loadMode: ExerciseLoadMode | null;
        loadKg: number | null;
        bandDirection: BandDirection | null;
        bandStrength: BandStrength | null;
        reps: number | null;
      }
    >
  | Envelope<"add_set", { workoutExerciseId: string }>
  | Envelope<
      "remove_set",
      { workoutSetId: string; confirmedPopulatedRemoval: boolean }
    >
  | Envelope<"add_exercise", { exerciseId: string }>
  | Envelope<
      "remove_exercise",
      { workoutExerciseId: string; confirmedPopulatedRemoval: boolean }
    >
  | Envelope<"reorder_exercises", { workoutExerciseIds: string[] }>
  | Envelope<
      "finish_workout",
      { outcome: "completed" | "discarded"; finishedAt: string }
    >;

export type CommandValidationResult =
  | Readonly<{ ok: true; command: ActiveWorkoutCommand }>
  | Readonly<{
      ok: false;
      fieldErrors: Readonly<Record<string, readonly string[]>>;
    }>;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const loadModes = new Set<ExerciseLoadMode>(exerciseLoadModes);

export function parseActiveWorkoutCommand(
  input: unknown,
): CommandValidationResult {
  if (!isRecord(input))
    return invalid("command", "Provide an active-workout command object.");
  const commonError = validateCommonEnvelope(input);
  if (commonError !== null) return commonError;
  const common = {
    commandId: input.commandId as string,
    workoutId: input.workoutId as string,
    expectedRevision: input.expectedRevision as number,
    clientCreatedAt: input.clientCreatedAt as string,
  };
  const payload = input.payload;

  if (input.operation === "set_workout_exercise_note") {
    if (
      !hasExactKeys(payload, ["workoutExerciseId", "note"]) ||
      !isUuid(payload.workoutExerciseId) ||
      typeof payload.note !== "string"
    )
      return invalid("payload", "Provide a workout exercise ID and note text.");
    return {
      ok: true,
      command: {
        ...common,
        operation: input.operation,
        payload: {
          workoutExerciseId: payload.workoutExerciseId,
          note: payload.note,
        },
      },
    };
  }
  if (input.operation === "pause_timer" || input.operation === "resume_timer") {
    if (
      !hasExactKeys(payload, ["transitionedAt"]) ||
      !isTimestamp(payload.transitionedAt)
    )
      return invalid(
        "payload.transitionedAt",
        "Provide a valid timer transition timestamp.",
      );
    return {
      ok: true,
      command: {
        ...common,
        operation: input.operation,
        payload: { transitionedAt: payload.transitionedAt },
      },
    };
  }
  if (input.operation === "update_set") {
    if (
      !hasExactKeys(payload, [
        "workoutSetId",
        "loadMode",
        "loadKg",
        "bandDirection",
        "bandStrength",
        "reps",
      ]) ||
      !isUuid(payload.workoutSetId) ||
      !(
        payload.loadMode === null ||
        (typeof payload.loadMode === "string" &&
          loadModes.has(payload.loadMode as ExerciseLoadMode))
      ) ||
      !isNullablePositiveNumber(payload.loadKg) ||
      !(
        payload.bandDirection === null ||
        payload.bandDirection === "resistance" ||
        payload.bandDirection === "assistance"
      ) ||
      !(
        payload.bandStrength === null ||
        payload.bandStrength === "light" ||
        payload.bandStrength === "medium" ||
        payload.bandStrength === "strong"
      ) ||
      !isNullablePositiveInteger(payload.reps)
    )
      return invalid("payload", "Provide valid values for the workout set.");
    return {
      ok: true,
      command: {
        ...common,
        operation: input.operation,
        payload,
      } as ActiveWorkoutCommand,
    };
  }

  if (
    input.operation === "remove_set" ||
    input.operation === "remove_exercise"
  ) {
    const idKey =
      input.operation === "remove_set" ? "workoutSetId" : "workoutExerciseId";
    if (
      !hasExactKeys(payload, [idKey, "confirmedPopulatedRemoval"]) ||
      !isUuid(payload[idKey]) ||
      typeof payload.confirmedPopulatedRemoval !== "boolean"
    )
      return invalid(
        "payload",
        "Confirm the populated-data removal when required.",
      );
    return {
      ok: true,
      command: {
        ...common,
        operation: input.operation,
        payload: {
          [idKey]: payload[idKey],
          confirmedPopulatedRemoval: payload.confirmedPopulatedRemoval,
        },
      } as ActiveWorkoutCommand,
    };
  }
  const idOperations = {
    add_set: "workoutExerciseId",
    add_exercise: "exerciseId",
  } as const;
  if (typeof input.operation === "string" && input.operation in idOperations) {
    const operation = input.operation as keyof typeof idOperations;
    const key = idOperations[operation];
    if (!hasExactKeys(payload, [key]) || !isUuid(payload[key]))
      return invalid("payload", "Provide a valid target ID.");
    return {
      ok: true,
      command: {
        ...common,
        operation,
        payload: { [key]: payload[key] },
      } as ActiveWorkoutCommand,
    };
  }
  if (input.operation === "reorder_exercises") {
    if (
      !hasExactKeys(payload, ["workoutExerciseIds"]) ||
      !Array.isArray(payload.workoutExerciseIds) ||
      payload.workoutExerciseIds.some((id) => !isUuid(id)) ||
      new Set(payload.workoutExerciseIds).size !==
        payload.workoutExerciseIds.length
    )
      return invalid(
        "payload.workoutExerciseIds",
        "Provide each workout exercise ID exactly once.",
      );
    return {
      ok: true,
      command: {
        ...common,
        operation: input.operation,
        payload: { workoutExerciseIds: payload.workoutExerciseIds as string[] },
      },
    };
  }
  if (input.operation === "finish_workout") {
    if (
      !hasExactKeys(payload, ["outcome", "finishedAt"]) ||
      !["completed", "discarded"].includes(payload.outcome as string) ||
      !isTimestamp(payload.finishedAt)
    )
      return invalid(
        "payload",
        "Choose a finish outcome and provide its timestamp.",
      );
    return {
      ok: true,
      command: {
        ...common,
        operation: input.operation,
        payload: {
          outcome: payload.outcome as "completed" | "discarded",
          finishedAt: payload.finishedAt,
        },
      },
    };
  }
  return invalid("operation", "Choose a supported active-workout operation.");
}

function validateCommonEnvelope(
  input: Record<string, unknown>,
): Extract<CommandValidationResult, { ok: false }> | null {
  if (
    !hasExactKeys(input, [
      "commandId",
      "workoutId",
      "expectedRevision",
      "operation",
      "payload",
      "clientCreatedAt",
    ])
  )
    return invalid("command", "Use the active-workout command envelope.");
  if (!isUuid(input.commandId))
    return invalid("commandId", "Provide a valid command ID.");
  if (!isUuid(input.workoutId))
    return invalid("workoutId", "Provide a valid workout ID.");
  if (
    !Number.isSafeInteger(input.expectedRevision) ||
    (input.expectedRevision as number) < 0
  )
    return invalid(
      "expectedRevision",
      "Provide a non-negative workout revision.",
    );
  if (!isTimestamp(input.clientCreatedAt))
    return invalid(
      "clientCreatedAt",
      "Provide a valid command creation timestamp.",
    );
  return null;
}
function hasExactKeys(
  value: unknown,
  expected: readonly string[],
): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value).sort();
  return (
    keys.length === expected.length &&
    [...expected].sort().every((key, index) => key === keys[index])
  );
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}
function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
function isNullablePositiveNumber(value: unknown): boolean {
  return (
    value === null ||
    (typeof value === "number" && Number.isFinite(value) && value > 0)
  );
}
function isNullablePositiveInteger(value: unknown): boolean {
  return (
    value === null || (Number.isSafeInteger(value) && (value as number) > 0)
  );
}
function invalid(
  field: string,
  message: string,
): Extract<CommandValidationResult, { ok: false }> {
  return { ok: false, fieldErrors: { [field]: [message] } };
}
