"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useRef, useState } from "react";

import "./hold-reorder.css";

/*
 * Hold to reorder, ported from the prototype for step 5 of
 * docs/design/redesign-v2/PLAN.md and lifted here in step 14.
 *
 * Prototype sources, read from the byte-exact local copy:
 *   the workout overview   `rowDragStart` 3538, `rowDragMove` 3552,
 *                          `rowDragEnd` 3574, row values 3182-3197
 *   a program's splits and
 *   a split's exercises    `gDragStart` 2526, `gDragMove` 2542,
 *                          `gDragEnd` 2563, `gRow` 2576
 *
 * The prototype writes the gesture twice, and the two are the same numbers and
 * the same arithmetic: a row lifts after 180ms held still, an 8px slip first
 * gives the press back to the scroll, the rows it passes move one row height
 * and the 10px gap out of its way, and it lands where it was let go. The second
 * copy adds one thing, `recentDrag()` (2524): a row that also opens something
 * on a press does not open it for 400ms after a drag let go of it.
 *
 * The keyboard half is the application's, as step 5 made it: the row is
 * focusable and Alt with an arrow moves it one place, which draws nothing.
 */

/** `rowDragStart` (3538): the hold before a row lifts, and the slip that cancels it. */
const holdMs = 180;
const slipPx = 8;
/** `gap` (3540): the list's own gap, which a moved row travels with. */
const rowGap = 10;
/** `recentDrag()` (2524): how long a drag keeps the row's own press off. */
const pressBlockMs = 400;

type Drag = Readonly<{
  index: number;
  startY: number;
  heights: readonly number[];
  active: boolean;
}>;

/** What the lifted row makes the screen draw: nothing here is read from a ref. */
type DragState = Readonly<{
  index: number;
  offset: number;
  target: number;
  height: number;
}>;

export type ReorderRowProps = {
  ref: (element: HTMLElement | null) => void;
  "data-reorder": "";
  "data-drag": "lifted" | undefined;
  "data-shifted": "" | undefined;
  style: CSSProperties | undefined;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

export function useHoldReorder({
  count,
  fallbackHeight,
  onMove,
}: {
  count: number;
  /** `heights` (3540, 2529): what an unmeasured row is taken to be. */
  fallbackHeight: number;
  onMove: (from: number, to: number) => void;
}) {
  const rowEls = useRef<(HTMLElement | null)[]>([]);
  const drag = useRef<Drag | null>(null);
  const holdTimer = useRef<number | null>(null);
  const releasedAt = useRef(0);
  const [dragState, setDragState] = useState<DragState | null>(null);

  /* `rowDragStart` (3538). A press that starts on a button is the button's. */
  function pointerDown(index: number, event: PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button") !== null) return;
    const element = event.currentTarget;
    const pointerId = event.pointerId;
    const heights = Array.from(
      { length: count },
      (_unused, position) =>
        rowEls.current[position]?.offsetHeight ?? fallbackHeight,
    );
    drag.current = { index, startY: event.clientY, heights, active: false };
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      if (drag.current === null) return;
      drag.current = { ...drag.current, active: true };
      // The prototype captures the pointer so a drag that leaves the row still
      // reaches it; a capture a browser refuses leaves the drag on the row.
      try {
        element.setPointerCapture(pointerId);
      } catch {
        /* no capture */
      }
      setDragState({
        index,
        offset: 0,
        target: index,
        height: heights[index] ?? fallbackHeight,
      });
    }, holdMs);
  }

  /* `rowDragMove` (3552). */
  function pointerMove(event: PointerEvent<HTMLElement>) {
    const held = drag.current;
    if (held === null) return;
    const offset = event.clientY - held.startY;
    if (!held.active) {
      if (Math.abs(offset) > slipPx) {
        if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
        drag.current = null;
      }
      return;
    }
    let target = held.index;
    let accumulated = 0;
    if (offset > 0) {
      for (let k = held.index + 1; k < held.heights.length; k += 1) {
        const step = held.heights[k]! + rowGap;
        if (offset > accumulated + step / 2) {
          target = k;
          accumulated += step;
        } else break;
      }
    } else if (offset < 0) {
      for (let k = held.index - 1; k >= 0; k -= 1) {
        const step = held.heights[k]! + rowGap;
        if (-offset > accumulated + step / 2) {
          target = k;
          accumulated += step;
        } else break;
      }
    }
    setDragState((state) =>
      state === null ? null : { ...state, offset, target },
    );
  }

  /* `rowDragEnd` (3574). */
  function pointerUp() {
    const held = drag.current;
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    drag.current = null;
    if (held === null) return;
    if (held.active) releasedAt.current = Date.now();
    const target = dragState?.target;
    setDragState(null);
    if (!held.active || target === undefined || target === held.index) return;
    onMove(held.index, target);
  }

  function keyDown(index: number, event: KeyboardEvent<HTMLElement>) {
    if (!event.altKey) return;
    const to =
      event.key === "ArrowUp"
        ? index - 1
        : event.key === "ArrowDown"
          ? index + 1
          : null;
    if (to === null) return;
    event.preventDefault();
    if (to < 0 || to >= count) return;
    onMove(index, to);
  }

  /**
   * `transform` (3191-3193, 2580-2582): every row between the lifted one and
   * where it would land moves one row height out of its way.
   */
  function shiftFor(index: number): number {
    if (dragState === null) return 0;
    if (dragState.index === index) return dragState.offset;
    const { index: from, target } = dragState;
    const height = dragState.height + rowGap;
    if (target > from && index > from && index <= target) return -height;
    if (target < from && index >= target && index < from) return height;
    return 0;
  }

  function rowProps(index: number): ReorderRowProps {
    const lifted = dragState !== null && dragState.index === index;
    const shift = shiftFor(index);
    return {
      ref: (element) => {
        rowEls.current[index] = element;
      },
      "data-reorder": "",
      "data-drag": lifted ? "lifted" : undefined,
      "data-shifted": shift === 0 ? undefined : "",
      style:
        shift === 0
          ? undefined
          : ({ "--row-shift": `${shift}px` } as CSSProperties),
      onPointerDown: (event) => pointerDown(index, event),
      onPointerMove: pointerMove,
      onPointerUp: pointerUp,
      onPointerCancel: pointerUp,
      onKeyDown: (event) => keyDown(index, event),
    };
  }

  return {
    rowProps,
    /** `recentDrag()` (2524): true for a moment after a drag let go. */
    recentDrag: () => Date.now() - releasedAt.current < pressBlockMs,
  };
}
