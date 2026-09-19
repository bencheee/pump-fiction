"use client";

import { useState } from "react";

import { classNames } from "./class-names";
import { Collapsible, DataRow } from "./collapsible";

export type ChartPoint = Readonly<{
  /** `YYYY-MM-DD`, used only as a stable key. */
  date: string;
  dateLabel: string;
  value: number;
}>;

function summarize(
  points: readonly ChartPoint[],
  formatValue: (value: number) => string,
  noun: string,
): string {
  const values = points.map((point) => point.value);
  const first = values[0] ?? 0;
  const last = values.at(-1) ?? 0;
  const direction =
    last === first
      ? "Unchanged over this range."
      : last > first
        ? "Moving in the better direction."
        : "Below where the range started.";
  const count = `${points.length} ${noun}${points.length === 1 ? "" : "s"}`;

  return `${count} in range: ${formatValue(first)} to ${formatValue(last)}, best ${formatValue(Math.max(...values))}. ${direction}`;
}

/**
 * The redesign draws its own bars rather than a charting library. The reading
 * above the bars, the textual summary and the collapsible value list all carry
 * the same numbers, so nothing here depends on seeing or hovering the chart;
 * each bar is a real button, labelled with its date and value.
 */
export function BarChart({
  points,
  formatValue,
  noun = "workout",
  emptyMessage,
  height = 136,
  centred = false,
  valuesLabel = "Chart values",
}: {
  points: readonly ChartPoint[];
  formatValue: (value: number) => string;
  noun?: string;
  emptyMessage: string;
  height?: number;
  centred?: boolean;
  valuesLabel?: string;
}) {
  const [selected, setSelected] = useState<number>();

  if (points.length === 0) {
    return (
      <p className="text-center text-[14px] leading-[1.5] text-[var(--pf-text-3)] motion-safe:animate-[pf-fade-in_200ms_linear]">
        {emptyMessage}
      </p>
    );
  }

  const selectedIndex =
    selected !== undefined && selected < points.length
      ? selected
      : points.length - 1;
  const reading = points[selectedIndex];
  const max = Math.max(...points.map((point) => point.value));

  return (
    <div>
      <div
        key={`${selectedIndex}-${points.length}`}
        className="flex items-baseline justify-between gap-3 motion-safe:animate-[pf-readout-in_260ms_var(--pf-ease)]"
      >
        <span className="text-[13px] text-[var(--pf-text-3)]">
          {reading.dateLabel}
        </span>
        <span className="pf-numeric text-[24px] font-bold text-[var(--pf-accent)]">
          {formatValue(reading.value)}
        </span>
      </div>

      <div
        className={classNames(
          "mt-3.5 flex items-end gap-[5px]",
          centred && "justify-center",
        )}
        style={{ height }}
      >
        {points.map((point, index) => (
          <button
            key={`${point.date}-${index}`}
            type="button"
            onClick={() => setSelected(index)}
            aria-pressed={index === selectedIndex}
            aria-label={`${point.dateLabel} · ${formatValue(point.value)}`}
            className={classNames(
              "flex h-full min-w-0 flex-1 flex-col justify-end",
              centred && "max-w-[46px]",
            )}
          >
            <span
              aria-hidden="true"
              className="w-full origin-bottom rounded-t-[7px] rounded-b-[4px] transition-[background-color,height] duration-[var(--pf-mo-bar)] ease-[var(--pf-ease)] motion-safe:animate-[pf-bar-in_460ms_var(--pf-ease)_both]"
              style={{
                height: `${Math.max(5, max > 0 ? (point.value / max) * 100 : 0)}%`,
                backgroundColor:
                  index === selectedIndex
                    ? "var(--pf-accent)"
                    : "var(--pf-bg-surface-4)",
                animationDelay: `${Math.min(index, 9) * 26}ms`,
              }}
            />
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="pf-numeric text-[12.5px] text-[var(--pf-text-4)]">
          {points[0].dateLabel}
        </span>
        <span className="pf-numeric text-[12.5px] text-[var(--pf-text-4)]">
          {points.at(-1)?.dateLabel}
        </span>
      </div>

      <p className="mt-3.5 text-[13px] leading-[1.5] text-[var(--pf-text-3)]">
        {summarize(points, formatValue, noun)}
      </p>

      <div className="mt-1.5">
        <Collapsible label={valuesLabel}>
          <div className="flex flex-col">
            {[...points].reverse().map((point, index) => (
              <DataRow
                key={`${point.date}-value-${index}`}
                first={index === 0}
                label={point.dateLabel}
                value={formatValue(point.value)}
              />
            ))}
          </div>
        </Collapsible>
      </div>
    </div>
  );
}
