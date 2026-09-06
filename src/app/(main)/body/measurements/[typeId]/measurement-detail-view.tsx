"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { getMeasurementProgressAction } from "@/app/actions/body";
import type { MeasurementProgress } from "@/features/history/application/body-operations";
import type { ChartRange, ChartSeries } from "@/features/history/domain/chart";
import {
  formatChangeCm,
  formatCm,
  noPreviousMeasurement,
  noTotalChange,
} from "@/features/history/ui/body-presentation";
import { ProgressChart } from "@/features/history/ui/progress-chart";
import {
  Chip,
  EmptyState,
  ListRow,
  PageFrame,
  StatCard,
  TopBar,
} from "@/shared/ui";

import { formatHistoryDate } from "@/app/(main)/history/history-presentation";

/** Body offers no `week` range; `weight-and-body.md` names these four. */
const bodyRanges: readonly ChartRange[] = ["month", "quarter", "year", "all"];

const rangeLabels: Readonly<Record<ChartRange, string>> = {
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
  all: "All",
};

export function MeasurementDetailView({
  progress,
  initialRange,
}: {
  progress: MeasurementProgress;
  initialRange: ChartRange;
}) {
  const [view, setView] = useState(progress);
  const [range, setRange] = useState<ChartRange>(initialRange);
  const [pending, startTransition] = useTransition();
  const { detail, series } = view;
  const { type } = detail;

  const reload = (next: ChartRange) => {
    setRange(next);
    startTransition(async () => {
      const result = await getMeasurementProgressAction(type.id, {
        range: next,
      });
      if (result.ok) setView(result.value);
    });
  };

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title={type.name}
        backHref="/body/measurements"
        backLabel="Body"
      />
      <PageFrame title={type.name} className="pt-5">
        {/* The unit is a label under the name rather than a section of its
            own, which ADR-0030 decided. */}
        <p className="-mt-2 text-[12.5px] text-[var(--pf-text-2)]">
          Measured in centimetres
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Link
            href={`/body/measurements/types/${type.id}/edit`}
            className="flex min-h-11 items-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 font-semibold text-[var(--pf-text-2)]"
          >
            Edit measurement
          </Link>
        </div>

        {detail.latest === null ? (
          <EmptyState
            title="Nothing recorded yet"
            body="Record this measurement on Today and this screen starts tracking how it changes."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                label="Latest"
                value={formatCm(detail.latest.valueCm)}
                detail={formatHistoryDate(detail.latest.entryDate)}
              />
              <StatCard
                label="Latest change"
                value={
                  detail.latest.changeCm === null
                    ? "—"
                    : formatChangeCm(detail.latest.changeCm)
                }
                detail={
                  detail.latest.changeCm === null
                    ? noPreviousMeasurement
                    : "since the one before it"
                }
              />
              <StatCard
                label="Total change"
                value={
                  detail.totalChangeCm === null
                    ? "—"
                    : formatChangeCm(detail.totalChangeCm)
                }
                detail={
                  detail.totalChangeCm === null
                    ? noTotalChange
                    : "since the first entry"
                }
              />
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
                {bodyRanges.map((option) => (
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
              <p className="text-[13px] text-[var(--pf-text-2)]">
                {trendSentence(series)}
              </p>
              <ProgressChart
                series={series}
                frame="data"
                formatValue={(value) => value.toFixed(1)}
              />
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
                      <span>{formatCm(point.value)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
                Entries
              </h2>
              <ul className="flex flex-col gap-2" aria-label="Entries">
                {detail.entries.map((entry) => (
                  <li key={entry.id}>
                    <ListRow
                      href={`/body/measurements/${type.id}/${entry.entryDate}/edit`}
                      title={formatCm(entry.valueCm)}
                      detail={
                        <>
                          {formatHistoryDate(entry.entryDate)}
                          {entry.changeCm === null
                            ? ` · ${noPreviousMeasurement}`
                            : ` · ${formatChangeCm(entry.changeCm)}`}
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
    </div>
  );
}

/** One string, so the sentence reads the same however JSX would break the line. */
function trendSentence(series: ChartSeries): string {
  if (series.points.length === 0) return "No entry falls inside this range.";
  const values = series.points.map((point) => point.value);
  const count = series.points.length;
  return `${count} ${count === 1 ? "entry" : "entries"} from ${formatCm(values[0] ?? 0)} to ${formatCm(values[values.length - 1] ?? 0)}, lowest ${formatCm(Math.min(...values))}, highest ${formatCm(Math.max(...values))}.`;
}
