import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import {
  ActiveWorkoutCommandRepositoryError,
  type ActiveWorkoutCommandRepository,
  type CommandApplicationRecord,
} from "@/features/active-workout/application/active-workout-command-repository";
import type { ActiveWorkoutCommand } from "@/features/active-workout/domain/active-workout-command";
import type { ServerDatabaseClient } from "@/server/database/client";
import type { Json } from "@/server/database/database.types";

export class SupabaseActiveWorkoutCommandRepository implements ActiveWorkoutCommandRepository {
  constructor(private readonly client: ServerDatabaseClient) {}

  async apply(
    command: ActiveWorkoutCommand,
  ): Promise<CommandApplicationRecord> {
    try {
      const { data, error } = await this.client.rpc(
        "apply_active_workout_command",
        {
          p_command_id: command.commandId,
          p_workout_id: command.workoutId,
          p_expected_revision: command.expectedRevision,
          p_operation: command.operation,
          p_payload: command.payload as Json,
          p_client_created_at: command.clientCreatedAt,
        },
      );

      if (error) {
        throw mapPostgrestError(error);
      }

      const row = data[0];
      if (data.length !== 1 || row === undefined) {
        throw new ActiveWorkoutCommandRepositoryError("unexpected");
      }

      if (row.kind === "not_found") {
        return { kind: "not_found" };
      }

      if (row.kind === "conflict") {
        return {
          kind: "conflict",
          commandId: row.acknowledged_command_id,
          workoutId: row.acknowledged_workout_id,
          expectedRevision: row.expected_revision,
          actualRevision: row.resulting_revision,
        };
      }

      if (row.kind === "applied" || row.kind === "duplicate") {
        return {
          kind: row.kind,
          commandId: row.acknowledged_command_id,
          workoutId: row.acknowledged_workout_id,
          expectedRevision: row.expected_revision,
          resultingRevision: row.resulting_revision,
        };
      }

      throw new ActiveWorkoutCommandRepositoryError("unexpected");
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }
}

function mapPostgrestError(
  error: PostgrestError,
): ActiveWorkoutCommandRepositoryError {
  if (
    error.code === "PF001" ||
    error.code === "PF002" ||
    error.code === "PF203" ||
    error.code === "PF204" ||
    error.code === "PF205" ||
    error.code === "PF206" ||
    error.code.startsWith("22") ||
    error.code.startsWith("23")
  ) {
    return new ActiveWorkoutCommandRepositoryError("constraint", {
      cause: error,
    });
  }

  return new ActiveWorkoutCommandRepositoryError("unexpected", {
    cause: error,
  });
}

function normalizeRepositoryError(
  error: unknown,
): ActiveWorkoutCommandRepositoryError {
  if (error instanceof ActiveWorkoutCommandRepositoryError) {
    return error;
  }

  return new ActiveWorkoutCommandRepositoryError("unavailable", {
    cause: error,
  });
}
