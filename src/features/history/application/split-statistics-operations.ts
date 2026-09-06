import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "@/shared/application/operation-result";
import type { ChartRange, ChartSeries } from "../domain/chart";
import {
  durationSeries,
  programOptions,
  splitSummaries,
  splitWorkouts,
  type ProgramOption,
  type SplitSummary,
  type SplitWorkoutEntry,
} from "../domain/split-statistics";
import type { SplitStatisticsRepository } from "./split-statistics-repository";

export type SplitHistory = Readonly<{
  splits: readonly SplitSummary[];
  programs: readonly ProgramOption[];
}>;

export type SplitStatistics = Readonly<{
  summary: SplitSummary;
  workouts: readonly SplitWorkoutEntry[];
  series: ChartSeries;
}>;

export async function listSplitHistory(
  repository: SplitStatisticsRepository,
): Promise<OperationResult<SplitHistory>> {
  try {
    const summaries = splitSummaries(await repository.listSplitWorkouts());
    return operationSuccess({
      splits: summaries,
      programs: programOptions(summaries),
    });
  } catch {
    return persistence("We couldn't load your split history. Try again.");
  }
}

export async function getSplitStatistics(
  repository: SplitStatisticsRepository,
  splitIdentityId: string,
  options: Readonly<{ range?: ChartRange; localDate: string }>,
): Promise<OperationResult<SplitStatistics>> {
  let workouts;
  try {
    workouts = await repository.listSplitWorkouts();
  } catch {
    return persistence("We couldn't load that split. Try again.");
  }
  const summary = splitSummaries(workouts).find(
    (entry) => entry.splitIdentityId === splitIdentityId,
  );
  if (!summary)
    return operationFailure({
      code: "not_found",
      message: "That split has no completed workout yet.",
      retryable: false,
    });
  return operationSuccess({
    summary,
    workouts: splitWorkouts(workouts, splitIdentityId),
    series: durationSeries(
      workouts,
      splitIdentityId,
      options.range ?? "all",
      options.localDate,
    ),
  });
}

function persistence<T>(message: string): OperationResult<T> {
  return operationFailure({ code: "persistence", message, retryable: true });
}
