"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { getExerciseStatisticsAction } from "@/app/actions/workout-history";
import { formatSetSummary } from "@/features/active-workout/ui/workout-presentation";
import type { ExerciseStatistics } from "@/features/history/application/exercise-statistics-operations";
import {
  chartRanges,
  metricLabels,
  type ChartMetric,
  type ChartRange,
  type ChartSeries,
} from "@/features/history/domain/chart";
import type {
  ExercisePerformance,
  PersonalRecord,
} from "@/features/history/domain/exercise-statistics";
import { ProgressChart } from "@/features/history/ui/progress-chart";
import {
  Badge,
  Chip,
  Collapsible,
  DataRow,
  EmptyState,
  Icon,
  Kicker,
  rowStagger,
  ScreenBody,
  TopBar,
} from "@/shared/ui";

import { formatHistoryDate } from "../../history-presentation";

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
  localDate: string;
}) {
  const [view, setView] = useState(statistics);
  const [range, setRange] = useState<ChartRange>("all");
  const [pending, startTransition] = useTransition();
  const metric = view.series.metric;

  const reload = (next: { metric?: ChartMetric; range?: ChartRange }) => {
    const chosenMetric = next.metric ?? metric;
    const chosenRange = next.range ?? range;
    setRange(chosenRange);
    startTransition(async () => {
      const result = await getExerciseStatisticsAction(
        statistics.exerciseIdentityId,
        { metric: chosenMetric, range: chosenRange, localDate },
      );
      if (result.ok) setView(result.value);
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title={view.exerciseName}
        backHref="/history/exercises"
        backLabel="Exercises"
      />
      <ScreenBody>
        <div>
          <h2 className="text-[length:var(--pf-type-title-size)] leading-[1.16] font-semibold tracking-[-0.01em] [text-wrap:pretty]">
            {view.exerciseName}
          </h2>
          {view.stillInLibrary ? null : (
            <p className="mt-2.5">
              <Badge>No longer in the library</Badge>
            </p>
          )}
        </div>

        <section className="rounded-[var(--pf-r4)] bg-[var(--pf-accent-dim)] p-[18px]">
          <h3 className="flex items-center gap-2 text-[11.5px] font-semibold tracking-[0.08em] text-[var(--pf-accent)] uppercase">
            <Icon name="circle-check" size={14} />
            Latest performance
          </h3>
          {view.latestPerformance === null ? (
            <p className="mt-3 text-[14px] text-[var(--pf-text-2)]">
              Nothing counts yet. Complete a workout with recorded sets.
            </p>
          ) : (
            <>
              <p className="pf-numeric mt-3 text-[19px] font-semibold text-[var(--pf-accent-soft)]">
                {formatHistoryDate(view.latestPerformance.workoutDate)}
              </p>
              <p className="pf-numeric mt-1.5 text-[16px] text-[var(--pf-text-2)]">
                {view.latestPerformance.sets
                  .filter((set) => set.loadMode !== null && set.reps !== null)
                  .map((set) =>
                    formatSetSummary(
                      set,
                      view.latestPerformance?.measurementType,
                    ),
                  )
                  .join(", ")}
              </p>
            </>
          )}
        </section>

        <Kicker className="mt-1">Personal records</Kicker>
        {view.categories.length === 0 ? (
          <p className="text-[13.5px] text-[var(--pf-text-3)]">
            Records appear once a completed workout holds a recorded set.
          </p>
        ) : (
          view.categories.map((entry) => (
            <section
              key={entry.category.key}
              aria-label={entry.category.label}
              className="rounded-[var(--pf-r4)] bg-[var(--pf-bg-surface)] px-[18px] py-4"
            >
              <h3 className="text-[14px] font-semibold">
                {entry.category.label}
              </h3>
              <dl className="mt-2.5 flex flex-col">
                {entry.records.map((record, index) => (
                  <RecordRow
                    key={record.key}
                    record={record}
                    first={index === 0}
                  />
                ))}
              </dl>
              {entry.repsByLoad.length > 0 ? (
                <div className="mt-2">
                  <Collapsible label="Highest reps at each load">
                    <ul
                      aria-label={`Highest reps at each load, ${entry.category.label}`}
                      className="flex flex-col pt-1"
                    >
                      {entry.repsByLoad.map((row, index) => (
                        <li key={row.load}>
                          <DataRow
                            first={index === 0}
                            label={`${row.load} kg`}
                            value={`${row.reps} reps`}
                          />
                        </li>
                      ))}
                    </ul>
                  </Collapsible>
                </div>
              ) : null}
            </section>
          ))
        )}

        <Kicker className="mt-1">Progress</Kicker>
        {view.metrics.length === 0 ? (
          <EmptyState
            icon="trending-up"
            title="No chart yet"
            body="A completed workout with recorded sets starts the chart."
          />
        ) : (
          <>
            <div
              role="group"
              aria-label="Metric"
              className="flex flex-wrap gap-2"
            >
              {view.metrics.map((option) => (
                <Chip
                  key={option}
                  selected={metric === option}
                  disabled={pending}
                  onClick={() => reload({ metric: option })}
                >
                  {metricLabels[option]}
                </Chip>
              ))}
            </div>
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
                  onClick={() => reload({ range: option })}
                >
                  {rangeLabels[option]}
                </Chip>
              ))}
            </div>
            <section className="rounded-[var(--pf-r4)] bg-[var(--pf-bg-surface)] p-[18px]">
              <ProgressChart
                series={view.series}
                formatValue={(value) =>
                  `${value} ${unitSuffix(view.series)}`.trim()
                }
              />
            </section>
          </>
        )}

        <Kicker className="mt-1">All performances</Kicker>
        <ul className="flex flex-col gap-2">
          {view.performances.map((performance, index) => (
            <li key={performance.workoutExerciseId}>
              <PerformanceRow performance={performance} index={index} />
            </li>
          ))}
        </ul>
      </ScreenBody>
    </div>
  );
}

function RecordRow({
  record,
  first,
}: {
  record: PersonalRecord;
  first: boolean;
}) {
  return (
    <div
      className={
        first
          ? "flex min-h-10 items-baseline justify-between gap-3.5 py-1.5"
          : "flex min-h-10 items-baseline justify-between gap-3.5 border-t border-[var(--pf-border)] py-1.5"
      }
    >
      <dt className="min-w-0 flex-1 text-[13.5px] text-[var(--pf-text-3)]">
        {record.label}
        {record.lowerIsBetter ? (
          <span className="ml-1 text-[11px]">(less is better)</span>
        ) : null}
      </dt>
      <dd className="pf-numeric shrink-0 text-[17px] font-semibold">
        {record.value}
        {record.unit === "kg"
          ? " kg"
          : record.unit === "reps"
            ? " reps"
            : record.unit === "seconds"
              ? " sec"
              : ""}
        {record.reps !== null && record.unit !== "reps"
          ? ` × ${record.reps}`
          : ""}
      </dd>
    </div>
  );
}

function unitSuffix(series: ChartSeries): string {
  if (series.unit === "kg") return "kg";
  if (series.unit === "reps") return "reps";
  if (series.unit === "seconds") return "s";
  return "kg·reps";
}

function PerformanceRow({
  performance,
  index,
}: {
  performance: ExercisePerformance;
  index: number;
}) {
  const sets = performance.sets
    .filter((set) => set.loadMode !== null && set.reps !== null)
    .map((set) => formatSetSummary(set, performance.measurementType));

  return (
    <Link
      href={`/history/workouts/${performance.workoutId}`}
      style={rowStagger(index)}
      className="flex items-center gap-2.5 rounded-[var(--pf-r3)] border border-[var(--pf-bg-surface)] bg-[var(--pf-bg-surface)] py-3.5 pr-3 pl-[18px] transition-[border-color,transform] duration-[var(--pf-mo-fast)] ease-[var(--pf-ease)] hover:border-[var(--pf-border-strong)] active:scale-[0.99] motion-safe:animate-[pf-row-in_260ms_var(--pf-ease)_both]"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="pf-numeric shrink-0 text-[15px] font-semibold text-[var(--pf-accent)]">
            {formatHistoryDate(performance.workoutDate)}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--pf-text-4)]">
            {performance.workoutName}
          </span>
        </span>
        <span className="pf-numeric mt-1.5 block text-[15px] text-[var(--pf-text-2)]">
          {sets.length > 0 ? sets.join(", ") : "No recorded set"}
        </span>
        {performance.workoutNote ? (
          <span className="mt-2 block text-[13px] leading-[1.5] text-[var(--pf-text-3)]">
            Workout note: {performance.workoutNote}
          </span>
        ) : null}
      </span>
      <Icon
        name="chevron-right"
        size={16}
        className="shrink-0 text-[var(--pf-glyph-dim)]"
      />
    </Link>
  );
}
