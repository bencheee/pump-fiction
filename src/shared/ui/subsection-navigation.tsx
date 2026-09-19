"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <nav aria-label={label}>
      <ul>
        {subsections.map((subsection) => {
          const current =
            pathname === subsection.href ||
            pathname.startsWith(`${subsection.href}/`);

          return (
            <li key={subsection.href}>
              <Link
                href={subsection.href}
                aria-current={current ? "page" : undefined}
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
