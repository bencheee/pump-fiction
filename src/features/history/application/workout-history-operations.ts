import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "@/shared/application/operation-result";
import type {
  HistoryMonthGroup,
  HistoryWorkout,
} from "../domain/workout-history";
import { validateHistoryCorrection } from "../domain/workout-history-validation";
import {
  WorkoutHistoryRepositoryError,
  type WorkoutHistoryRepository,
} from "./workout-history-repository";

export async function listWorkoutHistory(
  repository: WorkoutHistoryRepository,
): Promise<OperationResult<readonly HistoryMonthGroup[]>> {
  try {
    return operationSuccess(await repository.list());
  } catch {
    return persistence("We couldn't load your workout history. Try again.");
  }
}

export async function getHistoryWorkout(
  repository: WorkoutHistoryRepository,
  workoutId: string,
): Promise<OperationResult<HistoryWorkout>> {
  let workout: HistoryWorkout | null;
  try {
    workout = await repository.getById(workoutId);
  } catch {
    return persistence("We couldn't load that workout. Try again.");
  }
  return workout === null ? notFound() : operationSuccess(workout);
}

/**
 * Applies one correction and returns the workout as it stands afterwards, so
 * the caller sees every recalculated value. A deletion returns null.
 */
export async function correctHistoryWorkout(
  repository: WorkoutHistoryRepository,
  input: unknown,
): Promise<OperationResult<HistoryWorkout | null>> {
  const validation = validateHistoryCorrection(input);
  if (!validation.ok)
    return operationFailure({
      code: "validation",
      message: "Check the corrected values and try again.",
      retryable: false,
      fieldErrors: validation.fieldErrors,
    });
  const correction = validation.value;

  try {
    await repository.correct(correction);
  } catch (error) {
    return correctionFailure(error);
  }

  if (correction.kind === "delete") return operationSuccess(null);

  const workoutId =
    "workoutId" in correction ? correction.workoutId : undefined;
  if (workoutId === undefined) return operationSuccess(null);
  try {
    return operationSuccess(await repository.getById(workoutId));
  } catch {
    return persistence("We saved the change but couldn't reload the workout.");
  }
}

function correctionFailure(
  error: unknown,
): OperationResult<HistoryWorkout | null> {
  if (error instanceof WorkoutHistoryRepositoryError) {
    if (error.code === "not_found")
      return operationFailure({
        code: "not_found",
        message: "That workout is no longer in your history.",
        retryable: false,
      });
    if (error.code === "conflict")
      return operationFailure({
        code: "conflict",
        message:
          "That workout is still in progress. Finish it before correcting it in History.",
        retryable: false,
      });
    if (error.code === "confirmation_required")
      return operationFailure({
        code: "validation",
        message: "Confirm the removal of recorded data first.",
        retryable: false,
      });
    if (error.code === "unavailable_exercise")
      return operationFailure({
        code: "not_found",
        message: "That exercise is no longer in your library.",
        retryable: false,
      });
    if (error.code === "constraint")
      return operationFailure({
        code: "validation",
        message: "Check the corrected values and try again.",
        retryable: false,
      });
  }
  return persistence("We couldn't save the correction. Try again.");
}

function persistence<T>(message: string): OperationResult<T> {
  return operationFailure({ code: "persistence", message, retryable: true });
}
function notFound<T>(): OperationResult<T> {
  return operationFailure({
    code: "not_found",
    message: "That workout is no longer in your history.",
    retryable: false,
  });
}
