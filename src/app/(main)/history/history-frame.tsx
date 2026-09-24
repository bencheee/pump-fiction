"use client";

import type { ReactNode } from "react";

import { TabbedCount, TabbedFrame, TabbedPanel } from "@/shared/ui";

import "./history-list.css";

/*
 * The History list screen's frame — the prototype's screen 4 — ported for
 * step 8 of docs/design/redesign-v2/PLAN.md. The frame itself is the shared
 * tabbed frame Body takes as well, lifted in step 18; what is here is which
 * tabs History holds.
 */

// Weight and Body left History for a destination of their own in `T-052`;
// see ADR-0030.
const tabs = [
  { href: "/history/workouts", label: "Workouts" },
  { href: "/history/exercises", label: "Exercises" },
  { href: "/history/splits", label: "Splits" },
] as const;

export function HistoryFrame({ children }: { children: ReactNode }) {
  return (
    <TabbedFrame
      screen="history"
      title="History"
      label="History subsections"
      tabs={tabs}
    >
      {children}
    </TabbedFrame>
  );
}

export const HistoryCount = TabbedCount;
export const HistoryPanel = TabbedPanel;
