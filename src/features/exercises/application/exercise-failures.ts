import {
  operationFailure,
  type OperationResult,
} from "@/shared/application/operation-result";

import { ExerciseRepositoryError } from "./exercise-repository";

export function exerciseRepositoryFailure<T>(
  error: unknown,
  operation: "load" | "save" | "delete",
): OperationResult<T> {
  if (error instanceof ExerciseRepositoryError) {
    if (error.code === "not_found") {
      return operationFailure({
        code: "not_found",
        message: "The requested exercise is no longer available.",
        retryable: false,
      });
    }

    if (error.code === "duplicate_name") {
      return operationFailure({
        code: "validation",
        message: "Check the submitted values and try again.",
        retryable: false,
        fieldErrors: {
          name: ["Another exercise already uses this name."],
        },
      });
    }

    if (error.code === "constraint") {
      return operationFailure({
        code: "validation",
        message: "Check the submitted values and try again.",
        retryable: false,
      });
    }
  }

  return operationFailure({
    code: "persistence",
    message:
      operation === "load"
        ? "We couldn't load the exercises. Try again."
        : operation === "delete"
          ? "We couldn't delete the exercise. Try again."
          : "We couldn't save the exercise. Try again.",
    retryable: true,
  });
}
