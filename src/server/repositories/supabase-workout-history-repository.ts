import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";
import {
  WorkoutHistoryRepositoryError,
  type WorkoutHistoryRepository,
  type WorkoutHistoryRepositoryErrorCode,
} from "@/features/history/application/workout-history-repository";
import type {
  HistoryCorrection,
  HistoryMonthGroup,
  HistoryWorkout,
} from "@/features/history/domain/workout-history";
import type { ServerDatabaseClient } from "@/server/database/client";

export class SupabaseWorkoutHistoryRepository implements WorkoutHistoryRepository {
  constructor(private readonly client: ServerDatabaseClient) {}

  async list(): Promise<readonly HistoryMonthGroup[]> {
    try {
      const { data, error } = await this.client.rpc("list_workout_history");
      if (error) throw mapPostgrestError(error);
      return data as unknown as readonly HistoryMonthGroup[];
    } catch (error) {
      throw normalize(error);
    }
  }

  async getById(id: string): Promise<HistoryWorkout | null> {
    try {
      const { data, error } = await this.client.rpc("get_history_workout", {
        p_workout_id: id,
      });
      if (error) throw mapPostgrestError(error);
      return data as unknown as HistoryWorkout | null;
    } catch (error) {
      throw normalize(error);
    }
  }

  async correct(correction: HistoryCorrection): Promise<void> {
    try {
      const { error } = await this.call(correction);
      if (error) throw mapPostgrestError(error);
    } catch (error) {
      throw normalize(error);
    }
  }

  private call(
    correction: HistoryCorrection,
  ): PromiseLike<{ error: PostgrestError | null }> {
    switch (correction.kind) {
      case "timing":
        return this.client.rpc("update_history_workout_timing", {
          p_workout_id: correction.workoutId,
          p_workout_date: correction.workoutDate,
          p_started_at: correction.startedAt,
          p_finished_at: correction.finishedAt,
        });
      case "exercise_note":
        return this.client.rpc("set_history_workout_exercise_note", {
          p_workout_exercise_id: correction.workoutExerciseId,
          p_note: correction.note,
        });
      case "update_set":
        // Values travel as one JSON object because a cleared field is a real
        // null, which a generated scalar RPC argument type cannot express.
        return this.client.rpc("update_history_set", {
          p_workout_set_id: correction.workoutSetId,
          p_values: {
            loadMode: correction.loadMode,
            loadKg: correction.loadKg,
            bandDirection: correction.bandDirection,
            bandStrength: correction.bandStrength,
            reps: correction.reps,
          },
        });
      case "add_set":
        return this.client.rpc("add_history_set", {
          p_workout_exercise_id: correction.workoutExerciseId,
        });
      case "remove_set":
        return this.client.rpc("remove_history_set", {
          p_workout_set_id: correction.workoutSetId,
          p_confirmed_populated_removal: correction.confirmedPopulatedRemoval,
        });
      case "add_exercise":
        return this.client.rpc("add_history_workout_exercise", {
          p_workout_id: correction.workoutId,
          p_exercise_id: correction.exerciseId,
        });
      case "remove_exercise":
        return this.client.rpc("remove_history_workout_exercise", {
          p_workout_exercise_id: correction.workoutExerciseId,
          p_confirmed_populated_removal: correction.confirmedPopulatedRemoval,
        });
      case "reorder_exercises":
        return this.client.rpc("reorder_history_workout_exercises", {
          p_workout_id: correction.workoutId,
          p_workout_exercise_ids: [...correction.workoutExerciseIds],
        });
      case "delete":
        return this.client.rpc("delete_history_workout", {
          p_workout_id: correction.workoutId,
        });
    }
  }
}

function mapPostgrestError(
  error: PostgrestError,
): WorkoutHistoryRepositoryError {
  const mapping: Readonly<Record<string, WorkoutHistoryRepositoryErrorCode>> = {
    PF201: "not_found",
    PF202: "conflict",
    PF203: "unavailable_exercise",
    PF204: "confirmation_required",
    PF205: "constraint",
    PF206: "constraint",
  };
  return new WorkoutHistoryRepositoryError(
    mapping[error.code] ??
      (error.code.startsWith("22") || error.code.startsWith("23")
        ? "constraint"
        : "unexpected"),
    { cause: error },
  );
}

function normalize(error: unknown): WorkoutHistoryRepositoryError {
  return error instanceof WorkoutHistoryRepositoryError
    ? error
    : new WorkoutHistoryRepositoryError("unavailable", { cause: error });
}
