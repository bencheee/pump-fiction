import type { SplitWorkout } from "../domain/split-statistics";

export interface SplitStatisticsRepository {
  /** Every completed split-sourced workout, newest first. */
  listSplitWorkouts(): Promise<readonly SplitWorkout[]>;
}

export class SplitStatisticsRepositoryError extends Error {
  readonly code: "unavailable" | "unexpected";

  constructor(code: "unavailable" | "unexpected", options?: ErrorOptions) {
    super("Split statistics repository operation failed", options);
    this.name = "SplitStatisticsRepositoryError";
    this.code = code;
  }
}
