import type { AppSettings } from "../domain/app-settings";

export interface AppSettingsRepository {
  get(): Promise<AppSettings>;
  updateTimeZone(timeZone: string): Promise<AppSettings>;
}

export type RepositoryErrorCode =
  "not_found" | "constraint" | "conflict" | "unavailable" | "unexpected";

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;

  constructor(code: RepositoryErrorCode, options?: ErrorOptions) {
    super("Repository operation failed", options);
    this.name = "RepositoryError";
    this.code = code;
  }
}
