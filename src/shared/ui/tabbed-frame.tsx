"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";

import { SubsectionNavigation, type Subsection } from "./subsection-navigation";
import "./tabbed-frame.css";

/*
 * The frame of a destination that holds its screens under tabs — History
 * (the prototype's screen 4) and Body (screen 15) — ported for step 8 of
 * docs/design/redesign-v2/PLAN.md and lifted here in step 18.
 *
 * Prototype sources, read from the byte-exact local copy:
 *   History       lines 264-277, `tabs`, `tabX`, `tabCount`, `panelAnimStr`
 *                 (2175-2200, 1992-1998)
 *   Body          lines 1006-1020, `bodyTabs`, `bodyTabX`, `bodyCount`,
 *                 `bPanelStr` (3046-3056, 2645-2652)
 *
 * The prototype writes the two alike: a 28px title with a count chip against
 * it, the segmented tab bar, and a scroll region that slides in from the side
 * the tab was chosen from. The prototype holds one screen and a tab index;
 * the application holds a route per tab, because each tab is its own read.
 * What the prototype gets from one screen — a pill that slides, a panel that
 * knows which way it arrived — this frame gets by living in a layout, which
 * Next keeps mounted while the page under it changes. The title and the tab
 * bar are therefore here; the count and the panel belong to the tab and come
 * up from the page, and a grid puts all four where the prototype draws them.
 *
 * Every other route under the destination is a screen of its own with its own
 * bar, exactly as the prototype's stack is, so the frame steps out of the way.
 */

type PanelAnim = "none" | "panFwdA" | "panFwdB" | "panBackA" | "panBackB";

const PanelAnimContext = createContext<PanelAnim>("none");

export function TabbedFrame({
  screen,
  title,
  label,
  tabs,
  children,
}: {
  /** Names the destination, so its own stylesheet can reach the frame. */
  screen: string;
  title: string;
  /** Names the tab bar for assistive technology. */
  label: string;
  tabs: readonly Subsection[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const index = tabs.findIndex((tab) => tab.href === pathname);
  const panelAnim = usePanelAnimation(index);

  if (index === -1) return <>{children}</>;

  return (
    <PanelAnimContext.Provider value={panelAnim}>
      <section data-screen-frame={screen} data-tabbed-frame="">
        <h1 data-tabbed-title="">{title}</h1>
        <SubsectionNavigation label={label} subsections={tabs} />
        {children}
      </section>
    </PanelAnimContext.Provider>
  );
}

/** `tabCount` (2183), `bodyCount` (3053): how much the tab on screen holds. */
export function TabbedCount({ children }: { children: ReactNode }) {
  return <span data-tabbed-count="">{children}</span>;
}

/**
 * The tab's own scroll region — the prototype's `.sx` at lines 277 and 1020,
 * carrying the panel's slide. It is the page's, not the frame's: it is what
 * changes.
 */
export function TabbedPanel({ children }: { children: ReactNode }) {
  const panelAnim = useContext(PanelAnimContext);
  return (
    <div data-tabbed-panel="" data-panel-anim={panelAnim}>
      {children}
    </div>
  );
}

/*
 * `panelAnimStr` and `bPanelStr`: moving right through the bar brings the
 * panel in from the right, moving left from the left, and the `A`/`B` pair
 * alternates so the animation restarts. A screen that is not a tab leaves the
 * direction exactly as it was, which is the prototype's own: the tab does not
 * change while the stack grows, and the panel replays its last direction when
 * the stack pops back to the list.
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
