import type { WorkoutSourceKind } from "@/features/active-workout/domain/workout";
import {
  metricLabels,
  metricUnits,
  rangeStart,
  type ChartPoint,
  type ChartRange,
  type ChartSeries,
} from "./chart";
import type { HistoryWorkoutStatus } from "./workout-history";

/**
 * One saved split-sourced workout as the database returns it. Names come in two
 * forms: the live template name when the split or program still exists, and
 * the snapshot the workout carries regardless. Grouping never uses either; it
 * uses the identity snapshots, which survive deletion under ADR-0024.
 */
export type SplitWorkout = Readonly<{
  workoutId: string;
  workoutDate: string;
  status: HistoryWorkoutStatus;
  sourceKind: WorkoutSourceKind;
  activeDurationSeconds: number;
  splitIdentityId: string;
  programIdentityId: string;
  splitName: string | null;
  splitNameSnapshot: string;
  programName: string | null;
  programNameSnapshot: string;
}>;

export type SplitSummary = Readonly<{
  splitIdentityId: string;
  programIdentityId: string;
  splitName: string;
  programName: string;
  /** False once the split template was deleted; the snapshot names it then. */
  stillExists: boolean;
  completedWorkoutCount: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  shortestDurationSeconds: number;
  longestDurationSeconds: number;
  latestDurationSeconds: number;
  latestWorkoutDate: string;
}>;

export type SplitWorkoutEntry = Readonly<{
  workoutId: string;
  workoutDate: string;
  activeDurationSeconds: number;
}>;

export type ProgramOption = Readonly<{
  programIdentityId: string;
  programName: string;
}>;

/**
 * Only a completed split-sourced workout feeds its split. A one-time workout
 * has no split; an incomplete one is excluded; a today-only alternate counts
 * for the split it ran. `MVP-HIS-006`, `MVP-HIS-011`.
 */
export function isEligibleSplitWorkout(workout: SplitWorkout): boolean {
  return workout.status === "completed" && workout.sourceKind !== "one_time";
}

function newestFirst(left: SplitWorkout, right: SplitWorkout): number {
  return right.workoutDate.localeCompare(left.workoutDate);
}

/** One summary per persistent split identity, latest performance first. */
export function splitSummaries(
  workouts: readonly SplitWorkout[],
): readonly SplitSummary[] {
  const grouped = new Map<string, SplitWorkout[]>();
  for (const workout of workouts) {
    if (!isEligibleSplitWorkout(workout)) continue;
    const bucket = grouped.get(workout.splitIdentityId) ?? [];
    bucket.push(workout);
    grouped.set(workout.splitIdentityId, bucket);
  }

  const summaries: SplitSummary[] = [];
  for (const bucket of grouped.values()) {
    const ordered = [...bucket].sort(newestFirst);
    const latest = ordered[0];
    if (!latest) continue;
    const durations = ordered.map((workout) => workout.activeDurationSeconds);
    const total = durations.reduce((sum, value) => sum + value, 0);
    summaries.push({
      splitIdentityId: latest.splitIdentityId,
      programIdentityId: latest.programIdentityId,
      // The live name follows a rename; the snapshot outlives a deletion.
      splitName: latest.splitName ?? latest.splitNameSnapshot,
      programName: latest.programName ?? latest.programNameSnapshot,
      stillExists: latest.splitName !== null,
      completedWorkoutCount: ordered.length,
      totalDurationSeconds: total,
      averageDurationSeconds: Math.round(total / ordered.length),
      shortestDurationSeconds: Math.min(...durations),
      longestDurationSeconds: Math.max(...durations),
      latestDurationSeconds: latest.activeDurationSeconds,
      latestWorkoutDate: latest.workoutDate,
    });
  }

  return summaries.sort((left, right) =>
    right.latestWorkoutDate.localeCompare(left.latestWorkoutDate),
  );
}

/** The programs present in the summaries, for the `S17` filter. */
export function programOptions(
  summaries: readonly SplitSummary[],
): readonly ProgramOption[] {
  const seen = new Map<string, ProgramOption>();
  for (const summary of summaries) {
    if (!seen.has(summary.programIdentityId))
      seen.set(summary.programIdentityId, {
        programIdentityId: summary.programIdentityId,
        programName: summary.programName,
      });
  }
  return [...seen.values()].sort((left, right) =>
    left.programName.localeCompare(right.programName),
  );
}

/** The eligible workouts of one split identity, newest first. */
export function splitWorkouts(
  workouts: readonly SplitWorkout[],
  splitIdentityId: string,
): readonly SplitWorkoutEntry[] {
  return workouts
    .filter(
      (workout) =>
        workout.splitIdentityId === splitIdentityId &&
        isEligibleSplitWorkout(workout),
    )
    .sort(newestFirst)
    .map((workout) => ({
      workoutId: workout.workoutId,
      workoutDate: workout.workoutDate,
      activeDurationSeconds: workout.activeDurationSeconds,
    }));
}

/**
 * Active duration per eligible workout of one split, inside a trailing window
 * that ends on the configured local date. `all` is unbounded.
 */
export function durationSeries(
  workouts: readonly SplitWorkout[],
  splitIdentityId: string,
  range: ChartRange,
  localDate: string,
): ChartSeries {
  const from = rangeStart(range, localDate);
  const points: ChartPoint[] = splitWorkouts(workouts, splitIdentityId)
    .filter((entry) => from === null || entry.workoutDate >= from)
    .map((entry) => ({
      workoutId: entry.workoutId,
      date: entry.workoutDate,
      value: entry.activeDurationSeconds,
    }))
    .sort((left, right) => left.date.localeCompare(right.date));

  return {
    metric: "duration",
    label: metricLabels.duration,
    unit: metricUnits.duration,
    lowerIsBetter: false,
    points,
  };
}
