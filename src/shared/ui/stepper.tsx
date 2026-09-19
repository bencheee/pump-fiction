"use client";

import { useEffect, useRef, useState } from "react";

import { classNames } from "./class-names";
import { Icon } from "./icon";

function useBump(value: unknown) {
  const tick = useRef(0);
  const previous = useRef(value);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    tick.current += 1;
    setBump(tick.current);
  }, [value]);

  return bump === 0
    ? undefined
    : { animation: `pf-bump-${bump % 2 ? "a" : "b"} 300ms var(--pf-ease)` };
}

/** The full-width stepper row used by workout correction. */
export function StepperRow({
  label,
  value,
  decrementLabel,
  incrementLabel,
  onDecrement,
  onIncrement,
  first,
}: {
  label: string;
  value: string;
  decrementLabel: string;
  incrementLabel: string;
  onDecrement: () => void;
  onIncrement: () => void;
  first?: boolean;
}) {
  const bump = useBump(value);

  return (
    <div
      className={classNames(
        "flex min-h-[60px] items-center gap-2.5",
        !first && "border-t border-[var(--pf-border)]",
      )}
    >
      <span className="min-w-0 flex-1 text-[14px] text-[var(--pf-text-2)]">
        {label}
      </span>
      <button
        type="button"
        onClick={onDecrement}
        aria-label={decrementLabel}
        className="flex size-10 items-center justify-center rounded-full bg-[var(--pf-bg-surface-3)] text-[var(--pf-text-2)] transition-colors duration-150 ease-linear hover:bg-[var(--pf-border-strong)]"
      >
        <Icon name="minus" size={14} />
      </button>
      <span
        className="pf-numeric w-[92px] text-center text-[19px] font-semibold"
        style={bump}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={incrementLabel}
        className="flex size-10 items-center justify-center rounded-full bg-[var(--pf-bg-surface-3)] text-[var(--pf-text-2)] transition-colors duration-150 ease-linear hover:bg-[var(--pf-border-strong)]"
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}

/** The compact three-up stepper used by a split's prescription rows. */
export function CompactStepper({
  label,
  value,
  decrementLabel,
  incrementLabel,
  onDecrement,
  onIncrement,
}: {
  label: string;
  value: string;
  decrementLabel: string;
  incrementLabel: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-center text-[10.5px] font-semibold tracking-[0.06em] text-[var(--pf-text-4)] uppercase">
        {label}
      </span>
      <div className="flex h-11 items-center justify-between gap-0.5 rounded-[var(--pf-r1)] bg-[var(--pf-bg-surface-2)] px-1">
        <button
          type="button"
          onClick={onDecrement}
          aria-label={decrementLabel}
          className="flex h-9 w-[34px] items-center justify-center rounded-[11px] text-[var(--pf-text-3)] transition-colors duration-150 ease-linear hover:bg-[var(--pf-bg-surface-4)] hover:text-[var(--pf-text)]"
        >
          <Icon name="minus" size={12} />
        </button>
        <span className="pf-numeric flex-1 text-center text-[19px] font-semibold">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          aria-label={incrementLabel}
          className="flex h-9 w-[34px] items-center justify-center rounded-[11px] text-[var(--pf-text-3)] transition-colors duration-150 ease-linear hover:bg-[var(--pf-bg-surface-4)] hover:text-[var(--pf-text)]"
        >
          <Icon name="plus" size={12} />
        </button>
      </div>
    </div>
  );
}
