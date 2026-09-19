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
import { Badge, Chip, EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { formatHistoryDate } from "../../history-presentation";
import { ProgressChart } from "@/features/history/ui/progress-chart";

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
    <div>
      <TopBar
        title={view.exerciseName}
        backHref="/history/exercises"
        backLabel="Exercises"
      />
      <PageFrame title={view.exerciseName}>
        {view.stillInLibrary ? null : (
          <p>
            <Badge>No longer in the library</Badge>
          </p>
        )}

        <section>
          <h2>Latest performance</h2>
          {view.latestPerformance === null ? (
            <p>Nothing counts yet. Complete a workout with recorded sets.</p>
          ) : (
            <p>
              {formatHistoryDate(view.latestPerformance.workoutDate)} ·{" "}
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
          )}
        </section>

        <section>
          <h2>Personal records</h2>
          {view.categories.length === 0 ? (
            <p>Records appear once a completed workout holds a recorded set.</p>
          ) : (
            view.categories.map((entry) => (
              <section
                key={entry.category.key}
                aria-label={entry.category.label}
              >
                <h3>{entry.category.label}</h3>
                <dl>
                  {entry.records.map((record) => (
                    <RecordRow key={record.key} record={record} />
                  ))}
                </dl>
                {entry.repsByLoad.length > 0 ? (
                  <details>
                    <summary>Highest reps at each load</summary>
                    <ul
                      aria-label={`Highest reps at each load, ${entry.category.label}`}
                    >
                      {entry.repsByLoad.map((row) => (
                        <li key={row.load}>
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

        <section>
          <h2>Progress</h2>
          {view.metrics.length === 0 ? (
            <EmptyState
              title="No chart yet"
              body="A completed workout with recorded sets starts the chart."
            />
          ) : (
            <>
              <div role="group" aria-label="Metric">
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
              <div role="group" aria-label="Time range">
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
                <summary>Chart values</summary>
                <ul aria-label="Chart values">
                  {view.series.points.map((point) => (
                    <li key={point.workoutId}>
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

        <section>
          <h2>All performances</h2>
          <ul>
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
      <dt>
        {record.label}
        {record.lowerIsBetter ? <span>(less is better)</span> : null}
      </dt>
      <dd>
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
    </>
  );
}

function ChartSummary({ series }: { series: ChartSeries }) {
  if (series.points.length === 0)
    return <p>No workout falls inside this range.</p>;
  const values = series.points.map((point) => point.value);
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const best = series.lowerIsBetter ? Math.min(...values) : Math.max(...values);
  const improved = series.lowerIsBetter ? last < first : last > first;

  return (
    <p>
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
  const sets = performance.sets
    .filter((set) => set.loadMode !== null && set.reps !== null)
    .map((set) => formatSetSummary(set, performance.measurementType));

  return (
    <article>
      <div>
        <Link href={`/history/workouts/${performance.workoutId}`}>
          {formatHistoryDate(performance.workoutDate)} ·{" "}
          {performance.workoutName}
        </Link>
      </div>
      <p>{sets.length > 0 ? sets.join(", ") : "No recorded set"}</p>
      {performance.workoutNote ? (
        <p>
          <span>Workout note:</span> {performance.workoutNote}
        </p>
      ) : null}
    </article>
  );
}
