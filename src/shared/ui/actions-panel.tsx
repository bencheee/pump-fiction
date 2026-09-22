"use client";

import type { CSSProperties, ReactElement, RefObject } from "react";
import { useState } from "react";

import "./actions-panel.css";
import { Icon, type IconName } from "./icon";
import { Sheet } from "./overlays";
import type { TransientOverlay } from "./transient-overlay";

/*
 * The Actions panel, ported from the prototype for step 9 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 1188-1208, `data-screen-label="Screen actions"`
 *                 lines 1328-1348, `data-screen-label="Actions overlay"`
 *   bound values  lines 2838-2905 (`actRaw`, `actItems`, `actOpen`, `actRun`,
 *                 `actBlur`, `actContinueBg`), and 3262-3292 for the queue's
 *
 * The prototype writes the panel twice — once for a screen's own actions and
 * once for the set under the finger in a workout — and the two are one
 * declaration but for the meta line under the heading and the layer the panel
 * takes, which is what `kind` below carries. Step 6 built the queue's; this is
 * that surface lifted out so both screens carry the same one.
 *
 * It is a two-step control and not a menu of buttons: a press picks an entry
 * and `Continue` runs it (`actRun`, line 2900), and a press on the panel away
 * from any control gives the pick back (`actBlur`, 2899). The entries arrive
 * `ovRow`-staggered 45ms apart after a 40ms head start.
 */

export type ActionEntry = Readonly<{
  key: string;
  label: string;
  icon: IconName;
  /** The prototype refuses an entry by colour alone; `disabled` names it too. */
  disabled?: boolean;
  run: () => void;
}>;

export function ActionsPanel({
  panel,
  heading,
  meta,
  kind = "screen",
  items,
  trigger,
  overlay,
  returnFocusRef,
}: {
  /** Names the panel, so its screen's stylesheet can reach the shared frame. */
  panel: string;
  /** `actTitle` (2838): what the actions are about. */
  heading: string;
  /** `actMeta` (2838): the line under it. */
  meta: string;
  /*
   * Which of the prototype's two copies this is, and the only two things they
   * differ in: a screen's own actions state their meta in 14px of plain text
   * (line 1196) and the panel sits over the toast at z-index 27 (1189); the
   * set under the finger in a workout states its meta in the 16px numerals
   * (1337) and its panel stays under the toast with every other one (1330).
   */
  kind?: "screen" | "set";
  items: readonly ActionEntry[];
  trigger?: ReactElement;
  overlay?: TransientOverlay;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const [pick, setPick] = useState<string | null>(null);
  const picked = items.find((item) => item.key === pick) ?? null;

  return (
    <Sheet
      panel={panel}
      layer={kind === "screen" ? "above-toast" : undefined}
      title="Actions"
      overlay={overlay}
      returnFocusRef={returnFocusRef}
      trigger={trigger}
      onOpenChange={(open) => {
        // `actClose` (2898) gives the pick back with the panel.
        if (!open) setPick(null);
      }}
      onBodyClick={(event) => {
        // `actBlur` (2899). The prototype hangs this on the panel root; the
        // 60px bar above the body holds nothing but the title and Close.
        if ((event.target as HTMLElement).closest("button") !== null) return;
        setPick(null);
      }}
    >
      {(close) => (
        <>
          <h2 data-actions-name="">{heading}</h2>
          <p data-actions-meta="" data-variant={kind}>
            {meta}
          </p>
          <div data-actions-list="">
            {items.map((item, index) => (
              <button
                key={item.key}
                type="button"
                data-actions-item=""
                aria-pressed={pick === item.key}
                aria-label={item.label}
                disabled={item.disabled}
                style={
                  {
                    "--actions-row-delay": `${40 + index * 45}ms`,
                  } as CSSProperties
                }
                onClick={() => setPick(item.key)}
              >
                <Icon name={item.icon} size={20} />
                <span data-actions-label="">{item.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            data-actions-continue=""
            data-armed={picked !== null}
            aria-label="Continue"
            title="Continue"
            disabled={picked === null}
            onClick={() => {
              if (picked === null) return;
              setPick(null);
              close();
              picked.run();
            }}
          >
            <Icon name="chevron-right" size={18} />
            Continue
          </button>
        </>
      )}
    </Sheet>
  );
}
