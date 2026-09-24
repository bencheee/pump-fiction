import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "./icon";
import "./list-row.css";

/*
 * The row a list is made of, ported from the prototype for step 8 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP. The History list
 * writes it three times over — a saved workout (line 284), an exercise (line
 * 308) and a split (line 327) — and the three are the same row: the split's
 * only differences are the vertical padding and the program line above the
 * detail. Programs, Exercises and Body draw the same row again in later steps,
 * so it is one component from here on.
 */
export function ListRow({
  href,
  title,
  meta,
  detail,
  badge,
  trailing,
  leading,
  titleBadge,
  current = false,
  variant,
}: {
  href: string;
  title: string;
  /** The line between the name and the detail; the split row's program. */
  meta?: ReactNode;
  detail?: ReactNode;
  /** The outline pill under the text, such as `No longer in the library`. */
  badge?: ReactNode;
  /** Sits before the chevron; the saved workout's trend. */
  trailing?: ReactNode;
  leading?: ReactNode;
  /** Sits beside the name and wraps under it; the program row's `Current`. */
  titleBadge?: ReactNode;
  /** The program row the rotation runs from, drawn on the tinted fill. */
  current?: boolean;
  /**
   * `split` takes the taller padding and drops the minimum height. `program`
   * is the Programs list's row: the same frame, its own type (line 757).
   */
  variant?: "split" | "program";
}) {
  return (
    <Link
      href={href}
      data-list-row={variant ?? ""}
      data-current={current ? "" : undefined}
    >
      {leading}
      <span data-list-row-text="">
        {titleBadge ? (
          <span data-list-row-heading="">
            <span data-list-row-title="">{title}</span>
            {titleBadge}
          </span>
        ) : (
          <span data-list-row-title="">{title}</span>
        )}
        {meta ? <span data-list-row-meta="">{meta}</span> : null}
        {detail ? <span data-list-row-detail="">{detail}</span> : null}
        {badge ? (
          <span data-badge="" data-tone="neutral" data-list-row-badge="">
            {badge}
          </span>
        ) : null}
      </span>
      {trailing}
      <Icon name="chevron-right" size={16} />
    </Link>
  );
}
