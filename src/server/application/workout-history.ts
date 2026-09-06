import "server-only";

import {
  getExerciseStatistics as runGetExerciseStatistics,
  listExerciseHistory as runListExerciseHistory,
  type ExerciseStatistics,
} from "@/features/history/application/exercise-statistics-operations";
import {
  getSplitStatistics as runGetSplitStatistics,
  listSplitHistory as runListSplitHistory,
  type SplitHistory,
  type SplitStatistics,
} from "@/features/history/application/split-statistics-operations";
import {
  correctHistoryWorkout as runCorrectHistoryWorkout,
  getHistoryWorkout as runGetHistoryWorkout,
  listWorkoutHistory as runListWorkoutHistory,
} from "@/features/history/application/workout-history-operations";
import type {
  ChartMetric,
  ChartRange,
  ExerciseHistoryEntry,
} from "@/features/history/domain/exercise-statistics";
import type {
  HistoryMonthGroup,
  HistoryWorkout,
} from "@/features/history/domain/workout-history";
import type { OperationResult } from "@/shared/application/operation-result";

import { createServerDatabaseClient } from "../database/client";
import { SupabaseExerciseStatisticsRepository } from "../repositories/supabase-exercise-statistics-repository";
import { SupabaseSplitStatisticsRepository } from "../repositories/supabase-split-statistics-repository";
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

function statisticsRepository(): SupabaseExerciseStatisticsRepository {
  return new SupabaseExerciseStatisticsRepository(createServerDatabaseClient());
}

export async function listExerciseHistory(): Promise<
  OperationResult<readonly ExerciseHistoryEntry[]>
> {
  return runListExerciseHistory(statisticsRepository());
}

export async function getExerciseStatistics(
  exerciseIdentityId: string,
  options: Readonly<{
    metric?: ChartMetric;
    range?: ChartRange;
    localDate: string;
  }>,
): Promise<OperationResult<ExerciseStatistics>> {
  return runGetExerciseStatistics(
    statisticsRepository(),
    exerciseIdentityId,
    options,
  );
}

function splitRepository(): SupabaseSplitStatisticsRepository {
  return new SupabaseSplitStatisticsRepository(createServerDatabaseClient());
}

export async function listSplitHistory(): Promise<
  OperationResult<SplitHistory>
> {
  return runListSplitHistory(splitRepository());
}

export async function getSplitStatistics(
  splitIdentityId: string,
  options: Readonly<{ range?: ChartRange; localDate: string }>,
): Promise<OperationResult<SplitStatistics>> {
  return runGetSplitStatistics(splitRepository(), splitIdentityId, options);
}
