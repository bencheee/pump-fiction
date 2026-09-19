"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useRef, useState } from "react";

/** Pointer travel, in CSS pixels, that moves the wheel by one option. */
const dragStep = 34;

type Motion = Readonly<{ direction: "up" | "down"; tick: number }>;

/**
 * The kg and reps picker from the active workout and the set-correction
 * overlay: a window over a column of options, with the two neighbours on each
 * side tappable and the whole column draggable. Every option is a real button,
 * so the value is reachable without dragging.
 */
export function ValueWheel({
  label,
  options,
  index,
  onIndexChange,
  unit,
  width = 112,
  format = String,
  emptyDisplay = "—",
}: {
  label: string;
  options: readonly number[];
  /** `undefined` while the set carries no value yet. */
  index: number | undefined;
  onIndexChange: (index: number) => void;
  unit: string;
  width?: number;
  format?: (value: number) => string;
  emptyDisplay?: string;
}) {
  const [motion, setMotion] = useState<Motion>();
  const drag = useRef<{ y: number } | null>(null);
  const tick = useRef(0);

  const move = useCallback(
    (delta: number) => {
      if (delta === 0) return;
      const from = index ?? 0;
      const next = Math.min(options.length - 1, Math.max(0, from + delta));
      if (next === index) return;
      tick.current += 1;
      setMotion({ direction: delta > 0 ? "down" : "up", tick: tick.current });
      onIndexChange(next);
    },
    [index, onIndexChange, options.length],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { y: event.clientY };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current) return;
    const steps = Math.trunc((event.clientY - current.y) / dragStep);
    if (steps === 0) return;
    current.y += steps * dragStep;
    move(-steps);
  };
  const endDrag = () => {
    drag.current = null;
  };

  const at = (offset: number) =>
    index === undefined ? undefined : options[index + offset];

  const neighbour = (offset: number, size: number, colour: string) => {
    const value = at(offset);
    if (value === undefined) {
      return <span className="h-[29px]" aria-hidden="true" />;
    }
    return (
      <button
        type="button"
        onClick={() => move(offset)}
        aria-label={`${label} ${format(value)}`}
        className={`pf-numeric flex h-[29px] items-center ${colour}`}
        style={{ fontSize: size }}
      >
        {format(value)}
      </button>
    );
  };

  const current = index === undefined ? undefined : options[index];

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="relative h-[196px] touch-none overflow-hidden"
      style={{ width }}
    >
      <div className="absolute top-[58px] right-0 left-0 h-20 rounded-[var(--pf-r4)] bg-[var(--pf-bg-surface)]" />
      <div
        className="relative flex flex-col items-center"
        style={
          motion
            ? {
                animation: `pf-wheel-${motion.direction}-${motion.tick % 2 ? "a" : "b"} 170ms var(--pf-ease)`,
              }
            : undefined
        }
      >
        {neighbour(-2, 18, "text-[var(--pf-glyph-dim)]")}
        {neighbour(-1, 21, "text-[var(--pf-text-4)]")}
        <span className="pf-numeric flex h-20 items-baseline justify-center gap-1 text-[length:var(--pf-type-wheel-size)] leading-none font-bold">
          {current === undefined ? emptyDisplay : format(current)}
          <span className="text-[14px] font-semibold text-[var(--pf-text-3)]">
            {unit}
          </span>
        </span>
        {neighbour(1, 21, "text-[var(--pf-text-4)]")}
        {neighbour(2, 18, "text-[var(--pf-glyph-dim)]")}
      </div>
    </div>
  );
}

/** The `×` that separates the two wheels. */
export function WheelSeparator() {
  return (
    <span
      aria-hidden="true"
      className="pf-numeric text-[24px] text-[var(--pf-glyph-dim)]"
    >
      ×
    </span>
  );
}
