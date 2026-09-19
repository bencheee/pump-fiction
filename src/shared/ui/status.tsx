import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

import { classNames } from "./class-names";
import { Icon, type IconName } from "./icon";

type SaveState = "clean" | "unsaved" | "saving" | "failure";

const saveStates: Record<
  Exclude<SaveState, "clean">,
  { text: string; icon: IconName; className: string }
> = {
  unsaved: {
    text: "Unsaved changes",
    icon: "circle-alert",
    className: "text-[var(--pf-text-2)]",
  },
  saving: {
    text: "Saving…",
    icon: "loader-circle",
    className: "text-[var(--pf-text-2)]",
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
  const current = state === "clean" ? undefined : saveStates[state];
  const failed = state === "failure" && !validationMessage;
  const text = validationMessage ?? current?.text;

  return (
    <div
      role="status"
      aria-live="polite"
      className={classNames(
        "flex items-center gap-2 text-[13px] font-medium",
        text !== undefined && "min-h-11",
        validationMessage ? "text-[var(--pf-danger)]" : current?.className,
      )}
    >
      {text !== undefined ? (
        <>
          <Icon
            name={
              validationMessage
                ? "triangle-alert"
                : (current?.icon ?? "circle-alert")
            }
            size={14}
          />
          <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
            {text}
          </span>
        </>
      ) : null}
      {failed && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-full border border-[var(--pf-danger)] px-3.5 font-semibold"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

type BadgeTone = "neutral" | "accent" | "ok" | "warn" | "danger";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "border border-[var(--pf-border-strong)] text-[var(--pf-text-3)]",
  accent: "bg-[var(--pf-accent-dim)] text-[var(--pf-accent)]",
  ok: "bg-[var(--pf-accent-dim)] text-[var(--pf-ok)]",
  warn: "border border-[var(--pf-warn)] text-[var(--pf-warn)]",
  danger: "border border-[var(--pf-danger)] text-[var(--pf-danger)]",
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-[length:var(--pf-type-label-size)] leading-[1.2] font-semibold",
        badgeTones[tone],
      )}
    >
      {children}
    </span>
  );
}

/** The uppercase section label that separates blocks on every screen. */
export function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={classNames(
        "text-[length:var(--pf-type-label-size)] font-semibold tracking-[0.1em] text-[var(--pf-text-4)] uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function EmptyState({
  title,
  body,
  icon,
  action,
}: {
  title: string;
  body: string;
  icon?: IconName;
  action?: ReactNode;
}) {
  return (
    <section className="flex flex-col items-center gap-2.5 rounded-[var(--pf-r4)] bg-[var(--pf-bg-surface)] px-5 py-6 text-center motion-safe:animate-[pf-rise_var(--pf-mo-slow)_var(--pf-ease)]">
      {icon ? (
        <Icon
          name={icon}
          size={30}
          className="text-[var(--pf-border-strong)]"
        />
      ) : null}
      <h2 className="text-[15.5px] leading-[1.25] font-semibold">{title}</h2>
      <p className="max-w-[32ch] text-[13.5px] leading-[1.5] text-[var(--pf-text-3)]">
        {body}
      </p>
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
          className="h-[78px] rounded-[var(--pf-r3)] bg-[var(--pf-bg-surface)] motion-safe:animate-[pf-pulse_var(--pf-mo-pulse)_infinite]"
          style={{ width, animationDelay: `${index * 120}ms` }}
        />
      ))}
    </div>
  );
}

/** Rows stagger in by 34ms each, and stop stepping after the tenth. */
export function rowStagger(index: number): CSSProperties {
  return { animationDelay: `${Math.min(index, 9) * 34}ms` };
}

export function ListRow({
  href,
  title,
  detail,
  leading,
  trailing,
  index,
}: {
  href: string;
  title: string;
  detail?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  index?: number;
}) {
  return (
    <Link
      href={href}
      style={index === undefined ? undefined : rowStagger(index)}
      className="flex min-h-[var(--pf-size-list-row)] items-center gap-2.5 rounded-[var(--pf-r3)] border border-[var(--pf-bg-surface)] bg-[var(--pf-bg-surface)] py-3.5 pr-3 pl-[18px] transition-[border-color,transform] duration-[var(--pf-mo-fast)] ease-[var(--pf-ease)] hover:border-[var(--pf-border-strong)] active:scale-[0.99] motion-safe:animate-[pf-row-in_260ms_var(--pf-ease)_both]"
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block text-[length:var(--pf-type-card-title-size)] leading-[1.25] font-semibold [text-wrap:pretty]">
          {title}
        </span>
        {detail ? (
          <span className="pf-numeric mt-1.5 block text-[14px] text-[var(--pf-text-3)]">
            {detail}
          </span>
        ) : null}
      </span>
      {trailing}
      <Icon
        name="chevron-right"
        size={16}
        className="shrink-0 text-[var(--pf-glyph-dim)]"
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
    <section className="min-w-0 rounded-[var(--pf-r3)] bg-[var(--pf-bg-surface)] px-3.5 py-4">
      <h2 className="text-[11px] font-semibold tracking-[0.06em] text-[var(--pf-text-4)] uppercase">
        {label}
      </h2>
      <p className="pf-numeric mt-2 text-[length:var(--pf-type-metric-size)] leading-none font-bold [overflow-wrap:anywhere]">
        {value}
      </p>
      {detail ? (
        <p className="mt-1.5 text-[12.5px] leading-[1.4] text-[var(--pf-text-3)]">
          {detail}
        </p>
      ) : null}
    </section>
  );
}
