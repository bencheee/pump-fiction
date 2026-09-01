import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "./class-names";
import { Icon } from "./icon";

export function PageFrame({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={classNames(
        "pf-safe-top flex min-h-full flex-col gap-6 px-[var(--pf-gutter)] pb-6",
        className,
      )}
    >
      <h1 className="text-[26px] leading-[1.1] font-semibold tracking-[-0.01em] [overflow-wrap:anywhere]">
        {title}
      </h1>
      {children}
    </section>
  );
}

export function TopBar({
  title,
  backHref,
  backLabel,
}: {
  title: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <header className="sticky top-0 z-5 grid min-h-[calc(57px+env(safe-area-inset-top))] grid-cols-[44px_1fr_44px] items-end border-b border-[var(--pf-border)] bg-[var(--pf-bg-canvas)] px-3 pt-[env(safe-area-inset-top)] pb-1.5">
      <Link
        href={backHref}
        aria-label={backLabel}
        className="flex min-h-11 min-w-11 items-center justify-center text-[var(--pf-accent-strong)]"
      >
        <Icon name="chevron-left" size={18} />
      </Link>
      <h1 className="self-center text-center text-[15px] leading-[1.2] font-semibold [overflow-wrap:anywhere]">
        {title}
      </h1>
      <span aria-hidden="true" className="block size-11" />
    </header>
  );
}

export function StickyActionBar({
  children,
  className,
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        "pf-sticky-action sticky bottom-0 mt-auto flex flex-col gap-2 bg-[linear-gradient(to_bottom,transparent_0,var(--pf-bg-canvas)_18px)] px-[var(--pf-gutter)] pt-7 pb-[calc(var(--pf-s3)+var(--pf-bottom-buffer)+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </div>
  );
}
