"use server";

import type {
  ChartMetric,
  ChartRange,
} from "@/features/history/domain/exercise-statistics";
import {
  correctHistoryWorkout,
  getExerciseStatistics,
  getHistoryWorkout,
  getSplitStatistics,
  listExerciseHistory,
  listSplitHistory,
  listWorkoutHistory,
} from "@/server/application/workout-history";

export async function listWorkoutHistoryAction() {
  return listWorkoutHistory();
}

export async function getHistoryWorkoutAction(workoutId: string) {
  return getHistoryWorkout(workoutId);
}

export async function correctHistoryWorkoutAction(input: unknown) {
  return correctHistoryWorkout(input);
}

export async function listExerciseHistoryAction() {
  return listExerciseHistory();
}

export async function getExerciseStatisticsAction(
  exerciseIdentityId: string,
  options: Readonly<{
    metric?: ChartMetric;
    range?: ChartRange;
    localDate: string;
  }>,
) {
  return getExerciseStatistics(exerciseIdentityId, options);
}

export async function listSplitHistoryAction() {
  return listSplitHistory();
}

export async function getSplitStatisticsAction(
  splitIdentityId: string,
  options: Readonly<{ range?: ChartRange; localDate: string }>,
) {
  return getSplitStatistics(splitIdentityId, options);
}
