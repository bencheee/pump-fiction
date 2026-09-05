import type {
  HistoryCorrection,
  HistoryMonthGroup,
  HistoryWorkout,
} from "../domain/workout-history";

export interface WorkoutHistoryRepository {
  /** Saved workouts grouped by month, newest first. */
  list(): Promise<readonly HistoryMonthGroup[]>;
  /** Null for an unknown id and for the current active or paused workout. */
  getById(id: string): Promise<HistoryWorkout | null>;
  /** One correction, applied atomically. */
  correct(correction: HistoryCorrection): Promise<void>;
}

export type WorkoutHistoryRepositoryErrorCode =
  | "not_found"
  | "conflict"
  | "confirmation_required"
  | "unavailable_exercise"
  | "constraint"
  | "unavailable"
  | "unexpected";

export class WorkoutHistoryRepositoryError extends Error {
  readonly code: WorkoutHistoryRepositoryErrorCode;

  constructor(code: WorkoutHistoryRepositoryErrorCode, options?: ErrorOptions) {
    super("Workout history repository operation failed", options);
    this.name = "WorkoutHistoryRepositoryError";
    this.code = code;
  }
}
