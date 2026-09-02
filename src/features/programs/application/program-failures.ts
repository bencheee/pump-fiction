import {
  operationFailure,
  type OperationResult,
} from "@/shared/application/operation-result";

import { ProgramRepositoryError } from "./program-repository";

export function programRepositoryFailure<T>(
  error: unknown,
  operation: "load" | "save",
): OperationResult<T> {
  if (error instanceof ProgramRepositoryError) {
    if (error.code === "not_found") {
      return operationFailure({
        code: "not_found",
        message: "The requested program or split is no longer available.",
        retryable: false,
      });
    }

    const validationMessage = validationMessageFor(error.code);
    if (validationMessage !== null) {
      return operationFailure({
        code: error.code === "invalid_order" ? "conflict" : "validation",
        message: validationMessage,
        retryable: false,
        ...(fieldErrorsFor(error.code) === undefined
          ? {}
          : { fieldErrors: fieldErrorsFor(error.code) }),
      });
    }
  }

  return operationFailure({
    code: "persistence",
    message:
      operation === "load"
        ? "We couldn't load the programs. Try again."
        : "We couldn't save the program changes. Try again.",
    retryable: true,
  });
}

function fieldErrorsFor(
  code: ProgramRepositoryError["code"],
): Readonly<Record<string, readonly string[]>> | undefined {
  switch (code) {
    case "duplicate_name":
      return {
        name: ["An active split in this program already uses this name."],
      };
    case "inactive_exercise":
      return {
        exercises: [
          "New split exercises must come from the active Exercise Library.",
        ],
      };
    case "invalid_next_split":
      return {
        nextSplitId: ["Choose an active split from this program."],
      };
    case "invalid_order":
      return { order: ["Reload the complete saved order and try again."] };
    default:
      return undefined;
  }
}

function validationMessageFor(
  code: ProgramRepositoryError["code"],
): string | null {
  switch (code) {
    case "duplicate_name":
      return "An active split in this program already uses that name.";
    case "inactive_exercise":
      return "New split exercises must come from the active Exercise Library.";
    case "last_active_split":
      return "At least one active split must remain in the program.";
    case "invalid_next_split":
      return "Choose an active split from this program as the next split.";
    case "invalid_order":
      return "The saved order changed. Reload and try again.";
    case "constraint":
      return "Check the submitted program and split values and try again.";
    default:
      return null;
  }
}
