"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartSeries } from "../domain/chart";

type MergedPoint = { date: string; value?: number; companion?: number };

/**
 * The chart is never the only representation of the data: the caller renders a
 * textual summary and an accessible list beside it. Nothing here needs hover,
 * and the line animation is left off so reduced-motion preferences hold.
 *
 * A series may carry a companion drawn beside it, such as the weekly averages
 * beside the daily weigh-ins of `S19`. The two are told apart by a dash pattern
 * and a named legend rather than by color, and the legend is real text, because
 * the chart itself is hidden from assistive technology.
 */
export function ProgressChart({
  series,
  formatValue,
  frame = "zero",
}: {
  series: ChartSeries;
  /** Axis labels only; the values themselves stay as the domain produced them. */
  formatValue?: (value: number) => string;
  /** `data` frames the visible values, for a series that sits far from zero. */
  frame?: "zero" | "data";
}) {
  const companion = series.companion;
  const points = mergedPoints(series);
  if (points.length === 0) return null;

  return (
    <>
      {companion ? (
        <ul
          aria-label="Chart legend"
          className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[var(--pf-text-2)]"
        >
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-0 w-6 border-t-2 border-[var(--pf-accent-strong)]"
            />
            <span>{series.label}, solid line</span>
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-0 w-6 border-t-2 border-dashed border-[var(--pf-text-2)]"
            />
            <span>{companion.label}, dashed line</span>
          </li>
        </ul>
      ) : null}
      <div aria-hidden="true" className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={points}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid stroke="var(--pf-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--pf-text-3-deep)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--pf-border)" }}
              tickFormatter={(value: string) => value.slice(5)}
              minTickGap={16}
            />
            <YAxis
              width={40}
              // An assistance series improves downwards, so its axis is reversed
              // and the line still climbs towards better.
              reversed={series.lowerIsBetter}
              {...(frame === "data" ? { domain: ["auto", "auto"] } : {})}
              tick={{ fill: "var(--pf-text-3-deep)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--pf-accent-strong)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--pf-accent-strong)" }}
              isAnimationActive={false}
              connectNulls
            />
            {companion ? (
              <Line
                type="monotone"
                dataKey="companion"
                stroke="var(--pf-text-2)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 2.5, fill: "var(--pf-text-2)" }}
                isAnimationActive={false}
                connectNulls
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

/** One row per date, so two series share the axis without a second dataset. */
function mergedPoints(series: ChartSeries): MergedPoint[] {
  const byDate = new Map<string, MergedPoint>();
  for (const point of series.points) {
    byDate.set(point.date, {
      ...(byDate.get(point.date) ?? { date: point.date }),
      value: point.value,
    });
  }
  for (const point of series.companion?.points ?? []) {
    byDate.set(point.date, {
      ...(byDate.get(point.date) ?? { date: point.date }),
      companion: point.value,
    });
  }
  return [...byDate.values()].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}
