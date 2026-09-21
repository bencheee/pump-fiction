"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import "./subsection-navigation.css";

export type Subsection = { href: string; label: string };

/**
 * The tab bar a destination puts above its own screens. History has carried
 * one since `T-032`; `T-052` gave Body the same bar rather than a second
 * implementation of it, under [ADR-0030].
 *
 * Step 8 of docs/design/redesign-v2/PLAN.md ported it to the prototype's
 * segmented control (markup lines 270-275, `tabs` and `tabX` at lines
 * 2181-2182). The current tab is marked by the filled pill that slides to it,
 * and by `aria-current`, which carries the same fact to anything that cannot
 * see the pill. The pill is one element rather than a fill per tab because it
 * is the thing that moves: it lives here, in a layout, so it is still on
 * screen when the tab under it changes and the slide has somewhere to run.
 */
export function SubsectionNavigation({
  label,
  subsections,
}: {
  label: string;
  subsections: readonly Subsection[];
}) {
  const pathname = usePathname();
  const index = subsections.findIndex(
    (subsection) =>
      pathname === subsection.href ||
      pathname.startsWith(`${subsection.href}/`),
  );

  return (
    <nav
      aria-label={label}
      data-tabs=""
      style={
        {
          "--tab-count": subsections.length,
          "--tab-index": Math.max(0, index),
        } as React.CSSProperties
      }
    >
      <span data-tabs-pill="" aria-hidden="true" />
      {subsections.map((subsection, position) => (
        <Link
          key={subsection.href}
          href={subsection.href}
          aria-current={position === index ? "page" : undefined}
        >
          {subsection.label}
        </Link>
      ))}
    </nav>
  );
}
