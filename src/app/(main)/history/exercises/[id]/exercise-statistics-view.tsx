"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { getExerciseStatisticsAction } from "@/app/actions/workout-history";
import { formatSetSummary } from "@/features/active-workout/ui/workout-presentation";
import type { ExerciseStatistics } from "@/features/history/application/exercise-statistics-operations";
import {
  chartRanges,
  type ChartMetric,
  type ChartRange,
  type ChartSeries,
  type ExercisePerformance,
  type PersonalRecord,
} from "@/features/history/domain/exercise-statistics";
import { Badge, Chip, EmptyState, PageFrame, TopBar } from "@/shared/ui";

import {
  formatHistoryDate,
  incompleteExplanation,
} from "../../history-presentation";
import { ProgressChart } from "@/features/history/ui/progress-chart";

const metricLabels: Readonly<Record<ChartMetric, string>> = {
  top_load: "Highest load",
  least_load: "Least assistance",
  top_reps: "Highest reps",
  total_volume: "Workout volume",
  total_reps: "Workout reps",
  duration: "Active duration",
};

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
    <div className="flex min-h-full flex-col">
      <TopBar
        title={view.exerciseName}
        backHref="/history/exercises"
        backLabel="Exercises"
      />
      <PageFrame title={view.exerciseName} className="pt-5">
        {view.stillInLibrary ? null : (
          <p>
            <Badge>No longer in the library</Badge>
          </p>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            Latest performance
          </h2>
          {view.latestPerformance === null ? (
            <p className="text-[var(--pf-text-2)]">
              Nothing counts yet. Complete a workout with recorded sets.
            </p>
          ) : (
            <p className="pf-numeric">
              {formatHistoryDate(view.latestPerformance.workoutDate)} ·{" "}
              {view.latestPerformance.sets
                .filter((set) => set.loadMode !== null && set.reps !== null)
                .map(formatSetSummary)
                .join(", ")}
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            Personal records
          </h2>
          {view.categories.length === 0 ? (
            <p className="text-[var(--pf-text-2)]">
              Records appear once a completed workout holds a recorded set.
            </p>
          ) : (
            view.categories.map((entry) => (
              <section
                key={entry.category.key}
                aria-label={entry.category.label}
                className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-3"
              >
                <h3 className="text-[13px] font-semibold">
                  {entry.category.label}
                </h3>
                <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[13px]">
                  {entry.records.map((record) => (
                    <RecordRow key={record.key} record={record} />
                  ))}
                </dl>
                {entry.repsByLoad.length > 0 ? (
                  <details className="mt-2">
                    <summary className="min-h-11 text-[13px] font-semibold text-[var(--pf-accent-strong)]">
                      Highest reps at each load
                    </summary>
                    <ul
                      aria-label={`Highest reps at each load, ${entry.category.label}`}
                      className="pf-numeric mt-1 flex flex-col gap-1 text-[13px]"
                    >
                      {entry.repsByLoad.map((row) => (
                        <li key={row.load} className="flex justify-between">
                          <span>{row.load} kg</span>
                          <span>{row.reps} reps</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </section>
            ))
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            Progress
          </h2>
          {view.metrics.length === 0 ? (
            <EmptyState
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
              <ChartSummary series={view.series} />
              <ProgressChart series={view.series} />
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
                      <span>
                        {point.value} {unitSuffix(view.series)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            All performances
          </h2>
          <ul className="flex flex-col gap-2">
            {view.performances.map((performance) => (
              <li key={performance.workoutExerciseId}>
                <PerformanceRow performance={performance} />
              </li>
            ))}
          </ul>
        </section>
      </PageFrame>
    </div>
  );
}

function RecordRow({ record }: { record: PersonalRecord }) {
  return (
    <>
      <dt className="text-[var(--pf-text-2)]">
        {record.label}
        {record.lowerIsBetter ? (
          <span className="ml-1 text-[11px]">(less is better)</span>
        ) : null}
      </dt>
      <dd className="pf-numeric justify-self-end font-semibold">
        {record.value}
        {record.unit === "kg" ? " kg" : record.unit === "reps" ? " reps" : ""}
        {record.reps !== null && record.unit !== "reps"
          ? ` × ${record.reps}`
          : ""}
      </dd>
    </>
  );
}

function ChartSummary({ series }: { series: ChartSeries }) {
  if (series.points.length === 0)
    return (
      <p className="text-[var(--pf-text-2)]">
        No workout falls inside this range.
      </p>
    );
  const values = series.points.map((point) => point.value);
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const best = series.lowerIsBetter ? Math.min(...values) : Math.max(...values);
  const improved = series.lowerIsBetter ? last < first : last > first;

  return (
    <p className="text-[13px] text-[var(--pf-text-2)]">
      {series.label} across {series.points.length}{" "}
      {series.points.length === 1 ? "workout" : "workouts"}: {first} to {last}{" "}
      {unitSuffix(series)}, best {best}.{" "}
      {last === first
        ? "Unchanged over this range."
        : improved
          ? "Moving in the better direction."
          : "Moving in the worse direction."}
    </p>
  );
}

function unitSuffix(series: ChartSeries): string {
  if (series.unit === "kg") return "kg";
  if (series.unit === "reps") return "reps";
  if (series.unit === "seconds") return "s";
  return "kg·reps";
}

function PerformanceRow({ performance }: { performance: ExercisePerformance }) {
  const eligible = performance.status === "completed";
  const sets = performance.sets
    .filter((set) => set.loadMode !== null && set.reps !== null)
    .map(formatSetSummary);

  return (
    <article className="rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] bg-[var(--pf-bg-surface)] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/history/workouts/${performance.workoutId}`}
          className="min-h-11 font-semibold text-[var(--pf-accent-strong)]"
        >
          {formatHistoryDate(performance.workoutDate)} ·{" "}
          {performance.workoutName}
        </Link>
        {eligible ? null : <Badge tone="warn">Incomplete</Badge>}
      </div>
      <p className="pf-numeric mt-1 text-[13px]">
        {sets.length > 0 ? sets.join(", ") : "No recorded set"}
      </p>
      {eligible ? null : (
        <p className="mt-1 text-[12.5px] text-[var(--pf-text-2)]">
          {incompleteExplanation}
        </p>
      )}
      {performance.workoutNote ? (
        <p className="mt-1 text-[13px]">
          <span className="font-semibold">Workout note:</span>{" "}
          {performance.workoutNote}
        </p>
      ) : null}
    </article>
  );
}
