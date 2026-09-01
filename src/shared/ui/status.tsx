import type { ReactNode } from "react";
import Link from "next/link";

import { classNames } from "./class-names";
import { Icon, type IconName } from "./icon";

type SaveState = "idle" | "saving" | "saved" | "failure";

const saveStates: Record<
  SaveState,
  { text: string; icon: IconName; className: string }
> = {
  idle: {
    text: "Not saved yet",
    icon: "circle-alert",
    className: "text-[var(--pf-text-2)]",
  },
  saving: {
    text: "Saving…",
    icon: "loader-circle",
    className: "text-[var(--pf-text-2)]",
  },
  saved: {
    text: "Saved",
    icon: "circle-check",
    className: "text-[var(--pf-ok)]",
  },
  failure: {
    text: "Couldn't save your latest changes",
    icon: "circle-x",
    className: "text-[var(--pf-danger)]",
  },
};

export function SaveStatus({
  state,
  validationMessage,
  onRetry,
}: {
  state: SaveState;
  validationMessage?: string;
  onRetry?: () => void;
}) {
  const current = saveStates[state];
  const failed = state === "failure" && !validationMessage;

  return (
    <div
      role="status"
      aria-live="polite"
      className={classNames(
        "flex min-h-11 items-center gap-2 text-[13px] font-medium",
        validationMessage ? "text-[var(--pf-danger)]" : current.className,
      )}
    >
      <Icon
        name={validationMessage ? "triangle-alert" : current.icon}
        size={14}
      />
      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
        {validationMessage ?? current.text}
      </span>
      {failed && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-[var(--pf-r-pill)] border border-[var(--pf-danger)] px-3 font-semibold"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

type BadgeTone = "neutral" | "accent" | "ok" | "warn" | "danger";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "border-[var(--pf-border-strong)] text-[var(--pf-text-2)]",
  accent: "border-[var(--pf-accent-strong)] text-[var(--pf-accent-strong)]",
  ok: "border-[var(--pf-ok)] text-[var(--pf-ok)]",
  warn: "border-[var(--pf-warn)] text-[var(--pf-warn)]",
  danger: "border-[var(--pf-danger)] text-[var(--pf-danger)]",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={classNames(
        "inline-flex min-h-5 items-center rounded-[var(--pf-r1)] border px-1.5 text-[10px] leading-[1.4] font-semibold tracking-[0.08em] uppercase",
        badgeTones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-6 text-center">
      <h2 className="text-[16.5px] leading-[1.25] font-semibold">{title}</h2>
      <p className="max-w-[30ch] text-[var(--pf-text-2)]">{body}</p>
      {action}
    </section>
  );
}

export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="space-y-3"
    >
      {["70%", "100%", "84%"].map((width, index) => (
        <div
          key={width}
          aria-hidden="true"
          className="h-12 rounded-[var(--pf-r2)] bg-[var(--pf-bg-surface-3)] motion-safe:animate-[pf-pulse_1.4s_infinite]"
          style={{ width, animationDelay: `${index * 120}ms` }}
        />
      ))}
    </div>
  );
}

export function ListRow({
  href,
  title,
  detail,
  leading,
}: {
  href: string;
  title: string;
  detail?: ReactNode;
  leading?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center gap-3 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] bg-[var(--pf-bg-surface)] px-3 py-2.5"
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block text-[16.5px] leading-[1.25] font-semibold [overflow-wrap:anywhere]">
          {title}
        </span>
        {detail ? (
          <span className="mt-1 block text-[12.5px] text-[var(--pf-text-2)]">
            {detail}
          </span>
        ) : null}
      </span>
      <Icon
        name="chevron-right"
        size={16}
        className="text-[var(--pf-text-2)]"
      />
    </Link>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-3">
      <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
        {label}
      </h2>
      <p className="pf-numeric mt-2 text-[30px] leading-none font-semibold [overflow-wrap:anywhere]">
        {value}
      </p>
      {detail ? (
        <p className="mt-2 text-[12.5px] text-[var(--pf-text-2)]">{detail}</p>
      ) : null}
    </section>
  );
}
