"use client";

import { useMemo, useState, type CSSProperties } from "react";

import { defaultWeightRange } from "@/features/history/application/weight-operations";
import type { ChartRange, ChartSeries } from "@/features/history/domain/chart";
import {
  weightSeries,
  type WeightOverview,
} from "@/features/history/domain/weight";
import {
  formatAverageKg,
  formatChangeKg,
  formatKg,
  formatRecordedDays,
  noPreviousWeek,
  weekStatusLabel,
} from "@/features/history/ui/weight-presentation";
import {
  BarChart,
  Chip,
  Icon,
  StatCard,
  TabbedCount,
  TabbedPanel,
  type BarChartPoint,
} from "@/shared/ui";

import { formatHistoryDate } from "@/app/(main)/history/history-presentation";

import { BodyEntrySheet } from "../body-entry-sheet";

/*
 * Body's Weight tab — the prototype's screen 15, first tab — ported for step
 * 18 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 1022-1098, `data-screen-label="Body"`
 *   bound values  lines 2593-2638 (`bodyChart`), 3053-3068 (`bodyCount`,
 *                 `bwLatest` … `bwAdd`), 1730 (`B_RANGES`)
 *
 * The chips answer in the same frame, as the statistics screens' do: every
 * weigh-in is already on the screen, and `weightSeries` is the domain function
 * the server's own series is computed through.
 */

/** `B_RANGES` (line 1730): Weight offers no `all`. */
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

export function WeightView({ overview }: { overview: WeightOverview }) {
  /* `bodyRange: "quarter"` (line 1804): the chart opens on the quarter. */
  const [range, setRange] = useState<ChartRange>(defaultWeightRange);
  const series = useMemo(
    () => weightSeries(overview.entries, range, overview.localDate),
    [overview.entries, overview.localDate, range],
  );
  const { latest, currentWeek } = overview;
  const count = overview.entries.length;
  const saved = overview.entries.map((entry) => ({
    id: entry.id,
    date: entry.entryDate,
    value: entry.weightKg,
  }));
  const today = saved.find((entry) => entry.date === overview.localDate);

  return (
    <>
      <TabbedCount>
        {count} {count === 1 ? "weigh-in" : "weigh-ins"}
      </TabbedCount>
      <TabbedPanel>
        {/* `bwLatest`, `bwWeek` (lines 1024-1033, values at 3055-3061). */}
        <div data-stat-cards="">
          <StatCard
            label="Latest"
            value={latest === null ? "—" : formatKg(latest.weightKg)}
            detail={
              latest === null
                ? "No weigh-in yet"
                : `${formatHistoryDate(latest.entryDate)}${latest.changeKg === null ? "" : ` · ${formatChangeKg(latest.changeKg)} since the previous weigh-in`}`
            }
          />
          <StatCard
            label="This week"
            value={
              currentWeek === null
                ? "—"
                : formatAverageKg(currentWeek.averageKg)
            }
            detail={
              currentWeek === null
                ? "No weigh-in this week yet"
                : [
                    currentWeek.changeKg === null
                      ? noPreviousWeek
                      : `${formatChangeKg(currentWeek.changeKg)} vs last week`,
                    formatRecordedDays(currentWeek.recordedDays),
                    weekStatusLabel(currentWeek),
                  ].join(" · ")
            }
          />
        </div>

        <p data-body-eyebrow="">Trend</p>
        <div data-body-chips="" role="group" aria-label="Time range">
          {weightRanges.map((option) => (
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
          variant="body"
          points={barPoints(series)}
          summary={chartSummary(series)}
          emptyMessage="No weigh-in falls inside this range."
          signature={`${range}|${series.points.length}`}
          values={chartValues(series)}
        />

        <div data-body-list-head="">
          <p data-body-eyebrow="">Weigh-ins</p>
          {/* `bwAdd` (3068): today's weigh-in in the Body entry panel, or the
              one today already holds. */}
          <BodyEntrySheet
            target={{ kind: "weight", entry: today, saved }}
            localDate={overview.localDate}
            trigger={
              <button
                type="button"
                data-body-add="small"
                aria-label="Add weigh-in"
              >
                <Icon name="plus" size={14} />
                Add
              </button>
            }
          />
        </div>

        {count === 0 ? (
          <p data-note-card="">
            No weigh-in yet. Add today&apos;s and this screen starts tracking
            your weekly average.
          </p>
        ) : (
          <ul data-body-rows="">
            {overview.entries.map((entry, index) => {
              const date = formatHistoryDate(entry.entryDate);
              return (
                <li
                  key={entry.id}
                  style={{ "--row-index": Math.min(index, 9) } as CSSProperties}
                >
                  {/* `bwRows` (lines 1090-1096, values at 3062-3067): a press
                      opens the weigh-in in the Body entry panel. */}
                  <BodyEntrySheet
                    target={{
                      kind: "weight",
                      entry: {
                        id: entry.id,
                        date: entry.entryDate,
                        value: entry.weightKg,
                      },
                      saved,
                    }}
                    localDate={overview.localDate}
                    trigger={
                      <button
                        type="button"
                        data-body-entry=""
                        aria-label={`Edit weigh-in ${date}`}
                      >
                        <span>{formatKg(entry.weightKg)}</span>
                        <span>
                          {date}
                          {entry.changeKg === null
                            ? ""
                            : ` · ${formatChangeKg(entry.changeKg)}`}
                        </span>
                        <Icon name="pencil" size={15} />
                      </button>
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </TabbedPanel>
    </>
  );
}

/**
 * `b.h` (2613): the Body chart floats its base under the smallest value by
 * nine tenths of the spread, and never less than 0.4, so the spread fills the
 * track; a bar is never shorter than 6%.
 */
function barPoints(series: ChartSeries): readonly BarChartPoint[] {
  const values = series.points.map((point) => point.value);
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const base = min - Math.max(0.4, (max - min) * 0.9);
  const span = Math.max(0.001, max - base);
  return series.points.map((point) => ({
    key: point.date,
    date: formatHistoryDate(point.date),
    value: formatKg(point.value),
    height: Math.max(6, ((point.value - base) / span) * 100),
  }));
}

/** `bSummary` (2624-2626). */
function chartSummary(series: ChartSeries): string {
  const values = series.points.map((point) => point.value);
  if (values.length === 0) return "";
  const noun = values.length === 1 ? "weigh-in" : "weigh-ins";
  return `${values.length} ${noun} in range: ${formatKg(values[0])} to ${formatKg(values[values.length - 1])}, lowest ${formatKg(Math.min(...values))}, highest ${formatKg(Math.max(...values))}.`;
}

/**
 * `bValues` (2627): every weigh-in in range, newest first. The application's
 * series carries the Monday-to-Sunday averages beside them — `MVP-WGT-003` —
 * which the prototype's chart does not draw, so the list states them under
 * the weigh-ins rather than leave them unsaid.
 */
function chartValues(series: ChartSeries) {
  const daily = [...series.points].reverse().map((point) => ({
    key: point.date,
    date: formatHistoryDate(point.date),
    value: formatKg(point.value),
  }));
  const weekly = [...(series.companion?.points ?? [])]
    .reverse()
    .map((point) => ({
      key: `week-${point.span?.start ?? point.date}`,
      date: `Week of ${formatHistoryDate(point.span?.start ?? point.date)}${point.span ? ` · ${formatRecordedDays(point.span.recordedDays)}${point.span.provisional ? " · provisional" : ""}` : ""}`,
      value: formatAverageKg(point.value),
    }));
  return [...daily, ...weekly];
}
