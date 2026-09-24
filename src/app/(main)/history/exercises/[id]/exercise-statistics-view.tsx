"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

import { formatSetSummary } from "@/features/active-workout/ui/workout-presentation";
import type { ExerciseStatistics } from "@/features/history/application/exercise-statistics-operations";
import {
  chartRanges,
  metricLabels,
  type ChartMetric,
  type ChartRange,
  type ChartSeries,
} from "@/features/history/domain/chart";
import {
  chartSeries,
  type CategoryRecords,
  type ExercisePerformance,
  type PersonalRecord,
} from "@/features/history/domain/exercise-statistics";
import { Badge, BarChart, Chip, Disclosure, Icon, TopBar } from "@/shared/ui";
import type { BarChartPoint } from "@/shared/ui";

import { formatCount, formatHistoryDate } from "../../history-presentation";
import "./exercise-statistics-view.css";

/*
 * The Exercise statistics screen — the prototype's screen 7 — ported for step
 * 11 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records (the Claude
 * Design MCP would not connect for this session; see the plan's verification
 * note):
 *   markup        lines 476-600, `data-screen-label="Exercise statistics"`
 *   bound values  lines 2113-2141 (`xdRecords`, `xdRepsByLoad`), 2156-2163
 *                 (which series the chart is given), 2256-2277 (`xdName`,
 *                 `xdLatestDate`, `xdLatestSets`, `xdCategory`, `metricChips`,
 *                 `xdPerformances`), 2361-2402 (`chart()`)
 *
 * The chart card and the disclosure row are shared surfaces and live in
 * `src/shared/ui`; the register in the plan records both as born here.
 */

const rangeLabels: Readonly<Record<ChartRange, string>> = {
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
  all: "All",
};

export function ExerciseStatisticsView({
  statistics,
  localDate,
}: {
  statistics: ExerciseStatistics;
  /** Today in the configured zone, read on the server: where a range ends. */
  localDate: string;
}) {
  const [metric, setMetric] = useState<ChartMetric>(statistics.series.metric);
  const [range, setRange] = useState<ChartRange>("all");
  /*
   * The prototype answers a chip in the same frame, and so does this: every
   * performance the exercise has is already on the screen, and `chartSeries`
   * is the same pure function the server called for the first paint. Asking
   * the server again would spend a round trip to be told what is in hand, and
   * the bars would redraw rather than move.
   */
  const series = useMemo(
    () =>
      metric === statistics.series.metric && range === "all"
        ? statistics.series
        : chartSeries(statistics.performances, metric, range, localDate),
    [statistics.series, statistics.performances, metric, range, localDate],
  );

  return (
    <div data-exercise-statistics="">
      <TopBar
        screen="exercise-statistics"
        title={statistics.exerciseName}
        backHref="/history/exercises"
        backLabel="Back"
      />

      <div data-exercise-statistics-body="">
        <div>
          <h2 data-exercise-statistics-name="">{statistics.exerciseName}</h2>
          {statistics.stillInLibrary ? null : (
            <p data-exercise-statistics-retired="">
              <Badge size="statistics">No longer in the library</Badge>
            </p>
          )}
        </div>

        <LatestPerformance performance={statistics.latestPerformance} />

        <p data-exercise-statistics-eyebrow="">Personal records</p>
        {statistics.categories.length === 0 ? (
          // An exercise whose performances hold no recorded set, which the
          // prototype has no screen for: the note card the History list
          // answers an emptiness with, as steps 9 and 10 use it.
          <p data-history-note="">
            Records appear once a completed workout holds a recorded set.
          </p>
        ) : (
          statistics.categories.map((entry) => (
            <RecordsCard key={entry.category.key} entry={entry} />
          ))
        )}

        <p data-exercise-statistics-eyebrow="">Progress</p>
        {statistics.metrics.length === 0 ? (
          <p data-history-note="">
            A completed workout with recorded sets starts the chart.
          </p>
        ) : (
          <>
            {/* `metricChips` (lines 530-534, values at 2265-2271) and
                `rangeChips` (535-539, values at 2396-2401): two rows of the
                same chip, the metric above the range. */}
            <div
              data-exercise-statistics-chips=""
              role="group"
              aria-label="Metric"
            >
              {statistics.metrics.map((option) => (
                <Chip
                  key={option}
                  selected={metric === option}
                  onClick={() => setMetric(option)}
                >
                  {metricLabels[option]}
                </Chip>
              ))}
            </div>
            <div
              data-exercise-statistics-chips=""
              role="group"
              aria-label="Time range"
            >
              {chartRanges.map((option) => (
                <Chip
                  key={option}
                  selected={range === option}
                  onClick={() => setRange(option)}
                >
                  {rangeLabels[option]}
                </Chip>
              ))}
            </div>
            <BarChart
              points={barPoints(series)}
              summary={chartSummary(series)}
              emptyMessage="No workout falls inside this range."
              signature={`${metric}|${range}|${series.points.length}`}
            />
          </>
        )}

        <p data-exercise-statistics-eyebrow="">All performances</p>
        {statistics.performances.length === 0 ? (
          <p data-history-note="">
            This exercise has no saved performance yet.
          </p>
        ) : (
          statistics.performances.map((performance, index) => (
            <PerformanceCard
              key={performance.workoutExerciseId}
              performance={performance}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}

/** `xdLatestDate` and `xdLatestSets` (lines 490-493, values at 2258-2259). */
function LatestPerformance({
  performance,
}: {
  performance: ExercisePerformance | null;
}) {
  return (
    <section data-exercise-latest="">
      <p>
        <Icon name="circle-check" size={14} />
        Latest performance
      </p>
      <p>
        {performance === null
          ? "Nothing counts yet"
          : `${formatHistoryDate(performance.workoutDate)} · ${performance.workoutName}`}
      </p>
      <p>
        {performance === null
          ? "Complete a workout with recorded sets."
          : setsText(performance)}
      </p>
    </section>
  );
}

/*
 * `xdCategory` and `xdRecords` (lines 497-527, values at 2119-2141 and
 * 2261-2264). The prototype's
 * exercise is weights or bodyweight and has exactly one card; the application
 * compares a band direction and strength on its own terms — `MVP-HIS-009` —
 * so an exercise has one card per category it was performed in, each the same
 * card, and the heading names which.
 */
function RecordsCard({ entry }: { entry: CategoryRecords }) {
  return (
    <section data-exercise-records="" aria-label={entry.category.label}>
      <h3>{entry.category.label}</h3>
      <div data-exercise-record-rows="">
        {entry.records.map((record) => (
          <div key={record.key} data-exercise-record="">
            <span>
              {record.label}
              {/* `least_load` is the one record a smaller number wins, which
                  the prototype has no notion of and `MVP-HIS-010` asks be
                  said rather than left to the reader. */}
              {record.lowerIsBetter ? <span> (less is better)</span> : null}
            </span>
            <span>{recordValue(record)}</span>
          </div>
        ))}
      </div>
      {entry.repsByLoad.length === 0 ? null : (
        <Disclosure
          label="Highest reps at each load"
          listLabel={`Highest reps at each load, ${entry.category.label}`}
        >
          {entry.repsByLoad.map((row) => (
            <li key={row.load}>
              <span>{row.load} kg</span>
              <span>{formatCount(row.reps, "rep")}</span>
            </li>
          ))}
        </Disclosure>
      )}
    </section>
  );
}

/** `xdPerformances` (lines 585-598, values at 2272-2277). A route, so it is a link. */
function PerformanceCard({
  performance,
  index,
}: {
  performance: ExercisePerformance;
  index: number;
}) {
  const date = formatHistoryDate(performance.workoutDate);

  return (
    <Link
      data-exercise-performance=""
      href={`/history/workouts/${performance.workoutId}`}
      aria-label={`${date} · ${performance.workoutName}`}
      style={{ "--row-index": Math.min(index, 9) } as CSSProperties}
    >
      <span>
        <span data-exercise-performance-head="">
          <span>{date}</span>
          <span>{performance.workoutName}</span>
        </span>
        <span data-exercise-performance-sets="">{setsText(performance)}</span>
        {performance.workoutNote ? (
          <span data-exercise-performance-note="">
            Workout note: {performance.workoutNote}
          </span>
        ) : null}
      </span>
      <Icon name="chevron-right" size={16} />
    </Link>
  );
}

/**
 * `setText` (prototype line 1666), read through the application's own load
 * vocabulary: a band, an assistance mode and a seconds-measured set each carry
 * their own words, where the prototype's set is kilograms or bodyweight.
 */
function setsText(performance: ExercisePerformance): string {
  const sets = performance.sets
    .filter((set) => set.loadMode !== null && set.reps !== null)
    .map((set) => formatSetSummary(set, performance.measurementType));
  return sets.length > 0 ? sets.join(", ") : "No recorded set";
}

/**
 * `r.value` (2126-2136). The prototype states a load record as the set that
 * set it — `82.5 kg × 6` — and the application's record carries the same reps,
 * so it reads the same way. A volume already has the reps inside the product
 * it is measured in, and saying them again beside it would count them twice.
 */
function recordValue(record: PersonalRecord): string {
  const value = `${formatNumber(record.value)} ${unitWord(record.unit)}`;
  return record.reps === null || record.unit !== "kg"
    ? value
    : `${value} × ${record.reps}`;
}

function unitWord(unit: ChartSeries["unit"]): string {
  if (unit === "volume") return "kg·reps";
  if (unit === "seconds") return "sec";
  if (unit === "reps") return "reps";
  return unit;
}

/** `toLocaleString("en-GB")` (2129): a session volume runs into the thousands. */
function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(
    value,
  );
}

/**
 * How tall each bar stands. The prototype's `b.h` (2371) measures a value
 * against zero, and a lifter's loads sit far from zero: ten sessions between
 * 70 and 75 kg drew ten bars between 92% and 100%. The Owner chose on
 * 2026-09-24 to float the base as the Body chart does (`bodyChart`, lines
 * 2601-2613): it sits below the smallest value by nine tenths of the spread,
 * and never less than 0.4, so the spread fills the track and a single point
 * stands full height. A bar is never shorter than 5%, as `b.h` keeps it.
 *
 * A series a smaller number wins is measured the other way up, so its best
 * result is its tallest bar — `MVP-HIS-010`, which the reversed axis of the
 * Recharts line used to carry. The reading over the bars always states the
 * value itself.
 */
function barPoints(series: ChartSeries): readonly BarChartPoint[] {
  const values = series.points.map((point) => point.value);
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const base = min - Math.max(0.4, (max - min) * 0.9);
  const span = Math.max(0.001, max - base);

  return series.points.map((point, index) => {
    const measured = series.lowerIsBetter
      ? max + min - point.value
      : point.value;
    return {
      key: point.workoutId ?? `${point.date}-${index}`,
      date: formatHistoryDate(point.date),
      value: seriesValue(series, point.value),
      height: Math.max(5, ((measured - base) / span) * 100),
    };
  });
}

/** `chartSummary` (2388-2390). */
function chartSummary(series: ChartSeries): string {
  const values = series.points.map((point) => point.value);
  if (values.length === 0) return "";
  const first = values[0];
  const last = values[values.length - 1];
  const best = series.lowerIsBetter ? Math.min(...values) : Math.max(...values);
  const improved = series.lowerIsBetter ? last < first : last > first;
  // The prototype's third sentence names the direction of a bigger number;
  // for the one series a smaller number wins, it is the same sentence the
  // other way up.
  const trend =
    last === first
      ? "Unchanged over this range."
      : improved
        ? "Moving in the better direction."
        : series.lowerIsBetter
          ? "Above where the range started."
          : "Below where the range started.";

  return `${formatCount(values.length, "workout")} in range: ${seriesValue(series, first)} to ${seriesValue(series, last)}, best ${seriesValue(series, best)}. ${trend}`;
}

/** `formatValue` (2161): one decimal place, then the metric's own unit. */
function seriesValue(series: ChartSeries, value: number): string {
  return `${formatNumber(Math.round(value * 10) / 10)} ${unitWord(series.unit)}`;
}
