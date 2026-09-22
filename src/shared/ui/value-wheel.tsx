"use client";

import type { PointerEvent } from "react";
import { useRef, useState } from "react";

import "./value-wheel.css";

/*
 * The value wheel, ported from the prototype for step 4 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP. The wheel is a shared
 * surface, not one screen's: the Active set queue writes it at lines 181-207
 * and the Correct set overlay writes it again at lines 709-733, declaration for
 * declaration, and only the unit text differs (`{{ loadUnit }}` there, a
 * literal `kg` here). Its behaviour comes from `adjust()` (lines 1855-1870) and
 * `onDragMove()` (lines 3524-3532).
 *
 * The column is five rows tall: two candidates above the value, the value in an
 * 80px window, two candidates below. Pressing a candidate moves the column by
 * that many steps; dragging moves it one step per 34px. Both clamp at the ends
 * of the column, and both replay the same 170ms slide, alternating the A/B pair
 * so a second move in the same direction restarts it.
 */

export type ValueWheelProps = {
  /** The two boxes the prototype draws: 132px for a load, 112px for reps. */
  kind: "load" | "reps";
  /** Names the wheel for assistive technology; the prototype names neither. */
  label: string;
  /** The candidate values, ascending. */
  column: readonly number[];
  /** The committed value, or null when the set carries none yet. */
  value: number | null;
  /**
   * Where the column sits while the value is null. `renderVals` (line 3155)
   * puts the load column at index 0 and the reps column at 8.
   */
  fallbackIndex: number;
  /**
   * What the wheel offers while the set holds no value of its own: the number
   * is shown rather than the em dash, and the column rests on it, so the
   * primary action can take it as it stands (Owner, 2026-09-21). Null when
   * there is nothing to offer, and the wheel falls back to `fallbackIndex`.
   */
  suggested?: number | null;
  /** The small word beside the numeral: `kg`, `+kg`, `reps`, `sec`. */
  unit: string;
  format?: (value: number) => string;
  onChange: (value: number) => void;
};

/** One step of the drag, in pixels. `onDragMove` divides by 34. */
const dragStepPx = 34;

export function ValueWheel({
  kind,
  label,
  column,
  value,
  fallbackIndex,
  suggested = null,
  unit,
  format = String,
  onChange,
}: ValueWheelProps) {
  // `wheelAnim` in the prototype: a direction and a counter, so the A/B pair
  // alternates and the animation restarts on a node that never unmounts.
  const [anim, setAnim] = useState<{ dir: "Up" | "Down"; n: number }>();
  // The steps an in-flight drag has travelled. The prototype commits every
  // step; here the value is committed when the finger lifts, so one drag is one
  // command rather than one per 34px.
  const [dragged, setDragged] = useState(0);
  const drag = useRef<{ y: number; captured: boolean }>(null);

  const suggestedIndex = suggested === null ? -1 : column.indexOf(suggested);
  const offering = value === null && suggestedIndex >= 0;
  const committedIndex =
    value !== null
      ? Math.max(0, column.indexOf(value))
      : offering
        ? suggestedIndex
        : fallbackIndex;
  const index = clamp(committedIndex + dragged, column.length);
  const at = (offset: number): number | undefined => column[index + offset];

  function slide(delta: number) {
    setAnim((current) => ({
      dir: delta > 0 ? "Down" : "Up",
      n: (current?.n ?? 0) + 1,
    }));
  }

  function press(delta: number) {
    slide(delta);
    const next = column[clamp(index + delta, column.length)];
    if (next !== undefined && next !== value) onChange(next);
  }

  function dragMove(event: PointerEvent<HTMLDivElement>) {
    const from = drag.current;
    if (from === null) return;
    const steps = Math.trunc((event.clientY - from.y) / dragStepPx);
    if (steps === 0) return;
    /*
     * The prototype captures the pointer for its row drag and not for the
     * wheel, because the wheel commits on every step and losing the pointer up
     * costs it nothing. This one commits when the finger lifts, and a wheel is
     * 196px tall, so a drag that leaves the box has to keep reporting to it or
     * the value it is showing is never written down.
     *
     * The capture waits for the first step rather than taking the pointer down
     * with it: a capture retargets the pointer up, and with it the click the
     * browser derives from the pair, so a wheel that captures on the press
     * swallows every press on a candidate above or below the value — step 10
     * found the five buttons of each wheel unpressable.
     */
    if (!from.captured) {
      from.captured = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    from.y += steps * dragStepPx;
    slide(-steps);
    setDragged(
      (current) =>
        clamp(committedIndex + current - steps, column.length) - committedIndex,
    );
  }

  function dragEnd() {
    if (drag.current === null) return;
    drag.current = null;
    if (dragged === 0) return;
    setDragged(0);
    const next = column[index];
    if (next !== undefined && next !== value) onChange(next);
  }

  return (
    <div
      role="group"
      aria-label={label}
      data-wheel={kind}
      onPointerDown={(event) => {
        drag.current = { y: event.clientY, captured: false };
      }}
      onPointerMove={dragMove}
      onPointerUp={dragEnd}
      onPointerCancel={dragEnd}
    >
      <div data-wheel-window="" />
      <div
        data-wheel-column=""
        data-wheel-anim={
          anim ? `wheel${anim.dir}${anim.n % 2 ? "A" : "B"}` : undefined
        }
      >
        <Candidate
          distance="far"
          value={at(-2)}
          format={format}
          onPress={() => press(-2)}
        />
        <Candidate
          distance="near"
          value={at(-1)}
          format={format}
          onPress={() => press(-1)}
        />
        <span data-wheel-value="">
          {/* `kg0` (line 3356) writes an em dash while the set holds no
              value. A drag in progress is showing a candidate, not the
              absence, and so is an offer. */}
          {value === null && dragged === 0 && !offering
            ? "—"
            : format(column[index] ?? 0)}
          <span data-wheel-unit="">{unit}</span>
          {/* The offer looks exactly like an entered value, because it is the
              one the primary action will write. Say which it is to anything
              that cannot see the segment bar. */}
          {offering && dragged === 0 ? (
            <span data-wheel-offer="">, suggested</span>
          ) : null}
        </span>
        <Candidate
          distance="near"
          value={at(1)}
          format={format}
          onPress={() => press(1)}
        />
        <Candidate
          distance="far"
          value={at(2)}
          format={format}
          onPress={() => press(2)}
        />
      </div>
    </div>
  );
}

/*
 * A candidate above or below the value. The prototype gives each one an
 * `aria-label` equal to its own text, so the accessible name is the number
 * either way. At the ends of the column it draws an empty button; the app draws
 * the same empty box without a control in it, so nothing focusable is nameless.
 */
function Candidate({
  distance,
  value,
  format,
  onPress,
}: {
  distance: "near" | "far";
  value: number | undefined;
  format: (value: number) => string;
  onPress: () => void;
}) {
  if (value === undefined) return <span data-wheel-step={distance} />;
  return (
    <button type="button" data-wheel-step={distance} onClick={onPress}>
      {format(value)}
    </button>
  );
}

/*
 * The load and the reps wheel side by side, with the `×` between them. The
 * prototype writes this row identically on both screens that carry a wheel,
 * including the pill that stands in for the load when the set has none.
 */
export function SetValueWheels({
  load,
  reps,
}: {
  /** null draws the `Bodyweight` pill in the load's place. */
  load: ValueWheelProps | null;
  reps: ValueWheelProps;
}) {
  return (
    <div data-wheels="">
      {load === null ? (
        <span data-wheels-bodyweight="">Bodyweight</span>
      ) : (
        <ValueWheel {...load} />
      )}
      <span data-wheels-times="">×</span>
      <ValueWheel {...reps} />
    </div>
  );
}

function clamp(index: number, length: number): number {
  return Math.min(length - 1, Math.max(0, index));
}
