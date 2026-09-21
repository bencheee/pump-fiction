"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";

import { SubsectionNavigation } from "@/shared/ui";

import "./history-list.css";

/*
 * The History list screen's frame — the prototype's screen 4 — ported for
 * step 8 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 262-386, `data-screen-label="History list"`
 *   bound values  lines 1983-2110 and 2175-2200 (`historyVals()`)
 *
 * The prototype holds one screen and three tabs in `s.tab`; the application
 * holds three routes, because each tab is a separate read and each has been
 * its own URL since `T-032`. What the prototype gets for free from one screen
 * — a tab pill that slides, and a panel that knows which way it arrived — this
 * frame gets by living in the layout, which Next keeps mounted while the page
 * under it changes. The title and the tab bar are therefore here; the count
 * and the panel belong to the tab and come up from the page, and the grid in
 * `history-list.css` puts all four where the prototype draws them.
 *
 * Every other route under `/history` is a screen of its own with its own bar,
 * exactly as the prototype's stack is, so the frame steps out of the way.
 */

// Weight and Body left History for a destination of their own in `T-052`;
// see ADR-0030.
const tabs = [
  { href: "/history/workouts", label: "Workouts" },
  { href: "/history/exercises", label: "Exercises" },
  { href: "/history/splits", label: "Splits" },
] as const;

type PanelAnim = "none" | "panFwdA" | "panFwdB" | "panBackA" | "panBackB";

const PanelAnimContext = createContext<PanelAnim>("none");

export function HistoryFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const index = tabs.findIndex((tab) => tab.href === pathname);
  const panelAnim = usePanelAnimation(index);

  if (index === -1) return <>{children}</>;

  return (
    <PanelAnimContext.Provider value={panelAnim}>
      <section data-screen-frame="history">
        <h1 data-history-title="">History</h1>
        <SubsectionNavigation label="History subsections" subsections={tabs} />
        {children}
      </section>
    </PanelAnimContext.Provider>
  );
}

/** `tabCount` (line 2183): how much the tab on screen is holding. */
export function HistoryCount({ children }: { children: ReactNode }) {
  return <span data-history-count="">{children}</span>;
}

/**
 * The tab's own scroll region — the prototype's `.sx` at line 277, carrying
 * `panelAnim`. It is the page's, not the frame's: it is what changes.
 */
export function HistoryPanel({ children }: { children: ReactNode }) {
  const panelAnim = useContext(PanelAnimContext);
  return (
    <div data-history-panel="" data-panel-anim={panelAnim}>
      {children}
    </div>
  );
}

/*
 * `panelAnimStr` (lines 1992-1998): moving right through the bar brings the
 * panel in from the right, moving left from the left, and the `A`/`B` pair
 * alternates so the animation restarts. A screen that is not a tab — a
 * workout, an exercise, a split — leaves the direction exactly as it was,
 * which is the prototype's own: `tab` does not change while the stack grows,
 * and the panel replays its last direction when the stack pops back to the
 * list.
 */
function usePanelAnimation(index: number): PanelAnim {
  // `null` until a tab has been on screen, which is `lastTab === undefined`
  // in the prototype: the first tab to arrive is adopted without a direction.
  const [memory, setMemory] = useState<{
    index: number | null;
    n: number;
    anim: PanelAnim;
  }>(() => ({ index: index === -1 ? null : index, n: 0, anim: "none" }));

  if (index !== -1 && memory.index !== index) {
    const n = memory.index === null ? memory.n : memory.n + 1;
    setMemory({
      index,
      n,
      anim:
        memory.index === null
          ? memory.anim
          : `pan${index > memory.index ? "Fwd" : "Back"}${n % 2 ? "A" : "B"}`,
    });
  }

  return memory.anim;
}
