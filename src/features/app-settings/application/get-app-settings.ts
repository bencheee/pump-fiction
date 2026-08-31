import {
  operationSuccess,
  type OperationResult,
} from "@/shared/application/operation-result";

import type { AppSettings } from "../domain/app-settings";
import type { AppSettingsRepository } from "./app-settings-repository";
import { repositoryFailure } from "./failures";

export async function getAppSettings(
  repository: AppSettingsRepository,
): Promise<OperationResult<AppSettings>> {
  try {
    return operationSuccess(await repository.get());
  } catch (error) {
    return repositoryFailure(error, "load");
  }
}
