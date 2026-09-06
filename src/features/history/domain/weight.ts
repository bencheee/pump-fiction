import {
  metricLabels,
  metricUnits,
  rangeStart,
  type ChartPoint,
  type ChartRange,
  type ChartSeries,
} from "./chart";

/**
 * The weight rules of `weight-and-body.md`, as pure functions over the stored
 * entries and the configured local date. `T-038` keeps them here beside the
 * exercise and split statistics, because Weight is a History subsection under
 * ADR-0003 and no aggregate table holds a weekly average: every value below is
 * derived at read time, so a historical edit is immediately correct.
 *
 * Dates are local calendar dates the database already resolved in the
 * configured time zone. They are compared and shifted as calendar days in UTC,
 * so a daylight-saving change cannot move a week boundary.
 */

/** One stored weigh-in. At most one exists per local calendar date. */
export type WeightEntry = Readonly<{
  id: string;
  entryDate: string;
  weightKg: number;
}>;

/** A weigh-in beside its change from the previous one by date. */
export type WeightEntryChange = Readonly<{
  id: string;
  entryDate: string;
  weightKg: number;
  /** Null for the first weigh-in, which has nothing to compare with. */
  changeKg: number | null;
}>;

/** One Monday-to-Sunday week that holds at least one weigh-in. */
export type WeeklySummary = Readonly<{
  weekStart: string;
  weekEnd: string;
  /** The sum of the entries divided by how many there are, never by seven. */
  averageKg: number;
  /** The `n` of the `n/7` the screen shows. */
  recordedDays: number;
  /** Null when the preceding calendar week has no entry: unavailable, not zero. */
  changeKg: number | null;
  /** True until the week's Sunday; on Sunday the week reads as final. */
  provisional: boolean;
}>;

/** Everything `S19` shows apart from the chart. */
export type WeightOverview = Readonly<{
  localDate: string;
  /** Newest first, as the entry list reads. */
  entries: readonly WeightEntryChange[];
  latest: WeightEntryChange | null;
  /** Null when this week has no weigh-in yet; the screen fabricates nothing. */
  currentWeek: WeeklySummary | null;
}>;

/** The Monday of the calendar week that contains a local date. */
export function weekStartOf(localDate: string): string {
  const date = utc(localDate);
  // getUTCDay is 0 on Sunday, so shift the origin to Monday.
  return isoDate(shiftDays(date, -((date.getUTCDay() + 6) % 7)));
}

/** The Sunday of the calendar week that contains a local date. */
export function weekEndOf(localDate: string): string {
  return isoDate(shiftDays(utc(weekStartOf(localDate)), 6));
}

/**
 * Every week that holds a weigh-in, newest first. A week with no entry has no
 * summary, so nothing invents an average or a zero change for it.
 */
export function weeklySummaries(
  entries: readonly WeightEntry[],
  localDate: string,
): readonly WeeklySummary[] {
  const weeks = new Map<string, { sum: number; count: number }>();
  for (const entry of entries) {
    const start = weekStartOf(entry.entryDate);
    const week = weeks.get(start) ?? { sum: 0, count: 0 };
    weeks.set(start, {
      sum: week.sum + entry.weightKg,
      count: week.count + 1,
    });
  }

  const currentWeekStart = weekStartOf(localDate);
  return [...weeks.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([weekStart, week]) => {
      const averageKg = week.sum / week.count;
      const previous = weeks.get(isoDate(shiftDays(utc(weekStart), -7)));
      const weekEnd = isoDate(shiftDays(utc(weekStart), 6));
      return {
        weekStart,
        weekEnd,
        averageKg,
        recordedDays: week.count,
        changeKg: previous ? averageKg - previous.sum / previous.count : null,
        provisional: weekStart === currentWeekStart && localDate < weekEnd,
      };
    });
}

/** Every weigh-in newest first, each carrying its change from the one before. */
export function entryChanges(
  entries: readonly WeightEntry[],
): readonly WeightEntryChange[] {
  const ascending = [...entries].sort((left, right) =>
    left.entryDate.localeCompare(right.entryDate),
  );
  return ascending
    .map((entry, index) => ({
      id: entry.id,
      entryDate: entry.entryDate,
      weightKg: entry.weightKg,
      changeKg:
        index === 0 ? null : entry.weightKg - ascending[index - 1].weightKg,
    }))
    .reverse();
}

export function weightOverview(
  entries: readonly WeightEntry[],
  localDate: string,
): WeightOverview {
  const changes = entryChanges(entries);
  const currentWeekStart = weekStartOf(localDate);
  return {
    localDate,
    entries: changes,
    latest: changes[0] ?? null,
    currentWeek:
      weeklySummaries(entries, localDate).find(
        (week) => week.weekStart === currentWeekStart,
      ) ?? null,
  };
}

/**
 * The daily weigh-ins inside a trailing window that ends on the local date,
 * with the weekly averages as a companion series beside them.
 *
 * A weekly point sits on the last day its week actually reaches, so the current
 * provisional week is drawn at today rather than in the future. Its span says
 * which week it covers, how many days it recorded, and whether it can still
 * change, which is everything the chart needs to label it without computing.
 * A week that starts before the window but ends inside it keeps its whole
 * average, because a week is a week; the span makes that visible.
 */
export function weightSeries(
  entries: readonly WeightEntry[],
  range: ChartRange,
  localDate: string,
): ChartSeries {
  const from = rangeStart(range, localDate);
  const daily: ChartPoint[] = [...entries]
    .filter((entry) => from === null || entry.entryDate >= from)
    .sort((left, right) => left.entryDate.localeCompare(right.entryDate))
    .map((entry) => ({ date: entry.entryDate, value: entry.weightKg }));

  const weekly: ChartPoint[] = [...weeklySummaries(entries, localDate)]
    .reverse()
    .filter((week) => from === null || week.weekEnd >= from)
    .map((week) => ({
      date: week.weekEnd < localDate ? week.weekEnd : localDate,
      value: week.averageKg,
      span: {
        start: week.weekStart,
        end: week.weekEnd,
        recordedDays: week.recordedDays,
        provisional: week.provisional,
      },
    }));

  return {
    metric: "weight",
    label: metricLabels.weight,
    unit: metricUnits.weight,
    // Neither direction is progress: that depends on the person's goal.
    lowerIsBetter: false,
    points: daily,
    companion: {
      metric: "weekly_average",
      label: metricLabels.weekly_average,
      unit: metricUnits.weekly_average,
      lowerIsBetter: false,
      points: weekly,
    },
  };
}

function utc(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}
function shiftDays(date: Date, days: number): Date {
  const shifted = new Date(date);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted;
}
function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
