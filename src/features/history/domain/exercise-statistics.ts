import type {
  BandDirection,
  BandStrength,
} from "@/features/active-workout/domain/active-workout-command";
import { setModeFields } from "@/features/active-workout/domain/set-entry";
import type {
  WorkoutSet,
  WorkoutSourceKind,
} from "@/features/active-workout/domain/workout";
import type {
  ExerciseBaseType,
  ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";
import type { HistoryWorkoutStatus } from "./workout-history";

/** One occurrence of an exercise in a saved workout. */
export type ExercisePerformance = Readonly<{
  workoutId: string;
  workoutExerciseId: string;
  workoutDate: string;
  workoutName: string;
  status: HistoryWorkoutStatus;
  sourceKind: WorkoutSourceKind;
  workoutNote: string;
  sets: readonly WorkoutSet[];
}>;

export type ExerciseHistoryEntry = Readonly<{
  exerciseIdentityId: string;
  exerciseName: string;
  exerciseBaseType: ExerciseBaseType;
  stillInLibrary: boolean;
  latestPerformance: ExercisePerformance | null;
}>;

export type ExercisePerformances = Readonly<{
  exerciseIdentityId: string;
  exerciseName: string;
  exerciseBaseType: ExerciseBaseType;
  stillInLibrary: boolean;
  performances: readonly ExercisePerformance[];
}>;

/**
 * A set is recorded once it holds everything its mode requires. This mirrors
 * `workout_set_is_recorded` in the database and `isSetRecorded` in the
 * active-workout domain, applied to a stored set.
 */
export function isRecordedSet(set: WorkoutSet): boolean {
  if (set.loadMode === null || set.reps === null) return false;
  const fields = setModeFields[set.loadMode];
  if (fields.load !== null && set.loadKg === null) return false;
  if (fields.band !== null && set.bandStrength === null) return false;
  return true;
}

/**
 * Only recorded sets of completed workouts feed personal records and charts.
 * One-time workouts count; incomplete workouts do not. `MVP-HIS-006`.
 */
export function isEligiblePerformance(
  performance: ExercisePerformance,
): boolean {
  return (
    performance.status === "completed" && performance.sets.some(isRecordedSet)
  );
}

/**
 * The comparison category of a set. Band direction and strength never merge
 * with each other or with a no-band result, and a band is never a kilogram
 * value. `MVP-HIS-009`.
 */
export type ComparisonCategory = Readonly<{
  key: string;
  label: string;
  loadMode: ExerciseLoadMode;
  bandDirection: BandDirection | null;
  bandStrength: BandStrength | null;
}>;

const modeLabels: Readonly<Record<ExerciseLoadMode, string>> = {
  weight: "Weight",
  weight_resistance_band: "Weight with resistance band",
  bodyweight: "Bodyweight",
  bodyweight_added_weight: "Added weight",
  bodyweight_resistance_band: "Resistance band",
  assistance_weight: "Assistance",
  assistance_band: "Assistance band",
};

const strengthLabels: Readonly<Record<BandStrength, string>> = {
  light: "light",
  medium: "medium",
  strong: "strong",
};

export function categoryOf(set: WorkoutSet): ComparisonCategory | null {
  if (set.loadMode === null) return null;
  const fields = setModeFields[set.loadMode];
  const strength = fields.band === null ? null : set.bandStrength;
  if (fields.band !== null && strength === null) return null;
  return {
    key: strength === null ? set.loadMode : `${set.loadMode}:${strength}`,
    label:
      strength === null
        ? modeLabels[set.loadMode]
        : `${modeLabels[set.loadMode]}, ${strengthLabels[strength]}`,
    loadMode: set.loadMode,
    bandDirection: fields.band,
    bandStrength: strength,
  };
}

export type RecordUnit = "kg" | "reps" | "volume" | "seconds";

export type PersonalRecord = Readonly<{
  key: string;
  label: string;
  value: number;
  unit: RecordUnit;
  /** Reps behind a load-based record, where the definition names them. */
  reps: number | null;
  /** Lower is better for assistance, and the presentation must say so. */
  lowerIsBetter: boolean;
  workoutId: string;
  workoutDate: string;
}>;

export type LoadRepsRecord = Readonly<{
  load: number;
  reps: number;
  workoutId: string;
  workoutDate: string;
}>;

export type CategoryRecords = Readonly<{
  category: ComparisonCategory;
  records: readonly PersonalRecord[];
  /** Highest reps at each distinct load, heaviest first. */
  repsByLoad: readonly LoadRepsRecord[];
}>;

type CategorySet = Readonly<{
  set: WorkoutSet;
  workoutId: string;
  workoutDate: string;
}>;

function eligibleSetsByCategory(
  performances: readonly ExercisePerformance[],
): Map<string, { category: ComparisonCategory; sets: CategorySet[] }> {
  const grouped = new Map<
    string,
    { category: ComparisonCategory; sets: CategorySet[] }
  >();
  for (const performance of performances) {
    if (performance.status !== "completed") continue;
    for (const set of performance.sets) {
      if (!isRecordedSet(set)) continue;
      const category = categoryOf(set);
      if (category === null) continue;
      const bucket = grouped.get(category.key) ?? { category, sets: [] };
      bucket.sets.push({
        set,
        workoutId: performance.workoutId,
        workoutDate: performance.workoutDate,
      });
      grouped.set(category.key, bucket);
    }
  }
  return grouped;
}

/** Personal records per comparison category, as `history-and-statistics.md` defines them. */
export function personalRecords(
  performances: readonly ExercisePerformance[],
): readonly CategoryRecords[] {
  const grouped = eligibleSetsByCategory(performances);
  const result: CategoryRecords[] = [];

  for (const { category, sets } of grouped.values()) {
    const fields = setModeFields[category.loadMode];
    const records: PersonalRecord[] = [];
    const assistance = fields.load === "assistance_kg";

    if (fields.load !== null) {
      const best = sets.reduce((leader, candidate) =>
        pickLoad(assistance, leader, candidate),
      );
      records.push({
        key: assistance ? "least_load" : "highest_load",
        label: assistance ? "Least assistance" : "Highest load",
        value: best.set.loadKg ?? 0,
        unit: "kg",
        reps: best.set.reps,
        lowerIsBetter: assistance,
        workoutId: best.workoutId,
        workoutDate: best.workoutDate,
      });
    }

    const bestReps = sets.reduce((leader, candidate) =>
      (candidate.set.reps ?? 0) > (leader.set.reps ?? 0) ? candidate : leader,
    );
    records.push({
      key: "highest_reps",
      label: "Highest reps in a set",
      value: bestReps.set.reps ?? 0,
      unit: "reps",
      reps: null,
      lowerIsBetter: false,
      workoutId: bestReps.workoutId,
      workoutDate: bestReps.workoutDate,
    });

    // Volume needs a load to multiply; assistance is not a lifted load.
    if (fields.load === "kg" || fields.load === "added_kg") {
      const bestVolume = sets.reduce((leader, candidate) =>
        setVolume(candidate) > setVolume(leader) ? candidate : leader,
      );
      records.push({
        key: "highest_set_volume",
        label: "Highest set volume",
        value: setVolume(bestVolume),
        unit: "volume",
        reps: bestVolume.set.reps,
        lowerIsBetter: false,
        workoutId: bestVolume.workoutId,
        workoutDate: bestVolume.workoutDate,
      });
      const perWorkout = sumByWorkout(sets, setVolume);
      const bestWorkout = leaderOf(perWorkout);
      if (bestWorkout)
        records.push({
          key: "highest_workout_volume",
          label: "Highest workout volume",
          value: bestWorkout.value,
          unit: "volume",
          reps: null,
          lowerIsBetter: false,
          workoutId: bestWorkout.workoutId,
          workoutDate: bestWorkout.workoutDate,
        });
    } else {
      const perWorkout = sumByWorkout(sets, (entry) => entry.set.reps ?? 0);
      const bestWorkout = leaderOf(perWorkout);
      if (bestWorkout)
        records.push({
          key: "highest_workout_reps",
          label: "Highest workout reps",
          value: bestWorkout.value,
          unit: "reps",
          reps: null,
          lowerIsBetter: false,
          workoutId: bestWorkout.workoutId,
          workoutDate: bestWorkout.workoutDate,
        });
    }

    result.push({
      category,
      records,
      repsByLoad: fields.load === null ? [] : repsByLoad(sets),
    });
  }

  return result.sort((left, right) =>
    left.category.key.localeCompare(right.category.key),
  );
}

function pickLoad(
  assistance: boolean,
  leader: CategorySet,
  candidate: CategorySet,
): CategorySet {
  const leaderLoad = leader.set.loadKg ?? 0;
  const candidateLoad = candidate.set.loadKg ?? 0;
  if (assistance) return candidateLoad < leaderLoad ? candidate : leader;
  return candidateLoad > leaderLoad ? candidate : leader;
}

function setVolume(entry: CategorySet): number {
  return (entry.set.loadKg ?? 0) * (entry.set.reps ?? 0);
}

function sumByWorkout(
  sets: readonly CategorySet[],
  value: (entry: CategorySet) => number,
): Map<string, { value: number; workoutDate: string }> {
  const totals = new Map<string, { value: number; workoutDate: string }>();
  for (const entry of sets) {
    const current = totals.get(entry.workoutId);
    totals.set(entry.workoutId, {
      value: (current?.value ?? 0) + value(entry),
      workoutDate: entry.workoutDate,
    });
  }
  return totals;
}

function leaderOf(
  totals: Map<string, { value: number; workoutDate: string }>,
): { workoutId: string; workoutDate: string; value: number } | null {
  let leader: { workoutId: string; workoutDate: string; value: number } | null =
    null;
  for (const [workoutId, total] of totals) {
    if (leader === null || total.value > leader.value)
      leader = {
        workoutId,
        workoutDate: total.workoutDate,
        value: total.value,
      };
  }
  return leader;
}

function repsByLoad(sets: readonly CategorySet[]): readonly LoadRepsRecord[] {
  const best = new Map<number, LoadRepsRecord>();
  for (const entry of sets) {
    const load = entry.set.loadKg ?? 0;
    const reps = entry.set.reps ?? 0;
    const current = best.get(load);
    if (current === undefined || reps > current.reps)
      best.set(load, {
        load,
        reps,
        workoutId: entry.workoutId,
        workoutDate: entry.workoutDate,
      });
  }
  return [...best.values()].sort((left, right) => right.load - left.load);
}

/** The latest eligible performance, or null when nothing counts yet. */
export function latestEligiblePerformance(
  performances: readonly ExercisePerformance[],
): ExercisePerformance | null {
  return (
    [...performances]
      .filter(isEligiblePerformance)
      .sort((left, right) => right.workoutDate.localeCompare(left.workoutDate))
      .at(0) ?? null
  );
}

export type ChartMetric =
  | "top_load"
  | "least_load"
  | "top_reps"
  | "total_volume"
  | "total_reps"
  /** Split History only: active duration per completed workout. */
  | "duration";

export type ChartRange = "week" | "month" | "quarter" | "year" | "all";

export const chartRanges: readonly ChartRange[] = [
  "week",
  "month",
  "quarter",
  "year",
  "all",
];

export type ChartPoint = Readonly<{
  workoutId: string;
  date: string;
  value: number;
}>;

export type ChartSeries = Readonly<{
  metric: ChartMetric;
  label: string;
  unit: RecordUnit;
  lowerIsBetter: boolean;
  points: readonly ChartPoint[];
}>;

const metricLabels: Readonly<Record<ChartMetric, string>> = {
  top_load: "Highest load",
  least_load: "Least assistance",
  top_reps: "Highest reps",
  total_volume: "Workout volume",
  total_reps: "Workout reps",
  duration: "Active duration",
};

const metricUnits: Readonly<Record<ChartMetric, RecordUnit>> = {
  top_load: "kg",
  least_load: "kg",
  top_reps: "reps",
  total_volume: "volume",
  total_reps: "reps",
  duration: "seconds",
};

/**
 * The order the metric selector offers, most telling first. An exercise that
 * moves a load opens on that load, because it is what the lifter compares;
 * one that only moves the body opens on reps.
 */
const metricOrder: readonly ChartMetric[] = [
  "top_load",
  "least_load",
  "top_reps",
  "total_volume",
  "total_reps",
];

/** The metrics that mean something for the categories this exercise actually has. */
export function availableMetrics(
  performances: readonly ExercisePerformance[],
): readonly ChartMetric[] {
  const metrics = new Set<ChartMetric>(["top_reps"]);
  for (const { category } of eligibleSetsByCategory(performances).values()) {
    const fields = setModeFields[category.loadMode];
    if (fields.load === "assistance_kg") metrics.add("least_load");
    else if (fields.load !== null) {
      metrics.add("top_load");
      metrics.add("total_volume");
    } else metrics.add("total_reps");
  }
  return metricOrder.filter((metric) => metrics.has(metric));
}

/**
 * One point per eligible workout, inside a trailing window that ends on the
 * configured local date. `all` is unbounded.
 */
export function chartSeries(
  performances: readonly ExercisePerformance[],
  metric: ChartMetric,
  range: ChartRange,
  localDate: string,
  categoryKey?: string,
): ChartSeries {
  const from = rangeStart(range, localDate);
  const points = new Map<string, ChartPoint>();

  for (const performance of performances) {
    if (performance.status !== "completed") continue;
    if (from !== null && performance.workoutDate < from) continue;
    let total = 0;
    let top = metric === "least_load" ? Number.POSITIVE_INFINITY : 0;
    let seen = false;

    for (const set of performance.sets) {
      if (!isRecordedSet(set)) continue;
      const category = categoryOf(set);
      if (category === null) continue;
      if (categoryKey !== undefined && category.key !== categoryKey) continue;
      const fields = setModeFields[category.loadMode];
      seen = true;
      if (
        metric === "top_load" &&
        fields.load !== null &&
        fields.load !== "assistance_kg"
      )
        top = Math.max(top, set.loadKg ?? 0);
      if (metric === "least_load" && fields.load === "assistance_kg")
        top = Math.min(top, set.loadKg ?? 0);
      if (metric === "top_reps") top = Math.max(top, set.reps ?? 0);
      if (metric === "total_volume")
        total += (set.loadKg ?? 0) * (set.reps ?? 0);
      if (metric === "total_reps") total += set.reps ?? 0;
    }

    if (!seen) continue;
    const value =
      metric === "total_volume" || metric === "total_reps" ? total : top;
    if (!Number.isFinite(value) || value === 0) continue;
    points.set(performance.workoutId, {
      workoutId: performance.workoutId,
      date: performance.workoutDate,
      value,
    });
  }

  return {
    metric,
    label: metricLabels[metric],
    unit: metricUnits[metric],
    lowerIsBetter: metric === "least_load",
    points: [...points.values()].sort((left, right) =>
      left.date.localeCompare(right.date),
    ),
  };
}

/** The first local date inside a trailing range, or null for `all`. */
export function rangeStart(
  range: ChartRange,
  localDate: string,
): string | null {
  if (range === "all") return null;
  const end = new Date(`${localDate}T00:00:00Z`);
  if (!Number.isFinite(end.getTime())) return null;
  const start = new Date(end);
  if (range === "week") start.setUTCDate(start.getUTCDate() - 6);
  if (range === "month") start.setUTCMonth(start.getUTCMonth() - 1);
  if (range === "quarter") start.setUTCMonth(start.getUTCMonth() - 3);
  if (range === "year") start.setUTCFullYear(start.getUTCFullYear() - 1);
  return start.toISOString().slice(0, 10);
}
