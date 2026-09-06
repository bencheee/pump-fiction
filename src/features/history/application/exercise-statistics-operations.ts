import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "@/shared/application/operation-result";
import type { ChartMetric, ChartRange, ChartSeries } from "../domain/chart";
import {
  availableMetrics,
  chartSeries,
  latestEligiblePerformance,
  personalRecords,
  type CategoryRecords,
  type ExerciseHistoryEntry,
  type ExercisePerformance,
} from "../domain/exercise-statistics";
import type { ExerciseStatisticsRepository } from "./exercise-statistics-repository";

/** Everything `S16` renders for one exercise identity. */
export type ExerciseStatistics = Readonly<{
  exerciseIdentityId: string;
  exerciseName: string;
  exerciseBaseType: string;
  stillInLibrary: boolean;
  latestPerformance: ExercisePerformance | null;
  categories: readonly CategoryRecords[];
  metrics: readonly ChartMetric[];
  performances: readonly ExercisePerformance[];
  series: ChartSeries;
}>;

export async function listExerciseHistory(
  repository: ExerciseStatisticsRepository,
): Promise<OperationResult<readonly ExerciseHistoryEntry[]>> {
  try {
    return operationSuccess(await repository.list());
  } catch {
    return persistence("We couldn't load your exercise history. Try again.");
  }
}

/**
 * Reduces the stored performances to the view. Every product rule is applied
 * here rather than in the database or the screen.
 */
export async function getExerciseStatistics(
  repository: ExerciseStatisticsRepository,
  exerciseIdentityId: string,
  options: Readonly<{
    metric?: ChartMetric;
    range?: ChartRange;
    localDate: string;
  }>,
): Promise<OperationResult<ExerciseStatistics>> {
  let loaded;
  try {
    loaded = await repository.getPerformances(exerciseIdentityId);
  } catch {
    return persistence("We couldn't load that exercise. Try again.");
  }
  if (loaded === null)
    return operationFailure({
      code: "not_found",
      message: "That exercise has no history yet.",
      retryable: false,
    });

  const metrics = availableMetrics(loaded.performances);
  const metric =
    options.metric !== undefined && metrics.includes(options.metric)
      ? options.metric
      : (metrics[0] ?? "top_reps");
  const range = options.range ?? "all";

  return operationSuccess({
    exerciseIdentityId: loaded.exerciseIdentityId,
    exerciseName: loaded.exerciseName,
    exerciseBaseType: loaded.exerciseBaseType,
    stillInLibrary: loaded.stillInLibrary,
    latestPerformance: latestEligiblePerformance(loaded.performances),
    categories: personalRecords(loaded.performances),
    metrics,
    performances: loaded.performances,
    series: chartSeries(loaded.performances, metric, range, options.localDate),
  });
}

function persistence<T>(message: string): OperationResult<T> {
  return operationFailure({ code: "persistence", message, retryable: true });
}
