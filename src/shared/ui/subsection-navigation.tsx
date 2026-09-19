"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { classNames } from "./class-names";

export type Subsection = { href: string; label: string };

/**
 * The tab bar a destination puts above its own screens. History has carried
 * one since `T-032`; `T-052` gave Body the same bar rather than a second
 * implementation of it, under [ADR-0030]. The redesign draws it as a segmented
 * control: a filled thumb slides under the current tab, which is also marked by
 * `aria-current` and by a weight change, so the cue is never colour alone.
 */
export function SubsectionNavigation({
  label,
  subsections,
}: {
  label: string;
  subsections: readonly Subsection[];
}) {
  const pathname = usePathname();
  const currentIndex = Math.max(
    0,
    subsections.findIndex(
      (subsection) =>
        pathname === subsection.href ||
        pathname.startsWith(`${subsection.href}/`),
    ),
  );

  return (
    <nav aria-label={label} className="shrink-0">
      <ul className="relative flex gap-1 rounded-full bg-[var(--pf-bg-surface)] p-1">
        <li
          aria-hidden="true"
          className="absolute top-1 left-1 h-[42px] rounded-full bg-[var(--pf-accent)] transition-transform duration-[var(--pf-mo-panel)] ease-[var(--pf-ease)]"
          style={{
            width: `calc((100% - 8px) / ${subsections.length})`,
            transform: `translateX(${currentIndex * 100}%)`,
          }}
        />
        {subsections.map((subsection, index) => {
          const current = index === currentIndex;

          return (
            <li key={subsection.href} className="relative min-w-0 flex-1">
              <Link
                href={subsection.href}
                aria-current={current ? "page" : undefined}
                className={classNames(
                  "flex h-[42px] items-center justify-center rounded-full text-[14.5px] transition-colors duration-[240ms] ease-linear",
                  current
                    ? "font-semibold text-[var(--pf-on-accent)]"
                    : "font-medium text-[var(--pf-text-3)]",
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
