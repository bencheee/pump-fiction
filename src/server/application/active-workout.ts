import "server-only";

import { applyActiveWorkoutCommand as runApplyActiveWorkoutCommand } from "@/features/active-workout/application/apply-active-workout-command";
import type { ActiveWorkoutCommandResult } from "@/features/active-workout/application/active-workout-command-result";
import {
  getCurrentWorkout as runGetCurrentWorkout,
  getToday as runGetToday,
  startWorkout as runStartWorkout,
} from "@/features/active-workout/application/workout-operations";
import type {
  CurrentWorkout,
  StartWorkoutInput,
  TodayView,
} from "@/features/active-workout/domain/workout";
import type { OperationResult } from "@/shared/application/operation-result";

import { createServerDatabaseClient } from "../database/client";
import { SupabaseActiveWorkoutCommandRepository } from "../repositories/supabase-active-workout-command-repository";
import { SupabaseWorkoutRepository } from "../repositories/supabase-workout-repository";

export async function applyActiveWorkoutCommand(
  input: unknown,
): Promise<ActiveWorkoutCommandResult> {
  const repository = new SupabaseActiveWorkoutCommandRepository(
    createServerDatabaseClient(),
  );

  return runApplyActiveWorkoutCommand(repository, input);
}

function workoutRepository(): SupabaseWorkoutRepository {
  return new SupabaseWorkoutRepository(createServerDatabaseClient());
}
export async function getToday(): Promise<OperationResult<TodayView>> {
  return runGetToday(workoutRepository());
}
export async function getCurrentWorkout(): Promise<
  OperationResult<CurrentWorkout | null>
> {
  return runGetCurrentWorkout(workoutRepository());
}
export async function startWorkout(
  input: StartWorkoutInput,
): Promise<OperationResult<CurrentWorkout>> {
  return runStartWorkout(workoutRepository(), input);
}
