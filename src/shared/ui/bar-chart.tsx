"use client";

import { useState, type CSSProperties } from "react";

import { Disclosure } from "./disclosure";
import "./bar-chart.css";

/*
 * The chart card, ported from the prototype for step 11 of
 * docs/design/redesign-v2/PLAN.md. It replaces the Recharts line for the
 * screens that have been ported; the Owner chose custom bars on 2026-09-19.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 541-581, `data-screen-label="Exercise statistics"`
 *   bound values  lines 2361-2402 (`chart()`)
 *
 * Exercise statistics (line 541) and Split statistics (639) write the card
 * byte for byte the same, so it is one surface from here on and step 12 takes
 * this one. The Body pair (1044) writes three declarations of its own — the
 * bars are centred, 4px apart and capped at 46px wide, and their corners are
 * 6px — which steps 18 and 19 add as a variant rather than a second card.
 *
 * What a point is worth is never decided here: the caller hands over the
 * formatted value and the height it stands at, as ADR-0020 requires of a chart
 * component. The summary sentence and the values list under the bars are the
 * caller's words too, so the chart is never the only representation of what it
 * draws.
 */

export type BarChartPoint = Readonly<{
  key: string;
  /** The date, as the reading, the axis ends and the values list write it. */
  date: string;
  /** The value, formatted, as the reading and the values list write it. */
  value: string;
  /** How tall the bar stands, 0 to 100; the caller's own scale decides it. */
  height: number;
}>;

export function BarChart({
  points,
  summary,
  emptyMessage,
  signature,
  variant,
  values,
}: {
  points: readonly BarChartPoint[];
  /** The sentence under the bars; empty when there is nothing to say. */
  summary: string;
  /** What the card says in place of the bars when the range holds nothing. */
  emptyMessage: string;
  /**
   * What is being drawn. `chart()` builds the same signature (line 2364) and
   * the entrance replays whenever it changes — a metric, a range, a different
   * exercise — which is also when the prototype drops the selection.
   */
  signature: string;
  /**
   * `body` is the Body pair's card (lines 1044-1052): the bars are centred,
   * 4px apart and at most 46px wide, their corners 6px over 3px, and they
   * arrive 22ms apart rather than 26 (`bodyChart`, 2616).
   */
  variant?: "body";
  /**
   * What the Chart values list holds, newest first, when it says more than
   * the bars do; the bars' own points otherwise.
   */
  values?: readonly Readonly<{ key: string; date: string; value: string }>[];
}) {
  const [picked, setPicked] = useState<{
    signature: string;
    index: number;
  } | null>(null);
  // `selIdx` (2366): the reading opens on the most recent point and stays on
  // whatever was pressed, unless the data under it changed.
  const selected =
    picked !== null &&
    picked.signature === signature &&
    picked.index < points.length
      ? picked.index
      : points.length - 1;

  // `seq("bars", sig)` and `seq("read", …)` (2365, 2380): each animation is
  // written as an `A`/`B` pair so that re-running it restarts it, which one
  // name alone would not.
  const barPair = useAlternation(signature);
  const readPair = useAlternation(`${selected}|${signature}`);

  if (points.length === 0)
    return (
      <section data-bar-chart={variant ?? ""}>
        <p data-bar-chart-empty="">{emptyMessage}</p>
      </section>
    );

  const reading = points[selected];

  return (
    <section data-bar-chart={variant ?? ""}>
      <div data-bar-chart-reading="" data-read-anim={readPair}>
        <span>{reading.date}</span>
        <span>{reading.value}</span>
      </div>

      <div data-bar-chart-bars="" data-bar-anim={barPair}>
        {points.map((point, index) => (
          <button
            key={point.key}
            type="button"
            aria-label={`${point.date} · ${point.value}`}
            title={`${point.date} · ${point.value}`}
            aria-pressed={index === selected}
            onClick={() => setPicked({ signature, index })}
            style={
              {
                "--bar-height": `${point.height}%`,
                "--bar-index": Math.min(index, 9),
              } as CSSProperties
            }
          >
            <span />
          </button>
        ))}
      </div>

      <div data-bar-chart-axis="">
        <span>{points[0].date}</span>
        <span>{points[points.length - 1].date}</span>
      </div>

      <p data-bar-chart-summary="">{summary}</p>

      {/* `chartValues` (2392): newest first, which is the order the list above
          the chart reads in and the reverse of the bars' own. */}
      <Disclosure label="Chart values">
        {(values ?? [...points].reverse()).map((point) => (
          <li key={point.key}>
            <span>{point.date}</span>
            <span>{point.value}</span>
          </li>
        ))}
      </Disclosure>
    </section>
  );
}

/** `seq()` (prototype line 2317): a counter that flips the `A`/`B` pair. */
function useAlternation(signature: string): "A" | "B" {
  const [memory, setMemory] = useState(() => ({ signature, n: 0 }));
  if (memory.signature !== signature) setMemory({ signature, n: memory.n + 1 });
  return memory.n % 2 ? "B" : "A";
}
