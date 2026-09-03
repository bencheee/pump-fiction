import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";
import {
  WorkoutRepositoryError,
  type WorkoutRepository,
  type WorkoutRepositoryErrorCode,
} from "@/features/active-workout/application/workout-repository";
import type {
  CurrentWorkout,
  StartWorkoutDefinition,
  TodayView,
} from "@/features/active-workout/domain/workout";
import type { ServerDatabaseClient } from "@/server/database/client";

export class SupabaseWorkoutRepository implements WorkoutRepository {
  constructor(private readonly client: ServerDatabaseClient) {}

  async getToday(): Promise<TodayView> {
    try {
      const { data, error } = await this.client.rpc("get_today_view");
      if (error) throw mapPostgrestError(error);
      return data as unknown as TodayView;
    } catch (error) {
      throw normalize(error);
    }
  }

  async getCurrent(): Promise<CurrentWorkout | null> {
    try {
      const { data, error } = await this.client.rpc("get_current_workout");
      if (error) throw mapPostgrestError(error);
      return data as unknown as CurrentWorkout | null;
    } catch (error) {
      throw normalize(error);
    }
  }

  async start(definition: StartWorkoutDefinition): Promise<CurrentWorkout> {
    try {
      const { error } = await this.client.rpc(
        "start_workout",
        definition.sourceKind === "one_time"
          ? {
              p_source_kind: definition.sourceKind,
              p_split_id: "00000000-0000-0000-0000-000000000000",
              p_one_time_name: definition.name,
              p_exercise_ids: [...definition.exerciseIds],
              p_started_at: definition.startedAt,
            }
          : {
              p_source_kind: definition.sourceKind,
              p_split_id: definition.splitId,
              p_one_time_name: "",
              p_exercise_ids: [],
              p_started_at: definition.startedAt,
            },
      );
      if (error) throw mapPostgrestError(error);
      const current = await this.getCurrent();
      if (current === null) throw new WorkoutRepositoryError("unexpected");
      return current;
    } catch (error) {
      throw normalize(error);
    }
  }
}

function mapPostgrestError(error: PostgrestError): WorkoutRepositoryError {
  const mapping: Readonly<Record<string, WorkoutRepositoryErrorCode>> = {
    PF201: "not_found",
    PF202: "conflict",
    PF203: "inactive_exercise",
    PF204: "constraint",
    PF205: "constraint",
    PF206: "constraint",
    "23505": "conflict",
  };
  return new WorkoutRepositoryError(
    mapping[error.code] ??
      (error.code.startsWith("22") || error.code.startsWith("23")
        ? "constraint"
        : "unexpected"),
    { cause: error },
  );
}
function normalize(error: unknown): WorkoutRepositoryError {
  return error instanceof WorkoutRepositoryError
    ? error
    : new WorkoutRepositoryError("unavailable", { cause: error });
}
