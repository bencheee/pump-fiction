import type {
  CurrentWorkout,
  StartWorkoutDefinition,
  TodayView,
} from "../domain/workout";

export interface WorkoutRepository {
  getToday(): Promise<TodayView>;
  getCurrent(): Promise<CurrentWorkout | null>;
  start(definition: StartWorkoutDefinition): Promise<CurrentWorkout>;
}

export type WorkoutRepositoryErrorCode =
  | "not_found"
  | "conflict"
  | "inactive_exercise"
  | "constraint"
  | "unavailable"
  | "unexpected";
export class WorkoutRepositoryError extends Error {
  constructor(
    readonly code: WorkoutRepositoryErrorCode,
    options?: ErrorOptions,
  ) {
    super("Workout repository operation failed", options);
    this.name = "WorkoutRepositoryError";
  }
}
