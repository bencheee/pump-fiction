import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "@/shared/application/operation-result";

import type { AppSettings } from "../domain/app-settings";
import type { AppSettingsRepository } from "./app-settings-repository";
import { repositoryFailure } from "./failures";

export type UpdateAppTimeZoneInput = Readonly<{
  timeZone: unknown;
}>;

export async function updateAppTimeZone(
  repository: AppSettingsRepository,
  input: UpdateAppTimeZoneInput,
): Promise<OperationResult<AppSettings>> {
  const timeZone = validateTimeZone(input.timeZone);

  if (timeZone === null) {
    return operationFailure({
      code: "validation",
      message: "Check the submitted values and try again.",
      retryable: false,
      fieldErrors: { timeZone: ["Enter a valid IANA time zone."] },
    });
  }

  try {
    return operationSuccess(await repository.updateTimeZone(timeZone));
  } catch (error) {
    return repositoryFailure(error, "save");
  }
}

function validateTimeZone(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const timeZone = value.trim();
  if (timeZone.length === 0) {
    return null;
  }

  try {
    new Intl.DateTimeFormat("en", { timeZone }).format();
    return timeZone;
  } catch {
    return null;
  }
}
