"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";

import { Icon } from "./icon";

/**
 * The expand/collapse pattern the redesign uses for "Chart values" and
 * "Highest reps at each load": a green text action whose chevron rotates, over
 * a region that grows through `grid-template-rows` so the height animates
 * without measuring anything.
 */
export function Collapsible({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const regionId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={regionId}
        className="flex min-h-11 w-full items-center justify-between gap-2.5 text-[13.5px] font-semibold text-[var(--pf-accent)]"
      >
        {label}
        <span
          aria-hidden="true"
          className="flex transition-transform duration-300 ease-[var(--pf-ease)]"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <Icon name="chevron-down" size={15} />
        </span>
      </button>
      <div
        id={regionId}
        className="grid transition-[grid-template-rows] duration-[var(--pf-mo-panel)] ease-[var(--pf-ease)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

/** A label/value row inside a collapsible region or a facts card. */
export function DataRow({
  label,
  value,
  first,
}: {
  label: ReactNode;
  value: ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={
        first
          ? "flex min-h-[34px] items-center justify-between gap-3"
          : "flex min-h-[34px] items-center justify-between gap-3 border-t border-[var(--pf-border)]"
      }
    >
      <span className="pf-numeric text-[15px] text-[var(--pf-text-3)]">
        {label}
      </span>
      <span className="pf-numeric text-[15px]">{value}</span>
    </div>
  );
}
