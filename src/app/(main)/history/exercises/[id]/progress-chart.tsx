"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartSeries } from "@/features/history/domain/exercise-statistics";

/**
 * The chart is never the only representation of the data: the caller renders a
 * textual summary and an accessible list beside it. Nothing here needs hover,
 * and the line animation is left off so reduced-motion preferences hold.
 */
export function ProgressChart({ series }: { series: ChartSeries }) {
  if (series.points.length === 0) return null;

  return (
    <div aria-hidden="true" className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={[...series.points]}
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
            tick={{ fill: "var(--pf-text-3-deep)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--pf-accent-strong)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--pf-accent-strong)" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
