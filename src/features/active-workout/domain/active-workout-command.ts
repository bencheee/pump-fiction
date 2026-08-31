export type SetWorkoutExerciseNoteCommand = Readonly<{
  commandId: string;
  workoutId: string;
  expectedRevision: number;
  operation: "set_workout_exercise_note";
  payload: Readonly<{
    workoutExerciseId: string;
    note: string;
  }>;
  clientCreatedAt: string;
}>;

export type TimerCommand = Readonly<{
  commandId: string;
  workoutId: string;
  expectedRevision: number;
  operation: "pause_timer" | "resume_timer";
  payload: Readonly<{
    transitionedAt: string;
  }>;
  clientCreatedAt: string;
}>;

export type ActiveWorkoutCommand = SetWorkoutExerciseNoteCommand | TimerCommand;

export type CommandValidationResult =
  | Readonly<{ ok: true; command: ActiveWorkoutCommand }>
  | Readonly<{
      ok: false;
      fieldErrors: Readonly<Record<string, readonly string[]>>;
    }>;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseActiveWorkoutCommand(
  input: unknown,
): CommandValidationResult {
  if (!isRecord(input)) {
    return invalid("command", "Provide an active-workout command object.");
  }

  const commonError = validateCommonEnvelope(input);
  if (commonError !== null) {
    return commonError;
  }

  const common = {
    commandId: input.commandId as string,
    workoutId: input.workoutId as string,
    expectedRevision: input.expectedRevision as number,
    clientCreatedAt: input.clientCreatedAt as string,
  };

  if (input.operation === "set_workout_exercise_note") {
    if (
      !hasExactKeys(input.payload, ["workoutExerciseId", "note"]) ||
      !isUuid(input.payload.workoutExerciseId) ||
      typeof input.payload.note !== "string"
    ) {
      return invalid("payload", "Provide a workout exercise ID and note text.");
    }

    return {
      ok: true,
      command: {
        ...common,
        operation: input.operation,
        payload: {
          workoutExerciseId: input.payload.workoutExerciseId,
          note: input.payload.note,
        },
      },
    };
  }

  if (input.operation === "pause_timer" || input.operation === "resume_timer") {
    if (
      !hasExactKeys(input.payload, ["transitionedAt"]) ||
      !isTimestamp(input.payload.transitionedAt)
    ) {
      return invalid(
        "payload.transitionedAt",
        "Provide a valid timer transition timestamp.",
      );
    }

    return {
      ok: true,
      command: {
        ...common,
        operation: input.operation,
        payload: { transitionedAt: input.payload.transitionedAt },
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
  ) {
    return invalid("command", "Use the active-workout command envelope.");
  }

  if (!isUuid(input.commandId)) {
    return invalid("commandId", "Provide a valid command ID.");
  }

  if (!isUuid(input.workoutId)) {
    return invalid("workoutId", "Provide a valid workout ID.");
  }

  if (
    !Number.isSafeInteger(input.expectedRevision) ||
    (input.expectedRevision as number) < 0
  ) {
    return invalid(
      "expectedRevision",
      "Provide a non-negative workout revision.",
    );
  }

  if (!isTimestamp(input.clientCreatedAt)) {
    return invalid(
      "clientCreatedAt",
      "Provide a valid command creation timestamp.",
    );
  }

  return null;
}

function hasExactKeys(
  value: unknown,
  expectedKeys: readonly string[],
): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }

  const keys = Object.keys(value).sort();
  return (
    keys.length === expectedKeys.length &&
    [...expectedKeys].sort().every((key, index) => key === keys[index])
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

function invalid(
  field: string,
  message: string,
): Extract<CommandValidationResult, { ok: false }> {
  return { ok: false, fieldErrors: { [field]: [message] } };
}
