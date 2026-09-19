"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { classNames } from "./class-names";

export type Subsection = { href: string; label: string };

/**
 * The tab bar a destination puts above its own screens. History has carried
 * one since `T-032`; `T-052` gave Body the same bar rather than a second
 * implementation of it, under [ADR-0030]. The current tab is marked by
 * `aria-current` and by a weight and underline change, never by color alone.
 */
export function SubsectionNavigation({
  label,
  subsections,
}: {
  label: string;
  subsections: readonly Subsection[];
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className="pf-safe-top sticky top-0 z-5 border-b border-[var(--pf-border)] bg-[var(--pf-bg-canvas)]"
    >
      <ul className="flex gap-1 overflow-x-auto px-[var(--pf-gutter)] pb-1">
        {subsections.map((subsection) => {
          const current =
            pathname === subsection.href ||
            pathname.startsWith(`${subsection.href}/`);

          return (
            <li key={subsection.href}>
              <Link
                href={subsection.href}
                aria-current={current ? "page" : undefined}
                className={classNames(
                  "flex min-h-11 items-center border-b-2 px-3 text-[13px] whitespace-nowrap",
                  current
                    ? "border-[var(--pf-accent-strong)] font-semibold text-[var(--pf-accent-strong)]"
                    : "border-transparent text-[var(--pf-text-2)]",
                )}
              >
                {subsection.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
