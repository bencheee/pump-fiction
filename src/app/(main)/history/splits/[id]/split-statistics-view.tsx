"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

import type { SplitStatistics } from "@/features/history/application/split-statistics-operations";
import {
  chartRanges,
  type ChartRange,
  type ChartSeries,
} from "@/features/history/domain/chart";
import {
  entryDurationSeries,
  type SplitSummary,
  type SplitWorkoutEntry,
} from "@/features/history/domain/split-statistics";
import { barHeights } from "@/features/history/ui/chart-scale";
import { Badge, BarChart, Chip, Icon, TopBar } from "@/shared/ui";
import type { BarChartPoint } from "@/shared/ui";

import {
  formatCount,
  formatHistoryDate,
  formatHistoryDuration,
} from "../../history-presentation";
import "./split-statistics-view.css";

/*
 * The Split statistics screen — the prototype's screen 8 — ported for step 12
 * of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 603-690, `data-screen-label="Split statistics"`
 *   bound values  lines 2143-2152 (`sdStats`), 2161-2163 (the series the chart
 *                 is given), 2279-2287 (`sdName`, `sdProgram`, `sdRetired`,
 *                 `sdWorkouts`), 2361-2402 (`chart()`)
 *
 * The chart card is the one step 11 built; the prototype writes it byte for
 * byte the same on both statistics screens (lines 541 and 639).
 */

const rangeLabels: Readonly<Record<ChartRange, string>> = {
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
  all: "All",
};

export function SplitStatisticsView({
  statistics,
  localDate,
}: {
  statistics: SplitStatistics;
  /** Today in the configured zone, read on the server: where a range ends. */
  localDate: string;
}) {
  const { summary, workouts } = statistics;
  const [range, setRange] = useState<ChartRange>("all");
  /*
   * A range chip answers in the same frame, as the exercise screen's do: every
   * workout of the split is already on the screen, and `entryDurationSeries`
   * is the function the server's own series is computed through.
   */
  const series = useMemo(
    () =>
      range === "all"
        ? statistics.series
        : entryDurationSeries(workouts, range, localDate),
    [statistics.series, workouts, range, localDate],
  );

  return (
    <div data-split-statistics="">
      <TopBar
        screen="split-statistics"
        title={summary.splitName}
        backHref="/history/splits"
        backLabel="Back"
      />

      <div data-split-statistics-body="">
        <div>
          <h2 data-split-statistics-name="">{summary.splitName}</h2>
          <p data-split-statistics-program="">{summary.programName}</p>
          {summary.stillExists ? null : (
            <p data-split-statistics-retired="">
              <Badge size="statistics">No longer in the program</Badge>
            </p>
          )}
        </div>

        <SplitTiles summary={summary} />

        <p data-split-statistics-eyebrow="">Active duration</p>
        <div
          data-split-statistics-chips=""
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
          signature={`${range}|${series.points.length}`}
        />

        <p data-split-statistics-footnote="">
          Only completed workouts of this split count. One-time workouts are
          excluded.
        </p>

        <p data-split-statistics-eyebrow="">Workouts</p>
        {workouts.map((workout, index) => (
          <WorkoutRow key={workout.workoutId} workout={workout} index={index} />
        ))}
      </div>
    </div>
  );
}

/*
 * `sdStats` (lines 620-630, values at 2146-2152). Six tiles, two to a row; the
 * first is drawn on the accent, which is what the screen leads with. Each
 * arrives on `rowAnim("sdstats", …)`, 34ms after the one before it.
 */
function SplitTiles({ summary }: { summary: SplitSummary }) {
  const tiles: readonly {
    label: string;
    value: string;
    detail?: string;
  }[] = [
    {
      label: "Completed",
      value: String(summary.completedWorkoutCount),
      detail: summary.completedWorkoutCount === 1 ? "workout" : "workouts",
    },
    {
      label: "Average",
      value: formatHistoryDuration(summary.averageDurationSeconds),
    },
    {
      label: "Shortest",
      value: formatHistoryDuration(summary.shortestDurationSeconds),
    },
    {
      label: "Longest",
      value: formatHistoryDuration(summary.longestDurationSeconds),
    },
    {
      label: "Latest",
      value: formatHistoryDuration(summary.latestDurationSeconds),
      detail: formatHistoryDate(summary.latestWorkoutDate),
    },
    {
      label: "Total",
      value: formatHistoryDuration(summary.totalDurationSeconds),
    },
  ];

  return (
    <div data-split-tiles="">
      {tiles.map((tile, index) => (
        <div
          key={tile.label}
          data-split-tile={index === 0 ? "accent" : ""}
          style={{ "--row-index": Math.min(index, 9) } as CSSProperties}
        >
          <p>{tile.label}</p>
          <p>{tile.value}</p>
          {tile.detail ? <p>{tile.detail}</p> : null}
        </div>
      ))}
    </div>
  );
}

/** `sdWorkouts` (lines 682-688, values at 2281-2286). A route, so it is a link. */
function WorkoutRow({
  workout,
  index,
}: {
  workout: SplitWorkoutEntry;
  index: number;
}) {
  const date = formatHistoryDate(workout.workoutDate);
  const duration = formatHistoryDuration(workout.activeDurationSeconds);

  return (
    <Link
      data-split-workout=""
      href={`/history/workouts/${workout.workoutId}`}
      aria-label={`${date} · ${duration}`}
      style={{ "--row-index": Math.min(index, 9) } as CSSProperties}
    >
      <span>{date}</span>
      <span>{duration}</span>
      <Icon name="chevron-right" size={16} />
    </Link>
  );
}

/**
 * The bars, each at the height the shared chart scale gives it: the range is
 * measured first and the base sits just under the shortest workout, so the
 * differences between durations fill the track (Owner, 2026-09-24).
 */
function barPoints(series: ChartSeries): readonly BarChartPoint[] {
  const heights = barHeights(
    series.points.map((point) => point.value),
    { floor: 5 },
  );
  return series.points.map((point, index) => ({
    key: point.workoutId ?? `${point.date}-${index}`,
    date: formatHistoryDate(point.date),
    value: formatHistoryDuration(point.value),
    height: heights[index] ?? 0,
  }));
}

/** `chartSummary` (2388-2390), with `durText` as the value's format (2163). */
function chartSummary(series: ChartSeries): string {
  const values = series.points.map((point) => point.value);
  if (values.length === 0) return "";
  const first = values[0];
  const last = values[values.length - 1];
  const trend =
    last === first
      ? "Unchanged over this range."
      : last > first
        ? "Moving in the better direction."
        : "Below where the range started.";

  return `${formatCount(values.length, "workout")} in range: ${formatHistoryDuration(first)} to ${formatHistoryDuration(last)}, best ${formatHistoryDuration(Math.max(...values))}. ${trend}`;
}
