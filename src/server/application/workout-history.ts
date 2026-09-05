import "server-only";

import {
  correctHistoryWorkout as runCorrectHistoryWorkout,
  getHistoryWorkout as runGetHistoryWorkout,
  listWorkoutHistory as runListWorkoutHistory,
} from "@/features/history/application/workout-history-operations";
import type {
  HistoryMonthGroup,
  HistoryWorkout,
} from "@/features/history/domain/workout-history";
import type { OperationResult } from "@/shared/application/operation-result";

import { createServerDatabaseClient } from "../database/client";
import { SupabaseWorkoutHistoryRepository } from "../repositories/supabase-workout-history-repository";

function repository(): SupabaseWorkoutHistoryRepository {
  return new SupabaseWorkoutHistoryRepository(createServerDatabaseClient());
}

export async function listWorkoutHistory(): Promise<
  OperationResult<readonly HistoryMonthGroup[]>
> {
  return runListWorkoutHistory(repository());
}

export async function getHistoryWorkout(
  workoutId: string,
): Promise<OperationResult<HistoryWorkout>> {
  return runGetHistoryWorkout(repository(), workoutId);
}

export async function correctHistoryWorkout(
  input: unknown,
): Promise<OperationResult<HistoryWorkout | null>> {
  return runCorrectHistoryWorkout(repository(), input);
}
