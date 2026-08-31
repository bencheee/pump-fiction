import "server-only";

import { applyActiveWorkoutCommand as runApplyActiveWorkoutCommand } from "@/features/active-workout/application/apply-active-workout-command";
import type { ActiveWorkoutCommandResult } from "@/features/active-workout/application/active-workout-command-result";

import { createServerDatabaseClient } from "../database/client";
import { SupabaseActiveWorkoutCommandRepository } from "../repositories/supabase-active-workout-command-repository";

export async function applyActiveWorkoutCommand(
  input: unknown,
): Promise<ActiveWorkoutCommandResult> {
  const repository = new SupabaseActiveWorkoutCommandRepository(
    createServerDatabaseClient(),
  );

  return runApplyActiveWorkoutCommand(repository, input);
}
