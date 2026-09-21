import type { ButtonHTMLAttributes, ReactNode } from "react";

import "./chip.css";

/*
 * The chip a list or a chart puts above itself to narrow what it shows,
 * ported from the prototype for step 8 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP. The History list's
 * program filter (markup line 325, values at lines 2062-2068) and the
 * statistics screens' metric and range chips (values at lines 2266-2272 and
 * 2401-2407) write the same three-value triple — border, background, text —
 * so the chip is one surface from here on, and steps 11, 12, 18 and 19 take
 * this one.
 */
export function Chip({
  selected,
  children,
  ...props
}: { selected: boolean; children: ReactNode } & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-pressed"
>) {
  return (
    <button type="button" aria-pressed={selected} data-chip="" {...props}>
      {children}
    </button>
  );
}
