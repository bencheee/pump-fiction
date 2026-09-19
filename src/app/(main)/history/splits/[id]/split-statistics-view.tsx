"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { getSplitStatisticsAction } from "@/app/actions/workout-history";
import type { SplitStatistics } from "@/features/history/application/split-statistics-operations";
import { chartRanges, type ChartRange } from "@/features/history/domain/chart";
import { ProgressChart } from "@/features/history/ui/progress-chart";
import {
  Badge,
  Chip,
  Icon,
  Kicker,
  rowStagger,
  ScreenBody,
  StatCard,
  TopBar,
} from "@/shared/ui";

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
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title={summary.splitName}
        backHref="/history/splits"
        backLabel="Splits"
      />
      <ScreenBody>
        <div>
          <h2 className="text-[length:var(--pf-type-title-size)] leading-[1.16] font-semibold tracking-[-0.01em] [text-wrap:pretty]">
            {summary.splitName}
          </h2>
          <p className="mt-2 text-[14px] text-[var(--pf-text-3)]">
            {summary.programName}
          </p>
          {summary.stillExists ? null : (
            <p className="mt-2.5">
              <Badge>No longer in the program</Badge>
            </p>
          )}
        </div>

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

        <Kicker className="mt-1">Active duration</Kicker>
        <section className="flex flex-col gap-3">
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
          <section className="rounded-[var(--pf-r4)] bg-[var(--pf-bg-surface)] p-[18px]">
            <ProgressChart
              series={view.series}
              formatValue={formatHistoryDuration}
            />
          </section>
          <p className="text-[12.5px] leading-[1.5] text-[var(--pf-text-4)]">
            Only completed workouts of this split count. One-time workouts are
            excluded.
          </p>
        </section>

        <Kicker className="mt-1">Workouts</Kicker>
        <ul className="flex flex-col gap-2" aria-label="Split workouts">
          {view.workouts.map((workout, index) => (
            <li key={workout.workoutId}>
              <Link
                href={`/history/workouts/${workout.workoutId}`}
                style={rowStagger(index)}
                className="flex min-h-[58px] items-center gap-3 rounded-[var(--pf-r2)] border border-[var(--pf-bg-surface)] bg-[var(--pf-bg-surface)] pr-3 pl-[18px] transition-[border-color,transform] duration-[var(--pf-mo-fast)] ease-[var(--pf-ease)] hover:border-[var(--pf-border-strong)] active:scale-[0.99] motion-safe:animate-[pf-row-in_260ms_var(--pf-ease)_both]"
              >
                <span className="pf-numeric min-w-0 flex-1 text-[16px] font-semibold">
                  {formatHistoryDate(workout.workoutDate)}
                </span>
                <span className="pf-numeric shrink-0 text-[16px] text-[var(--pf-text-3)]">
                  {formatHistoryDuration(workout.activeDurationSeconds)}
                </span>
                <Icon
                  name="chevron-right"
                  size={16}
                  className="shrink-0 text-[var(--pf-glyph-dim)]"
                />
              </Link>
            </li>
          ))}
        </ul>
      </ScreenBody>
    </div>
  );
}
