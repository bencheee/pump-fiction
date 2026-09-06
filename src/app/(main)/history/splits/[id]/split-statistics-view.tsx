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
    <div className="flex min-h-full flex-col">
      <TopBar
        title={summary.splitName}
        backHref="/history/splits"
        backLabel="Splits"
      />
      <PageFrame title={summary.splitName} className="pt-5">
        <p className="flex flex-wrap items-center gap-2 text-[var(--pf-text-2)]">
          <span>{summary.programName}</span>
          {summary.stillExists ? null : <Badge>No longer in the program</Badge>}
        </p>

        <div className="grid grid-cols-2 gap-2">
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

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            Duration
          </h2>
          <div
            role="group"
            aria-label="Time range"
            className="flex flex-wrap gap-2"
          >
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
            <summary className="min-h-11 text-[13px] font-semibold text-[var(--pf-accent-strong)]">
              Chart values
            </summary>
            <ul
              aria-label="Chart values"
              className="pf-numeric mt-1 flex flex-col gap-1 text-[13px]"
            >
              {view.series.points.map((point) => (
                <li key={point.workoutId} className="flex justify-between">
                  <span>{formatHistoryDate(point.date)}</span>
                  <span>{formatHistoryDuration(point.value)}</span>
                </li>
              ))}
            </ul>
          </details>
          <p className="text-[12.5px] text-[var(--pf-text-2)]">
            Only completed workouts of this split count. One-time workouts and
            workouts saved as incomplete are excluded.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            Workouts
          </h2>
          <ul className="flex flex-col gap-2" aria-label="Split workouts">
            {view.workouts.map((workout) => (
              <li key={workout.workoutId}>
                <Link
                  href={`/history/workouts/${workout.workoutId}`}
                  className="flex min-h-11 items-center justify-between rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] bg-[var(--pf-bg-surface)] px-3 py-2 text-[13px]"
                >
                  <span className="font-semibold">
                    {formatHistoryDate(workout.workoutDate)}
                  </span>
                  <span className="pf-numeric">
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
    return (
      <p className="text-[var(--pf-text-2)]">
        No workout falls inside this range.
      </p>
    );
  const values = series.points.map((point) => point.value);
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  return (
    <p className="text-[13px] text-[var(--pf-text-2)]">
      Active duration across {series.points.length}{" "}
      {series.points.length === 1 ? "workout" : "workouts"}:{" "}
      {formatHistoryDuration(first)} to {formatHistoryDuration(last)}, longest{" "}
      {formatHistoryDuration(Math.max(...values))}, shortest{" "}
      {formatHistoryDuration(Math.min(...values))}.
    </p>
  );
}
