"use client";

import { BarChart } from "@/shared/ui";

import type { ChartSeries } from "../domain/chart";

/**
 * The chart is never the only representation of the data: the reading above the
 * bars, the sentence under them and the collapsible value list all carry the
 * same numbers, and every bar is a labelled button, so nothing here depends on
 * hover or on seeing the drawing, as [ADR-0020] requires.
 *
 * The redesign draws bars rather than a line, so a companion series has no
 * place on the axis any more. Weight shows its weekly average in the stat tile
 * beside the chart instead.
 */
export function ProgressChart({
  series,
  formatValue = String,
  noun = "workout",
  nounPlural,
  emptyMessage = "No workout falls inside this range.",
}: {
  series: ChartSeries;
  formatValue?: (value: number) => string;
  /** What one point counts, for the summary sentence. */
  noun?: string;
  nounPlural?: string;
  emptyMessage?: string;
}) {
  return (
    <BarChart
      points={series.points.map((point) => ({
        date: point.date,
        dateLabel: formatChartDate(point.date),
        value: point.value,
      }))}
      formatValue={formatValue}
      noun={noun}
      nounPlural={nounPlural}
      lowerIsBetter={series.lowerIsBetter}
      emptyMessage={emptyMessage}
    />
  );
}

export function formatChartDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${value}T00:00:00Z`))
    .replace(",", "");
}
