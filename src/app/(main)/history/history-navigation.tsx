"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { classNames } from "@/shared/ui/class-names";

const subsections = [
  { href: "/history/workouts", label: "Workouts" },
  { href: "/history/exercises", label: "Exercises" },
  { href: "/history/splits", label: "Splits" },
  { href: "/history/weight", label: "Weight" },
  { href: "/history/body", label: "Body" },
] as const;

/**
 * The five History subsections of ADR-0003. The current one is marked by
 * `aria-current` and a weight and underline change, never by color alone.
 */
export function HistoryNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="History subsections"
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
