"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { getSplitStatisticsAction } from "@/app/actions/workout-history";
import type { SplitStatistics } from "@/features/history/application/split-statistics-operations";
import {
  chartRanges,
  type ChartRange,
  type ChartSeries,
} from "@/features/history/domain/chart";
import { ProgressChart } from "@/features/history/ui/progress-chart";
import { Badge, Chip, PageFrame, StatCard, TopBar } from "@/shared/ui";

import {
  formatHistoryDate,
  formatHistoryDuration,
} from "../../history-presentation";

const rangeLabels: Readonly<Record<ChartRange, string>> = {
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
  all: "All",
};

const minutes = (seconds: number) => `${Math.round(seconds / 60)}`;

export function SplitStatisticsView({
  statistics,
  localDate,
}: {
  statistics: SplitStatistics;
  localDate: string;
}) {
  const [view, setView] = useState(statistics);
  const [range, setRange] = useState<ChartRange>("all");
  const [pending, startTransition] = useTransition();
  const { summary } = view;

  const reload = (next: ChartRange) => {
    setRange(next);
    startTransition(async () => {
      const result = await getSplitStatisticsAction(summary.splitIdentityId, {
        range: next,
        localDate,
      });
      if (result.ok) setView(result.value);
    });
  };

  return (
    <div>
      <TopBar
        title={summary.splitName}
        backHref="/history/splits"
        backLabel="Splits"
      />
      <PageFrame title={summary.splitName}>
        <p>
          <span>{summary.programName}</span>
          {summary.stillExists ? null : <Badge>No longer in the program</Badge>}
        </p>

        <div>
          <StatCard
            label="Completed"
            value={summary.completedWorkoutCount}
            detail={
              summary.completedWorkoutCount === 1 ? "workout" : "workouts"
            }
          />
          <StatCard
            label="Average"
            value={formatHistoryDuration(summary.averageDurationSeconds)}
          />
          <StatCard
            label="Shortest"
            value={formatHistoryDuration(summary.shortestDurationSeconds)}
          />
          <StatCard
            label="Longest"
            value={formatHistoryDuration(summary.longestDurationSeconds)}
          />
          <StatCard
            label="Latest"
            value={formatHistoryDuration(summary.latestDurationSeconds)}
            detail={formatHistoryDate(summary.latestWorkoutDate)}
          />
          <StatCard
            label="Total"
            value={formatHistoryDuration(summary.totalDurationSeconds)}
          />
        </div>

        <section>
          <h2>Duration</h2>
          <div role="group" aria-label="Time range">
            {chartRanges.map((option) => (
              <Chip
                key={option}
                selected={range === option}
                disabled={pending}
                onClick={() => reload(option)}
              >
                {rangeLabels[option]}
              </Chip>
            ))}
          </div>
          <DurationSummary series={view.series} />
          <ProgressChart series={view.series} formatValue={minutes} />
          <details>
            <summary>Chart values</summary>
            <ul aria-label="Chart values">
              {view.series.points.map((point) => (
                <li key={point.workoutId}>
                  <span>{formatHistoryDate(point.date)}</span>
                  <span>{formatHistoryDuration(point.value)}</span>
                </li>
              ))}
            </ul>
          </details>
          <p>
            Only completed workouts of this split count. One-time workouts are
            excluded.
          </p>
        </section>

        <section>
          <h2>Workouts</h2>
          <ul aria-label="Split workouts">
            {view.workouts.map((workout) => (
              <li key={workout.workoutId}>
                <Link href={`/history/workouts/${workout.workoutId}`}>
                  <span>{formatHistoryDate(workout.workoutDate)}</span>
                  <span>
                    {formatHistoryDuration(workout.activeDurationSeconds)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </PageFrame>
    </div>
  );
}

function DurationSummary({ series }: { series: ChartSeries }) {
  if (series.points.length === 0)
    return <p>No workout falls inside this range.</p>;
  const values = series.points.map((point) => point.value);
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  return (
    <p>
      Active duration across {series.points.length}{" "}
      {series.points.length === 1 ? "workout" : "workouts"}:{" "}
      {formatHistoryDuration(first)} to {formatHistoryDuration(last)}, longest{" "}
      {formatHistoryDuration(Math.max(...values))}, shortest{" "}
      {formatHistoryDuration(Math.min(...values))}.
    </p>
  );
}
