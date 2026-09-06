"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { getWeightProgressAction } from "@/app/actions/weight";
import type { WeightProgress } from "@/features/history/application/weight-operations";
import type { ChartRange, ChartSeries } from "@/features/history/domain/chart";
import { ProgressChart } from "@/features/history/ui/progress-chart";
import {
  Chip,
  EmptyState,
  Icon,
  ListRow,
  PageFrame,
  StatCard,
} from "@/shared/ui";

import { formatHistoryDate } from "../history-presentation";
import {
  formatAverageKg,
  formatChangeKg,
  formatKg,
  formatRecordedDays,
  noPreviousWeek,
  weekStatusLabel,
} from "./weight-presentation";

/** Weight offers no `all` range; `weight-and-body.md` names these four. */
const weightRanges: readonly ChartRange[] = [
  "week",
  "month",
  "quarter",
  "year",
];

const rangeLabels: Readonly<Record<ChartRange, string>> = {
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
  all: "All",
};

export function WeightView({
  progress,
  initialRange,
}: {
  progress: WeightProgress;
  initialRange: ChartRange;
}) {
  const [view, setView] = useState(progress);
  const [range, setRange] = useState<ChartRange>(initialRange);
  const [pending, startTransition] = useTransition();
  const { overview, series } = view;

  const reload = (next: ChartRange) => {
    setRange(next);
    startTransition(async () => {
      const result = await getWeightProgressAction({ range: next });
      if (result.ok) setView(result.value);
    });
  };

  return (
    <PageFrame title="Weight" className="pt-6">
      {/* The History subsection bar owns the top of the screen, so the add
          action sits in the flow rather than floating over it. */}
      <div className="-mt-2 flex justify-end">
        <Link
          href="/history/weight/new"
          className="flex min-h-11 items-center gap-2 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 font-semibold text-[var(--pf-accent-strong)]"
        >
          <Icon name="plus" size={18} />
          Add weigh-in
        </Link>
      </div>

      {overview.latest === null ? (
        <EmptyState
          title="No weigh-in yet"
          body="Add today's weight and this screen starts tracking your weekly average."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Latest"
              value={formatKg(overview.latest.weightKg)}
              detail={
                <>
                  {formatHistoryDate(overview.latest.entryDate)}
                  {overview.latest.changeKg === null
                    ? null
                    : ` · ${formatChangeKg(overview.latest.changeKg)} since the previous weigh-in`}
                </>
              }
            />
            {overview.currentWeek ? (
              <StatCard
                label="This week"
                value={formatAverageKg(overview.currentWeek.averageKg)}
                detail={
                  <>
                    {overview.currentWeek.changeKg === null
                      ? noPreviousWeek
                      : `${formatChangeKg(overview.currentWeek.changeKg)} vs last week`}
                    {" · "}
                    {formatRecordedDays(overview.currentWeek.recordedDays)}
                    {" · "}
                    {weekStatusLabel(overview.currentWeek)}
                  </>
                }
              />
            ) : (
              <StatCard
                label="This week"
                value="—"
                detail="No weigh-in this week yet"
              />
            )}
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
              Trend
            </h2>
            <div
              role="group"
              aria-label="Time range"
              className="flex flex-wrap gap-2"
            >
              {weightRanges.map((option) => (
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
            <TrendSummary series={series} />
            <ProgressChart
              series={series}
              frame="data"
              formatValue={(value) => value.toFixed(1)}
            />
            <ChartValues series={series} />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
              Weigh-ins
            </h2>
            <ul className="flex flex-col gap-2" aria-label="Weigh-ins">
              {overview.entries.map((entry) => (
                <li key={entry.id}>
                  <ListRow
                    href={`/history/weight/${entry.entryDate}/edit`}
                    title={formatKg(entry.weightKg)}
                    detail={
                      <>
                        {formatHistoryDate(entry.entryDate)}
                        {entry.changeKg === null
                          ? null
                          : ` · ${formatChangeKg(entry.changeKg)}`}
                      </>
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </PageFrame>
  );
}

function TrendSummary({ series }: { series: ChartSeries }) {
  if (series.points.length === 0)
    return (
      <p className="text-[var(--pf-text-2)]">
        No weigh-in falls inside this range.
      </p>
    );
  return (
    <p className="text-[13px] text-[var(--pf-text-2)]">
      {trendSentence(series)}
    </p>
  );
}

/** One string, so the sentence reads the same however JSX would break the line. */
function trendSentence(series: ChartSeries): string {
  const values = series.points.map((point) => point.value);
  const count = series.points.length;
  const weeks = series.companion?.points.length ?? 0;
  const span = `${count} ${count === 1 ? "weigh-in" : "weigh-ins"} from ${formatKg(values[0] ?? 0)} to ${formatKg(values[values.length - 1] ?? 0)}`;
  const bounds = `lowest ${formatKg(Math.min(...values))}, highest ${formatKg(Math.max(...values))}`;
  const averages =
    weeks === 0
      ? ""
      : `, across ${weeks} ${weeks === 1 ? "week" : "weeks"} of averages`;
  return `${span}, ${bounds}${averages}.`;
}

function ChartValues({ series }: { series: ChartSeries }) {
  const weekly = series.companion?.points ?? [];
  return (
    <details>
      <summary className="min-h-11 text-[13px] font-semibold text-[var(--pf-accent-strong)]">
        Chart values
      </summary>
      <ul
        aria-label="Chart values"
        className="pf-numeric mt-1 flex flex-col gap-1 text-[13px]"
      >
        {series.points.map((point) => (
          <li key={point.date} className="flex justify-between gap-3">
            <span>{formatHistoryDate(point.date)}</span>
            <span>{formatKg(point.value)}</span>
          </li>
        ))}
      </ul>
      {weekly.length > 0 ? (
        <ul
          aria-label="Weekly averages"
          className="pf-numeric mt-3 flex flex-col gap-1 text-[13px]"
        >
          {weekly.map((point) => (
            <li key={point.date} className="flex justify-between gap-3">
              <span>
                Week of {formatHistoryDate(point.span?.start ?? point.date)}
                {point.span
                  ? ` · ${formatRecordedDays(point.span.recordedDays)}${point.span.provisional ? " · provisional" : ""}`
                  : null}
              </span>
              <span>{formatAverageKg(point.value)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}
