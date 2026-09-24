"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type CSSProperties } from "react";

import {
  defaultMeasurementRange,
  type MeasurementProgress,
} from "@/features/history/application/body-operations";
import { measurementSeries } from "@/features/history/domain/body";
import type { ChartRange, ChartSeries } from "@/features/history/domain/chart";
import {
  formatChangeCm,
  formatCm,
} from "@/features/history/ui/body-presentation";
import {
  Action,
  BarChart,
  Chip,
  Icon,
  TopBar,
  type BarChartPoint,
} from "@/shared/ui";

import { formatHistoryDate } from "@/app/(main)/history/history-presentation";

/*
 * The Measurement detail — the prototype's screen 16 — ported for step 19 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 1126-1186, `data-screen-label="Measurement"`
 *   bound values  lines 2593-2638 (`bodyChart`), 3082-3094 (`bdName` …
 *                 `bdRecord`), 1730 (`B_RANGES`)
 *
 * The chips answer in the same frame, as Body's weight chart does:
 * `measurementSeries` is the domain function the server's own series goes
 * through, and every entry is already on the screen.
 */

/** `B_RANGES` (line 1730), which the prototype's measurement shares. */
const bodyRanges: readonly ChartRange[] = ["week", "month", "quarter", "year"];

const rangeLabels: Readonly<Record<ChartRange, string>> = {
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
  all: "All",
};

export function MeasurementDetailView({
  progress,
}: {
  progress: MeasurementProgress;
}) {
  const router = useRouter();
  const { detail, localDate } = progress;
  const { type, latest, entries } = detail;
  /* `bPush` (2513) opens a measurement on the quarter. */
  const [range, setRange] = useState<ChartRange>(defaultMeasurementRange);
  const series = useMemo(
    () => measurementSeries(entries, range, localDate),
    [entries, range, localDate],
  );

  return (
    <div data-measurement="">
      <TopBar
        screen="measurement"
        title={type.name}
        backHref="/body/measurements"
        backLabel="Back"
        trailing={
          // Renaming and deleting the measurement, which the prototype's
          // screen has no control for; `MVP-BOD-001` asks for both.
          <Link
            href={`/body/measurements/types/${type.id}/edit`}
            data-variant="row-icon"
            data-measurement-edit=""
            aria-label="Edit measurement"
            title="Edit measurement"
          >
            <Icon name="pencil" size={17} />
          </Link>
        }
      />

      <div data-measurement-body="">
        <h2 data-measurement-name="">{type.name}</h2>

        {/* `bdLatest` and `bdLatestDetail` (lines 1136-1140, values at
            3085-3086). */}
        <section data-measurement-latest="">
          <p>Latest</p>
          <p>{latest === null ? "—" : formatCm(latest.valueCm)}</p>
          <p>{latestDetail(progress)}</p>
        </section>

        <p data-body-eyebrow="">Trend</p>
        <div data-body-chips="" role="group" aria-label="Time range">
          {bodyRanges.map((option) => (
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
          variant="measure"
          points={barPoints(series)}
          summary={chartSummary(series)}
          emptyMessage="No entry falls inside this range."
          signature={`${range}|${series.points.length}`}
        />

        <p data-body-eyebrow="">Entries</p>
        {entries.length === 0 ? (
          <p data-note-card="">
            Nothing recorded yet. Record the first entry to start tracking how
            it changes.
          </p>
        ) : (
          <ul data-body-rows="">
            {entries.map((entry, index) => {
              const date = formatHistoryDate(entry.entryDate);
              return (
                <li
                  key={entry.id}
                  style={{ "--row-index": Math.min(index, 9) } as CSSProperties}
                >
                  {/* `bdRows` (lines 1171-1177, values at 3087-3093): the
                      weigh-in row Body's weight tab draws. */}
                  <Link
                    href={`/body/measurements/${type.id}/${entry.entryDate}/edit`}
                    data-body-entry=""
                    aria-label={`Edit entry ${date}`}
                  >
                    <span>{formatCm(entry.valueCm)}</span>
                    <span>
                      {date}
                      {entry.changeCm === null
                        ? ""
                        : ` · ${formatChangeCm(entry.changeCm)}`}
                    </span>
                    <Icon name="pencil" size={15} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* `bdRecord` (line 1182, value at 3094): the shared commit pill. */}
      <div data-measurement-footer="">
        <Action
          variant="commit"
          aria-label="Record measurement"
          title="Record measurement"
          onClick={() => router.push(`/body/measurements/${type.id}/new`)}
        >
          <Icon name="plus" size={18} />
          Record measurement
        </Action>
      </div>
    </div>
  );
}

/**
 * `bdLatestDetail` (3086): the date and the change since the entry before.
 * `MVP-BOD-003` asks for the change since the first entry as well, which the
 * prototype does not state; it follows as one more clause.
 */
function latestDetail(progress: MeasurementProgress): string {
  const { latest, totalChangeCm, entries } = progress.detail;
  if (latest === null) return "Nothing recorded yet";
  const parts = [formatHistoryDate(latest.entryDate)];
  if (latest.changeCm !== null)
    parts.push(`${formatChangeCm(latest.changeCm)} since the previous entry`);
  if (totalChangeCm !== null && entries.length > 2)
    parts.push(`${formatChangeCm(totalChangeCm)} since the first`);
  return parts.join(" · ");
}

/** `b.h` (2613): the Body chart's floated base, never under 6%. */
function barPoints(series: ChartSeries): readonly BarChartPoint[] {
  const values = series.points.map((point) => point.value);
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const base = min - Math.max(0.4, (max - min) * 0.9);
  const span = Math.max(0.001, max - base);
  return series.points.map((point) => ({
    key: point.date,
    date: formatHistoryDate(point.date),
    value: formatCm(point.value),
    height: Math.max(6, ((point.value - base) / span) * 100),
  }));
}

/** `bSummary` (2624-2626), with the measurement's own noun. */
function chartSummary(series: ChartSeries): string {
  const values = series.points.map((point) => point.value);
  if (values.length === 0) return "";
  const noun = values.length === 1 ? "entry" : "entries";
  return `${values.length} ${noun} in range: ${formatCm(values[0])} to ${formatCm(values[values.length - 1])}, lowest ${formatCm(Math.min(...values))}, highest ${formatCm(Math.max(...values))}.`;
}
