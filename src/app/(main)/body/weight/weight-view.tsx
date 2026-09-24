"use client";

import { useMemo, useState, type CSSProperties } from "react";

import { defaultWeightRange } from "@/features/history/application/weight-operations";
import {
  rangeStart,
  type ChartRange,
  type ChartSeries,
} from "@/features/history/domain/chart";
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

import { barHeights } from "@/features/history/ui/chart-scale";

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
  /* The Owner's switch (2026-09-24): every day's weigh-in, or the average of
     each Monday-to-Sunday week. The prototype draws the days alone. */
  const [view, setView] = useState<ChartView>("daily");
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
        <div data-body-chips="" role="group" aria-label="Chart">
          {chartViews.map((option) => (
            <Chip
              key={option.key}
              selected={view === option.key}
              onClick={() => setView(option.key)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
        {view === "daily" ? (
          <BarChart
            variant="body"
            points={dailyPoints(
              series,
              range,
              overview.localDate,
              firstWeighIn(overview.entries),
            )}
            summary={dailySummary(series)}
            emptyMessage="No weigh-in falls inside this range."
            signature={`daily|${range}|${series.points.length}`}
          />
        ) : (
          <BarChart
            variant="body"
            points={weeklyPoints(series)}
            summary={weeklySummary(series)}
            emptyMessage="No week with a weigh-in falls inside this range."
            signature={`weekly|${range}|${series.companion?.points.length ?? 0}`}
          />
        )}

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

type ChartView = "daily" | "weekly";

const chartViews: readonly { key: ChartView; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly average" },
];

/**
 * Every day of the range, a weigh-in or not (Owner, 2026-09-24): a day with
 * none is an empty column, so a gap in the record shows as a gap. The range
 * starts no earlier than the first weigh-in the record holds, so a year does
 * not open on months before the record began. The heights are the shared chart scale's,
 * measured over the days that hold a weigh-in.
 */
function dailyPoints(
  series: ChartSeries,
  range: ChartRange,
  localDate: string,
  recordStart: string,
): readonly BarChartPoint[] {
  if (series.points.length === 0) return [];
  const byDate = new Map(
    series.points.map((point) => [point.date, point.value]),
  );
  const heights = barHeights(series.points.map((point) => point.value));
  const heightByDate = new Map(
    series.points.map((point, index) => [point.date, heights[index] ?? 0]),
  );
  const from = rangeStart(range, localDate);
  const start = from === null || recordStart > from ? recordStart : from;
  const days: BarChartPoint[] = [];
  for (let day = start; day <= localDate; day = nextDay(day)) {
    const value = byDate.get(day);
    const date = formatHistoryDate(day);
    days.push(
      value === undefined
        ? {
            key: day,
            date,
            value: "—",
            height: 6,
            empty: true,
            description: `${date} · No weigh-in`,
          }
        : {
            key: day,
            date,
            value: formatKg(value),
            height: heightByDate.get(day) ?? 0,
          },
    );
  }
  return days;
}

/** The earliest date the record holds a weigh-in for. */
function firstWeighIn(
  entries: readonly Readonly<{ entryDate: string }>[],
): string {
  return entries.reduce(
    (first, entry) => (entry.entryDate < first ? entry.entryDate : first),
    entries[0]?.entryDate ?? "",
  );
}

/**
 * The Monday-to-Sunday averages the series carries beside its days —
 * `MVP-WGT-003` — one bar a week, on the shared chart scale.
 */
function weeklyPoints(series: ChartSeries): readonly BarChartPoint[] {
  const weeks = series.companion?.points ?? [];
  const heights = barHeights(weeks.map((week) => week.value));
  return weeks.map((week, index) => {
    const date = `Week of ${formatHistoryDate(week.span?.start ?? week.date)}`;
    const value = formatAverageKg(week.value);
    return {
      key: week.span?.start ?? week.date,
      date,
      value,
      height: heights[index] ?? 0,
      description: `${date} · ${value}${week.span ? ` · ${formatRecordedDays(week.span.recordedDays)}${week.span.provisional ? " · provisional" : ""}` : ""}`,
    };
  });
}

/** `bSummary` (2624-2626), over the days that hold a weigh-in. */
function dailySummary(series: ChartSeries): string {
  const values = series.points.map((point) => point.value);
  if (values.length === 0) return "";
  const noun = values.length === 1 ? "weigh-in" : "weigh-ins";
  return `${values.length} ${noun} in range: ${formatKg(values[0])} to ${formatKg(values[values.length - 1])}, lowest ${formatKg(Math.min(...values))}, highest ${formatKg(Math.max(...values))}.`;
}

/** The same sentence over the weeks, each an average of the days it holds. */
function weeklySummary(series: ChartSeries): string {
  const values = (series.companion?.points ?? []).map((week) => week.value);
  if (values.length === 0) return "";
  const noun = values.length === 1 ? "week" : "weeks";
  return `${values.length} ${noun} in range: ${formatAverageKg(values[0])} to ${formatAverageKg(values[values.length - 1])}, lowest ${formatAverageKg(Math.min(...values))}, highest ${formatAverageKg(Math.max(...values))}.`;
}

function nextDay(date: string): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}
