import "server-only";

import {
  SplitStatisticsRepositoryError,
  type SplitStatisticsRepository,
} from "@/features/history/application/split-statistics-repository";
import type { SplitWorkout } from "@/features/history/domain/split-statistics";
import type { ServerDatabaseClient } from "@/server/database/client";

export class SupabaseSplitStatisticsRepository implements SplitStatisticsRepository {
  constructor(private readonly client: ServerDatabaseClient) {}

  async listSplitWorkouts(): Promise<readonly SplitWorkout[]> {
    try {
      const { data, error } = await this.client.rpc("list_split_workouts");
      if (error)
        throw new SplitStatisticsRepositoryError("unexpected", {
          cause: error,
        });
      return data as unknown as readonly SplitWorkout[];
    } catch (error) {
      throw error instanceof SplitStatisticsRepositoryError
        ? error
        : new SplitStatisticsRepositoryError("unavailable", { cause: error });
    }
  }
}
