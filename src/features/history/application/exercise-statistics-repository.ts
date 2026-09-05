import type {
  ExerciseHistoryEntry,
  ExercisePerformances,
} from "../domain/exercise-statistics";

export interface ExerciseStatisticsRepository {
  /** Every exercise identity with at least one recorded set in History. */
  list(): Promise<readonly ExerciseHistoryEntry[]>;
  /** Null when that identity has no performance to show. */
  getPerformances(
    exerciseIdentityId: string,
  ): Promise<ExercisePerformances | null>;
}

export type ExerciseStatisticsRepositoryErrorCode =
  "not_found" | "unavailable" | "unexpected";

export class ExerciseStatisticsRepositoryError extends Error {
  readonly code: ExerciseStatisticsRepositoryErrorCode;

  constructor(
    code: ExerciseStatisticsRepositoryErrorCode,
    options?: ErrorOptions,
  ) {
    super("Exercise statistics repository operation failed", options);
    this.name = "ExerciseStatisticsRepositoryError";
    this.code = code;
  }
}
