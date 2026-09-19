import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "./class-names";
import { Icon } from "./icon";

/**
 * A top-level destination: a fixed title row, then its own scrolling body.
 * Only the body scrolls, so the title and anything pinned under it — tabs, a
 * search field — stay in place the way the design shows them.
 */
export function PageFrame({
  title,
  titleSuffix,
  action,
  pinned,
  children,
  className,
}: {
  title: string;
  /** Rendered inside the heading, for Today's caret. */
  titleSuffix?: ReactNode;
  action?: ReactNode;
  pinned?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 px-[var(--pf-gutter)] pt-[calc(var(--pf-s6)+env(safe-area-inset-top))] pb-2.5">
        <h1 className="text-[length:var(--pf-type-screen-title-size)] leading-[1.1] font-bold tracking-[-0.01em] [overflow-wrap:anywhere]">
          {title}
          {titleSuffix}
        </h1>
        {action}
      </header>
      {pinned ? (
        <div className="shrink-0 px-[var(--pf-gutter)]">{pinned}</div>
      ) : null}
      <div
        className={classNames(
          "pf-scroll flex min-h-0 flex-1 flex-col gap-3 px-[var(--pf-gutter)] pt-1.5 pb-[var(--pf-s5)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The 60px back row every pushed screen carries. `trailing` holds whatever the
 * design puts opposite the title: an Unsaved badge, a clock pill, nothing.
 */
export function TopBar({
  title,
  backHref,
  backLabel,
  trailing,
}: {
  title: string;
  backHref: string;
  backLabel: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="flex min-h-[calc(var(--pf-size-overlay-header)+env(safe-area-inset-top))] shrink-0 items-center gap-1.5 pt-[env(safe-area-inset-top)] pr-4 pl-2">
      <Link
        href={backHref}
        aria-label={backLabel}
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--pf-text-2)] transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:bg-[var(--pf-bg-surface)]"
      >
        <Icon name="arrow-left" size={18} />
      </Link>
      <span className="min-w-0 flex-1 truncate text-[16px] font-semibold">
        {title}
      </span>
      {trailing}
    </header>
  );
}

/** The scrolling body of a pushed screen, between `TopBar` and any footer. */
export function ScreenBody({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "pf-scroll flex min-h-0 flex-1 flex-col gap-3.5 px-[var(--pf-gutter)] pt-1.5 pb-[var(--pf-s5)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StickyActionBar({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={classNames(
        "pf-sticky-action sticky bottom-0 mt-auto flex shrink-0 flex-col gap-2.5 bg-[var(--pf-bg-canvas)] px-[var(--pf-gutter)] pt-3 pb-[calc(var(--pf-bottom-buffer)+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </div>
  );
}
