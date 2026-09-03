import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "@/shared/application/operation-result";
import type {
  CurrentWorkout,
  StartWorkoutInput,
  TodayView,
} from "../domain/workout";
import { validateStartWorkout } from "../domain/workout-validation";
import {
  WorkoutRepositoryError,
  type WorkoutRepository,
} from "./workout-repository";

export async function getToday(
  repository: WorkoutRepository,
): Promise<OperationResult<TodayView>> {
  try {
    return operationSuccess(await repository.getToday());
  } catch {
    return persistence<TodayView>("We couldn't load Today. Try again.");
  }
}
export async function getCurrentWorkout(
  repository: WorkoutRepository,
): Promise<OperationResult<CurrentWorkout | null>> {
  try {
    return operationSuccess(await repository.getCurrent());
  } catch {
    return persistence<CurrentWorkout | null>(
      "We couldn't restore the current workout. Try again.",
    );
  }
}
export async function startWorkout(
  repository: WorkoutRepository,
  input: StartWorkoutInput,
): Promise<OperationResult<CurrentWorkout>> {
  const validation = validateStartWorkout(input);
  if (!validation.ok)
    return operationFailure({
      code: "validation",
      message: "Check the workout details and try again.",
      retryable: false,
      fieldErrors: validation.fieldErrors,
    });
  try {
    return operationSuccess(await repository.start(validation.value));
  } catch (error) {
    if (error instanceof WorkoutRepositoryError) {
      if (error.code === "not_found" || error.code === "inactive_exercise")
        return operationFailure({
          code: "not_found",
          message: "The selected workout source is no longer available.",
          retryable: false,
        });
      if (error.code === "conflict")
        return operationFailure({
          code: "conflict",
          message:
            "A current workout already exists. Return to it before starting another.",
          retryable: false,
        });
      if (error.code === "constraint")
        return operationFailure({
          code: "validation",
          message: "Check the workout details and try again.",
          retryable: false,
        });
    }
    return persistence<CurrentWorkout>(
      "We couldn't start the workout. Try again.",
    );
  }
}
function persistence<T>(message: string): OperationResult<T> {
  return operationFailure({ code: "persistence", message, retryable: true });
}
