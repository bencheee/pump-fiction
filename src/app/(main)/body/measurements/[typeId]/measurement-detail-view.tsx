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
    <div>
      <TopBar
        title={type.name}
        backHref="/body/measurements"
        backLabel="Body"
      />
      <PageFrame title={type.name}>
        {/* The unit is a label under the name rather than a section of its
            own, which ADR-0030 decided. */}
        <p>Measured in centimetres</p>
        <div>
          <Link href={`/body/measurements/types/${type.id}/edit`}>
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
            <div>
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

            <section>
              <h2>Trend</h2>
              <div role="group" aria-label="Time range">
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
              <p>{trendSentence(series)}</p>
              <ProgressChart
                series={series}
                frame="data"
                formatValue={(value) => value.toFixed(1)}
              />
              <details>
                <summary>Chart values</summary>
                <ul aria-label="Chart values">
                  {series.points.map((point) => (
                    <li key={point.date}>
                      <span>{formatHistoryDate(point.date)}</span>
                      <span>{formatCm(point.value)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </section>

            <section>
              <h2>Entries</h2>
              <ul aria-label="Entries">
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
