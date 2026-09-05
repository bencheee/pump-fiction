import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";
import {
  ExerciseStatisticsRepositoryError,
  type ExerciseStatisticsRepository,
} from "@/features/history/application/exercise-statistics-repository";
import type {
  ExerciseHistoryEntry,
  ExercisePerformances,
} from "@/features/history/domain/exercise-statistics";
import type { ServerDatabaseClient } from "@/server/database/client";

export class SupabaseExerciseStatisticsRepository implements ExerciseStatisticsRepository {
  constructor(private readonly client: ServerDatabaseClient) {}

  async list(): Promise<readonly ExerciseHistoryEntry[]> {
    try {
      const { data, error } = await this.client.rpc("list_exercise_history");
      if (error) throw map(error);
      return data as unknown as readonly ExerciseHistoryEntry[];
    } catch (error) {
      throw normalize(error);
    }
  }

  async getPerformances(
    exerciseIdentityId: string,
  ): Promise<ExercisePerformances | null> {
    try {
      const { data, error } = await this.client.rpc(
        "get_exercise_performances",
        { p_exercise_identity_id: exerciseIdentityId },
      );
      if (error) throw map(error);
      return data as unknown as ExercisePerformances | null;
    } catch (error) {
      throw normalize(error);
    }
  }
}

function map(error: PostgrestError): ExerciseStatisticsRepositoryError {
  return new ExerciseStatisticsRepositoryError("unexpected", { cause: error });
}
function normalize(error: unknown): ExerciseStatisticsRepositoryError {
  return error instanceof ExerciseStatisticsRepositoryError
    ? error
    : new ExerciseStatisticsRepositoryError("unavailable", { cause: error });
}
