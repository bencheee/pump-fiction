"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useCallback, useRef, useState } from "react";

/** Gap between reorderable rows, matching the design's 10px stack. */
const rowGap = 10;
/** Hold before a drag takes over, so a tap still reaches the row's controls. */
const holdMs = 180;
/** Pointer travel that cancels the hold and lets the list scroll instead. */
const cancelSlop = 8;

type DragState = {
  index: number;
  startY: number;
  heights: number[];
  active: boolean;
};

export type ReorderRow = Readonly<{
  ref: (element: HTMLElement | null) => void;
  style: CSSProperties;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  tabIndex: 0;
  "aria-roledescription": string;
}>;

/**
 * Hold-to-reorder, as the design draws it: the held row lifts and the rows it
 * passes slide out of its way. Arrow keys move a focused row as well, so the
 * order stays changeable without a pointer drag.
 */
export function useReorder({
  count,
  onMove,
}: {
  count: number;
  onMove: (from: number, to: number) => void;
}) {
  const elements = useRef<(HTMLElement | null)[]>([]);
  const drag = useRef<DragState | null>(null);
  const hold = useRef<number>(undefined);
  const [index, setIndex] = useState<number>();
  const [offset, setOffset] = useState(0);
  const [target, setTarget] = useState<number>();
  // The held row's height drives how far the rows it passes slide, so it is
  // captured into state when the hold fires rather than read while rendering.
  const [heldHeight, setHeldHeight] = useState(0);

  const reset = useCallback(() => {
    drag.current = null;
    window.clearTimeout(hold.current);
    setIndex(undefined);
    setOffset(0);
    setTarget(undefined);
    setHeldHeight(0);
  }, []);

  const onPointerDown = useCallback(
    (rowIndex: number, event: PointerEvent<HTMLElement>) => {
      if (event.target instanceof Element && event.target.closest("button")) {
        return;
      }

      const element = event.currentTarget;
      const pointerId = event.pointerId;
      drag.current = {
        index: rowIndex,
        startY: event.clientY,
        heights: elements.current.map((row) => row?.offsetHeight ?? 74),
        active: false,
      };

      window.clearTimeout(hold.current);
      hold.current = window.setTimeout(() => {
        if (!drag.current) return;
        drag.current.active = true;
        try {
          element.setPointerCapture(pointerId);
        } catch {
          // Capture is a nicety; the drag still tracks without it.
        }
        setIndex(rowIndex);
        setOffset(0);
        setTarget(rowIndex);
        setHeldHeight((drag.current.heights[rowIndex] ?? 74) + rowGap);
      }, holdMs);
    },
    [],
  );

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current) return;

    const moved = event.clientY - current.startY;
    if (!current.active) {
      if (Math.abs(moved) > cancelSlop) {
        window.clearTimeout(hold.current);
        drag.current = null;
      }
      return;
    }

    let next = current.index;
    let travelled = 0;
    if (moved > 0) {
      for (let i = current.index + 1; i < current.heights.length; i += 1) {
        const step = current.heights[i] + rowGap;
        if (moved <= travelled + step / 2) break;
        next = i;
        travelled += step;
      }
    } else if (moved < 0) {
      for (let i = current.index - 1; i >= 0; i -= 1) {
        const step = current.heights[i] + rowGap;
        if (-moved <= travelled + step / 2) break;
        next = i;
        travelled += step;
      }
    }

    setOffset(moved);
    setTarget(next);
  }, []);

  const onPointerUp = useCallback(() => {
    const current = drag.current;
    const to = target;
    const wasActive = Boolean(current?.active);
    const from = current?.index;
    reset();
    if (!wasActive || from === undefined || to === undefined || to === from) {
      return;
    }
    onMove(from, to);
  }, [onMove, reset, target]);

  const onKeyDown = useCallback(
    (rowIndex: number, event: KeyboardEvent<HTMLElement>) => {
      if (event.target instanceof Element && event.target.closest("button")) {
        return;
      }
      const delta =
        event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
      if (delta === 0) return;

      const to = rowIndex + delta;
      if (to < 0 || to >= count) return;
      event.preventDefault();
      onMove(rowIndex, to);
    },
    [count, onMove],
  );

  const dragging = index !== undefined && target !== undefined;
  const draggedHeight = dragging ? heldHeight : 0;

  const row = useCallback(
    (rowIndex: number): ReorderRow => {
      const held = dragging && rowIndex === index;
      const shiftedUp =
        dragging && target > index && rowIndex > index && rowIndex <= target;
      const shiftedDown =
        dragging && target < index && rowIndex >= target && rowIndex < index;

      return {
        ref: (element) => {
          elements.current[rowIndex] = element;
        },
        style: {
          transform: held
            ? `translateY(${offset}px) scale(1.02)`
            : shiftedUp
              ? `translateY(${-draggedHeight}px)`
              : shiftedDown
                ? `translateY(${draggedHeight}px)`
                : undefined,
          transition: held
            ? "none"
            : "transform 190ms cubic-bezier(0.2, 0.8, 0.3, 1)",
          zIndex: held ? 5 : 1,
          boxShadow: held ? "var(--pf-shadow-drag)" : undefined,
          touchAction: dragging ? "none" : "pan-y",
        },
        onPointerDown: (event) => onPointerDown(rowIndex, event),
        onPointerMove,
        onPointerUp,
        onPointerCancel: onPointerUp,
        onKeyDown: (event) => onKeyDown(rowIndex, event),
        tabIndex: 0,
        "aria-roledescription":
          "Reorderable item. Hold to drag, or use the arrow keys.",
      };
    },
    [
      draggedHeight,
      dragging,
      index,
      offset,
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      target,
    ],
  );

  return { row, draggingIndex: dragging ? index : undefined };
}
