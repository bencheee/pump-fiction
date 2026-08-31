import {
  operationFailure,
  type OperationResult,
} from "@/shared/application/operation-result";

import { RepositoryError } from "./app-settings-repository";

export function repositoryFailure<T>(
  error: unknown,
  operation: "load" | "save",
): OperationResult<T> {
  if (error instanceof RepositoryError) {
    if (error.code === "not_found") {
      return operationFailure({
        code: "not_found",
        message: "The requested settings are no longer available.",
        retryable: false,
      });
    }

    if (error.code === "constraint") {
      return operationFailure({
        code: "validation",
        message: "Check the submitted values and try again.",
        retryable: false,
      });
    }

    if (error.code === "conflict") {
      return operationFailure({
        code: "conflict",
        message: "The data changed. Refresh and try again.",
        retryable: true,
      });
    }
  }

  return operationFailure({
    code: "persistence",
    message:
      operation === "load"
        ? "We couldn't load the settings. Try again."
        : "We couldn't save the changes. Try again.",
    retryable: true,
  });
}
