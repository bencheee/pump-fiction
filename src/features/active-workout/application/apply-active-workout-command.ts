import type { ActiveWorkoutCommandResult } from "./active-workout-command-result";
import {
  ActiveWorkoutCommandRepositoryError,
  type ActiveWorkoutCommandRepository,
} from "./active-workout-command-repository";
import { parseActiveWorkoutCommand } from "../domain/active-workout-command";

export async function applyActiveWorkoutCommand(
  repository: ActiveWorkoutCommandRepository,
  input: unknown,
): Promise<ActiveWorkoutCommandResult> {
  const validation = parseActiveWorkoutCommand(input);

  if (!validation.ok) {
    return {
      kind: "rejected",
      code: "validation",
      message: "Check the active-workout change and try again.",
      fieldErrors: validation.fieldErrors,
    };
  }

  try {
    const result = await repository.apply(validation.command);

    if (result.kind === "not_found") {
      return {
        kind: "rejected",
        code: "not_found",
        message: "The active workout is no longer available.",
      };
    }

    if (result.kind === "conflict") {
      return {
        kind: "conflict",
        conflict: {
          commandId: result.commandId,
          workoutId: result.workoutId,
          expectedRevision: result.expectedRevision,
          actualRevision: result.actualRevision,
          recovery: "refresh_and_replay",
        },
      };
    }

    return {
      kind: "acknowledged",
      acknowledgement: {
        commandId: result.commandId,
        workoutId: result.workoutId,
        expectedRevision: result.expectedRevision,
        resultingRevision: result.resultingRevision,
        duplicate: result.kind === "duplicate",
      },
    };
  } catch (error) {
    if (
      error instanceof ActiveWorkoutCommandRepositoryError &&
      error.code === "constraint"
    ) {
      return {
        kind: "rejected",
        code: "validation",
        message: "Check the active-workout change and try again.",
      };
    }

    return {
      kind: "retry",
      code: "persistence",
      message: "We couldn't save the workout change. Try again.",
    };
  }
}
