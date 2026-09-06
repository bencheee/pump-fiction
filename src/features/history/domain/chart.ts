/**
 * The chart contract every History subsection shares.
 *
 * `T-033` introduced it for exercise progress, `T-035` reused it for split
 * durations, and `T-038` generalized it for weight: a point needs no workout,
 * and a series may carry a companion series drawn beside it.
 *
 * Series are neutral and serializable. Every product rule that produces one
 * lives in this domain; the chart component draws what it is given and computes
 * nothing, as [ADR-0020](../../../../docs/decisions/0020-mobile-ui-charting-and-quality-tooling.md)
 * requires.
 */

export type MeasureUnit = "kg" | "reps" | "volume" | "seconds" | "cm";

export type ChartMetric =
  | "top_load"
  | "least_load"
  | "top_reps"
  | "total_volume"
  | "total_reps"
  /** Split History only: active duration per completed workout. */
  | "duration"
  /** Weight only: one weigh-in, and the Monday–Sunday average beside it. */
  | "weight"
  | "weekly_average"
  /** Body only: one measurement of one user-defined type. */
  | "measurement";

export type ChartRange = "week" | "month" | "quarter" | "year" | "all";

export const chartRanges: readonly ChartRange[] = [
  "week",
  "month",
  "quarter",
  "year",
  "all",
];

/**
 * A point that summarizes a span of days rather than standing on one of them,
 * such as a weekly average. The chart labels the span; it never recomputes it.
 */
export type ChartSpan = Readonly<{
  start: string;
  end: string;
  /** Days inside the span that carry a value. */
  recordedDays: number;
  /** The span has not ended yet, so its value can still change. */
  provisional: boolean;
}>;

export type ChartPoint = Readonly<{
  date: string;
  value: number;
  /** Exercise and split series: the workout the point was read from. */
  workoutId?: string;
  span?: ChartSpan;
}>;

export type ChartSeries = Readonly<{
  metric: ChartMetric;
  label: string;
  unit: MeasureUnit;
  /** Assistance improves downwards, so presentation must not guess. */
  lowerIsBetter: boolean;
  points: readonly ChartPoint[];
  /** Drawn beside this series, such as weekly averages beside daily weigh-ins. */
  companion?: ChartSeries;
}>;

export const metricLabels: Readonly<Record<ChartMetric, string>> = {
  top_load: "Highest load",
  least_load: "Least assistance",
  top_reps: "Highest reps",
  total_volume: "Workout volume",
  total_reps: "Workout reps",
  duration: "Active duration",
  weight: "Weight",
  weekly_average: "Weekly average",
  measurement: "Measurement",
};

export const metricUnits: Readonly<Record<ChartMetric, MeasureUnit>> = {
  top_load: "kg",
  least_load: "kg",
  top_reps: "reps",
  total_volume: "volume",
  total_reps: "reps",
  duration: "seconds",
  weight: "kg",
  weekly_average: "kg",
  measurement: "cm",
};

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
