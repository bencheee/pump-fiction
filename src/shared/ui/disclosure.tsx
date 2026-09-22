"use client";

import { useId, useState, type ReactNode } from "react";

import { Icon } from "./icon";
import "./disclosure.css";

/*
 * The 44px row that opens a list under itself, ported from the prototype for
 * step 11 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 509-523 (`Highest reps at each load`) and 560-575
 *                 (`Chart values`), both inside screen 7
 *   bound values  lines 2262-2264 (`repsByLoadRows`, `repsByLoadDeg`,
 *                 `toggleRepsByLoad`), 2393-2395 (`chartValuesRows`,
 *                 `chartValuesDeg`, `toggleChartValues`)
 *
 * The two are one surface: the same button, the same 15px chevron turning
 * through 180 degrees, and the same 0fr-to-1fr grid row underneath. The Body
 * screens open their chart values the same way (line 1063), so steps 18 and 19
 * take this one.
 *
 * It renders the prototype's own two elements and no wrapper around them, so
 * the space above the row is the caller's margin on the button itself, exactly
 * where the prototype writes it.
 */
export function Disclosure({
  label,
  listLabel,
  children,
}: {
  label: string;
  /** What the list itself is called, where the button's words do not say. */
  listLabel?: string;
  /** The rows, as `<li>` elements. */
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  return (
    <>
      <button
        type="button"
        data-disclosure-toggle=""
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen(!open)}
      >
        {label}
        <Icon name="chevron-down" size={15} />
      </button>
      {/* The prototype animates the height by letting a grid row grow from
          `0fr` to `1fr`, which needs the overflow hidden one level in. A
          collapsed region is still in the document, so it is made inert: the
          button says `aria-expanded="false"`, and nothing inside it should
          answer a reader or the tab key while it does. */}
      <div data-disclosure-region="" id={regionId} inert={!open}>
        <div>
          <ul data-disclosure-rows="" aria-label={listLabel ?? label}>
            {children}
          </ul>
        </div>
      </div>
    </>
  );
}
